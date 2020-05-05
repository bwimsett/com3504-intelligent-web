////////////////// DATABASE //////////////////
// the database receives the following structure from the server
/**
class Story{
    constructor(text){
        this.text = text;
    }
}
var dbPromise;
 */

const STORIES_DB_NAME= 'db_stories_1';
const STORY_STORE_NAME= 'store_stories';
const USER_STORE_NAME= 'store_users';

/**
 * Initialise the database.
 */
function initDatabase(){
    dbPromise = idb.openDb(STORIES_DB_NAME, 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
            var storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {keyPath: 'id', autoIncrement: true});
            storyDB.createIndex('text', 'text', {unique: false, multiEntry: true});
        }
        if (!upgradeDb.objectStoreNames.contains(USER_STORE_NAME)){
            var userDB = upgradeDb.createObjectStore(USER_STORE_NAME, {keyPath: 'username'});
        }
    });
}


/**
 * saves a single story to indexed db, or local storage if that fails
 * @param storyObject
 */
function cacheData(storyObject) {
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
            console.log('added item to the store! '+ JSON.stringify(storyObject));
            // If there's an error. store the item in local storage
        }).catch(function () {
            localStorage.setItem(user, JSON.stringify(storyObject));
            console.log("added to local storage")
        });
    } // Otherwise us localstorage
    else localStorage.setItem(user, JSON.stringify(storyObject));
}

function addUserData(user){
    if (dbPromise) {
        dbPromise.then(async db  => {

            console.log('inserting: '+JSON.stringify(user));
            console.log("adding user to indexdn store")
            var tx = db.transaction(USER_STORE_NAME, 'readwrite');
            var store = tx.objectStore(USER_STORE_NAME);
            await store.put(user); // necessary as it returns a promise
            return tx.complete;
        }).then(function () {
            alert("register successful")
            console.log("register success");
        });
    }
}

function findUser(userObj){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(USER_STORE_NAME, 'readonly');
            var store = tx.objectStore(USER_STORE_NAME);
            return store.get(userObj.username);
        }).then(function (foundObject) {
            if (foundObject && (foundObject.username==userObj.username &&
                foundObject.password==userObj.password)){

                console.log("login success");
                localStorage.setItem('currentUser',foundObject.username);
                window.location.reload();

            } else {
                alert("login or password incorrect")
            }
        });
    }
}

/**
 * Retrieves the list of stories from the database. (Some references to the weather PWA are commented out. Need to be replaced)
 */
function getCachedData() {
    if (dbPromise) {
        dbPromise.then(function (db) {
            console.log('fetching: '+ stories);
            var tx = db.transaction(STORY_STORE_NAME, 'readonly');
            var store = tx.objectStore(STORY_STORE_NAME);
            var stories = store.getAll();
            var index = store.index('text');
            return stories;
        }).then(function (readingsList) {
            if (readingsList && readingsList.length>0){
                var max;
                for (var elem of readingsList)
                    if (!max /*|| elem.date>max.date*/)
                        max= elem;
                if (max) addToResultsSection(max);
            } else {
                const value = localStorage.getItem(/*city*/);
                if (value == null)
                    addToResultsSection({/*city: city, date: date*/});
                else addToResultsSection(value);
            }
        });
    } else {
        const value = localStorage.getItem(/*city*/);
        if (value == null)
            addToResultsSection( {/*city: city, date: date*/});
        else addToResultsSection(value);
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