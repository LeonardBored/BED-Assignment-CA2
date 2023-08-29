
const baseUrl = "http://localhost:8081";

$(document).ready(async () => {

    // we first retrieve promotion list from db and display it //
    async function retrieveFlight_reference_promotion() {
        try {
            waitResult = await axios.get(`${baseUrl}/flight_promotions/`)
                .then((res) => {
                    result = res.data
                    flight_reference_promotion = result

                    if (Object.keys(result).length === 1 && result.message !== undefined) {  // for the case when no promotion exists //
                        flight_reference_promotionInfoHtml = `
                        <tr class="promotion_tableRow">
                            <td></td>
                            <td></td>
                            <td>${result.message}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        `
                        $("#flight_reference_promotionInfo").append(flight_reference_promotionInfoHtml)
                        return
                    }


                    result.forEach((flightPromotion) => {
                        // date formatting //
                        promotionStart = String(new Date(flightPromotion.promotional_period_start))
                        promotionStart = promotionStart.substr(0, 24)
                        promotionEnd = String(new Date(flightPromotion.promotional_period_end))
                        promotionEnd = promotionEnd.substr(0, 24)

                        flight_reference_promotionInfoHtml = `
                        <tr class="flight_reference_promotion_tableRow">
                            <td>${flightPromotion.originAirport}</td>
                            <td>${flightPromotion.destinationAirport}</td>
                            <td>${flightPromotion.discount}</td>
                            <td>${promotionStart}</td>
                            <td>${promotionEnd}</td>
                            <td class="text-center"><a class="btn btn-primary" href="${baseUrl}/flight_details/?flightid=${flightPromotion.flightid}" role="button"><i class="fa fa-paper-plane" aria-hidden="true"></i></a></td>
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

    await retrieveFlight_reference_promotion()

    // pagination for table //
    // from: https://datatables.net/  //
    $("#flight_reference_promotionTable").dataTable()

    $("#loading").attr('class', 'd-none')
    // Enable the page after all data load finish //
    $("#awaitLoading").attr('style', '')

})
