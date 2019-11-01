var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SupplierSchema = new mongoose.Schema({
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
SupplierSchema.statics.authenticate = function (email, password, callback) {
    Supplier.findOne({ email: email })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
}

//hashing a password before saving it to the database
SupplierSchema.pre('save', function (next) {
    var supplier = this;
    bcrypt.hash(supplier.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        supplier.password = hash;
        next();
    })
});
var Supplier = mongoose.model('Supplier', SupplierSchema);
module.exports = Supplier;