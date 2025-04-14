import { Request, Response } from "express"

const notFound = (req: Request, res: Response) => {
    res.status(400).json({ message: 'Route not found' })
    return
}

export default notFound