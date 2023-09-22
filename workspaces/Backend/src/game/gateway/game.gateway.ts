//standard imports
import {
  OnModuleInit,
  UseGuards,
  Req,
  Injectable,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

// websockets imports
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// jwt imports
import { WsJwtGuard } from '../guard/wsJwt.guard';
import { verify } from 'jsonwebtoken';

// services imports
import { GameService } from '../service/game.service';
import { GameManager } from '../class/GameManager';
import { ColoredLogger } from '../colored-logger';
import { ActionDTO } from '../dto/Action.dto';
import { StatusService } from '@/statusService/status.service';

// Decorator to define WebSocketGateway settings

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [`http://${process.env.HOST_IP}:3000`, 'http://localhost:3000'],
  },
  namespace: '/game',
  path: '/game/socket.io',
})
@UseGuards(WsJwtGuard)
export class GameGateway implements OnModuleInit {
  // Inject necessary services (GameService and GameManager)
  constructor(
    private readonly gameService: GameService,
    private readonly gameManager: GameManager,
    private readonly logger: ColoredLogger,
    private readonly statusService: StatusService,
  ) {}

  @WebSocketServer()
  server: Server;

  // Lifecycle hook, called when the module is initialized
  onModuleInit() {
    // init the game manager with the server
    this.gameManager.setServer(this.server);

    // Event handler for new socket connections
    this.server.on('connection', (socket: Socket) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      // Verify the JWT token and obtain the payload data
      try {
        const payload = verify(token, process.env.JWT_SECRET) as any;
        if (!payload.sub) {
          socket.disconnect();
          return;
        }

        this.logger.log(
          `User with ID ${payload.sub} connected to Game`,
          'OnModuleInit - Connection',
        );

        // Event handler for socket disconnection
        socket.on('disconnect', () => {
          // Perform necessary clean-up operations
          try {
            this.gameManager.disconnect(payload.sub, socket, false);
            this.logger.log(
              `User with ID ${payload.sub} disconnected`,
              'OnModuleInit - Disconnection',
            );
          } catch (error) {
            this.logger.error(
              `Error while disconnecting user: ${error.message}`,
              'OnModuleInit - Disconnection',
              error,
            );
          }
          socket.disconnect();
        });
      } catch (error) {
        this.logger.error(error.message, 'OnModuleInit - Error');
        socket.disconnect();
      }
    });
  }

  @SubscribeMessage('join')
  async joinGame(
    @ConnectedSocket() socket: Socket,
    @Req() req,
    @MessageBody() gameId: string,
  ) {
    return await this.gameManager.joinGame(gameId, req.user.id, socket);
  }

  @SubscribeMessage('pong')
  handleHeartbeat(
    @MessageBody() userId: number,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.gameManager.updatePong(userId, socket);
  }

  @SubscribeMessage('action')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleAction(
    @MessageBody() action: ActionDTO,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.gameManager.playerAction(action, socket);
  }

  @SubscribeMessage('quit')
  quitGame(@ConnectedSocket() socket: Socket, @Req() req): void {
    this.gameManager.disconnect(req.user.id, socket, true);
  }
}
