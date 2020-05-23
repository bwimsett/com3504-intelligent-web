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

        getAverageRatingForStory(storyData._id, function(averageRating){
            // Set HTML
            storyCard.innerHTML =
                "<div class=\"card storyCard\">" +
                "<div class=\"card-body\">" +
                "<h5 class=\"card-title\">" + user.username+"</h5>" +
                "<p class =\"mb-2 text-muted\">"+getDateStringFromStoryData(storyData)+" | "+"Average rating: "+averageRating+"</p>" +
                "<p class = \"card-text\">" + storyData.text + "</p>" +
                //LIKE BUTTONS
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
                "</div>";

            var currentUser = JSON.parse(getCurrentUser());

            getLikeByStoryAndUser(storyData._id, currentUser._id, function(like){
                if(!like){
                    return;
                }

                highlightLikeButton(storyData._id, like.rating);
            });
        });
    });
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

        console.log(unsorted.length);
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

function displayStories(stories){
    clearStoriesContainer();

    // Sort the results
    var sorted = sortStories(stories);

    // Output every matching result to the page
    if (sorted && sorted.length>0) {
        for (var elem of sorted)
            createStoryCard(elem);
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

    var dateString = ""+hours+":"+minutes+" "+dateValue.getDay()+"/"+dateValue.getMonth()+"/"+dateValue.getYear();

    return dateString;
}

$().button('toggle')

