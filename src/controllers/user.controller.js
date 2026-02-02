import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/apiResponse.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId)=>{
    try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
}catch(error){
    throw new ApiError(500,"Error in generating tokens");
}
}

export const registerUser= asyncHandler(async(req,res)=>{
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

    const {fullName,email,username,password}=req.body;
   
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==='')
    ){
       throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{email},{userName:username}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username");
    }

     console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

 
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required");
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500,"Error in uploading avatar image");
    }

    const user = await User.create({
        fullName,
        email,
        userName:username.toLowerCase(),
        password,   
        avatar:avatar.url,
        coverImage:coverImage.url || '',
    }).catch((error) => {
        if (error.code === 11000) {
            throw new ApiError(409, "User already exists with this email or username");
        }
        throw error;
    });

    const createdUser = await User.findById(user._id).select('-password -refreshToken');
    if(!createdUser){
        throw new ApiError(500,"User not created");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    );


});

export const loginUser = asyncHandler(async(req,res)=>{
    // get req body
    // validation
    // check if user exists
    // compare password
    // generate tokens
    // save refresh token in db
    // return response  
    const {username,email,password}=req.body;
    if(!(username || email)){
        throw new ApiError(400,"Username and email are required");
    }
    
    const user = await User.findOne({
        $or:[{userName:username},{email}] 
    })

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:false//true if in production level code - https & false- localhost
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
            },"User logged in successfully")
    );

});
export const logoutUser = asyncHandler(async(req,res)=>{
    // get user id from req.user
    // find user in db
    // remove refresh token from db
    // clear cookies
    // return 
     const loggedInUser = req.user;

    if(!loggedInUser){
       throw new ApiError(401,"Unauthorized");
    }

    loggedInUser.refreshToken = undefined;
    await loggedInUser.save({validateBeforeSave:false});

    const options = {
        httpOnly:true,
        secure:false//true for production level code - https & false- localhost
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options) 
    .json(
        new ApiResponse(200,null,"User logged out successfully")
    );
})

export const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }

   try {
     const decodedRefreshToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

     const user = await User.findById(decodedRefreshToken._id);
 
     if(!user){
         throw new ApiError(401,"Invalid Refresh Token - user not exist");
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
             throw new ApiError(401,"Refresh Token expired or used");
     }
  
     const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id);
 
     const options = {
         httpOnly:true,
         secure:true
     }
 
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json( 
         new ApiResponse(
             200,
             {accessToken,refreshToken},
             "Access Token Refreshed"
         )
     )
   } catch (error) {
     throw new ApiError(401,"Invalid Refresh Token");
   }
})

export const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const isPasswordCorrect = await isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Password Changed Successfully"
        )
    )
})

export const getCurrentUserProfile = asyncHandler(async(req,res)=>{
    return res.status(200).json(
       new ApiResponse(200,req.user,"User profile fetched successfully");
    ); 
});

export const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;

    if(!fullName || !email){
        throw new ApiError(400,"Full name and email are required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,  
        {fullName,email},
        {new:true,runValidators:true}
    ).select("-password -refreshToken");

    if(!user){
        throw new ApiError(500,"Error in updating user details");
    }

    return res.status(200).json(
        new ApiResponse(200,user,"User details updated successfully")
    );
});

export const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500,"Error in uploading avatar image");
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {avatar:avatar.url},
        {new:true}
    ).select("-password -refreshToken");

    if(!user){
        throw new ApiError(500,"Error in updating avatar image");
    }
    return res.status(200).json(
        new ApiResponse(200,user,"User avatar updated successfully")
    );
});

export const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path; 

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new ApiError(500,"Error in uploading cover image");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {coverImage:coverImage.url},
        {new:true}
    ).select("-password -refreshToken");

    if(!user){
        throw new ApiError(500,"Error in updating cover image");
    }   
    
    return res.status(200).json(
        new ApiResponse(200,user,"User cover image updated successfully")
    );
});