import { ZodError, array, boolean, date, object, string } from "zod"

const updatePreferenceSchema = object({
    lessAirpotsSits: boolean().optional(),
    layovers: boolean().optional(),
    moreCredits: boolean().optional(),
    commutable: boolean().optional(),
    lateCheckIn: boolean().optional(),
    earlyCheckOut: boolean().optional(),
    noMexicoLayovers: boolean().optional(),
    datesOff: array(string()).optional()
})

export default (data: any) => {
    try {
        return updatePreferenceSchema.parse(data)

    } catch (error: any) {
        if (error instanceof ZodError) {
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
