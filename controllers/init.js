var mongoose = require('mongoose');
var Story = require('../models/stories');

exports.init= function() {
    console.log("test");
    // uncomment if you need to drop the database
    //
    // Character.remove({}, function(err) {
    //    console.log('collection removed')
    // });

    /*const date=new Date(1908, 12, 1).getFullYear();
    var story = new Story({
         text: 'teststory',
         date_created: date
     });
    console.log(story.text);

    story.save(function (err, results) {
         console.log(results._id);
    });*/
}