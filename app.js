// Connecting dotenv module for production/dev config management
require('dotenv').config();

// Connecting required modules
const express = require('express');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Used for authentication method deffinition

const bodyParser = require('body-parser');
const flash = require('connect-flash');
const path = require('path');
const ejs = require('ejs');

const hostAddress = process.env.HOST;
const port = process.env.PORT;

// Connecting new .js files located under /routes directory
const routes = require('./routes/index');
const users = require('./routes/users');

const app = express();

// Module for getting current time (debugging)
const getTime = require('./lib/debuggingTools/getCurrentTime/index');

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting Static Folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));

app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));

app.use('/css', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css/'));

app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist/umd'));

// Another way/example of how to setup static folders
// app.use(express.static(path.join(__dirname, 'node_modules/jquery')));

// Express Session Middleware
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport Middleware (used to difine authentication method e. g. Twitter, Facebook etc. We are going to use local authentication)
app.use(passport.initialize());
app.use(passport.session());

// Connect-Flash Middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Global variable accesible from every route
app.get('*', function(req, res, next) {
  res.locals.user = req.user || false; // or null
  next();
});

app.post(function(req, res, next) {
  next();
});

// Defining new routes and connecting them to the new .js files
app.use('/', routes);
app.use('/users', users);

// Listening server on port 3000
app.listen(port, hostAddress);

console.log(getTime() + 'Server started on port ' + port);

module.exports = app;
