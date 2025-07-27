import * as fs from 'node:fs/promises';
import { PATH_DB } from '../constants/contacts.js';

export const readContacts = async () => {
    try {
        await fs.access(PATH_DB);
        const fileData = await fs.readFile(PATH_DB, 'utf-8');
        return JSON.parse(fileData);
    }
    catch (err) {
        if (err.code === 'ENOENT') return [];
        console.error('Error reading contacts');
        return [];
    }
};

readContacts();
