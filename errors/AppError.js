/**
 * AppError is used to create instance of the AppError class
 * the AppError extends built in Error class
 * You will provide the statusCode and message
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('5') ? 'error' : 'fail';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
