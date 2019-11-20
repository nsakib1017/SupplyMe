var express = require('express');
var bcrypt = require('bcrypt');
var store = require('../schemas/store');
var auth = require('../middleware/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Store Login' });
});

router.get('/signup', function (req, res, next) {
  res.render('login', { title: 'Store Signup' });
});
router.post('/register', function (req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.number &&
    req.body.password &&
    req.body.address) {
    var userData = {
      email: req.body.email,
      username: req.body.name,
      password: req.body.password,
      number: req.body.number,
      address: req.body.address
    }
    //use schema.create to insert data into the db
    store.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        req.session.userId = user._id;
        req.session.store = user.username;
        return res.redirect('/home');
      }
    });
  }
});
router.get('/home', auth, function (req, res) {
  res.render("index", { title: "Store Home" });
});
router.post('/authenticate', function (req, res, next) {
  if (!req.session.userId) {
    store.authenticate(req.body.email, req.body.password, function (error, store) {
      if (error || !store) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return res.redirect('/');
      } else {
        req.session.userId = store._id;
        req.session.store = store.username;
        return res.redirect('/home');
      }
    });
  } else {
    return res.send("Already Logged in");
  }
});
router.get('/logout', function (req, res, next) {
  if (req.session.userId) {
    // delete session object
    req.session.userId = null;
    req.session.store = null;
    return res.redirect('/');
  }
  else return res.redirect('/');
});

router.get('/update', function (req, res) {

  store.findById(req.session.userId, function (err, adventure) {
    res.render('update', { info: adventure, title: "Update Info" });
  });
});
router.post('/up_info/:id',  async function (req, res) {
  if (req.body.password != "") {
    bcrypt.hash(req.body.password, 10, async function (err, hash) {
      if (err) {
        return next(err);
      }
      var update = {
        "username": req.body.name, "email": req.body.email, "number": req.body.number,
        "address": req.body.address, "password": hash
      }
      const filter = { _id: req.session.userId };
      let doc = await store.findOneAndUpdate(filter, update, {
        new: true
      });
      res.send(doc);
    });
  } else {
    var update = {
      "username": req.body.name, "email": req.body.email, "number": req.body.number,
      "address": req.body.address
    }
    const filter = { _id: req.session.userId };
    let doc = await store.findOneAndUpdate(filter, update, {
      new: true
    });
    res.redirect('/home');
  }
});
module.exports = router;
