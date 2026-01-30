import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js';
import {VerifyToken} from '../middlewares/auth.middleware.js';

const router=Router();

import {registerUser,loginUser,logoutUser,refreshAccessToken} from '../controllers/user.controller.js'; 

router.post('/register',upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    }
]),registerUser);

router.post('/login',loginUser);

router.post('/logout',VerifyToken,logoutUser);

router.post('/refresh-token',refreshAccessToken);

export const userRouter=router;
