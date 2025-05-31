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

        const user = await User.findOne({
            where: { email },
            attributes: { include: ['password'] }
        })

        console.log(user, 'user')
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
