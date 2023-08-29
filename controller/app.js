
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // install by npm install express multer -- save //
var path = require('path')

var app = express();

// Importing objects from models //
var user = require('../model/user.js');
var flight = require('../model/flight.js');
var airport = require('../model/airport.js');
var bookings = require('../model/bookings.js');
var product_listing = require('../model/product_Listing.js');
var promotions = require('../model/promotion.js');
var booking_cart = require('../model/booking_cart.js')


// Initialise Middleware // 
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);  //attach body-parser middleware
app.use(bodyParser.json()); //parse json data

// This middleware checks the req body and ensures that it has the correct keys based on the parameters passed through it //
var checkReqBodyMiddleware = require('../middlewares/checkReqBodyMiddleware.js');

// This middleware will verify whether user is logged in //
var isLoggedIn = require('../middlewares/IsloggedInMiddleware.js')

// TO INSTALL mutler, Run the command npm install express multer -- save //
// Resource used https://javascript.plainenglish.io/upload-images-in-your-node-app-e05d0423fd4a //


// Allows to browse images on browser e.g. http://localhost:8081/public/profile_pic/default.jpg //
// Resource : https://expressjs.com/en/starter/static-files.html //
app.use('/public', express.static('uploads')) // enables front end to access uploads folder for images //
app.use(express.static(path.resolve("./public/"))) // serving the entire public folder as our front end //

// Defining image storages for multer //
var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (file.fieldname === "profile_pic_url") {
            callback(null, './uploads/profile_pic/tmp') // profile pics will go to this file location //
        }
        else if (file.fieldname === "product_pic") {
            callback(null, './uploads/product_pic/tmp') // product pics for flights will go to this file location //
        }
    },
    filename: (req, file, callback) => {
        if (file.fieldname === "profile_pic_url") { // for users profile pic //
            callback(null, `user_${req.params.id}` + path.extname(file.originalname)) // filename to be user_{id}.jpg/png where id = user id //
        }
        else if (file.fieldname === "product_pic") { // for flights product pic //
            callback(null, `flight_${req.params.flightid}` + path.extname(file.originalname)) // we want to name our filename as flight_{id}.jpg/png where id = flight id //
        }
    }
});

// Only accepts jpg / png  //
const fileFilter = (req, file, callback) => {
    file_extension = path.extname(file.originalname) // Extracts the file extension from the image file //
    file_size = parseInt(req.headers["content-length"])  // Extracts the file size of the image //
    if ((file_extension === '.jpg' || file_extension === '.png') && file_size <= 1045504) { // Ensure that only jpg and png and <= 1mb//
        callback(null, true)
    } else {
        req.file = 'invalid file'  // to help for further validation later esp for PUT /users/ as img is optional //
        callback(null, false)
    }
}

// we will be using upload.single('keyname') for uploading of images to uploads folder //
var upload = multer({
    storage: storage,
    fileFilter: fileFilter             // Controls such that only jpg and png are accepted //
});


// Start of all endpoints for sp_air api //

//  Endpoint 1: POST /users/    //
//     Inserting new user      //
app.post('/users/', checkReqBodyMiddleware(['username', 'email', 'contact', 'password', 'role', 'profile_pic_url']), (req, res) => {
    try {
        var userJSONValues = req.body
        userJSONValues.profile_pic_url = 'http://localhost:8081/public/profile_pic/default.jpg' // For default //

        user.insertUser(userJSONValues, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(422).send('Unprocessable Entity') // For duplicate email or username (change to 200 to allow user to know)// 

                }
                res.status(500).send(err)
            } else {
                result = { "userid": result }   // Formats user id res //
                return res.status(201).send(result) // Created User and send userid to client //
            }
        });

    } catch (err) { // Final try catch for any further errors //
        return res.status(500).send("Internal Server Error")
    }
    // Sample Request Body //
    // {
    //     "username": "Terry Tan",
    //     "email": "TerryTan@gmail.com",   
    //     "contact": "92134567",
    //     "password": "abc123456",
    //     "role": "Customer",
    //     "profile_pic_url": "https://www.abc.com/terry.jpg"  (I will actually ignore the pic uploaded) 
    // }
});

