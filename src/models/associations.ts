import Chat from './Chat';
import Message from './Message';
import User from './User';

// Define associations here
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Chat.belongsTo(User, { foreignKey: 'member1', as: 'memberOne' });
Chat.belongsTo(User, { foreignKey: 'member2', as: 'memberTwo' });

Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Chat, { foreignKey: 'member1', as: 'chatsAsMember1' });
User.hasMany(Chat, { foreignKey: 'member2', as: 'chatsAsMember2' });

export default function initAssociations() {
    // This file just needs to be imported once in your app's entry point
}