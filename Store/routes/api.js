var express = require('express');
var axios = require('axios');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName = 'store_order_list';

router.post('/placeOrder/:id', function (req, res) {
  // stringyfy req.body in order to parse it as a json
  var x = JSON.stringify(req.body);
  // parse the string as json 
  const obj = JSON.parse(x);
  console.log(Object.values(obj));
  var order = { items: 0, charge: 0, status: "pending" };
  
  for (var i = 3; i < Object.values(obj).length; i += 3) {
    if (Object.values(obj)[i] != 0) {
      // alphabet letters found
      order.items = order.items + 1;
      var x = Object.values(obj)[i - 2];
      console.log(x);
      order[Object.values(obj)[i - 2]] = Object.values(obj)[i];
      order.charge = Number(order.charge) + ((Object.values(obj)[i]) * (Object.values(obj)[i - 1]));

    }
  }

  order.supplierID = req.params.id;
  order.suppliername = req.body.suppname;
  order.storeID = req.session.userId;
  order.storename = req.session.store;
  console.log(order);

  axios.post('http://localhost:3000/api/store/recieve', order)
    .then(function (response) {
      console.log(response.data);
      var json_parsed1 = order;
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
  return res.redirect('/home');
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
