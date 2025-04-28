import { Response } from "express"
import Preference from "../../models/Preference"
import { AuthenticatedReq } from "../../types/authenticatedReq"


export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const preference = await Preference.findOne({ where: { userId: req.user?.id } })

        res.status(200).json({
            message: "Preferences retrieved",
            data: preference
        })
        return;
    } catch (error: any) {

        console.error("Get preference error:", error)
        res.status(500).json({ message: "Internal Server Error" })
        return;
    }
}
