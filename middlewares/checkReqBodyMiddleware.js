
// Checks required params in the request // 
function checkReqBodyKeys(list) {
    return (req, res, next) => {
        for (let i = 0; i < list.length; i++) {
            const key = list[i];
            if (!Object.keys(req.body).includes(key)) { // Checks whether the request body includes the required keys as specified in list param //
                res.status(400).send('Bad Request') // if does not have all required keys, reject and return bad request //
                return
            }
        }
        next() // go to next middleware or function //
    }
}

module.exports = checkReqBodyKeys
