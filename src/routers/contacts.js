import express from 'express';
import { createContactController, deleteContactController, getContactByIdController, getContactsController, replaceContactController, updateContactController } from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(getContactsController));
    
router.get('/:id', ctrlWrapper(getContactByIdController));

router.post('/', ctrlWrapper(createContactController));

router.patch('/:id', ctrlWrapper(updateContactController));

router.delete('/:id', ctrlWrapper(deleteContactController));

router.put('/:id', ctrlWrapper(replaceContactController));
    
export default router;