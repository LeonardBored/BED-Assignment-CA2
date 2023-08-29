

var pool = require('./databaseConfig.js');

// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

var flightDB = {
    // End point 29 : PUT  /flight/:flightid //
    updateFlight: (flightid, updateFlightValues, callback) => {
        var sql = `UPDATE flight SET ? WHERE flightid = ? LIMIT 1`
        var dbQuery = pool.query(sql, [updateFlightValues, flightid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (result.changedRows === 0 && result.affectedRows === 0) { // checks if any rows are affected. If not affected = no update = invalid flightid
                    result = { "message": "no promotion for selected flightid, cannot update." }
                    return callback(null, result)
                } 

                console.table(result)
                return callback(null, result)
            }
        })
    },

    // End point 23: GET /flight/  //
    // Get information of all flights //
    getALLFlightDetails: (callback) => {
        var sql = `SELECT flight.flightid, flight.flightCode, flight.aircraft, airport1.name as originAirport, airport2.name as destinationAirport,
        airport1.airportid as originAirportid, airport2.airportid as destinationAirportid, flight.embarkDate, flight.travelTime, flight.price FROM flight, airport as airport1, airport as airport2 
        WHERE airport1.airportid = originAirport AND airport2.airportid = destinationAirport;

        SELECT product_listing.productid, fk_flight_id as flightid, product_listing.image_url as image_url FROM product_listing` // second sql statement to retrieve images. It is possible for flight to have no img //

        var dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (Object.keys(result[0]).length === 0) {   // no flights found 
                    result = {"message": "No flights found"}
                    return callback(null, result)
                }
                console.log(result)
                return callback(null,result)
            }
        })
    }, 
    // End point 22: GET /flight/:flightid //
    // gets flight detail based on flightid //
    getFlightDetails: (flightid, callback) => {
        var sql = `SELECT flight.flightid, flight.flightCode, flight.aircraft, airport1.name as originAirport, airport2.name as destinationAirport,
        airport1.country as originCountry, airport2.country as destinationCountry, airport1.description as originDescription, airport2.description as 
        destinationDescription, flight.embarkDate, flight.travelTime, flight.price
        FROM flight, airport as airport1, airport as airport2 
        WHERE airport1.airportid = originAirport AND airport2.airportid = destinationAirport AND flight.flightid = ?;

        SELECT product_listing.productid, product_listing.image_url as image_url FROM product_listing WHERE fk_flight_id = ? ` // second sql statement to retrieve images. It is possible for flight to have no img //

        var dbQuery = pool.query(sql, [flightid, flightid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // First check for if there are any results. If no results = invalid flightid //
                if (Object.keys(result[0]).length === 0) {
                    result = { "message": `flightid is invalid` }
                }
                console.log(result)
                return callback(null, result) // returns appropriate response containing array of flights // 
            }
        })
    },
    // Insert Flight //
    //   Endpoint 7: POST /flight/    // 
    insertFlight: (flightValues, callback) => {
        // In this sql statement, we first insert the flight then we select * values for the last inserted flight //
        var sql = "INSERT into flight (flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price) VALUES (?); SELECT * FROM flight WHERE flightid = LAST_INSERT_ID()"

        newFlightValues = [flightValues.flightCode, flightValues.aircraft, flightValues.originAirport, flightValues.destinationAirport, flightValues.embarkDate, flightValues.travelTime, flightValues.price]

        var dbQuery = pool.query(sql, [newFlightValues], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                console.table(result[1])
                console.log('\n' + COLORS.green + "Flight ID Created : " + result[0].insertId + COLORS.reset);
                return callback(null, result[0].insertId);  // Gives back flightid /
            }
        });
    },

    // Gets all Flights from selected origin and destination Airports //
    //   Endpoint 8: GET /flightDirect/:originAirportId/:destinationAirportId/:embarkDate // 
    getDirectFlights: (airportIDs, embarkDate, callback) => {
        // airportIDs = [originAirportid, destinationAirportid] // 
        var sql = `SELECT flight.flightid, flight.flightCode, flight.aircraft, airport1.name as originAirport, airport2.name as destinationAirport,
                   airport1.country as originCountry, airport2.country as destinationCountry, flight.embarkDate, flight.travelTime, flight.price from flight, airport as airport1, airport as airport2 
                   WHERE airport1.airportid = originAirport AND airport2.airportid = destinationAirport AND DATE(flight.embarkDate) = ?
                   AND originAirport = ? AND destinationAirport = ?`
        
                   // Finds all flights that matches the origin and destination airport first from req.params //
        var dbQuery = pool.query(sql, [embarkDate,airportIDs[0], airportIDs[1]], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // now we have all flights in an array //
                // Now is to loop through the result array and replace the dates from 2022-12-22 to 2022/12/22 //
                for (let i = 0; i < result.length; i++) {
                    result[i]["embarkDate"] = result[i]["embarkDate"].replace(/-/g, "/")
                }
                // Check if there are any users in selected airport ids. If results = [], tell client that there are no flights//
                if (Object.keys(result).length === 0) {
                    result = { "message": `No flights for selected airports` }
                }
                console.log(result)

                return callback(null, result) // returns appropriate response containing array of flights // 
            }
        });
    },

    // Deletes a selected flight based on flight id //
    // Also deletes all subsequent boookings and promotions with flight id //
    //  Endpoint 10: DELETE  /flight/:id   //
    deleteFlight: (flightid, callback) => {
        // We first check whether the flight id is valid. if it isint, reject it
        var sql = "SELECT * FROM flight WHERE flightid = ?; DELETE FROM flight WHERE flightid = ?";

        // First, check if flight id is valid. Then Delete the flight from the flight table based on its flight id //
        var dbQuery = pool.query(sql, [flightid, flightid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log(err)
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err);
            } else {
                if (Object.keys(result[0]).length === 0) { // This means that flightid is not valid //
                    result = { "Message": "Flightid is not valid!" }
                    return callback(null, result)
                }
                // Next, we have to delete all mentions of deleted flight in the bookings and promotion tables //
                console.log("\n" + COLORS.green + `Flight id: ${flightid} Deleted!` + COLORS.reset)

                // Since flight is deleted, the foreign key mentioning flightids in bookings will also be automatically deleted //
                console.log("\n" + COLORS.green + `Flight id: ${flightid} in bookings Deleted!` + COLORS.reset)

                // Since flight is deleted, the foreign key mentioning flightids in flight_reference_promotion will also be automatically deleted //
                console.log("\n" + COLORS.green + `Flight id: ${flightid} in flight_reference_promotion Deleted!` + COLORS.reset)
                return callback(null, result);
            }
        });
    },

    // Endpoint 32: GET /transfer/flight/:originAirportId/:destinationAirportId/:transferairportId/:embarkDate //
    transferFlight: (airportIDs, embarkDate, callback) => {
        // airportIDs = [originAirportId, destinationAirportId, transferairportId] //
        var sql = "SELECT * FROM flight where originAirport = ? AND destinationAirport = ? AND DATE(flight.embarkDate) = ?"
        var dbQuery = pool.query(sql, [airportIDs[0], airportIDs[2], embarkDate], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err);
            } else {
                // Check whether there is any flights. If no flights, reject and tell user its internal server error // 
                if (Object.keys(result).length === 0) {
                    console.log("\n" + COLORS.red + "No Flights found!" + COLORS.reset)
                    result = { "message": `No Flights Found` }
                    return callback(null, result)
                }

                sql= `  SELECT flight1.flightid as firstFlightId, flight2.flightid as secondFlightId, flight1.embarkDate as embarkDate1, flight2.embarkDate as embarkDate2, flight1.flightCode as flightCode1, 
                        flight2.flightCode as flightCode2, flight1.aircraft as aircraft1, flight2.aircraft as aircraft2, airport1.name as originAirport, flight1.travelTime as time1,
                        airport2.name as transferAirport, airport3.name as destinationAirport, flight2.travelTime as time2, flight1.price + flight2.price as price FROM flight as flight1, 
                        flight as flight2, airport as airport1, airport as airport2, airport as airport3 WHERE flight1.originAirport = ? AND flight2.originAirport = ?
                        AND flight1.destinationAirport = flight2.originAirport AND flight2.destinationAirport = ? AND airport1.airportid = flight1.originAirport AND airport2.airportid = flight2.originAirport AND airport3.airportid = flight2.destinationAirport
                        AND DATE(flight1.embarkDate) < DATE(flight2.embarkDate) AND DATE(flight1.embarkDate) = ?
                
                        `
                // airportIDs = [originAirportId, destinationAirportId, transferairportId] //
                dbQuery = pool.query(sql, [airportIDs[0], airportIDs[2], airportIDs[1], embarkDate], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                    if (err) {
                        console.log(err)
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err);
                    } else {
                        // Check whether there is any flights. If no transfer flights, reject and tell user/ 
                        if (Object.keys(result).length === 0) {
                            console.log("\n" + COLORS.red + "No transfer flights found!" + COLORS.reset)
                            result = { "message": `No transfer flights Found!` }
                            return callback(null, result)
                        }

                        // else, we just return results to user //
                        return callback(null, result)
                    }
                })
            }
        })
    },
    // Transfers a flight based on the originAirport and destinationAirport provided, returning best possible transfer flight //
    //  Endpoint 11: GET /bestTransfer/flight/:originAirportId/:destinationAirportId/:embarkDate //
    bestTransferFlight: (airportIDs, embarkDate, callback) => {
        // First we find all flights that matches the origin airport and destination airport provided and store into result // 
        var sql = "SELECT * FROM flight where originAirport = ? AND destinationAirport != ? AND DATE(flight.embarkDate) = ?"

        dbQuery = pool.query(sql, [airportIDs[0], airportIDs[1], embarkDate], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err);
            } else {
                // Check whether there is any flights. If no flights, reject and tell user its internal server error // 
                if (Object.keys(result).length === 0) {
                    console.log("\n" + COLORS.red + "No Flights found!" + COLORS.reset)
                    result = { "message": `No Flights Found` }
                    return callback(null, result)
                }

                // Next we need to query the db and find all flights that goes to the selected destination airport and a given transfer airport//
                //  Store this values in possibleTransferFlights// 
                console.table(result)

                sql = "SELECT * FROM flight where originAirport != ? AND destinationAirport = ?"

                dbQuery = pool.query(sql, [airportIDs[0], airportIDs[1]], (err, possibleTransferFlights) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                    if (err) {
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err);
                    } else {
                        console.log("\n" + COLORS.green + "All Possible Transfer Flights" + COLORS.reset)
                        console.table(possibleTransferFlights)
                        // we can now have a list of possible transfer flights//
                        // First check whether there are any results in possibleTransferFlights // 
                        // If no results, this means that there are only 2 airports, thus a transfer flight is not possible // 
                        if (Object.keys(possibleTransferFlights).length === 0) {
                            console.log("\n" + COLORS.red +  "Not possible for transfer flight as no flights going to same destination airport" + COLORS.reset)
                            result = { "message": `No Transfer Flights Found` }
                            return callback(null, result)
                        }
                        // Have an array of an array of possible transfer flights for each flight and remove those that is exceed embarkDate //
                        Flight_possibleTransferFlights = new Array(result.length)  // Creates an array based on number of flights from origin to destination //
                        distArrays = new Array(result.length)       // Contains dist which will later be used for calc later //
                   
                        for (let i = 0; i < result.length; i++) {
                            // This is to create a deep copy such that it will not refernece the possibleTransferFlights array //
                            // Link: https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy //
                            Flight_possibleTransferFlights[i] = JSON.parse(JSON.stringify(possibleTransferFlights)) 
                            distArrays[i] = new Array(possibleTransferFlights.length)
                            for (let j = 0; j < distArrays[i].length; j++) {
                                distArrays[i][j] = 0
                            }
                        }
                        console.log("\n" + COLORS.green + "index based on flights from origin and destination. object = possible transfer flight" + COLORS.reset)
                        console.table(Flight_possibleTransferFlights)
                        // distArrays = [[0,0,..],...] where number of 0 is based on number of possible transfer flights //
                        // and number of [0,0,...] is based on total flights going origin and destination //
                        console.log("\n" + COLORS.green + "distArray Initlization" + COLORS.reset)
                        console.log(distArrays)
                        // now, we have an array where each index corresponds to a flight in result //
                        // we can now remove all possible transfer flight from each_Flight_possibleTransferFlights for each flight where //
                        // the embarkDate for the flight + travelTime <= embarkDate of possible Transfer Flight //
                        // rmb: result contains all flights going from origin to destiantion //
                        for (let i = 0, l = 0; i < result.length; i++ ,l++) {
                            for (let j = 0; j < Flight_possibleTransferFlights[i].length; j++) { // loop through each possible transfer flight //
                                if (Date.parse(Flight_possibleTransferFlights[i][j].embarkDate) <= Date.parse(result[i].embarkDate)) {
                                    Flight_possibleTransferFlights[i].splice(j,1) // remove of possible transfer flight //
                                    distArrays[i].splice(j,1) // Remove the 0 from distArray as that possible transfer flight will also be removed //
                                    j -= 1  // This is because Flight_possibleTransferFlights, distArrrays have been modified (removed 1 element), thus j shd go back -1 //
                                }   
                            }
                            // If there is no possible transfer flight for flight, it will contain the value = "No possible transfer flights" //
                            if (Object.keys(Flight_possibleTransferFlights[i]).length === 0) {
                                Flight_possibleTransferFlights[i] = "No possible transfer flights"
                                l -= 1 // this is because chosenIndexArray has been modified //
                            } 
                        }
                        console.log("\n" + COLORS.green + "Removed Flights from possible transfer flight that embarkDate is <= flight's embarkDate" + COLORS.reset)
                        console.table(Flight_possibleTransferFlights)
                        console.log("\n" + COLORS.green + "DistArray" + COLORS.reset + "\n")
                        console.log(distArrays)

                        // If there was possible transfer flights at first but got ommitted because it's embarkDate was before the 1st flight embarkDate, //
                        // and if there is no transfer flight for one flight going to specified destination airport from origin airport //
                        count = 0
                        for (let i = 0; i < Flight_possibleTransferFlights.length; i ++) {
                            if (Flight_possibleTransferFlights[i] == 'No possible transfer flights') {
                                count += 1
                            }
                        }

                        if (count == Flight_possibleTransferFlights.length) {
                            console.log("\n" + COLORS.red +  "Not possible for transfer flight as no flights going to same destination airport" + COLORS.reset)
                            result = { "message": `No Transfer Flights Found` }
                            return callback(null, result)
                        }

                        // If transfer flight is possible, First query airport for all necessary data//
                        sql = "SELECT airportid, name, coordinate FROM airport"
                        dbQuery = pool.query(sql, (err, airportValues) => {
                            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                            if (err) {
                                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                                return callback(err);
                            } else {
                                console.log("\n" + COLORS.green + "All Airports" + COLORS.reset)
                                console.table(airportValues)
                                // airportValues = e.g. [ {airportid: 1, "name": "Auckland Airport","coordinate" : {"x" : -37.0082, "y": 174.7850} , ...] // 
                                // Next, with coordinate values for each airport, we will now choose and define the transfer flight from all possible transfer flights//
                                // We do so by using the coordinate values in each airport and find the shortest path between the origin to transfer //
                                // airport and transfer to destination airport //
                                
                                // Calculation of distance between longitude and lagitude is using the Haversine formula //
                                // Haversine formula determines the great-circle distance between two points on a sphere given their longitudes and latitudes. //
                                // Formula from https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates

                                // distArrays = [[0,0,..],...] where number of 0 is based on number of possible transfer flights //
                                // and number of [0,0,...] is based on total flights going origin and destination //
                                for (let l = 0; l < Flight_possibleTransferFlights.length; l++) {
                                    if (Flight_possibleTransferFlights[l] === "No possible transfer flights") { continue } // Skips the flights with no possible transfer flights //
                                    for (let i = 0; i < Flight_possibleTransferFlights[l].length; i++) {
                                        var dist = 0
                                        tmpTransferFlight = Flight_possibleTransferFlights[l][i] // initialize a transfer flight //
                                        // Loop through all airports //
                                        for (let j = 0; j < airportValues.length; j++) {
                                            if (airportValues[j].airportid == tmpTransferFlight.originAirport) {  // To initialize values for transfer airport //
                                                var lon1 = airportValues[j].coordinate.x
                                                var lat1 = airportValues[j].coordinate.y

                                                for (let k = 0; k < airportValues.length; k++) {
                                                    // Only for airports that share the same airport id as origin or destination //
                                                    if (airportValues[k].airportid == airportIDs[0] || airportValues[k].airportid == airportIDs[1]) {
                                                        var lon2 = airportValues[k].coordinate.x
                                                        var lat2 = airportValues[k].coordinate.y

                                                        // For when it has same lat and lon for 2 airports coordinates //
                                                        if (lat1 == lat2 && lon1 == lon2) {
                                                            dist = 0
                                                        }
                                                        else {
                                                            // Calculates distance between transfer airport and airport //
                                                            var radlat1 = Math.PI * lat1 / 180;
                                                            var radlat2 = Math.PI * lat2 / 180;
                                                            var theta = lon1 - lon2;
                                                            var radtheta = Math.PI * theta / 180;
                                                            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                                                            if (dist > 1) {
                                                                dist = 1;
                                                            }
                                                            dist = Math.acos(dist);
                                                            dist = dist * 180 / Math.PI;
                                                            dist = dist * 60 * 1.1515;
                                                            dist = dist * 1.609344  // Converting distance to KM //

                                                            distArrays[l][i] += dist // Puts in dist Value between transfer and origin + transfer and destination airports into distARrays // 
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                console.log("\n" + COLORS.green + "distArray values = dist between transfer airport and origin + between transfer airport and destination" + COLORS.reset + "\n")
                                console.log(distArrays)
                                // chosenIndexArray  Will contain the index to show to each flight which is its best transfer flight //
                                // Loop through distList, find shortest dist among them //
                                // The index will then = to index of transfer flight //
                                // Store them in chosenIndexArray //
                                chosenIndexArray = new Array(result.length) // Contains all indexes for each flight's best possible transfer flight //
                                // init all index to be 0 at first //
                                for (let i = 0; i < chosenIndexArray.length; i++) { 
                                    chosenIndexArray[i] = 0
                                }

                                for (let i = 0; i < distArrays.length; i++) {
                                    shortestDist = distArrays[i][0] // init a shortest dist //
                                    embarkDate = Flight_possibleTransferFlights[i][0].embarkDate // init an embarkDate of possible transfer flight //
                                    
                                    if (embarkDate == undefined) { // for undefined, init shortestDist and embarkDate to next possible one //
                                        shortestDist = distArrays[i+1][0] 
                                        embarkDate = Flight_possibleTransferFlights[i+1][0].embarkDate
                                        continue // continue to next loop //
                                    }
                                    for (let j = 0; j < distArrays[i].length; j++)
                                        // Checks such that the index will be chosen based on if flight takes shortest dist and is the earliest to embark //
                                        if (shortestDist >= distArrays[i][j] && Date.parse(embarkDate) > Date.parse(Flight_possibleTransferFlights[i][j].embarkDate)) {
                                            shortestDist = distArrays[i][j]
                                            embarkDate = Flight_possibleTransferFlights[i][j].embarkDate
                                            chosenIndexArray[i] = j 
                                        }
                                }
                                console.log("\n" + COLORS.green + "chosenIndexArray" + COLORS.reset + "\n")
                                console.log(chosenIndexArray)
                                // Now, we have the index of the best possible transfer flights for each flight going to specified origin and destination //
                                // Put all tgt and send back to client //
                                var newResult = []
                                for (let k = 0; k < Flight_possibleTransferFlights.length; k++) {
                                    tmpDict = {}
                                    // Checks for flights with no possible transfer flight. For these flights, we will ommit them from result sent to client //
                                    if (Flight_possibleTransferFlights[k] === "No possible transfer flights") { // Excludes the flights in results //
                                        console.log("\n" + COLORS.red + `Omitted Flight as no transfer flights for flightid : ${result[k].flightid}`)
                                        console.log("This is because flight's embarkDate after any possible transfer flight" + COLORS.reset)
                                        console.table(result[k])
                                        continue  // go to next loop //
                                    }
                                    indexOfTransferFlight = chosenIndexArray[k]
                                    transferFlight = Flight_possibleTransferFlights[k][indexOfTransferFlight]
                                    if (result[k].destinationAirport == transferFlight.originAirport) {  // ensures that this is an actual flight //
                                        console.log("\n" + COLORS.green + `Transfer Flight for flightid: ${result[k].flightid}` + COLORS.reset)
                                        console.table(transferFlight)

                                        tmpDict.firstFlightId = result[k].flightid        // Sets firstFligtId to original flightid (which is first flight) //
                                        tmpDict.secondFlightId = transferFlight.flightid  // Initialize second flight id from transferFlight flight id
                                        tmpDict.flightCode1 = result[k].flightCode        // Sets flightcode1 based on the first flight code //
                                        tmpDict.flightCode2 = transferFlight.flightCode   // Sets flightcode2 based on the transfer flight code //
                                        tmpDict.aircraft1 = result[k].aircraft            // Sets aircraft1 to first flight aircraft //
                                        tmpDict.aircraft2 = transferFlight.aircraft       // Sets aircraft2 to transfer flight aircraft //
                                        tmpDict.embarkDate1 = result[k].embarkDate        // Sets embarkDate1 as first flight embarkDate
                                        tmpDict.embarkDate2 = transferFlight.embarkDate   // Sets embarkDate2 as second flight embarkDate
                                        tmpDict.time2 = transferFlight.travelTime
                                        tmpDict.time1 = result[k].travelTime

                                        // airport name is derived from the value of origin airport id - 1 and through the name key //
                                        tmpDict.originAirport = airportValues[airportIDs[0] - 1].name

                                        // airport name is derived from the value of (transferFlight's origin airport id = transfer airport id) - 1 and through the name key //
                                        tmpDict.transferAirport = airportValues[transferFlight["originAirport"] - 1].name

                                        // airport name is derived from the value of destination airport id - 1 and through the name key //
                                        tmpDict.destinationAirport = airportValues[airportIDs[1] - 1].name

                                        tmpDict.price = result[k]["price"] + transferFlight["price"] // Price = 1st flight + 2nd flight price //
                                        newResult.push(tmpDict)                                      // Adds to array //
                                    }    
                                }
                                    console.log("\n" + COLORS.green + "Sending Results ..." + COLORS.reset)
                                    // Check for if newResult === empty array //
                                    // Last check for the case if possible transfer flight got ommitted becus embarkDate of 1st flight is after embarkDate of transfer flight //
                                    if (newResult.length === 0) { 
                                        newResult = { "message": `No Transfer Flights found between Airport IDS: ${airportIDs[0]} and ${airportIDs[1]}` }
                                    }

                                    console.log(newResult)
                                    return callback(null, newResult)
                            }
                        });
                    }
                });
            }
        });
    }
} // End of flightDB

module.exports = flightDB
