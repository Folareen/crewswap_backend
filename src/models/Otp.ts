import { DataTypes } from "sequelize"
import sequelizeInstance from "../config/database"

export enum ActionType {
    PASSWORD_RESET = "password_reset",
}

const Otp = sequelizeInstance.define("OTP", {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(4),
        allowNull: false,
    },
    actionType: {
        type: DataTypes.ENUM(...Object.values(ActionType)),
        allowNull: false,
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true
})

export default Otp

