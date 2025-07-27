import { faker } from '@faker-js/faker';
import { createFakeContact } from '../utils/createFakeContact.js';
import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const generateContacts = async (number) => {
    try {
        const newContact = faker.helpers.multiple(createFakeContact, {
            count: number,
        });
        const existingContacts = await readContacts();
        existingContacts.push(...newContact);
        await writeContacts(existingContacts);
        return existingContacts;
    }
    catch (err) {
        console.log(err);
    }
 };

generateContacts(5);
