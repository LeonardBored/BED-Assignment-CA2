

const baseUrl = "http://localhost:8081";

$(document).ready(async () => {
    var user_info = null
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
                .then((res) => {
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
                        document.getElementsByTagName("body")[0].style = "background-image: url('../images/profilePage.jpg');background-size: cover;"

                        if (result.message == "ADMIN CREDENTIALS CORRECT") {
                            // showing of admin panel 
                            $("#admin_panel").attr('href', '/admin_panel')
                            $("#admin_panel").html("Admin Panel")
                        }

                        // knowing that user is logged in, we can now finally retrieve user information //
                        axios.post(`${baseUrl}/users/id/`, {}, {
                            headers: { "Authorization": "Bearer " + token }
                        })
                            .then((res) => {
                                userInfo = res.data[0]
                                // we then want to retrieve the bookings user has made from booking table //
                                // Endpoint 32: /bookings/:userid //
                                axios.get(`${baseUrl}/bookings/${userInfo.userid}`, {
                                    headers: { "Authorization": "Bearer " + token }
                                })
                                    .then((res) => {
                                        bookingInfo = res.data
                                        // With user info, we can now display it for user in #userInfo div //
                                        userInfoHtml = `
                                        <div class="row">
                                        <div class="col">
                                        <div class="container text-center py-3" style="background-color: white;">
                                            <img src="${userInfo.profile_pic_url}" alt="avatar"
                                            class="rounded-circle img-fluid" style="width: 150px;">
                                            <h5 class="my-3">${userInfo.username}</h5>
                                            <p class="text-muted mb-1">${userInfo.role}</p>
                                            <p class="text-muted mb-4">Account created at: ${(userInfo.created_at).substr(0, 11)}</p>
                                            <div class="d-flex justify-content-center mb-2"></div>
                                        </div>
                                        
                                        <div class="container py-3" style="background-color: white;">
                                            <hr>
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <p class="mb-0">Username</p>
                                                </div>
                                                <div class="col-sm-8">
                                                    <p class="text-muted mb-0">${userInfo.username}</p>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <p class="mb-0">Email</p>
                                                </div>
                                                <div class="col-sm-8">
                                                    <p class="text-muted mb-0">${userInfo.email}</p>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <p class="mb-0">Contact</p>
                                                </div>
                                                <div class="col-sm-8">
                                                    <p class="text-muted mb-0">${userInfo.contact}</p>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <p class="mb-0">Role</p>
                                                </div>
                                                <div class="col-sm-8">
                                                    <p class="text-muted mb-0">${userInfo.role}</p>
                                                </div>
                                            </div>
                                            <hr>
                                            <p class="text-center mt-5">Update User Avatar</p>
                                            <div class="row">
                                                <div class="col-md-8">
                                                    <input class="form-control" type="file" id="formFile" accept=".png, .jpg">
                                                </div>
                                                <div class="col-md-4">
                                                    <button id="updateImg" type="button" class="btn btn-primary">Update Avatar</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-center"> 
                                            <br>
                                            <button id="updateUserBtn" type="button" class="btn btn-primary">Update Details</button>
                                            <button id="logoutUser" type="button" class="btn btn-danger mx-5">Logout</button>
                                        </div>
                                        </div>
                                        `
                                        // if user has no bookings //
                                        if (Object.keys(bookingInfo).length == 1 && bookingInfo.message == "no bookings") {
                                            userInfoHtml += "</div>"  // end of row //
                                        } else {
                                            userInfoHtml += `<div class="col">`
                                            bookingInfo.forEach((booking) => {
                                                // Date Formatting //
                                                embarkDate = String(new Date(booking.embarkDate))
                                                embarkDate = embarkDate.substr(0, 24)
                                                bookingTime = String(new Date(booking.bookingTime))
                                                bookingTime = bookingTime.substr(0, 24)

                                                userInfoHtml += `
                                                            <div class="container text-center mb-3 py-3" style="background-color: white;">
                                                            <h3 style="text-decoration: underline">Booking</h3>

                                                            <div class="row mt-5">
                                                            <div class="col">
                                                                <h5>Origin Airport</h5>
                                                                <p style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${booking.originAirport}</p>
                                                            </div>   
                                                            <div class="col text-center mt-3">
                                                            <i class="fa fa-plane fa-2x mb-2" aria-hidden="true"></i>
                                                            </div>
                                                            <div class="col">
                                                                <h5>Destination Airport</h5>
                                                                <p style="color: rgb(37, 90, 206); text-shadow: 1px 1px darkgrey">${booking.destinationAirport}</p>
                                                            </div>
                                                            <div class="container text-center mb-3">
                                                            <a style="color: white;" target="_blank" class="btn btn-primary" href="${baseUrl}/flight_details/?flightid=${booking.flightid}" role="button">Flight Details</a>
                                                            </div>
                                                            </div>
                                                            <div class="row">
                                                            <hr>
                                                            <div class="col-md-4">
                                                                <p>embark date</p>
                                                                <p>${embarkDate}</p>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <p>price</p>
                                                                </p>${booking.price}</p>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <p>Booked at</p>
                                                                <p>${bookingTime}</p>
                                                            </div>   
                                                        `
                                                if (booking.discount == null) {
                                                    userInfoHtml += `<hr></div></div>` // end of row 
                                                } else {
                                                    userInfoHtml += `
                                                    <div>
                                                        <p>Discount</p>
                                                        <p>${booking.discount} %</p>
                                                        <hr>
                                                    </div>
                                                    </div>
                                                    </div>
                                                    `
                                                }
                                            })
                                            userInfoHtml += "</div></div>" // end of row //

                                        }

                                        $("#userInfo").append(userInfoHtml)
                                        // we will set the values of the update details form to allow user to only change the detail they want and not enter other fields //
                                        $("#updateUsername").attr('value', userInfo.username)
                                        $("#updateTel").attr('value', userInfo.contact)
                                        $("#updateEmail").attr('value', userInfo.email)
                                        user_info = userInfo
                                        return
                                    })

                                    .catch(() => { window.location.href = "/error" })
                            })

                            .catch((err) => {  // any possible errors with retrieving user info, we just redirect to error page //
                                console.log(err);
                                window.location.href = "/error"
                            })
                        return
                    } else {
                        // not logged in, we will redirect to login page //
                        window.location.assign(`${baseUrl}/login`)
                    }
                })

                .catch((err) => {
                    // not logged in, we will redirect to login page if token is not valid//
                    window.location.assign(`${baseUrl}/login`)
                })

        } catch {
            window.location.href = "/error"
        }
    }

    await isUserloggedIn()

    $("#userInfo").on('click', '#logoutUser', () => {   // for user logout //
        window.localStorage.clear();
        window.location.assign(`${baseUrl}/login`)
    });

    $("#userInfo").on('click', '#updateUserBtn', () => {   // for user updating details //
        $("#updateUserForm").modal('show')
        // we will then do some validation when user presses submit //
        // we already got user details stored in the variable, user_info //
        $("#updateUser").on('submit', () => {  // for register new user //
            try {
                event.preventDefault();    // Prevents reloading of page when pres submit button //
                if ($("#updatePassword").val() !== $("#confirmPassword").val()) {
                    $('#errorMessage').html(`Passwords are not the same. Please try again`)
                    $('#errorModal').modal('show');
                    return
                } else if ($("#updateTel").val().length !== 8 || parseInt($("#updateTel").val()) === NaN) { // invalid contact //
                    $('#errorMessage').html(`Please enter a valid contact number`)
                    $('#errorModal').modal('show');
                    return
                }
                var updateRequestBody = {      // 'username', 'email', 'contact', 'password', 'role' //
                    "username": `${$("#updateUsername").val()}`,
                    "email": `${$("#updateEmail").val()}`,
                    "contact": `${$("#updateTel").val()}`,
                    "role": `${user_info.role}`,
                }
                // now we check whether password field has been entered. if so, we will have to append to updateRequestBody
                if ($("#updatePassword").val() !== "") {
                    updateRequestBody["password"] = `${$("#updatePassword").val()}`
                }

                // We can now update user info using  Endpoint 4: PUT /users/id/ in app.js  // 
                axios.put(`${baseUrl}/users/${user_info.userid}`, updateRequestBody, {
                    headers: { "Authorization": "Bearer " + token }
                })
                    .then((res) => {
                        result = res.data  // if there is any data, this means that there was an error on backend. //
                        // result = { "message": "no user for selected userid, cannot update." } is an invalid res.data //

                        if (result === { "message": "no user for selected userid, cannot update." }) {
                            // if any error, we just redirect to error page //
                            console.log(err);
                            window.location.href = "/error"
                        } else {
                            $("#successMessage").html('Account Detals have been Updated!')
                            $("#successModal").modal('show')
                            $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                        }
                    })

                    .catch((err) => {
                        // for dup err, where username or email entered already exists //
                        if (err.response.data === 'Unprocessable Entity' && err.response.status == 422) {
                            $('#errorMessage').html(`Username or email already exists.`)
                            $('#errorModal').modal('show');
                            return
                        }
                        window.location.href = "/error"
                    })

            } catch (err) {
                console.log(err);
                window.location.href = "/error"
            }
        })
    });

    $("#userInfo").on('click', "#updateImg", () => {
        if ($("#formFile").prop('files').length === 0) {  // for when there is no file given //
            $('#errorMessage').html(`No Image given. Please try again`)
            $('#errorModal').modal('show');
            return
        }

        // if file is given, file will be stored in $("#formFile").prop('files')[0] //
        img_file = $("#formFile")[0].files[0]

        const updateRequestBody = {      // 'username', 'email', 'contact', 'password', 'role' //
            "username": `${user_info.username}`,
            "email": `${user_info.email}`,
            "contact": `${user_info.contact}`,
            "role": `${user_info.role}`,
            "profile_pic_url": img_file
        }

        // We can now update user img using  Endpoint 4: PUT /users/id/ in app.js  // 
        axios.put(`${baseUrl}/users/${user_info.userid}`, updateRequestBody, {
            headers: { "Authorization": "Bearer " + token, "Content-Type": "multipart/form-data" }
        })
            .then((res) => {
                result = res.data
                if (res.status === 204) {
                    $("#successMessage").html('Account Detals have been Updated!')
                    $("#successModal").modal('show')
                    $('#successModal').on('hidden.bs.modal', () => { location.reload(); })
                    return
                } else if (Object.keys(result).length !== 0) {  // this means that user has given an invalid file //
                    $('#errorMessage').html(`${result.message}`)
                    $('#errorModal').modal('show');
                    return
                }
            })

            .catch((err) => {
                console.log(err)
                // window.location.href = "/error"
            })

    })
})
