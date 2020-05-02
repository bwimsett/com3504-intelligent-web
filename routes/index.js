var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: ' PWA Project' });
});

/* GET Stories page */
router.get('/stories', function(req, res, next){
   res.render('stories');
});

/* POST Story data */
router.post('/stories_list', function(req, res, next){
    const story = new Story(req.body.text);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(story));
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

router.get('/home', function (req, res, next) {
res.render('home', { title: 'Dashboard' });
});

router.get('/likes', function (req, res, next) {
    res.render('likes', { title: 'Likes' });
});


module.exports = router;
