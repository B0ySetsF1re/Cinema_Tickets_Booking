// Connecting required modules
const express = require('express');
const router = express.Router();

// Connecting userController (for signup/login and access controll logics)
const userController = require('../controllers/userController');

// Module for getting current time (debugging)
const getTime = require('../lib/debuggingTools/getCurrentTime/index');

// Dashboard page - GET
router.get('/dashboard', function(req, res) {
  res.render('dashboard/dashboard', {
    title: 'Dashboard'
  });
});

// Dashboard users management page - GET
router.get('/dashboard/users-management', /*[userController.ensureAuthenticated, userController.isManagerOrAdmin],*/ function(req, res) { // Soon dashboard will have different routes
  res.render('dashboard/dashboard_users', { // userController.usersMgmntInit(req, res);
    title: 'Dashboard - Users'
  });
});

router.get('/dashboard/users-management/manage/:page', userController.usersMgmntInitPerPage);

// Dashboard movies page - GET
router.get('/dashboard/movies', function(req, res) {
  res.render('dashboard/dashboard_movies', {
    title: 'Dashboard - Movies'
  });
});

// Dashboard orders and rents page - GET
router.get('/dashboard/orders-and-rents', function(req, res) {
  res.render('dashboard/dashboard_orders_and_rents', {
    title: 'Dashboard - Orders & Rents'
  });
});

// Dashboard manage tab initialization - POST
router.post('/dashboard/users-management/manage-init', function(req, res) {
  //res.location('/users/dashboard/users-management');
  //userController.usersMgmntInit(req, res);
  //res.redirect('/users/dashboard/users-management?tab=' + encodeURIComponent('manage'));
  res.redirect('/users/dashboard/users-management/manage/1');
});

// Dashboard users page (Create operation) - POST
router.post('/dashboard/users-management/create', userController.expressValRules, userController.register);

// Dashboard users page (Manage operations) - POST
router.post('/dashboard/users-management/manage/:page', function(req, res) {
  if(req.body.action == 'Delete') {
    userController.removeUsers(req.body.users);
    res.redirect('/users/dashboard/users-management/manage/' + req.params.page);
  } else if(req.body.action == 'Change role') {
    userController.updateRole(req, res);
    res.redirect('/users/dashboard/users-management/manage/' + req.params.page);
  } else {
    console.log(req.body);
    userController.exportAll(req, res);
    //res.redirect('/users/dashboard/users-management/manage/' + req.params.page);
  }
});

router.post('/dashboard/users-management/API/checkIfUserExists', userController.checkIfUsersExist, function(req, res) {
  res.status(200).send(JSON.stringify({
    error: false,
    message: 'The transaction was successfull!'
  }));
});

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

// Check if user already logged out - GET
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
    console.log(getTime() + 'Auth Successfull');
    res.redirect('/');
  });

// Logout page - GET
router.get('/logout', userController.checkIfLoggedOut, function(req, res) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
