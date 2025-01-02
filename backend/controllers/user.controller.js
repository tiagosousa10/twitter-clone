import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req,res) => {
  const {username} = req.params;

  try {
    const user = await User.findOne({username}).select('-password') // find user by username

    if(!user) return res.status(404).json({message: 'User not found'}) // if user not found


  } catch (error) {
    console.log("Error in getUserProfile",error.message)
    res.status(500).json({error : error.message})
  }

}

export const followUnfollowUser = async (req,res) => {
  try {
    const {id} = req.params;
    const userToModify = await User.findById(id); // find user to follow/unfollow
    const currentUser = await User.findById(req.user._id); // find current user

    if(id === req.user._id.toString()) { // if user tries to follow/unfollow himself
      return res.status(400).json({message: "You can't follow/unfollow yourself"})
    }

    if(!userToModify || !currentUser) return res.status(404).json({message: 'User not found'}) // if user not found

    const isFollowing = currentUser.following.includes(id) // check if current user is following the user

    if(isFollowing) {
      // unfollow user
      await User.findByIdAndUpdate(id, { $pull: {followers: req.user._id}}) // remove current user from followers of userToModify
      await User.findByIdAndUpdate(req.user._id, { $pull: {following: id}}) // remove userToModify from following of current user
      res.status(200).json({message:'User unfollowed successfully'})
    } else {
      // follow user
      await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}}) // add current user to followers of userToModify
      await User.findByIdAndUpdate(req.user._id, {$push: {following: id}}) // add userToModify to following of current user
     
      // send notification to userToModify
      const newNotification = new Notification({
        type:'follow',
        from:req.user._id,
        to:userToModify._id,
      })

      await newNotification.save()
      //TODO : return the id of the user as a response
      res.status(200).json({message:'User followed successfully'})
    }

  } catch (error) {
    console.log("Error in followUnfollowUser",error.message)
    res.status(500).json({error : error.message})
  }

}

export const getSuggestedUsers = async (req,res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select('following') // find users followed by me
    
    const users = await User.aggregate([
      {
        $match: {
          _id: {$ne: userId} // exclude current user
        }
    },
    {$sample: {size:10}}// get 10 random users
  ])

  const filteredUsers= users.filter(user=> !usersFollowedByMe.following.includes(user._id)) // filter out users already followed by me
  const suggestedUsers = filteredUsers.slice(0,4) // get first 4 users

  suggestedUsers.forEach(user => user.password = null ) 

  res.status(200).json(suggestedUsers)
  } catch(error) {

  }
}
