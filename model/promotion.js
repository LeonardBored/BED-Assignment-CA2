

var pool = require('./databaseConfig.js');

// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

var promotionDB = {

    // End point 28 : PUT  /flight/promotions/:flightPromotionid //
    updateFlightPromotion: (flightPromotionid, newValues, callback) => {
        // First we get the embarkDate from the selected flight and use that to ensure that the promotional_period_end will be <= to that //
        var sql = `SELECT flight.embarkDate, promotion.promotional_period_start 
                   FROM flight,promotion where flight.flightid = ? AND promotion.promotionid = ?;
                   SELECT * FROM flight_reference_promotion WHERE fk_flight_id = ? AND fk_promotion_id = ? AND flight_promotion_id != ?`

        // newValues = ["fk_flight_id","fk_promotion_id" ] //

        var dbQuery = pool.query(sql, [newValues.fk_flight_id, newValues.fk_promotion_id, newValues.fk_flight_id, newValues.fk_promotion_id, flightPromotionid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {  // Error handling //
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);

            } else {
                if (Object.keys(result[0]).length === 0) { // Check whether flight id or promotion id is valid //
                    console.log("\n" + COLORS.red + "Flight id OR promotion does not exist!" + COLORS.reset)
                    result = { "message": "Flight OR Promotion does not exist" }
                    return callback(null, result)
                }
                // Check if the promotional_period_start is >= to embarkDate //
                if (Date.parse(result[0][0]["embarkDate"]) <= Date.parse(result[0][0]["promotional_period_start"])) {
                    console.log("\n" + COLORS.red + "Error! Promotional period starts after when flight has embarked!" + COLORS.reset)
                    result = { "message": "Invalid promotional period start! Promotional Period starts after flight has already embarked!" }
                    return callback(null, result)
                }
                // Check for if this flight already has the selected promotion. If it does, then reject it
                if (Object.keys(result[1]).length > 0) {
                    console.log("\n" + COLORS.red + "Error! Flight already has selected promotion!" + COLORS.reset)
                    result = { "message": "Flight already has selected promotion. Please choose another promotion for flight" }
                    return callback(null, result)
                }

                console.log("\n" + COLORS.green + "embarkDate is valid! Now updating flight promotion..." + COLORS.reset)
                
                sql = `UPDATE flight_reference_promotion SET ? WHERE flight_promotion_id = ? LIMIT 1`
                dbQuery = pool.query(sql, [newValues, flightPromotionid], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
                    if (err) {  // Error handling //
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err, null);
                    } else {
                        if (result.changedRows === 0 && result.affectedRows === 0) { // checks if any rows are affected. If not affected = no update = invalid flightPromotionid
                            result = { "message": "no promotion for selected promotionid, cannot update." }
                            return callback(null, result)
                        } 
        
                        console.table(result)
                        return callback(null, result)
                    }
                })
            }
        })
    },

    //   End point 27: PUT /promotions/:promotionid  //
    updatePromotion: (promotionid, newValues, callback) => {
        var sql =`UPDATE promotion set ? WHERE promotionid = ? LIMIT 1`

          // first, we check whether promotional_period_start is < promotional_period_end //
          if (Date.parse(newValues.promotional_period_start) >= Date.parse(newValues.promotional_period_end)) {
            console.log("\n" + COLORS.red + "Promotion Period cannot start at the same time OR after it has ended!" + COLORS.reset)
            result = { "message": "Promotion Period cannot start at the same time OR after it has ended!" }
            return callback(null, result)
        }

        var dbQuery = pool.query(sql,[newValues, promotionid] ,(err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {  
                if (result.changedRows === 0 && result.affectedRows === 0) { // checks if any rows are affected. If not affected = no update = invalid promotionid
                    result = { "message": "no promotion for selected promotionid, cannot update." }
                    return callback(null, result)
                } 

                console.table(result)
                return callback(null, result)
            }
        })
    },

    //   End point 25: GET /flight_promotions/  //
    getALLFlightPromotion: (callback) => {
        var sql = `SELECT flight_reference_promotion.flight_promotion_id as flight_promotion_id, flight_reference_promotion.fk_flight_id as flightid,
                    promotion.promotionid, promotion.discount, promotion.promotional_period_start, airport1.name as originAirport, airport2.name as destinationAirport
                    ,promotion.promotional_period_end FROM flight_reference_promotion, promotion, airport as airport1, airport as airport2, flight 
                    WHERE fk_promotion_id = promotion.promotionid AND airport1.airportid = flight.originAirport AND airport2.airportid = flight.destinationAirport
                    AND flight.flightid = flight_reference_promotion.fk_flight_id`

        var dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {          
                if (Object.keys(result).length === 0) {  // no promotions for flights in table //
                    result = {"message": "no flight has promotions"}
                    return callback(null, result)
                }

                console.log(result)
                return callback(null, result)
            }

        })
    },

    //   End point 24: GET /allPromotions/  //
    getALLPromotion: (callback) => {
        var sql = `SELECT promotionid, discount, promotional_period_start, promotional_period_end FROM promotion`
        
        var dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (Object.keys(result).length === 0) {  // no promotions in table //
                    result = {"message": "no promotion exist yet"}
                    return callback(null, result)
                }
                console.log(result)
                return callback(null, result)
            }
        })
    },

    // Get all promotions given a flight id //
    // End point 12 : GET /promotions/flight/:flightid/ //
    getPromotions: (flightId, callback) => {
        // First we validate and check whether flightid is valid. Then, we retrieve all data about flights and its promotion given flight id //
        var sql =  `SELECT * FROM flight where flightid = ?;
                    SELECT promotion.promotionid, flight.flightid, flight.flightCode, flight.aircraft, airport1.name as originAirport, 
                    airport2.name as destinationAirport, flight.embarkDate, flight.travelTime, flight.price as original_price, 
                    promotion.discount, promotion.promotional_period_start, promotion.promotional_period_end 
                    FROM promotion,flight, airport as airport1, airport as airport2, flight_reference_promotion 
                    WHERE flight.flightid = ? AND flight_reference_promotion.fk_flight_id = ? AND 
                    flight_reference_promotion.fk_promotion_id = promotion.promotionid AND airport1.airportid = originAirport
                    AND airport2.airportid = destinationAirport`

        var dbQuery = pool.query(sql, [flightId, flightId, flightId], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // result[0] info about flight given flightid. if there is no info, this means that flight does not exists //
                if (Object.keys(result[0]).length === 0) {
                    console.log("\n" + COLORS.red + "flightid is invalid" + COLORS.reset);  // printing the error code //
                    result = { "message": "flightid is invalid" }
                    return callback(null, result)
                }

                // result[1] = [ { promotionid, flightCode, aircraft, originAirport, destinationAirport, embarkDate, 
                //            travelTime, original_price, discount, promotional_period_start, promotional_period_end } , ... ]//
                // First check for if there are any results. If no results = invalid flight id //
                if (Object.keys(result[1]).length === 0) {
                    console.log("\n" + COLORS.red + "No promotion found for flight" + COLORS.reset);  // printing the error code //
                    result = { "message": "Flight has no promotions" }
                    return callback(null, result)
                }
                // Next, we will have to loop through results and add % to the discount key  //
                for (let i = 0; i < result[1].length; i++) {
                    result[1][i].discount = result[1][i].discount + "%"
                }
                console.log("\n" + COLORS.green + "Sending Results..." + COLORS.reset)
                console.log(result[1]) // Prints all promotion info about selected flight // 

                return callback(null, result[1]);
            }
        });
    },

    // Inserting a promotion //
    // End point 13 : POST /promotions/ //
    insertPromotion: (promotionValues, callback) => {
        // promotionValues = e.g. { "discount" : 20, "promotional_period_start" : "2022/05/22 08:20:00","promotional_period_end": "2022/08/22 08:20:00" }
        
        // first, we check whether promotional_period_start is < promotional_period_end //
        if (Date.parse(promotionValues.promotional_period_start) >= Date.parse(promotionValues.promotional_period_end)) {
            console.log("\n" + COLORS.red + "Promotion Period cannot start at the same time OR after it has ended!" + COLORS.reset)
            result = { "message": "Promotion Period cannot start at the same time OR after it has ended!" }
            return callback(null, result)
        }
        // After checking and if it is valid, we can then insert //
        var sql = `INSERT INTO promotion (discount, promotional_period_start, promotional_period_end) values (?); 
                   SELECT * FROM promotion WHERE promotionid = LAST_INSERT_ID();`

        insertValues = [promotionValues.discount, promotionValues.promotional_period_start, promotionValues.promotional_period_end]

        var dbQuery = pool.query(sql, [insertValues], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null)
            } else {
                console.table(result[1])
                return callback(null, result[1][0].promotionid)
            }
        });
    },

    // This is to reference a flight to a promotion. Many flights can have 1 promotion //
    // End point 14 : POST /promotions/flight/ //
    insertFlight_Reference_Promotion: (promotionValues, callback) => {
        // First we get the embarkDate from the selected flight and use that to ensure that the promotional_period_end will be <= to that //
        var sql = `SELECT flight.embarkDate, promotion.promotional_period_start 
                   FROM flight,promotion where flight.flightid = ? AND promotion.promotionid = ?;
                   SELECT * FROM flight_reference_promotion WHERE fk_flight_id = ? AND fk_promotion_id = ?`

        // promotionValues = [flightid, promotionid] //

        var dbQuery = pool.query(sql, [promotionValues[0], promotionValues[1],promotionValues[0], promotionValues[1]], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {  // Error handling //
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);

            } else {
                if (Object.keys(result[0]).length === 0) { // Check whether flight id or promotion id is valid //
                    console.log("\n" + COLORS.red + "Flight id OR promotion does not exist!" + COLORS.reset)
                    result = { "message": "Flight OR Promotion does not exist" }
                    return callback(err, result)
                }
                // Check if the promotional_period_start is >= to embarkDate //
                if (Date.parse(result[0][0]["embarkDate"]) <= Date.parse(result[0][0]["promotional_period_start"])) {
                    console.log("\n" + COLORS.red + "Error! Promotional period starts after when flight has embarked!" + COLORS.reset)
                    result = { "message": "Invalid promotional period start! Promotional Period starts after flight has already embarked!" }
                    return callback(null, result)
                }
                // Check for if this flight already has the selected promotion. If it does, then reject it
                if (Object.keys(result[1]).length > 0) {
                    console.log("\n" + COLORS.red + "Error! Flight already has selected promotion!" + COLORS.reset)
                    result = { "message": "Flight already has selected promotion. Please choose another promotion for flight" }
                    return callback(null, result)
                }

                console.log("\n" + COLORS.green + "embarkDate is valid! Now inserting promotion..." + COLORS.reset)

                // Now, we can insert the selected flight into the selected promotion //
                sql = `INSERT INTO flight_reference_promotion (fk_flight_id, fk_promotion_id) VALUES (?); 
                       SELECT * FROM flight_reference_promotion WHERE flight_promotion_id = LAST_INSERT_ID()`

                dbQuery = pool.query(sql, [promotionValues], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                    if (err) {
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err, null)
                    } else {
                        console.table(result[1])
                        return callback(null, result[0].insertId)
                    }
                })
            }
        })
    },

    // Deleting a promotion given its promotionid //
    // End point 15 : DELETE /promotions/:id/ //
    deletePromotion: (promotionid, callback) => {
        // First, we need to check whether promotion id is valid. If valid, then delete the promotion based on its id //
        var sql = "SELECT * FROM promotion WHERE promotionid = ?; DELETE FROM promotion WHERE promotionid = ?"
        var dbQuery = pool.query(sql, [promotionid, promotionid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // result[0] will contain the info of the selected promotion based on its promotion id. If its invalid, there will be no info //
                // result[1] will show the affected rows after deletion of promotionid //
                // First, if promotion id is not valid, tell client //
                if (Object.keys(result[0]).length === 0) {
                    console.log("\n" + COLORS.red + "Promtion ID does not exists!" + COLORS.reset)
                    result = { "message": "promotionid is not valid" }
                    return callback(null, result)
                }
                // As promotion is deleted based on its id, the bookings which also contain this promotion id value in its //
                // fk_promotion_id foreign key will also be subsequently deleted automatically //
                console.log("\n" + COLORS.green + `Promotion id : ${promotionid} has been deleted!` + COLORS.reset)
                console.log("\n" + COLORS.green + `Bookings with Promotion id : ${promotionid} has been deleted!` + COLORS.reset)
                return callback(null, result)
            }
        });
    },

    // Deleting a promotion from a flight given the promotionid and flightid //
    // End point 16 : DELETE /promotions/:promotionid/flight/:flightid/ //
    deletePromotionReferenceFlight: (promotionid, flightid, callback) => {
        // first, we have to check whether flight id and promotion id is valid. Then, we will do the deletion //
        var sql = `SELECT * FROM flight where flightid = ?;
                   SELECT * FROM promotion where promotionid = ?`

        var dbQuery = pool.query(sql, [flightid, promotionid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (Object.keys(result[0]).length === 0) {
                    console.log("\n" + COLORS.red + "Flight ID does not exists!" + COLORS.reset)
                    result = { "message": "flightid is not valid" }
                    return callback(null, result)
                } else if (Object.keys(result[1]).length === 0) {
                    console.log("\n" + COLORS.red + "Promtion ID does not exists!" + COLORS.reset)
                    result = { "message": "promotionid is not valid" }
                    return callback(null, result)
                }
                // After validating, we can now do the deletion //
                sql = "DELETE FROM flight_reference_promotion WHERE fk_flight_id = ? AND fk_promotion_id = ?"
                dbQuery = pool.query(sql, [flightid, promotionid], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
                    if (err) {
                        console.log(err)
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err, null);
                    } else {
                        console.table(result)
                        if (result.affectedRows === 0) {
                            result = { "message": "Flight does not have selected promotion!" }
                            return callback(null, result)
                        }
                        console.log("\n" + COLORS.green + `Promotion id : ${promotionid} has been deleted from flight id : ${flightid}!` + COLORS.reset)
                        return callback(null, result)
                    }
                })
            }
        });
    }
} // End of promotionDB

module.exports = promotionDB
