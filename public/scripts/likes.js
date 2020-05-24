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
 * Ra = average score given by user
 * @param userId
 */

function getRa(userId){
    getLikesByUserId(userId, function(likes){
        var average = 0;
        for(var like of likes){
            average = average + like.rating
        }
        average = average/likes.length
        return average;
    });

}

/**
 * Ru = rating for story
 * @param userId
 */
function getRu(storyId, userId){
    getLikeByStoryAndUser(StoryId,  userId, function(like){
        return like.rating;
    });
    return null;
}


class similarity{
    constructor(user, score){
        this.user = user;
        this.score = score;
    }
}

function getSimilarity(user){
    var userA = JSON.parse(getCurrentUser());
    var userLikes = getLikesByUserId(userA._id);

    var sum1 = 0;
    var sum2 = 0;
    var sum1sq = 0;
    var sum2sq = 0;
    var psum = 0;
    var n = 0;

    for (var likeA of userLikes) {
        getLikeByStoryAndUser(likeA.story_id, user._id, function(likeU){
            if(likeU != null){

                //user ratings
                var u1 = likeA.rating;
                var u2 = likeU.rating;

                //sim_pearson
                sum1 += u1;
                sum2 += u2;
                sum1sq += Math.pow(u1, 2);
                sum2sq += Math.pow(u2, 2);
                psum += u1*u2
                n += 1;

            }
        });

    }

    //sim_pearson
    var num=psum-(sum1*sum2/n);
    var den=Math.sqrt((sum1sq-Math.pow(sum1,2)/n)*(sum2sq-Math.pow(sum2,2)/n));

    if (den == 0){
        score = null;
    }else{
        score = (num/den)
    }
    return score;
}

function getStoryScore(storyId){
    var users = getAllUsers();
    var score = 0;
    var userA = JSON.parse(getCurrentUser());
    var rA = getRa(UserA);

    var sumWAU = 0;
    var n = 0;
    var topSum = 0;

    for (var user of users) {
        var rU = getRu(storyId, user._id);

        if (rU != null){
            var norm = 0;
            var averageRu = 0;

            getAverageRatingForStory(storyId, function (AvRu) {
                norm = normaliseScore(rU, AvRu);
                averageRu = AvRu;
            });

            var similarity = getSimilarity(user);
            sumWAU += similarity;

            var top = norm*similarity;
            topSum += top;

            n += 1;
        }
    }
    sumWAU = sumWAU/n;
    topSum = topSum/n;

    score = rA + (topSum/sumWAU);

    return score;
}


/**
 * (Ru - Ra) = normalised score for a story/user
 * @param userId
 */
function normaliseScore(RU, AvRu){
    return Math.abs(Ra - AvRu);
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
                return callback(elem);
            }
        }

        return callback(null);
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
        console.log("Calculating average rating for story: "+storyId);
        var total = 0;

        for(var elem of results){
            total += elem.rating;
        }

        return callback(total/results.length);
    });
}

