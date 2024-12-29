import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: {
    type:String,
    required:true,
    unique:true,
  },
  fullName: {
    type:String,
    required:true,
  },
  password: {
    type:String,
    required:true,
    minLength:6,
  },
  email: {
    type:String,
    required:true,
    unique:true,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId, // 16 characters
      ref:'User',
      default:[]
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId, // 16 characters
      ref:'User',
      default:[]
    }
  ],
  profileImg: {
    type:String,
    default:''
  },
  coverImg: {
    type:String,
    default:''
  },
  bio:{
    type:String,
    default:''
  },
  link: {
    type:String,
    default:'' 
  },
}, {timestamps:true}) //createdAt


const User = mongoose.model('User', userSchema);
export default User;
