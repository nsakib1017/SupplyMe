var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const axios = require('axios');
var auth = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectID;

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'supplier_supply_list';
const colName1 = "stores";

/* GET home page. */
router.get('/', auth, function (req, res) {

  const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Find some documents
    collection.find({ "supplierID": req.session.userID }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data0 = docs;
      callback(docs);
    });
    collection.aggregate([

      { $match: { supplierID: req.session.userID } }
      , {
        $group:
          { _id: '$storename', total: { $sum: 1 } }
      }
    ]).toArray(function (err, docs) {
      assert.equal(null, err);
      console.log("Found the following records");
      console.log(docs);
      global.data1 = docs;
      callback(docs);
      res.render('viewOrders', { info: global.data0, summ: global.data1 });
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
router.post('/update/:id', auth, function (req, res) {
  const updateDocument = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ orderID: req.params.id }
      , { $set: { status: "delivered" } }, function (err, result) {
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
  axios.post('http://localhost:3001/order/update/' + req.params.id)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });


  res.redirect('/orders');
});
router.post('/view/:id/:id1', function (req, res) {
  var findDocuments = function findDocuments(db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    const collection1 = db.collection(colName1);
    // Find some documents
    collection.find({ "orderID": req.params.id }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data0 = docs;
      callback(docs);
    });
    collection1.find({ "_id": ObjectId(req.params.id1) }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data1 = docs;
      callback(docs);
      res.render("orderDetail", { order: global.data0, orderer: global.data1 });
      //res.send({order: global.data0, orderer: global.data1});
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
router.post('/delete/:id', auth, function (req, res) {
  const removeDocument = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Delete document where a is 3
    collection.deleteOne({ orderID: req.params.id }, function (err, result) {
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

    removeDocument(db, function () {
      client.close();
    });
  });
  res.redirect('/orders');
});
module.exports = router;
