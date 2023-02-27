const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserLogo = upload.single('logo');

exports.resizeUserLogo = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}.jpeg`;

  const { STORAGE_PROJECT_ID } = process.env;
  const { STORAGE_KEY_FILE_NAME } = process.env;
  const BUCKET_NAME = 'fp_storage';

  const storage = new Storage({
    STORAGE_PROJECT_ID,
    STORAGE_KEY_FILE_NAME,
  });

  const buffer = await sharp(req.file.buffer).resize(250, 250).toFormat('jpeg').jpeg({ quality: 50 }).toBuffer();

  await storage.bucket(BUCKET_NAME).file(`public/img/users/${req.file.filename}`).save(buffer);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // CREATE ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }

  // FILTER OUT UNWANTED FIELD NAMES THAT'S NOT ALLOWED TO BE UPDATED
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.logo = req.file.filename;

  // UPDATE USER DOCUMENT
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updateUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
