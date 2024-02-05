const mongoose=require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      "Connected To Mongodb Database "
    );
  } catch (error) {
    console.log(`MongoDB Erorr ${error}`);
  }
};

module.exports=connectDB;
