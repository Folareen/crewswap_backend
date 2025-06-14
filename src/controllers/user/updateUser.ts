import { Response } from "express"
import User from "../../models/User"
import { AuthenticatedReq } from "../../types/authenticatedReq"

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req.user?.id
        const { baseAirport, airline, userType, position, timeFormat } = req.body

        const user = await User.findByPk(userId)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        await user.update({
            baseAirport,
            airline,
            userType,
            position,
            timeFormat
        })

        res.status(200).json({ message: 'User updated successfully' })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}