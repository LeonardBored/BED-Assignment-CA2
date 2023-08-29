

const baseUrl = "http://localhost:8081";

$(document).ready(async () => {
    flightDetails = null    // will be an array that contains all flight info //
    flightIndexArr = []     // will be an array that contains all flight indexes //
    // we first retrieve flight list from db and display it //
    async function retrieveFlight() {
        try {
            // End point 23: GET /flight/  //
            await axios.get(`${baseUrl}/flight/`)
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
                        flightIndexArr.push(indexOfFlight)
                        flight = result[0][indexOfFlight]
                        if (flight == undefined) {   // for the case where 1st flightid = 5 and more //
                            k += 1
                            i -= 1
                            continue
                        }
                        // Date formatting for better UI //
                        embarkDate = String(new Date(flight.embarkDate))
                        embarkDate = embarkDate.substr(0, 24)

                        flightInfoHtml = `
                        <tr class="flight_tableRow">
                            <td>${i + 1}</td>
                            <td>${flight.flightCode}</td>
                            <td>${flight.aircraft}</td>
                            <td>${flight.originAirport}</td>
                            <td>${flight.destinationAirport}</td>
                            <td>${embarkDate}</td>
                            <td>${flight.travelTime}</td>
                            <td>${flight.price}</td>
                            <td class="text-center"><a style="color:white;" class="btn btn-primary" href="${baseUrl}/flight_details/?flightid=${flight.flightid}" role="button"><i class="fa fa-paper-plane" aria-hidden="true"></i></a></td>
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

    await retrieveFlight()

    // Pagination for my table //
    // from: https://datatables.net/  //
    $("#flightTable").dataTable()

    $("#loading").attr('class', 'd-none')
    // Enable the page after all data load finish //
    $("#awaitLoading").attr('style', '')

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

})
