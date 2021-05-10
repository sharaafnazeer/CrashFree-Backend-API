var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const env = require('dotenv').config();
require('./helpers/passportConfig');
var mongoose = require('mongoose');
const mongoDBURL = 'mongodb://localhost:27017/CrashFree'

var app = express();

require('./globals');

mongoose.connect(mongoDBURL, {useNewUrlParser:true, useUnifiedTopology:true})
const conn = mongoose.connection;

conn.on('open', function(){
  console.log('DB Connection successfull');
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const passport = require('passport');
app.use(passport.initialize());

// const apiValidation = function (req, res, next) {

//   let apiKey = req.headers.apikey;
//   if (apiKey !== undefined) {
//       if (apiKey !== process.env.API_KEY) {
//           createResponseNew(res, 400, "Invalid API Key Provided");
//       } else {
//           next();
//       }
//   } else {
//       createResponseNew(res, 400, "No API Key Provided");
//   }
// };


const allowCors = function (req, res, next) {
  console.log("Came to cros");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
};

// app.use(apiValidation);
app.use(allowCors);

// Parse incoming requests data (https://github.com/expressjs/body-parser)
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const routerIndex = require('./routes/index');
app.use('/api', routerIndex);
app.get('*', (req, res) => res.status(200).send({
    message: 'Oh You want to access this URL? We are busy building it. Check back soon.',
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("ERROR ===>>> :" +err)
  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  return jsonResponse(res, 500, errorRes(err.message));
});

module.exports = app;
