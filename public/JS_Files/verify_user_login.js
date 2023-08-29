

const base_Url = "http://localhost:8081";

// We then want to check whether the user is logged in //
// we do this by checking the local storage then verifying the token //
// if user is logged in, we will change the <a> of the <nav> for sign up | login to profile and change the href to redirect to profile page //
// this will be all done before page generates finish //
window.onload = async function () {
    async function check_user_login() {
        try {
            var token = localStorage.getItem('token')
            if (token === null) {  // not logged in //
                return
            }
            resultWait = await axios.post(`${base_Url}/verifyToken`, {}, {
                headers: { "Authorization": "Bearer " + token }
            })
                .then((res) => {
                    result = res.data
                    // if valid token, this means that user is logged in. result = {message: 'LOGGED IN'}//
                    if (result.message === 'LOGGED IN') {
                        // we will now change the nav bar using jquery //
                        $("#nav-login").attr('href', '/profile')
                        $("#nav-login").html(`<i class="fa fa-user-o"></i> Profile`)

                        // showing of booking cart in nav bar //
                        $("#nav_bookingCart").html(`<i class="fa fa-shopping-cart" aria-hidden="true"></i> Booking Cart`)
                        $("#nav_bookingCart").attr('href', '/booking_cart')

                    } else if (result.message === "ADMIN CREDENTIALS CORRECT") {   // if admin is logged in, we want to show admin panel in nav //
                        // we will now change the nav bar using jquery //
                        $("#nav-login").attr('href', '/profile')
                        $("#nav-login").html(`<i class="fa fa-user-o"></i> Profile`)

                        // showing of admin panel 
                        $("#admin_panel").attr('href', '/admin_panel')
                        $("#admin_panel").html("Admin Panel")

                        // showing of booking cart in nav bar //
                        $("#nav_bookingCart").html(`<i class="fa fa-shopping-cart" aria-hidden="true"></i> Booking Cart`)
                        $("#nav_bookingCart").attr('href', '/booking_cart')
                    }
                })

                .catch((err) => { return })

        } catch (err) {
            return
        }
    }

    await check_user_login()
    document.getElementsByTagName("html")[0].style.visibility = "visible";
}
