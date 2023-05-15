const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { slug } = require('./../controllers/globalFactory');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الإسم مطلوب']
  },
  slug: String,
  email: {
    type: String,
    required: [true, 'البريد الإلكترونى مطلوب'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'بريد إلكترونى غير صحيح']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  country: {
    type: String,
    required: [true, 'الدولة مطلوبة']
  },
  phoneCode: {
    type: String,
    required: [true, 'كود الدولة مطلوب']
  },
  phone: {
    type: String,
    required: [true, 'الهاتف مطلوب']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'الرقم السرى مطلوب'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'تأكيد الرقم السرى مطلوب'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: ['الرقم السرى غير متطابق']
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: true
  }
});

schema.pre('save', function(next) {
  this.slug = slug(this.name);
  next();
});

schema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

schema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

schema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

schema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

schema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

schema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', schema);

module.exports = User;
