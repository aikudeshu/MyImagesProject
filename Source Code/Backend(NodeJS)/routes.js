var express = require('express');
var router = express.Router();              // get an instance of the express Router

var fs = require('fs')
var path = require('path')

const fileUpload = require('express-fileupload');
let nodemailer = require('nodemailer');
var mysql = require('mysql');
let transporter;
var connection = mysql.createConnection({
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b8f0b81ce172fa',
    password: 'eeceb739',
    database: 'heroku_2e163d5ed1b093d',
});
/*var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'herokulocal',
});*/



connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

function handleDisconnect(conn) {
    conn.on('error', function (err) {
        if(!err.fatal){
            return;
        }

        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }
        console.log('connected as id ' + connection.threadId);
        console.log('Re-connecting lost connection: ' + err.stack);
        connection = mysql.createConnection({
            host: 'us-cdbr-iron-east-04.cleardb.net',
            user: 'b8f0b81ce172fa',
            password: 'eeceb739',
            database: 'heroku_2e163d5ed1b093d',
        });;
        handleDisconnect(connection);
        connection.connect();
    })
}

handleDisconnect(connection);

transporter = nodemailer.createTransport({
    service: 'Gmail',
    /*auth: {
        user: "itbeckham7@gmail.com",
        pass: ",ITBH.4774645gmail!@#$%^&/"
    },*/
    auth: {
        user: "dev@bitblaster.io",
        pass: "DevBitBlasterIO"
    }
});

