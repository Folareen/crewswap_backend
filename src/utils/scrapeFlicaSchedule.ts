import * as cheerio from "cheerio";
import purifyText from "./purifyText";
import User from "../models/User";

export default async (flicaContent: string, userId: number) => {

    const $ = cheerio.load(flicaContent);

    const scheduleData: { schedules: any[], overview: any } = { schedules: [], overview: {} }

    $('[name="table2"] > tbody > tr[align="center"]').each((ind, row) => {
        const columns = $(row).find('td');
        const dy = purifyText($(columns[0])?.text())
        const dd = purifyText($(columns[1])?.text())

        const flightCode = purifyText($(columns[2])?.text())
        const base = purifyText($(columns[3])?.text())

        const daySchedule = {
            dy,
            dd,
            flightCode,
            base,
            flights: [],
            hotel: null
        }

        scheduleData.schedules.push(daySchedule)
    })

    await Promise.all(scheduleData.schedules.map(async schedule => {
        if (!schedule.base && schedule.flightCode) {
            const user = await User.findByPk(userId)
            schedule.base = user?.getDataValue('baseAirport')
        }
    }))

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
            const colsLength = columns.length

            const flight = {
                week: index,
                dy: purifyText($(columns[0]).text()),
                dd: purifyText($(columns[1]).text()),
                dh: purifyText($(columns[2]).text()),
                c: purifyText($(columns[3]).text()),
                fltno: purifyText($(columns[4]).text()),
                oa: purifyText($(columns[10]).text()),
                route: purifyText($(columns[5]).text()),
                depl: purifyText($(columns[6]).text()),
                arrl: purifyText($(columns[7]).text()),
                blkt: purifyText($(columns[8]).text()),
                grnt: Number(purifyText($(columns[9]).text())) > 45 ? Number(purifyText($(columns[9]).text())) - 45 : 0,
                report: Number(purifyText($(columns[6]).text())) - 45,
                crew: allCrews[index],
                layover: purifyText($(columns[colsLength - 1]).text()).split(' ')[1]
            };

            flights.push(flight);
        });

        const weeklySchedule: { dy: string; dd: string; flights: any[] }[] = [];

        const dyMap: { [key: string]: any[] } = {};

        for (const flight of flights) {
            const key = `${flight.dy}-${flight.dd}`;
            if (!dyMap[key]) {
                dyMap[key] = [];
            }
            dyMap[key].push(flight);
        }

        for (const key in dyMap) {
            const [dy, dd] = key.split('-');
            weeklySchedule.push({
                dy,
                dd,
                flights: dyMap[key]
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

    // const stats = {

    // }

    schedules.forEach(({ dy, dd, flights, hotel }) => {
        const scheduleIndex = scheduleData.schedules.findIndex((schedule) => schedule.dy == dy && schedule.dd == dd)

        if (scheduleIndex == -1) return;

        scheduleData.schedules[scheduleIndex].flights = flights
        scheduleData.schedules[scheduleIndex].hotel = hotel
        // scheduleData.schedules[scheduleIndex].stats = stats
    })


    return scheduleData
}