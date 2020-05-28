var Story = require('../models/stories');
var ObjectId = require('mongoose').Types.ObjectId;

/** Called from a POST route as story.insert
 * Adds a story to the mongodb database
 */
exports.insert = function (req, res) {
    var storyData = req.body;
    if (storyData == null) {
        // Display 403 error page if the data is empty
        res.status(403).send('No data sent!')
    }
    try {
        var id = new ObjectId;
        var story = new Story({
            _id: id,
            text: storyData.text,
            date_created: Date.now(),
            user_id: storyData.user_id
        });

        console.log('received: ' + story);

        // Save the story to the database
        story.save(function (err, results) {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(story));
        });
    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}

exports.getAll = function(req, res){
    Story.find({}, function(err, result) {
        if(err){
            console.log(err);
            res.status(500).send('Invalid request');
        }
        res.json(result);
    });
}

exports.insertId = function (req, res) {
    var storyData = req.body;
    if (storyData == null) {
        // Display 403 error page if the data is empty
        res.status(403).send('No data sent!')
    }
    try {
        var story = new Story({
            _id: storyData.id,
            text: storyData.text,
            date_created: Date.now(),
            user_id: storyData.user_id
        });

        //console.log('received: ' + story);

        var query = {_id: storyData.id};
        var options = {upsert: true, new: true, useFindAndModify: false};

        // Save the story to the database
        story.findOneAndUpdate(query, like, options,function (err, results) {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(story));
        });
    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}


