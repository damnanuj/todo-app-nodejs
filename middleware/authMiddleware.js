const isAuth = (req, res, next)=>{
    // console.log("hi from isAuth");
    if(req.session.isAuth){
        next()
    
      }
      else{
        return res.status(401).json("Session Expired, Please Login Again")
      }
}

module.exports = isAuth;