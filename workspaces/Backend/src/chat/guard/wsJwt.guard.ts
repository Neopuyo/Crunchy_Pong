/* eslint-disable prettier/prettier */
import { CanActivate, Injectable } from "@nestjs/common";
import { verify } from "jsonwebtoken";
import { WsException } from "@nestjs/websockets";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SocketToken } from "@/utils/typeorm/SocketToken.entity";
import { CryptoService } from "@/utils/crypto/crypto";

@Injectable()
export class WsJwtGuard implements CanActivate {

    constructor(  
        @InjectRepository(SocketToken)
        private readonly socketTokenRepository: Repository<SocketToken>,
        private readonly cryptoService: CryptoService,
    ) {}

    async canActivate(context: any): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];

        try {
            const payload = verify(bearerToken, process.env.JWT_SECRET, {
                ignoreExpiration: true,
            }) as any;

            if (payload.exp + 3600 <= Date.now() / 1000) {
                const   socketTokens = await this.socketTokenRepository.find({
                    where: { userId: payload.sub },
                });
                const   socketToken = await this.findSocketTokenByBearerToken(socketTokens, bearerToken);
                if (!socketToken)
                    throw new Error('token already expired');
            }

            client.user = { id: payload.sub, login: payload.login };
            return true;
        } catch (err) {
            if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
                console.log(err.message);
            throw new WsException('invalid token');
        }
    }

    private async findSocketTokenByBearerToken(socketTokens: SocketToken[], bearerToken: string): Promise<SocketToken | undefined> {
        for (const token of socketTokens) {
            const value = await this.cryptoService.decrypt(token.value);
            if (value === bearerToken) {
                return token;
            }
        }
        return undefined;
    }
}
