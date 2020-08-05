// Attaching environmental variables from the .env file
// Note! This should be changed on production!
// require('dotenv').config();

// Connecting required modules
const express = require('express');
const router = express.Router();

// Connecting userController (for signup/login and access controll logics)
const userController = require('../controllers/userController');


router.get('/dashboard', function(req, res) {
  res.render('dashboard', {
    title: 'Dashboard'
  });
});

// Dashboard users management page - GET
router.get('/dashboard/users-management', /*[userController.ensureAuthenticated, userController.isManagerOrAdmin],*/ function(req, res) { // Soon dashboard will have different routes
  userController.getAllUsers(function(err, docs) {
    if(err) {
      return console.log(err);
    }

    res.render('dashboard_users', {
      title: 'Dashboard - Users',
      users: docs
    });
  });
});

// Dashboard page (Add operation) - GET
router.get('/dashboard/users-management/create', function(req, res) {
  res.redirect('/users/dashboard/users-management');
});

router.get('/dashboard/movies', function(req, res) {
  res.render('dashboard_movies', {
    title: 'Dashboard - Movies'
  });
});

router.get('/dashboard/orders-and-rents', function(req, res) {
  res.render('dashboard_orders_and_rents', {
    title: 'Dashboard - Orders & Rents'
  });
});

// Dashboard page (Add operation) - POST
router.post('/dashboard/users-management/create', userController.expressValRules, userController.register);

// Login page - GET
router.get('/login', userController.checkIfLoggedIn, function(req, res) {
  res.render('login', {
    title: 'Please sign in'
  });
});

// Login error page - GET
router.get('/error/already-logged-in', function(req, res) {
  if(req.user) {
    res.render('authError', {
      title: 'Error occured',
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
      msg: 'You have already logged out!'
    });
  } else {
    res.status(404).send('404 Not found');
  }
});

// Register page - GET
router.get('/register', userController.checkIfLoggedIn, function(req, res) {
  res.render('register', {
    title: 'Register'
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
