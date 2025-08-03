import { ContactsCollection } from "../db/models/contacts.js";

export const getAllContacts = async () => {
    return ContactsCollection.find();
};

export const getContactById = async (contactId) => {
    return ContactsCollection.findById(contactId);
};

export const createContact = async (payload) => {
    return ContactsCollection.create(payload);
};

export const updateContact = async (contactId, payload) => {
    return ContactsCollection.findByIdAndUpdate(contactId, payload, { new: true });
};

export const deleteContact = async (contactId) => {
    return ContactsCollection.findByIdAndDelete(contactId);
};

export const replaceContact = async (contactId, payload) => {
    const result = await ContactsCollection.findByIdAndUpdate(contactId, payload, {
        new: true,
        upsert: true,
        includeResultMetadata: true
    });

    return {
        value: result.value,
        updateExisting: result.lastErrorObject.updatedExisting,
    };
};