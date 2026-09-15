'use strict';

function errorHandler(err, req, res, next) {
  const message = err.message || 'An unexpected blockchain error occurred';
  let status = 500;
  let errorCode = 'BLOCKCHAIN_ERROR';

  if (message.includes('already exists')) {
    status = 409;
    errorCode = 'CONFLICT';
  } else if (message.includes('does not exist') || message.includes('not found')) {
    status = 404;
    errorCode = 'NOT_FOUND';
  } else if (
    message.includes('Only a Registration Officer') ||
    message.includes('Only a Land Owner') ||
    message.includes('Only the current owner') ||
    message.includes('Access denied')
  ) {
    status = 403;
    errorCode = 'ACCESS_DENIED';
  } else if (
    message.includes('required') ||
    message.includes('Cannot transfer') ||
    message.includes('already pending') ||
    message.includes('No pending')
  ) {
    status = 400;
    errorCode = 'VALIDATION_ERROR';
  }

  res.status(status).json({
    success: false,
    message,
    errorCode
  });
}

module.exports = errorHandler;
