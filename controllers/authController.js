const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../errors/AppError');
const { setResCookie } = require('../utils/setResCookie');
const Email = require('../utils/sendEmail');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  // send welcome email
  // await new Email(user).sendWelcomeEmail(url);

  const token = user.createToken();
  setResCookie(req, res, token);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !email.trim() || !password || !password.trim()) {
    return next(new AppError(400, 'please provide the email and the password'));
  }

  const user = await User.findByCredentials(email, password);
  if (!user) {
    return next(new AppError(400, 'incorrect email or password'));
  }

  const token = user.createToken();
  setResCookie(req, res, token);

  // return user info
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // get the user with the email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(404, 'no user with this email'));
  }

  // generate the resetToken
  const resetToken = await user.createPasswordResetToken();

  // save user changes
  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user).sendResetPassword(url);

    // send the response
    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json('could not send email');
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get the user from the token
  const tokenHash = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordTokenExpiresAt: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new AppError(400, 'invalid token or has been expired'));
  }

  // update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // delete the resetToken since it is used
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiresAt = undefined;

  // save the user changes
  await user.save();

  const token = user.createToken();
  setResCookie(req, res, token);

  // return response
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const user = req.user;

  // check valid current password
  const isCurrentPasswordCorrect = await user.isPasswordCorrect(
    currentPassword,
  );
  if (!isCurrentPasswordCorrect) {
    return next(new AppError(400, 'current password is incorrect'));
  }

  // update the password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  // save the user
  await user.save();

  const token = user.createToken();
  setResCookie(req, res, token);

  // return response
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
