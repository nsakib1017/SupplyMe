var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
var auth = require('../middleware/auth');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'suppliers';
const colName1 = 'store_order_list';
const colName2 = 'items'
/* GET home page. */
router.get('/', auth, function (req, res) {
  const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    const collection1 = db.collection(colName1);
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data0 = docs;
      callback(docs);

    });
    collection1.aggregate([
      {
        $group:
          { _id: '$suppliername', total: { $sum: 1 } }
      }
    ]).toArray(function (err, docs) {
      assert.equal(null, err);
      console.log("Found the following records");
      console.log(docs);
      global.data1 = docs;
      callback(docs);
      res.render('viewBuyers', { info: global.data0, summ: global.data1 });
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
router.post('/:id', function (req, res) {
  const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    const collection1 = db.collection(colName2);
    // Find some documents
    collection.find({ _id: ObjectId(req.params.id) }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      global.data0 = docs;
      callback(docs);

    });
    collection1.find({ suppid: req.params.id }).toArray(function (err, docs) {
      assert.equal(null, err);
      console.log("Found the following records");
      console.log(docs);
      global.data1 = docs;
      callback(docs);
      res.render('suppDetails', { info: global.data0, items: global.data1 });
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