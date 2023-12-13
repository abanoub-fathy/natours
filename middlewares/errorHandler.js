const AppError = require('../errors/AppError');

const getEnvErrorRes = (err) => {
  const { status, message } = err;

  if (process.env.NODE_ENV === 'production') {
    return {
      status,
      message,
    };
  } else {
    return {
      status,
      message,
      moreInfo: {
        err,
        stack: err.stack,
      },
    };
  }
};

const writeErrorResponse = (err, req, res) => {
  if (!err.isOperational) {
    // log the error
    console.error('💥[Unoperational][ERROR]:', err);

    // set the error message to generice error
    err.message = 'something went wrong';
  }

  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json(getEnvErrorRes(err));
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
    });
  }
};

const createCastError = (err) => {
  let message = `invalid ${err.path} = ${err.value}`;
  return new AppError(400, message);
};

const createDuplicateError = (err) => {
  message = `the value you provided ${Object.values(err.keyValue)[0]} exists`;
  return new AppError(400, message);
};

const createValidationError = (err) => {
  let message = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  return new AppError(400, message);
};

const createAuthError = (err) => new AppError(401, 'login is required');

const errorHandlerFunc = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // create new object from err object
  let error = { ...err, message: err.message, name: err.name };

  if (error.name === 'CastError') {
    error = createCastError(error);
  }

  if (error.code === 11000) {
    error = createDuplicateError(error);
  }

  if (error.name === 'ValidationError') {
    error = createValidationError(error);
  }

  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError'
  ) {
    error = createAuthError();
  }

  return writeErrorResponse(error, req, res);
};

module.exports = errorHandlerFunc;
