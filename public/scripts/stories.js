/**
 * Creates a card on the page with the input data
 * @param storyData - data about the story
 * @param userData  - data about the user that created the story
 */
function createStoryCard(storyData) {
    console.log("updating results");

    // Get the container for stories
    var storyContainer = $('#storyContainer')[0];

    if (storyContainer == null) {
        return;
    }
    // Await callback to get the user associated with this post

    getUserById(storyData.user_id, function(user){
        // Create a story card, and add it to the container
        const storyCard = document.createElement("div");
        storyCard.id = "story"+storyData._id;
        storyContainer.appendChild(storyCard);

        getDisplayAverageForStory(storyData._id, function(averageRating){
            // Set HTML
            storyCard.innerHTML =
                "<div class=\"card storyCard\">" +
                "<div class=\"card-body\">" +
                "<a href=\"/profile/"+user.username+"\"><h5 class=\"card-title\">" + user.username+"</h5></a>" +
                "<p class =\"mb-2 text-muted\">"+getDateStringFromStoryData(storyData)+" | "+"Average rating: "+averageRating+"</p>" +
                "<p class = \"card-text\">" + storyData.text + "</p>" +
                // LIKE BUTTONS
                "<div class=\"btn-group btn-group-toggle\" data-toggle=\"buttons\">"+
                "<label class=\"btn btn-secondary likeoption option1\" onclick=\"submitLike(1, \'"+storyData._id+"\')\">"+
                "<input type=\"radio\" name=\"options\" autocomplete=\"off\" checked>1</label>"+
                "<label class=\"btn btn-secondary likeoption option2\" onclick=\"submitLike(2, \'"+storyData._id+"\')\">"+
                "<input type=\"radio\" name=\"options\" autocomplete=\"off\">2"+
                "</label>"+
                "<label class=\"btn btn-secondary likeoption option3\" onclick=\"submitLike(3, \'"+storyData._id+"\')\">"+
                "<input type=\"radio\" name=\"options\" autocomplete=\"off\">3"+
                "</label>"+
                "<label class=\"btn btn-secondary likeoption option4\" onclick=\"submitLike(4, \'"+storyData._id+"\')\">"+
                "<input type=\"radio\" name=\"options\" autocomplete=\"off\">4"+
                "</label>"+
                "</div>"+
                "<div class=\"likesummary-container likesummary"+storyData._id+"\"></div>"+
                // LIKES LIST
                "</div>";

            var currentUser = JSON.parse(getCurrentUser());

            createLikeSummaryIcons(storyData);

            getLikeByStoryAndUser(storyData._id, currentUser._id, function(like){
                if(!like){
                    return;
                }

                highlightLikeButton(storyData._id, like.rating);
            });
        });
    });
}

/**
 * Generates HTML for the like summary icons displayed beneath the like selection buttons
 * @param storyData - The story for which icons will be generated.
 */
function createLikeSummaryIcons(storyData){
    getLikesByStoryId(storyData._id, function(likes){
        var summaryContainer = $(".likesummary"+storyData._id);

        // Create a button for each like
        for(var elem of likes){
            // Create blank tooltip
            createLikeSummaryIcon(summaryContainer, elem, elem.user_id);
        }
    });
}

/**
 * Creates a single like summary icon based on a like and userID of the liker.
 * @param container - The JQuery DOM element containing the summary icon.
 * @param like - The like JSON data
 * @param userID - the ID string of the user which created the like.
 */
function createLikeSummaryIcon(container, like, userID){
    getUserById(userID, function(user){
        container.append("<a href=\"/profile/"+user.username+"\"><button class=\"likesummary btn btn-secondary\" data-placement=\"bottom\" data-toggle=\"tooltip\" title=\""+user.username+"\"><p>"+like.rating+"</p></button></a>");
        $('[data-toggle="tooltip"]').tooltip();
    })

}

/**
 * Highlights the like selection button corresponding to the current user's like.
 * @param storyId - The story for which the button will be highlighted.
 * @param buttonValue - The value of the like.
 */
function highlightLikeButton(storyId, buttonValue){
    var card = $("#story"+storyId);
    var buttonClass = $(".option"+buttonValue);
    var button = card.find(buttonClass).addClass('active');
}

/**
 * Takes a list of stories and sorts them by chronological order (insertion sort)
 * @param stories - A list of stories to be sorted.
 */
