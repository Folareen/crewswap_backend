import { Response } from "express";
import Schedule from "../../models/Schedule";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import scrapeFlicaSchedule from "../../utils/scrapeFlicaSchedule";

// flight duty limits pending
// tcrd -- credit time
// tblk - total block time

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req?.user?.id

        const flicaContent = req.body.flicaContent
        if (!flicaContent) {
            throw new Error('Invalid html content')
        }

        const scheduleData = await scrapeFlicaSchedule(flicaContent)

        const existingSchedule = await Schedule.findOne({ where: { userId } })

        if (existingSchedule) {
            await Schedule.update({ userId, data: scheduleData }, {
                where: {
                    userId
                }
            })
        } else {
            await Schedule.create({ userId, data: scheduleData })
        }

        const scrapedData = JSON.stringify(scheduleData)

        if (!scrapedData) {
            res.status(400).json({ message: 'No scraped data' });
            return
        }

        res.status(200).json({ message: 'Schedules successfully synced', data: scheduleData })
        return
    }

    catch (error) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}