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

// const Preference = sequelizeInstance.define('Preference', {
//     userId: {
//         type: UUID,
//         allowNull: false,
//     },
//     weekendsOff: {
//         type: BOOLEAN
//     },
//     lessAirportSits: {
//         type: BOOLEAN
//     },
//     thirtyHourlayover: {
//         type: BOOLEAN
//     },
//     moreCredits: {
//         type: BOOLEAN
//     },
//     commutable: {
//         type: BOOLEAN
//     },
//     lateCheckIn: {
//         type: BOOLEAN
//     },
//     stackTripsTogether: {
//         type: BOOLEAN
//     },
//     noMexicoLayovers: {
//         type: BOOLEAN
//     },
//     moreDaysOff: {
//         type: BOOLEAN
//     },
//     datesOff: {
//         type: JSON
//     }
// }, {
//     timestamps: true
// })