import { ContactsCollection } from '../db/models/contacts.js';
import mongoose from 'mongoose';

export const getAllContacts = async (page, perPage, sortBy, sortOrder, filter, userId) => {
    return ContactsCollection.find({ userId: new mongoose.Types.ObjectId(userId), ...filter })
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage);
};

export const getContactById = async (contactId, userId) => {
    return ContactsCollection.findOne({ _id: new mongoose.Types.ObjectId(contactId), userId: new mongoose.Types.ObjectId(userId) });
};

export const createContact = async (contactData) => {
    // contactData вже містить userId
    const newContact = await ContactsCollection.create(contactData);
    return newContact;
};

export const updateContact = async (contactId, data, userId) => {
    return ContactsCollection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(contactId), userId: new mongoose.Types.ObjectId(userId) },
        data,
        { new: true }
    );
};

export const deleteContact = async (contactId, userId) => {
    return ContactsCollection.findOneAndDelete({ _id: new mongoose.Types.ObjectId(contactId), userId: new mongoose.Types.ObjectId(userId) });
};

export const replaceContact = async (contactId, data, userId) => {
    return ContactsCollection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(contactId), userId: new mongoose.Types.ObjectId(userId) },
        data,
        { new: true, upsert: true }
    );
};
