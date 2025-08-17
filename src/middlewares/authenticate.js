import createHttpError from "http-errors";
import { Session } from "../db/models/session.js";
import { User } from "../db/models/user.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (typeof authorization !== "string") {
      return next(createHttpError.Unauthorized("Please provide Authorization header"));
    }

    const [bearer, accessToken] = authorization.split(" ", 2);

    if (bearer !== "Bearer" || typeof accessToken !== "string") {
      return next(createHttpError.Unauthorized("Please provide access token"));
    }

    const session = await Session.findOne({ accessToken });

    if (!session) {
      return next(createHttpError.Unauthorized("Session not found"));
    }

    if (session.accessTokenValidUntil < new Date()) {
      return next(createHttpError.Unauthorized("Access token is expired"));
    }

    const user = await User.findById(session.userId);

    if (!user) {
      return next(createHttpError.Unauthorized("User not found"));
    }

    req.user = { id: user._id.toString(), name: user.name };

    next();
  } catch (err) {
    next(err);
  }
};
