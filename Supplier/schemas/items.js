var mongoose = require('mongoose');
var ItemSchema = new mongoose.Schema({
    itemname: {
        type: String,
        unique: false,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        unique: false,
        required: true,
        trim: true
    },
    suppid: {
        type: String,
        unique: false,
        required: true,
        trim: true
    },
});

var Items = mongoose.model('Items', ItemSchema);
module.exports = Items;