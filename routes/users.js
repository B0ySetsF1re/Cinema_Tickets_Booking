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
router.get('/login', userController.checkIfLoggedIn, function(req, res) {
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
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
