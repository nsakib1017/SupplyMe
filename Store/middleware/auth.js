var store = require('../schemas/store');
module.exports=function(req, res, next) {

    store.findById(req.session.userId).exec(function (error, user) {
        if (error) {
            return next(error);
        } else {      
            if (user === null) {     
                var err = new Error('NOT AUTHORIZED!!! PLEASE LOG IN.');
                err.status = 400;
                return next(err);
            } else {
                return next();
            }
        }
    });
}
