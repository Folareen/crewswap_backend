import { Request } from "express";

export type AuthenticatedReq = Request & {
    user?: {
        id: number,
        email: string,
        firstName: string,
        lastName: string,
        baseAirport: string,
        airline: string,
        userType: string,
        position: string,
        timeFormat: string,
    }
}
