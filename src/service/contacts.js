import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async (page, perPage, sortBy, sortOrder, filter, userId) => {
  return ContactsCollection.find({ userId, ...filter })
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
