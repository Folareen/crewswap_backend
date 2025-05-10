import { z } from "zod"

const likeScheduleSchema = z.object({
    scheduleId: z.number({ required_error: "Schedule ID is required" }),
})

export default (data: any) => {
    try {
        return likeScheduleSchema.parse(data)
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
