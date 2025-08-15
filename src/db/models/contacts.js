import { model, Schema } from 'mongoose';

const contactsShema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        isFavourite: {
            type: Boolean,
            default: false,
        },
        contactType: {
            type: String,
            enum: ["work", "home", "personal"],
            required: true,
            default: "personal",
        },
        userId: { // Додаємо зв’язок з користувачем
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const ContactsCollection = model('contacts', contactsShema);
