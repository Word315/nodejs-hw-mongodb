import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { User } from "../db/models/user.js";
import { Session } from "../db/models/session.js";
import { sendMail } from "../utils/sendMail.js";
import { getEnvVar } from "../utils/getEnvVar.js";

// Реєстрація користувача
export const registerUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashedPassword });
  return user;
};

// Логін користувача
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, "Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createHttpError(401, "Invalid email or password");

  const accessToken = jwt.sign({ email }, getEnvVar("JWT_SECRET"), { expiresIn: "15m" });
  const refreshToken = jwt.sign({ email }, getEnvVar("JWT_SECRET"), { expiresIn: "30d" });

  // Створюємо сесію
  const now = new Date();
  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now.getTime() + 15 * 60 * 1000), // 15 хв
    refreshTokenValidUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 днів
  });

  return { _id: user._id, accessToken, refreshToken, sessionId: session._id };
};

// Logout користувача
export const logoutUser = async (sessionId) => {
  if (sessionId) {
    await Session.findByIdAndDelete(sessionId);
  }
};

// Оновлення сесії
export const refreshSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findById(sessionId);
  if (!session || session.refreshToken !== refreshToken || session.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  const payload = jwt.verify(refreshToken, getEnvVar("JWT_SECRET"));
  const accessToken = jwt.sign({ email: payload.email }, getEnvVar("JWT_SECRET"), { expiresIn: "15m" });

  session.accessToken = accessToken;
  session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  await session.save();

  return { _id: session._id, accessToken, refreshToken, refreshTokenValidUntil: session.refreshTokenValidUntil };
};

// Запит на скидання паролю
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, "User not found!");

  const token = jwt.sign({ email }, getEnvVar("JWT_SECRET"), { expiresIn: "5m" });
  const resetLink = `${getEnvVar("APP_DOMAIN")}/reset-password?token=${token}`;

  try {
    await sendMail({
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
  } catch {
    throw createHttpError(500, "Failed to send the email, please try again later.");
  }
};

// Скидання паролю
export const resetPassword = async (token, newPassword) => {
  let payload;
  try {
    payload = jwt.verify(token, getEnvVar("JWT_SECRET"));
  } catch {
    throw createHttpError(401, "Token is expired or invalid.");
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, "User not found!");

  user.password = await bcrypt.hash(newPassword, 10);

  // Видалення всіх активних сесій користувача
  await Session.deleteMany({ userId: user._id });

  await user.save();
};