function sortStories(stories){
    if (stories == null){
        return stories;
    }

    var unsorted = stories;

    var sorted = [];

    while(unsorted.length > 0){

        //console.log(unsorted.length);
        var current;
        if(unsorted.length > 1) {
            current = unsorted.shift();
        } else {
            current = unsorted.pop();
        }

        // If the sorted list is empty
        if(sorted.length == 0){
            sorted.push(current);
            continue;
        }

        // Loop through sorted list
        for(i = 0; i < sorted.length; i++){
            // Insert if the date is greater than or equal to the current date
            if(sorted[i].date_created <= current.date_created){
                sorted.splice(i, 0, current);
                break;
            }

            // if it has reached the end without insertion
            if(i == sorted.length-1){
                sorted.push(current);
                break;
            }
        }
    }

    return sorted;
}

/**
 * Data class linking a story to a score.
 */
class StoryScore{
    constructor(story, score){
        this.story = story;
        this.score = score;
    }
}

/**
 * Sorts the stories in order of preference based on the recommender.
 * @param stories - a list of stories to sort.
 * @param callback - the function to be called upon completion.
 */
function sortStoriesRec(stories, callback){

    getAllUsers(function (users) {

        getLikes( function (likes) {
            var unsorted = [];
            var sorted = [];

            if (stories == null){
                return stories;
            }else{
                for(var story of stories){
                    var score = getStoryScore(story._id, users, likes);
                    var storyScore = new StoryScore(story, score);
                    unsorted.push(storyScore);
                    //console.log("Score for story:" + story._id + " is = " + score);

                }
            }

            while(unsorted.length > 0){

                //console.log(unsorted.length);

                var current;
                if(unsorted.length > 1) {
                    current = unsorted.shift();
                } else {
                    current = unsorted.pop();
                }


                // If the sorted list is empty
                if(sorted.length == 0){
                    sorted.push(current);
                    continue;
                }

                // Loop through sorted list
                for(i = 0; i < sorted.length; i++){
                    // Insert if the date is greater than or equal to the current date
                    if(sorted[i].score <= current.score){
                        sorted.splice(i, 0, current);
                        break;
                    }

                    // if it has reached the end without insertion
                    if(i == sorted.length-1){
                        sorted.push(current);
                        break;
                    }
                }
            }

            var result = []

            for(var story of sorted){
                story = result.push(story.story);
            }

            return callback(result);


        })
    })

}

/**
 * Clears the story container and replaces it with the given list of stories.
 * @param stories - a list of stories to be displayed.
 */
function displayStories(stories){
    clearStoriesContainer();
    var toggle = JSON.parse(localStorage.getItem('toggle'));
    // Sort the results
    if (toggle == "recommended"){
        sortStoriesRec(stories, function (sorted) {
            // Output every matching result to the page
            if (sorted && sorted.length>0) {
                for (var elem of sorted)
                    createStoryCard(elem);
            }

        });

    }else{
        var sorted = sortStories(stories);
        // Output every matching result to the page
        if (sorted && sorted.length>0) {
            for (var elem of sorted)
                createStoryCard(elem);
        }
    }



}

/**
 * Removes all contents from the stories container on the page.
 */
function clearStoriesContainer(){
   var container = $('#storyContainer')[0];
   container.innerHTML = "";
}

/**
 * Returns a date in string format to be displayed on a story card.
 * @param storyData - the story from which the date will be extracted.
 * @returns {string}
 */
function getDateStringFromStoryData(storyData){
    if(storyData.date_created == null){
        return;
    }


    var dateValue = new Date(storyData.date_created);

    // Add a 0 to the beginning of hours and minutes if they are too short
    var hours= ""+dateValue.getHours();
    if(hours.length < 2){
        hours = "0"+hours;
    }

    var minutes = ""+dateValue.getMinutes();
    if(minutes.length < 2){
        minutes = "0"+minutes;
    }

    var dateString = ""+hours+":"+minutes+" "+dateValue.getDate()+"/"+(dateValue.getMonth()+1)+"/"+dateValue.getFullYear();

    return dateString;
}

/**
 * Displays all the stories for a given user on the page.
 * @param username - the username of the user to display stories for.
 */
function displayStoriesForUser(username){
    getUserByUsername(username, function(user){
        getCachedStories(function(allStories){

            var validStories  = [];

            for(var elem of allStories){
                if(elem.user_id == user._id){
                    validStories.push(elem);
                }
            }

            displayStories(validStories);
        });
    });
}

/**
 * Displays all the stories currently cached, regardless of user.
 */
function displayCachedStories() {
    getCachedStories(function(results){
        displayStories(results);
    });
}

$().button('toggle')

