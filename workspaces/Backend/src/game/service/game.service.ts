// import standard package froms nest
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WsException } from '@nestjs/websockets';

// import entities
import { Game } from 'src/utils/typeorm/Game.entity';
import { UsersService } from '@/users/service/users.service';
import { AvatarService } from '@/avatar/service/avatar.service';

// import Pong game logic
import { Player } from '@transcendence/shared/types/Game.types';
import { colorHexToRgb } from '@transcendence/shared/game/pongUtils';
import { CreateGameDTO } from '../dto/CreateGame.dto';
import { Score } from '@/utils/typeorm/Score.entity';

import { ScoreService } from '@/score/service/score.service';
import { CreateScoreDTO } from '@/score/dto/CreateScore.dto';
import { CryptoService } from 'src/utils/crypto/crypto';
import { StatusService } from '@/statusService/status.service';
import { ChatGateway } from '@/chat/chat.gateway';

@Injectable()
export class GameService {
  // ----------------------------------  CONSTRUCTOR  --------------------------------- //
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,

    private readonly scoreService: ScoreService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly avatarService: AvatarService,
    private readonly cryptoService: CryptoService,
    private readonly statusService: StatusService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // --------------------------------  PUBLIC METHODS  -------------------------------- //

  public async getGameById(gameId: string): Promise<any> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id: gameId },
      });
      if (!game) {
        throw new Error('Game not found');
      }
      return game;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getGameByUserId(userId: number): Promise<any> {
    try {
      let game = await this.gameRepository.findOne({
        where: {
          host: userId,
          status: In(['Not Started', 'Stopped', 'Playing']),
        },
      });
      if (game != null) {
        return game.id;
      }
      game = await this.gameRepository.findOne({
        where: {
          opponent: userId,
          status: In(['Not Started', 'Stopped', 'Playing']),
        },
      });
      if (game != null) {
        return game.id;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getGameInvitePending(inviterId: number): Promise<string> {
    try {
      const game = await this.gameRepository.findOne({
        where: {
          host: inviterId,
          opponent: -1,
          status: 'Not Started',
        },
      });
      if (game != null) {
        return game.id;
      }
      return '';
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getCurrentGames(): Promise<Game[]> {
    try {
      const games = await this.gameRepository.find({
        where: { status: In(['Not Started', 'Stopped', 'Playing']) },
      });
      return games;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getAllRankedGames(): Promise<Game[]> {
    try {
      const games = await this.gameRepository.find({
        where: {
          status: In(['Not Started', 'Stopped', 'Playing']),
          mode: 'League',
        },
      });
      return games;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async definePlayer(
    userId: number,
    side: 'Left' | 'Right',
    host: boolean,
  ): Promise<Player> {
    try {
      const player: Player = {
        id: -1,
        name: 'Searching',
        color: { r: 0, g: 0, b: 0, a: 0 },
        avatar: {
          image: '',
          text: '...',
          variant: 'circular',
          borderColor: '#000000',
          backgroundColor: '#ff253a',
          empty: false,
          decrypt: false,
        },
        side: side,
        host: host,
      };
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        return player;
      }
      const avatar = await this.avatarService.getAvatarById(userId, false);
      player.id = user.id;
      player.name = user.login;
      player.side = side;
      if (!avatar) {
        return player;
      }
      if (avatar?.decrypt && avatar?.image.length > 0) {
        avatar.image = await this.cryptoService.decrypt(avatar.image);
        avatar.decrypt = false;
      }
      player.color = colorHexToRgb(avatar.borderColor);
      player.avatar = avatar;
      return player;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  public async checkOpponent(gameId: string): Promise<number> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id: gameId },
      });
      if (!game) {
        throw new WsException('Game not found');
      }
      return game.opponent;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  public async createGame(game: CreateGameDTO): Promise<string> {
    try {
      const newGame = await this.gameRepository.save(game);
      const newScore: CreateScoreDTO = {
        gameId: newGame.id,
        mode: newGame.mode,
        leftPlayerId:
          newGame.hostSide == 'Left' ? newGame.host : newGame.opponent,
        rightPlayerId:
          newGame.hostSide == 'Right' ? newGame.host : newGame.opponent,
      };
      const score = await this.scoreService.createScore(newScore);
      await this.updateGameScore(newGame, score);
      return newGame.id;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async addOpponent(gameId: string, opponentId: number): Promise<any> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id: gameId },
      });
      if (!game) {
        throw new Error('Game not found');
      }
      game.opponent = opponentId;
      await this.gameRepository.save(game);
      await this.scoreService.addOpponent(gameId, opponentId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateStatus(
    gameId: string,
    status: 'Not Started' | 'Stopped' | 'Playing' | 'Finished' | 'Deleted',
    result: 'Not Finished' | 'Host' | 'Opponent' | 'Deleted',
    actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  ): Promise<any> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id: gameId },
      });
      if (!game) {
        throw new Error('Game not found');
      }
      await this.gameRepository.update(
        { id: gameId },
        {
          status: status,
          result: result,
          actualRound: actualRound,
        },
      );
      await this.updateJoinButton(game);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async quitGame(gameId: string, userId: number): Promise<void> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id: gameId },
      });
      if (!game) {
        throw new Error('Game not found');
      }
      if (game.status === 'Playing' || game.status === 'Stopped') {
        game.status = 'Deleted';
        if (userId === game.host) {
          game.result = 'Opponent';
        } else if (userId === game.opponent) {
          game.result = 'Host';
        } else {
          throw new Error('User not in game');
        }
      } else if (game.status === 'Not Started') {
        game.status = 'Deleted';
        game.result = 'Deleted';
      } else {
        throw new Error('Game already finnished');
      }
      await this.gameRepository.update(
        { id: gameId },
        {
          status: game.status,
          result: game.result,
        },
      );
      this.statusService.add(userId.toString(), 'connected');
      await this.updateJoinButton(game);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // --------------------------------  PRIVATE METHODS  ------------------------------- //

  private async updateGameScore(game: Game, score: Score) {
    await this.gameRepository
      .createQueryBuilder()
      .relation(Game, 'score')
      .of(game.id)
      .set(score);
  }

  private async updateJoinButton(game: Game) {
    // update status button if channel true or invite !== -1
    if (game.invite !== -1 || game.channel) {
      if (game.status === 'Not Started')
        this.chatGateway.server.emit('joinButton', {
          gameId: game.id,
          active: true,
        });
      else {
        this.chatGateway.server.emit('joinButton', {
          gameId: game.id,
          active: false,
        });
      }
    }
  }
}
