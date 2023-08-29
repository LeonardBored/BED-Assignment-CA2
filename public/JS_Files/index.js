
const baseUrl = "http://localhost:8081";

$(document).ready(async () => {
    // This will retrieve all airports from db and put in the <option> for the search form //
    //   Endpoint 6: GET /airport in app.js  // 
    async function getAirports() {
        await axios.get(`${baseUrl}/airport`) // query for airports in db //
            .then((res) => {
                const airports = res.data;
                airports.forEach((airport) => {
                    const optionHtml = `
                    <option value=${airport.airportid}>${airport.name}</option>
                    `;

                    $("#From").append(optionHtml);
                    $("#To").append(optionHtml);
                    $("#transferAirport").append(optionHtml)
                });
            })
            .catch((err) => {
                return  // we just want to do nothing for the case if there is no airport //
            });
    }

    await getAirports()

    // Event for when user choses one way flight, we want the return date to be set to empty //
    $("#flightType").on('change', () => {
        try {
            if ($("#flightType").val() === 'directFlight') {
                $("#returnDate").attr("type", "text")      // Change type to text in order to make value empty //
                $("#returnDate").val("");
                $("#returnDate").prop("disabled", true);  // To disable the input //
            } else {
                $("#returnDate").attr("type", "date")       // Change back to date //
                $("#returnDate").prop("disabled", false);  // To enable input //
            }
        } catch (err) {
            console.log(err);
            window.location.href = "/error"
        }
    });

    // if destination == origin or transfer, we will clear the origin or transfer  input //
    $("#To").on('change', () => {
        if ($("#To").val() == $("#From").val()) {
            $("#From").val('')
        } else if ($("#To").val() == $("#transferAirport").val()) {
            $("#transferAirport").val('')
        }
    })

    // if origin == destionation or transfer, we will clear the destination or transfer input //
    $("#From").on('change', () => {
        if ($("#From").val() == $("#To").val()) {
            $("#To").val('')
        } else if ($("#From").val() == $("#transferAirport").val()) {
            $("#transferAirport").val('')
        }
    })
    // if transfer == from or to, we will clear their respective val 
    $("#transferAirport").on('change', () => {
        if ($("#transferAirport").val() == $("#To").val()) {
            $("#To").val('')
        } else if ($("#transferAirport").val() == $("#From").val()) {
            $("#From").val('')
        }
    })

    // if transfer flight is clicked, we will enable the div for transfer airport //
    $("#confirmTransferFlight").on('change', () => {
        if ($("#confirmTransferFlight").is(':checked')) {  // transfer flight is selected //
            // change transferDiv such that it appears //
            $("#transferDiv").attr("class", "col-md-2")
            // change attr class column of from and to divs //
            $("#ToDiv").attr("class", "col-md-3")
            $("#FromDiv").attr("class", "col-md-3")
            $("#transferAirport").prop('required', true);  // makes it such that input is required //

            // we will also add another checkbox below transfer flight checkbox, asking whether they want best transfer //
            bestTransferHtml = `
                <div class="form-check" id="bestTransferFlight">
                    <input class="form-check-input" type="checkbox" value="" id="confirmBestTransferFlight">
                    <label class="form-check-label" for="bestTransferFlight">
                    Best Transfer Flight 
                    </label>
                </div>
                `
            $("#transferCol").append(bestTransferHtml)

            // when user clicks this button, we want to disable the transfer airport select //
            // this is so that with we can use our endpoint 11 to calculate the best possible transfer flight given the origin and destination //
            $("#confirmBestTransferFlight").on('change', () => {
                if ($("#confirmBestTransferFlight").is(':checked')) { // best transfer flight is selected //
                    // disable transfer airport select //
                    $("#transferAirport").val("");
                    $("#transferAirport").prop("disabled", true);     // To disable the input //
                } else {
                    // if it is not selected, we need to enable again //
                    $("#transferAirport").prop("disabled", false);     // To enable the input //
                }
            })

        } else {
            // for when transfer flight is not selected //
            $("#transferAirport").val('')
            $("#transferDiv").attr("class", "d-none")
            $("#transferAirport").prop('required', false); // makes it such that input is not required //
            // change attr class column of from and to divs //
            $("#ToDiv").attr("class", "col-md-4")
            $("#FromDiv").attr("class", "col-md-4")
            $("#transferAirport").prop("disabled", false);     // To enable the input //
            $("#bestTransferFlight").remove()  // removes the checkbox below transfer flight //
        }
    })

    async function searchFlightQuery(i, originAirport_id, destinationAirport_id, embarkDate) {
        // we want to query from Endpoint 8: GET /flightDirect/:originAirportId/:destinationAirportId/:embarkDate // 
        await axios.get(`${baseUrl}/flightDirect/${originAirport_id}/${destinationAirport_id}/${embarkDate}`)
            .then((res) => {
                results = res.data
                if ($('#errorMessage').attr('name') != 'error') {
                    if (Object.keys(results).length == 1 && results.message != undefined) {  // Error in db pertaining to query, no flights //
                        if (i === 1) { // for return flights, when there are direct flights found but no return Flights //
                            history.replaceState(`/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/`, "page 3", `/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}`)
                            searchResultHtmlTitle = `
                            <h4 class="mt-5">Search Flight Results</h4>
                            <hr>
                            <div class="container text-start">
                                <h2 class="fw-bold">${i + 1}. ${destinationCountry} &nbsp&nbsp;to&nbsp;&nbsp ${originCountry}</h2>
                            </div>

                            <div class="container text-center py-2 searchResultDiv" style="background-color:white;"><h3>No Return Flights Found</h3></div>
                        `
                            $("#searchResult").append(searchResultHtmlTitle);
                            return// break out of function //
                        }
                        window.history.pushState("data", "Title", '/');
                        $('#errorMessage').attr('name', 'error')
                        $('#errorMessage').html(`${results.message}`)
                        $('#errorModal').modal('show');
                        $("#searchResult").empty() // Clear the search result div //
                        return
                    }
                    // replacing the url of the page without any reloading //
                    history.pushState(`/?/direct/${originAirport_id}/${destinationAirport_id}/${embarkDate}`, "page 2", `/?/direct/${originAirport_id}/${destinationAirport_id}/${embarkDate}`)
                    if (i == 1) { // for return flights //
                        history.replaceState(`/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/`, "page 3", `/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}`)
                    }
                    ogEmbarkDate = embarkDate

                    originCountry = results[0].originCountry
                    destinationCountry = results[0].destinationCountry

                    searchResultHtmlTitle = `
                    <h4 class="mt-5">Search Flight Results</h4>
                    <hr>
                    <div class="container text-start">
                        <h2 class="fw-bold" style="color: rgb(37, 90, 206);">${i + 1}. ${originCountry}  &nbsp&nbsp;to&nbsp;&nbsp ${destinationCountry}</h2>
                    </div>
                `
                    $("#searchResult").append(searchResultHtmlTitle);

                    results.forEach((flight) => {

                        arrivalTime = String(new Date(Date.parse(flight.embarkDate) + parseInt(flight.travelTime.substr(0, 2)) * 60000 * 60 + parseInt(flight.travelTime.substr(8, 10)) * 60000))
                        arrivalTime = arrivalTime.substr(0, 24)

                        embarkDate = String(new Date(flight.embarkDate))
                        embarkDate = embarkDate.substr(0, 24)

                        searchResultHtml = `  
                    <div class="container mb-3 searchResultDiv" style="background-color:white;">
                        <div class="row">    
                            <div class="col-md-9 text-start">
                                <p><br>Board at ${flight.embarkDate}</p>
                            </div>

                            <div class="col-md-3 text-center" style="color:white;background-color:rgb(59, 209, 59); border: 2px solid black">
                                <h5><br>Economy</h5>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3 text-center">
                                <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${flight.originAirport}</h3>
                                <p>From: ${flight.originCountry}</p>
                                <p style="color: darkgrey">${embarkDate}</p>
                            </div>
                    
                            <div class="col-md-1 text-center">
                                <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                <p style="font-size: 14px;">${flight.travelTime}</p>
                            </div>

                            <div class="col-md-3 text-center">
                                <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${flight.destinationAirport}</h3>
                                <p>To: ${flight.destinationCountry}</p>
                                <p style="color: darkgrey">${arrivalTime}</p>
                            </div>

                            <div class="col-md-2 text-center">
                                <span class="moreDetailsIcon"><i class="fa fa-info-circle fa-2x mb-2" aria-hidden="true"></i><br>
                                <a href="${baseUrl}/flight_details/?flightid=${flight.flightid}" class="moreDetails" target="_blank">More Details</a></span>
                            </div>

                            <div class="col-md-3 text-center px-0 py-auto" style="border-left: 2px solid black; border-bottom: 2px solid black;border-right: 2px solid black;">
                                <h5><br>FROM SGD</h5>
                                <h2 style="color:rgb(59, 209, 59);" >$ ${(flight.price).toFixed(2)}</h2>
                                <h5>Per Adult</h5>
                            </div>
                        </div>
                    </div>
                    `
                        $("#searchResult").append(searchResultHtml);
                    })
                }
                return
            })
    }

    async function bestTransferFlightQuery(i, originAirport_id, destinationAirport_id, embarkDate) {
        //  Endpoint 11: GET /bestTransfer/flight/:originAirportId/:destinationAirportId/  //
        await axios.get(`${baseUrl}/bestTransfer/flight/${originAirport_id}/${destinationAirport_id}/${embarkDate}`)
            .then((res) => {
                result = res.data
                if ($('#errorMessage').attr('name') != 'error') {
                    if (Object.keys(result).length == 1 && result.message != undefined) {  // Error in db pertaining to query, no flights //
                        if (i === 1) { // for return flights, when there are flights from origin to destination but no return Flights //
                            history.replaceState(`/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/bestTransfer`, "page 3", `/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/bestTransfer`)
                            searchResultHtmlTitle = `
                            <h4 class="mt-5">Search Flight Results</h4>
                            <hr>

                            <div class="container text-center py-2 searchResultDiv" style="background-color:white;"><h5>No Return transfer Flights Found</h5></div>
                        `
                            $("#searchResult").append(searchResultHtmlTitle);
                            return// break out of function //
                        }
                        window.history.pushState("data", "Title", '/');
                        $('#errorMessage').attr('name', 'error')
                        $('#errorMessage').html(`${result.message}`)
                        $('#errorModal').modal('show');
                        return
                    }
                    // replacing the url of the page without any reloading //
                    history.pushState(`/?/direct/${originAirport_id}/${destinationAirport_id}/${embarkDate}/bestTransfer`, "page 2", `/?/direct/${originAirport_id}/${destinationAirport_id}/${embarkDate}/bestTransfer`)
                    if (i == 1) { // for return flights //
                        history.replaceState(`/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/bestTransfer`, "page 3", `/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/bestTransfer`)
                    }
                    ogEmbarkDate = embarkDate

                    searchResultHtmlTitle = `
                    <h4 class="mt-5">Search Flight Results</h4>
                    <hr>
                    <div class="container text-start">
                        <h5 class="fw-bold" style="color: rgb(37, 90, 206);">${i + 1}. From &nbsp${result[0].originAirport}  &nbsp&nbsp;&nbspto&nbsp&nbsp;&nbsp ${result[0].transferAirport} , then &nbsp&nbsp;to&nbsp;&nbsp&nbsp ${result[0].destinationAirport}</h5>
                    </div>
                    `
                    $("#searchResult").append(searchResultHtmlTitle);

                    result.forEach((transferFlight) => {
                        arrivalTime = String(new Date(transferFlight.embarkDate2))
                        arrivalTime = arrivalTime.substr(0, 24)

                        embarkDate = String(new Date(transferFlight.embarkDate1))
                        embarkDate = embarkDate.substr(0, 24)

                        destinationArrivalTime = String(new Date(Date.parse(arrivalTime) + parseInt(transferFlight.time2.substr(0, 2)) * 60000 * 60 + parseInt(transferFlight.time2.substr(8, 10)) * 60000))
                        destinationArrivalTime = destinationArrivalTime.substr(0, 24)

                        searchResultHtml = `  
                        <div class="container mb-3 searchResultDiv" style="background-color:white;">
                            <div class="row">    
                                <div class="col-md-9 text-start">
                                    <p><br>Board at ${embarkDate}</p>
                                </div>

                                <div class="col-md-3 text-center" style="color:white;background-color:rgb(59, 209, 59); border: 2px solid black">
                                    <h5><br>Economy</h5>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-2 text-center">
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${transferFlight.originAirport}</h3>
                                    <p>Board at<br>${embarkDate}</p>
                                    <a href="${baseUrl}/flight_details/?flightid=${transferFlight.firstFlightId}" class="moreDetails" target="_blank"><span><i class="fa fa-info-circle mb-2" aria-hidden="true">&nbsp;</i></span>More Details</a>
                                </div>
                        
                                <div class="col-md-1 text-center mt-5">
                                    <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                    <p style="font-size: 14px;">${transferFlight.time1}</p>
                                </div>

                                <div class="col-md-2 text-center">
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${transferFlight.transferAirport}</h3>
                                    <p>Board at<br>${arrivalTime}</p>
                                    <a href="${baseUrl}/flight_details/?flightid=${transferFlight.secondFlightId}" class="moreDetails" target="_blank"><span><i class="fa fa-info-circle mb-2" aria-hidden="true">&nbsp;</i></span>More Details</a>
                                </div>

                                <div class="col-md-1 text-center mt-5">
                                    <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                    <p style="font-size: 14px;">${transferFlight.time2}</p>
                                </div>

                                <div class="col-md-3 text-center">
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${transferFlight.destinationAirport}</h3>
                                    <p>Arrive at<br>${destinationArrivalTime}</p>
                                </div>


                                <div class="col-md-3 text-center px-0 py-auto" style="border-left: 2px solid black; border-bottom: 2px solid black;border-right: 2px solid black;">
                                    <h5 class="mt-5">FROM SGD</h5>
                                    <h2 style="color:rgb(59, 209, 59);" >$ ${(transferFlight.price).toFixed(2)}</h2>
                                    <h5>Per Adult</h5>
                                </div>
                            </div>
                        </div>
                        `
                        $("#searchResult").append(searchResultHtml);
                    })
                }
                return
            })
    }

    async function transferFlightQuery(i, originAirport_id, destinationAirport_id, transferAirport_id, embarkDate) {
        // Endpoint 31: GET /transfer/flight/:originAirportId/:destinationAirportId/:transferairportId/:embarkDate //
        await axios.get(`${baseUrl}/transfer/flight/${originAirport_id}/${destinationAirport_id}/${transferAirport_id}/${embarkDate}`)
            .then((res) => {
                result = res.data
                if ($('#errorMessage').attr('name') != 'error') {
                    if (Object.keys(result).length == 1 && result.message != undefined) {  // Error in db pertaining to query, no flights //
                        if (i === 1) { // for return flights, when there are flights from origin to destination but no return Flights //
                            history.replaceState(`/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/transfer/${transferAirport_id}`, "page 3", `/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/transfer/${transferAirport_id}`)
                            searchResultHtmlTitle = `
                            <h4 class="mt-5">Search Flight Results</h4>
                            <hr>

                            <div class="container text-center py-2 searchResultDiv" style="background-color:white;"><h5>No Return transfer Flights Found</h5></div>
                        `
                            $("#searchResult").append(searchResultHtmlTitle);
                            return// break out of function //
                        }
                        window.history.pushState("data", "Title", '/');
                        $('#errorMessage').attr('name', 'error')
                        $('#errorMessage').html(`${result.message}`)
                        $('#errorModal').modal('show');
                        return
                    }
                    // replacing the url of the page without any reloading //
                    history.pushState(`/?/direct/${originAirport_id}/${destinationAirport_id}/${embarkDate}/transfer/${transferAirport_id}`, "page 2", `/?/direct/${originAirport_id}/${destinationAirport_id}/${embarkDate}/transfer/${transferAirport_id}`)
                    if (i == 1) { // for return flights //
                        history.replaceState(`/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/transfer/${transferAirport_id}`, "page 3", `/?/return/${destinationAirport_id}/${originAirport_id}/${ogEmbarkDate}/${embarkDate}/transfer/${transferAirport_id}`)
                    }
                    ogEmbarkDate = embarkDate

                    searchResultHtmlTitle = `
                    <h4 class="mt-5">Search Flight Results</h4>
                    <hr>
                    <div class="container text-start">
                        <h5 class="fw-bold" style="color: rgb(37, 90, 206);">${i + 1}. From &nbsp${result[0].originAirport}  &nbsp&nbsp;&nbspto&nbsp&nbsp;&nbsp ${result[0].transferAirport} , then &nbsp&nbsp;to&nbsp;&nbsp&nbsp ${result[0].destinationAirport}</h5>
                    </div>
                    `
                    $("#searchResult").append(searchResultHtmlTitle);

                    result.forEach((transferFlight) => {
                        arrivalTime = String(new Date(transferFlight.embarkDate2))
                        arrivalTime = arrivalTime.substr(0, 24)

                        embarkDate = String(new Date(transferFlight.embarkDate1))
                        embarkDate = embarkDate.substr(0, 24)

                        destinationArrivalTime = String(new Date(Date.parse(arrivalTime) + parseInt(transferFlight.time2.substr(0, 2)) * 60000 * 60 + parseInt(transferFlight.time2.substr(8, 10)) * 60000))
                        destinationArrivalTime = destinationArrivalTime.substr(0, 24)

                        searchResultHtml = `  
                        <div class="container mb-3 searchResultDiv" style="background-color:white;">
                            <div class="row">    
                                <div class="col-md-9 text-start">
                                    <p><br>Board at ${embarkDate}</p>
                                </div>

                                <div class="col-md-3 text-center" style="color:white;background-color:rgb(59, 209, 59); border: 2px solid black;">
                                    <h5><br>Economy</h5>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-2 text-center">
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${transferFlight.originAirport}</h3>
                                    <p>Board at<br>${embarkDate}</p>
                                    <a href="${baseUrl}/flight_details/?flightid=${transferFlight.firstFlightId}" class="moreDetails" target="_blank"><span><i class="fa fa-info-circle mb-2" aria-hidden="true">&nbsp;</i></span>More Details</a>
                                </div>
                        
                                <div class="col-md-1 text-center mt-5">
                                    <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                    <p style="font-size: 14px;">${transferFlight.time1}</p>
                                </div>

                                <div class="col-md-2 text-center">
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${transferFlight.transferAirport}</h3>
                                    <p>Board at<br>${arrivalTime}</p>
                                    <a href="${baseUrl}/flight_details/?flightid=${transferFlight.secondFlightId}" class="moreDetails" target="_blank"><span><i class="fa fa-info-circle mb-2" aria-hidden="true">&nbsp;</i></span>More Details</a>
                                </div>

                                <div class="col-md-1 text-center mt-5">
                                    <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                    <p style="font-size: 14px;">${transferFlight.time2}</p>
                                </div>

                                <div class="col-md-3 text-center">
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${transferFlight.destinationAirport}</h3>
                                    <p>Arrive at<br>${destinationArrivalTime}</p>
                                </div>


                                <div class="col-md-3 text-center px-0 py-auto" style="border-left: 2px solid black; border-bottom: 2px solid black;border-right: 2px solid black;">
                                    <h5>FROM SGD</h5>
                                    <h2 style="color:rgb(59, 209, 59);" >$ ${(transferFlight.price).toFixed(2)}</h2>
                                    <h5>Per Adult</h5>
                                </div>
                            </div>
                        </div>
                        `
                        $("#searchResult").append(searchResultHtml);
                    })
                }
                return
            })
    }


    // this is executed for the case if user shares search result link //
    // we would want to display the same search results //
    var searchString = window.location.search
    if (searchString !== "") {
        // we then split it by "?/" to see what the user has requested for the search form //
        // e.g. http://localhost:8081/?/return/2/1/2022-12-27/2023-01-01 means just a normal return flight with no transfers. //
        tmpArr = searchString.split("?/")
        tmpArr = tmpArr[1].split("/") // tmpArr = e.g. ['return', '1', '2', '2022-12-27', '2023-01-01'] //

        $("#searchResult").empty() // Clear the search result div first //
        $('#From').val(parseInt(tmpArr[1]))
        $('#To').val(parseInt(tmpArr[2]))
        $('#departDate').val(tmpArr[3])
        // first we will validate date inputs via regex//
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        // we will know process the url for return, direct and transfer //
        if (tmpArr[0] == 'return') {
            // ensure that url is correct (date validation whr embark Date < return Date) //
            // first we will validate date inputs via regex//
            // Date vaidation //
            if (Date.parse(tmpArr[4]) < Date.parse(tmpArr[3]) || tmpArr[4].match(regex) === null || tmpArr[3].match(regex) === null) {
                window.location.href = "/error"
            }

            $('#returnDate').val(tmpArr[4])
            $("#flightType").val("returnFlight")
            if (tmpArr[5] == undefined) {  // for non transfer return flights //
                async function secondFunction() {
                    i = 0
                    ogEmbarkDate = null
                    await searchFlightQuery(i, tmpArr[1], tmpArr[2], tmpArr[3])
                    if ($('#errorMessage').attr('name') != "error" && i == 0) {
                        i = 1
                        await searchFlightQuery(i, tmpArr[2], tmpArr[1], tmpArr[4])
                    }
                }
                $('#errorMessage').attr('name', "noError") // reset /
                secondFunction()
            } else {  // Transfer Flight with return //

                if (tmpArr[5] == 'transfer') {  // normal transfer return flight //
                    $("#confirmTransferFlight").prop("checked", true); // check the checkbox //
                    $("#confirmTransferFlight").trigger('change')
                    $("#transferAirport").val(tmpArr[6])
                    async function transferFunc() {
                        i = 0
                        ogEmbarkDate = null
                        await transferFlightQuery(i, tmpArr[1], tmpArr[2], tmpArr[6], tmpArr[3])
                        if ($("#flightType").val() === 'returnFlight' && $('#errorMessage').attr('name') != "error" && i == 0) {
                            i = 1
                            await transferFlightQuery(i, tmpArr[2], tmpArr[1], tmpArr[6], tmpArr[4])
                        }
                    }
                    $('#errorMessage').attr('name', "noError") // reset /
                    transferFunc()
                } else if (tmpArr[5] == 'bestTransfer') {  // best transfer return flight //
                    // disable transfer airport select //
                    $("#transferAirport").val("");
                    $("#transferAirport").prop("disabled", true);     // To disable the input //
                    $("#confirmTransferFlight").prop("checked", true); // check the checkbox //
                    $("#confirmTransferFlight").trigger('change')
                    $("#confirmBestTransferFlight").prop("checked", true); // check the checkbox //

                    //  Endpoint 11: GET /bestTransfer/flight/:originAirportId/:destinationAirportId/:embarkDate  //
                    //  Retrieves data of all flights from origin airport to destination airport with 1 best flight transfer  //
                    async function bestTransferFunc() {
                        i = 0
                        ogEmbarkDate = null
                        await bestTransferFlightQuery(i, tmpArr[1], tmpArr[2], tmpArr[3])
                        if ($("#flightType").val() === 'returnFlight' && $('#errorMessage').attr('name') != "error" && i == 0) {
                            i = 1
                            await bestTransferFlightQuery(i, tmpArr[2], tmpArr[1], tmpArr[4])
                        }
                    }
                    $('#errorMessage').attr('name', "noError") // reset /
                    bestTransferFunc()
                }
            }

        } else if (tmpArr[0] == 'direct') { // direct flights only //
            // Date validation //
            if (tmpArr[3].match(regex) === null) {
                window.location.href = "/error"
            }

            $("#returnDate").attr("type", "text")      // Change type to text in order to make value empty //
            $("#returnDate").val("");
            $("#returnDate").prop("disabled", true);  // To disable the input //
            $("#flightType").val("directFlight")
            if (tmpArr[4] == undefined) {  // for non transfer direct flights //
                async function secondFunction() {
                    i = 0
                    await searchFlightQuery(i, tmpArr[1], tmpArr[2], tmpArr[3])
                }
                $('#errorMessage').attr('name', "noError") // reset /
                secondFunction()
            } else { // Direct Transfer Flight  //
                if (tmpArr[4] == 'transfer') {  // normal transfer direct flight //
                    $("#confirmTransferFlight").prop("checked", true); // check the checkbox //
                    $("#confirmTransferFlight").trigger('change')
                    $("#transferAirport").val(tmpArr[5])
                    async function transferFunc() {
                        i = 0
                        await transferFlightQuery(i, tmpArr[1], tmpArr[2], tmpArr[5], tmpArr[3])
                    }
                    $('#errorMessage').attr('name', "noError") // reset /
                    transferFunc()
                } else if (tmpArr[4] == 'bestTransfer') { // best transfer direct flight //
                    // disable transfer airport select //
                    $("#transferAirport").val("");
                    $("#transferAirport").prop("disabled", true);     // To disable the input //
                    $("#confirmTransferFlight").prop("checked", true); // check the checkbox //
                    $("#confirmTransferFlight").trigger('change')
                    $("#confirmBestTransferFlight").prop("checked", true); // check the checkbox //
                    //  Endpoint 11: GET /bestTransfer/flight/:originAirportId/:destinationAirportId/:embarkDate  //
                    //  Retrieves data of all flights from origin airport to destination airport with 1 best flight transfer  //
                    async function bestTransferFunc() {
                        i = 0
                        await bestTransferFlightQuery(i, tmpArr[1], tmpArr[2], tmpArr[3])
                    }
                    $('#errorMessage').attr('name', "noError") // reset /
                    bestTransferFunc()
                }
            }
        }
    }

    // Event for when user presses search // 
    // we will first check whether it is a one way flight or return flight //
    $("#searchForm").on('submit', () => {
        try {
            event.preventDefault();    // Prevents reloading of page when pres submit button //

            $("#searchResult").empty() // Clear the search result div first //
            originAirport_id = $('#From').val()
            destinationAirport_id = $('#To').val()
            embarkDate = $('#departDate').val()
            returnDate = $('#returnDate').val()  // this is = "" if it is direct flight //

            if ($("#confirmTransferFlight").is(':checked')) {
                transferFlightConfirm = true
            } else {
                transferFlightConfirm = false
            }

            // first we will validate date inputs via regex//
            const regex = /^\d{4}-\d{2}-\d{2}$/;

            if (embarkDate.match(regex) === null && $("#flightType").val() === 'directFlight') {
                $('#errorMessage').html(`Please Enter Date fields correctly`)
                $('#errorModal').modal('show');
                window.history.pushState("data", "Title", '/');
                $("#searchResult").empty() // Clear the search result div //
                return
            } else if ($("#flightType").val() === 'returnFlight' && (returnDate.match(regex) === null || embarkDate.match(regex) === null || Date.parse(embarkDate) > Date.parse(returnDate))) {
                $('#errorMessage').html(`Please Enter Date fields correctly`)
                $('#errorModal').modal('show');
                $("#searchResult").empty() // Clear the search result div //
                window.history.pushState("data", "Title", '/');
                return
            }
            // for direct and return flights without any transfer // 
            if (transferFlightConfirm == false) {
                async function secondFunction() {
                    i = 0
                    ogEmbarkDate = null
                    await searchFlightQuery(i, originAirport_id, destinationAirport_id, embarkDate)
                    if ($("#flightType").val() === 'returnFlight' && $('#errorMessage').attr('name') != "error" && i == 0) {
                        i = 1
                        await searchFlightQuery(i, destinationAirport_id, originAirport_id, returnDate)
                    }
                }
                $('#errorMessage').attr('name', "noError") // reset /
                secondFunction()

                // below is advanced feature: transfer flights //
            } else if (transferFlightConfirm == true) {
                // for transfer flights //
                // we have 2 apis //
                // we need to first check whether best transfer flight checkbox is checked //
                // then, we check whether return flight is selected //
                if ($("#confirmBestTransferFlight").is(':checked')) { // best transfer flight is selected //
                    //  Endpoint 11: GET /bestTransfer/flight/:originAirportId/:destinationAirportId/:embarkDate  //
                    //  Retrieves data of all flights from origin airport to destination airport with 1 best flight transfer  //
                    async function bestTransferFunc() {
                        i = 0
                        await bestTransferFlightQuery(i, originAirport_id, destinationAirport_id, embarkDate)
                        if ($("#flightType").val() === 'returnFlight' && $('#errorMessage').attr('name') != "error" && i == 0) {
                            i = 1
                            await bestTransferFlightQuery(i, destinationAirport_id, originAirport_id, returnDate)
                        }
                    }
                    $('#errorMessage').attr('name', "noError") // reset /
                    bestTransferFunc()
                } else {
                    // normal transfer flight where user gets to pick which transfer airport they want //
                    // Endpoint 31: GET /transfer/flight/:originAirportId/:destinationAirportId/:transferairportId/:embarkDate //
                    transferAirport_id = $("#transferAirport").val()
                    async function transferFunc() {
                        i = 0
                        await transferFlightQuery(i, originAirport_id, destinationAirport_id, transferAirport_id, embarkDate)
                        if ($("#flightType").val() === 'returnFlight' && $('#errorMessage').attr('name') != "error" && i == 0) {
                            i = 1
                            await transferFlightQuery(i, destinationAirport_id, originAirport_id, transferAirport_id, returnDate)
                        }
                    }
                    $('#errorMessage').attr('name', "noError") // reset /
                    transferFunc()
                }
            }

        } catch (err) {
            console.log(err);
            window.location.href = "/error"
        }
    })
})
