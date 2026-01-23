import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/apiResponse.js';

export const registerUser= asyncHandler(async(req,res,next)=>{
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
    console.log("BODY:",req.body);
    
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==='')
    ){
       throw new ApiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username");
    }

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
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken');
    if(!createdUser){
        throw new ApiError(500,"User not created");
    }

    return res.status(201).json({
        new ApiResponse(201,createdUser,"User registered successfully");
    });


});

export const HelloUser= asyncHandler(async(req,res,next)=>{

    const users={
        name:"Tushar Chaudhari",
        Username:"Tushar",
        MONO:"9130547335"
    }
    res.status(200).json(users);

    const {email}=req.body;
    console.log("BODY:",req.body.email);
});