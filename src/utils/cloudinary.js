import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {return null;}
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`File uploaded on cloudinary url : ${response.url}`);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload got failed 
        return null
    }
}

const deleteFromCloudinary = async (publicId, resource_type) => {
    try {
        if (!publicId) {return null;}
        //upload the file on cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type
        })
        console.log(`File deleted from cloudinary : ${response.result}`);
        return response;
    } catch (error) {
        return null
    }
}


export { uploadOnCloudinary, deleteFromCloudinary };