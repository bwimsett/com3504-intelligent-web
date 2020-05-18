var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Story = new Schema(
    {
        text: {type: String, required: true, max: 240},
        date_created: {type: Number, required: true},
        user_id: {type: String, required: true}
    }
);

Story.set('toObject', {getters: true, virtuals: true});

var storyModel = mongoose.model('Story', Story );

module.exports = storyModel;