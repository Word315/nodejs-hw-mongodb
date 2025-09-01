import * as fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from "../db/models/user.js";
import { Session } from '../db/models/session.js';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendMail } from '../utils/sendMail.js';
import Handlebars from 'handlebars';

const REQUEST_PASSWORD_RESET_TEMPLATE = fs.readFileSync(path.resolve('src/template/reset-pwd.hbs'), { encoding: 'utf-8' });

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

export const requestPasswordReset = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        return;
    }

    const token = jwt.sign({
        sub: user._id,
        name: user.name,
    }, getEnvVar('SECRET_JWT'),
        {
        expiresIn:'5m'
        });
    
    const template = Handlebars.compile(REQUEST_PASSWORD_RESET_TEMPLATE);
    
    await sendMail({
        to: email,
        subject: "Password reset",
        html: template({ resetPasswordLink: `http://localhost:3000/reset-password/${token}` }),
    });
};

export const resetPassword = async (token, password) => {
    try {
        const decoded = jwt.verify(token, getEnvVar('SECRET_JWT'));

        const user = await User.findById(decoded.sub);

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, { password: hashedPwd });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new createHttpError.Unauthorized("Token is expired.");
        }

        if (err.name === "JsonWebTokenError") {
            throw new createHttpError.Unauthorized("Token is unauthorized.");
        }

        throw err;
  }
};