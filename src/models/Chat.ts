import { DataTypes } from "sequelize";
import sequelizeInstance from "../config/database";
import Message from "./Message";

export enum ChatType {
    SWAP_BUDDIES = 'swap_buddies',
    CREW = 'crew',
    CREW_GROUP = 'crew_group',
    FRIENDS = 'friends',
}

const Chat = sequelizeInstance.define('Chat', {
    type: {
        type: DataTypes.ENUM(...Object.values(ChatType)),
        allowNull: false,
    },
    member1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'Users',
        //     key: 'id'
        // }
    },
    member2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'Users',
        //     key: 'id'
        // }
    },
}, {
    timestamps: true
})

// Chat.hasMany(Message, {
//     foreignKey: 'chatId',
//     as: 'messages'
// })

// Message.belongsTo(Chat, {
//     foreignKey: 'chatId',
//     as: 'chat'
// })

export default Chat;