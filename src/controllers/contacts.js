import createHttpError from 'http-errors';
import { createContact, deleteContact, getAllContacts, getContactById, replaceContact, updateContact } from '../service/contacts.js'; 
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// GET /contacts
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
  } catch (error) {
    next(error);
  }
};

// GET /contacts/:id
export const getContactByIdController = async (req, res, next) => {
    const contact = await getContactById(req.params.id, req.user.id);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
        status: 200,
        message: `Successfully found contact!`,
        data: contact,
    });
};

// POST /contacts
export const createContactController = async (req, res, next) => {
  try {
    let photoUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      photoUrl = result.secure_url;
    }

    const contact = await createContact({ ...req.body, photo: photoUrl, userId: req.user._id });

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /contacts/:id
export const updateContactController = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      updateData.photo = result.secure_url;
    }

    const updatedContact = await updateContact(req.params.id, updateData, req.user._id);

    if (!updatedContact) throw createHttpError(404, 'Contact not found');

    res.status(200).json({
      status: 200,
      message: "Successfully patched a contact!",
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /contacts/:id
export const deleteContactController = async (req, res, next) => {
  try {
    const deleted = await deleteContact(req.params.id, req.user._id);

    if (!deleted) throw createHttpError(404, 'Contact not found');

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// PUT /contacts/:id (replace)
export const replaceContactController = async (req, res, next) => {
  try {
    const { value, updateExisting } = await replaceContact(req.params.id, req.body, req.user._id);

    if (updateExisting) {
      return res.status(200).json({
        status: 200,
        message: 'Contact updated successfully',
        data: value,
      });
    }

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: value,
    });
  } catch (error) {
    next(error);
  }
};
