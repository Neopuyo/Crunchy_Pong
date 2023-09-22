/* eslint-disable prettier/prettier */
import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
	type: 'postgres',
	host: process.env.DATA_BASE_HOST,
	port: parseInt(process.env.DATA_BASE_PORT),
	username: process.env.DATA_BASE_USER,
	password: process.env.DATA_BASE_PASSWORD,
	database: process.env.DATA_BASE_NAME,
	entities: [`${__dirname}/../utils/typeorm/*{.ts,.js}`],
	synchronize: false,
	logging: false,
	migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
	migrationsTableName: 'migrations',
}));
