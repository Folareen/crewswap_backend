import { Response } from "express"
import { AuthenticatedReq } from "../../types/authenticatedReq"

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const token = req.headers?.authorization?.split(' ')[1]

        res.status(200).json({
            message: "User details successfully retrieved",
            user: req.user,
            token,
        })
        return;
    } catch (error: any) {

        console.error("Get preference error:", error)
        res.status(500).json({ message: "Internal Server Error" })
        return;
    }
}
