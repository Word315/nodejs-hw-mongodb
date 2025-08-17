import createHttpError from "http-errors";
import { Session } from "../db/models/session.js";
import { User } from "../db/models/user.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw createHttpError(401, 'Please provide Authorization header');

    const [bearer, accessToken] = authorization.split(' ');
    if (bearer !== 'Bearer' || !accessToken) throw createHttpError(401, 'Please provide a valid access token');

    const session = await Session.findOne({ accessToken });
    if (!session) throw createHttpError(401, 'Session not found');

    if (session.accessTokenValidUntil < new Date()) throw createHttpError(401, 'Access token is expired');

    const user = await User.findById(session.userId);
    if (!user) throw createHttpError(401, 'User not found');

    // Тепер у контролерах контактів можна робити req.user._id
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
