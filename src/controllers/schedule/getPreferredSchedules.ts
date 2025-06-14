import { Response } from "express";
import { Op } from "sequelize";
import Preference from "../../models/Preference";
import Schedule from "../../models/Schedule";
import { AuthenticatedReq } from "../../types/authenticatedReq";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req?.user?.id

        const userPreference = await Preference.findOne({ where: { userId } })

        console.log(userPreference, 'userPreference')

        if (!userPreference) {
            res.status(400).json({ message: 'Update your preferences first' })
            return
        }

        const userPreferenceObj = userPreference.dataValues

        console.log(userPreferenceObj, 'userPreferenceObj')
        console.log(Object.entries(userPreferenceObj), 'entries')

        // Separate datesOff from other preferences
        const { datesOff, ...otherPreferences } = userPreferenceObj

        // Remove null/undefined values and system fields from other preferences
        const userSetPreferences = Object.entries(otherPreferences)
            .filter(([key, value]) =>
                value !== null &&
                value !== undefined &&
                !['userId', 'createdAt', 'updatedAt', 'id'].includes(key)
            )
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

        console.log(userSetPreferences, 'userSetPreferences')

        // Create opposite conditions for boolean preferences
        const oppositeConditions = Object.entries(userSetPreferences)
            .map(([key, value]) => ({
                [key]: !value
            }))

        // Add datesOff condition if it exists
        if (datesOff && Array.isArray(datesOff) && datesOff.length > 0) {
            // Find users who have completely different dates off (no overlap)
            oppositeConditions.push({
                [Op.and]: [
                    { datesOff: { [Op.not]: null } }, // Ensure datesOff exists
                    { datesOff: { [Op.not]: [] } },   // Ensure datesOff is not empty
                    {
                        datesOff: {
                            [Op.not]: {
                                [Op.overlap]: datesOff // This will match users who have NO dates in common
                            }
                        }
                    }
                ]
            })
        }

        console.log(oppositeConditions, 'oppositeConditions')

        // Find users who have set the same fields with opposite values
        const matchingPreferences = await Preference.findAll({
            where: {
                [Op.and]: [
                    // Must have opposite values for all fields the user set
                    { [Op.or]: oppositeConditions },
                    // Must have null/undefined for all other preference fields (except datesOff)
                    ...Object.keys(Preference.getAttributes())
                        .filter(key =>
                            !['userId', 'createdAt', 'updatedAt', 'id', 'datesOff'].includes(key) &&
                            !Object.keys(userSetPreferences).includes(key)
                        )
                        .map(key => ({ [key]: null }))
                ],
                userId: { [Op.ne]: userId }
            }
        })

        console.log(matchingPreferences?.map(preference => preference.dataValues), 'matchingPreferences')

        const preferredSchedules = await Promise.all(matchingPreferences.map(async (preference) => {
            return Schedule.findOne({ where: { userId: preference.dataValues.userId } })
        }))

        if (!preferredSchedules || preferredSchedules.length === 0) {
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