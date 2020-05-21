////////////////// DATABASE //////////////////
// the database receives the following structure from the server
/**
class Story{
    constructor(text){
        this.text = text;
    }
}*/
var dbPromise;


const STORIES_DB_NAME= 'db_stories_1';
const STORY_STORE_NAME= 'store_stories';
const USER_STORE_NAME= 'store_users';
const LIKES_STORE_NAME = 'store_likes';

/**
 * Initialise the database.
 */
function initDatabase(){
    dbPromise = idb.openDb(STORIES_DB_NAME, 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
            var storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {keyPath: '_id', autoIncrement: true});
            // Index for searching stories by user
            storyDB.createIndex('user_id', 'user_id', {unique: false, multiEntry: true});
        }
        if (!upgradeDb.objectStoreNames.contains(USER_STORE_NAME)){
            var userDB = upgradeDb.createObjectStore(USER_STORE_NAME, {keyPath: '_id'});
            userDB.createIndex('_id', "_id");
            console.log("Initialised User DB");
        }
        if (!upgradeDb.objectStoreNames.contains(LIKES_STORE_NAME)){
            var likesDB = upgradeDb.createObjectStore(LIKES_STORE_NAME, {keyPath: '_id'});
            likesDB.createIndex('_id', "_id");
            // Index for searching likes by story
            likesDB.createIndex('story_id', "story_id");
            // Index for searching likes by user
            likesDB.createIndex('user_id', "user_id");
            console.log("Initialised User DB");
        }
    });
}

/**
 * saves a single story to indexed db, or local storage if that fails
 * @param storyObject
 */
function cacheStory(storyObject, callback) {
    console.log('inserting: '+JSON.stringify(storyObject));
    // Attempt to use Indexed DB
    if (dbPromise) {
        // Try pushing to indexed db
        dbPromise.then(async db => {
            var tx = db.transaction(STORY_STORE_NAME, 'readwrite');
            var store = tx.objectStore(STORY_STORE_NAME);
            await store.put(storyObject);
            console.log("added to indexdb")
            return tx.complete;
            // Then output success
        }).then(function () {
            console.log('added story to cache '+ JSON.stringify(storyObject));
            if(callback != null){
                callback();
            }
            // If there's an error. store the item in local storage
        }).catch(function () {
            localStorage.setItem(storyObject, JSON.stringify(storyObject));
            console.log("added to local storage")
        });
    } // Otherwise us localstorage
    else localStorage.setItem(storyObject, JSON.stringify(storyObject));
}

function cacheLike(likeObject) {
    console.log('inserting like: '+JSON.stringify(likeObject));
    // Attempt to use Indexed DB
    if (dbPromise) {
        // Try pushing to indexed db
        dbPromise.then(async db => {
            var tx = db.transaction(LIKES_STORE_NAME, 'readwrite');
            var store = tx.objectStore(LIKES_STORE_NAME);
            await store.put(likeObject);
            return tx.complete;
            // Then output success
        }).then(function () {
            console.log('added like to the indexeddb store! '+ JSON.stringify(likeObject));
            // If there's an error. store the item in local storage
        }).catch(function () {
            localStorage.setItem(likeObject, JSON.stringify(likeObject));
            console.log("added like to local storage")
        });
    } // Otherwise us localstorage
    else localStorage.setItem(likeObject, JSON.stringify(likeObject));
}

function cacheUsers(usersList){
    for(var elem of usersList){
        cacheUserData(elem);
    }
}

function cacheUserData(user){
    if (dbPromise) {
        dbPromise.then(async db  => {
            console.log('inserting: '+JSON.stringify(user));
            console.log("adding user to indexeddb store")
            var tx = db.transaction(USER_STORE_NAME, 'readwrite');
            var store = tx.objectStore(USER_STORE_NAME);
            await store.put(user); // necessary as it returns a promise
            return tx.complete;
        }).then(function () {
            //alert("register successful")
            //console.log("register success");
        });
    }
}

function loginUserOffline(userObj){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(USER_STORE_NAME, 'readonly');
            var store = tx.objectStore(USER_STORE_NAME);
            return store.get (userObj.username);
        }).then(function (foundObject) {
            if (foundObject && (foundObject.username==userObj.username &&
                foundObject.password==userObj.password)){

                console.log("login success");
                localStorage.setItem('currentUser',JSON.stringify(foundObject));
                window.location.reload();

            } else {
                alert("login or password incorrect")
            }
        });
    }
}

/**
 * Retrieves a user object by ID, firing a callback when complete
 * @param id
 * @param callback
 */
function getUserById(id, callback){
        if (dbPromise) {
            dbPromise.then(function (db) {
                var tx = db.transaction(USER_STORE_NAME, 'readonly');
                var store = tx.objectStore(USER_STORE_NAME);
                var index = store.index('_id');
                var result = index.getAll();
                return result;
            }).then(function (results) {
                for (var elem of results) {
                    var requestId = id;
                    var thisId = elem._id;

                    if (elem._id == id) {
                        console.log("found user with ID: " + id);
                        return callback(elem);
                    }
                }
                console.log("No user with id: " + id + " found");
            });
        }
}

/**
 * Retrieves the list of stories from the database. (Some references to the weather PWA are commented out. Need to be replaced)
 */
function displayCachedStories() {
    // If the indexed DB is set up
    if (dbPromise) {
        dbPromise.then(function (db) {
            console.log('fetching stories');
            // Get the story store
            var tx = db.transaction(STORY_STORE_NAME, 'readonly');
            var store = tx.objectStore(STORY_STORE_NAME);

            // Get stories by user id
            var index = store.index('user_id');

            // Only get stories with user_id of 0
            return index.getAll(/*IDBKeyRange.only(0)*/);
        }).then(function (resultList) {
            displayStories(resultList);
        });
    }
}

function clearCachedStories(callback){
    // If the indexed DB is set up
    if (dbPromise) {
        dbPromise.then(function (db) {
            console.log('fetching stories');
            // Get the story store
            var tx = db.transaction(STORY_STORE_NAME, 'readwrite');
            var store = tx.objectStore(STORY_STORE_NAME);

            store.clear();
        }).then(function(){
            console.log("Cleared cached stories");
            callback();
        });
    }
}


/**
 * Given story data, return the text field.
 * @param dataR data returned by the server
 */
function getStoryText(dataR){
    if(dataR.text == null && dataR.text === undefined)
        return "[NO TEXT FOR THIS STORY]";
    return dataR.text;
}