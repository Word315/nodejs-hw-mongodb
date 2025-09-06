import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { createContact, deleteContact, getAllContacts, getContactById, replaceContact, updateContact } from '../service/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js'; //

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts(page, perPage, sortBy, sortOrder, filter, req.user._id);

    res.status(200).json({
      status: 200,
      message: "Successfully found contacts!",
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactByIdController = async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.id, req.user._id);

    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: "Successfully found contact!",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    let photoUrl = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      photoUrl = uploadResult.secure_url;
    }

    const contactData = {
      ...req.body,
      userId: new mongoose.Types.ObjectId(req.user._id),
      photo: photoUrl, // ✅ додаємо фото, якщо воно є
    };

    const newContact = await createContact(contactData);
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactController = async (req, res, next) => {
  try {
    let updatedData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      updatedData.photo = uploadResult.secure_url; // ✅ оновлюємо фото
    }

    const result = await updateContact(
      req.params.id,
      updatedData,
      req.user._id
    );

    if (!result) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const result = await deleteContact(req.params.id, req.user._id);

    if (!result) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const replaceContactController = async (req, res, next) => {
  try {
    const result = await replaceContact(req.params.id, req.body, req.user._id);

    if (result && !result.isNew) {
      return res.status(200).json({
        status: 200,
        message: 'Contact updated successfully',
        data: result,
      });
    }

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
