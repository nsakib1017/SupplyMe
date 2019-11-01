var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var auth = require('../middleware/auth');

const url = 'mongodb://localhost:27017';
const dbName = 'ads_pr';
const colName ='supplier_inventory';
/* GET home page. */
router.get('/', auth ,function (req, res) {
  const findDocuments = function (db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      // Find some documents
      collection.find({}).toArray(function (err, docs) {
          assert.equal(err, null);
          console.log("Found the following records");
          console.log(docs)
          callback(docs);
          res.render('viewInventory',{info: docs});
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

//add customers
router.get('/addInventory', auth ,function(req,res){
  res.render('createInventory');
});

//create customers
router.post('/create', auth, function(req, res, next) {
  const insertDocuments = function (db, callback) {
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
    // Get the documents collection
    const collection = db.collection(colName);
    // Insert some documents
    collection.insertMany([
        { name: req.body.name, amount: req.body.amount, unit_pr: req.body.unit_pr, mID: makeid(50) }
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
res.redirect('/inventory');
});

//update document
router.post('/update/:id',auth,function(req,res){
  const updateDocument = function(db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      // Update document where a is 2, set b equal to 1
      collection.updateOne({ mID : req.params.id }
        , { $set: { name: req.body.name, unit_pr: req.body.unit_pr } }, function(err, result) {
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
  res.redirect('/inventory');
});

//edit page
router.post('/edit/:id',auth,function(req,res){
  const findDocuments = function (db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      // Find some documents
      collection.find({mID : req.params.id}).toArray(function (err, docs) {
          assert.equal(err, null);
          console.log("Found the following records");
          global.x=docs
          console.log(docs)
          callback(docs);
          res.render('updateInventory',{info: docs});
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

//delete document
router.post('/delete/:id',auth,function(req,res){
  const removeDocument = function(db, callback) {
      // Get the documents collection
      const collection = db.collection(colName);
      // Delete document where a is 3
      collection.deleteOne({ mID :  req.params.id }, function(err, result) {
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
  res.redirect('/inventory');
});

module.exports = router;