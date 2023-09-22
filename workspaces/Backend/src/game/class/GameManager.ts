// import standard nest packages
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';

// import game classes
import { Pong } from './Pong';
import { UserInfo } from './UserInfo';
import { ActionDTO } from '../dto/Action.dto';
import { Game } from '@/utils/typeorm/Game.entity';
import {
  CHECK_INTERVAL,
  PLAYER_PING,
  SPECTATOR_PING,
} from '@transcendence/shared/constants/Game.constants';

// import services
import { GameService } from '../service/game.service';
import { ColoredLogger } from '../colored-logger';
import { ScoreService } from '@/score/service/score.service';
import { ScoreInfo } from '@transcendence/shared/types/Score.types';
import { StatsService } from '@/stats/service/stats.service';
import { StatusService } from '@/statusService/status.service';

@Injectable()
export class GameManager {
  // -----------------------------------  VARIABLES  ----------------------------------- //
  private readonly pongOnGoing: Map<string, Pong> = new Map<string, Pong>();
  public usersConnected: UserInfo[] = [];
  private server: Server;

  // ----------------------------------  CONSTRUCTOR  --------------------------------- //

  constructor(
    private readonly gameService: GameService,
    private readonly scoreService: ScoreService,
    private readonly statsService: StatsService,
    private readonly statusService: StatusService,
    private readonly logger: ColoredLogger,
  ) {
    this.logger = new ColoredLogger(GameManager.name); // Set the module name for the logger
  }

  // --------------------------------  PUBLIC METHODS  -------------------------------- //

  // Set the WebSocket server instance in the game manager to handle game-related functionality
  public setServer(server: Server): void {
    this.server = server;
    setInterval(() => {
      this.checkConnexion();
    }, CHECK_INTERVAL);
  }

  // Method to handle user joining a game
  public async joinGame(
    gameId: string,
    userId: number,
    socket: Socket,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'An Error as Occured',
    };
    let game: Pong = this.pongOnGoing.get(gameId);
    // If Pong Session doesn't exist, create it
    if (!game) {
      try {
        game = await this.createPong(gameId);
      } catch (error) {
        this.logger.error(
          `Can't create Pong Session: ${error.message}`,
          'joinGame',
          error,
        );
        ret.message = "Can't create Pong Session";
        ret.error = error;
        return ret;
      }
    }

    let user = this.usersConnected.find((user) => user.socket.id === socket.id);
    if (!user) {
      user = new UserInfo(userId, socket, gameId, false);
      this.usersConnected.push(user);
    }
    if (user.gameId !== game.gameId) {
      user.gameId = game.gameId;
    }
    try {
      const data: ReturnData = await game.join(user);
      return data;
    } catch (error) {
      this.logger.error(
        `Error while joining game: ${error.message}`,
        'joinGame',
        error,
      );
      ret.message = `Error while joining game: ${error.message}`;
      ret.error = error;
      return ret;
    }
  }

  // Method to handle player actions in the game
  public async playerAction(action: ActionDTO, socket: Socket): Promise<any> {
    const pong = this.pongOnGoing.get(action.gameId);
    if (!pong) {
      throw new WsException('Game not found');
    }
    const user = this.usersConnected.find(
      (user) => user.socket.id === socket.id,
    );
    if (!user) {
      throw new WsException('User not found');
    }
    user.pingSend = 0;
    return pong.playerAction(action);
  }

  // Method to handle user updating their heartbeat to stay connected
  public updatePong(userId: number, socket: Socket): void {
    const user = this.usersConnected.find(
      (user) => user.socket.id === socket.id,
    );
    if (!user) {
      this.logger.error(`User with ID ${userId} not found`, 'updatePong');
      throw new WsException('User not found');
    }
    user.pingSend = 0;
  }

  // Method to handle user disconnection from a game
  public async disconnect(
    userId: number,
    socket: Socket,
    manual: boolean,
  ): Promise<any> {
    try {
      // Find user in the collection based on userId and socketId
      const user = this.usersConnected.find(
        (user) => user.socket.id === socket.id,
      );
      if (!user) {
        return;
      }

      //Find the game linked to the user
      const pong = this.pongOnGoing.get(user.gameId);
      if (!pong) {
        return;
      }

      // Remove the user from the game and userConnected array
      await pong.disconnect(user, manual);
      this.usersConnected = this.usersConnected.filter(
        (user) => user.socket.id !== socket.id,
      );

      this.statusService.add(user.id.toString(), 'connected');
      return { success: true, message: 'User disconnected' };
    } catch (error) {
      this.logger.error(
        `Error while disconnecting user: ${error.message}`,
        'Manager - disconnect',
        error,
      );
      throw new WsException('Error while disconnecting user');
    }
  }

  // ---------------------------------  PRIVATE METHODS  -------------------------------- //

  // Method to create a new Pong session
  private async createPong(gameId: string): Promise<Pong> {
    let pong: Pong = this.pongOnGoing.get(gameId);
    if (pong) {
      throw new WsException('Game already exists');
    }
    try {
      const game: Game = await this.gameService.getGameById(gameId);
      const score: ScoreInfo = await this.scoreService.getScoreByGameId(
        game.id,
      );
      pong = new Pong(
        this.server,
        gameId,
        game,
        this.gameService,
        this.scoreService,
        this.statsService,
        this.statusService,
        this.logger,
        score,
      );
      await pong.initPlayer();
      this.pongOnGoing.set(gameId, pong);
      return pong;
    } catch (error) {
      this.logger.error(
        `Error while creating Pong Session: ${error.message}`,
        'createPong',
        error,
      );
      throw new WsException(
        `Error while creating Pong Session: ${error.message}`,
      );
    }
  }

  private checkConnexion(): void {
    this.usersConnected.forEach((user) => {
      if (
        (user.isPlayer && user.pingSend >= PLAYER_PING) ||
        (!user.isPlayer && user.pingSend >= SPECTATOR_PING)
      ) {
        this.logger.log(`User with ID ${user.id} disconnected`);
        user.socket.disconnect();
        this.disconnect(user.id, user.socket, false).catch((error) => {
          this.logger.error(
            `Error while disconnecting user: ${error.message}`,
            'checkConnexion',
            error,
          );
        });
      } else {
        user.sendPing();
      }
    });
  }
}
