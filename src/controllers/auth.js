import { logoutUser, refreshSession, registerUser, reqestPasswordReset, resetPassword} from "../service/auth.js";
import { loginUser } from '../service/auth.js';

export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: user,
    });
};

export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body);

    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
    });

    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
    });

    res.status(200).json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const logoutUserController = async (req, res) => {
    if (req.cookies.sessionId) {
        await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).end();
};

export const refreshUserController = async (req, res) => {
    const { sessionId, refreshToken } = req.cookies;

    const session = await refreshSession({sessionId, refreshToken});

    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expire: session.refreshTokenValidUntil,
    });

    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expire: session.refreshTokenValidUntil,
    });

    res.status(200).json({
        status: 200,
        message: 'Session refreshed successfully',
        data: {
            accessToken: session.accessToken,
        }
    });
};

export const reqestPasswordResetController = async (req, res) => {
    await reqestPasswordReset(req.body.email);
    res.status(200).json({
        status: 200,
        message: 'Reset password email has been successfully sent.',
        data: {},
    });
};

export const resetPasswordController = async (req, res) => {
    const { token, password } = req.body;

    await resetPassword(token, password);

    res.status(200).json({
        status: 200,
        message: "Password has been successfully reset.",
        data: {}
    }
    );
};