// Attaching environmental variables from the .env file
// Note! This should be changed on production!
// require('dotenv').config();

// Connecting required modules
const express = require('express');
const router = express.Router();

// Connecting userController (for signup/login and access controll logics)
const userController = require('../controllers/userController');

// Dashboard page - GET
router.get('/dashboard', /*[userController.ensureAuthenticated, userController.isManagerOrAdmin],*/ function(req, res) {
  res.render('dashboard', {
    title: 'Dashboard',
    showTitle: false
  });
});

// Dashboard page (Add operation) - GET
router.get('/dashboard/add', function(req, res) {
  res.redirect('/users/dashboard');
});

// Dashboard page (Add operation) - POST
router.post('/dashboard/add', userController.expressValRules, userController.register);

// Login page - GET
router.get('/login', userController.checkIfLoggedIn, function(req, res) {
  res.render('login', {
    title: 'Please sign in',
    showTitle: false
  });
});

// Login error page - GET
router.get('/error/already-logged-in', function(req, res) {
  if(req.user) {
    res.render('authError', {
      title: 'Error occured',
      showTitle: false,
      msg: 'You are already logged in!'
    });
  } else {
    res.status(404).send('404 Not found');
  }
});

router.get('/error/already-logged-out', function(req, res) {
  if(!req.user) {
    res.render('authError', {
      title: 'Error occured',
      showTitle: false,
      msg: 'You have already logged out!'
    });
  } else {
    res.status(404).send('404 Not found');
  }
});

// Register page - GET
router.get('/register', userController.checkIfLoggedIn, function(req, res) {
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
router.get('/logout', userController.checkIfLoggedOut, function(req, res) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
