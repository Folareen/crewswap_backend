import { z } from "zod"

const signupSchema = z.object({
    email: z.string({ required_error: "Email is required" })
        .email("Enter a valid email"),
    password: z.string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .refine((password) => /[A-Z]/.test(password), {
            message: "Password must contain atleast one uppercase letter",
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Password must contain atleast one uppercase letter",
        })
        .refine((password) => /[0-9]/.test(password), { message: "Password must contain atleast one number" })
        .refine((password) => /[!@#$%^&*]/.test(password), {
            message: "Password must contain atleast one special character",
        }),
    displayName: z.string({ required_error: "Display name is required" })
        .min(1, "Display name is required"),
    baseAirport: z.string({ required_error: "Base airport is required" })
        .min(1, "Base airport is required"),
    airline: z.string({ required_error: "Airline is required" })
        .min(1, "Airline is required"),
    pilotOrFlightAttendant: z.enum(["pilot", "flightAttendant"], {
        errorMap: () => ({ message: "Must be either 'pilot' or 'flightAttendant'" }),
    }),
})

export default (data: any) => {
    try {
        return signupSchema.parse(data)
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
