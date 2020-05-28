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

            createLikeSummaryButtons(storyData);

            getLikeByStoryAndUser(storyData._id, currentUser._id, function(like){
                if(!like){
                    return;
                }

                highlightLikeButton(storyData._id, like.rating);
            });
        });
    });
}

function createLikeSummaryButtons(storyData){
    getLikesByStoryId(storyData._id, function(likes){
        var summaryContainer = $(".likesummary"+storyData._id);

        // Create a button for each like
        for(var elem of likes){
            // Create blank tooltip
            createLikeSummaryButton(summaryContainer, elem, elem.user_id);
        }
    });
}

function createLikeSummaryButton(container, like, userID){
    getUserById(userID, function(user){
        container.append("<a href=\"/profile/"+user.username+"\"><button class=\"likesummary btn btn-secondary\" data-placement=\"bottom\" data-toggle=\"tooltip\" title=\""+user.username+"\"><p>"+like.rating+"</p></button></a>");
        $('[data-toggle="tooltip"]').tooltip();
    })

}

function highlightLikeButton(storyId, buttonValue){
    var card = $("#story"+storyId);
    var buttonClass = $(".option"+buttonValue);
    var button = card.find(buttonClass).addClass('active');
}

/**
 * Takes a list of stories and sorts them by chronological order (insertion sort)
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

class StoryScore{
    constructor(story, score){
        this.story = story;
        this.score = score;
    }
}

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

function clearStoriesContainer(){
   var container = $('#storyContainer')[0];
   container.innerHTML = "";
}

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
 * Retrieves the list of stories from the database. (Some references to the weather PWA are commented out. Need to be replaced)
 */
function displayCachedStories() {
    getCachedStories(function(results){
        displayStories(results);
    });
}

$().button('toggle')

