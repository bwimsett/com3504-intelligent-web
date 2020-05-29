/**
 * Handles likes.
 */

class Like{
    constructor(rating, user_id, story_id){
        this.rating = rating;
        this.user_id = user_id;
        this.story_id = story_id;
    }
}

/**
 * Sends an Ajax request with like data for a story sent by the PWA.
 * @param value - the value of the like.
 * @param storyID - the ID of the story.
 */
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
            cacheLike(dataR, true);

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

/**
 * Sends an Ajax request with like data from imported JSON file.
 * @param value - the value of the like.
 * @param userId - the ID of the user.
 * @param storyID - the ID of the story.
 */
function addLikes(likes, userID){

    var likesOutput = [];

    for(var l of likes){
        likesOutput.push(new Like(l.rating-1, userID, l.storyId));
    }

    const data = JSON.stringify(likesOutput)

    $.ajax({
        url: '/many_likes',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // Display the output on the screen
            console.log("likes received");
            // Cache the data for offline viewing
            cacheLikes(dataR, true);
        }
    });

    // Prevent the page from refreshing and clearing the posts just loaded
    event.preventDefault();
}

/**
 * Returns a list of likes for the given story, from the database.
 * @param id - the id of the story.
 * @param callback - a function to be called upon completion.
 */
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
                    //console.log("found user with ID: " + id);
                    output.push(elem);

                }
            }

            return callback(output);
        });
    }
}

/**
 * Gets all the likes in the database.
 * @param callback - a function to be called upon completion.
 */
function getLikes(callback){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(LIKES_STORE_NAME, 'readonly');
            var store = tx.objectStore(LIKES_STORE_NAME);
            var index = store.index('_id');
            var result = index.getAll();
            return result;
        }).then(function (results) {
            return callback(results);
        });
    }
}


function getStoryLikes(id, likes){
    var output = [];

    for (var like of likes) {
        var requestId = id;
        var thisId = like._id;

        if (like.story_id == id) {
            output.push(like);

        }
    }
    return output;


}

class Av{
    constructor(average, userLikes){
        this.average = average;
        this.userLikes = userLikes;
    }
}

/**
 * Ra = average score given by user
 * @param userId
 */


function getAV(userId, likes){
    //var userLikes = getUserLikes(userId, likes);
    var average = 0;
    var userLikes = [];

    for(var like of likes){
        if (like.user_id == userId){
            average = average + like.rating;
            userLikes.push(like);
        }

    }
    if (average == 0){
        average = 2.5;
    }else{
        average = average/userLikes.length;
    }
    return new Av(average, userLikes);

}

/**
 * Ru = rating for story
 * @param userId
 */
function getRu(storyId, userId, likes){
    var rating = null;
    var like = getLike(storyId,  userId, likes);
    if (like != null){
        return like.rating;
    }else{
        return null;
    }
}

/*function getSimilarity(user, likes){
    var userA = JSON.parse(getCurrentUser());
    var userLikes = getUserLikes(userA._id, likes);

    var sum1 = 0;
    var sum2 = 0;
    var sum1sq = 0;
    var sum2sq = 0;
    var psum = 0;
    var n = 0;

    var score = 0;

    for (var likeA of userLikes) {
        var likeU = getLike(likeA.story_id, user._id, likes);
        if(likeU != null){

            //user ratings
            var u1 = parseInt(likeA.rating);
            var u2 = parseInt(likeU.rating);

            //sim_pearson
            sum1 += u1;
            sum2 += u2;
            sum1sq += Math.pow(u1, 2);
            sum2sq += Math.pow(u2, 2);
            psum += u1*u2
            n += 1;

        }

    }



    //sim_pearson
    if (n != 0){
        var num = psum-(sum1*sum2/n);
        var den=Math.sqrt((sum1sq-Math.pow(sum1,2)/n)*(sum2sq-Math.pow(sum2,2)/n));
        console.log("num:" + num + " | den: " + den);

        if (den == 0){
            score = 0;
        }else{
            score = (num/den);
        }
    }

    return score;
}*/

class normSim{
    constructor(norm, similarity){
        this.norm = norm;
        this.similarity = similarity;
    }
}

/**
 * Returns score for the story.
 * @param storyId - the id of the story.
 * @param users - list of users.
 * @param likes - list of likes
 */
