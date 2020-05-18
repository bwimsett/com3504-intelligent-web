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
        storyContainer.appendChild(storyCard);

        // Set HTML
        storyCard.innerHTML =
            "<div class=\"card storyCard\">" +
            "<div class=\"card-body\">" +
            "<h5 class=\"card-title\">" + user.username+"</h5>" +
            "<p class =\"mb-2 text-muted\">"+getDateStringFromStoryData(storyData)+"</p>"+
            "<p class = \"card-text\">" + storyData.text + "</p>" +
            "</div>" +
            "</div>";
    });
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