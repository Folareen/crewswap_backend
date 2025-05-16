import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../../models/User"
import { Request, Response } from "express"
import validateSignup from '../../utils/validators/auth/signup'
import scrapeFlicaSchedule from "../../utils/scrapeFlicaSchedule"
import Schedule from "../../models/Schedule"
import Preference from "../../models/Preference"

// validate requestsss

export default async (req: Request, res: Response) => {
    try {
        console.log(req.body.data, 'seee this')
        // const data = validateSignup(req.body)
        const userDetails = req.body.data.userDetails
        const preferences = req.body.data.preferences
        const flicaContent = req.body.data.flicaContent

        // const data = req.body

        if (!userDetails) {
            res.status(400).json({ message: 'Invalid signup data' })
            return;
        }

        const { email, password } = userDetails

        const existingUser = await User.findOne({ where: { email: email } })
        if (existingUser) {
            res.status(409).json({ message: "User with this email already exists" })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            ...userDetails,
            password: hashedPassword,
        })

        const tokenPayload = {
            id: user.getDataValue("id"),
            email: user.getDataValue("email"),
            displayName: user.getDataValue("displayName"),
            role: user.getDataValue("userType"),
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string)

        const userJson = user.toJSON()
        delete userJson.password

        let scheduleData = null

        if (flicaContent) {
            scheduleData = await scrapeFlicaSchedule(flicaContent, userJson.id)
            await Schedule.create({ userId: userJson.id, data: scheduleData })
        }

        const preferenceResponse = await Preference.create({
            ...preferences, userId: userJson.id
        })

        res.status(201).json({
            message: "Signup successful",
            user: userJson,
            token,
            schedule: scheduleData
        })
        return;
    } catch (error: any) {
        if (error?.type == 'validation') {
            res.status(400).json({
                message: error?.message
            })
            return;
        }

        console.error("Signup error:", error)
        res.status(500).json({ message: "Internal Server Error" })
        return;
    }
}