import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


export const protectRoute = async (req,res,next) => {
  try {
    const token = req.cookies.jwt; // get token from cookie
    if(!token) {
      return res.status(401).json({error: "You need to login first"});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
    if(!decoded) {
      return res.status(401).json({error: "Invalid token"});
    }

    const user = await User.findById(decoded.userId).select("-password"); // get user by id from decoded token
    if(!user) {
      return res.status(404).json({error: "User not found"});
    }

    req.user= user; // set req.user

    next(); // move to next middleware

  } catch(error) {
    console.log("Error in protectRoute middleware", error.message);
    res.status(500).json({error: "Internal Server Error"});
  }
}
