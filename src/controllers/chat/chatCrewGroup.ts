import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Op, fn, col, where } from "sequelize";


export default async (req: AuthenticatedReq, res: Response) => {
    try {
        console.log(req.body, 'req.body')
        const { crewMembers, flightRoute, flightNumber } = req.body

        if (!crewMembers || !flightRoute) {
            res.status(400).json({ message: 'Crew members and flight route are required' })
            return
        }

        const userIds = crewMembers.map((member: string) => {

            const matches = member.match(/\d+/);
            const userId = matches ? Number(matches[0]) : null;

            console.log(userId, 'userId')
            return userId
        })

        if (!userIds.length) {
            res.status(400).json({ message: 'Invalid crew members' })
            return
        }

        console.log(userIds, 'userIds')

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
                name: `Group Chat ${flightNumber} ${flightRoute}`,
                [Op.and]: userIds.map((id: number) => where(
                    fn('JSON_CONTAINS', col('members'), JSON.stringify(id)),
                    true
                ))
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