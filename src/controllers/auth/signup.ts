import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../../models/User"
import { Request, Response } from "express"
import validateSignup from '../../utils/validators/auth/signup'
import scrapeFlicaSchedule from "../../utils/scrapeFlicaSchedule"
import Schedule from "../../models/Schedule"
import Preference from "../../models/Preference"
import scrapeFlicaUserDetails from "../../utils/scrapeFlicaUserDetails"

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

        const flicaUserDetails = await scrapeFlicaUserDetails(flicaContent)

        const flicaIdUsed = await User.findOne({ where: { flicaId: flicaUserDetails.id } })
        if (flicaIdUsed) {
            res.status(409).json({ message: "User with this flica id already exists" })
            return
        }

        // const flicaUserDetails = {
        //     id: 577976,
        //     firstName: 'Brian',
        //     lastName: 'Thurman',
        //     position: 'FO',
        // }

        const user = await User.create({
            ...userDetails,
            password: hashedPassword,
            ...flicaUserDetails
        })

        const tokenPayload = {
            id: user.getDataValue("id"),
            email: user.getDataValue("email"),
            firstName: user.getDataValue("firstName"),
            lastName: user.getDataValue("lastName"),
            baseAirport: user.getDataValue("baseAirport"),
            airline: user.getDataValue("airline"),
            userType: user.getDataValue("userType"),
            position: user.getDataValue("position"),
            timeFormat: user.getDataValue("timeFormat"),
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