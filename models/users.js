var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var User = new Schema(
    {
        username: {type: String, required: true, max: 25},
        password: {type: String, required: true, max: 25}
        //,dob: {type: Date}
    }
);

/** Virtual for a user's age
    Behaves like a field, but is dynamically calculated.
 */
/*User.virtual('age')
    .get(function () {
        const currentDate = new Date().getFullYear();
        const result= currentDate - this.dob;
        return result;
    });*/

User.set('toObject', {getters: true, virtuals: true});

var userModel = mongoose.model('User', User );

module.exports = userModel;