import { ContactsCollection } from "../db/models/contacts.js";

export const getAllContacts = async (page, perPage, sortBy, sortOrder, filter = {}) => {
    const skip = page > 0 ? (page - 1) * perPage : 0;

    // Формуємо об’єкт фільтра
    const filterQuery = {};
    if (typeof filter.type !== 'undefined') {
        filterQuery.contactType = filter.type;
    }
    if (typeof filter.isFavourite !== 'undefined') {
        filterQuery.isFavourite = filter.isFavourite;
    }

    // Перетворюємо sortOrder у формат, який розуміє Mongoose (1 або -1)
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Виконуємо запити паралельно
    const [count, contacts] = await Promise.all([
        ContactsCollection.countDocuments(filterQuery),
        ContactsCollection.find(filterQuery)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(perPage)
    ]);

    const totalPages = Math.ceil(count / perPage);

    return {
        data: contacts,
        page,
        perPage,
        totalItems: count,
        totalPages,
        hasNextPage: totalPages > page,
        hasPreviousPage: page > 1,
    };
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