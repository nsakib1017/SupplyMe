var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var auth = require('../middleware/auth');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'suppliers';
/* GET home page. */
router.get('/', auth, function (req, res) {
  const findDocuments = function (db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      // Find some documents
      collection.find({}).toArray(function (err, docs) {
          assert.equal(err, null);
          console.log("Found the following records");
          console.log(docs)
          callback(docs);
          res.render('viewBuyers',{info: docs});
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