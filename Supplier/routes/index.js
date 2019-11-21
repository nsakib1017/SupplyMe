var express = require('express');
var supplier = require('../schemas/supplier');
var auth = require('../middleware/auth');
var bcrypt = require('bcrypt');
const assert = require('assert');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'store_order_list';
const colName1 = 'supplier_supply_list';
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
  res.render("index", { title: req.session.supplier });
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

router.post('/up_info/:id/:id1', async function (req, res) {
  req.session.supplier = req.body.name;
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
  if (req.params.id1 != req.body.name) {
    const updateDocument = function (db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      const collection1 = db.collection(colName1);
      // Update document where a is 2, set b equal to 1
      collection.updateMany({ suppliername: req.params.id1 }
        , { $set: { suppliername: req.body.name } }, function (err, result) {
          console.log("Updated the document with the field a equal to 2");
          callback(result);
        });
      collection1.updateMany({ suppliername: req.params.id1 }
        , { $set: { suppliername: req.body.name } }, function (err, result) {
          console.log("Updated the document with the field a equal to 2");
          callback(result);
        });
    }
    MongoClient.connect(url, function (err, client) {
      console.log("Connected successfully to server");
      const db = client.db(dbName);
      updateDocument(db, function () {
        client.close();
      });
    });
  }
  req.session.store = req.body.name;
  return res.redirect('/home');
});
module.exports = router;
