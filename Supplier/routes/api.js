var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'supplier_supply_list'

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post('/store/recieve', function (req, res) {
  console.log(req.body);
  var x=JSON.stringify(req.body);
  json_parsed=JSON.parse(x);
  const txID=makeid(10);
  json_parsed.orderID=txID;
  const insertDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection(colName);
    // Insert some documents
    collection.insertMany([
      json_parsed
    ], function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      assert.equal(1, result.ops.length);
      console.log("Inserted 1 documents into the collection");
      callback(result);
    });
  }
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    insertDocuments(db, function () {
      client.close();
    });
  });
  res.send(txID);
});

router.post('/store/remove/order/:id', function (req, res) {
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
  return res.send({orderID: req.params.id, operation: "cancellation", status: "done"});
});

module.exports = router;
