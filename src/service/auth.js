import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from "../db/models/user.js";
import { Session } from '../db/models/session.js';
import createHttpError from 'http-errors';

export const registerUser = async (payload) => {
    const user = await User.findOne({ email: payload.email });

    if (user) {
        throw createHttpError(409, 'Email in use');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await User.create({
        ...payload,
        password: encryptedPassword,
    });
};

export const loginUser = async (payload) => {
    const user = await User.findOne({ email: payload.email });

    if (!user) {
        throw createHttpError(401, 'User not found');
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
        throw createHttpError(401, 'Unauthorized');
    }

    await Session.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return await Session.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), //15 minutes
        refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
    });
};

export const logoutUser = async (sessionId) => {
    await Session.deleteOne({ _id: sessionId });
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
    const session = await Session.findOne({
        _id: sessionId,
        refreshToken,
    });

    if (!session) {
        throw new createHttpError.Unauthorized('Session not found');
    }

    if (session.refreshToken !== refreshToken) {
        throw new createHttpError.Unauthorized('Refresh token is invalid');
    }

    if (session.refreshTokenValidUntil < new Date()) {
        throw new createHttpError.Unauthorized('Refresh token is expired');
    }

    await Session.deleteOne({ _id: session._id });

    return Session.create({
        userId: session.userId,
        accessToken: randomBytes(30).toString('base64'),
        refreshToken: randomBytes(30).toString('base64'),
        accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), //15 minutes
        refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
    });
};