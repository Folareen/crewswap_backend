import { ARRAY, BOOLEAN, DECIMAL, DataTypes, INTEGER, JSON, STRING, UUID } from "sequelize";
import sequelizeInstance from "../config/database";

const Preference = sequelizeInstance.define('Preference', {
    userId: {
        type: UUID,
        allowNull: false,
    },
    lessAirportSits: {
        type: BOOLEAN
    },
    layovers: {
        type: BOOLEAN
    },
    moreCredits: {
        type: BOOLEAN
    },
    commutable: {
        type: BOOLEAN
    },
    lateCheckIn: {
        type: BOOLEAN
    },
    earlyCheckOut: {
        type: BOOLEAN
    },
    noMexicoLayovers: {
        type: BOOLEAN
    },
    datesOff: {
        type: JSON
    }
}, {
    timestamps: true
})


export default Preference