import { Response } from "express";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import { Op } from "sequelize";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        console.log(req.query, 'req.query')
        const { search } = req.query;

        console.log(search, 'search')

        if (!search) {
            res.status(400).json({ message: "Search is required" });
            return;
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } }
                ],
                id: { [Op.ne]: req.user?.id }
            },
        });

        console.log(users, 'users')

        res.status(200).json({ message: "Users found", users: users.map((user) => user.dataValues) });
        return

    } catch (error) {
        console.log(error, 'error')

        res.status(500).json({ message: "Internal server error" });
    }
}; 