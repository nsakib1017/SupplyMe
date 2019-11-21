var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName ='stores';
const colName1 = 'supplier_supply_list';
/* GET home page. */
router.get('/', auth ,function (req, res) {
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
        res.render('viewCustomers', { info: global.data0, summ: global.data1 });
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