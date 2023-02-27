const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vänligen ange ditt namn'],
  },
  email: {
    type: String,
    required: [true, 'Vänligen ange din e-postadress'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Vänligen ange en giltig e-postadress'],
  },
  logo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['admin', 'coadmin', 'author', 'advertiser', 'member'],
    default: 'member',
  },
  password: {
    type: String,
    required: [true, 'Vänligen ange ett lösenord'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Vänligen bekräfta ditt lösenord'],
    // DOES ONLY WORK WHEN SAVING
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Lösenorden stämmer inte överens',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// HASHES THE PASSWORD AND CHECKS IF THE PASSWORD HAS BEEN MODIFIED
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 14);
  // RESETS PASSWORDCONFIRM AFTER ENCRYPTION
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
