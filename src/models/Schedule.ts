import { DataTypes } from "sequelize"
import sequelizeInstance from "../config/database"

const Schedule = sequelizeInstance.define("Schedule", {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    timestamps: true
})

export default Schedule

