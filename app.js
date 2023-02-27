const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const articleRouter = require('./routes/articleRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// PROVIDES SECURITY-RELATED HTTP HEADERS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// CREATED LOG IN DEVELOPMENT MODE
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// LIMITS REQUESTS
const rateLimitOptions = {
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
};
app.use('/api', rateLimit(rateLimitOptions));

// READING DATA FROM BODY TO REQ.BODY
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NOSQL INJENCTIONS LIKE { "$gt": "" }
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENTS PARAMETER PLLUTION
app.use(hpp({ whitelist: ['h'] }));

// COMPRESSES TEXT THAT IS SENT TO CLIENT
app.use(compression());

// ROUTES
app.use('/', viewRouter);
app.use('/api/articles', articleRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);

app.all('*', (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
