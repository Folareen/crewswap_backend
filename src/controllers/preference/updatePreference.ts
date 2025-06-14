import { Response } from "express"
import { AuthenticatedReq } from "../../types/authenticatedReq"
import validateData from '../../utils/validators/preference/updatePreference'
import Preference from "../../models/Preference"

// validate dates off !

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const data = validateData(req.body)

        const existingPreference = await Preference.findOne({ where: { userId: req.user?.id } })

        console.log(data, 'data')

        if (existingPreference) {
            await Preference.update({ ...data }, { where: { userId: req.user?.id } })
        } else {
            await Preference.create({ ...data, userId: req?.user?.id, })
        }

        console.log('preference updated', existingPreference)

        res.status(200).json({
            message: "Preferences updated"
        })
        return;
    } catch (error: any) {
        if (error?.type == 'validation') {
            res.status(400).json({
                message: error?.message
            })
            return;
        }

        console.error("Update preference error:", error)
        res.status(500).json({ message: "Internal Server Error" })
        return;
    }
}
