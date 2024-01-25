var express = require('express');
var router = express.Router();
const upload = require('./multer.js');
const passport = require('passport');
const localStratergy = require('passport-local');
var userModel = require('./users.js');
var postModel = require('./post.js');
passport.use(new localStratergy(userModel.authenticate()));

function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

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

router.get('/feed', isLoggedin,async function (req, res) {
  const post = await postModel.find().populate('user');
  console.log(post);
  res.render('feed', { footer: true ,post});
});

router.get('/profile', isLoggedin, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  console.log(user);
  res.render('profile', { footer: true, user: user });
});

router.post('/update', upload.single('image'), async function (req, res) {
  try {
    console.log("success");
    const user = await userModel.findOneAndUpdate({ username: req.session.passport.user }, { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true });
    if (req.file) {
      user.profileImage = req.file.filename;
    }
    await user.save();
  } catch (err) {
    console.log(err);
  }
  res.redirect('/profile');
})

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

router.get('/search', isLoggedin,async function (req, res) {
  res.render('search', { footer: true });
});

router.get('/edit', isLoggedin, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('edit', { footer: true, user:user });
});

router.get('/upload', isLoggedin,async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('upload', { footer: true,user:user });
});

router.post('/upload', isLoggedin, upload.single("image"), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    picture: req.file.filename,
    user: user._id,
    caption: req.body.caption,
  })
  user.posts.push(post._id);
  await user.save();
  console.log(post);
  res.redirect("/feed");
});

module.exports = router;