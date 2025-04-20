import * as cheerio from "cheerio";
import { Request, Response } from "express";
import Schedule from "../../models/Schedule";
import purifyText from "../../utils/purifyText";

// flight duty limits pending
// tcrd -- credit time
// tblk - total block time

export default async (req: Request, res: Response) => {
    try {
        const htmlContent = req.body.htmlContent
        if (!htmlContent) {
            throw new Error('Invalid html content')
        }

        const $ = cheerio.load(htmlContent);

        await new Promise(resolve => setTimeout(resolve, 5000));

        const scheduleData: { schedules: any[], overview: any } = { schedules: [], overview: {} }

        $('[name="table2"] > tbody > tr[align="center"]').each((ind, row) => {
            const columns = $(row).find('td');
            const day = purifyText($(columns[0])?.text())
            const date = purifyText($(columns[1])?.text())
            const flightCode = purifyText($(columns[2])?.text())
            const base = purifyText($(columns[3])?.text())

            const daySchedule = {
                day,
                date,
                flightCode,
                base,
                flights: [],
                hotel: null
            }

            scheduleData.schedules.push(daySchedule)
        })

        $('[name="table2"] > tbody > tr:not([align="center"])').each((ind, row) => {
            const columns = $(row).find('td');
            const value = purifyText($(columns[1])?.text())

            if (!value) return;

            switch (ind) {
                case 0:
                    break;
                case 1:
                    scheduleData.overview.block = value
                    break;
                case 2:
                    scheduleData.overview.credit = value
                    break;
                case 3:
                    scheduleData.overview.YTD = value
                    break;
                case 4:
                    scheduleData.overview.off = value
                    break;
                default:
                    break;
            }

        })


        const allCrews: any[] = []

        $('[name="table4"] > tbody > tr > td > table:not([name="headertable"]) > tbody > tr:last-child').each((ind, row) => {
            const crews: any[] = []
            $(row).find('tbody > tr').each((ind, rw) => {
                const crewName = purifyText($(rw).text())
                if (crewName == '' || crewName == 'Crew:') {
                    return
                }
                crews.push(crewName)
            })

            allCrews.push(crews)
        })

        const weeklySchedules: any[] = []

        $('[name="table4"] > tbody > tr > td > table:not([name="headertable"])').each((index, row) => {

            const hotels: any[] = []

            $(row).find('tbody > tr > td > table > tbody > tr:not(.nowrap):not(.main)').each((_, row) => {
                const name = purifyText($(row).find('td[colspan = "5"]').text())
                const contact = purifyText($(row).find('td[colspan = "3"]').text())

                if (!name && contact) return;

                hotels.push({ name, contact })
            })

            const flights: any[] = []
            $(row).find('tr.nowrap').each((_, row) => {
                const columns = $(row).find('td');

                const flight = {
                    week: index,
                    day: purifyText($(columns[0]).text()),
                    date: purifyText($(columns[1]).text()),
                    dh: purifyText($(columns[2]).text()),
                    c: purifyText($(columns[3]).text()),
                    flightNumber: purifyText($(columns[4]).text()),
                    route: purifyText($(columns[5]).text()),
                    departure: purifyText($(columns[6]).text()),
                    arrival: purifyText($(columns[7]).text()),
                    blockTime: purifyText($(columns[8]).text()),
                    groundTime: purifyText($(columns[9]).text()),
                    aircraft: purifyText($(columns[10]).text()),
                    crew: allCrews[index],
                };

                flights.push(flight);
            });

            const weeklySchedule: { day: string; date: string; flights: any[] }[] = [];

            const dayMap: { [key: string]: any[] } = {};

            for (const flight of flights) {
                const key = `${flight.day}-${flight.date}`;
                if (!dayMap[key]) {
                    dayMap[key] = [];
                }
                dayMap[key].push(flight);
            }

            for (const key in dayMap) {
                const [day, date] = key.split('-');
                weeklySchedule.push({
                    day,
                    date,
                    flights: dayMap[key]
                });
            }

            const finalWeeklySchedule = weeklySchedule.map((schedule, index) => (
                {
                    ...schedule,
                    hotel: hotels[index]
                }
            ))


            weeklySchedules.push(finalWeeklySchedule)
        })

        const schedules = weeklySchedules.flat()

        schedules.forEach(({ day, date, flights, hotel }) => {
            const scheduleIndex = scheduleData.schedules.findIndex((schedule) => schedule.day == day && schedule.date == date)
            scheduleData.schedules[scheduleIndex].flights = flights
            scheduleData.schedules[scheduleIndex].hotel = hotel
        })

        await Schedule.create({ userId: 12, data: scheduleData, lastSynced: Date.now() })

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