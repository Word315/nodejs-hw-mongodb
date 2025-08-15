import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../db/models/user.js';
import { sendMail } from '../utils/sendMail.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const registerUser = async (data) => {
    const user = await User.create(data);
    return user;
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
        throw createHttpError(401, 'Invalid email or password');
    }

    const accessToken = jwt.sign({ email }, getEnvVar('JWT_SECRET'), { expiresIn: '15m' });
    const refreshToken = jwt.sign({ email }, getEnvVar('JWT_SECRET'), { expiresIn: '30d' });

    return { _id: user._id, accessToken, refreshToken };
};

export const logoutUser = async (sessionId) => {
    // Тут логіка видалення сесії, якщо є
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
    const payload = jwt.verify(refreshToken, getEnvVar('JWT_SECRET'));
    const accessToken = jwt.sign({ email: payload.email }, getEnvVar('JWT_SECRET'), { expiresIn: '15m' });

    return {
        _id: sessionId,
        accessToken,
        refreshToken,
        refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
};

export const requestPasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User not found!');
    }

    const token = jwt.sign(
        { email },
        getEnvVar('JWT_SECRET'),
        { expiresIn: '5m' }
    );

    console.log('📨 Password reset token:', token);
    const resetLink = `${getEnvVar('APP_DOMAIN')}/reset-password?token=${token}`;

    try {
        await sendMail({
            to: email,
            subject: 'Password Reset',
            text: `Click this link to reset your password: ${resetLink}`,
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });

        console.log('✅ Email sent to:', email);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw createHttpError(500, 'Failed to send the email, please try again later.');
    }
};

export async function resetPassword(token, newPassword) {
  let payload;
  try {
    payload = jwt.verify(token, getEnvVar("JWT_SECRET"));
  } catch {
    throw createHttpError(401, "Token is expired or invalid.");
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  user.password = newPassword;
  await user.save();

  // Тут можна видалити активні сесії користувача, якщо вони зберігаються
}
