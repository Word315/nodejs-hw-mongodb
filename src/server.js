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

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const PORT = getEnvVar('PORT') || 3000;

export const setupServer = () => {
    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());

    app.use("/photos", express.static(path.resolve('src/uploads/photos')));

    const logger = pino({
        transport: {
            target: 'pino-pretty',
        }
    });

    app.use(pinoHttp({ logger }));

    // Swagger UI з готового swagger.json
    const swaggerDocument = JSON.parse(fs.readFileSync(path.resolve('docs/swagger.json')));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Routes
    app.use('/auth', authRouter);
    app.use('/contacts', auth, contactsRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(PORT, (error) => {
        if (error) {
            throw error;
        }
        logger.info(`🚀 Server started on port ${PORT}`);
        logger.info(`📚 Docs available at http://localhost:${PORT}/api-docs`);
    });
};
