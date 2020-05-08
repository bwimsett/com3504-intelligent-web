var User = require('../models/users');

// Called from the route as 'user.getAge'
exports.getAge = function (req, res) {
    var userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        User.find({username: userData.username},
            'username',
            function (err, users) {
                // If the data returned is invalid
                if (err)
                    res.status(500).send('Invalid data!');
                var user = null;
                // Otherwise return the age of the user
                if (users.length > 0) {
                    // Look at the first element in the list returned
                    var firstElem = users[0];
                    // Define a user as JSON
                    user = {
                        username: firstElem.username, dob: firstElem.dob, age: firstElem.age
                    };
                }
                // Send the response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(user));
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
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
        var user = new User({
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
            res.send(JSON.stringify(user));
        });
    } catch (e) {
        // Display 500 error page if there was a problem with the request
        res.status(500).send('error ' + e);
    }
}
