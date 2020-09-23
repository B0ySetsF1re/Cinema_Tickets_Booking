// Connecting required modules
const mongojs = require('mongojs');
var db = mongojs(process.env.DB_NAME, ['users']);

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { check, body, validationResult } = require('express-validator'); // const validationResult = require('express-validator');

const roleModel = require('../models/roleModel');
const rbacController = require('../controllers/rbacController');
let RBAC = {};

// Module for getting current time (debugging)
const getTime = require('../lib/debuggingTools/getCurrentTime/index');

// Custom async forEach loop module
const asyncForEach = require('../lib/asyncForEach/index');

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
      console.log(getTime() + result);

      db.roles.findOne({}, { _id: 0 }, function(err, doc) {
        if(err) {
          return console.log(err);
        }

        RBAC = new rbacController(doc);
      });
    },
    error => {
      console.log(getTime() + error);

      db.roles.insert(roleModel);
      RBAC = new rbacController(roleModel);

      setTimeout(() => { console.log(getTime() + 'Done!') }, 1000);
    }
  );
});

function createNewUser(src) {
  return new User({
    first_name: src.first_name,
    last_name: src.last_name,
    email: src.email,
    username: src.username,
    password: src.password,
    role: src.role_option
  });
}

function getUsrFormData(req) {
  return {
    errors: {},
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    password_confirm: req.body.password_confirm,
    role_option: (req.body.rolesRadioOptions != undefined) ? req.body.rolesRadioOptions : 'basic' // ternarry operation -> needs to be implemented for the regular registration form
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

// Prevent user to access logout page/route when they actually logged out
exports.checkIfLoggedOut = (req, res, next) => {
  if(!req.isAuthenticated()) {
    res.location('/users/error/already-logged-out');
    res.redirect('/users/error/already-logged-out');
  } else {
    next();
  }
}

// Function, which returns promise to then validate email duplications in the database through the express-validator
exports.emailDupCheck = function(value) {
  return new Promise((resolve, reject) => {
    db.users.findOne({ email: value }, function(err, doc) {
      if(err) {
        return console.log(err);
      }
      if(doc != null) {
        reject(new Error('Email address is already in use!'));
      }
      resolve('No records found...');
    });
  });
}

// The same function as above but here we are checking usernames duplications respectively
exports.usernameDupCheck = function(value) {
  return new Promise((resolve, reject) => {
    db.users.findOne({ username: value }, function(err, doc) {
      if(err) {
        return console.log(err);
      }
      if(doc != null) {
        reject(new Error('Username is already in use!'));
      }
      resolve('No records found...');
    });
  });
}

// Registration form express-validator errors configuration
exports.expressValRules = [
  check('first_name').not().isEmpty().withMessage('First Name field is required!'),
  check('last_name').not().isEmpty().withMessage('Last Name field is required!'),
  check('email').isEmail().withMessage('Please enter a vailid email address!'),
  body('email').custom(value => {
    let promise = exports.emailDupCheck(value);

    return promise.catch( // We don't need to process fulfilled state, so we are using "catch" instead of "then" operator
      error => {
        return Promise.reject(error);
      }
    );
  }),
  body('username').custom(value => {
    let promise = exports.usernameDupCheck(value);

    return promise.catch(
      error => {
        return Promise.reject(error); // Check comment for the previous promise catch operator
      }
    );
  }),
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
    console.log(getTime() + 'There are errors!');
    console.log(errors.array());

    if(req.originalUrl != '/users/dashboard/users-management/create') { // checking under what route the coude was executed
      sendExpressErrors(res, usrSrcData, 'register');  // rendering "register" ejs view and sending local variables for it
    } else {
      sendExpressErrors(res, usrSrcData, 'dashboard/dashboard_users'); // rendering "dashboard_users" ejs view and sending local variables for it
    }
  } else {
    console.log(getTime() + 'Success!');

    const newUser = createNewUser(usrSrcData);

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;

        db.users.insert(newUser, function(err, doc) {
          if(err) {
            console.log(getTime() + 'An error occurred when tried to add a new user to the database!');
            res.send(err);
          } else {
            console.log(getTime() + 'User has been added with role: ' + newUser.role);

            if(req.originalUrl != '/users/dashboard/users-management/create') {
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
              res.location('/users/dashboard/users-management');
              res.redirect('/users/dashboard/users-management'); // res.redirect('/users/dashboard/add');
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

exports.getAllUsers = function(callback) {
  db.users.find({}, { _id: 0, password: 0 }, callback);
}

// Render all users at one page
exports.usersMgmntInit = function(req, res) {
  exports.getAllUsers(function (err, docs) {
    if(err) {
      return console.log(err);
    }

    res.render('dashboard/dashboard_users', {
      title: 'Dashboard - Users',
      manageTab: true,
      users: docs,
      lastSelAction: (req.body.action) ? req.body.action : 'Initial GET request',
      lastSelUsers: (typeof req.body.users == 'string') ? req.body.users.split() : req.body.users
    });
  });
};

// Initializing pages for the specific collection
async function pagesInit(page, resPerPage, collection) {
  const foundUsers = await new Promise((resolve, reject) => {
    collection.find({}).limit(resPerPage).skip((resPerPage * page) - resPerPage, function(err, users) {
      if(err) {
        reject(new Error(err));
      }
      resolve(users);
    });
  });

  const numOfUsers = await new Promise((resolve, reject) => {
    collection.count({}, function(err, result) {
      if(err) {
        reject(new Error(err));
      }
      resolve(result);
    });
  });

  return new Promise((resolve) => {
    resolve({
      page: page,
      resPerPage: resPerPage,
      foundUsers: foundUsers,
      numOfUsers: numOfUsers
    });
  });
}

// Rendering users separated with pages
exports.usersMgmntInitPerPage = async function(req, res, next) {
  const paginationLinkQuery = Object.keys(req.query).length != 0 ? parseInt(req.query.resPerPage) : false;
  const pageConfig = await pagesInit(req.params.page || 1, paginationLinkQuery ? paginationLinkQuery : 20, db.users);

  res.render('dashboard/dashboard_users', {
    title: 'Dashboard - Users',
    manageTab: true,
    users: pageConfig.foundUsers,
    currentPage: pageConfig.page,
    pages: Math.ceil(pageConfig.numOfUsers / pageConfig.resPerPage),
    paginationLink: req.originalUrl.substring(0, req.originalUrl.lastIndexOf('/') + 1), // Needed for paginationView
    paginationLinkQuery: paginationLinkQuery // This property is also used by paginationView
  });

  next();
}

// Starting execution of the users removal
exports.startUsersRemoval = function(id, callback) {
  db.users.remove({ _id: mongojs.ObjectId(id) }, callback);
}

// Initializing users removal
exports.removeUsers = function(users) {
  if(typeof users == 'string') {
    users = users.split();
  }

  users.forEach(function(user) {
    exports.startUsersRemoval(user, function(err, result) {
      if(err) {
        return console.log(err);
      }

      console.log(getTime() + 'User(s) removed:');
      console.log(result);
    });
  });
}

async function findOneUserById(id) {
  return new Promise((resolve, reject) => {
    db.users.findOne({ _id: mongojs.ObjectId(id) }, (err, user) => {
      if(err) {
        reject(new Error('An error occurred during the transaction!'));
      }

      if(user == null) {
        reject(new Error('The user couldn\'t be found!'));
      }

      resolve(user);
    });
  }).then(
    success => {
      return success;
    },
    error => {
      return null;
    }
  );
}

exports.checkIfUsersExist = async function(req, res, next) {
  await new Promise(async (resolve, reject) => {
    await asyncForEach(req.body.ids, async (id) => {
      if(await findOneUserById(id) == null) {
        reject(new Error('Looks like some of the users were already removed, please refresh the page and try again!'));
      }
    });

    resolve();

  }).then(
    success => {
      next();
    },
    error => {
      res.status(200).send(JSON.stringify({
        error: true,
        message: error.message
      }));
    }
  );
}

exports.updateRole = async function(req, res) {
  if(typeof req.body.id == 'string') {
    req.body.id = req.body.id.split();
    req.body.roles = req.body.roles.split();
  }

  req.body.id.forEach((id, index) => {
    db.users.findAndModify({
      query: { _id: mongojs.ObjectId(id) },
      update: { $set: { role: req.body.roles[index]} },
      new: true
    }, (err, user, lastErrObject) => {
      if(err) {
        return console.log({
          error: err,
          lastErrorObject: lastErrObject
        });
      }

      console.log(getTime() + 'Successfull role update for the record with ID of: ' + user._id + ', new role: ' + user.role);
    });
  });
}
