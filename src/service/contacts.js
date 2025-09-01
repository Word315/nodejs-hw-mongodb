import { ContactsCollection } from "../db/models/contacts.js";

export const getAllContacts = async (page, perPage, sortBy, sortOrder, filter={}, userId) => {
    const skip = page > 0 ? (page - 1) * perPage : 0;

    const contactsQuery = ContactsCollection.find({userId});

    if (typeof filter.type !== 'undefined') {
        contactsQuery.where('contactType').equals(filter.type);
    }

    if (typeof filter.isFavourite !== 'undefined') {
        contactsQuery.where('isFavourite').equals(filter.isFavourite);
    }

    const [count, contacts] = await Promise.all([
        ContactsCollection.find().countDocuments(contactsQuery),
        contactsQuery.sort({[sortBy]: sortOrder}).skip(skip).limit(perPage)]);
    
    const totalPages = Math.ceil(count / perPage);

    return {
        data: contacts,
        page,
        perPage,
        totalItems: count,
        totalPages: totalPages,
        hasNextPage: totalPages > page,
        hasPreviousPage: page > 1,
    };
};

export const getContactById = async (contactId, userId) => {
    return ContactsCollection.findOne({_id: contactId, userId });
};

export const createContact = async (payload) => {
    return ContactsCollection.create(payload);
};

export const updateContact = async (contactId, payload) => {
    return ContactsCollection.findOneAndUpdate({_id: contactId}, payload, { new: true });
};

export const deleteContact = async (contactId) => {
    return ContactsCollection.findOneAndDelete({_id:contactId});
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