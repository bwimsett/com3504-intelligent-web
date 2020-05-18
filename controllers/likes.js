var Like = require('../models/likes');

/** Called from a POST route as like.insert
 * Adds a like to the mongodb database
 */
exports.insert = function (req, res) {
    var likeData = req.body;
    if (likeData == null) {
        // Display 403 error page if the data is empty
        res.status(403).send('No data sent!')
    }
    try {
        var like = new Like({
            rating: likeData.rating,
            date_created: Date.now(),
            user_id: likeData.user_id,
            story_id: likeData.story_id
        });

        console.log('received: ' + like);

        // Save the like to the database
        like.save(function (err, results) {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(like));
        });
    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}
