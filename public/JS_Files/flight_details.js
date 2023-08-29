
const baseUrl = "http://localhost:8081";

$(document).ready(async () => {
    // In this page, we first want to extract the flightid from the url //
    // we will use window.location.search to retrieve the string "?flightid=<flightid>" from the url //
    var searchString = window.location.search
    // we then split it by "?flightid=" to get the flight id in index 1 of the array //
    tmpArr = searchString.split("?flightid=")
    flightid = tmpArr[1]

    async function retrieveFlightDetails(flightid) {
        // With flightid, we can do an axios req to // End point 17: GET /product_listing/:flightid // to retreive flight information with its subsquent img //
        await axios.get(`${baseUrl}/flight/${flightid}`)
            .then((res) => {
                flight = res.data[0][0]
                try {
                    flightImg = res.data[1][0].image_url
                } catch {  // for when flightImg is undefined as product_listing do not have an image attatched to flight
                    flightImg = "#"
                }
                // first calc arrival time //
                arrivalTime = String(new Date(Date.parse(flight.embarkDate) + parseInt(flight.travelTime.substr(0, 2)) * 60000 * 60 + parseInt(flight.travelTime.substr(8, 10)) * 60000))
                arrivalTime = arrivalTime.substr(0, 24)

                embarkDate = String(new Date(flight.embarkDate))
                embarkDate = embarkDate.substr(0, 24)

                // we can now display the flight details //
                flightDetailsHtml = `
                    <div class="container my-5 px-0 pt-3" style="background-color: white">
                        <div class="text-center">
                            <h2 style="font-weight: bold">Flight Details</h2>
                            <img src="${flightImg}" alt="Flight has no Img" style="height:300px;">
                            <h4><br>Flight Code &#x25cf; <span style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${flight.flightCode}</span></h4>
                            <h4>Aircraft &#x25cf; <span style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${flight.aircraft}</span></h4>
                        </div>
                        <div class="container mt-3" style="background-color: white;">
                            <div class="row">    
                                <div class="col-md-9 text-start" style="border-top: 2px solid black;border-left: 2px solid black;">
                                    <p><br>Board at ${flight.embarkDate}</p>
                                </div>

                                <div class="col-md-3 text-center" style="background-color:rgb(61, 246, 19);border: 2px solid black;">
                                    <h5><br>Economy</h5>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4 text-center" style="border-bottom: 2px solid black; border-left: 2px solid black;">
                                    <p style="color: darkgrey">Embark Airport</p>
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${flight.originAirport}</h3>
                                    <p>From: ${flight.originCountry}<br>${flight.originDescription}</p>
                                    <p style="color: darkgrey">${embarkDate}</p>
                                </div>
                        
                                <div class="col-md-1 text-center" style="border-bottom: 2px solid black;">
                                    <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                    <p style="font-size: 14px;">Travel Time: ${flight.travelTime}</p>
                                </div>

                                <div class="col-md-4 text-center" style="border-bottom: 2px solid black;">
                                    <p style="color: darkgrey">Depature Airport</p>
                                    <h3 style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${flight.destinationAirport}</h3>
                                    <p>To: ${flight.destinationCountry}<br>${flight.destinationDescription}<br></p>
                                    <p style="color: darkgrey">${arrivalTime}</p>
                                </div>

                                <div class="col-md-3 text-center px-0 py-auto" style="border-left: 2px solid black;border-bottom: 2px solid black;border-right: 2px solid black;">
                                    <h5><br>FROM SGD</h5>
                                    <h2 style="color:rgb(59, 209, 59);" >$ ${(flight.price).toFixed(2)}</h2>
                                    <h5>Per Adult</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                $("#flightDetails").append(flightDetailsHtml)
            })

            .catch((err) => {
                console.log(err);
                window.location.href = "/error"
            })
    }

    async function retreiveFlightPromotion(flightid) {
        try {
            // End point 12 : GET /promotions/flight/:flightid/ //
            await axios.get(`${baseUrl}/promotions/flight/${flightid}/`)
                .then((res) => {
                    result = res.data
                    promotions = result

                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no promotion exists //
                        flightPromotionInfoHtml = `
                            <tr class="promotion_tableRow">
                                <td></td>
                                <td></td>
                                <td>${result.message}</td>
                                <td></td>
                                <td></td>
                            </tr>
                            `
                        $("#flight_reference_promotionInfo").append(flightPromotionInfoHtml)
                        return
                    }

                    i = 1
                    result.forEach((flightPromotion) => {
                        // date formatting //
                        promotionStart = String(new Date(flightPromotion.promotional_period_start))
                        promotionStart = promotionStart.substr(0, 24)
                        promotionEnd = String(new Date(flightPromotion.promotional_period_end))
                        promotionEnd = promotionEnd.substr(0, 24)

                        flightPromotionInfoHtml = `
                            <tr class="flight_reference_promotion_tableRow">
                                <td>${i}</td>
                                <td>${flightPromotion.discount}</td>
                                <td>${promotionStart}</td>
                                <td>${promotionEnd}</td>
                                <td>
                                    <a id="chosenPromo_${i}-promoid_${flightPromotion.promotionid}" class="choosePromo" title="Choose" data-bs-toggle="tooltip">
                                        <i class="fa fa-check" aria-hidden="true"></i>
                                    </a>
                                </td>
                            </tr>
                            `
                        $("#flight_reference_promotionInfo").append(flightPromotionInfoHtml)
                        i += 1
                    })
                })

                .catch((err) => {
                    console.log(err)
                    window.location.href = "/error"
                })

        } catch {
            window.location.href = "/error"
        }
    }

    await retreiveFlightPromotion(flightid)
    await retrieveFlightDetails(flightid)

    // pagination for my table //
    // from: https://datatables.net/  //
    $("#flight_reference_promotionTable").dataTable()

    $("#loading").attr('class', 'd-none')
    // Enable the page after all data load finish //
    $("#awaitLoading").attr('style', '')

    // choosing of promotion //
    $(".choosePromo").on('click', (event) => {
        a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
        a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
        tmpArr = a_id.split("-")
        promotionid = tmpArr[1].split("_")[1]
        chosenPromoNum = tmpArr[0].split("_")[1]

        $(".choosePromo").attr('style', 'color: blue')   // reset color //
        $(`#${a_id}`).attr('style', 'color: green')      // change selected promotion tick color to green //

        $("#successMessage").html(`Chosen Promotion #${chosenPromoNum}`)
        $("#successModal").modal('show')
        localStorage.setItem('promotionid', promotionid); // we will save this in user's local storage //
    })

    // removing promotion //
    $("#removePromotion").on('click', () => {
        var promotionid = localStorage.getItem('promotionid')
        // we first check whether promotion id exists //
        if (promotionid == null) {
            $('#errorMessage').html(`No Promotion selected. Cannot remove any promotion`)
            $('#errorModal').modal('show');
            return
        }
        $(".choosePromo").attr('style', 'color: blue')   // reset color //
        localStorage.removeItem('promotionid'); // clear promotion id//
        $("#successMessage").html(`promotion removed!`)
        $("#successModal").modal('show')
    })

    $("#book_flight").on('click', () => {
        // first, we must ensure that user is logged in //
        var token = localStorage.getItem('token')
        // We then want to check whether the user is logged in //
        // we do this by checking the local storage then verifying the token //
        // if user is logged in, we then can show bookings form //
        try {
            if (token === null) {
                // not logged in, we will redirect to login page //
                window.location.assign(`${baseUrl}/login`)
            }
            axios.post(`${baseUrl}/verifyToken`, {}, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then(async (res) => {
                    result = res.data
                    // if valid token, this means that user is logged in. result = {message: 'LOGGED IN'}//
                    if (result.message === 'LOGGED IN' || result.message == "ADMIN CREDENTIALS CORRECT") {
                        $("#bookFlightForm").modal('show')
                        // knowing that user is logged in, we can now finally retrieve user information //
                        await axios.post(`${baseUrl}/users/id/`, {}, {
                            headers: { "Authorization": "Bearer " + token }
                        })
                            .then((res) => {
                                userInfo = res.data
                                userid = userInfo[0].userid
                                var promotionid = localStorage.getItem('promotionid')
                                // using userInfo, we can now add this to booking cart table //
                                // Endpoint 33: POST /booking_cart/:userid/:flightid/:promotionid //
                                axios.post(`${baseUrl}/booking_cart/${userid}/${flightid}`, { "promotionid": promotionid }, {
                                    headers: { "Authorization": "Bearer " + token }
                                })
                                    .then((res) => {
                                        result = res.data
                                        if (Object.keys(result).length == 1 && result.message !== undefined) {
                                            $('#errorMessage').html(`${result.message}`)
                                            $('#errorModal').modal('show');
                                            return
                                        }

                                        // successfully added to booking cart //
                                        localStorage.removeItem('promotionid'); // clear promotion id//
                                        $("#successMessage").html('Booking has been added to cart!')
                                        $("#successModal").modal('show')
                                        $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                                        return
                                    })
                                    .catch((err) => {  // any possible errors with booking cart, we just redirect to error page //
                                        console.log(err);
                                        window.location.href = "/error"
                                    })
                            })
                            .catch((err) => {  // any possible errors with retrieving user info, we just redirect to login page//
                                console.log(err);
                                window.location.assign(`${baseUrl}/login`)
                            })
                    } else {
                        // not logged in, we will redirect to login page //
                        window.location.assign(`${baseUrl}/login`)
                    }
                })
                .catch(() => {
                    // not logged in, we will redirect to login page if token is not valid//
                    window.location.assign(`${baseUrl}/login`)
                })

        } catch {
            window.location.href = "/error"
        }
    })

    // Filter table rows based on searched term for discount in flight promotions table //
    $("#flight_reference_promotionSearch").on("keyup", function () {
        var term = $(this).val()
        $("#flight_reference_promotionTable #flight_reference_promotionInfo .flight_reference_promotion_tableRow").each(function () {
            $row = $(this);
            var name = $row.find("td:nth-child(1)").text()
            if (name.search(term) < 0) {
                $row.hide();
            } else {
                $row.show();
            }
        });
    });
})
