/**
 * called by the HTML onload
 * showing any cached stories and declaring the service worker
 */
function initStories() {
    // First load the data.



    // This is uncommented until the database is fully implemented.
    //loadData();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            })
            .catch (function (error){
                console.log('Service Worker NOT Registered '+ error.message);
            });
    }
    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    getCachedStories();
}

/**
 * given a list of users, retrieve all the data from the server (or failing that) from the database.
 */
function loadData(){
    // optional: Retrieve data set from localstorage? E.g. stories from specific users
    var userList = JSON.parse(localStorage.getItem('[LOCALSTORAGE KEY]'));
    retrieveAllStoryData(userList, new Date().getTime());
}

/**
 * Cycles through the list of users and requests a story (or stories) from the server for each
 * user.
 */
function retrieveAllStoryData(userList){
    for (index in userList)
        loadUserStories(userList[index]);
}

/**
 * Given a user, returns a single story. Could be adapted for multiple stories.
 * @param user
 */
function loadUserStories(user){
    const input = JSON.stringify({user: user});
    $.ajax({
        url: '/[POST URL]',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // Store the result data in a card on the page
            addToResultsSection(dataR);

            // Add the data to the cache (currently accepts a single story)
            cacheData(dataR);

            // Hide the 'offline' alert, as server request was successful
            if (document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';
        },

        // If the server request fails, show the cached data instead.
        error: function (xhr, status, error) {
            showOfflineWarning();
            getCachedStories();

            // Show the 'offline' alert
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                    dvv.style.display='block';
        }
    });

    // Anything that happens after the ajax request goes here

}

/**
 * Post request to /stories. Gets back whatever /stories returns. Could be a list of all the stories?
 */
function loadPosts(){
    $.ajax({
        url: '/stories',
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it

            // Display the output on the screen

            addToResultsSection(dataR);

            //  Update the database with the new data, as it is online
            //storeCachedData(dataR);

            // Hide the offline alert
            if (document.getElementById('offline_div')!=null)
                document.getElementById('offline_div').style.display='none';
        },
        // the request to the server has failed. Let's show the cached data
        error: function (xhr, status, error) {
            showOfflineWarning();
            getCachedStories();
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                dvv.style.display='block';
        }
    });

    // Anything that happens after the ajax request goes here

}

/**
 * Posts a story to /stories_list using ajax.
 */
function sendStory(story){
    const data = JSON.stringify({text: story.text});

    $.ajax({
        url: '/stories_list',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // Display the output on the screen
            console.log("response received");

            // Adds the returned data to a card on the page.
            addToResultsSection(dataR);

            // Cache the data for offline viewing
            cacheData(dataR);

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


///////////////////////// INTERFACE MANAGEMENT ///////////////////////////


/**
 * Creates a card on the page with the input data
 * @param dataR
 */
function addToResultsSection(dataR) {
    console.log("updating results");

    var resultsDiv = $('#results');

    if (resultsDiv != null) {
        const row = document.createElement("div");
        // appending a new row
        document.getElementById('results').appendChild(row);
        // formatting the row by applying css classes
        row.classList.add("card");
        row.classList.add("my_card");
        row.classList.add("bg-faded");
        // the following is far from ideal. we should really create divs using javascript
        // rather than assigning innerHTML
        row.innerHTML = "<div class=\"card-block\">" + dataR.text + "</div>";
    }
}

function loadAllCachedStories(dataR){
    console.log("Loading cached stories");


}

/**
 * @param text
 */
class Story{
    constructor(text){
        this.text = text;
        this.userid = 0; // TEMPORARY DEFAULT USER ID
    }
}

class User{
    constructor(username, password){
        this.username = username;
        this.password = password;
    }
}

/**
 * Creates a new post from the form and stores it in local storage
 */
function createPost(){
    var postList = JSON.parse(localStorage.getItem('posts'));
    if(postList == null){
        postList = [];
    }
    var formContents = $('#textfield').val();
    var newPost = new Story(formContents);
    console.log("creating post with text: "+formContents);
    postList.push(newPost)
    localStorage.setItem('posts', JSON.stringify(postList));
    // Create ajax request to send new story and refresh page
    sendStory(newPost);
    return false;
}

function register() {
    var userList=JSON.parse(localStorage.getItem('users'));
    if (userList==null) userList=[];
    var fdata = document.getElementById("regform");
    var user = new User(fdata.username, fdata.password);
    userList.push(user);
    console.log("register "+fdata);
    userList = removeDuplicates(userList);
    localStorage.setItem('users', JSON.stringify(userList));
    addUser(user);
}

function loggedIn(){
    var currentUser=JSON.parse(localStorage.getItem('currentUser'));
    return (currentUser==null);
}

function login() {
    console.log("trying to login fdata.... " + fdata);
    alert("lddddd");
    var currentUser=JSON.parse(localStorage.getItem('currentUser'));
    var fdata = document.getElementById("logform");
    var user = new User(fdata.username, fdata.password);

    if (!loggedIn()) {


        loginUser(user);
    }else{
        console.log("already logged in.... " + fdata);
    }
}

function addUser(user){
    var data = JSON.stringify(user);
    $.ajax({
        url: '/register',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {

            // Cache the data for offline viewing
            addUserData(dataR);
            // Display the output on the screen
            console.log("response received registering ----");
        },

        // the request to the server has failed. Display the cached data instead.
        error: function (xhr, status, error) {
            console.log("ajax post failed",error);
        }
    });
}

function loginUser(user){
    var data = JSON.stringify(user);
    $.ajax({
        url: '/login',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {

            findUser(dataR);
            // Display the output on the screen
            console.log("response received logging in ----");
        },

        // the request to the server has failed. Display the cached data instead.
        error: function (xhr, status, error) {
            console.log("ajax post failed",error);
        }
    });
}

function removeDuplicates(list) {
    // remove any duplicate
    var uniqueNames=[];
    $.each(list, function(i, el){
        if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
}

/**
 * When the client goes offline, show an offline warning for the user
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, hide the offline warning
 */
window.addEventListener('online', function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    loadData();
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}