import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async (page, perPage, sortBy, sortOrder, filter, userId) => {
  let query = { userId };

  // далі додаємо фільтрацію
  if (typeof filter.type !== "undefined") {
    query.contactType = filter.type;
  }

  if (typeof filter.isFavourite !== "undefined") {
    query.isFavourite = filter.isFavourite;
  }

  return ContactsCollection.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * perPage)
    .limit(perPage);
};


export const getContactById = async (contactId, userId) => {
  return ContactsCollection.findOne({ _id: contactId, userId });
};

export const createContact = async (contactData) => {
  const newContact = await ContactsCollection.create(contactData);
  return newContact;
};

export const updateContact = async (contactId, data, userId) => {
  return ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    data,
    { new: true }
  );
};

export const deleteContact = async (contactId, userId) => {
  return ContactsCollection.findOneAndDelete({ _id: contactId, userId });
};

export const replaceContact = async (contactId, data, userId) => {
  return ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    data,
    { new: true, upsert: true }
  );
};
