function auth (req,res,next){

    if(!req.header("x-api-key" || req.header("x-api-key") !== "test-api-key")){
        res.status(401)
        return res.json({message: "Invalid API"})
    }
    next()
}
module.exports = {auth}