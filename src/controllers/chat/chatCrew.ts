import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Op, fn, col, where } from "sequelize";


export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const { member } = req.body

        if (!member) {
            res.status(400).json({ message: 'Member is required' })
            return
        }

        const userId = member.match(/\d+/)?.[0] ? Number(member.match(/\d+/)[0]) : null

        if (!userId) {
            res.status(400).json({ message: 'Invalid crew member name' })
            return
        }

        const user = await User.findByPk(userId)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        if (req.user?.id && userId == req.user?.id) {
            res.status(400).json({ message: 'You cannot create a chat with yourself' })
            return
        }

        const crewChatExists = await Chat.findOne({
            where: {
                type: ChatType.CREW,
                [Op.and]: [
                    where(
                        fn('JSON_CONTAINS', col('members'), JSON.stringify(req.user?.id)),
                        true
                    ),
                    where(
                        fn('JSON_CONTAINS', col('members'), JSON.stringify(userId)),
                        true
                    )
                ]
            }
        })

        if (crewChatExists) {
            res.status(200).json({
                message: 'Crew chat already exists',
                user: {
                    id: user.dataValues.id,
                    firstName: user.dataValues.firstName,
                    lastName: user.dataValues.lastName
                },
                chat: crewChatExists.dataValues
            })
            return
        }

        const chat = await Chat.create({
            type: ChatType.CREW,
            members: [req.user?.id, userId]
        })

        res.status(200).json({
            message: 'Crew chat created successfully',
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