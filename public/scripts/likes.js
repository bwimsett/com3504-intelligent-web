class Like{
    constructor(rating, user_id, story_id){
        this.rating = rating;
        this.user_id = user_id;
        this.story_id = story_id;
    }
}

function submitLike(value, storyID){

    var currentUser = JSON.parse(getCurrentUser());
    var like = new Like(value, currentUser._id, storyID);

    const data = JSON.stringify(like);

    $.ajax({
        url: '/likes',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // Display the output on the screen
            console.log("like received");

            // Adds the returned data to a card on the page.
            //createStoryCard(dataR);

            // Cache the data for offline viewing
            cacheLike(dataR);

            // Hide the offline alert
            if (document.getElementById('offline_div')!=null)
                document.getElementById('offline_div').style.display='none';
        },

        // the request to the server has failed. Display the cached data instead.
        error: function (xhr, status, error) {
            showOfflineWarning();
            console.log("ajax post failed",error);
            //getCachedData(city, date);
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                dvv.style.display='block';
        }
    });

    // Anything that happens after the ajax request goes here

    // Prevent the page from refreshing and clearing the posts just loaded
    event.preventDefault();
}

function getLikesByStoryId(id, callback){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(LIKES_STORE_NAME, 'readonly');
            var store = tx.objectStore(LIKES_STORE_NAME);
            var index = store.index('_id');
            var result = index.getAll();
            return result;
        }).then(function (results) {
            var output = [];

            for (var elem of results) {
                var requestId = id;
                var thisId = elem._id;

                if (elem.story_id == id) {
                    console.log("found user with ID: " + id);
                    output.push(elem);

                }
            }

            return callback(output);
        });
    }
}

/**
 * Get all of a given user's likes
 * @param userId
 * @param callback
 */
function getLikesByUserId(userId, callback){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(LIKES_STORE_NAME, 'readonly');
            var store = tx.objectStore(LIKES_STORE_NAME);
            var index = store.index('_id');
            var result = index.getAll();
            return result;
        }).then(function (results) {
            var output = [];

            for (var elem of results) {
                if (elem.user_id == userId) {
                    output.push(elem);
                }
            }

            return callback(output);
        });
    }
}

/**
 * If a user has already liked a given post, return the like.
 * @param storyId
 * @param userId
 * @returns {null}
 */
function getLikeByStoryAndUser(storyId, userId, callback){
    getLikesByUserId(userId, function(userLikes){
        for(var elem of userLikes){
            if(elem.story_id == storyId){
                callback(elem);
            }
        }
    });
}

function removeLike(likeId){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(LIKES_STORE_NAME, 'readwrite');
            var store = tx.objectStore(LIKES_STORE_NAME);
            var index = store.index('_id');
            store.delete(likeId);
        }).then(function () {
            console.log("Like successfully removed from cache");
        });
    }
}

function getLikeById(likeId){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(LIKES_STORE_NAME, 'readonly');
            var store = tx.objectStore(LIKES_STORE_NAME);
            var index = store.index('_id');
            var result = index.getAll();
            return result;
        }).then(function (results) {
            for (var elem of results) {
                if (elem._id == likeId) {
                    return callback(elem);
                }
            }
        });
    }
}

function getAverageRatingForStory(storyId, callback){
    getLikesByStoryId(storyId, function(results){
        var total = 0;

        for(var elem of results){
            total += elem.rating;
        }

        return callback(total/results.length);
    });
}

