import Notification from "../models/notification.model.js";

export const getNotifications = async (req,res) => {
try {
  const userId = req.user._id;

  const notifications = await Notification.find({to:userId}).populate({
    path: 'from',
    select: "username profilePic"
  })

  await Notification.updateMany({to:userId}, {read:true})

  res.status(200).json({notifications})

} catch(error) {
  console.log("Error in getNotifications:  ",error.message),
  res.status(500).json({message: "Internal server Error"})
}
}

export const deleteNotifications = async (req,res) => { 
  try {
    const userId = req.user._id; // get the user id from the token
    await Notification.deleteMany({to:userId}) // delete all the notifications where to is the user id

    res.status(200).json({message: "Notifications deleted successfully"})


  } catch(error) {
    console.log("Error in deleteNotifications:  ",error.message),
    res.status(500).json({message: "Internal server Error"})
  }
}

/* export const deleteNotification = async (req,res) => { // delete a single notification
  try {
      const notificationId = req.params.id; // get the notification id from the url
      const userId = req.user._id; // get the user id from the token
      const notification = await Notification.findById(notificationId); // find the notification by id

      if(!notification) {
        return res.status(404).json({message: "Notification not found"})
      }

      if(notification.to.toString() !== userId.toString()) { // check if the user id in the token is the same as the to field in the notification
        return res.status(403).json({message: "You are not authorized to delete this notification"})
      }

      await Notification.findByIdAndDelete(notificationId); // delete the notification by id
      res.status(200).json({message: "Notification deleted successfully"})

  } catch (error) {
      console.log("Error in deleteNotification:  ",error.message),
      res.status(500).json({message: "Internal server Error"})
  }
}
 */
