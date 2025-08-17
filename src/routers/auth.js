import express from 'express';

import { validateBody } from '../middlewares/validateBody.js';
import {ctrlWrapper } from '../utils/ctrlWrapper.js';
import { loginUser, registerUser } from '../validation/auth.js';
import {
    loginUserController,
    logoutUserController,
    refreshUserController,
    registerUserController
} from '../controllers/auth.js';

const router = express.Router();

router.post(
    '/register',
    validateBody(registerUser),
    ctrlWrapper(registerUserController),
);

router.post(
    '/login',
    validateBody(loginUser),
    ctrlWrapper(loginUserController),
);

router.post(
    '/logout',      
    ctrlWrapper(logoutUserController),
);

router.post(
    '/refresh',
    ctrlWrapper(refreshUserController),
);

export default router;