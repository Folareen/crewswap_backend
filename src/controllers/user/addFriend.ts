import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Op } from "sequelize";


export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const { userId } = req.params

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' })
            return
        }

        const user = await User.findByPk(req.user?.id)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        const friendExists = await Chat.findOne({
            where: {
                type: ChatType.FRIENDS,
                [Op.or]: [
                    {
                        member1: req.user?.id,
                        member2: userId
                    },
                    {
                        member1: userId,
                        member2: req.user?.id
                    }
                ]
            }
        })

        if (friendExists) {
            res.status(200).json({
                message: 'Friend already exists',
                user: {
                    id: user.dataValues.id,
                    firstName: user.dataValues.firstName,
                    lastName: user.dataValues.lastName
                },
                chat: friendExists.dataValues
            })
            return
        }

        const chat = await Chat.create({
            type: ChatType.FRIENDS,
            members: [req.user?.id, userId]
        })

        res.status(200).json({
            message: 'Friend added successfully',
            user: {
                id: user.dataValues.id,
                firstName: user.dataValues.firstName,
                lastName: user.dataValues.lastName
            },
            chat: chat.dataValues
        })
    } catch (error: any) {
        console.log(error, 'error')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}