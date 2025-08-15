import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  loginUser,
  registerUser,
  requestPasswordResetSchema,
  resetPasswordSchema
} from "../validation/auth.js";

import {
  loginUserController,
  logoutUserController,
  refreshUserController,
  registerUserController,
  requestPasswordResetController, // правильна назва
  resetPasswordController
} from "../controllers/auth.js";

const router = express.Router();

// Реєстрація
router.post(
  "/register",
  validateBody(registerUser),
  ctrlWrapper(registerUserController)
);

// Логін
router.post(
  "/login",
  validateBody(loginUser),
  ctrlWrapper(loginUserController)
);

// Логаут
router.post(
  "/logout",
  ctrlWrapper(logoutUserController)
);

// Оновлення токена
router.post(
  "/refresh",
  ctrlWrapper(refreshUserController)
);

// Надсилання email для скидання паролю
router.post(
  "/send-reset-email",
  validateBody(requestPasswordResetSchema),
  ctrlWrapper(requestPasswordResetController) // правильна назва функції
);

// Скидання паролю
router.post(
  "/reset-pwd",
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController)
);

export default router;
