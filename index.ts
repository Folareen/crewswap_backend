import dotenv from 'dotenv';
dotenv.config()

import cors from 'cors';
import express from "express";
import { createServer } from 'http';
import notFound from "./src/middlewares/notFound";
import authRouter from './src/routes/auth';
import scheduleRouter from './src/routes/schedule'
import preferenceRouter from './src/routes/preference'
import userRouter from './src/routes/user'
import sequelizeInstance from './src/config/database';
import chatRouter from './src/routes/chat';
import setupSocket from './src/config/socket';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/', authRouter)
app.use('/api/v1/', scheduleRouter)
app.use('/api/v1/', preferenceRouter)
app.use('/api/v1/', userRouter)
app.use('/api/v1/', chatRouter)
app.use(notFound)

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelizeInstance.sync({ force: false, alter: true });
        console.log("Database synced successfully.");

        const httpServer = createServer(app);
        setupSocket(httpServer);

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to sync database:", err);
    }
})();