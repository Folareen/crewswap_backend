import { DataTypes } from "sequelize";
import sequelizeInstance from "../config/database";

const User = sequelizeInstance.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'email',
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    displayName: {
        type: DataTypes.STRING,
    },
    baseAirport: {
        type: DataTypes.STRING,
    },
    airline: {
        type: DataTypes.STRING,
    },
    pilotOrFlightAttendant: {
        type: DataTypes.ENUM('pilot', 'flightAttendant'),
        allowNull: false,
    }
}, {
    timestamps: true,
});

export default User;
