const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = async(req, res, next) => {
try {
   const token = req.cookies.token;
   if(!token) {
    res.status(401).send({message: "No Token Provided"});
   }
   const decoded = jwt.verify(token, JWT_SECRET);
   if(!decoded.userId){
    res.status(401).send({message: "Invalid Token Provided"});
   }
   req.userId = decoded.userId;
   req.role = decoded.role;
   next();
} catch (error) {
    console.error("Error verify token",error);
res.status(401).send({message: "Invalid Token"});
}
}
module.exports = verifyToken;