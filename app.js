const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');

// Routers
const categoryRouter = require('./routes/categoryRoutes');
const itemRouter = require('./routes/itemRoutes');
const requestRouter = require('./routes/requestRoutes');

const app = express();

// Serving static files
app.use(express.static(`${__dirname}/public`));
app.use('/images', express.static('images'));

app.use(cors()); // use this cors in middleware and done

// 1) GLOBAL MIDDLEWARE
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: {
    errors: ['Too many requests from this IP, please try again in an hour!']
  }
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '100kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/requests', requestRouter);

// Main Routes
app.use('/api/v1/users', userRouter);
app.post('/api/v1/api/auth/logout', (req, res) => {
  res.send('Done');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(history());

app.use(globalErrorHandler);

module.exports = app;
