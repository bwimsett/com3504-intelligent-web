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
        var like = {
            rating: likeData.rating,
            date_created: Date.now(),
            user_id: likeData.user_id,
            story_id: likeData.story_id
        };

        console.log('received: ' + like);

        var query = {user_id: likeData.user_id, story_id: likeData.story_id};
        var options = {upsert: true, new: true, useFindAndModify: false};


        // Save the like to the database, update an old version if it exists
        Like.findOneAndUpdate(query, like, options, function(err, result){
            if(err){
                console.log(err);
                return res.send({ error: err });
            }

            return res.send("succesfully saved");
        });
    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}
