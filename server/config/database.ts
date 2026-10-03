import mongoose from "mongoose";

// Throws on failure so the process exits instead of serving an API with no database.
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  console.log("MongoDB Connected");
};

export default connectDB;
