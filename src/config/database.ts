import { Dialect, Sequelize } from "sequelize";

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_DIALECT, DB_PORT } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_DIALECT || !DB_PORT) {
    throw new Error('Missing database configuration in environment variables');
}


const sequelizeInstance = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT as Dialect,
    port: DB_PORT as unknown as number
});

export default sequelizeInstance