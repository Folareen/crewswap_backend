import { z } from "zod"
import { ChatType } from "../../../models/Chat"

const createChatSchema = z.object({
    message: z.string({ required_error: "Message is required" }),
    receiverId: z.string({ required_error: "Receiver ID is required" }),
    type: z.enum([
        ChatType.SWAP_BUDDIES,
        ChatType.CREW,
        ChatType.CREW_GROUP,
        ChatType.FRIENDS
    ], {
        errorMap: () => ({ message: "Chat type must be either 'swap_buddies', 'crew', 'crew_group', or 'friends'" }),
    }),
})

export default (data: any) => {
    try {
        return createChatSchema.parse(data)
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const readableErrors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))

            const message = `${readableErrors[0].message}`
            throw {
                type: 'validation',
                message
            }
        }
    }
}
