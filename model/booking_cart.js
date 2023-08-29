

var pool = require('./databaseConfig.js');

// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

var booking_cartDB = {
    // Endpoint 34: POST /booking_cart/:userid/:flightid/:promotionid //
    addFlight: (userid, flightid, promotionid, callback) => {

        // First we need to check whether the promotion id given is valid for the flight given, whether userid is valid, whether flight is valid// 
        var sql = "SELECT * FROM sp_air.flight_reference_promotion WHERE fk_flight_id = ? AND fk_promotion_id = ?; SELECT * FROM user where userid = ?"
        var dbQuery = pool.query(sql, [flightid, promotionid, userid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            }

            if (promotionid != null && Object.keys(result[0]).length === 0) {   // For invalid flightid or promotion id is invalid //
                result = { "message": "promotion id for selected flight is not valid!" }
                console.log("\n" + COLORS.red + "No promotions found for selected flightid. promotion id / flight id is not valid" + COLORS.reset)
                return callback(null, result)

            } else if (result[1].length === 0) {
                result = { "message": "userid is not valid" }
                console.log("\n" + COLORS.red + "No user found for selected userid. userid is not valid" + COLORS.reset)
                return callback(null, result)
            }

            sql = "INSERT INTO booking_cart (fk_flight_id,fk_user_id,fk_promotion_id) VALUES (?,?,?)"
            dbQuery = pool.query(sql, [flightid, userid, promotionid], (err, result) => {
                console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                if (err) {
                    console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                    return callback(err, null);
                } else {
                    console.table(result)
                    return callback(null, result)
                }
            })
        })
    },

    getCart_bookings : (userid, callback) => {
        var sql = `SELECT flight.flightid as flightid, booking_cart.booking_cart_id, booking_cart.created_at as added_at, airport1.name as originAirport, 
                    airport2.name as destinationAirport, 
                    flight.embarkDate as embarkDate, flight.price as price, promotion.promotionid as promotionid, promotion.discount as discount FROM booking_cart, flight, promotion,
                    airport as airport1, airport as airport2 WHERE booking_cart.fk_user_id = ? AND airport1.airportid = flight.originAirport AND airport2.airportid = flight.destinationAirport AND
                    promotion.promotionid = booking_cart.fk_promotion_id AND flight.flightid = booking_cart.fk_flight_id
                    UNION
                    SELECT flight.flightid as flightid, booking_cart.booking_cart_id as booking_cart_id, booking_cart.created_at as added_at, airport1.name as originAirport, 
                    airport2.name as destinationAirport, flight.embarkDate as embarkDate, flight.price as price, NULL as promotionid, NULL as discount FROM booking_cart, flight, airport as airport1, airport as airport2 
                    WHERE booking_cart.fk_user_id = ? AND airport1.airportid = flight.originAirport AND airport2.airportid = flight.destinationAirport AND flight.flightid = booking_cart.fk_flight_id
                    AND booking_cart.fk_promotion_id is NULL`
        
        var dbQuery = pool.query(sql, [userid, userid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (Object.keys(result).length == 0) {  // no flight in booking cart //
                    result = {"message": "no flight in booking cart"}
                }
                console.log(result)
                return callback(null, result)
            }
        })
    }, 

    deleteFlight_cart: (booking_cart_id, callback) => {
        var sql = `DELETE from booking_cart WHERE booking_cart_id = ?`
        var dbQuery = pool.query(sql, [booking_cart_id], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (result.affectedRows == 0) {
                    result = { "message" : "invalid booking cart id. Cannot delete"}
                }
                console.table(result)
                return callback(null, result)
            }
        })
    }
}

module.exports = booking_cartDB
