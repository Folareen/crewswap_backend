import { DataTypes } from "sequelize";
import sequelizeInstance from "../config/database";

const Message = sequelizeInstance.define('Message', {
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'Chat',
        //     key: 'id'
        // }
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'User',
        //     key: 'id'
        // }
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true
})

export default Message;
