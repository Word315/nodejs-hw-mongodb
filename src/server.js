import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContacts, getContactById } from './service/contacts.js';

const PORT = getEnvVar('PORT') || 5543;

export const setupServer = () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    const logger = (
        pino({
            transport: {
                target: 'pino-pretty',
            }
        })
    );

    app.use(pinoHttp({ logger }));

    app.get('/contacts', async (req, res) => {
        const contacts = await getAllContacts();

        res.json({
            status: 200,
            message: "Successfully found contacts!",
            data: contacts,
        });
    });

    app.get('/contacts/:contactId', async (req, res, next) => {
        const {contactId} = req.params;
        const contact = await getContactById(contactId);

        if (!contact) {
            res
                .status(404)
                .json({
                    message: 'Contact not found'
                });
            return;
        }

        res.json({
            status: 200,
            message: `Successfully found contact with id ${contactId}!`,
            data: contact,
        });
    });

    app.use((req, res, next) => {
        res.status(404).json({
            status: 404,
            message: 'Not found',
        });
    });

    app.use((err, req, res, next) => {
        res.status(500).json({
            status: 500,
            message: 'Something went wrong',
            error: err.message,
        });
    });

    app.listen(PORT, (error) => {
        if (error) {
            throw error;
        }

        logger.info(`Server started on port ${PORT}`);
    });
};