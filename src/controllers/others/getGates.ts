import * as cheerio from "cheerio";
import purifyText from "../../utils/purifyText";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Response } from "express";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const { htmlContent } = req.body

        const $ = cheerio.load(htmlContent)

        res.status(200).json({
            message: 'Gates fetched successfully', data: {
                dep: 'b3',
                arr: 'b4'
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
        return;
    }
}