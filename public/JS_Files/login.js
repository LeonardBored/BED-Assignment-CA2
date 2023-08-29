

const baseUrl = "http://localhost:8081";

$(document).ready(() => {

    $("#userLogin").on('submit', () => {  // for login user //
        try {
            event.preventDefault();    // Prevents reloading of page when pres submit button //
            const requestBody = {
                "username": `${$("#loginUsername").val()}`,
                "password": `${$("#loginPassword").val()}`
            }
            // End point 21: POST /user/login //
            axios.post(`${baseUrl}/login`, requestBody)
                .then((res) => {
                    // {"token": null} if invalid login //
                    // Valid login e.g.: {"result":"<token>"} //
                    token = res.data["token"]
                    if (token == null) {  // invalid login 
                        $('#errorMessage').html(`Invalid Username or Password. Please try again.`)
                        $('#errorModal').modal('show');
                        return
                    }
                    localStorage.setItem('token', token);
                    $('#successMessage').html(`Account Signed In!`)
                    $('#successModal').modal('show');
                    // we will redirect to profile page after user closed modal //
                    $('#successModal').on('hidden.bs.modal', () => { window.location.assign(`${baseUrl}/profile`) })
                })

        } catch {
            console.log(err);
            window.location.href = "/error"
        }
    })

    $("#registerUser").on('submit', () => {  // for register new user //
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
            axios.post(`${baseUrl}/users/`, registerRequestBody)
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
                        $('#successModal').on('hidden.bs.modal', () => { window.location.assign(`${baseUrl}/login`) })
                        return
                    }
                })

                .catch((err) => {
                    if (err.response.status == 422 || err.response.data == 'Unprocessable Entity') {  // username or email already exists //
                        $('#errorMessage').html(`Username or Email is already in use. Please try again`)
                        $('#errorModal').modal('show');
                        return
                    } else if (err.response.data.code == 'ER_DATA_TOO_LONG' || err.response.data.code == 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
                        $('#errorMessage').html(`Please enter a valid contact number`)
                        $('#errorModal').modal('show');
                        return
                    }
                    window.location.href = "/error"
                })

        } catch {
            console.log(err);
            window.location.href = "/error"
        }
    })
})
