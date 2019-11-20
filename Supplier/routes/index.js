var express = require('express');
var mongoose = require('mongoose');
var supplier = require('../schemas/supplier');
var auth = require('../middleware/auth');
var bcrypt =require('bcrypt')
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Supplier Login' });
});

router.get('/signup', function (req, res, next) {
  res.render('login', { title: 'Supplier Signup' });
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
    supplier.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        req.session.userID = user._id;
        req.session.supplier = user.username;
        return res.redirect('/home');
      }
    });
  }
});
router.get('/home', auth, function (req, res) {
  res.render("index", { title: "Supplier Home" });
});
router.post('/authenticate', function (req, res, next) {
  if (!req.session.userID) {
    supplier.authenticate(req.body.email, req.body.password, function (error, supplier) {
      if (error || !supplier) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return res.redirect('/');
      } else {
        req.session.userID = supplier._id;
        req.session.supplier = supplier.username;
        return res.redirect('/home');
      }
    });
  } else {
    return res.send("Already Logged in");
  }
});
router.get('/logout', function (req, res, next) {
  if (req.session.userID) {
    // delete session object
    req.session.userID = null;
    return res.redirect('/');
  }  
  else return res.redirect('/');
});
router.get('/update', function (req, res) {

  supplier.findById(req.session.userID, function (err, adventure) {
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
      const filter = { _id: req.session.userID };
      let doc = await supplier.findOneAndUpdate(filter, update, {
        new: true
      });
    });
  } else {
    var update = {
      "username": req.body.name, "email": req.body.email, "number": req.body.number,
      "address": req.body.address
    }
    const filter = { _id: req.session.userID };
    let doc = await supplier.findOneAndUpdate(filter, update, {
      new: true
    });
  }
  res.redirect('/home');
});
module.exports = router;
