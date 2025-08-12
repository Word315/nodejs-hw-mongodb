import Joi from "joi";

export const registerUser = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const loginUser = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});