


var pool = require('./databaseConfig.js');

// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

var bookingsDB = {
    //  Endpoint 9: POST /booking/:userid/:flightid   //
    // Adds a new booking for a flight. A flight can have many bookings by a user //
    // In booking, user has the option to use promotion id and this will be checked later below tgt with its associated flightid // 
    bookFlight: (userid_flightid, bookingValues, callback) => {
        // userid_flightid = [userid, flightid]  //
        // bookingValues e.g. {“name”: “John Tan”,“passport”: “E1234555Z”,“nationality”: “Singaporean”,“age”:20 "promotionid" : 1 OR NULL} where promotionid can be null (no promotion selected)//
        if (bookingValues["promotionid"] == 'null') {
            bookingValues["promotionid"]  = null   // we set as null if it is a string null //
        }

        // First we need to check whether the promotion id given is valid for the flight given, whether userid is valid, whether flight is valid// 
        var sql = "SELECT * FROM sp_air.flight_reference_promotion WHERE fk_flight_id = ? AND fk_promotion_id = ?; SELECT * FROM user where userid = ?"
        var dbQuery = pool.query(sql, [userid_flightid[1],bookingValues.promotionid ,userid_flightid[0], userid_flightid[1]], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            }

            if (bookingValues.promotionid != null && Object.keys(result[0]).length === 0 ) {   // For invalid flightid or promotion id is invalid //
                result = { "message": "promotion id for selected flight is not valid!" }
                console.log("\n" + COLORS.red + "No promotions found for selected flightid. promotion id / flight id is not valid" + COLORS.reset)
                return callback(null, result)

            } else if (result[1].length === 0) {
                result = { "message": "userid is not valid" }
                console.log("\n" + COLORS.red + "No user found for selected userid. userid is not valid" + COLORS.reset)
                return callback(null, result)
            }
            // Insert values into bookings // 
            sql = "INSERT into bookings (fk_flight_id,fk_user_id,fk_promotion_id,name,passport,nationality,age) VALUES (?); SELECT * FROM bookings WHERE bookingid = LAST_INSERT_ID()";

            // Make a list for insert sql query //
            insertValueList = [userid_flightid[1], userid_flightid[0], bookingValues.promotionid, bookingValues.name, bookingValues.passport, bookingValues.nationality, bookingValues.age]

            dbQuery = pool.query(sql, [insertValueList], (err, result) => {
                console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                if (err) {
                    if (err.code == 'ER_NO_REFERENCED_ROW_2') { // For invalid flight id and promotionid = null //
                        result = { "message": "Flightid is not valid!" }
                        console.log("\n" + COLORS.red + "Flightid is not valid" + COLORS.reset)
                        return callback(null, result)
                    }
                    console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                    return callback(err, null);
                } else {
                    console.table(result[1])
                    console.log("\n" + COLORS.green + "Booking Made!" + COLORS.reset);
                    return callback(null, result[0].insertId);  // Returns id of newly inserted booking //
                }
            });
        })
    }, 

    // Endpoint 33: GET /bookings/:userid
    getUserBookings: (userid, callback) => {
        var sql = `
                SELECT flight.flightid as flightid, promotion.discount as discount, bookings.bookingid, airport1.name as originAirport, airport2.name as destinationAirport, flight.embarkDate as embarkDate,
                flight.price as price , bookings.created_at as bookingTime FROM promotion, user, flight, airport as airport1, airport as airport2, bookings WHERE
                bookings.fk_user_id = user.userid AND airport1.airportid = flight.originAirport AND airport2.airportid = flight.destinationAirport AND
                user.userid = ? AND bookings.fk_flight_id = flight.flightid AND bookings.fk_promotion_id = promotion.promotionid
                UNION 
                SELECT flight.flightid as flightid, NULL as discount, bookings.bookingid, airport1.name as originAirport, airport2.name as destinationAirport, flight.embarkDate as embarkDate,
                flight.price as price , bookings.created_at as bookingTime FROM user, flight, airport as airport1, airport as airport2, bookings WHERE
                bookings.fk_user_id = user.userid AND airport1.airportid = flight.originAirport AND airport2.airportid = flight.destinationAirport AND
                user.userid = ? AND bookings.fk_flight_id = flight.flightid AND bookings.fk_promotion_id is NULL        
        `   
        // in the sql statement above, we first select all bookings that have promotions allocated to them //
        // we then union tgt with another select statement that selects all bookings without any bookings on them //
        var dbQuery = pool.query(sql, [userid, userid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (Object.keys(result).length == 0) {  // for the case when user has no bookings made yet //
                    result = {"message": "no bookings"}
                    return callback(null, result)
                }
                console.log(result)
                return callback(null, result)
            }
        })
    }
} // End of bookingsDB //

module.exports = bookingsDB
