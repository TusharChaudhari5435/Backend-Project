import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js';

const router=Router();

import {registerUser,HelloUser} from '../controllers/user.controller.js'; 

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

router.get('/test',HelloUser);

export const userRouter=router;
