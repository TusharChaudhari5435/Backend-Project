import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadOnCloudinary= async (localFilePath)=>{
try{
    if(!localFilePath) return null;
    // Uploading on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
    });

    // upload successful
   // console.log('Cloudinary upload response url:', response.url);
    fs.unlinkSync(localFilePath); //remove file from local uploads folder
    return response;

}   
    catch(error){
        fs.unlinkSync(localFilePath); //remove file from local uploads folder
        return null;
    }
}




    