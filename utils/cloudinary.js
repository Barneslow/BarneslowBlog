const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config({ path: "./env" });

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDNAME_API_KEY,
  api_secret: process.env.CLOUDNAME_API_SECRET,
});

const cloudinaryUploadingImg = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });

    return {
      url: data?.secure_url,
    };
  } catch (error) {
    return error;
  }
};

module.exports = cloudinaryUploadingImg;
