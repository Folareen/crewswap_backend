import * as cheerio from "cheerio";
import purifyText from "./purifyText";

export default async (flicaContent: string) => {

    const $ = cheerio.load(flicaContent);

    const userDetails: {
        id: number | null,
        firstName: string,
        lastName: string,
        position: string
    } = {
        id: null,
        firstName: '',
        lastName: '',
        position: ''
    }

    userDetails.id = Number(purifyText($('h3 font[size="-1"]').first().text().replace('(', '').replace(')', '')));

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

    const flatCrews = allCrews.flat()

    const foundCrew = flatCrews.find((crew) => crew.includes(userDetails.id))

    const foundCrewPosition = foundCrew.slice(0, 2)

    const foundCrewFullName = foundCrew.replace(/^(CA|FO|FA)\s+\d+\s+/, '');

    const foundCrewLastName = foundCrewFullName.split(',')[0].trim()

    const foundCrewFirstName = foundCrewFullName.split(',')[1].trim()

    userDetails.position = foundCrewPosition
    userDetails.firstName = foundCrewFirstName
    userDetails.lastName = foundCrewLastName

    return userDetails
}