var express = require('express');
var axios = require('axios');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'store_order_list';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('API Page Goes Here');
});

router.post('/placeOrder/:id', function (req, res) {
  // stringyfy req.body in order to parse it as a json
  var x = JSON.stringify(req.body);
  // parse the string as json 
  const obj = JSON.parse(x);
  console.log(Object.values(obj));
  // iterate the json object to split the order information and create the final json string
  var y = "{\"items\": " + "\"" + req.body.member + "\"" + ",";
  for (var i = 1; i < Object.values(obj).length; i++) {
    x = Object.values(obj)[i];
    // split at whitespace, comma or colon
    var arr = x.split(/[\s,:]+/);
    y += ("\"" + arr[0] + "\"" + ":" + "\"" + arr[1] + "\"");
    if (i != Object.values(obj).length - 1)
      y += ","
  }
  // complete creating the json string
  y += ",\"status\":\"pending\"}";
  //parse the json string to make it json object
  var json_parsed = JSON.parse(y);
  json_parsed.supplierID = req.params.id;
  json_parsed.storeID = req.session.userId;
  console.log(json_parsed);
  axios.post('http://localhost:3000/api/store/recieve', json_parsed)
    .then(function (response) {
      console.log(response.data);
      var json_parsed1 = json_parsed;
      // add orderID field with response.data
      json_parsed1.orderID = response.data;
      const insertDocuments = function (db, callback) {
        // Get the documents collection
        const collection = db.collection(colName);
        // Insert some documents
        collection.insertMany([
          json_parsed1
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
    })
    .catch(function (error) {
      console.log(error);
    });
  res.redirect('/home');
});

router.post('/delete/order/:id', function (req, res) {
  axios.post('http://localhost:3000/api/store/remove/order/' + req.params.id)
    .then(function (response) {
      console.log(response.data);
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
      return res.redirect('/order');
    })
    .catch(function (error) {
      console.log(error);
    });
});

module.exports = router;
