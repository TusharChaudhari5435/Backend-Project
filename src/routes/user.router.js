import {Router} from 'express';

const router=Router();

import {registerUser} from '../controllers/user.controller.js'; 

router.post('/register',registerUser);

export const userRouter=router;
