// Connecting required modules
var mongojs = require('mongojs');
var db = mongojs('cinema_booking', ['users']);

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { check, body, validationResult } = require('express-validator'); // const validationResult = require('express-validator');

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

// Getting current time (for debugging)
var _Time = require('../debugging/timeDisplay');

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
  const { first_name, last_name, email, username, password, confirm_password } = req.body;

  // Finds the validation errors in this request and wraps them in an object with handy functions
  if(!errors.isEmpty()) {
    //return res.status(422).json({ errors: errors.array() });
    console.log(_Time.getTime() + 'There are errors!');
    console.log(errors.array());

    res.render('register', {
      errors: errors.array(),
      title: 'Register',
      first_name: first_name,
      last_name: last_name,
      email: email,
      username: username,
      password: password,
      password_confirm: password_confirm
    });
  } else {
    console.log(_Time.getTime() + 'Success!');

    const newUser = new User(first_name, last_name, email, username, password);

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;

        db.users.insert(newUser, function(err, doc) {
          if(err) {
            console.log(_Time.getTime() + 'An error occurred when tried to add a new user to the database!');
            res.send(err);
          } else {
            console.log(_Time.getTime() + 'User Added...');

            // Success message
            req.flash('success', 'You are now registered and can login!');

            // Redirect after Registration
            res.location('/users/login'); // Setting the response header.
            res.redirect('/users/login'); // Setting the status to 302, setting the header (using set.location)
                               // and sending a nice response body saying that the user is being redirected,
                               // it also renders a link if their browser doesn't automatically redirect them for some reason.
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
