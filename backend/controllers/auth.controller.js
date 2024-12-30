import { generateTokenAndSetCookie } from "../lib/utils/generateToken";
import User from "../models/user.model";
import bcrypt from "bcrypt";

export const signup = async (req,res) => {
 try {
  const {fullName,username,email,password} = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)) {
    return res.status(400).json({error: "Invalid email format"});
  }

  const existingUser = await User.findOne({ username }) //is the same as {username: username}
  if(existingUser) {
    return res.status(400).json({error:"Username is already taken"})
  }

  const existingEmail = await User.findOne({ email }) //is the same as {email: email}
  if(existingUser) {
    return res.status(400).json({error:"Email is already taken"})
  }

  // hash the password

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password,salt)

  const newUser = new User({
    fullname: fullName,
    username: username,
    email: email,
    password: hashedPassword
  })

  if(newUser) {
    generateTokenAndSetCookie(newUser._id,res); //generate a token and set it as a cookie
    await newUser.save(); //save the user to the database

    res.status(201).json({ //message: "User created successfully"
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      followers: newUser.followers,
      followers: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    }) 
  } else {
    res.status(400).json({error: "Invalid user data"})
  }

 } catch (error) {
  console.log("error: ",error.message)
  res.status(500).json({error:error.message})
 }
}

export const login = async (req,res) => {
  res.json({
    data: "You hit the login endpoint!"
  })
}

export const logout = async (req,res) => {
  res.json({
    data: "You hit the logout endpoint!"
  })
}

