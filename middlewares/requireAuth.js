const { promisify } = require('util');
const AppError = require('../errors/AppError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

requireAuth = catchAsync(async (req, res, next) => {
  // 1) extract the token from requehst headers
  let authorizationHeader = req.headers.authorization;
  let token = '';

  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    token = req.headers.authorization.replace('Bearer ', '');
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError(401, 'you should login to see this resource'));
  }

  // verify and get the decoded token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // get the user from the token
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError(401, 'you should login to see this resource'));
  }

  // check if the password is changed after the token is issued
  if (user.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError(401, 'your password was changed and you need to login'),
    );
  }

  // set the user in the req
  req.user = user;
  res.locals.user = user;

  next();
});

module.exports = requireAuth;
