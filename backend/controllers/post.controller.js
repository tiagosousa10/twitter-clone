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
