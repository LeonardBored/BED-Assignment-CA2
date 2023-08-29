
const base_Url = "http://localhost:8081";

// first, we want to verify that user has actually admin role. This will be before the page has even been generated in html //
async function func1() {
    try {
        var token = localStorage.getItem('token')
        if (token === null) {  // not logged in //
            console.log(err);
            window.location.href = "/"
        }

        await axios.post(`${base_Url}/verifyToken`, {}, {
            headers: { "Authorization": "Bearer " + token }
        })
            .then((res) => {
                result = res.data
                if (result.message != "ADMIN CREDENTIALS CORRECT") {  // invalid token //
                    window.location.href = "/"
                    return
                }

                // with valid login and admin credentials, we can change nav bar top right to profile page //
                $("#nav-login").attr('href', '/profile')
                $("#nav-login").html(`<i class="fa fa-user-o"></i> Profile`)

                // showing of admin panel in nav bar
                $("#admin_panel").attr('href', '/admin_panel')
                $("#admin_panel").html("Admin Panel")

                // showing of booking cart in nav bar //
                $("#nav_bookingCart").html(`<i class="fa fa-shopping-cart" aria-hidden="true"></i> Booking Cart`)
                $("#nav_bookingCart").attr('href', '/booking_cart')
                // enable the html page //
                document.getElementsByTagName("html")[0].style.visibility = "visible";
                // with this done, we can now continue onwards generating the various information from db //
            })

            .catch((err) => {
                console.log(err);
                window.location.href = "/"
            })

    } catch {
        window.location.href = "/"
    }
}

async function func2() {
    await func1()
}

func2()
