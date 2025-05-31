import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Op } from "sequelize";


export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const { crewMembers, flightRoute, flightNumber } = req.body

        if (!crewMembers || !flightRoute) {
            res.status(400).json({ message: 'Crew members and flight route are required' })
            return
        }

        console.log(crewMembers, 'crewMembers')

        const userIds = crewMembers.map((member: string) => {

            const userId = member.slice(3, member.length).split(' ')[0] ? Number(member.slice(3, member.length).split(' ')[0]) : null
            return userId
        })

        console.log(userIds, 'userIds')

        if (!userIds.length) {
            res.status(400).json({ message: 'Invalid crew members' })
            return
        }

        const users = await User.findAll({
            where: {
                id: {
                    [Op.in]: userIds
                }
            }
        })

        if (!users.length) {
            res.status(400).json({ message: 'Users not found' })
            return
        }

        const crewChatExists = await Chat.findOne({
            where: {
                type: ChatType.CREW_GROUP,
                name: `Group Chat ${flightNumber} ${flightRoute}`
            }
        })

        if (crewChatExists) {
            res.status(200).json({
                message: 'Crew group chat already exists',
                chat: crewChatExists.dataValues
            })
            return
        }

        const chat = await Chat.create({
            type: ChatType.CREW_GROUP,
            member1: userIds[0],
            member2: userIds[1],
            members: userIds,
            name: `Group Chat ${flightNumber} ${flightRoute}`
        })

        res.status(200).json({
            message: 'Crew group chat created successfully',
            chat: chat.dataValues
        })
    } catch (error: any) {
        console.log(error, 'error')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}