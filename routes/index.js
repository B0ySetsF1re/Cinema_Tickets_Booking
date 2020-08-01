const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
  //res.send('Home page');
  res.render('index', {
    title: 'Home'
  });
});

router.get('/food_and_drinks', function(req, res) {
  //res.send('Food and Drinks page');
  res.render('food_and_drinks', {
    title: 'Food & Drinks'
  });
});

router.get('/about', function(req, res) {
  //res.send('About page');
  res.render('about', {
    title: 'About'
  });
});

module.exports = router;
