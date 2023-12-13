const AppError = require('../errors/AppError');

const restrictRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, 'you are not allowed to see this resource'),
      );
    }

    next();
  };
};

module.exports = restrictRoles;
