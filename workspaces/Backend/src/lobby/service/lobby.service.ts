/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

import { Game } from 'src/utils/typeorm/Game.entity';
import { CreateGameDTO } from '@/game/dto/CreateGame.dto';

import { GameService } from '@/game/service/game.service';
import { UsersService } from '@/users/service/users.service';

import { GameInfo, Player } from '@transcendence/shared/types/Game.types';
import { ChannelService } from '@/channels/service/channel.service';
import { StatsService } from '@/stats/service/stats.service';
import { AvatarService } from '@/avatar/service/avatar.service';
import { CryptoService } from '@/utils/crypto/crypto';
import { LeagueStats } from '@transcendence/shared/types/Stats.types';
import { UserLeaderboard } from '@transcendence/shared/types/Leaderboard.types';

@Injectable()
export class LobbyService {
  // ----------------------------------  CONSTRUCTOR  --------------------------------- //
  constructor(
    public readonly gameService: GameService,
    public readonly userService: UsersService,
    public readonly channelService: ChannelService,
    public readonly statsService: StatsService,
    public readonly avatarService: AvatarService,
    private readonly cryptoService: CryptoService,
  ) {}

  // --------------------------------  PUBLIC METHODS  -------------------------------- //
  public async CreateGame(
    userId: number,
    newGame: CreateGameDTO,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const gameId = await this.gameService.getGameByUserId(userId);
      if (gameId) {
        ret.message = 'You are already in a game';
        ret.data = gameId;
        return ret;
      }

      const newGameId = await this.gameService.createGame(newGame);
      ret.success = true;
      ret.message = 'Game created';
      ret.data = newGameId;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async IsInGame(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const gameId = await this.gameService.getGameByUserId(userId);
      if (!gameId) {
        ret.message = 'You are not in a game';
        return ret;
      }
      ret.success = true;
      ret.message = 'You are in a game';
      ret.data = gameId;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  //Si le joueur est en game renvoie l'id, si le joueur en Matchmaking le retire de la liste
  public async OngoingInvite(inviterId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const gameId = await this.gameService.getGameInvitePending(inviterId);
      if (!gameId) {
        ret.message = 'There is no ongoing invite';
        return ret;
      }
      ret.success = true;
      ret.message = 'The invite is still ongoing';
      ret.data = gameId;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async GetCurrentGame(mode?: 'League' | 'Party'): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const games = await this.gameService.getCurrentGames();
      if (!games) {
        ret.message = 'No games found';
        return ret;
      }
      const gamesInfos: GameInfo[] = [];
      for (const game of games) {
        if (mode && game.mode !== mode) continue;
        const leftPlayer: Player = await this.gameService.definePlayer(
          game.hostSide === 'Left' ? game.host : game.opponent,
          'Left',
          game.hostSide === 'Left',
        );
        const rightPlayer: Player = await this.gameService.definePlayer(
          game.hostSide === 'Right' ? game.host : game.opponent,
          'Right',
          game.hostSide === 'Right',
        );
        const gameInfo: GameInfo = {
          id: game.id,
          name: game.name,
          type: game.type,
          mode: game.mode,
          leftPlayer: leftPlayer,
          rightPlayer: rightPlayer,
          actualRound: game.actualRound,
          maxRound: game.maxRound,
          status: game.status,
        };
        gamesInfos.push(gameInfo);
      }
      ret.success = true;
      ret.message = 'Games found';
      ret.data = gamesInfos;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async GetLeaderboard() {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const usersStats: LeagueStats[] = (
        await this.statsService.getAllLeagueStats()
      ).data;
      if (!usersStats || usersStats.length === 0) {
        ret.message = 'No stats found';
        return ret;
      }
      const leaderboard: UserLeaderboard[] = [];
      for (const userStats of usersStats) {
        const user = await this.userService.getUserById(userStats.userId);
        if (!user) {
          ret.message = 'User not found';
          continue;
        }
        let avatar;
        try {
          avatar = await this.avatarService.getAvatarById(
            userStats.userId,
            false,
          );
        } catch (error) {
          continue;
        }
        if (avatar?.decrypt && avatar?.image.length > 0) {
          avatar.image = await this.cryptoService.decrypt(avatar.image);
          avatar.decrypt = false;
        }
        const userLeaderboard: UserLeaderboard = {
          userId: user.id,
          login: user.login,
          avatar: avatar,
          points: userStats.leaguePoints,
          rank: userStats.rank,
          win: userStats.leagueWon,
          lost: userStats.leagueLost,
        };
        leaderboard.push(userLeaderboard);
      }

      leaderboard.sort((a, b) => {
        if (a.rank === 0) return 1;
        if (b.rank === 0) return -1;
        return a.rank - b.rank;
      });
      ret.success = true;
      ret.message = 'Leaderboard found';
      ret.data = leaderboard;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async JoinGame(userId: number, gameId: string): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        ret.message = 'User not found';
        return ret;
      }

      const game: Game = await this.gameService.getGameById(gameId);
      if (!game) {
        ret.message = 'Game not found';
        return ret;
      }

      //Si le joueur est deja dans cette partie
      if (game.host === userId || game.opponent === userId) {
        ret.success = true;
        ret.message = 'You are already in this game';
        return ret;
      }

      //Si deja un opposant et qu'il join en opponent (2 joueurs max)
      if (game.opponent !== -1) {
        ret.message = 'Game is full';
        return ret;
      }

      if (
        game.invite !== -1 &&
        ((game.channel &&
          (await !this.channelService.isUserInChannel(userId, game.invite))) ||
          game.invite !== userId)
      ) {
        ret.message = 'You are not invited to this game';
        return ret;
      }

      //Ajoute le joueur dans la game en opponent
      await this.gameService.addOpponent(gameId, userId);
      ret.success = true;
      ret.message = 'You joined the game as an opponent';
      ret.data = gameId;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async Quit(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const gameId = await this.gameService.getGameByUserId(userId);
      if (!gameId) {
        ret.message = 'You are already not in a game';
        return ret;
      }
      await this.gameService.quitGame(gameId, userId);
      ret.success = true;
      ret.message = 'You quit the game';
      return ret;
    } catch (error) {
      return ret;
    }
  }
}
