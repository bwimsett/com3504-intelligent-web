
/**
 * called by the HTML onload
 * showing any cached stories and declaring the service worker
 */

function initStories() {
    // First load the data.
    loadData();


    // This is uncommented until the database is fully implemented.
    // loadData();
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

    displayCachedStories();
}

/**
 * given a list of users, retrieve all the data from the server (or failing that) from the database.
 */
function loadData(){
    refreshCachedUsers();
    retrieveAllStoryData();
}

/**
 * Cycles through the list of users and requests a story (or stories) from the server for each
 * user.
 */
function retrieveAllStoryData(){
    loadLikes();
    loadStories();
}

/**
 * Returns all the stories and associated users
 * @param user
 */
function loadStories(){
    $.ajax({
        url: '/stories',
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            if(dataR == null){
                return;
            }

            // Clear the story cache, then fill it with the newly returned data
            clearCachedStories(function(){
                var dataValue = dataR;

                // Store the result data in a card on the page
                $.each(dataR, function(index, element) {
                    console.log(element);
                    cacheStory(element);
                });
            })

            // Hide the 'offline' alert, as server request was successful
            /*if (document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';*/
        },

        // If the server request fails, show the cached data instead.
        error: function (xhr, status, error) {
            showOfflineWarning();
            displayCachedStories();

            // Show the 'offline' alert
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                    dvv.style.display='block';
        }
    });

    // Anything that happens after the ajax request goes here

}

/**
 * Returns all the stories and associated users
 * @param user
 */
function loadLikes(){
    $.ajax({
        url: '/retrieve_likes',
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            if(dataR == null){
                return;
            }

            // Clear the cache, then fill it with the newly returned data
            clearCachedLikes(function(){
                var dataValue = dataR;

                $.each(dataR, function(index, element) {
                    cacheLike(element);
                });
            })

            // Hide the 'offline' alert, as server request was successful
            /*if (document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';*/
        },

        // If the server request fails, show the cached data instead.
        error: function (xhr, status, error) {
            showOfflineWarning();
            displayCachedStories();

            // Show the 'offline' alert
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                dvv.style.display='block';
        }
    });

    // Anything that happens after the ajax request goes here

}

function addJsonData(){

    getJsonData("/usersStoriesAndRatings.json", function(text){
        var json = JSON.parse(text);
        var users = json.users;

        for (var user in users){
            addUserJson(users[user].userId);
            var ratings = users[user].ratings;
            for (var rating in ratings){
                addLike(ratings[rating].rating, users[user].userId, ratings[rating].storyId);
            }
        }

        var stories = json.stories;

        for (var story in stories){
            sendStoryId(new StoryId(stories[story].storyId, stories[story].text, stories[story].userId));

        }
        console.log("json file added")
    });

}

function getJsonData(path, callback) {
    console.log("seeting f to file")
    var f = new XMLHttpRequest();

    console.log("getting file")
    f.overrideMimeType("application/json");
    f.open("GET", path, true);

    console.log("getting state")
    f.onreadystatechange = function() {
        if (f.readyState === 4 && f.status == "200") {
            callback(f.responseText);
        }
    }

    f.send(null);
}


function addUserJson(userId){
    var user = new User(userId, 123)
    addUserId(user);
}

function setSortingMethod(){
    var toggle = $('#toggle').val();
    localStorage.setItem('toggle', JSON.stringify(toggle));
    console.log(JSON.stringify(toggle))
    window.location.reload();
}

function getSortingMethod() {
    var toggle = JSON.parse(localStorage.getItem('toggle'));
    console.log(toggle)
    $('#toggle').val(toggle);
}

