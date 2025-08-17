import { registerUser, loginUser, logoutUser, refreshSession } from "../service/auth.js";

// Реєстрація користувача
export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: user, // без пароля
    });
};

// Логін користувача
export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body);

    // Ставимо куки для refreshToken та sessionId
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // тільки через https у продакшн
        sameSite: 'strict',
        expires: new Date(session.refreshTokenValidUntil),
    });

    res.cookie('sessionId', session._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(session.refreshTokenValidUntil),
    });

    res.status(200).json({
        status: 200,
        message: "Successfully logged in an user!",
        data: {
            accessToken: session.accessToken,
        },
    });
};

// Логаут користувача
export const logoutUserController = async (req, res) => {
    const { sessionId } = req.cookies;

    if (sessionId) {
        await logoutUser(sessionId);
    }

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).end();
};

// Оновлення сесії (рефреш токен)
export const refreshUserController = async (req, res) => {
    const { sessionId, refreshToken } = req.cookies;

    const session = await refreshSession({ sessionId, refreshToken });

    // Оновлюємо куки
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(session.refreshTokenValidUntil),
    });

    res.cookie('sessionId', session._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(session.refreshTokenValidUntil),
    });

    res.status(200).json({
        status: 200,
        message: "Successfully refreshed a session!",
        data: {
            accessToken: session.accessToken,
        },
    });
};
