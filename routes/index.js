var express = require('express');
var router = express.Router();

var userController = require('../controllers/users');
var storyController = require('../controllers/stories');
var initDB = require('../controllers/init');
initDB.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: ' PWA Project' });
});

/* GET Stories page */
router.get('/stories', function(req, res, next){
    res.render('stories', { title: "'s Stories" });
});

/* GET register page */
router.get('/register', function(req, res, next){
    res.render('register');

});

/* GET login page */
router.get('/login', function(req, res, next){
    res.render('login');
});

/* POST Story data */
router.post('/stories_list', storyController.insert);/*{
    const story = new Story(req.body.text);
    res.setHeader('Content-Type', 'application/json');
    storyController.insert;
    res.send(JSON.stringify(story));
});*/

router.post('/login', function(req, res, next){
    const user = new Story(req.body.username, req.body.password);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(user));
});

router.post('/register', function(req, res, next){
    const user = new Story(req.body.username, req.body.password);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(user));
});


function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * @param text
 */
class Story{
    constructor(text){
        this.text = text;
    }
}

class User{
    constructor(username, password){
        this.username = username;
        this.password = password;
    }
}

router.get('/home', function (req, res, next) {
res.render('home', { title: 'Dashboard' });
});

router.get('/likes', function (req, res, next) {
    res.render('likes', { title: 'Likes' });
});


module.exports = router;
