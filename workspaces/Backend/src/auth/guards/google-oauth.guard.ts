/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
	constructor() {
		super();
	}
	
	handleRequest(err: any, user: any, info: any, context: any, status: any) {
		if (err || !user) {
			throw new HttpException(err.message, err.status);
		}
		return user;
	}
}
