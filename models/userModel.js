const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'name is required'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'email is required'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'email is not a valid email address',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'passwordConfirm is required'],
    validate: {
      validator: function (passConfirm) {
        return this.password === passConfirm;
      },
      message: 'the password and passwordConfirm values are not the same',
    },
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordTokenExpiresAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// model method
userSchema.statics.findByCredentials = async function (email, password) {
  // get the user by email address
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  // check valid credentials
  if (!user || !(await user.isPasswordCorrect(password))) {
    return null;
  }

  // return user
  return user;
};

// instance method delete the sensitive fields before convert toJSON
userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.passwordConfirm;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordTokenExpiresAt;

  return obj;
};

// instance method for creating user token
userSchema.methods.createToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// instance method for validating user password
userSchema.methods.isPasswordCorrect = function (plainTextPassword) {
  return bcrypt.compare(plainTextPassword, this.password);
};

// instance method for create passwordResetToken
userSchema.methods.createPasswordResetToken = async function () {
  // create the reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hash the token
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set data to the object
  this.resetPasswordToken = resetTokenHash;
  this.resetPasswordTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  // return the resetToken
  return resetToken;
};

// instanceMethod to check if the password is changed after specific date
userSchema.methods.isPasswordChangedAfter = function (tokenIssuedAt) {
  // if password is changed before
  if (this.passwordChangedAt) {
    const tokenIssudedTimeInMillis = tokenIssuedAt * 1000;
    const passwordChangeTimeInMiilis = this.passwordChangedAt.getTime();

    if (passwordChangeTimeInMiilis > tokenIssudedTimeInMillis) {
      return true;
    }
  }

  return false;
};

userSchema.pre('save', async function (next) {
  // if the password on this document is modified
  if (this.isModified('password')) {
    // hash the password
    this.password = await bcrypt.hash(this.password, 12);

    // delete confirmPassword
    this.passwordConfirm = undefined;

    // check if the document is not new
    if (!this.isNew) {
      // set the password changedAt value
      this.passwordChangedAt = Date.now() - 1000;
    }
  }

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
