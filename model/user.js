

var pool = require('./databaseConfig.js');
var config=require('../config.js'); 
var jwt=require('jsonwebtoken');


// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

const fs = require('fs') // to Delete invalid img files uploaded //

var userDB = {

    // Endpoint 30:  DELETE /user/:userid //
    deleteUser: (userid, callback) => {
        var sql = `SELECT profile_pic_url FROM user WHERE userid = ? ;DELETE FROM user WHERE userid = ?`
        // Query to user table to see if username and password is correct // 
        var dbQuery = pool.query(sql, [userid, userid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // first, we got to delete the image from upload folder //
                imgPath = result[0][0]["profile_pic_url"].replace('http://localhost:8081/public','./uploads')
                console.log("\n" + COLORS.green + `Image path in folder uploads is : ${imgPath}` + COLORS.reset)
                if (imgPath != "./uploads/profile_pic/default.jpg") {  // ensures that default img is not deleted //
                    fs.unlink(imgPath, (err) => { 
                        if (err) {
                            return callback(err, null)
                        }
                        console.log("\n" + COLORS.green + "File Removed in uploads folder!" + COLORS.reset)
                    })
                }
                console.log(result[1])
                if (result[1].affectedRows == 0) {
                    result = { "message" : "invalid userid. Cannot delete"}
                }
                return callback(null, result)
            }
        })
    },

    // Endpoint 21: POST /user/login //
    loginUser: (username,password, callback) => {
        
        var sql = 'select * from user where username=? and password=?';
        
        // Query to user table to see if username and password is correct // 
        var dbQuery = pool.query(sql, [username,password], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                var token="";
                if (result.length === 1) {  // valid username and password //
                    const payload = { userid: result[0].userid, role: result[0].role };
                    console.log(payload)
                    token = jwt.sign(payload, config.key,{expiresIn:86400}, { algorithm: "HS256" }) //expires in 24 hrs

                    return callback(null,token);
                }
                // if invalid username and password, we just return null, null. 
                return callback(null,null)
            }
        });
    },
        

    // Inserts a user which does not have dup name and email into the table. Then, obtain the userid and send it back to client //
    //  Endpoint 1: POST /users/    //
    insertUser: (userJSONValues, callback) => {
        var sql = "INSERT INTO user (username,email,contact,password,role,profile_pic_url) VALUES (?)"

        var userValues = [userJSONValues['username'], userJSONValues['email'], userJSONValues['contact'], userJSONValues['password'], userJSONValues['role'], userJSONValues['profile_pic_url']]

        // userValues = ['username', 'email', 'contact', 'password', 'role', 'profile_pic_url'] //

        // Query to user table and insert the values provided // 
        var dbQuery = pool.query(sql, [userValues, userValues[0], userValues[1]], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
                // No mySQL Error, proceed and find out the new ID of new user which should be the last id of table //  
            } else {
                console.log("\n" + COLORS.green + `Created New User! ID is: ` + result.insertId + COLORS.reset);
                console.table(result)
                return callback(null, result.insertId); // Returns userid of newly inserted user // 
            }
        });
    },

    // Gets all users in users table //
    //   Endpoint 2: GET /users/    //
    getAllUser: (callback) => {
        var sql = "SELECT userid,username,email,contact,role,profile_pic_url,created_at FROM user";
        var dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                console.table(result);
                return callback(null, result); // Returns all users found in user table //
            }
        });

    },

    // Gets user based on id // 
    //   Endpoint 3: POST /users/id/    // 
    getUser: (userid, callback) => {
        var sql = 'SELECT userid,username,email,contact,role,profile_pic_url,created_at FROM user WHERE userid = ?';
        var dbQuery = pool.query(sql, [userid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // Check if there are any users in selected userid. If results = [], tell client that there are no user for userid //
                if (Object.keys(result).length === 0) {
                    result = { "message": "no user for selected userid" }
                }
                console.table(result);

                return callback(null, result);
            }
        });
    },

    // Update user based on id // 
    //   Endpoint 4: PUT /users/:id/   // 
    updateUser: (userid, newUserValues, imgFile, callback) => {
        // First, we check whether there is already an existing profile pic of user that is not the default one //
        // If profile pic alr exists and user only updates info and does not provide img, we will retain the img //
        // If new profile pic is uploaded with new info, profile pic will also be updated //
        // For any errors such as invalid id and duplicate username / email, we will have to delete the img file if it has been uploaded //

        var sql = "SELECT profile_pic_url FROM user WHERE userid = ?";

        var dbQuery = pool.query(sql, [userid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {

                // For when user only updates info and does not change profile pic //
                // We want them to retain their original profile pic //
                if (imgFile == undefined && Object.keys(result).length != 0) {
                    newUserValues.profile_pic_url = result[0].profile_pic_url

                // Then, we check whether imgFile is defined // 
                // if defined, set newUserValues.profile_pic_url as img url //
                // This is for when user updates their profile pic, thus new one will be uploaded //
                } else if (imgFile != undefined) {
                    // imgUrl will be a static page to see the jpg e.g. http://localhost:8081/public/profile_pic/default.jpg //
                    newUserValues.profile_pic_url =  "http://localhost:8081/public/"  + imgFile.fieldname.replace('_url',"") + "/" + imgFile.filename 
                }
                sql = " UPDATE user SET ? WHERE userid = ? LIMIT 1"

                dbQuery = pool.query(sql, [newUserValues, userid], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
                    if (err) {
                        // One problem Currently faced is when user uploads a same unique email / username, making it dup error //
                        // The img file however is updated //
                        // To solve this, I have implemented a tmp folder in profile_pic where pictures will be first uploaded thr //
                        // If user update is valid, i will move file to profile_pic from tmp. If invalid, delete in tmp //
                        
                        if (imgFile != undefined) { // Deletes the img file uploaded if dup values for username / email //
                            // To delete the uploaded image in './uploads/profile_pic/tmp' //
                            fs.unlink(imgFile.path, (err) => { 
                                if (err) {
                                    return callback(err, null)
                                }
                                console.log("\n" + COLORS.green + "File Removed as invalid duplicate username / email!" + COLORS.reset)
                            })
                        }
                        
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err, null);
                    } else {
                        if (result.changedRows === 0 && result.affectedRows === 0) {  // For when user updates a userid that does not exists in user 
                            result = { "message": "no user for selected userid, cannot update." }
                            
                            if (imgFile != undefined) { // Deletes the img file uploaded if userid is invalid in uploads folder //
                            // To delete the uploaded image in './uploads/profile_pic/tmp' //
                                fs.unlink(imgFile.path, (err) => { 
                                    if (err) {
                                        return callback(err, null)
                                    }
                                    console.log("\n" + COLORS.green + "File Removed as invalid user id!" + COLORS.reset)
                                })
                            }
                            return callback(null, result)
                        }
                        console.table(result);
                        if (imgFile != undefined) {
                            // Now, if update is valid, we will then move this new img from tmp to the profile_pic folder //
                            newImgPath = "uploads\\profile_pic\\" + imgFile.filename
                            fs.rename(imgFile.path, newImgPath, (err) => {
                                if (err) {
                                    return callback(err, null)
                                }
                                console.log("\n" + COLORS.green + "Files successfully moved to profile_pic folder!" + COLORS.reset)
                            })
                        }
                        return callback(null, result);
                    }
                })
            }
        });
    } ,
} // end of user object

module.exports = userDB

