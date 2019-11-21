var express = require('express');
var items = require('../schemas/items');
var auth = require('../middleware/auth');
var router = express.Router();

router.get('/', function(req,res){
  items.find({ suppid: req.session.userID })
  .exec(function (err, items) {
      if (err) {
          return callback(err)
      } else if (!items) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
      }
      return res.render('viewInventory',{items: items});
  });
});
router.get('/addInventory', function(req,res){
  res.render('addItems',{ suppid: req.session.userID});
})
router.post('/create/item', auth, function (req, res, next) {
  if (
    req.body.name &&
    req.body.price &&
    req.body.suppid) {
    var name =req.body.name;
    var nm=name.toLowerCase();
    console.log(nm);
    var itemData = {
      itemname: nm,
      price: req.body.price,
      suppid: req.body.suppid
    }
    //use schema.create to insert data into the db
    items.create(itemData, function (err, item) {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/inventory/addInventory');
      }
    });
  }
});
router.post('/delete/:id',function(req,res){
  items.deleteOne({ _id: req.body.id }, function (err) {
    if (err) return handleError(err);
    return res.redirect('/inventory');
  });
});
router.post('/edit/:id',function(req,res){
  items.find({ _id: req.params.id })
  .exec(function (err, items) {
      if (err) {
          return callback(err)
      } else if (!items) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
      }
      return res.render('updateInventory',{items: items});
  });
});
router.post('/update/:id', async function(req, res){
  var update = {
    "itemname": req.body.itemname, "price": req.body.price, "suppid": req.body.suppid
  }
  const filter = { _id: req.params.id };
  let doc = await items.findOneAndUpdate(filter, update, {
    new: true
  });
  return res.redirect('/inventory');
});

module.exports = router;