function getStoryScore(storyId, users, likes, currentUserLikes, currentUserAverage){

    var score = 0; //score for story

    var userA = JSON.parse(getCurrentUser()); //current user


    var sumWAU = 0; //sum of All similarities
    var n = 0; // count
    var topSum = 0; // sum(norm(user_rating - average_user_rating) * similarity))

    //loop through all users
    for (var user of users) {
        //check that user is not the (current user logged in)
        if (user._id != userA._id){
            //var rU = getRu(storyId, user._id, likes);
            //console.log("RU: " + rU);


            // get norm and similarity
            var normSim = getNormAndSim(storyId, user, likes, userALikes);
            //check if null
            if (normSim != null){
                //var norm = normaliseScore(rU, getAV(user._id, likes))
                var norm = normSim.norm;
                //console.log("norm: " + norm);


                //var similarity = getSimilarity(user, likes);
                var similarity = normSim.similarity;
                //console.log("similarity: " + similarity);

                //sum up similarities
                sumWAU += similarity;

                // do this // sum(norm(user_rating - average_user_rating) * similarity))
                var top = norm*similarity;
                topSum += top;

                //increase count
                n += 1;
            }
        }

    }

    var rA = currentUserAverage;
    var userALikes = currentUserLikes;
    //console.log("RA: " + rA);

    // if count not 0
    if (n != 0) {
        // mean(ra) + (sum(ru-mean(ru) * uSimilarity))/sum(similarity)
        score = rA + (topSum/sumWAU);
    }

    return score;

}


/**
 * Returns score for the story.
 * @param storyId - the id of the story.
 * @param user - user.
 * @param likes - list of likes
 */
function getNormAndSim(storyId, user, likes, userLikes){

    var userA = JSON.parse(getCurrentUser()); //current user
    //var userALikes = getUserLikes(userA._id, likes); // current user likes
    var userALikes = userLikes;
    var rU = null; // user rating for storyId
    var averageU = 0; // average user rating
    var norm = 0; // rU - averageU

    var sum1 = 0;
    var sum2 = 0;
    var sum1sq = 0;
    var sum2sq = 0;
    var psum = 0;
    var n = 0;
    var un = 0;


    var score = 0; // similarity between current user and user

    for (var like of likes){

        if (like.user_id == user._id){
            //

            if (like.story_id == storyId){
                // find rU - use rating for storyId
                rU = like.rating;
            }
            // sum user ratings
            averageU += like.rating;
            un += 1;

            // check if user and current user liked the same story - storyId
            var likeA = getLike(like.story_id, userA._id, userALikes);
            if (likeA != null){
                //user ratings
                var u1 = parseInt(likeA.rating);
                var u2 = parseInt(like.rating);

                //sim_pearson - equation for lecture
                sum1 += u1;
                sum2 += u2;
                sum1sq += Math.pow(u1, 2);
                sum2sq += Math.pow(u2, 2);
                psum += u1*u2
                n += 1;
            }


        }

    }

    //sim_pearson - equation for lecture
    if (n != 0){
        var num = psum-(sum1*sum2/n);
        var den=Math.sqrt((sum1sq-Math.pow(sum1,2)/n)*(sum2sq-Math.pow(sum2,2)/n));
        //console.log("num:" + num + " | den: " + den);

        if (den == 0){
            score = 0;
        }else{
            score = (num/den); //similarity between current user and user
        }
    }
    //console.log("ru: " + rU);

    if (rU != null){
        averageU = averageU/un;
        norm = rU - averageU // user rating for storyId - users average rating for all stories
        return (new normSim(norm, score));

    }else{
        return null;
    }

}


/**
 * (Ru - Ra) = normalised score for a story/user
 * @param userId
 */
function normaliseScore(rU, AvRu){
    return rU - AvRu;
}


/**
 * Get all of a given user's likes.
 * @param userId - the id of the user.
 * @param callback - a function to be called upon completion.
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

function getUserLikes(userId, likes){
    var output = [];

    for (var like of likes) {
        if (like.user_id == userId) {
            output.push(like);
        }
    }

    return output;

}

/**
 * If a user has already liked a given post, return the like.
 * @param storyId - the ID of the story.
 * @param userId - the ID of the user.
 */

function getLike(storyId, userId, likes){
    var userLikes = getUserLikes(userId, likes);
    for(var elem of userLikes){
        if(elem.story_id == storyId){
            return elem;
        }
    }
    return null;
}

/**
 * Returns a like for a particular story by a user, if it exists.
 * @param storyId - the id of the story.
 * @param userId - the id of the user.
 * @param callback - a function to be called upon completion.
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

/**
 * Removes a given like from the database.
 * @param likeId - the ID of the like to be removed.
 */
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

/**
 * Returns a like with a given ID.
 * @param likeId - the ID of the like.
 */
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

/**
 * Returns the average to be displayed on the story card. Not the average used in recommender.
 * @param storyId - the ID of the story to get an average for.
 * @param callback - a function to be called upon completion.
 */
function getAverage(likes){
        //console.log("Calculating average rating for story: "+storyId);
        var total = 0;

        for(var elem of likes){
            total += elem.rating;
        }

        var avg = ""+total/likes.length;
        avg = avg.substr(0, 3);

        return avg;
}

function getStoryAverage(storyId, likes){
    var results = getStoryLikes(storyId, likes);
    var total = 0;

    for(var elem of results){
        total += elem.rating;
    }
    return total/results.length;
}

