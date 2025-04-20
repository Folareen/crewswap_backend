import dotenv from 'dotenv';
dotenv.config()

import cors from 'cors';
import express from "express";
import notFound from "./src/middlewares/notFound";
import authRouter from './src/routes/auth';
import scheduleRouter from './src/routes/schedule'
import sequelizeInstance from './src/config/database';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/', authRouter)
app.use('/api/v1/', scheduleRouter)

app.use(notFound)


const PORT = 5000;


(async () => {
    try {
        await sequelizeInstance.sync({ force: false, alter: true });
        console.log("Database synced successfully.");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to sync database:", err);
    }
})();