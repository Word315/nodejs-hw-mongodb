import * as fs from 'node:fs/promises';
import { readContacts } from '../utils/readContacts.js';
import { PATH_DB } from '../constants/contacts.js';

export const removeLastContact = async () => {
    try {
        const contacts = await readContacts();
        if (contacts.length === 0) {
            console.log("📂 Contact list is empty. Nothing to remove.");
            return null;
        }

        const toRemove = contacts.pop();
        await fs.writeFile(PATH_DB, JSON.stringify(contacts, undefined, 2));
        return toRemove;
    }
    catch (err) {
        console.log(err);
    }
 };

removeLastContact();
