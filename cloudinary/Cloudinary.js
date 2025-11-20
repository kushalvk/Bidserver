import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            console.log("File Buffer is missing");
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {

                if (error) {
                    console.log("Cloudinary Upload Error:", error);
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
}

export {uploadOnCloudinary};