import mongoose from "mongoose";
import { model, Schema } from "mongoose";

const sessionShema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        accessTokenValidUntil: {
            type: Date,
            required: true,
        },
        refreshTokenValidUntil: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Session = model('session', sessionShema);