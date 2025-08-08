import createHttpError from "http-errors";

export const validateBody = (shema) => async (req, res, next) => {
    try {
        await shema.validateAsync(req.body, {
            abortEarly: false,
        });
        next();
    }
    catch (err) {
        const error = createHttpError(404, "Bad request", {
            errors: err.details,
        });
        next(error);
    }
};