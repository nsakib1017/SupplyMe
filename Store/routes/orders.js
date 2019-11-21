var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const assert = require('assert');
var auth = require('../middleware/auth');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'store_order_list';
const colName1 = 'suppliers';
const colName2 = 'items'


/* GET home page. */

router.get('/', auth, function (req, res) {
  const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Find some documents
    collection.find({ "storeID": req.session.userId }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      callback(docs);
      res.render('viewOrders', { info: docs });
    });
  }
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    findDocuments(db, function () {
      client.close();
    });
  });
});

router.post('/create', auth, function (req, res, next) {
  const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName2);
    // Find some documents
    collection.find({ "suppid": req.body.id }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
      res.render('placeOrder', { items: docs, suppid: req.body.id, suppname: req.body.name });
    });
  }
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    findDocuments(db, function () {
      client.close();
    });
  });

  
});

router.post('/update/:id', function (req, res) {
  console.log("Hello" + req.params.id);
  const updateDocument = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ orderID: req.params.id }
      , { $set: { status: "supplied" } }, function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Updated the document with the field a equal to 2");
        callback(result);
      });
  }
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    updateDocument(db, function () {
      client.close();
    });
  });
  res.send('Supplied');
});
router.post('/view/:id/:id1', function (req, res) {
  var findDocuments = function findDocuments (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    const collection1 = db.collection(colName1);
    // Find some documents
    collection.find({"orderID": req.params.id}).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data0=docs;
      callback(docs);
    });
    collection1.find({"_id": ObjectId(req.params.id1)}).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data1=docs;
      callback(docs);
      res.render("orderDetail", {order: global.data0, supplier: global.data1});
    });
  }
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    findDocuments(db, function () {
      client.close();
    });
  });
});
router.post('/delete/:id',auth,function(req,res){
  const removeDocument = function(db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      // Delete document where a is 3
      collection.deleteOne({ orderID :  req.params.id }, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Removed the document.");
        callback(result);
      });
    }
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      const db = client.db(dbName);

      removeDocument(db, function() {
          client.close();
        });
  });
  res.redirect('/order');
});
router.post('/search/supplier', function (req, res) {
  var findDocuments = function findDocuments (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Find some documents
    collection.find({"suppliername": req.body.suppName}).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
      res.render("viewOrders", {info:docs});
    });

     
  }
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    findDocuments(db, function () {
      client.close();
    });
  });
});
module.exports = router;
