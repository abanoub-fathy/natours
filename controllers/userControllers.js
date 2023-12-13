const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getMe = factory.getOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  const updatesObj = {};
  const { email, name } = req.body;

  const { filename: photo } = req.file || {};

  if (email) {
    updatesObj['email'] = email;
  }

  if (name) {
    updatesObj['name'] = name;
  }

  if (photo) {
    updatesObj['photo'] = photo;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updatesObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  res.sendStatus(204);
});
