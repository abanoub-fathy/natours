const { promisify } = require('util');
const AppError = require('../errors/AppError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// check if the user is logged in should be used for views only
isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) if there is a token in the cookie
  if (req.cookies.token) {
    // verify and get the decoded token
    const decoded = await promisify(jwt.verify)(
      req.cookies.token,
      process.env.JWT_SECRET,
    );

    // get the user from the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return next();
    }

    // check if the password is changed after the token is issued
    if (user.isPasswordChangedAfter(decoded.iat)) {
      return next();
    }

    // set the user in the req
    res.locals.user = user;
  }

  next();
});

module.exports = isLoggedIn;