//   Endpoint 2: GET /users/    //
//       Get all Users         //
app.get('/users/', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken["role"] === "Admin") {
            user.getAllUser((err, result) => {
                if (err) {
                    return res.status(500).send("Internal Server Error")
                } else {
                    if (Object.keys(result).length === 0) { // For when no user cannot be found //
                        result = { "message": "No users found" }
                    }
                    return res.status(200).send(result) // Successfully retrieved all users and send it to client //
                }
            });
        } else {   // for unauthorised users //
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//   Endpoint 3: POST /users/id/    // 
//  Gets Selected user based on id. We will first decode token using isLoggedIn middleware to get userid //
app.post('/users/id/', isLoggedIn, (req, res) => {
    try {
        var userid = req.decodedToken.userid
        user.getUser(userid, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result) // Successfully retrieved selected userid based on params and send it to client //
            }
        });
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//   Endpoint 4: PUT /users/:id/   // 
// Updates a selected User row based on id //
// Have to use form-data as there is optional image uploading //
app.put('/users/:id/', isLoggedIn, upload.single('profile_pic_url'), (req, res) => {   // isLoggedIn middleware to ensure that only authenticated users can update their details //
    try {
        if (req.file != 'invalid file') {
            console.log(req.file) // Recevied img/png File. if undefined = no file received //

            var checkValues = ['username', 'email', 'contact', 'role']
            // check values in req.body //
            for (let i = 0; i < checkValues.length; i++) { // this is from checkReqBodyMiddleware.js // 
                const key = checkValues[i];
                if (!Object.keys(req.body).includes(key)) { // Checks whether the request body includes the required keys as specified in list param //
                    return res.status(400).send('Bad Request') // if does not have all required keys, reject and return bad request //

                }
            }

            var userid = req.params.id;
            newUserValues = req.body;

            user.updateUser(userid, newUserValues, req.file, (err, result) => {
                if (err) {
                    if (err.code == 'ER_DUP_ENTRY') {  // for duplicate username / email //
                        return res.status(422).send('Unprocessable Entity')
                    }
                    return res.status(500).send("Internal Server Error")
                } else {
                    if (Object.keys(result).length === 1) { // For when user cannot be found, thus no updates were performed //
                        return res.status(200).send(result)
                    }
                    return res.status(204).send('No Content') // Successfully updated user //
                }
            });
        } else {   //  invalid file / no file   //
            return res.status(200).send({ "message": "Invalid file! file can only be .jpg or .png with a file size of 1Mb and below!" })
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
    // Sample Request Body //
    // Req Body > form data //
    // 
    //     "username": "Terry Tan",
    //     "email": "changeEmail@.com",    // e.g. Changed value //
    //     "contact": "92134567",
    //     "password": "abc123456",
    //     "role": "Customer",
    //     "profile_pic_url": "https://www.abc.com/terry.jpg"  (This is optional in forms. User can choose not to update profile_pic_url by not providing a file) 
    // 
});

//   Endpoint 5: POST /airport    // 
//       Insert new airport       //  
app.post('/airport', isLoggedIn, checkReqBodyMiddleware(['name', 'country', 'coordinate', 'description']), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {  // ensures that only admin can create new airports //
            // coordinate key required for laditude and longitude for further calculations later for transfer flights //
            var reqValues = req.body
            airport.insertAirport(reqValues, (err, result) => {
                if (err) {
                    if (err.code == 'ER_DUP_ENTRY') {
                        return res.status(422).send('Unprocessable Entity')
                    }
                    res.status(500).send(err)
                } else {
                    if (Object.keys(result).length === 1) {         // This is for duplicate coordinates //
                        return res.status(200).send(result)
                    }
                    return res.status(204).send('No Content') // Successfully inserted airport //
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }

    // Sample Request Body // 
    // {
    //     "name": "Auckland Airport",
    //     "country": "New Zealand",
    //     "coordinate" : {"x" : -37.0082, "y": 174.7850},
    //     "description": "largest and busiest airport in New Zealand"
    // }
});

//   Endpoint 6: GET /airport   // 
//      Gets all airports       //
app.get('/airport', (req, res) => {   // this one don't need admin priviledges //
    try {
        airport.getAllAirport((err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                if (Object.keys(result).length === 0) { // For when no airport can be found //
                    result = { "message": "No airport found" }
                }
                return res.status(200).send(result) // Successfully got all airport. Send it to client //
            }
        });
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//   Endpoint 7: POST /flight/    // 
//       Insert a flight          // 
app.post('/flight/', isLoggedIn, checkReqBodyMiddleware(['flightCode', 'aircraft', 'originAirport', 'destinationAirport', 'embarkDate', 'travelTime', 'price']),
    (req, res) => {
        try {
            if (req.decodedToken.role === 'Admin') {  // ensures that only admin can create new flights//
                var newFlight = req.body

                flight.insertFlight(newFlight, (err, result) => {
                    if (err) {
                        return res.status(500).send(err)

                    } else {
                        result = { "flightid": result } // Formatting of res for flight id //
                        return res.status(201).send(result)    // Successfully created new flight. Sends flightid to client // 
                    }
                });
            } else {
                return res.status(401).send("UNAUTHORISED")
            }
        } catch (err) {
            return res.status(500).send("Internal Server Error")
        }
        // Sample Request Body //
        // {
        //     "flightCode": "SP210",
        //     "aircraft": "BOEING 450",
        //     "originAirport": 1,
        //     "destinationAirport": 4,
        //     "embarkDate": "2022/12/20 08:20",
        //     "travelTime": "7 hours 50 mins",
        //     "price":855.50
        // }
    });

//   Endpoint 8: GET /flightDirect/:originAirportId/:destinationAirportId/:embarkDate // 
//  Retrieves flight info of one way flights travelling from origin airport to destination airport.  //
app.get('/flightDirect/:originAirportId/:destinationAirportId/:embarkDate', (req, res) => {
    try {
        var airportIDs = [req.params.originAirportId, req.params.destinationAirportId]
        var embarkDate = req.params.embarkDate

        flight.getDirectFlights(airportIDs, embarkDate, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)        // Sends results of all flights according to params
            }
        });
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//  Endpoint 9: POST /booking/:userid/:flightid   //
// Adds a new booking for a flight. A flight can have many bookings by a user. //
app.post('/booking/:userid/:flightid', isLoggedIn, checkReqBodyMiddleware(['name', 'passport', 'nationality', 'age', 'promotionid']), (req, res) => {
    try {
        var userid_flightid = [req.params.userid, req.params.flightid] // Stores userid and flight id in a list //
        bookingValues = req.body

        bookings.bookFlight(userid_flightid, bookingValues, (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error")
            } else {
                if (Object.keys(result).length === 1) {   // For when selected promotion id is not valid for flight OR userid not valid OR flightid not valid //
                    return res.status(200).send(result)
                }
                // Formatting of result //
                result = { "bookingid": result }
                return res.status(201).send(result)  // Sends back booking id to client //
            }
        });
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }

    // Sample Request Body //
    // {
    //     "name": "John Tan",
    //     "passport": "E1234555Z",
    //     "nationality": "Singaporean",
    //     "age":20
    //     "promotionid" : 1  OR NULL (null means that no promotion selected for flight)
    // }
});

//  Endpoint 10: DELETE  /flight/:id   //
// Deletes flight and its associated bookings // 
app.delete('/flight/:id/', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // ensures that only admin can delete flight //
            flightid = req.params.id
            flight.deleteFlight(flightid, (err, result) => {
                if (err) {
                    return res.status(500).send("Internal Server Error")
                } else {
                    if (Object.keys(result).length === 1) {  // For when flightid is not valid //
                        return res.status(200).send(result)
                    }
                    return res.status(200).send(result)  // Sends back booking id to client //
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//  Endpoint 11: GET /bestTransfer/flight/:originAirportId/:destinationAirportId/  //
//  Retrieves data of all flights from origin airport to destination airport with 1 best flight transfer  //
app.get('/bestTransfer/flight/:originAirportId/:destinationAirportId/:embarkDate', (req, res) => {
    try {
        var embarkDate = req.params.embarkDate
        var airportIDs = [req.params.originAirportId, req.params.destinationAirportId]
        flight.bestTransferFlight(airportIDs, embarkDate, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                if (Object.keys(result).length === 1) {   // For when there are no airports given the destination and origin airports from params //
                    return res.status(200).send(result)
                }
                return res.status(201).send(result) // Sends back the new transfer row to client //
            }
        })
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// Below are Bonus Requirements endpoints//
// For bonus requirments, I have done both, promotions for flights and product listing with image upload and storage //
// Bonus Requirement: Promotions for flights: Endpoints 12 to 16 // 

// End point 12 : GET /promotions/flight/:flightid/ //
// This endpoint retreives all promotions for a given flight //
app.get('/promotions/flight/:flightid/', (req, res) => {
    try {
        flightId = req.params.flightid
        promotions.getPromotions(flightId, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        });
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// End point 13 : POST /promotions/ //
// This endpoint inserts a new promotion  //
app.post('/promotions/', isLoggedIn, checkReqBodyMiddleware(['discount', 'promotional_period_start', 'promotional_period_end']), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // ensures that only admin can post promotions //
            promotionValues = req.body
            promotions.insertPromotion(promotionValues, (err, result) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    if (Object.keys(result).length === 1) { // For when invalid promotional start and end dates //
                        return res.status(200).send(result)
                    }
                    result = { "promotionid": result }
                    return res.status(201).send(result)   // Send promotionid back to client //
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
    // Sample Request Body //
    // {
    //     "discount" : 20,
    //     "promotional_period_start" : "2022/05/22 08:20:00",
    //     "promotional_period_end": "2022/08/22 08:20:00"
    // }
});

// End point 14 : POST  /promotions/:promotionid/flight/:flightid/  //
// This is to reference a flight to a promotion. Many flights can have 1 promotion //
app.post('/promotions/:promotionid/flight/:flightid/', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // ensures that only admin can post promotions //
            promotionValues = [req.params.flightid, req.params.promotionid]  // ['flightid','promotionid'] //
            promotions.insertFlight_Reference_Promotion(promotionValues, (err, result) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    if (Object.keys(result).length === 1) { // invalid flight or promotion id or promotional_period_end > embarkDate of flight //
                        return res.status(200).send(result)
                    }
                    result = { "flight_promotion_id": result }
                    return res.status(201).send(result)   // Send promotionid back to client //
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }

    // No Sample Req Body //
    // This post request will only make use of params values //
});

// End point 15 : DELETE /promotions/:id/ //
// This endpoint deletes a promotion given its id //
app.delete('/promotions/:id/', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // ensures that only admin can delete promotions //
            promotionid = req.params.id
            promotions.deletePromotion(promotionid, (err, result) => {
                if (err) {
                    return res.status(500).send("Internal Server Error")
                } else {
                    if (Object.keys(result).length === 1) {  // For when there is no promotion for selected promotionid //
                        return res.status(200).send(result)
                    }

                    return res.status(200).send(result)  // Sends back message to client //
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// End point 16 : DELETE /promotions/:promotionid/flight/:flightid/ //
// This endpoint deletes a promotion for a flight given the flight id and promotion id //
app.delete('/promotions/:promotionid/flight/:flightid/', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // ensures that only admin can delete flight promotions //
            promotionid = req.params.promotionid
            flightid = req.params.flightid
            promotions.deletePromotionReferenceFlight(promotionid, flightid, (err, result) => {
                if (err) {
                    return res.status(500).send("Internal Server Error")
                } else {
                    if (Object.keys(result).length === 1) {  // For invalid promotion id or flight id //
                        return res.status(200).send(result)
                    }
                    return res.status(200).send(result)  // Sends back message to client //
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});


// Below is the other bonus requirement that uploads images to server for product listing: Endpoints 17 to 20 //
// We will be using Multer. Mutler is a Node.js middleware for handling multipart/form-data //
// Thus, for image uploading, we will have to use multipart/form-data via in postman: body > form-data //

// End point 17: GET /product_listing/ //
// Gets all products in product_listing  //
app.get('/product_listing/', (req, res) => {
    try {
        product_listing.getProduct((err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        });
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});


// End point 18: POST /product_listing/pic/:flightid //
// POST a product with jpg / png //
app.post('/product_listing/pic/:flightid', isLoggedIn, upload.single('product_pic'), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {
            if (req.file != 'invalid file') {
                console.log(req.file) // Recevied img/png File //
                flightid = req.params.flightid
                product_listing.insertProduct(flightid, req.file, (err, result) => {
                    if (err) {
                        return res.status(500).send(result)
                    } else {
                        if (Object.keys(result).length === 1) { // For invalid flight id //
                            return res.status(200).send(result)
                        }
                        return res.status(204).send("No Content")
                    }
                });
            } else if (req.file == 'invalid file') {   //  invalid file //
                return res.status(200).send({ "message": "Invalid file! file can only be .jpg or .png with a file size of 1Mb and below!" })
            } else {  // undefined file, file not given as it is optional //
                return res.status(204).send("No Content")
            }
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
    // Sample Request //
    // Req Body > form data //
    // key: product_pic     Values: 10202.jpg
});

// End point 19: Put /product_listing/pic/:flightid //
// update a product with jpg / png //
app.put('/product_listing/pic/:flightid', isLoggedIn, upload.single('product_pic'), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {
            if (req.file != 'invalid file') {
                console.log(req.file) // Recevied img/png File //
                flightid = req.params.flightid
                product_listing.updateProduct(flightid, req.file, (err, result) => {
                    if (err) {
                        return res.status(500).send("Internal Server Error")
                    } else {
                        if (Object.keys(result).length === 1) { // For invalid flight id //
                            return res.status(200).send(result)
                        }
                        return res.status(204).send("No Content")
                    }
                });
            } else if (req.file == 'invalid file') {   //  invalid file //
                return res.status(200).send({ "message": "Invalid file! file can only be .jpg or .png with a file size of 1Mb and below!" })
            } else {  // undefined file, file not given as it is optional //
                return res.status(204).send("No Content")
            }
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
    // Sample Request //
    // Req Body > form data //
    // key: product_pic     Values: 10202.jpg
});

// End point 20: DELETE /product_listing/:productid //
// Deletes a product from product_listing based on productid provided//
app.delete('/product_listing/:productid', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {
            productid = req.params.productid
            product_listing.deleteProduct(productid, (err, result) => {
                if (err) {
                    return res.status(500).send("Internal Server Error")
                } else {
                    if (Object.keys(result).length === 1) {  // For invalid productid //
                        return res.status(200).send(result)
                    }
                    return res.status(200).send(result)
                }
            });
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// Below is the new Endpoints for CA2 //

// End point 21: POST /user/login //
// This endpoint will be used for userlogin and generation of json web token //
app.post('/login', checkReqBodyMiddleware(['username', 'password']), (req, res) => {
    try {
        var username = req.body.username;
        var password = req.body.password;

        user.loginUser(username, password, (err, token) => {
            if (err) {
                return res.status(500).send("Internal Server Error")

            } else {
                return res.status(200).send({ "token": token });
            }
        });

    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// End point 22: GET /flight/:flightid //
// This endpoint will retrieve all information of flight based on its flightid. It will also retrieve any images
// attatched to the flight in the product_listing table //
app.get('/flight/:flightid', (req, res) => {
    try {

        var flightid = req.params.flightid

        flight.getFlightDetails(flightid, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        });

    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// End point 23: GET /flight/  //
// This endpoint will retrieve all information of all flights. It will also retrieve any images
// attatched to the flight in the product_listing table //
app.get('/flight/', (req, res) => {
    try {
        flight.getALLFlightDetails((err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        });

    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//   End point 24: GET /allPromotions/  //
// this endpoint will retrieve all promotions in db //
app.get('/allPromotions', (req, res) => {
    try {
        promotions.getALLPromotion((err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        });

    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//   End point 25: GET /flight_promotions/  //
// this endpoint will retrieve all promotions in db for all flights //
app.get('/flight_promotions', (req, res) => {
    try {
        promotions.getALLFlightPromotion((err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        });

    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

//   End point 26: PUT /airport/:airportid  //
// This endpoint updates values of an airport given the airportid and new values //
app.put('/airport/:airportid', isLoggedIn, checkReqBodyMiddleware(['name', 'country', 'coordinate', 'description']), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {
            airportid = req.params.airportid
            newValues = req.body

            airport.updateAirport(airportid, newValues, (err, result) => {
                if (err) {
                    if (err.code == 'ER_DUP_ENTRY') {   // dup airport name //
                        return res.status(422).send('Unprocessable Entity')
                    }
                    return res.status(500).send(err)

                } else {
                    if (Object.keys(result).length === 1) { // For invalid airport id / coordinate dup //
                        return res.status(200).send(result)
                    }
                    return res.status(204).send("No Content")
                }
            })
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch {
        return res.status(500).send("Internal Server Error")
    }
})

//   End point 27: PUT /promotions/:promotionid  //
// this endpoint will update a selected promotion given its promotionid //
app.put('/promotions/:promotionid', isLoggedIn, checkReqBodyMiddleware(['discount', 'promotional_period_start', 'promotional_period_end']), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // only admin can update promotions //
            promotionid = req.params.promotionid
            newValues = req.body

            promotions.updatePromotion(promotionid, newValues, (err, result) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    if (Object.keys(result).length === 1) { // For invalid promotionid //
                        return res.status(200).send(result)
                    }
                    return res.status(204).send("No Content")
                }
            })

        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch {
        return res.status(500).send("Internal Server Error")
    }
})

// End point 28 : PUT  /flight/promotions/:flightPromotionid //
// This updates the flight promotion given the flightPromotionid //
app.put('/flight/promotions/:flightPromotionid', isLoggedIn, checkReqBodyMiddleware(["fk_flight_id", "fk_promotion_id"]), (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') { // only admin can update promotions //

            flightPromotionid = req.params.flightPromotionid
            newValues = req.body

            promotions.updateFlightPromotion(flightPromotionid, newValues, (err, result) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    if (Object.keys(result).length === 1) { // For invalid flightPromotion id  //
                        return res.status(200).send(result)
                    }
                    return res.status(204).send("No Content")
                }
            })
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch {
        return res.status(500).send("Internal Server Error")
    }
})

// End point 29 : PUT  /flight/:flightid //
// This updates the details of a flight given its flightid //
app.put('/flight/:flightid', isLoggedIn, checkReqBodyMiddleware(['flightCode', 'aircraft', 'originAirport', 'destinationAirport', 'embarkDate', 'travelTime', 'price']),
    (req, res) => {
        try {
            if (req.decodedToken.role === 'Admin') {  // ensures that only admin can create new flights//
                var updateFlightValues = req.body
                var flightid = req.params.flightid
                flight.updateFlight(flightid, updateFlightValues, (err, result) => {
                    if (err) {
                        return res.status(500).send(err)
                    } else {
                        if (Object.keys(result).length === 1) { // For invalid flight id  //
                            return res.status(200).send(result)
                        }
                        return res.status(204).send("No Content")
                    }
                })
            } else {
                return res.status(401).send("UNAUTHORISED")
            }
        } catch (err) {
            return res.status(500).send("Internal Server Error")
        }
    })

// Endpoint 30:  DELETE /user/:userid //
// this endpoint allows admin to delete a selected user and its image //
app.delete('/user/:userid', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {  // ensures that only admin can create delete users //
            var userid = req.params.userid
            user.deleteUser(userid, (err, result) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    return res.status(200).send(result)
                }
            })
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Endpoint 31:  DELETE /airport/:airportid //
// this api allows admin to delete selected airports //
app.delete('/airport/:airportid', isLoggedIn, (req, res) => {
    try {
        if (req.decodedToken.role === 'Admin') {  // ensures that only admin can create delete airport //
            var airportid = req.params.airportid
            airport.deleteAirport(airportid, (err, result) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    return res.status(200).send(result)
                }
            })
        } else {
            return res.status(401).send("UNAUTHORISED")
        }
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Endpoint 32: GET /transfer/flight/:originAirportId/:destinationAirportId/:transferairportId/:embarkDate //
// this api allows to get all possible transfer flights from a given origin, destination and transfer airports //
app.get('/transfer/flight/:originAirportId/:destinationAirportId/:transferairportId/:embarkDate', (req, res) => {
    try {
        var embarkDate = req.params.embarkDate
        var airportIDs = [req.params.originAirportId, req.params.destinationAirportId, req.params.transferairportId]

        flight.transferFlight(airportIDs, embarkDate, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                if (Object.keys(result).length === 1) {   // For when there are no airports given the destination and origin airports from params //
                    return res.status(200).send(result)
                }
                return res.status(201).send(result) // Sends back the new transfer row to client //
            }
        })
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Endpoint 33: GET /bookings/:userid
// this api retrieves information about respective user's bookings made //
app.get('/bookings/:userid', isLoggedIn, (req, res) => {
    try {
        userid = req.decodedToken.userid
        if (userid != req.params.userid) {
            return res.status(401).send("UNAUTHORISED")
        }
        bookings.getUserBookings(userid, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                if (Object.keys(result).length === 1) {   // For when there is no bookings made by user //
                    return res.status(200).send(result)
                }
                return res.status(200).send(result) // Sends back bookings //
            }
        })

    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Endpoint 34: POST /booking_cart/:userid/:flightid/ //
// this endpoint allows users to add flights into their booking cart
app.post('/booking_cart/:userid/:flightid/', isLoggedIn, (req, res) => {
    try {
        userid = req.decodedToken.userid
        flightid = req.params.flightid
        promotionid = req.body.promotionid
        if (userid != req.params.userid) {
            return res.status(401).send("UNAUTHORISED")
        }

        booking_cart.addFlight(userid, flightid, promotionid, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        })
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Endpoint 35: GET /booking_cart/:userid //
// this endpoint retrieves all booking cart information given a userid //
app.get('/booking_cart/:userid', isLoggedIn, (req, res) => {
    try {
        userid = req.decodedToken.userid
        if (userid != req.params.userid) {
            return res.status(401).send("UNAUTHORISED")
        }

        booking_cart.getCart_bookings(userid, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        })
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Endpoint 36: DELETE /booking_cart/:booking_cart_id //
// this endpoint retrieves deletes a flight off the given booking_cart_id //
app.delete('/booking_cart/:booking_cart_id', isLoggedIn, (req, res) => {
    try {
        booking_cart_id = req.params.booking_cart_id
        booking_cart.deleteFlight_cart(booking_cart_id, (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error")
            } else {
                return res.status(200).send(result)
            }
        })
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
})

// Below are the api for front-end to send the html files //
// Below are the apis to send the html pages from backend to frontend //

// Error page route //
app.get("/error", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    } catch (err) {
        return res.status(500).send("Internal Server Error")
    }
});

// Index route //
app.get("/", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/index.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// login page //
app.get("/login", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/login.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// Flight Details page for each flight given the flightid //
app.get("/flight_details/", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/flight_details.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// Profile Page for users //
app.get("/profile", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/profile.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// Admin Panel for Admin //
app.get("/admin_panel", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/admin_panel.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// Promotions page for any user to see //
app.get("/promotions", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/promotion.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// Booking shopping cart //
app.get("/booking_cart", (req, res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/booking_cart.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
});

// Browse flights //
// this will be a page that lists all flights and allow user to search for a specific flight destination //
app.get('/browse_flights', (req,res) => {
    try {
        return res.status(200).sendFile(path.resolve("./public/html/browse_flights.html"));
    } catch (err) {
        return res.status(200).sendFile(path.resolve("./public/html/error.html"));
    }
})


// This route will help verify token to see whether users are logged in or not. //
// if users are logged in, we will change the nav bar element to redirect users to profile page instead of login page //
app.post("/verifyToken", isLoggedIn, (req, res) => {
    // req.decodedToken == e.g. { userid: 1, role: 'Admin' }  //
    if (req.decodedToken == null) {
        return res.status(200).send({ "message": "NOT LOGGED IN" });
    } else {
        // after getting req.decodedToken, we must ensure that userid is valid, using similar function as endpoint 2 //
        // This is for the case when a valid user already exists but got deleted midway by admin. Thus, we have to reject such users //
        try {
            user.getAllUser((err, result) => {
                if (err) {
                    return res.status(500).send("Internal Server Error")
                } else {

                    if (Object.keys(result).length === 0) { // For when no user cannot be found //
                        return res.status(200).send({ "message": "NOT LOGGED IN" });
                    }
                    // we then loop through array, see whether userid is valid. if invalid, reject
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].userid == req.decodedToken.userid && result[i].role === 'Customer') {
                            return res.status(200).send({ "message": "LOGGED IN" });

                        } else if (result[i].userid == req.decodedToken.userid && result[i].role === 'Admin') {
                            return res.status(200).send({ "message": "ADMIN CREDENTIALS CORRECT" })

                        }
                    }
                    return res.status(200).send({ "message": "NOT LOGGED IN" });
                }
            });
        } catch (err) {
            return res.status(200).sendFile(path.resolve("./public/html/error.html"));
        }
    }
})

module.exports = app 
