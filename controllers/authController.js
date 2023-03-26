const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchWrapper = require('../utils/catchWrapper');
const ErrorHandler = require('../utils/errorHandler');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // REMOVES PASSWORD FROM OUTPUT
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchWrapper(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    logo: req.body.logo,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, req, res);
});

exports.login = catchWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ErrorHandler('Incorrect email or password', 401));
  }

  // IF OK SEND TOKEN TO CLIENT
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'dummytext', {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = (arg = true) =>
  catchWrapper(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer') && arg) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token && arg) {
      return next(new ErrorHandler('You are not logged in! Please log in to get access.', 401));
    }

    // VERIFYING TOKEN

    const decoded = await Promise.resolve(jwt.verify(token, process.env.JWT_SECRET));

    // CHECKS IF USER STILL EXISTS
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      if (arg) return next(new ErrorHandler('The user belonging to this token does no longer exist.', 401));
      return next();
    }

    // CHECKS IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if (currentUser.changePasswordAfter(decoded.iat)) {
      if (arg) return next(new ErrorHandler('User recently changed password! Please log in again.', 401));
      return next();
    }

    // GRANTS ACCESS TO PROTECTED ROUTE
    if (arg) req.user = currentUser;
    if (!arg) res.locals.user = currentUser;
    return next();
  });

exports.restriction =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler('You do not have permission to perform this action', 403));
    }
    next();
  };

exports.forgotPassword = catchWrapper(async (req, res, next) => {
  // GET USER BASED ON POSTED MAIL
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler('There is no user with email address', 404));
  }

  // GENERATES A RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // SEND NEW TOKEN TO USER
  try {
    const resetURL = `${req.protocol}://${req.get('Host')}/api/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler('There was an error sending the email. Try again later!'), 500);
  }
});

exports.resetPassword = catchWrapper(async (req, res, next) => {
  // GET USER BASED ON THE TOKEN
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // IF TOKEN HAS NOT EXPIRED, AND THERE'S A USER, SET THE NEW PASSWORD
  if (!user) {
    return next(new ErrorHandler('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // LOG USER IN
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchWrapper(async (req, res, next) => {
  // GET USER FROM COLLECTION
  const user = await User.findById(req.user.id).select('+password');

  // CHECK IF POSTED PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new ErrorHandler('Your current password is wrong.', 401));
  }

  // UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // LOG USER IN
  createSendToken(user, 200, req, res);
});
