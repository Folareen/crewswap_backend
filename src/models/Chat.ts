import { DataTypes } from "sequelize";
import sequelizeInstance from "../config/database";

export enum ChatType {
    SWAP_BUDDIES = 'swap-buddies',
    CREW = 'crew',
    CREW_GROUP = 'crew-group',
    FRIENDS = 'friends',
}

const Chat = sequelizeInstance.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(ChatType)),
        allowNull: false,
    },
    members: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
}, {
    timestamps: true
})


export default Chat;