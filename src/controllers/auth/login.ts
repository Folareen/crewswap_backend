import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../../models/User"
import { Request, Response } from "express"
import validateData from '../../utils/validators/auth/login'


export default async (req: Request, res: Response) => {
    try {
        const data = validateData(req.body)

        if (!data) {
            res.status(400).json({ message: 'Invalid login data' })
            return;
        }

        const { email, password } = data

        const user = await User.findOne({ where: { email } })
        if (!user) {
            res.status(400).json({ message: "Incorrect email or password" })
            return;
        }

        const passwordCorrect = await bcrypt.compare(password, user.getDataValue('password'))

        if (!passwordCorrect) {
            res.status(400).json({ message: "Incorrect email or password" })
            return;
        }

        const tokenPayload = {
            id: user.getDataValue("id"),
            email: user.getDataValue("email"),
            displayName: user.getDataValue("displayName"),
            userType: user.getDataValue("userType"),
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string)

        const userJson = user.toJSON()
        delete userJson.password

        res.status(200).json({
            message: "Login successful",
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

        console.error("Login error:", error)
        res.status(500).json({ message: "Internal Server Error" })
        return;
    }
}
