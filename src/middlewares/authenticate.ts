import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import User from "../models/User"

const authenticate = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        if (!req.headers?.authorization) {
            res.status(401).json({ message: 'Unauthorized' })
            return;
        }

        const token = req.headers?.authorization?.split(' ')[1]
        if (!token) {
            res.status(401).json({ message: 'Unauthorized' })
            return;
        }

        const decodedUser: any = jwt.decode(token as string)

        if (!decodedUser) {
            res.status(401).json({ message: 'Unauthorized' })
            return;
        }

        const user = await User.findOne({ where: { id: decodedUser.id } })

        req.user = user

        next()
    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Unable to authenticate user' })
        return;
    }

}

export default authenticate