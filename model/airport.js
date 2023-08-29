

var pool = require('./databaseConfig.js');

// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

var airportDB = {

    // Endpoint 31:  DELETE /airport/:airportid //
    deleteAirport: (airportid, callback) => {
        var sql = `DELETE FROM airport WHERE airportid = ?`
        dbQuery = pool.query(sql, [airportid],(err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (result.affectedRows == 0) {
                    result = { "message" : "invalid airportid. Cannot delete"}
                }
                console.table(result)
                return callback(null, result)
            }
        })
    },

    //   End point 26: PUT /airport/:airportid  //
    updateAirport: (airportid, newValues, callback) => {
        var sql = "SELECT coordinate FROM airport WHERE airportid != ?"
        dbQuery = pool.query(sql, [airportid],(err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                console.table(result)
                // Result = e.g. = [
                //                    RowDataPacket { coordinate: { x: 103.9915, y: 1.3644 } },
                //                    RowDataPacket { coordinate: { x: 103.6681, y: 1.6389 } },
                //                    RowDataPacket { coordinate: { x: 140.3929, y: 35.772 } },
                //                    RowDataPacket { coordinate: { x: -122.379, y: 37.6213 } }
                //                  ]
                // We now need to ensure that the coordinate value given does not match any of the coordinates stored on mySQL //
                for (let i = 0; i < result.length; i++) {
                    if (result[i].coordinate.y == newValues.coordinate.x && result[i].coordinate.x == newValues.coordinate.y) {
                        console.log("\n" + COLORS.red + "Coordinate Already exists! Please enter a different coordinate" + COLORS.reset)
                        result = { "message": "Coordinate Already exists! Please enter a different coordinate"}
                        return callback(null, result)
                    }
                }

                tmpValues = {"name": newValues.name, "country": newValues.country, "description": newValues.description}

                sql = "UPDATE airport set ?, coordinate = ST_GeomFromText('POINT(? ?)',4326) where airportid = ? LIMIT 1"
                dbQuery = pool.query(sql, [tmpValues, newValues.coordinate.x, newValues.coordinate.y, airportid], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
                    if (err) {
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err, null);
                    } else {

                        if (result.changedRows === 0 && result.affectedRows === 0) { // checks if any rows are affected. If not affected = no update = invalid airportid
                            result = { "message": "no airport for selected airportid, cannot update." }
                            return callback(null, result)
                        } 

                        console.table(result)
                        return callback(null, result)

                    }
                })
            }
        })
    }, 

    // Insert Airport //
    //   Endpoint 5: POST /airport    // 
    insertAirport: (reqValues, callback) => {
        // reqValues = e.g. { "name": "Narita","country": "Japan", "coordinate": {x: 140.3929, y:1.6389 },"description": "Main International Airport of Japan"}
        // TO ensure that coordinate value is not duplicate for other airports. This cannot be done using UNIQUE in mysql as spatial values //
        // such as coordinates cannot be unique //
        var sql = "SELECT coordinate FROM airport"
        dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                console.table(result)
                // Result = e.g. = [
                //                    RowDataPacket { coordinate: { x: 103.9915, y: 1.3644 } },
                //                    RowDataPacket { coordinate: { x: 103.6681, y: 1.6389 } },
                //                    RowDataPacket { coordinate: { x: 140.3929, y: 35.772 } },
                //                    RowDataPacket { coordinate: { x: -122.379, y: 37.6213 } }
                //                  ]
                // We now need to ensure that the coordinate value given does not match any of the coordinates stored on mySQL //
                for (let i = 0; i < result.length; i++) {
                    if (result[i].coordinate.y == reqValues.coordinate.x && result[i].coordinate.x == reqValues.coordinate.y) {
                        console.log("\n" + COLORS.red + "Coordinate Already exists! Please enter a different coordinate" + COLORS.reset)
                        result = { "message": "Coordinate Already exists! Please enter a different coordinate"}
                        return callback(null, result)
                    }
                }
                // Now after validation, we insert the new airport //
                sql = "INSERT into airport (name,country,coordinate,description) VALUES (?,?, ST_GeomFromText('POINT(? ?)',4326),?)"

                // Resource used for inserting geometric data to mysql via POINT :https://dev.mysql.com/blog-archive/geographic-indexes-in-innodb/ // 
                // ST_GeomFromText converts the string containing the points (y x) to a geometric object to be stored onto the coordinate column //
                // This is important as the coordinate column contains Spatial Data Types, namely geolocation since SRID = 4326 //
                
                dbQuery = pool.query(sql, [reqValues.name, reqValues.country, reqValues.coordinate.x, reqValues.coordinate.y, reqValues.description], (err, result) => {
                    console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

                    if (err) {
                        console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                        return callback(err,null);
                    } else {
                        console.log("\n" + COLORS.green + `Created New Airport: ${reqValues.name}` + COLORS.reset)
                        return callback(null, result);
                    }
                });
            }
        });        
    },

    // Gets all Airports //
    //   Endpoint 6: GET /airport   // 
    getAllAirport: (callback) => {
        var sql = "SELECT airportid, name, country, coordinate, description FROM airport"   // coodinate will be used for admin page //
        var dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                console.table(result)
                return callback(null, result);
            }
        });
    }

} // End of airportDB //

module.exports = airportDB
