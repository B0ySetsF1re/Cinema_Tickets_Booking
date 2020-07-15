// Attaching environmental variables from the .env file
// Note! This should be changed on production!
// require('dotenv').config();

// Connecting required modules
const express = require('express');
const router = express.Router();

// Connecting userController (for signup/login and access controll logics)
const userController = require('../controllers/userController');

// Connecting roleController (to manage access controll by roles)
const roleModel = require('../models/roleModel'); // Probably will add an anonymous function or some to check if there are roles in the database
const rbacController = require('../controllers/rbacController');
const RBAC = new rbacController(roleModel);

// Getting current time (for debugging)
const _Time = require('../debugging/timeDisplay');

// Check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You are not authorized to access this page!');
  res.redirect('/users/login');
}

// Check user's role (custom middleware for RBAC) => can function should be used in specifical scenarios
/*function checkForManager(req, res, next) {
  if(req.user.role == 'admin' || req.user.role == 'manager') {
    if(RBAC.can(req.user.role, 'manage_orders')) {
      return next();
    }
  }
  req.flash('error', 'You need to be at least manager to access this page!');
  res.redirect('/');
}*/

// Another user's role check, more logical
function isManagerOrAdmin(req, res, next) {
  if(RBAC.roleExists(req.user.role)) {
    if(req.user.role == 'admin' || req.user.role == 'manager') {
      return next();
    }
  }
  req.flash('error', 'You need to be at least manager to access this page!');
  res.redirect('/');
}

// Prevent user to access login page when they are actually logged in
function checkIfLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    // req.flash('error', 'You are already logged in!');
    res.location('/users/error/already-logged-in');
    res.redirect('/users/error/already-logged-in');
  } else {
    next();
  }
}

// Dashboard page - GET
router.get('/dashboard', [ensureAuthenticated, isManagerOrAdmin], function(req, res) {
  res.render('dashboard', {
    title: 'Dashboard',
    showTitle: false
  });
});

// Other (TBD)

/*app.get('/manager', function(req, res) {
  //res.send('Manager page');
  res.render('manager', {
    title: 'Manager page',
    showTitle: true
  });
});

app.get('/seller', function(req, res) {
  //res.send('Seller page');
  res.render('seller', {
    title: 'Seller page',
    showTitle: true
  });
});

app.get('/user', function(req, res) {
  //res.send('User page');
  res.render('user', {
    title: 'User page',
    showTitle: true
  });
});*/

// Login page - GET
router.get('/login', checkIfLoggedIn, function(req, res) {
  res.render('login', {
    title: 'Please sign in',
    showTitle: false
  });
});

// Login error page - GET
router.get('/error/already-logged-in', function(req, res) {
  if(req.user) {
    res.render('alreadyAuthError', {
      title: 'Error occured',
      showTitle: false,
      msg: 'You are already logged in!'
    });
  } else {
    res.status(404).send('404 Not found');
  }
});

// Register page - GET
router.get('/register', checkIfLoggedIn, function(req, res) {
  res.render('register', {
    title: 'Register',
    showTitle: false
  });
});

// Register page - POST
router.post('/register', userController.expressValRules, userController.register);

// Login page - POST
router.post('/login',
  userController.passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users/login',
                                   failureFlash: 'Invalid Username or Password' }),
  function (req, res) {
    console.log(_Time.getTime() + 'Auth Successfull');
    res.redirect('/');
  });

// Logout page - GET
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
