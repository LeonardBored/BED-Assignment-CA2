

const baseUrl = "http://localhost:8081";

$(document).ready(async () => {
    var isLoading = false;  // to ensure that even with multiple clicks, api will only call and once and not crash //
    userDetails = null      // will be an array that contains all user info //
    airportDetails = null   // will be an array that contains all airport info //
    flightDetails = null    // will be an array that contains all flight info //
    flightIndexArr = []     // will be an array that contains all flight indexes //

    // below is a many to many relation between flight table, flight_reference_promotion table and promotion table //
    promotionDetails = null       // will be an array that contains all promotion info //
    flight_reference_promotion = null // will be an array that contains all references for flights for each promotion //

    var token = localStorage.getItem('token') // already know that user is admin as it has been validated via verify_admin.js //

    // we first retrieve user list from db and display it //
    async function retrieveUser() {
        try {
            if (token === null) {  // not logged in //
                console.log(err);
                window.location.href = "/"
            }

            waitResult = await axios.get(`${baseUrl}/users/`, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then((res) => {
                    result = res.data
                    userDetails = result
                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no user exists //
                        userInfoHtml = `
                        <tr class="user_tableRow">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>${result.message}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        `
                        $("#userInfo").append(userInfoHtml)
                        return
                    }

                    result.forEach((user) => {
                        userInfoHtml = `
                        <tr class="user_tableRow">
                            <td>${user.userid}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.contact}</td>
                            <td>${user.role}</td>
                            <td class="text-center"><img src="${user.profile_pic_url}" style="width: 50%; height: 70px; border-radius:100%"></td>
                            <td class="text-center">
                                <a id="editUser_${user.userid}" class="editUser" title="Edit" data-bs-toggle="tooltip"><i class="fa fa-pencil"></i></a>
                                <a id="deleteUser_${user.userid}" class="deleteUser" title="Delete" data-bs-toggle="tooltip"><i class="fa fa-times"></i></a>
                            </td>
                        </tr>
                        `
                        $("#userInfo").append(userInfoHtml)
                    })
                })

                .catch((err) => {
                    console.log(err)
                    window.location.href = "/"
                })

        } catch {
            window.location.href = "/"
        }
    }

    // we first retrieve airport list from db and display it //
    async function retrieveAirport() {
        try {
            waitResult = await axios.get(`${baseUrl}/airport`)
                .then((res) => {
                    result = res.data
                    airportDetails = result

                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no airport exists //
                        airportInfoHtml = `
                        <tr class="airport_tableRow">
                            <td></td>
                            <td></td>
                            <td>${result.message}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        `
                        $("#airportInfo").append(airportInfoHtml)
                        airportDetails = null
                        return
                    }

                    result.forEach((airport) => {
                        airportInfoHtml = `
                        <tr class="airport_tableRow">
                            <td>${airport.airportid}</td>
                            <td>${airport.name}</td>
                            <td>${airport.country}</td>
                            <td>x: ${airport.coordinate.x}<br>y: ${airport.coordinate.y}</td>
                            <td>${airport.description}</td>
                            <td class="text-center">
                                <a id="editAirport_${airport.airportid}" class="editAirport" title="Edit" data-bs-toggle="tooltip"><i class="fa fa-pencil"></i></a>
                                <a id="deleteAirport_${airport.airportid}" class="deleteAirport" title="Delete" data-bs-toggle="tooltip"><i class="fa fa-times"></i></a>
                            </td>
                        </tr>
                        `
                        $("#airportInfo").append(airportInfoHtml)
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

    // we first retrieve flight list from db and display it //
    async function retrieveFlight() {
        try {
            // End point 23: GET /flight/  //
            waitResult = await axios.get(`${baseUrl}/flight/`)
                .then((res) => {
                    result = res.data

                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no flight exists //
                        flightInfoHtml = `
                        <tr class="flight_tableRow">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>${result.message}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        `
                        $("#flightInfo").append(flightInfoHtml)
                        flightDetails = null
                        return
                    }
                    // first, we gotta sort such that flightid is in ascending order //
                    // we store all flight ids in an array first //
                    flightidArr = []
                    for (let i = 0; i < result[0].length; i++) {
                        flightidArr.push(result[0][i].flightid)
                    }
                    flightDetails = result
                    // result[0] stores flights and result[1] stores the flightid along with the img //
                    // we then use indexOf to "sort" result[0] that holds all flight information given we have an array of the flightids//
                    k = 0
                    for (let i = 0; i < flightidArr.length; i++) {
                        indexOfFlight = flightidArr.indexOf(i + 1 + k)
                        flight = result[0][indexOfFlight]
                        if (flight == undefined) {   // for the case where 1st flightid = 5 and more //
                            k += 1
                            i -= 1
                            continue
                        }
                        flightIndexArr.push(flight.flightid - 1)
                        image_url = '#'
                        for (let j = 0; j < result[1].length; j++) {
                            if (flight.flightid == result[1][j].flightid) {
                                image_url = result[1][j].image_url
                                break
                            }
                        }
                        flightInfoHtml = `
                        <tr class="flight_tableRow">
                            <td>${flight.flightid}</td>
                            <td>${flight.flightCode}</td>
                            <td>${flight.aircraft}</td>
                            <td>${flight.originAirport}</td>
                            <td>${flight.destinationAirport}</td>
                            <td>${flight.embarkDate}</td>
                            <td>${flight.travelTime}</td>
                            <td>${flight.price}</td>
                        `
                        if (image_url !== '#') { // when flight has a img //
                            flightInfoHtml += `
                            <td><img src="${image_url}" style="width: 100%; height: 70px;"></td>
                            `

                        } else {   // when flight has no image //
                            flightInfoHtml += `
                            <td>No Img</td>
                            `
                        }
                        flightInfoHtml += `
                            <td class="text-center"><a style="color: white;" target="_blank" class="btn btn-primary" href="${baseUrl}/flight_details/?flightid=${flight.flightid}" role="button"><i class="fa fa-paper-plane" aria-hidden="true"></i></a></td>
                            <td class="text-center">
                                <a id="editFlight_${flight.flightid}" class="editFlight" title="Edit" data-bs-toggle="tooltip"><i class="fa fa-pencil"></i></a>
                                <a id="deleteFlight_${flight.flightid}" class="deleteFlight" title="Delete" data-bs-toggle="tooltip"><i class="fa fa-times"></i></a>
                            </td>
                        </tr>
                        `
                        $("#flightInfo").append(flightInfoHtml)
                    }

                })

                .catch((err) => {
                    console.log(err)
                    window.location.href = "/error"
                })
        } catch {
            window.location.href = "/error"
        }
    }

    // we first retrieve promotion list from db and display it //
    async function retrievePromotion() {
        try {
            waitResult = await axios.get(`${baseUrl}/allPromotions/`)
                .then((res) => {
                    result = res.data
                    promotionDetails = result

                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no promotion exists //
                        promotionInfoHtml = `
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>${result.message}</td>
                            <td></td>
                            <td></td>
                        `
                        $("#promotionInfo").append(promotionInfoHtml)
                        promotionDetails = null
                        return
                    }

                    result.forEach((promotion) => {
                        promotionInfoHtml = `
                        <tr class="promotion_tableRow">
                            <td>${promotion.promotionid}</td>
                            <td>${promotion.discount}</td>
                            <td>${promotion.promotional_period_start}</td>
                            <td>${promotion.promotional_period_end}</td>
                            <td class="text-center">
                                <a id="editPromotion_${promotion.promotionid}" class="editPromotion" title="Edit" data-bs-toggle="tooltip"><i class="fa fa-pencil"></i></a>
                                <a id="deletePromotion_${promotion.promotionid}" class="deletePromotion" title="Delete" data-bs-toggle="tooltip"><i class="fa fa-times"></i></a>
                            </td>
                        </tr>
                        `
                        $("#promotionInfo").append(promotionInfoHtml)
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

    // we first retrieve promotion list from db and display it //
    async function retrieveFlight_reference_promotion() {
        try {
            waitResult = await axios.get(`${baseUrl}/flight_promotions`)
                .then((res) => {
                    result = res.data
                    flight_reference_promotion = result

                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no promotion exists //
                        flight_reference_promotionInfoHtml = `
                        <tr class="promotion_tableRow">
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
                        $("#flight_reference_promotionInfo").append(flight_reference_promotionInfoHtml)
                        return
                    }

                    result.forEach((flightPromotion) => {
                        flight_reference_promotionInfoHtml = `
                        <tr class="flight_reference_promotion_tableRow">
                            <td>${flightPromotion.flight_promotion_id}</td>
                            <td>${flightPromotion.flightid}</td>
                            <td>${flightPromotion.promotionid}</td>
                            <td>${flightPromotion.discount}</td>
                            <td>${flightPromotion.promotional_period_start}</td>
                            <td>${flightPromotion.promotional_period_end}</td>
                            <td class="text-center"><a style="color: white;" target="_blank" class="btn btn-primary" href="${baseUrl}/flight_details/?flightid=${flightPromotion.flightid}" role="button"><i class="fa fa-paper-plane" aria-hidden="true"></i></a></td>
                            <td class="text-center">
                                <a id="editFlightPromotion_${flightPromotion.flight_promotion_id}" class="editFlightPromotion" title="Edit" data-bs-toggle="tooltip"><i class="fa fa-pencil"></i></a>
                                <a id="deleteFlightPromotion_${flightPromotion.flight_promotion_id}"class="deleteFlightPromotion" title="Delete" data-bs-toggle="tooltip"><i class="fa fa-times"></i></a>
                            </td>
                        </tr>
                        `
                        $("#flight_reference_promotionInfo").append(flight_reference_promotionInfoHtml)
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

    // Logic after generation of information from db //
    await retrieveUser()
    await retrieveAirport()
    await retrieveFlight()
    await retrievePromotion()
    await retrieveFlight_reference_promotion()

    // Pagination for my tables //
    // from: https://datatables.net/  //
    $("#userTable").dataTable()
    $("#airportTable").dataTable()
    $("#promotionTable").dataTable()
    $("#flight_reference_promotionTable").dataTable()
    $("#flightTable").dataTable()

    $("#loading").attr('class', 'd-none')
    // Enable the page after all data load finish //
    $("#awaitLoading").attr('style', '')
    $("#footerVisible").attr('style', '')

    // next, we want to insert all airport names within the origin and destination options of the register flight form //
    if (airportDetails != null) {
        airportDetails.forEach((airport) => {
            try {
                const optionHtml = `
                <option value=${airport.airportid}>${airport.name}</option>
                `;

                $("#registerOriginAirport").append(optionHtml);
                $("#registerDestinationAirport").append(optionHtml);

                $("#updateOrigin").append(optionHtml);
                $("#updateDestination").append(optionHtml);
            } catch {
                window.location.href = "/error"
            }
        })
    }

    // next, we want to insert all airport names within the origin and destination options of the register flight form //
    if (promotionDetails != null) {
        promotionDetails.forEach((promotion) => {
            try {
                const optionHtml = `
                <option value=${promotion.promotionid}>${promotion.promotionid}</option>
                `;

                $("#registerPromotionid").append(optionHtml);
                $("#updatePromotionid").append(optionHtml)
            } catch {
                window.location.href = "/error"
            }
        })
    }

    // let us sort flightIndex arr first //
    if (flightDetails != null) {
        let tmpFlightIndexArr = JSON.parse(JSON.stringify(flightIndexArr))  // create a new object, this won't affect flightIndexArr which will later be used //
        tmpFlightIndexArr.sort((a, b) => { return a - b }) // sort in ascending //

        tmpFlightIndexArr.forEach((flightid) => {
            try {
                const optionHtml = `
                <option value=${flightid + 1}>${flightid + 1}</option>
                `;

                $("#registerFlightid").append(optionHtml);
                $("#updateFlightid").append(optionHtml);
            } catch {
                window.location.href = "/error"
            }
        })
    }

    // below is the jquery and api calls for when admin requests to make a new row in either of the 5 available tables //

    // same code in login.html registering user //
    // adding of new user //
    $("#registerUser").on('submit', async () => {  // for register new user //
        try {
            event.preventDefault();    // Prevents reloading of page when pres submit button //
            if ($("#registerPassword").val() !== $("#confirmPassword").val()) {
                $('#errorMessage').html(`Passwords are not the same. Please try again`)
                $('#errorModal').modal('show');
                return
            } else if ($("#registerTel").val().length !== 8) {
                $('#errorMessage').html(`Please enter a valid contact number`)
                $('#errorModal').modal('show');
                return
            }
            const registerRequestBody = {      // 'username', 'email', 'contact', 'password', 'role', 'profile_pic_url' //
                "username": `${$("#registerUsername").val()}`,
                "email": `${$("#registerEmail").val()}`,
                "contact": `${$("#registerTel").val()}`,
                "password": `${$("#registerPassword").val()}`,
                "role": "Customer",    // by default, role will be set as Customer
                "profile_pic_url": ""  // by default, no profile pic will be set //
            }

            //  Endpoint 1: POST /users/    //
            await axios.post(`${baseUrl}/users/`, registerRequestBody)
                .then((res) => {
                    // It is possible for user to register a duplicate username or email //
                    // we first extract the res.data //
                    result = res.data
                    if (Object.keys(result).length !== 0) {
                        // if it is valid, we will get e.g. {"userid": 6 } //
                        // we just want to simply show the user a success modal //
                        $('#registerUserForm').modal('hide')
                        $('#successMessage').html(`Account has been created!`)
                        $('#successModal').modal('show');

                        // to reload page after admin has closed the success modal //
                        $('#successModal').on('hidden.bs.modal', () => { location.reload() })
                    }
                })

                .catch((err) => {
                    if (err.response.status == 422 || err.response.data == 'Unprocessable Entity') {  // username or email already exists //
                        $('#errorMessage').html(`Username or Email is already in use. Please try again`)
                        $('#errorModal').modal('show');
                        return
                    } else if (err.response.data.code == 'ER_DATA_TOO_LONG' || err.response.data.code == 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.response.data.code == 'WARN_DATA_TRUNCATED') {
                        $('#errorMessage').html(`Please enter a valid contact number`)
                        $('#errorModal').modal('show');
                        return
                    }
                    console.log(err);
                    console.log(err.response.data)
                    window.location.href = "/error"
                })

        } catch {
            window.location.href = "/error"
        }
    })

    $("#registerAirport").on('submit', async () => {  // for register new airport //
        try {
            event.preventDefault();    // Prevents reloading of page when pres submit button //
            const registerAirportBody = {
                "name": $("#registerAirportName").val(),
                "country": $("#registerCountry").val(),
                "coordinate": { "y": parseFloat($("#registerX").val()), "x": parseFloat($("#registerY").val()) },
                "description": $("#registerDescription").val()
            }
            //   Endpoint 5: POST /airport    // 
            await axios.post(`${baseUrl}/airport`, registerAirportBody, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then((res) => {
                    result = res.data
                    if (Object.keys(result).length === 1 && result.message != undefined) { // for the case when coordinates already has been used //
                        $('#errorMessage').html(result.message)
                        $('#errorModal').modal('show');
                        return
                    }

                    // Now, since insertion of airport is success, we can show success modal //
                    $('#successMessage').html(`Airport has been created!`)
                    $('#successModal').modal('show');

                    // to reload page after admin has closed the success modal //
                    $('#successModal').on('hidden.bs.modal', () => { location.reload() })
                })

                .catch((err) => {  // error for invalid coordinates //
                    if (err.response.data.code === 'UNKNOWN_CODE_PLEASE_REPORT') {
                        // source for specified min and max coordinate y and x for long and lat below //
                        // https://gisgeography.com/latitude-longitude-coordinates/#:~:text=Finally%2C%20latitude%20values%20(Y%2D,%2D180%20and%20%2B180%20degrees. //
                        $('#errorMessage').html(`Please Enter Valid coordinates<br>where<br>-180 < x <180<br>AND<br>-90 < y <90`)
                        $('#errorModal').modal('show');
                        return
                    } else if (err.response.status == 422 && err.response.data == 'Unprocessable Entity') {// for duplicate airport name insertion // 
                        $('#errorMessage').html(`Airport Name already exists.<br>Please enter another airport name`)
                        $('#errorModal').modal('show');
                        return
                    }
                    console.log(err)
                    window.location.href = "/error"
                })

        } catch (err) {
            console.log(err)
            window.location.href = "/error"
        }
    })

    $("#registerFlight").on('submit', async () => {  // for register new flight //
        try {
            event.preventDefault();    // Prevents reloading of page when pres submit button //
            const registerFlightBody = {
                "flightCode": $("#registerFlightCode").val(),
                "aircraft": $("#registerAircraft").val(),
                "originAirport": $("#registerOriginAirport").val(),
                "destinationAirport": $("#registerDestinationAirport").val(),
                "embarkDate": $("#registerEmbarkDate").val(),
                "travelTime": $("#registerTravelTime").val(),
                "price": $("#registerPrice").val()
            }

            //   Endpoint 7: POST /flight/    // 
            await axios.post(`${baseUrl}/flight/`, registerFlightBody, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then(async (res) => {
                    result = res.data
                    flightid = result.flightid
                    // we now need to check whether admin have given image. //
                    // If so, we can use the flightid given from res.data of /flight/ to insert img into product_listing //

                    // if file is given, file will be stored in $("#registerFlightImg").prop('files')[0] //
                    img_file = $("#registerFlightImg")[0].files[0]

                    if (img_file != undefined) {  // for when there is a img file given, we need to store at product_listing
                        // End point 18: POST /product_listing/pic/:flightid //
                        await axios.post(`${baseUrl}/product_listing/pic/${flightid}`, { "product_pic": img_file }, {
                            headers: { "Authorization": "Bearer " + token, "Content-Type": "multipart/form-data" }
                        })
                            .then((res) => {
                                result = res.data
                                if (Object.keys(result).length === 1 && result.message != undefined) {  // for errors //
                                    $('#errorMessage').html(result.message)
                                    $('#errorModal').modal('show');
                                    return
                                }
                            })

                            .catch((err) => {
                                console.log(err)
                                window.location.href = "/error"
                            })
                    }

                    // Now, since insertion of flight is success, we can show success modal //
                    $('#successMessage').html(`Flight has been created!<br> Flightid = ${flightid}`)
                    $('#successModal').modal('show');

                    // to reload page after admin has closed the success modal //
                    $('#successModal').on('hidden.bs.modal', () => { location.reload() })
                })

                .catch((err) => {
                    if (err.response.data.code == 'ER_WARN_DATA_OUT_OF_RANGE') {   // for when price goes out of range //
                        $('#errorMessage').html(`Price is out of range. Please stick within 6 digits or less`)
                        $('#errorModal').modal('show');
                        return
                    } else if (err.response.data.code == 'ER_TRUNCATED_WRONG_VALUE') { // for when date is invalid //
                        $('#errorMessage').html(`Date field is invalid. Please try again`)
                        $('#errorModal').modal('show');
                        return
                    }
                    console.log(err)
                    window.location.href = "/error"
                })
        } catch (err) {
            console.log(err)
            window.location.href = "/error"
        }
    })

    $("#registerPromotion").on('submit', async () => {  // for register new promotion //
        try {
            event.preventDefault();    // Prevents reloading of page when press submit button //
            const requestPromotionBody = {
                "discount": $("#registerDiscount").val(),
                "promotional_period_start": $("#registerPromotionalStart").val(),
                "promotional_period_end": $("#registerPromotionalEnd").val()
            }

            // End point 13 : POST /promotions/ //
            await axios.post(`${baseUrl}/promotions/`, requestPromotionBody, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then((res) => {
                    result = res.data
                    if (Object.keys(result).length === 1 && result.message != undefined) { // for start date is after end date //
                        $('#errorMessage').html(`${result.message}`)
                        $('#errorModal').modal('show');
                        return
                    }

                    // Now, since insertion of flight is success, we can show success modal //
                    $('#successMessage').html(`Promotion has been created!<br> promotion id = ${result.promotionid}`)
                    $('#successModal').modal('show');

                    // to reload page after admin has closed the success modal //
                    $('#successModal').on('hidden.bs.modal', () => { location.reload() })
                })

                .catch((err) => {
                    if (err.response.data.code == 'ER_TRUNCATED_WRONG_VALUE') { // for when date is invalid //
                        $('#errorMessage').html(`Date field is invalid. Please try again`)
                        $('#errorModal').modal('show');
                        return
                    }
                    console.log(err)
                    window.location.href = "/error"
                })

        } catch (err) {
            console.log(err)
            window.location.href = "/error"
        }
    })

    $("#registerFlightPromotion").on('submit', async () => {  // for register new flight promotion //
        try {
            event.preventDefault();    // Prevents reloading of page when press submit button //
            // End point 14 : POST  /promotions/:promotionid/flight/:flightid/  //
            promotionid = $("#registerPromotionid").val()
            flightid = $("#registerFlightid").val()
            await axios.post(`${baseUrl}/promotions/${promotionid}/flight/${flightid}`, {}, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then((res) => {
                    result = res.data
                    // for any erros, such as promotion for flight alr exist, invalid flight / prootion ids / promotion starts after flight has already embark
                    if (Object.keys(result).length === 1 && result.message != undefined) {
                        $('#errorMessage').html(`${result.message}`)
                        $('#errorModal').modal('show');
                        return
                    }

                    // Now, since insertion of flight is success, we can show success modal //
                    $('#successMessage').html(`Flight Promotion has been created!<br> flight promotion id = ${result.flight_promotion_id}`)
                    $('#successModal').modal('show');

                    // to reload page after admin has closed the success modal //
                    $('#successModal').on('hidden.bs.modal', () => { location.reload() })
                })

                .catch((err) => {
                    console.log(err)
                    window.location.href = "/error"
                })

        } catch (err) {
            console.log(err)
            window.location.href = "/error"
        }
    })

    // below is the jquery and api calls for when admin requests to edit an existing row in either of the 5 available tables //
    $('#userTable tbody').on('click', '.editUser', (event) => {   // editing values of a user row //
        try {
            // first extract the userid //
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            userid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //


            // now with id, let us first extract the existing values from userDetails //
            for (let i = 0; i < userDetails.length; i++) {
                if (userDetails[i].userid == userid) {
                    selected_userDetails = userDetails[i]
                    break
                }
            }
            // With user information , lets fill in the values in the form //
            $("#updateUsername").val(`${selected_userDetails.username}`)
            $("#updateTel").val(`${selected_userDetails.contact}`)
            $("#updateEmail").val(`${selected_userDetails.email}`)
            $("#updateRole").val(`${selected_userDetails.role}`)

            $("#updateUserForm").modal('show')

            $("#updateUser").on("submit", async (event1) => {
                event1.preventDefault();    // Prevents reloading of page when pres submit button //
                if (!isLoading) {
                    isLoading = true

                    if (($("#updateTel").val()).length !== 8) {  // validate contact number //
                        $('#errorMessage').html(`Please enter a valid contact number`)
                        $('#errorModal').modal('show');
                        isLoading = false
                        return
                    }

                    // if file is given, file will be stored in $("#updateUserImg").prop('files')[0] //
                    img_file = $("#updateUserImg")[0].files[0]

                    const updateRequestBody = {      // 'username', 'email', 'contact', 'password', 'role', 'profile_pic_url' //
                        "username": `${$("#updateUsername").val()}`,
                        "email": `${$("#updateEmail").val()}`,
                        "contact": `${$("#updateTel").val()}`,
                        "role": `${$("#updateRole").val()}`,
                        "profile_pic_url": img_file
                    }

                    if ($("#updatePassword").val() !== "") {  // so that if user does not enter password , password remains unchanged //
                        updateRequestBody["password"] = `${$("#updatePassword").val()}`
                    }

                    //   Endpoint 4: PUT /users/:id/   // 
                    await axios.put(`${baseUrl}/users/${userid}`, updateRequestBody, {
                        headers: { "Authorization": "Bearer " + token, "Content-Type": "multipart/form-data" }
                    })
                        .then((res) => {
                            result = res.data
                            if (Object.keys(result).length === 1 && result.message !== undefined) { // for invalid file //
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                            // Now, since user update is success, we can show success modal //
                            $('#successMessage').html(`user has been updated`)
                            $('#successModal').modal('show');

                            // to reload page after admin has closed the success modal //
                            $('#successModal').on('hidden.bs.modal', () => { location.reload() })
                        })

                        .catch((err) => {
                            // for dup err, where username or email entered already exists //
                            if (err.response.data === 'Unprocessable Entity' && err.response.status == 422) {
                                $('#errorMessage').html(`Username or email already exists.`)
                                $('#errorModal').modal('show');
                                return
                            } else if (err.response.data.code == 'ER_DATA_TOO_LONG' || err.response.data.code == 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
                                $('#errorMessage').html(`Please enter a valid contact number`)
                                $('#errorModal').modal('show');
                                return
                            }
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })
        } catch {
            window.location.href = "/error"
        }
    })

    // editing airport rows //
    $("#airportTable tbody").on('click', ".editAirport", (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            airportid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            // now with id, let us first extract the existing values from airportDetails //
            for (let i = 0; i < airportDetails.length; i++) {
                if (airportDetails[i].airportid == airportid) {
                    selected_airportDetails = airportDetails[i]
                    break
                }
            }

            // with airport information, lets fill up update airport form //
            $("#updateAirportName").val(`${selected_airportDetails.name}`)
            $("#updateCountry").val(`${selected_airportDetails.country}`)
            $("#updateX").val(`${selected_airportDetails.coordinate.x}`)
            $("#updateY").val(`${selected_airportDetails.coordinate.y}`)
            $("#updateDescription").val(`${selected_airportDetails.description}`)

            $("#updateAirportForm").modal('show')

            $("#updateAirport").on("submit", async (event1) => {
                event1.preventDefault();    // Prevents reloading of page when pres submit button //
                if (!isLoading) {
                    isLoading = true

                    const updateRequestBody = {
                        "name": `${$("#updateAirportName").val()}`,
                        "country": `${$("#updateCountry").val()}`,
                        "coordinate": { "y": parseFloat(`${$("#updateX").val()}`), "x": parseFloat(`${$("#updateY").val()}`) },
                        "description": `${$("#updateDescription").val()}`
                    }

                    //   End point 24: PUT /airport/:airportid  //
                    await axios.put(`${baseUrl}/airport/${airportid}`, updateRequestBody, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then((res) => {
                            // if there is any data, this means that there was an error on backend. //
                            result = res.data
                            console.log(res.status)

                            if (res.status === 204) {
                                $("#successMessage").html('Airport has been Updated!')
                                $("#successModal").modal('show')
                                $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                            } else {
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                        })
                        .catch((err) => {
                            if (err.response.data.code === 'UNKNOWN_CODE_PLEASE_REPORT') {
                                // source for specified min and max coordinate y and x for long and lat below //
                                // https://gisgeography.com/latitude-longitude-coordinates/#:~:text=Finally%2C%20latitude%20values%20(Y%2D,%2D180%20and%20%2B180%20degrees. //
                                $('#errorMessage').html(`Please Enter Valid coordinates<br>where<br>-180 < x <180<br>AND<br>-90 < y <90`)
                                $('#errorModal').modal('show');
                                return
                            } else if (err.response.status == 422 && err.response.data == 'Unprocessable Entity') {// for duplicate airport name insertion // 
                                $('#errorMessage').html(`Airport Name already exists.<br>Please enter another airport name`)
                                $('#errorModal').modal('show');
                                return
                            }
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })
        } catch {
            window.location.href = "/error"
        }
    })

    // editing promotion details //
    $("#promotionTable tbody").on('click', ".editPromotion", (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            promotionid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //


            // now with id, let us first extract the existing values from airportDetails //
            for (let i = 0; i < promotionDetails.length; i++) {
                if (promotionDetails[i].promotionid == promotionid) {
                    selected_promotionDetails = promotionDetails[i]
                    break
                }
            }

            $("#updateDiscount").val(`${selected_promotionDetails.discount}`)
            $("#updatePromotionalStart").val(`${selected_promotionDetails.promotional_period_start}`)
            $("#updatePromotionalEnd").val(`${selected_promotionDetails.promotional_period_end}`)

            $("#updatePromotionForm").modal('show')

            $("#updatePromotion").on('submit', async (event1) => {
                event1.preventDefault();    // Prevents reloading of page when pres submit button //
                if (!isLoading) {
                    isLoading = true

                    const updateRequestBody = {   // 'discount','promotional_period_start','promotional_period_end' //
                        "discount": `${$("#updateDiscount").val()}`,
                        "promotional_period_start": $("#updatePromotionalStart").val(),
                        "promotional_period_end": $("#updatePromotionalEnd").val()
                    }

                    //   End point 24: PUT /promotions/:promotionid  //
                    await axios.put(`${baseUrl}/promotions/${promotionid}`, updateRequestBody, {
                        headers: { "Authorization": "Bearer " + token }
                    })

                        .then((res) => {
                            result = res.data
                            if (res.status === 204) {
                                $("#successMessage").html('Promotion has been Updated!')
                                $("#successModal").modal('show')
                                $('#successModal').on('hidden.bs.modal', () => { location.reload(); })

                            } else if (Object.keys(result).length === 1 && result.message !== undefined) {  // for when invalid promotionid 
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                        })

                        .catch((err) => {
                            if (err.response.data.code == 'ER_TRUNCATED_WRONG_VALUE') { // for when date is invalid //
                                $('#errorMessage').html(`Date field is invalid. Please try again`)
                                $('#errorModal').modal('show');
                                return
                            }
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })

        } catch {
            window.location.href = "/error"
        }
    })

    // editing flight promotions //
    $("#flight_reference_promotionTable tbody").on('click', ".editFlightPromotion", async (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            flightPromotionid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            async function func1() {
                for (let i = 0; i < flight_reference_promotion.length; i++) {
                    if (flight_reference_promotion[i].flight_promotion_id == flightPromotionid) {
                        selected_flightPromotion = flight_reference_promotion[i]
                        break
                    }
                }
            }
            await func1()

            $("#updateFlightid").val(`${selected_flightPromotion.flightid}`)
            $("#updatePromotionid").val(`${selected_flightPromotion.promotionid}`)

            // show the modal //
            $("#updateFlightPromotionForm").modal('show')

            $("#updateFlightPromotion").on('submit', async (event1) => {
                event1.preventDefault();    // Prevents reloading of page when pres submit button //
                if (!isLoading) {
                    isLoading = true

                    const updateRequestBody = {   // "fk_flight_id","fk_promotion_id" //
                        "fk_flight_id": $("#updateFlightid").val(),
                        "fk_promotion_id": $("#updatePromotionid").val()
                    }

                    // End point 25 : PUT  /flight/promotions/:flightPromotionid //
                    await axios.put(`${baseUrl}/flight/promotions/${flightPromotionid}`, updateRequestBody, {
                        headers: { "Authorization": "Bearer " + token }
                    })

                        .then((res) => {
                            result = res.data
                            if (res.status === 204) {
                                $("#successMessage").html('Promotion has been Updated!')
                                $("#successModal").modal('show')
                                $('#successModal').on('hidden.bs.modal', () => { location.reload(); })

                            } else if (Object.keys(result).length === 1 && result.message !== undefined) {  // for when invalid promotionid 
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                        })

                        .catch((err) => {
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })
        } catch {
            window.location.href = "/error"
        }
    })

    // editing flight details //
    $("#flightTable tbody").on('click', ".editFlight", async (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            flightid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            api_forImg = 'POST'

            async function funct1() {
                for (let i = 0; i < flightDetails[0].length; i++) {
                    if (flightDetails[0][i].flightid == flightid) {
                        selected_flightDetails = flightDetails[0][i]
                        break
                    }
                }


                // we then check within productDetails whether an image has been defined for the flight //
                for (let i = 0; i < flightDetails[1].length; i++) {
                    if (flightDetails[1][i].flightid == flightid) {
                        // if flightid is found in flightImgCheck, this means that flight has image already attatched to it //
                        // this means that we need to use put api instead of post api to update image //
                        api_forImg = 'PUT'
                        break
                    }
                }
            }
            await funct1()

            // With this, we can now show the update modal with some values already defined. //
            $("#updateFlightCode").val(`${selected_flightDetails.flightCode}`)
            $("#updateAircraft").val(`${selected_flightDetails.aircraft}`)
            $("#updateOrigin").val(selected_flightDetails.originAirportid)
            $("#updateDestination").val(`${selected_flightDetails.destinationAirportid}`)
            $("#updateEmbarkDate").val(`${selected_flightDetails.embarkDate}`)
            $("#updateTravelTime").val(`${selected_flightDetails.travelTime}`)
            $("#updatePrice").val(`${selected_flightDetails.price}`)

            $("#updateFlightForm").modal('show')

            $("#updateFlight").on('submit', async (event1) => {
                event1.preventDefault();    // Prevents reloading of page when pres submit button //
                if (!isLoading) {
                    isLoading = true;

                    const updateRequestBody = {   // 'flightCode', 'aircraft', 'originAirport', 'destinationAirport', 'embarkDate', 'travelTime', 'price' //
                        "flightCode": $("#updateFlightCode").val(),
                        "aircraft": $("#updateAircraft").val(),
                        "originAirport": $("#updateOrigin").val(),
                        "destinationAirport": $("#updateDestination").val(),
                        "embarkDate": $("#updateEmbarkDate").val(),
                        "travelTime": $("#updateTravelTime").val(),
                        "price": $("#updatePrice").val()
                    }

                    // function to upload image //
                    // this is so that if image exist for flight already, we want to use the PUT method //
                    // else, if image does not exist, we want to POST //
                    async function imageUpload(api_forImg, flightid, img_file) {
                        if (api_forImg === "POST") {
                            // End point 18: POST /product_listing/pic/:flightid //
                            await axios.post(`${baseUrl}/product_listing/pic/${flightid}`, { "product_pic": img_file }, {
                                headers: { "Authorization": "Bearer " + token, "Content-Type": "multipart/form-data" }
                            })
                                .then((res) => {
                                    result = res.data
                                    if (res.status === 204) {
                                        $("#successMessage").html('Flight has been Updated!')
                                        $("#successModal").modal('show')
                                        $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                                    } else if (Object.keys(result).length === 1 && result.message !== undefined) { // invalid flight id //
                                        $('#errorMessage').html(`${result.message}`)
                                        $('#errorModal').modal('show');
                                        return
                                    }

                                })

                                .catch((err) => {
                                    console.log(err)
                                    // window.location.href = "/error"
                                })

                            // changing of api to PUT if flight already as an image associated with it //
                        } else if (api_forImg === "PUT") {
                            await axios.put(`${baseUrl}/product_listing/pic/${flightid}`, { "product_pic": img_file }, {
                                headers: { "Authorization": "Bearer " + token, "Content-Type": "multipart/form-data" }
                            })
                                .then((res) => {
                                    result = res.data
                                    if (res.status === 204) {
                                        $("#successMessage").html('Flight has been Updated!')
                                        $("#successModal").modal('show')
                                        $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                                    } else if (Object.keys(result).length === 1 && result.message !== undefined) { // invalid flight id //
                                        $('#errorMessage').html(`${result.message}`)
                                        $('#errorModal').modal('show');
                                        return
                                    }
                                })

                                .catch((err) => {
                                    console.log(err)
                                    window.location.href = "/error"
                                })
                        }
                    }

                    // we first update the requestBody in flight table //
                    // we will later then verify whether user has given a file. If yes, we will use the api_Img var to determine which endpoint to use //
                    await axios.put(`${baseUrl}/flight/${flightid}`, updateRequestBody, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then(async (res) => {
                            result = res.data
                            if (res.status === 204) {
                                // we can now continue to insert img. First we check whether img is defined //

                                // if file is given, file will be stored in $("#updateUserImg").prop('files')[0] //
                                img_file = $("#updateFlightImg")[0].files[0]
                                if (img_file == undefined) { // when no img given, we just end and show success modal //
                                    $("#successMessage").html('Flight has been Updated!')
                                    $("#successModal").modal('show')
                                    $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                                } else {
                                    await imageUpload(api_forImg, flightid, img_file)
                                    return
                                }

                            } else if (Object.keys(result).length === 1 && result.message !== undefined) {  // for when invalid promotionid 
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                        })

                        .catch((err) => {
                            if (err.response.data.code == 'ER_WARN_DATA_OUT_OF_RANGE') {   // for when price goes out of range //
                                $('#errorMessage').html(`Price is out of range. Please stick within 6 digits or less`)
                                $('#errorModal').modal('show');
                                return
                            }
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false;
                }
            })
        } catch {
            window.location.href = "/error"
        }
    })

    // Below, the final 5 apis, will be the individual delete for each table //
    // Delete user //
    $("#userTable tbody").on('click', ".deleteUser", (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            userid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            $("#deleteMessage").html(`Delete userid ${userid}?`)
            $("#deleteModal").modal('show')

            $("#confirmDelete").on('click', async () => {
                $('#confirmDelete').prop('disabled', true);  // disable the button //
                if (!isLoading) {
                    isLoading = true
                    await axios.delete(`${baseUrl}/user/${userid}`, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then((res) => {
                            result = res.data
                            if (Object.keys(result).length === 1 && result.message !== undefined) { // invalid userid //
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }

                            $("#successMessage").html(`userid ${userid} has been deleted!`)
                            $("#successModal").modal('show')
                            $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                        })

                        .catch((err) => {
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })
        } catch {
            window.location.href = "/error"
        }

    })

    // Deleting of airport //
    $("#airportTable tbody").on('click', ".deleteAirport", (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            airportid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            $("#deleteMessage").html(`Delete airportid ${airportid}?`)
            $("#deleteModal").modal('show')

            $("#confirmDelete").on('click', async () => {
                $('#confirmDelete').prop('disabled', true);  // disable the button //
                if (!isLoading) {
                    isLoading = true
                    // Endpoint 30:  DELETE /airport/:airportid //
                    await axios.delete(`${baseUrl}/airport/${airportid}`, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then((res) => {
                            result = res.data
                            if (Object.keys(result).length === 1 && result.message !== undefined) { // invalid airportid //
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }

                            $("#successMessage").html(`airportid ${airportid} has been deleted!`)
                            $("#successModal").modal('show')
                            $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                        })

                        .catch((err) => {
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })

        } catch {
            window.location.href = "/error"
        }
    })

    // Delete Promotion //
    $("#promotionTable tbody").on('click', ".deletePromotion", (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            promotionid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            $("#deleteMessage").html(`Delete promotionid ${promotionid}?`)
            $("#deleteModal").modal('show')

            $("#confirmDelete").on('click', async () => {
                $('#confirmDelete').prop('disabled', true);  // disable the button //
                if (!isLoading) {
                    isLoading = true
                    // End point 15 : DELETE /promotions/:id/ //
                    await axios.delete(`${baseUrl}/promotions/${promotionid}`, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then((res) => {
                            result = res.data
                            if (Object.keys(result).length === 1 && result.message !== undefined) { // invalid promotionid //
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                            $("#successMessage").html(`promotionid ${promotionid} has been deleted!`)
                            $("#successModal").modal('show')
                            $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                        })

                        .catch((err) => {
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })

        } catch {
            window.location.href = "/error"
        }
    })

    // Delete Flight promotion //
    $("#flight_reference_promotionTable tbody").on('click', ".deleteFlightPromotion", async (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            flightPromotionid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            async function func1() {
                // find promotionid and flightid given the flightPromotionid // 
                for (let i = 0; i < flight_reference_promotion.length; i++) {
                    if (flight_reference_promotion[i].flight_promotion_id == flightPromotionid) {
                        promotionid = flight_reference_promotion[i].promotionid
                        flightid = flight_reference_promotion[i].flightid
                        break
                    }
                }
            }
            await func1()

            $("#deleteMessage").html(`Delete flight promotion id ${flightPromotionid}?`)
            $("#deleteModal").modal('show')

            $("#confirmDelete").on('click', async () => {
                $('#confirmDelete').prop('disabled', true);  // disable the button //
                if (!isLoading) {
                    isLoading = true
                    // End point 16 : DELETE /promotions/:promotionid/flight/:flightid/ //
                    await axios.delete(`${baseUrl}/promotions/${promotionid}/flight/${flightid}`, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then((res) => {
                            result = res.data
                            if (Object.keys(result).length === 1 && result.message !== undefined) { // various possible errors //
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                            $("#successMessage").html(`flight promotion id ${flightPromotionid} has been deleted!`)
                            $("#successModal").modal('show')
                            $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                        })
                        .catch((err) => {
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })
        } catch {
            window.location.href = "/error"
        }
    })

    // Delete Flight //
    $("#flightTable tbody").on('click', ".deleteFlight", async (event) => {
        try {
            a = event.target.closest('a')  // first find the cloest <a> element to where the <i> has been clicked from: https://api.jquery.com/closest/ //
            a_id = a.id                    // After doing so, we can find the id of <a> which will contain e.g. editUser_1 //
            flightid = a_id.split("_")[1]    // to get the id, we just need to split and get the index 1 of the new arr created //

            img_Check = null
            productid = null
            // we want to check whether flight has an attatched image to it. If so, we will know to delete it from product listing //
            async function func1() {
                for (let i = 0; i < flightDetails[1].length; i++) {
                    if (flightDetails[1][i].flightid == flightid) {
                        img_Check = true
                        productid = flightDetails[1][i].productid
                        break
                    }
                }
            }
            await func1()

            $("#deleteMessage").html(`Delete flightid ${flightid}?`)
            $("#deleteModal").modal('show')

            $("#confirmDelete").on('click', async () => {
                $('#confirmDelete').prop('disabled', true);  // disable the button //
                if (!isLoading) {
                    isLoading = true
                    // this means that flight has an associated image with it. We need to remove it //
                    if (img_Check == true) {
                        // End point 20: DELETE /product_listing/:productid //
                        await axios.delete(`${baseUrl}/product_listing/${productid}`, {
                            headers: { "Authorization": "Bearer " + token }
                        })
                            .then((res) => {
                                result = res.data
                                if (Object.keys(result).length === 1 && result.message !== undefined) { // various possible errors //
                                    $('#errorMessage').html(`${result.message}`)
                                    $('#errorModal').modal('show');
                                }
                                return
                            })
                            .catch((err) => {
                                console.log(err)
                                window.location.href = "/error"
                            })
                    }
                    //  Endpoint 10: DELETE  /flight/:id   //
                    await axios.delete(`${baseUrl}/flight/${flightid}`, {
                        headers: { "Authorization": "Bearer " + token }
                    })
                        .then((res) => {
                            result = res.data
                            if (Object.keys(result).length === 1 && result.message !== undefined) { // various possible errors //
                                $('#errorMessage').html(`${result.message}`)
                                $('#errorModal').modal('show');
                                return
                            }
                            $("#successMessage").html(`flight id ${flightid} has been deleted!`)
                            $("#successModal").modal('show')
                            $('#successModal').on('hidden.bs.modal', () => { location.reload(); })

                        })
                        .catch((err) => {
                            console.log(err)
                            window.location.href = "/error"
                        })
                    isLoading = false
                }
            })
        } catch {
            window.location.href = "/error"
        }
    })

    // below are for search functions for the individual tables //

    // Activate tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Filter table rows based on searched term for usernames in user table //
    $("#userSearch").on("keyup", function () {
        var term = $(this).val().toLowerCase();
        $("#userTable #userInfo .user_tableRow").each(function () {
            $row = $(this);
            var name = $row.find("td:nth-child(1)").text().toLowerCase();
            if (name.search(term) < 0) {
                $row.hide();
            } else {
                $row.show();
            }
        });
    });

    // Filter table rows based on searched term for airport names in airport table //
    $("#airportSearch").on("keyup", function () {
        var term = $(this).val().toLowerCase();
        $("#airportTable #airportInfo .airport_tableRow").each(function () {
            $row = $(this);
            var name = $row.find("td:nth-child(1)").text().toLowerCase();
            if (name.search(term) < 0) {
                $row.hide();
            } else {
                $row.show();
            }
        });
    });

    // Filter table rows based on searched term for flight id in flight table //
    $("#flightSearch").on("keyup", function () {
        var term = $(this).val();
        $("#flightTable #flightInfo .flight_tableRow").each(function () {
            $row = $(this);
            var name = $row.find("td:nth-child(1)").text();
            if (name.search(term) < 0) {
                $row.hide();
            } else {
                $row.show();
            }
        });
    });

    // Filter table rows based on searched term for promotionid in promotion table //
    $("#promotionSearch").on("keyup", function () {
        var term = $(this).val()
        $("#promotionTable #promotionInfo .promotion_tableRow").each(function () {
            $row = $(this);
            var name = $row.find("td:nth-child(1)").text();
            if (name.search(term) < 0) {
                $row.hide();
            } else {
                $row.show();
            }
        });
    });

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

});
