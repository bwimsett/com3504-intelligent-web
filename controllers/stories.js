var Story = require('../models/stories');

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
        var story = new Story({
            text: storyData.text,
            date_created: new Date().getDate().valueOf()
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