function refreshCachedUsers(){
    $.ajax({
        url: '/users_list',
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {

            // Add the data to the cache (currently accepts a single story)
            cacheUsers(dataR);

            // Hide the 'offline' alert, as server request was successful
            /*if (document.getElementById('offline_div')!=null)
                document.getElementById('offline_div').style.display='none';*/
        },

        // If the server request fails, show the cached data instead.
        error: function (xhr, status, error) {
            showOfflineWarning();
            displayCachedStories();

            // Show the 'offline' alert
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
function sendStoryId(story){
    const data = JSON.stringify(story);

    $.ajax({
        url: '/addStoryId',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // Display the output on the screen
            console.log("response received");

            // Cache the data for offline viewing
            cacheStory(dataR, function () {
                displayCachedStories();
            });

        }
    });

    // Prevent the page from refreshing and clearing the posts just loaded
    event.preventDefault();
}


/**
 * Posts a story to /stories_list using ajax.
 */
function sendStory(story){
    const data = JSON.stringify(story);

    $.ajax({
        url: '/stories_list',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // Display the output on the screen
            console.log("response received");

            // Cache the data for offline viewing
            cacheStory(dataR, function () {
                displayCachedStories();
            });

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
 * @param text
 */
class Story{
    constructor(text, user_id){
        this.text = text;
        this.user_id = user_id;
    }
}

class StoryId{
    constructor(id, text, user_id){
        this.id = id;
        this.text = text;
        this.user_id = user_id;
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

    var formContents = $('#newstory').val();
    var currentUser = JSON.parse(getCurrentUser());
    var newPost = new Story(formContents, currentUser._id);


    console.log("creating post with text: "+formContents);
    postList.push(newPost)
    localStorage.setItem('posts', JSON.stringify(postList));
    // Create ajax request to send new story and refresh page
    sendStory(newPost);
    return false;
}


/////////////////////////////////// LOGINS //////////////////////////////////

class User{
    constructor(username, password){
        this.username = username;
        this.password = password;
    }
}

function loggedIn(){
    var currentUser=localStorage.getItem('currentUser');
    return !(currentUser==null);
}

function reIfLogged(){
    var pathname = window.location.pathname;
    if (pathname == "/register" || pathname == "/login" || pathname == "/"){
        if(loggedIn()){
            window.location.replace("./home");
        }
    }else{
        if(!loggedIn()){
            window.location.replace("./");
        }

    }


}

function logout(){
    localStorage.removeItem("currentUser");
    window.location.replace("./");

}

function getCurrentUser(){
    var currentUser = localStorage.getItem('currentUser');
    return currentUser;
}

function login() {
    var un = $('#username').val();
    var pw = $('#password').val();
    var user = new User(un, pw);
    if (!loggedIn()) {
        loginUser(user);
        console.log('attempting to login user: '+ user.username);
    }else{
        window.location.replace("./home");
        console.log("already logged in.... ");
    }
}

function register(){
    var un = $('#username').val();
    var pw = $('#password').val();
    var user = new User(un, pw);
    addUser(user);
}

function addUser(user){
    var data = JSON.stringify(user);
    $.ajax({
        url: '/register',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (response) {
            console.log("register sucessful, ID: "+user._id);
            alert("register successful");
            window.location.reload();
        },

        // the request to the server has failed. Display the cached data instead.
        error: function (xhr, status, error) {
            console.log("ajax post failed",error);
        }
    });
}

function addUserId(user){
    var data = JSON.stringify(user);
    console.log(data);
    $.ajax({
        url: '/adduser',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (response) {
            console.log("register sucessful, ID: "+user._id);
            //alert("register successful");
            //window.location.reload();
        },

        // the request to the server has failed. Display the cached data instead.
        error: function (xhr, status, error) {
            console.log("ajax post failed",error);
        }
    });
}

function loginUser(user){
    var data = JSON.stringify(user);
    console.log("running data" + data);
    $.ajax({
        url: '/login',
        data: data,
        contentType: 'application/json',
        type: 'POST',
        success: function (response) {
            if (response == null){
               alert("incorrect details");
            }else{
                window.location.reload();
                localStorage.setItem('currentUser', JSON.stringify(response));

                console.log("USER LOGGING IN: "+response._id);
                window.location.replace("./home");
            }

            //findUser(user);
            // Display the output on the screen
            console.log("response received logging in ----");

        },

        // the request to the server has failed. Display the cached data instead.
        error: function (xhr, status, error) {
            console.log("server request failed",error);
            loginUserOffline(user);
            window.location.reload();


        }
    });
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