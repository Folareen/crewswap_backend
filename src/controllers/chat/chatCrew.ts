import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Op } from "sequelize";


export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const { member } = req.body

        if (!member) {
            res.status(400).json({ message: 'Member is required' })
            return
        }

        const userId = member.slice(3, member.length).split(' ')[0] ? Number(member.slice(3, member.length).split(' ')[0]) : null

        console.log(userId, 'userId')

        if (!userId) {
            res.status(400).json({ message: 'Invalid crew member name' })
            return
        }

        const user = await User.findByPk(userId)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        console.log(user.dataValues, 'user')

        console.log(req.user?.id, 'req.user?.id')

        if (req.user?.id && userId == req.user?.id) {
            res.status(400).json({ message: 'You cannot create a chat with yourself' })
            return
        }

        const crewChatExists = await Chat.findOne({
            where: {
                type: ChatType.CREW,
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
            member1: req.user?.id,
            member2: userId
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