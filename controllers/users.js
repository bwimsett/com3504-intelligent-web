
var User = require('../models/users');


// Called from the route as 'user.getAge'
exports.findUser = function (req, res) {
    console.log('controller working');
    var userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        console.log('user searching.. is '+ userData.username);
        User.find({username: userData.username},
            'username password',
            function (err, users) {
                // If the data returned is invalid
                if (err) {
                    res.status(500).send('Invalid data!');
                }
                var user = null;
                // Otherwise return the age of the user
                if (users != null && users.length > 0) {
                    // Look at the first element in the list returned
                    user = users[0];
                    console.log('user exist - username.. '+ user.username);
                    // Define a user as JSON
                    if (user.password == userData.password){
                        console.log('password is correct');
                        console.log("Logged in user ID: "+user._id);
                        // Send the response
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(user));
                    }else{
                        res.status(500).send('Invalid data!');
                    }
                }else{
                    res.status(500).send('Invalid data!');
                }

            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}

exports.getAll = function (req, res) {
    User.find({}, function(err, result) {
        if(err){
            console.log(err);
            res.status(500).send('Invalid request');
        }
        res.json(result);
    });
}

/** Called from the route as user.insert
 * Adds a user to the mongodb database
 */
exports.insert = function (req, res) {
    var userData = req.body;
    if (userData == null) {
        // Display 403 error page if the data is empty
        res.status(403).send('No data sent!')
    }
    try {
        User.find({username: userData.username},function (err, users) {
            if (err) {
                res.status(500).send('Invalid data!');
            }
            if (users.length == 0){
                var user = new User({
                    _id: userData.username,
                    username: userData.username,
                    password: userData.password,
                });

                console.log('received: ' + user);

                // Save the user to the database
                user.save(function (err, results) {
                    console.log(results._id);
                    if (err)
                        res.status(500).send('Invalid data!');

                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(results));
                });
            }else{
                console.log("username already exist")
            }

        });
    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}

exports.insertId = function (req, res) {

    var userData = req.body;
    if (userData == null) {
        // Display 403 error page if the data is empty
        res.status(403).send('No data sent!')
    }

    try {

        var user = new User({
            _id: userData.username,
            username: userData.username,
            password: userData.password,
        });

        //console.log('received: ' + user);


        // Save the user to the database
        user.save(function (err, results) {
            if (err){
                res.status(500).send('Invalid data!');
            }

            //res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(results));
        });

    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}


