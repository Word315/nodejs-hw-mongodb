import { ContactsCollection } from "../db/models/contacts.js";
import mongoose from "mongoose";

// Отримати всі контакти з пагінацією, сортуванням та фільтрами
export const getAllContacts = async (page = 1, perPage = 10, sortBy = "createdAt", sortOrder = "asc", filter = {}, userId) => {
  const skip = (page - 1) * perPage;

  // Базовий запит по userId
  const query = { userId: new mongoose.Types.ObjectId(userId) };

  // Додаємо фільтри, якщо вони є
  if (filter.contactType) query.contactType = filter.contactType;
  if (typeof filter.isFavourite !== "undefined") query.isFavourite = filter.isFavourite;

  // Загальна кількість контактів
  const totalItems = await ContactsCollection.countDocuments(query);

  // Отримання контактів з пагінацією і сортуванням
  const contacts = await ContactsCollection.find(query)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

// Отримати контакт по ID
export const getContactById = async (contactId, userId) => {
  const query = { _id: contactId };
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  return ContactsCollection.findOne(query);
};


// Створити контакт (userId підставляється автоматично)
export const createContact = async (contactData, userId) => {
  return ContactsCollection.create({
    ...contactData,
    userId: new mongoose.Types.ObjectId(userId),
  });
};

// Оновити контакт
export const updateContact = async (contactId, updateData, userId) => {
  return ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId: new mongoose.Types.ObjectId(userId) },
    updateData,
    { new: true }
  );
};

// Видалити контакт
export const deleteContact = async (contactId, userId = null) => {
  // Якщо userId передано — перевіряємо власника
  const query = { _id: new mongoose.Types.ObjectId(contactId) };
  if (userId) query.userId = new mongoose.Types.ObjectId(userId);

  return ContactsCollection.findOneAndDelete(query);
};

// Замінити контакт (replace)
export const replaceContact = async (contactId, contactData, userId) => {
  const result = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId: new mongoose.Types.ObjectId(userId) },
    contactData,
    { new: true, upsert: true, rawResult: true }
  );

  return {
    value: result.value,
    updateExisting: result.lastErrorObject.updatedExisting,
  };
};
