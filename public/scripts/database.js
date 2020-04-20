////////////////// DATABASE //////////////////
// the database receives from the server the following structure
/** class WeatherForecast{
 *  constructor (location, date, forecast, temperature, wind, precipitations) {
 *    this.location= location;
 *    this.date= date,
 *    this.forecast=forecast;
 *    this.temperature= temperature;
 *    this.wind= wind;
 *    this.precipitations= precipitations;
 *  }
 *}
 */
var dbPromise;

const STORIES_DB_NAME= 'db_stories_1';
const STORY_STORE_NAME= 'store_stories';

/**
 * it inits the database
 */
function initDatabase(){
    dbPromise = idb.openDb(STORIES_DB_NAME, 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
            var storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {keyPath: 'id', autoIncrement: true});
            storyDB.createIndex('location', 'location', {unique: false, multiEntry: true});
        }
    });
}
/**
 * saves a story to indexed db, or local storage if that fails
 * @param storyObject
 */
function storeCachedData(storyObject) {
    console.log('inserting: '+JSON.stringify(storyObject));
    // Attempt to use Indexed DB
    if (dbPromise) {
        // Try pushing to indexed db
        dbPromise.then(async db => {
            var tx = db.transaction(STORY_STORE_NAME, 'readwrite');
            var store = tx.objectStore(STORY_STORE_NAME);
            await store.put(storyObject);
            return tx.complete;
            // Then output success
        }).then(function () {
            console.log('added item to the store! '+ JSON.stringify(storyObject));
            // If there's an error. store the item in local storage
        }).catch(function (error) {
            localStorage.setItem(user, JSON.stringify(storyObject));
        });
    } // Otherwise us localstorage
    else localStorage.setItem(user, JSON.stringify(storyObject));
}


/**
 * it retrieves the list of stories from the database
 * @param city
 * @param date
 * @returns {*}
 */
function getCachedData() {
    if (dbPromise) {
        dbPromise.then(function (db) {
            console.log('fetching: '+city);
            var tx = db.transaction(STORY_STORE_NAME, 'readonly');
            var store = tx.objectStore(STORY_STORE_NAME);
            var stories = store.getAll();
            return stories;
        }).then(function (readingsList) {
            if (readingsList && readingsList.length>0){
                var max;
                for (var elem of readingsList)
                    if (!max || elem.date>max.date)
                        max= elem;
                if (max) addToResults(max);
            } else {
                const value = localStorage.getItem(city);
                if (value == null)
                    addToResults({city: city, date: date});
                else addToResults(value);
            }
        });
    } else {
        const value = localStorage.getItem(city);
        if (value == null)
            addToResults( {city: city, date: date});
        else addToResults(value);
    }
}


/**
 * Given story data, return the text
 * @param dataR data returned by the server
 */
function getStoryText(dataR){
    if(dataR.text == null && dataR.text === undefined)
        return "[NO TEXT FOR THIS STORY]";
    return dataR.text;
}

/**
 * given the server data, it returns the value of the field precipitations
 * @param dataR the data returned by the server
 * @returns {*}
 */
function getPrecipitations(dataR) {
    if (dataR.precipitations == null && dataR.precipitations === undefined)
        return "unavailable";
    return dataR.precipitations
}

/**
 * given the server data, it returns the value of the field wind
 * @param dataR the data returned by the server
 * @returns {*}
 */
function getWind(dataR) {
    if (dataR.wind == null && dataR.wind === undefined)
        return "unavailable";
    else return dataR.wind;
}

/**
 * given the server data, it returns the value of the field temperature
 * @param dataR the data returned by the server
 * @returns {*}
 */
function getTemperature(dataR) {
    if (dataR.temperature == null && dataR.temperature === undefined)
        return "unavailable";
    else return dataR.temperature;
}


/**
 * the server returns the forecast as a n integer. Here we find out the
 * string so to display it to the user
 * @param forecast
 * @returns {string}
 */
function getForecast(forecast) {
    if (forecast == null && forecast === undefined)
        return "unavailable";
    switch (forecast) {
        case CLOUDY:
            return 'Cloudy';
        case CLEAR:
            return 'Clear';
        case RAINY:
            return 'Rainy';
        case OVERCAST:
            return 'Overcast';
        case SNOWY:
            return 'Snowy';
    }
}
