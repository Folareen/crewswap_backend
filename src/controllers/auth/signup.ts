import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../../models/User"
import { Request, Response } from "express"
import validateSignup from '../../utils/validators/auth/signup'

export const signup = async (req: Request, res: Response) => {
    try {
        const data = validateSignup(req.body)

        if (!data) {
            res.status(400).json({ message: 'Invalid signup data' })
            return;
        }

        const { email, password } = data

        const existingUser = await User.findOne({ where: { email: email } })
        if (existingUser) {
            res.status(409).json({ message: "User with this email already exists" })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            ...data,
            password: hashedPassword,
        })

        const tokenPayload = {
            id: user.getDataValue("id"),
            email: user.getDataValue("email"),
            displayName: user.getDataValue("displayName"),
            role: user.getDataValue("pilotOrFlightAttendant"),
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
            expiresIn: "7d",
        })

        const userJson = user.toJSON()
        delete userJson.password

        res.status(201).json({
            message: "Signup successful",
            user: userJson,
            token,
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