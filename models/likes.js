var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Like = new Schema(
    {
        rating: {type: Number, required: true, min: 0, max: 4},
        date_created: {type: Number, required: true},
        user_id: {type: String, required: true},
        story_id: {type: String, required: true}
    }
);

Like.set('toObject', {getters: true, virtuals: true});

var likeModel = mongoose.model('Like', Like);

module.exports = likeModel;