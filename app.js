// Connecting required modules
var express = require('express');
var session = require('express-session');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // Used for authentication method deffinition

var bodyParser = require('body-parser');
var flash = require('connect-flash');
var path = require('path');
var ejs = require('ejs');

var port = 3000;
// var hostAddress = '192.168.1.106';

// Connecting new .js files located under /routes directory
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Getting current time (for debugging)
var _Time = require('./debugging/timeDisplay');

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

// Defining new routes and connecting them to the new .js files
app.use('/', routes);
app.use('/users', users);

// Listening server on port 3000
app.listen(port);

console.log(_Time.getTime() + 'Server started on port ' + port);

module.exports = app;
