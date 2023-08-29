

var pool = require('./databaseConfig.js');

// Object COLORS that stores values to change string colors in terminal //
var COLORS = {

    red: "\x1b[41m",

    green: "\x1b[42m",

    reset: "\x1b[0m"

}

const fs = require('fs') // to Delete invalid img files uploaded //

var product_listing_DB = {
    // Gets all products in product listing //
    // End point 17: GET /productlisting/ //
    getProduct: (callback) => {

        var sql = `SELECT product_listing.productid, flight.flightid, flight.flightCode, flight.aircraft, airport1.name as originAirport,
                   airport2.name as destinationAirport,airport1.country as originCountry, airport2.country as destinationCountry, flight.embarkDate,
                   flight.travelTime, flight.price, product_listing.image_url 
                   FROM flight,product_listing, airport as airport1, airport as airport2 WHERE product_listing.fk_flight_id = flight.flightid
                   AND airport1.airportid = flight.originAirport AND airport2.airportid = flight.destinationAirport` 

        var dbQuery = pool.query(sql, (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // First check for if there are any results. If no results = no products in product listing //
                if (Object.keys(result).length === 0) {
                    console.log("\n" + COLORS.red + "No products in product listing" + COLORS.reset);  // printing the error code //
                    result = { "message": "No products in product listing" }
                    return callback(null, result)
                }

                console.log("\n" + COLORS.green + "Sending Results..." + COLORS.reset)
                console.log(result)
                return callback(null, result);
            }
        });
    },

    // insert a product with jpg / png //
    // End point 18: POST /product_listing/pic/:flightid //
    insertProduct: (flightid,imgFile, callback) => {
        var sql = "INSERT INTO product_listing (fk_flight_id, image_url) VALUES (?)"
        
        // imgUrl will be a static page to see the jpg e.g. http://localhost:8081/public/profile_pic/default.jpg //
        var imgUrl = "http://localhost:8081/public/"  + imgFile.fieldname.replace('_url',"") + "/" + imgFile.filename 

        insertValues = [flightid, imgUrl]

        var dbQuery = pool.query(sql, [insertValues, flightid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                    console.log("\n" +COLORS.red + "Invalid Flight ID! Flight does not exists" + COLORS.reset)
                    result = { "message": "Invalid Flight ID! Flight does not exists" }
                    // To delete the uploaded image in './uploads/tmp/product_pic' //
                    fs.unlink(imgFile.path, (err) => { 
                        if (err) {
                            return callback(err, null)
                        }
                        console.log("\n" + COLORS.green + "File Removed as invalid flight id!" + COLORS.reset)
                    })
                    return callback(null, result)

                } else if (err.code === 'ER_DUP_ENTRY') { // For when there is already a picture inserted for flight, reject it and tell client. //
                    console.log("\n" +COLORS.red + "Flight already has a picture! use PUT METHOD to update pic" + COLORS.reset)
                    result = { "message": "Flight already has a picture! use PUT METHOD to update pic" }
                    fs.unlink(imgFile.path, (err) => { 
                        if (err) {
                            return callback(err, null)
                        }
                        console.log("\n" + COLORS.green + "File Removed as invalid flight id!" + COLORS.reset)
                    })
                    return callback(err, result)
                }

                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);

            } else {
                // Now, if update is valid, we will then move this new img from tmp to the profile_pic folder //
                newImgPath = "uploads\\product_pic\\" + imgFile.filename
                fs.rename(imgFile.path, newImgPath, (err) => {  // we will be moving img from /uploads/product_pic/tmp to /uploads/product_pic //
                    if (err) {
                        return callback(err, null)
                    }
                    console.log("\n" + COLORS.green + "Files successfully moved to profile_pic folder!" + COLORS.reset)
                })
                console.log("\n" + COLORS.green + "Image has been uploaded!" + COLORS.reset)
                return callback(null, result);
            }
        });
    }, 

    // update a product with jpg / png //
    // End point 19: PUT /product_listing/pic/:flightid //
    updateProduct: (flightid,imgFile, callback) => {
        var sql = "UPDATE product_listing SET image_url = ? WHERE fk_flight_id = ?"

        // imgUrl will be a static page to see the jpg e.g. http://localhost:8081/public/profile_pic/default.jpg //
        var imgUrl = "http://localhost:8081/public/"  + imgFile.fieldname.replace('_url',"") + "/" + imgFile.filename 

        var dbQuery = pool.query(sql, [imgUrl, flightid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //
            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                if (result.affectedRows === 0) {
                    console.log("\n" +COLORS.red + "Invalid Flight ID! Flight does not exists" + COLORS.reset)
                    result = { "message": "Invalid Flight ID! Flight does not exists" }
                    // To delete the uploaded image in './uploads/tmp/product_pic' //
                    fs.unlink(imgFile.path, (err) => { 
                        if (err) {
                            return callback(err, null)
                        }
                        console.log("\n" + COLORS.green + "File Removed as invalid flight id!" + COLORS.reset)
                    })
                    return callback(null, result)
                }
                // Now, if update is valid, we will then move this new img from tmp to the profile_pic folder //
                newImgPath = "uploads\\product_pic\\" + imgFile.filename
                fs.rename(imgFile.path, newImgPath, (err) => { // we will be moving img from /uploads/product_pic/tmp to /uploads/product_pic // 
                    if (err) {
                        return callback(err, null)
                    }
                    console.log("\n" + COLORS.green + "Files successfully moved to profile_pic folder!" + COLORS.reset)
                })
                console.log("\n" + COLORS.green + "Image has been updated" + COLORS.reset)
                console.table(result)
                return callback(null, result);
            }
        });
    }, 

    // End point 20: DELETE /product_listing/:productid //
    // Deletes a product from product_listing based on productid provided//
    deleteProduct: (productid, callback) => {
        var sql = `SELECT * FROM product_listing WHERE productid = ?; DELETE FROM product_listing WHERE productid = ?`

        var dbQuery = pool.query(sql, [productid,productid], (err, result) => {
            console.log("\nExecuted: " + COLORS.green + dbQuery.sql + COLORS.reset) // Prints the executed sql statement //

            if (err) {
                console.log("\nMySQL Server Error: " + COLORS.red + `${err.code}` + COLORS.reset);  // printing the error code //
                return callback(err, null);
            } else {
                // First check for if are any results from select statement. If no results = invalid id //
                if (Object.keys(result[0]).length === 0) {
                    console.log("\n" + COLORS.red + "Invalid product ID! Cannot delete..." + COLORS.reset);  // printing the error code //
                    result = { "message": "Invalid product ID! Cannot delete..." }
                    return callback(null, result)
                }

                // If deletion is success, also delete the image in upload folder //
                // We can use the info collected from result[0] under select statement to get the image path //
                // Right now, the image path stored in mysql is e.g. http://localhost:8081/public/product_pic/default.jpg //
                // we need to remove the http://localhost:8081/public infront and replace with ./uploads    // 
                imgPath = result[0][0]["image_url"].replace('http://localhost:8081/public','./uploads')
                console.log("\n" + COLORS.green + `Image path in folder uploads is : ${imgPath}` + COLORS.reset)
                fs.unlink(imgPath, (err) => { 
                    if (err) {
                        return callback(err, null)
                    }
                    console.log("\n" + COLORS.green + "File Removed in uploads folder!" + COLORS.reset)
                })
                return callback(null, result)
            }
        });
    },
} // End of product_listing_DB  //

module.exports = product_listing_DB
