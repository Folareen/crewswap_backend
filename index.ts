import dotenv from 'dotenv';
dotenv.config()

import cors from 'cors';
import express from "express";
import notFound from "./src/middlewares/notFound";
import authRouter from './src/routes/auth';


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/', authRouter)

app.use(notFound)


// app.post("/scrape", (req: Request, res: Response) => {
//     try {

//         const scrapedData = req.body.data;

//         if (!scrapedData) {
//             res.status(400).json({ message: '' })
//         }

//         console.log(scrapedData)

//         const filePath = path.join(__dirname, "scrape.json");

//         // Write data to a json file
//         fs.writeFile(filePath, scrapedData, (err) => {
//             if (err) {
//                 return res.status(500).json({ message: "Error writing file", error: err.message });
//             }

//             // Send the file for download
//             res.download(filePath, "scrape.json", (downloadErr) => {
//                 if (downloadErr) {
//                     return res.status(500).json({ message: "Error downloading file", error: downloadErr.message });
//                 }

//                 // Delete the file after download
//                 fs.unlink(filePath, (unlinkErr) => {
//                     if (unlinkErr) {
//                         console.error("Error deleting file:", unlinkErr);
//                     }
//                 });
//             });
//         });

//         res.status(200).json({ message: 'Success' })

//     }

//     catch (error) {
//         console.log(error, 'errrorrr')
//     }

// });

const PORT = 5000;


(async () => {
    try {
        // await sequelizeInstance.sync({ force: false, alter: true });
        // console.log("Database synced successfully.");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to sync database:", err);
    }
})();