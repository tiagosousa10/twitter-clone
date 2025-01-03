import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

import {v2 as cloudinary} from 'cloudinary'

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id) // post id
    if(!post) return res.status(404).json({message: "Post not found"})
    
    if(post.user.toString() !== req.user._id.toString()) { // post.user is an ObjectId, req.user._id is a string
      return res.status(401).json({message: "You are not authorized to delete this post"})
    }


    if(post.img) { // if post has an image
      const imgId = post.img.split("/").pop().split(".")[0] // get image id from url
      await cloudinary.uploader.destroy(imgId) // delete image from cloudinary
    }

    await Post.findByIdAndDelete(req.params.id) // delete post from db

    res.status(200).json({message: "Post deleted successfully"})


  } catch (error) {
    console.log("Error in deletePost controller: ", error.message)
    res.status(500).json({error: "Internal server error"})
  }
}

export const commentOnPost = async(req,res) => {
  try {
    const {text} = req.body;
    const postId= req.params.id; // post id
    const userId = req.user._id; // user id

    if(!text) return res.status(400).json({error:"Comment must have text"})
    
    const post = await Post.findById(postId)
    if(!post) return res.status(404).json({error:"Post not found"})

    const comment = {user: userId, text}

    post.comments.push(comment)
    await post.save()

    res.status(200).json(post)

  } catch(error) {
    console.log("Error in commentOnPost controller: ", error.message)
    res.status(500).json({error: "Internal server error"})
  }
}

export const likeUnlikePost = async(req,res) => {
  try {
    const userId = req.user._id; // user id
    const {id:postId} = req.params;

    const post = await Post.findById(postId) // post id
    if(!post) return res.status(404).json({error:"Post not found"})
    
    const userLikedPost = post.likes.includes(userId) // check if user already liked post

    if(userLikedPost) { // if user already liked post
      //unlike post
      await Post.updateOne({_id:postId}, {$pull: {likes:userId}})
      res.status(200).json({message:"Post unliked successfully"})
    } else {
      //like post
      post.likes.push(userId) // add user id to likes array
      await post.save() // save post

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      })

      await notification.save() // save notification

      res.status(200).json({message:"Post liked successfully"})
    }

  } catch(error) {
    console.log("Error in likeUnlikePost controller:", error.message)
    res.status(500).json({error: "Internal server error"})
  }
}

export const getAllPosts = async (req,res) => {
  try {
    const posts = await Post.find().sort({createdAt: -1}).populate({
      path: "user", // populate user field from User model
      select: "-password" // exclude password field
    }) // get all posts and sort by createdAt in descending order

    if(posts.length === 0) {
      return res.status(200).json([]) // return empty array if no posts
    }

    res.status(200).json(posts)

  } catch( error) {
    console.log("Error in getAllPosts controller: ", error.message)
    res.status(500).json({error: "Internal server error"})
  }
}
