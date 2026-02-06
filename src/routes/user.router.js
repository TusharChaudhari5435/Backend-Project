import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js';
import {VerifyToken} from '../middlewares/auth.middleware.js';

const router=Router();

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUserProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getChannelProfile,
    getWatchedHistory
} from '../controllers/user.controller.js'; 

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

router.post('/change-password',VerifyToken,changeCurrentPassword);

router.get('/current-user',VerifyToken,getCurrentUserProfile);
 
router.patch('/update-account',VerifyToken,updateAccountDetails);

router.patch('/avatar',VerifyToken,upload.single('avatar'),updateUserAvatar);

router.patch('/cover-image',VerifyToken,upload.single('coverImage'),updateUserCoverImage);

router.get('/c/:username',VerifyToken,getChannelProfile);

router.get('/history',VerifyToken,getWatchedHistory);


export const userRouter=router;
