const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./env" });

const db = async () => {
  try {
    await mongoose.connect(
      process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD),
      {
        useNewUrlParser: true,
      }
    );

    console.log("Database connected");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = db;
