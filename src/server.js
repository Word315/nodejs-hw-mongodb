import path from "node:path";
import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { auth } from './middlewares/authenticate.js';

// 👉 додаємо
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const PORT = getEnvVar('PORT') || 5543;

export const setupServer = () => {
    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());

    app.use("/photos", express.static(path.resolve('src/uploads/photos')));

    const logger = (
        pino({
            transport: {
                target: 'pino-pretty',
            }
        })
    );

    app.use(pinoHttp({ logger }));

    app.use('/auth', authRouter);
    app.use('/contacts', auth, contactsRouter);

    // 👉 Swagger UI (до notFoundHandler!)
    let swaggerDocument = { openapi: '3.0.0', info: { title: 'Docs not found', version: '0.0.0' } };
    try {
        if (fs.existsSync('./docs/swagger.json')) {
            swaggerDocument = JSON.parse(fs.readFileSync('./docs/swagger.json', 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to load swagger.json:', e);
    }
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

    // 404 та errors тільки після всіх роутів
    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(PORT, (error) => {
        if (error) {
            throw error;
        }

        logger.info(`Server started on port ${PORT}`);
    });
};
