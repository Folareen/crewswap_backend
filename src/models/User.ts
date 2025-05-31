import { DataTypes } from "sequelize";
import sequelizeInstance from "../config/database";

const User = sequelizeInstance.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: 'id',
        allowNull: false,
    },
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
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    baseAirport: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    airline: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userType: {
        type: DataTypes.ENUM('pilot', 'flight-attendant'),
        allowNull: false,
    },
    position: {
        type: DataTypes.ENUM('CA', 'FO', 'FA'),
        allowNull: false,
    },
    timeFormat: {
        type: DataTypes.ENUM('24h', '12h'),
        allowNull: false,
        defaultValue: '24h',
    }
}, {
    timestamps: true,
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
});

export default User;
