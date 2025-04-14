import { z } from "zod"

const requestPasswordResetSchema = z.object({
    email: z.string({ required_error: "Email is required" })
        .email("Enter a valid email")
})

export default (data: any) => {
    try {
        return requestPasswordResetSchema.parse(data)
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
