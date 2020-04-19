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

const FORECAST_DB_NAME= 'db_forecasts_1';
const FORECAST_STORE_NAME= 'store_forecasts';

/**
 * it inits the database
 */
function initDatabase(){
    dbPromise = idb.openDb(FORECAST_DB_NAME, 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(FORECAST_STORE_NAME)) {
            var forecastDB = upgradeDb.createObjectStore(FORECAST_STORE_NAME, {keyPath: 'id', autoIncrement: true});
            forecastDB.createIndex('location', 'location', {unique: false, multiEntry: true});
        }
    });
}
/**
 * it saves the forecasts for a city in localStorage
 * @param city
 * @param forecastObject
 */
function storeCachedData(city, forecastObject) {
    console.log('inserting: '+JSON.stringify(forecastObject));
    if (dbPromise) {
        dbPromise.then(async db => {
            var tx = db.transaction(FORECAST_STORE_NAME, 'readwrite');
            var store = tx.objectStore(FORECAST_STORE_NAME);
            await store.put(forecastObject);
            return tx.complete;
        }).then(function () {
            console.log('added item to the store! '+ JSON.stringify(forecastObject));
        }).catch(function (error) {
            localStorage.setItem(city, JSON.stringify(forecastObject));
        });
    }
    else localStorage.setItem(city, JSON.stringify(forecastObject));
}


/**
 * it retrieves the forecasts data for a city from the database
 * @param city
 * @param date
 * @returns {*}
 */
function getCachedData(city, date) {
    if (dbPromise) {
        dbPromise.then(function (db) {
            console.log('fetching: '+city);
            var tx = db.transaction(FORECAST_STORE_NAME, 'readonly');
            var store = tx.objectStore(FORECAST_STORE_NAME);
            var index = store.index('location');
            return index.getAll(IDBKeyRange.only(city));
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
