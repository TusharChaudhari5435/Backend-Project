import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"; 
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/apiError.js";

export const VerifyToken = asyncHandler(async(req,res,next)=>{ 
     const Token =req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if (!Token) {
    throw new ApiError(401, "Unauthorized - token missing");
     }
 
     const decodedToken = await jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET);
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
     if(!user){
         throw new ApiError(401,"Invalid access token - user does not exist");
     }
     req.user = user;
     next();
});