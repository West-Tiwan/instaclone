var express = require('express');
var router = express.Router();
const passport = require('passport');
const localStratergy = require('passport-local');
var userModel = require('./users.js');

passport.use(new localStratergy(userModel.authenticate()));

router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

router.get('/logout', function (req, res, next) {
  req.logOut(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  })
});

router.get('/feed',isLoggedIn(), function (req, res) {
  res.render('feed', { footer: true });
});

router.get('/profile',isLoggedIn(), function (req, res) {
  res.render('profile', { footer: true });
});

router.post('/register', function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    secret: req.body.secret
  });
  userModel.register(userdata, req.body.password).then(function (registereduser) {
    passport.authenticate('local')(req, res, function () {
      res.redirect('/profile');
    })
  })
});

router.get('/search',isLoggedIn(), function (req, res) {
  res.render('search', { footer: true });
});

router.get('/edit',isLoggedIn(), function (req, res) {
  res.render('edit', { footer: true });
});

router.get('/upload',isLoggedIn(), function (req, res) {
  res.render('upload', { footer: true });
});

module.exports = router;


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
