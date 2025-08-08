import express from 'express';
import { createContactController, deleteContactController, getContactByIdController, getContactsController, replaceContactController, updateContactController } from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createContactShema, updateContactShema } from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';

const router = express.Router();

router.get('/', ctrlWrapper(getContactsController));
    
router.get('/:id',
    isValidId,
    ctrlWrapper(getContactByIdController));

router.post('/',
    validateBody(createContactShema),
    ctrlWrapper(createContactController));

router.patch('/:id',
    isValidId,
    validateBody(updateContactShema),
    ctrlWrapper(updateContactController));

router.delete('/:id',
    isValidId,
    ctrlWrapper(deleteContactController));

router.put('/:id',
    isValidId,
    validateBody(createContactShema),
    ctrlWrapper(replaceContactController));
    
export default router;