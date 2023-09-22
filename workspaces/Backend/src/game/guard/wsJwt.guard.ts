/* eslint-disable prettier/prettier */
import { CanActivate, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { verify } from "jsonwebtoken";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsJwtGuard implements CanActivate {

    canActivate(context: any): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
        const client = context.switchToWs().getClient();
        const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
        try {
            const payload = verify(bearerToken, process.env.JWT_SECRET) as any;
            client.user = { id: payload.sub, login: payload.login };
            return true;
        } catch (err) {
            throw new WsException(err.message);
        }
    }
}