module.exports = function (router) {

    // ROUTES FOR OUR API
    // =============================================================================
    //app.use('/bower_components', express.static(path.join(__dirname + '/../bower_components'))); //bower components status

    // middleware to use for all requests
    router.use(function (req, res, next) {
        // do logging
        console.log('Something is happening.');

        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        next(); // make sure we go to the next routes and don't stop here
    });

    router.use(fileUpload({limits: { fileSize: 10 * 1024 * 1024 }}));
    router.post('/upload', function (req, res) {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let sampleFile = req.files.sampleFile;
        let sampleFileName = req.files.sampleFile.name;
        console.log(req.body.param);
        console.log(JSON.parse(req.body.param).dateoftaken);
        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(__dirname + "/uploads/" + sampleFileName, function(err) {
            if (err)
                return res.status(500).send(err);
            else{
                connection.query("SELECT * FROM user_table WHERE `id` = '" + JSON.parse(req.body.param).user_id + "'", function (error, results, fields) {
                    if (error) res.json({message : "user authentication error" });
                    else {
                        //console.log(JSON.stringify(results));
                        if (results.length > 0) {
                            connection.query("INSERT INTO picture_table SET ?", JSON.parse(req.body.param), function (error, results, fields) {
                                if (error) res.json({message : "picture add error" });
                                else {
                                    connection.query("SELECT * FROM picture_table WHERE `user_id` = '" + JSON.parse(req.body.param).user_id + "'", function (error, results, fields) {
                                        if (error) res.json({message : "get picture error" });
                                        else res.send(results);
                                    });
                                }
                            });
                        }else{
                            res.json({message : "unexisted"});
                        }
                    }
                })
            }
        });
    });




    router.get('/api/:email/:random_num', function (req, res) {
        console.log(req.params.email);
        var mailOptions = {
            from: "itbeckham7@gmail.com", // sender address
            to: req.params.email, // list of receivers
            //to: "zhezhu.piao@yandex.com", // list of receivers
            subject: 'Email Verification', // Subject line
            text: 'BitBlaster ✔', // plaintext body
            html: '<b>Verification : ' + req.params.random_num + '</b>' // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
                console.log('message has been sent successfully');
                res.json({message : "success", data : req.params.random_num});
            }
        });

    });

    router.get("/:imagename", function (req,res) {
        console.log(req.params.imagename);
        try{
            fs.exists(express.static(__dirname + "/uploads/" + req.params.imagename), function (exists) {
                res.sendFile(express.static(__dirname + "/uploads/" + req.params.imagename));
            })
        } catch (error) {
            res.json({"error path": "error"})
        }

    })

    router.get('/login/:email/:password', function (req, res) {
        console.log(req.params);

        try{
            connection.query("SELECT * FROM user_table WHERE `email` = '" + req.params.email + "' and `password` = '" + req.params.password + "'", function (error, results, fields) {
                if (error) res.json({message : "login error" });
                else res.json({message: "success",userID:results[0].id});
            });
        }catch (e) {

        }

    })

    router.post('/signup', function (req, res) {
        console.log(req.body.email);
        connection.query("SELECT * FROM user_table WHERE `email` = '" + req.body.email + "' and `password` = '" + req.body.password + "'", function (error, results, fields) {
            if (error) res.json({message : JSON.stringify(error) });
            else {
                if (results.length > 0) res.json({message: "existed", userID:results[0].id});
                else {
                    connection.query("INSERT INTO user_table SET ?", req.body, function (error, results, fields) {
                        console.log(JSON.stringify(results));
                        if (error) res.json({message : "user insert error" });
                        else res.json({message: "success", userID:results.insertId});
                    });
                }
            }
        })
    })

    router.post('/picture_add', function (req, res) {
        console.log(req.body);
        connection.query("SELECT * FROM user_table WHERE `id` = '" + req.body.user_id + "'", function (error, results, fields) {
            if (error) res.json({message : "user authentication error" });
            else {
                if (results.length > 0) {
                    connection.query("INSERT INTO picture_table SET ?", req.body, function (error, results, fields) {
                        if (error) res.json({message : "picture add error" });
                        else {
                            connection.query("SELECT * FROM picture_table WHERE `user_id` = '" + req.params.user_id + "'", function (error, results, fields) {
                                if (error) res.json({message : "get picture error" });
                                else res.send(results);
                            });
                        }
                    });
                }else{
                    res.json({message : "unexisted"});
                }
            }
        })
    })

    router.get('/get_picture/:user_id', function (req, res) {
        console.log(req.params.user_id);
        connection.query("SELECT * FROM user_table WHERE `id` = '" + req.params.user_id + "'", function (error, results, fields) {
            if (error) res.json({message : "user authentication error" });
            else {
                if (results.length > 0) {
                    connection.query("SELECT * FROM picture_table WHERE `user_id` = '" + req.params.user_id + "'", function (error, results, fields) {
                        if (error) res.json({message : "get picture error" });
                        else res.send(results);
                    });
                }else{
                    res.json({message: "unexisted"});
                }
            }
        })
    })

    router.get('/set_like/:user_id/:id/:like', function (req, res) {
        console.log(req.params.like);
        connection.query("SELECT * FROM user_table WHERE `id` = '" + req.params.user_id + "'", function (error, results, fields) {
            if (error) res.json({message : "user authentication error" });
            else {
                if (results.length > 0) {
                    connection.query("UPDATE picture_table SET `flaglike` = ? WHERE `user_id` = '" + req.params.user_id + "' and `id` = '" + req.params.id + "'", [req.params.like, req.params.user_id, req.params.id], function(err, result) {
                        if (error) res.json({message : "picture updating error" });
                        else {
                            connection.query("SELECT * FROM picture_table WHERE `user_id` = '" + req.params.user_id + "'", function (error, results, fields) {
                                if (error) res.json({message : "get picture error" });
                                else res.send(results);
                            });
                        }
                    })
                }else{
                    res.json({message: "unexisted"});
                }
            }
        })
    })

    router.get('/delete_picture/:user_id/:id', function (req, res) {
        console.log(req.params.id);
        connection.query("SELECT * FROM user_table WHERE `id` = '" + req.params.user_id + "'", function (error, results, fields) {
            if (error) res.json({message : "user authentication error" });
            else {
                if (results.length > 0) {
                    connection.query("DELETE FROM picture_table WHERE id = ?", req.params.id, function(err, result) {
                        if (error) res.json({message : "picture deleting error" });
                        else {
                            connection.query("SELECT * FROM picture_table WHERE `user_id` = '" + req.params.user_id + "'", function (error, results, fields) {
                                if (error) res.json({message : "get picture error" });
                                else res.send(results);
                            });
                        }
                    })
                }else{
                    res.json({message: "unexisted"});
                }
            }
        })
    })

    router.get('*', function (req,res) {
        res.json({message : "URL not existed!"});
    });
    router.post('*', function (req, res) {
        res.json({message : "URL not existed!"});
    });


};