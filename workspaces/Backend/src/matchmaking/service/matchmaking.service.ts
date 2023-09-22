import { Injectable, Inject, forwardRef } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import StartMatchmakingDTO from '../dto/StartMatchmaking.dto';
import CreateMatchmakingDTO from '../dto/CreateMatchmaking.dto';
import { Matchmaking } from 'src/utils/typeorm/Matchmaking.entity';

import { CreateGameDTO } from '@/game/dto/CreateGame.dto';
import { GameService } from '@/game/service/game.service';
import {
  confirmBackground,
  confirmBall,
} from '@transcendence/shared/game/random';
import { UsersService } from '@/users/service/users.service';

@Injectable()
export class MatchmakingService {
  constructor(
    @InjectRepository(Matchmaking)
    private readonly matchmakingRepository: Repository<Matchmaking>,

    private readonly gameService: GameService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  public async createMatchmaking(
    create: CreateMatchmakingDTO,
  ): Promise<Matchmaking> {
    const matchmaking = new Matchmaking();
    matchmaking.userId = create.userId;
    return this.matchmakingRepository.save(matchmaking);
  }

  public async startSearch(
    userId: number,
    search: StartMatchmakingDTO,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const matchmaking = await this.matchmakingRepository.findOne({
        where: { userId: userId },
      });
      if (!matchmaking) {
        throw new Error('Matchmaking not found');
      }

      await this.matchmakingRepository.update(
        { userId: userId },
        { searching: true, type: search.type },
      );

      ret.success = true;
      ret.message = 'You are now in matchmaking ';
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async stopSearch(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const matchmaking = await this.matchmakingRepository.findOne({
        where: { userId: userId },
      });
      if (!matchmaking) {
        ret.message = 'Matchmaking not found';
        return ret;
      }
      if (!matchmaking.searching) {
        ret.message = 'You are not in matchmaking';
        return ret;
      }
      await this.matchmakingRepository.update(
        { userId: userId },
        { searching: false },
      );

      ret.success = true;
      ret.message = 'You are no longer in matchmaking ';
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async checkSearch(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      // check if user in game
      const gameId = await this.gameService.getGameByUserId(userId);
      if (gameId) {
        ret.success = true;
        ret.message = 'You are in game';
        ret.data = gameId;
        return ret;
      }

      //check is still in matchmaking
      const search = await this.matchmakingRepository.findOne({
        where: { userId: userId },
      });
      if (search.searching == false) {
        ret.success = true;
        ret.message = 'You are not in matchmaking';
        return ret;
      }

      //check if other player are searching
      const sameSearch = await this.matchmakingRepository.find({
        where: { searching: true, type: search.type, userId: Not(userId) },
      });

      if (sameSearch.length > 0) {
        sameSearch.sort(
          (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
        );
        //try to stop search of the player search
        const retPlay = await this.stopSearch(userId);
        if (!retPlay.success) {
          const gameId = await this.gameService.getGameByUserId(userId);
          if (gameId) {
            ret.success = true;
            ret.message = 'You are in game';
            ret.data = gameId;
            return ret;
          }
          ret.error = retPlay.error;
          return ret;
        }
        //try to stop search of one of the player found
        let i = 0;
        while (i < sameSearch.length) {
          const retOpponnent = await this.stopSearch(sameSearch[i].userId);
          if (retOpponnent.success) {
            break;
          }
          i++;
        }
        // if no opponent found then restart search
        if (i == sameSearch.length) {
          this.matchmakingRepository.update(
            { userId: userId },
            { searching: true },
          );
          ret.message = 'No opponent found';
          return ret;
        }
        // else create game session
        const newGame = await this.createGame(
          userId,
          sameSearch[i].userId,
          search.type,
        );
        ret.success = true;
        ret.message = 'Game created';
        ret.data = newGame;
      } else {
        ret.success = false;
        ret.message = 'No match found';
      }
      return ret;
    } catch (error) {
      const Data = {
        success: false,
        message: 'Catched an error',
        error: error,
      };
      return Data;
    }
  }

  private async createGame(
    hostId: number,
    opponentId: number,
    type: 'Classic' | 'Best3' | 'Best5' | 'Custom',
  ): Promise<string> {
    const host = await this.userService.getUserById(hostId);
    const opponent = await this.userService.getUserById(opponentId);
    let hostLogin = host.login;
    if (hostLogin.length > 10) {
      hostLogin = hostLogin.substring(0, 10);
      hostLogin += '...';
    }
    let opponentLogin = opponent.login;
    if (opponentLogin.length > 10) {
      opponentLogin = opponentLogin.substring(0, 10);
      opponentLogin += '...';
    }
    const game: CreateGameDTO = {
      name: `${hostLogin} vs ${opponentLogin}`,
      type: type,
      mode: 'League',
      host: hostId,
      opponent: opponentId,
      hostSide: 'Left',
      maxPoint: type == 'Classic' ? 9 : type == 'Best3' ? 7 : 5,
      maxRound: type == 'Classic' ? 1 : type == 'Best3' ? 3 : 5,
      difficulty: 2,
      push: type == 'Classic' ? false : true,
      pause: type == 'Classic' ? false : true,
      background: type == 'Classic' ? 'Classic' : confirmBackground('Random'),
      ball: type == 'Classic' ? 'Classic' : confirmBall('Random'),
    };
    const gameId = await this.gameService.createGame(game);
    return gameId;
  }
}
