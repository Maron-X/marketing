/* eslint-disable no-lonely-if */
// const AppError = require('./../utils/appError');

// const handleCastErrorDB = err => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = err => {
//   const errors = {};
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
//   const key = err.errmsg.split(' { ')[1].split(':')[0];
//   errors[key] = [value];

//   return new AppError(errors, 400);
// };
// const handleValidationErrorDB = err => {
//   const errors = Object.values(err.errors).map(el => el.message);

//   const message = `Invalid input data. ${errors.join('. ')}`;
//   return new AppError(message, 400);
// };

const sendErrorDev = (err, res) => {
  console.warn('print', err.message);
  const errorsArr = {};
  if (err.isOperational) {
    errorsArr.error = [err.message];
  } else if (err.name === 'JsonWebTokenError') {
    errorsArr.error = ['Invalid Token, please login again!'];
  } else if (err.name === 'TokenExpiredError') {
    errorsArr.error = ['Your token has expired, please login again!'];
  } else if (err.name === 'CastError') {
    errorsArr.error = ['Invalid Value'];
  } else if (err.message.includes('role')) {
    errorsArr.error = ['You do not have permission to perform this action '];
  } else if (
    err.message.includes('images') &&
    err.message.includes('The system cannot find the file specified')
  ) {
    errorsArr.error = ['The system cannot find the file specified for image'];
  } else if (
    err.message === "Cannot read properties of undefined (reading 'jwt')"
  ) {
    errorsArr.error = ['Unauthorized'];
    err.statusCode = '401';
  } else if (err.name === 'MulterError') {
    errorsArr.error = ['You can not add more than 3 images'];
  } else if (err.code === 'EMESSAGE') {
    errorsArr.error = [
      ' Mail cannot be sent The from address does not match a verified Sender Identity'
    ];
  } else {
    if (!err.isHandled) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(err.errors)) {
        errorsArr[key] = [value.message];
      }
    } else {
      const key = err.errmsg.split(' { ')[1].split(':')[0];

      errorsArr[key] = [
        `the ${key} << ${err.keyValue[key]} >> is already exist`
      ];
    }
  }

  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    errors: errorsArr
    // message: err.message
    // stack: err.stack
  });
};

// else if (
//   err.message.startWith('/images') &&
//   err.message.includes('.jpeg')
// ) {
//   errorsArr.error = ['Can’t find Image'];
// }

// const sendErrorProd = (err, res) => {
//   // Operational, trusted error: send message to client
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message
//     });

//     // Programming or other unknown error: don't leak error details
//   } else {
//     // 1) Log error
//     console.error('ERROR 💥', err);

//     // 2) Send generic message
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!'
//     });
//   }
// };

module.exports = (err, req, res, next) => {
  console.warn('main ', err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.code === 11000) {
    // err = handleDuplicateFieldsDB(err);
    err.isHandled = true;
  }
  sendErrorDev(err, res);

  // if (process.env.NODE_ENV === 'development') {
  //   if (err.code === 11000) {
  //     // err = handleDuplicateFieldsDB(err);
  //     err.isHandled = true;
  //   }
  //   sendErrorDev(err, res);
  // } else if (process.env.NODE_ENV === 'production') {
  //   let error = { ...err };

  //   if (error.name === 'CastError') error = handleCastErrorDB(error);
  //   if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  //   if (error.name === 'ValidationError')
  //     error = handleValidationErrorDB(error);

  //   sendErrorProd(error, res);
  // }
};
