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
            let rawCrewName = purifyText($(rw).text())
            if (rawCrewName == '' || rawCrewName == 'Crew:') {
                return
            }

            if (
                (rawCrewName.match(/(CA|FO|FA)\s+/g) || []).length > 1
            ) {
                const crewArray = rawCrewName.match(/(CA|FO|FA)\s+\d+.*?(?=(CA|FO|FA)\s+\d+|$)/g);
                if (crewArray) {
                    crewArray.forEach(c => crews.push(c.trim()));
                }
            } else {
                crews.push(rawCrewName)
            }
        })

        allCrews.push(crews)
    })


    const tripStats: any[] = []

    $('[name="table4"] > tbody > tr > td > table:not([name="headertable"])').each((index, row) => {

        $(row).find('tr.bold').each((_, row) => {
            const columns = $(row).find('td');

            const total = {
                tripBLKT: purifyText($(columns[2]).text()),
                tripCRD: purifyText($(columns[5]).text()),
            }

            // console.log(total, 'total')

            tripStats.push(total)
        })

    })
    // console.log(tripStats, 'tripStats')

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

            // report should minus in time format
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
                grnt: Number(purifyText($(columns[9]).text())),
                report: Number(purifyText($(columns[6]).text())) - 45,
                crew: allCrews[index],
                layover: purifyText($(columns[colsLength - 1]).text()).split(' ')[1],
                tblk: purifyText($(columns[12]).text()),
                tcrd: purifyText($(columns[15]).text()),
                tdhd: purifyText($(columns[16]).text()).split('/')[0],
                tduty: purifyText($(columns[16]).text()).split('/')[1],
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

        const finalWeeklySchedule = weeklySchedule.map((schedule, index) => {
            return {
                ...schedule,
                hotel: hotels[index],
            }
        })

        weeklySchedules.push(finalWeeklySchedule)
    })

    const schedules = weeklySchedules.flat()

    schedules.forEach(({ dy, dd, flights, hotel }) => {
        const scheduleIndex = scheduleData.schedules.findIndex((schedule) => schedule.dy == dy && schedule.dd == dd)

        // console.log(tripStats, 'tripStats')

        if (scheduleIndex == -1) return;

        flights?.forEach((flight: any, index: number) => {
            // console.log(flight, 'flight')
            delete flight.tblk
            delete flight.tcrd
            delete flight.tduty

            // flight.tripBLKT = tripStats[0]?.tripBLKT
            // flight.tripCRD = tripStats[0]?.tripCRD
        })


        const lastFlight = flights[flights.length - 1]
        const lastFlightOfPreviousSchedule = scheduleData.schedules[scheduleIndex - 1].flights[scheduleData.schedules[scheduleIndex - 1].flights.length - 1]

        // console.log(lastFlight?.week, 'lastFlight?.week')
        // console.log(lastFlightOfPreviousSchedule?.week, lastFlight?.week, 'lastFlightOfPreviousSchedule')
        // console.log(lastFlightOfPreviousSchedule?.week == lastFlight?.week, 'lastFlightOfPreviousSchedule?.week == lastFlight?.week')

        if (lastFlightOfPreviousSchedule?.week == lastFlight?.week) {
            tripStats.shift()
        }

        const stats = {
            dayBLKT: lastFlight.tblk,
            dayCRD: lastFlight.tcrd,
            tripBLKT: tripStats[0]?.tripBLKT,
            tripCRD: tripStats[0]?.tripCRD,
            dayDuty: lastFlight.tduty
        }


        scheduleData.schedules[scheduleIndex].flights = flights
        scheduleData.schedules[scheduleIndex].hotel = hotel
        scheduleData.schedules[scheduleIndex].stats = stats
    })

    return scheduleData
}