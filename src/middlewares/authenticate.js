import createHttpError from "http-errors";
import { Session } from "../db/models/session.js";
import { User } from "../db/models/user.js";

export const auth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (typeof authorization !== 'string') {
        throw new createHttpError.Unauthorized('Please provide Authorization header');
    }

    const [bearer, accessToken] = authorization.split(' ', 2);

    if (bearer !== 'Bearer' || typeof accessToken !== 'string') {
        throw new createHttpError.Unauthorized('Please provide access token');
    }

    const session = await Session.findOne({ accessToken });

    if (session === null) {
        throw new createHttpError.Unauthorized('Session not found');
    }

    if (session.accessTokenValidUntil < new Date()) {
        throw new createHttpError.Unauthorized('Access token is expired');
    }

    const user = await User.findById(session.userId);

    if (user === null) {
        throw new createHttpError.Unauthorized('User not found');
    }

    req.user = { id: user._id, name: user.name };

    next();
};