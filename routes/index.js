var express = require('express');
var router = express.Router();

var userController = require('../controllers/users');
var storyController = require('../controllers/stories');
var likeController = require('../controllers/likes');
var initDB = require('../controllers/init');
initDB.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: ' PWA Project' });
});

/* GET register page */
router.get('/register', function(req, res, next){
    res.render('register');
});

/* GET login page */
router.get('/login', function(req, res, next){
    res.render('login');
});

/* GET login page */
router.get('/login', function(req, res, next){
    res.render('login');
});

router.get('/profile/:id', function(req, res, next){
    var username = req.params.id;

    res.render('profile', {username: username});
});

router.post('/stories', storyController.getAll);

/* POST Story data */
router.post('/stories_list', storyController.insert);

/* POST Likes data */
router.post('/likes', likeController.insert);

router.post('/many_likes', likeController.insertMany);

router.post('/retrieve_likes', likeController.getAll);

/* POST all the user data to associate with stories */
router.post('/users_list', userController.getAll);

router.post('/register', userController.insert);

router.post('/login', userController.findUser);

router.post('/addStoryId', storyController.insertId);

router.post('/adduser', userController.insertId);

router.get('/home', function (req, res, next) {
    res.render('stories', { title: 'Dashboard' });
});

router.get('/likes', function (req, res, next) {
    res.render('likes', { title: 'Likes' });
});

module.exports = router;
