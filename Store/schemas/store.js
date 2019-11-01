var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var StoreSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    number: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    address: {
        type: String,
        unique: false,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
});
//authenticate input against database
StoreSchema.statics.authenticate = function (email, password, callback) {
    Store.findOne({ email: email })
        .exec(function (err, store) {
            if (err) {
                return callback(err)
            } else if (!store) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, store.password, function (err, result) {
                if (result === true) {
                    return callback(null, store);
                } else {
                    return callback();
                }
            })
        });
}

//hashing a password before saving it to the database
StoreSchema.pre('save', function (next) {
    var store = this;
    bcrypt.hash(store.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        store.password = hash;
        next();
    })
});
var Store = mongoose.model('Store', StoreSchema);
module.exports = Store;