import mongoose from "mongoose";
// connection to the database
const connectMongoDB = async () => {
  try {
    console.log('Connecting to mongoDB...')
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)

  } catch (error) {
    console.log(`Error connecting to mongoDB: ${error.message}`)
    process.exit(1)
  }
}


export default connectMongoDB;
