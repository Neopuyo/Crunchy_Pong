/* eslint-disable prettier/prettier */
import { DataSource } from "typeorm";

export default new DataSource({
	type: 'postgres',
	host: process.env.DATA_BASE_HOST,
	port: parseInt(process.env.DATA_BASE_PORT),
	username: process.env.DATA_BASE_USER,
	password: process.env.DATA_BASE_PASSWORD,
	database: process.env.DATA_BASE_NAME,
	entities: [`${__dirname}/../src/utils/typeorm/*{.ts,.js}`],
	synchronize: false,
	logging: false,
	migrations: [`${__dirname}/migrations/*{.ts,.js}`],
	migrationsTableName: 'migrations',
});
