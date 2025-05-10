import { Response } from "express";
import { Op } from "sequelize";
import Preference from "../../models/Preference";
import Schedule from "../../models/Schedule";
import { AuthenticatedReq } from "../../types/authenticatedReq";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req?.user?.id

        const userPreference = await Preference.findOne({ where: { userId } })

        if (!userPreference) {
            res.status(400).json({ message: 'Update your preferences first' })
            return
        }

        const userPreferenceObj = userPreference.dataValues

        Object.entries(userPreferenceObj).forEach(([key, value]) => {
            if (value === null) {
                delete userPreferenceObj[key]
            }
        })

        delete userPreferenceObj.userId
        delete userPreferenceObj.createdAt
        delete userPreferenceObj.updatedAt
        delete userPreferenceObj.id

        if (userPreferenceObj.datesOff.length == 0) {
            delete userPreferenceObj.datesOff
        }

        const matchingPreferences = await Preference.findAll({
            where: {
                ...userPreferenceObj,
                userId: { [Op.ne]: userId }
            }
        })

        // modify schedules with the preferences before sending them!!!!!!

        const preferredSchedules = await Promise.all(matchingPreferences.map(async (preference) => {
            return Schedule.findOne({ where: { userId: preference.dataValues.userId } })
        }))

        if (!preferredSchedules) {
            res.status(400).json({ message: 'No preferred schedules found' })
            return
        }

        res.status(200).json({ schedules: preferredSchedules })
    }

    catch (error) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}