
const baseUrl = "http://localhost:8081";

$(document).ready(async () => {
    var isLoading = false;  // to ensure that even with multiple clicks, api will only call and once and not crash //
    var userid = null
    var token = localStorage.getItem('token')
    // We then want to check whether the user is logged in //
    // we do this by checking the local storage then verifying the token //
    // if user is logged in, we will change the <a> of the <nav> for sign up | login to profile and change the href to redirect to profile page //
    async function isUserloggedIn() {
        try {
            if (token === null) {
                // not logged in, we will redirect to login page //
                window.location.assign(`${baseUrl}/login`)
            }
            await axios.post(`${baseUrl}/verifyToken`, {}, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then(async (res) => {
                    result = res.data
                    // if valid token, this means that user is logged in. result = {message: 'LOGGED IN'}//
                    if (result.message === 'LOGGED IN' || result.message == "ADMIN CREDENTIALS CORRECT") {
                        // we will now change the nav bar using jquery //
                        $("#nav-login").attr('href', '/profile')
                        $("#nav-login").html(`<i class="fa fa-user-o"></i> Profile`)

                        // showing of booking cart in nav bar //
                        $("#nav_bookingCart").html(`<i class="fa fa-shopping-cart" aria-hidden="true"></i> Booking Cart`)
                        $("#nav_bookingCart").attr('href', '/booking_cart')

                        // enable the html page //
                        document.getElementsByTagName("html")[0].style.visibility = "visible";
                        document.getElementsByTagName("body")[0].style = "background-image: url('../images/bookingCart.jpg');background-size: cover;"


                        if (result.message == "ADMIN CREDENTIALS CORRECT") {
                            // showing of admin panel 
                            $("#admin_panel").attr('href', '/admin_panel')
                            $("#admin_panel").html("Admin Panel")
                        }

                        // knowing that user is logged in, we can now finally retrieve user information //
                        await axios.post(`${baseUrl}/users/id/`, {}, {
                            headers: { "Authorization": "Bearer " + token }
                        })
                            .then((res) => {
                                userid = res.data[0].userid  // storing of user_info // we only need userid //
                                return
                            })
                            .catch(() => { window.location.href = "/error" })

                    } else {
                        // not logged in, we will redirect to login page //
                        window.location.assign(`${baseUrl}/login`)
                    }
                })
                .catch(() => {
                    window.location.assign(`${baseUrl}/login`)
                })

        } catch {
            window.location.href = "/error"
        }
    }

    async function retrieveBookingCart() {
        // Endpoint 35: GET /booking_cart/:userid //
        await axios.get(`${baseUrl}/booking_cart/${userid}`, {
            headers: { "Authorization": "Bearer " + token }
        })
            .then((res) => {
                result = res.data
                if (Object.keys(result).length == 1 && result.message != undefined) { // for when no bookings in cart //
                    cartInfoHtml = `
                    <tr class="bookingCartRow">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>${result.message}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    `
                    $("#bookingCartInfo").append(cartInfoHtml)
                    return
                }
                i = 1
                result.forEach((flight) => {
                    // date formatting //
                    embarkDate = String(new Date(flight.embarkDate))
                    embarkDate = embarkDate.substr(0, 24)

                    dateAdded = String(new Date(flight.added_at))
                    dateAdded = dateAdded.substr(0, 24)

                    // appending of cart info if there are results //
                    cartInfoHtml = `
                    <tr class="airport_tableRow">
                        <td>${i}</td>
                        <td>${flight.originAirport}</td>
                        <td>${flight.destinationAirport}</td>
                        <td>${embarkDate}</td>
                        <td>${flight.price}</td>
                    `
                    if (flight.discount != null) {
                        cartInfoHtml += `
                        <td>${flight.discount}</td>
                        `
                    } else {
                        cartInfoHtml += `<td>None</td>`
                    }
                    cartInfoHtml += `
                        <td>${dateAdded}</td>
                        <td class="text-center pt-4"><a style="color: white;" target="_blank" class="btn btn-primary" href="${baseUrl}/flight_details/?flightid=${flight.flightid}" role="button"><i class="fa fa-paper-plane" aria-hidden="true"></i></a></td>
                        <td class="text-center">
                            <button type="button" id="flight_${flight.flightid}-promo_${flight.promotionid}" class="btn btn-success bookFlight">Book Flight</button>
                            <hr>
                            <a style="color: red;" id="bookingCart_${flight.booking_cart_id}" class="removeFlight" title="Remove Flight" data-bs-toggle="tooltip"><i class="fa fa-times" aria-hidden="true"></i></a>
                        </td>
                    </tr>
                    `


                    i += 1
                    $("#bookingCartInfo").append(cartInfoHtml)
                })
            })

            .catch((err) => {
                console.log(err)
                // window.location.href = "/error"
            })
    }

    await isUserloggedIn()
    await retrieveBookingCart()

    // pagination for my table //
    // from: https://datatables.net/  //
    $("#bookingTable").dataTable()

    $("#loading").attr('class', 'd-none')
    // Enable the page after all data load finish //
    $("#awaitLoading").attr('style', '')

    $(".bookFlight").on('click', (event) => { // for the case user wants to book a flight //
        a = event.target.closest('button')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
        a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. flight_1-promo-null //
        flightid = a_id.split("-")[0].split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //
        promotionid = a_id.split("-")[1].split("_")[1]

        $("#bookFlightForm").modal('show')

        // for submitting of event, we want to post on bookings table the relavent information //
        $("#bookFlight").on('submit', async (event1) => {
            event1.preventDefault();

            const requestBody = {
                "name": $("#name").val(),
                "passport": $("#passport").val(),
                "nationality": $("#nationality").val(),
                "age": $("#age").val(),
                "promotionid": promotionid
            }

            // Endpoint 9: POST /booking/:userid/:flightid   //
            await axios.post(`${baseUrl}/booking/${userid}/${flightid}`, requestBody, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then((res) => {
                    result = res.data
                    if (Object.keys(result).length == 1 && result.message !== undefined) {
                        $('#errorMessage').html(`${result.message}`)
                        $('#errorModal').modal('show');
                        return
                    }

                    // successfully booked //
                    localStorage.removeItem('promotionid'); // clear promotion id//
                    $("#successMessage").html('Booking has been made!')
                    $("#successModal").modal('show')
                    $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                    return
                })
                .catch((err) => {  // any possible errors with booking, we just redirect to error page //
                    console.log(err);
                    window.location.href = "/error"
                })
        })
    })

    // for the case when user wants to remove the flight from their booking cart //
    $(".removeFlight").on('click', (event) => {
        a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
        a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. bookingCart_2 //
        bookingCartid = a_id.split("_")[1]

        $("#deleteMessage").html(`Delete flight from booking cart?`)
        $("#deleteModal").modal('show')

        $("#confirmDelete").on('click', async () => {
            $('#confirmDelete').prop('disabled', true);  // disable the button //
            if (!isLoading) {
                isLoading = true
                // we will use the delete booking cart api to remove the flight and refresh the page //
                // Endpoint 36: DELETE /booking_cart/:booking_cart_id //
                await axios.delete(`${baseUrl}/booking_cart/${bookingCartid}`, {
                    headers: { "Authorization": "Bearer " + token }
                })
                    .then((res) => {
                        result = res.data
                        $("#successMessage").html(`flight has been deleted off booking cart!`)
                        $("#successModal").modal('show')
                        $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                    })
                    .catch((err) => {
                        console.log(err);
                        window.location.href = "/error"
                    })
                isLoading = false
            }
        })

    })
    // Filter table rows based on searched term for airport names in airport table //
    $("#discountSearch").on("keyup", function () {
        var term = $(this).val().toLowerCase();
        $("#bookingTable #bookingCartInfo .airport_tableRow").each(function () {
            $row = $(this);
            var name = $row.find("td:nth-child(1)").text().toLowerCase();
            if (name.search(term) < 0) {
                $row.hide();
            } else {
                $row.show();
            }
        });
    });
})
