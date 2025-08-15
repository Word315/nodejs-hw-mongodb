import createHttpError from 'http-errors';
import {
    createContact,
    deleteContact,
    getAllContacts,
    getContactById,
    replaceContact,
    updateContact
} from '../service/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getContactsController = async (req, res) => {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts(page, perPage, sortBy, sortOrder, filter, req.user.id);

    res.status(200).json({
        status: 200,
        message: "Successfully found contacts!",
        data: contacts,
    });
};

export const getContactByIdController = async (req, res) => {
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

export const createContactController = async (req, res) => {
    const contact = await createContact({ ...req.body, userId: req.user.id });

    res.status(201).json({
        status: 201,
        message: "Successfully created a contact!",
        data: contact,
    });
};

export const updateContactController = async (req, res) => {
    const result = await updateContact(req.params.id, req.body, req.user.id);

    if (!result) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
        status: 200,
        message: "Successfully patched a contact!",
        data: result,
    });
};

export const deleteContactController = async (req, res) => {
    const result = await deleteContact(req.params.id, req.user.id);

    if (!result) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(204).end();
};

export const replaceContactController = async (req, res) => {
    const result = await replaceContact(req.params.id, req.body, req.user.id);

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
};
