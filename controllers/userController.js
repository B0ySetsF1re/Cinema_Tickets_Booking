// Connecting required modules
const mongojs = require('mongojs');
var db = mongojs('cinema_booking', ['users']);

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { check, body, validationResult } = require('express-validator'); // const validationResult = require('express-validator');

const roleModel = require('../models/roleModel');
const rbacController = require('../controllers/rbacController');
let RBAC = {};

// Getting current time (for debugging)
const _Time = require('../debugging/timeDisplay');

// Before applying role models and instentiating RBAC, we need to check if the roles collection exists
db.getCollectionNames(function(err, colNames) {
  if(err) {
    return console.log(err);
  }

  let promise = new Promise((resolve, reject) => {
    colNames.forEach(function(name) {
      if(name == 'roles') {
        resolve('Roles collection has been found in the database...');
      }
    });

    reject(new Error('Roles collection hasn\'t been found - defining RBAC with the role model...'));
  });

  promise.then (
    result => {
      console.log(_Time.getTime() + result);

      db.roles.findOne({}, { _id: 0 }, function(err, doc) {
        if(err) {
          return console.log(err);
        }

        RBAC = new rbacController(doc);
      });
    },
    error => {
      console.log(_Time.getTime() + error);

      db.roles.insert(roleModel);
      RBAC = new rbacController(roleModel);

      setTimeout(() => { console.log(_Time.getTime() + 'Done!') }, 1000);
    }
  );
});

function getUsrFormData(req) {
  return {
    errors: {},
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    password_confirm: req.body.password_confirm,
    role_option: req.body.rolesRadioOptions
  };
}

function sendExpressErrors(res, errObj, page) {
  res.render(page, {
    errors: errObj.errors.array(),
    title: page,
    first_name: errObj.first_name,
    last_name: errObj.last_name,
    email: errObj.email,
    username: errObj.username,
    password: errObj.password,
    password_confirm: errObj.password_confirm,
    role_option: errObj.role_option
  });
}

// Check if user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You are not authorized to access this page!');
  res.redirect('/users/login');
}

// Another user's role check, more logical
exports.isManagerOrAdmin = (req, res, next) => {
  if(RBAC.roleExists(req.user.role)) {
    if(req.user.role == 'admin' || req.user.role == 'manager') {
      return next();
    }
  }
  req.flash('error', 'You need to be at least manager to access this page!');
  res.redirect('/');
}

// Prevent user to access login page when they are actually logged in
exports.checkIfLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    // req.flash('error', 'You are already logged in!');
    res.location('/users/error/already-logged-in');
    res.redirect('/users/error/already-logged-in');
  } else {
    next();
  }
}

exports.expressValRules = [
  check('first_name').not().isEmpty().withMessage('First Name field is required!'),
  check('last_name').not().isEmpty().withMessage('Last Name field is required!'),
  check('email').isEmail().withMessage('Please enter a vailid email address!'),
  check('password').not().isEmpty().withMessage('Password field is required!'),
  body('password_confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match!');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  })
];

exports.register = (req, res) => { // Perhaps will divide this function a bit
  // Checking for errors
  const errors = validationResult(req);
  let usrSrcData = getUsrFormData(req); //const { first_name, last_name, email, username, password, password_confirm } = req.body;
                                        // let usrSrcData = getUsrFormData(req) => getUsrFormData(req, errors.array());
  usrSrcData.errors = errors;

  // Finds the validation errors in this request and wraps them in an object with handy functions
  if(!errors.isEmpty()) {
    //return res.status(422).json({ errors: errors.array() });
    console.log(_Time.getTime() + 'There are errors!');
    console.log(errors.array());

    if(req.originalUrl != '/users/dashboard/add') { // checking under what route the coude was executed
      sendExpressErrors(res, usrSrcData, 'register');  // rendering "register" ejs view and sending local variables for it
    } else {
      sendExpressErrors(res, usrSrcData, 'dashboard'); // rendering "dashboard" ejs view and sending local variables for it
    }
  } else {
    console.log(_Time.getTime() + 'Success!');

    const newUser = new User(usrSrcData.first_name, usrSrcData.last_name, usrSrcData.email, usrSrcData.username, usrSrcData.password, usrSrcData.role_option);

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;

        db.users.insert(newUser, function(err, doc) {
          if(err) {
            console.log(_Time.getTime() + 'An error occurred when tried to add a new user to the database!');
            res.send(err);
          } else {
            console.log(_Time.getTime() + 'User has been added with role: ' + newUser.role);

            if(req.originalUrl != '/users/dashboard/add') {
              // Success message
              req.flash('success', 'You are now registered and can login!');

              // Redirect after Registration
              res.location('/users/login'); // Setting the response header.
              res.redirect('/users/login'); // Setting the status to 302, setting the header (using set.location)
                                 // and sending a nice response body saying that the user is being redirected,
                                 // it also renders a link if their browser doesn't automatically redirect them for some reason.
            } else {
              // Success message
              req.flash('success', 'User has been added successfully!');

              // Redirect after Registration
              res.location('/users/dashboard');
              res.redirect('/users/dashboard'); // res.redirect('/users/dashboard/add');
            }
            /*res.json({
              data: newUser,
              accessToken
            });*/
          }
        });
      });
    });
  }
}

// Serializing and deserializing a user to access the information, when that user is logged in
passport.serializeUser(function(user, done) {
  done(null, user._id);
});


passport.deserializeUser(function(id, done) {
  db.users.findOne({_id: mongojs.ObjectId(id)}, function(err, user) { // Since mongodb uses ObjectIds,
    done(err, user);                                                   // we are passing them to the object's _id parameter respectively
  });
});

// In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
// Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.


// Strategy configuration (in our case it will be local)
passport.use(new localStrategy(
  function(username, password, done) {
  db.users.findOne({ username: username }, function(err, user) {
    if(err) {
      return done(err);
    }
    if(!user) {
      return done(null, false, { message: 'Incorrect username' });
    }

    bcrypt.compare(password, user.password, function(err, isMatch) {
      if(err) {
        return done(err);
      }
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    });
  });
}));

exports.passport = passport;
