import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stats } from '@/utils/typeorm/Stats.entity';
import { CreateStatsDTO } from '../dto/CreateStats.dto';
import { ScoreInfo } from '@transcendence/shared/types/Score.types';
import {
  StatsImproved,
  Result,
  XP,
  LeagueStats,
  ShortStats,
  UserLevel,
  NextLevel,
  LevelUpAnnonce,
} from '@transcendence/shared/types/Stats.types';
import { UpdateStatsDTO } from '../dto/UpdateStats.dto';
import { calculateXP } from '@transcendence/shared/game/calculateXP';
import { ExperienceService } from '@/experience/service/experience.service';
import { AchievementService } from '@/achievement/service/achievement.service';

@Injectable()
export class StatsService {
  // ----------------------------------  CONSTRUCTOR  --------------------------------- //

  constructor(
    @InjectRepository(Stats)
    private readonly statsRepository: Repository<Stats>,

    private readonly achievementService: AchievementService,
    private readonly experienceService: ExperienceService,
  ) {}

  public levelUpAnnonce: LevelUpAnnonce[] = [];

  // --------------------------------  PUBLIC METHODS  -------------------------------- //

  public async createStats(newStats: CreateStatsDTO): Promise<Stats> {
    try {
      const stats = await this.statsRepository.save(newStats);
      return stats;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateStats(
    userId: number,
    update: UpdateStatsDTO,
  ): Promise<Stats> {
    try {
      let stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        throw new Error('Stats not found');
      }
      const result: Result = {
        win: false,
        rageQuit: false,
        roundWin: 0,
        roundLost: 0,
        pointWin: 0,
        pointLost: 0,
      };
      if (update.mode === 'League') {
        stats = this.defineLeagueStats(
          stats,
          update.side,
          update.winSide,
          update.type,
          update.score,
          update.nbRound,
          result,
        );
      } else if (update.mode === 'Party') {
        stats = this.definePartyStats(
          stats,
          update.side,
          update.winSide,
          update.type,
          update.score,
          update.nbRound,
          result,
        );
      } else if (update.mode === 'Training') {
        stats = this.defineTrainingStats(
          stats,
          update.side,
          update.winSide,
          update.type,
          update.score,
          update.nbRound,
          result,
        );
      }
      const xp: XP = calculateXP(result, update.maxPoint);
      if (update.mode === 'League') {
        stats.leagueXP += xp.total;
        if (stats.leagueXP < 0) stats.leagueXP = 0;
      }
      if (result.win) {
        stats.playerXP += xp.total;
        stats.levelUp = await this.checkLevelUp(stats, userId);
      }
      await this.checkAchievement(stats, userId);
      return await this.statsRepository.save(stats);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateDemoWatched(userId: number): Promise<void> {
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        throw new Error('Stats not found');
      }
      stats.demoWatched += 1;
      if (
        stats.demoWatched === 1 ||
        stats.demoWatched === 10 ||
        stats.demoWatched === 100
      ) {
        await this.achievementService.achievementCompleted(userId, {
          code: `DEMO_${stats.demoWatched}`,
        });
      }
      await this.statsRepository.update(
        { userId: userId },
        {
          demoWatched: stats.demoWatched,
        },
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateStoryLevelCompleted(
    userId: number,
    storyLevelCompleted: number,
  ): Promise<void> {
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        throw new Error('Stats not found');
      }
      if (stats.storyLevelCompleted < storyLevelCompleted) {
        await this.statsRepository.update(
          { userId: userId },
          {
            storyLevelCompleted: storyLevelCompleted,
          },
        );
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateXP(userId: number, xp: number): Promise<void> {
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        throw new Error('Stats not found');
      }
      stats.playerXP += xp;
      await this.checkLevelUp(stats, userId);
      await this.statsRepository.update(
        { userId: userId },
        {
          playerXP: stats.playerXP,
          level: stats.level,
        },
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getShortStats(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        ret.message = 'Stats not found';
        return ret;
      }
      ret.success = true;
      ret.message = 'Stats found';
      const leagueStats: LeagueStats[] = (await this.getAllLeagueStats()).data;
      const userLevel: UserLevel = (await this.getUserLevel(userId)).data;
      const userStats: LeagueStats =
        leagueStats[leagueStats.findIndex((stat) => stat.userId === userId)];

      const shortStats: ShortStats = {
        leagueRank: userStats.rank,
        leaguePoints: stats.leagueXP,
        leveling: userLevel,
        gameWon: 0,
        gameLost: 0,
        leagueWon:
          stats.leagueClassicWon + stats.leagueBest3Won + stats.leagueBest5Won,
        leagueLost:
          stats.leagueClassicLost +
          stats.leagueBest3Lost +
          stats.leagueBest5Lost,
        partyWon:
          stats.partyClassicWon +
          stats.partyBest3Won +
          stats.partyBest5Won +
          stats.partyCustomWon,
        partyLost:
          stats.partyClassicLost +
          stats.partyBest3Lost +
          stats.partyBest5Lost +
          stats.partyCustomLost,
        trainingWon:
          stats.trainingClassicWon +
          stats.trainingBest3Won +
          stats.trainingBest5Won +
          stats.trainingCustomWon +
          stats.trainingStoryWon,
        trainingLost:
          stats.trainingClassicLost +
          stats.trainingBest3Lost +
          stats.trainingBest5Lost +
          stats.trainingCustomLost +
          stats.trainingStoryLost,
        demoWatched: stats.demoWatched,
        storyLevelCompleted: stats.storyLevelCompleted,
        userLevel: stats.level,
      };
      shortStats.gameWon =
        shortStats.leagueWon + shortStats.partyWon + shortStats.trainingWon;
      shortStats.gameLost =
        shortStats.leagueLost + shortStats.partyLost + shortStats.trainingLost;
      ret.data = shortStats;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async getUserLevel(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        ret.message = 'Stats not found';
        return ret;
      }
      const userLevel: UserLevel = {
        level: stats.level,
        userXp: stats.playerXP,
        nextLevelXP: 0,
        cumulativeXpToNext: 0,
        progress: 0,
      };
      const nextLevel: NextLevel = await this.experienceService.getNextLevelXp(
        userLevel.level,
      );
      userLevel.nextLevelXP = nextLevel.nextLevelXP;
      userLevel.cumulativeXpToNext = nextLevel.cumulativeXpToNext;
      userLevel.progress =
        1 -
        (nextLevel.cumulativeXpToNext - userLevel.userXp) /
          nextLevel.nextLevelXP;
      userLevel.progress = Math.round(userLevel.progress * 100);
      ret.success = true;
      ret.message = 'User level found';
      ret.data = userLevel;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async getUserLevelUp(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        throw new Error('Stats not found');
      }
      if (!stats.levelUp) {
        ret.success = true;
        ret.message = 'User level not up';
        return ret;
      }
      await this.statsRepository.update(
        { userId: userId },
        {
          levelUp: false,
        },
      );
      ret.success = true;
      ret.message = 'User level up';
      ret.data = stats.level;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async getAllLeagueStats(): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const stats = await this.statsRepository.find();
      if (!stats || stats.length === 0) {
        ret.message = 'Stats not found';
        return ret;
      }
      ret.success = true;
      ret.message = 'Stats found';
      const leagueStats: LeagueStats[] = [];
      for (const stat of stats) {
        const leagueStat: LeagueStats = {
          userId: stat.userId,
          rank: 0,
          leaguePoints: stat.leagueXP,
          leagueWon:
            stat.leagueClassicWon + stat.leagueBest3Won + stat.leagueBest5Won,
          leagueLost:
            stat.leagueClassicLost +
            stat.leagueBest3Lost +
            stat.leagueBest5Lost,
        };
        leagueStats.push(leagueStat);
      }
      ret.data = leagueStats;
      leagueStats.sort((a, b) => (a.leaguePoints > b.leaguePoints ? -1 : 1));
      for (let i = 0; i < leagueStats.length; i++) {
        leagueStats[i].rank = i + 1;
        if (
          i > 0 &&
          leagueStats[i].leaguePoints === leagueStats[i - 1].leaguePoints
        ) {
          leagueStats[i].rank = leagueStats[i - 1].rank;
        }
        if (leagueStats[i].leaguePoints === 0) {
          leagueStats[i].rank = 0;
        }
      }

      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async getFullStats(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const stats = await this.statsRepository.findOne({
        where: { userId: userId },
      });
      if (!stats) {
        ret.message = 'Stats not found';
        return ret;
      }
      ret.success = true;
      ret.message = 'Stats found';
      const statsImproved: StatsImproved = {
        statsDB: stats,
        gameWon: 0,
        gameLost: 0,
        classicWon:
          stats.leagueClassicWon +
          stats.partyClassicWon +
          stats.trainingClassicWon,
        classicLost:
          stats.leagueClassicLost +
          stats.partyClassicLost +
          stats.trainingClassicLost,
        best3Won:
          stats.leagueBest3Won + stats.partyBest3Won + stats.trainingBest3Won,
        best3Lost:
          stats.leagueBest3Lost +
          stats.partyBest3Lost +
          stats.trainingBest3Lost,
        best5Won:
          stats.leagueBest5Won + stats.partyBest5Won + stats.trainingBest5Won,
        best5Lost:
          stats.leagueBest5Lost +
          stats.partyBest5Lost +
          stats.trainingBest5Lost,
        customWon: stats.partyCustomWon + stats.trainingCustomWon,
        customLost: stats.partyCustomLost + stats.trainingCustomLost,
        storyWon: stats.trainingStoryWon,
        storyLost: stats.trainingStoryLost,
        rageQuitWin: stats.leagueRageQuitWin + stats.partyRageQuitWin,
        rageQuitLost: stats.leagueRageQuitLost + stats.partyRageQuitLost,
        disconnectWin: stats.leagueDisconnectWin + stats.partyDisconnectWin,
        disconnectLost: stats.leagueDisconnectLost + stats.partyDisconnectLost,
        roundWon:
          stats.leagueRoundWon + stats.partyRoundWon + stats.trainingRoundWon,
        roundLost:
          stats.leagueRoundLost +
          stats.partyRoundLost +
          stats.trainingRoundLost,
        pointWon:
          stats.leaguePointWon + stats.partyPointWon + stats.trainingPointWon,
        pointLost:
          stats.leaguePointLost +
          stats.partyPointLost +
          stats.trainingPointLost,
      };
      statsImproved.gameWon =
        statsImproved.classicWon +
        statsImproved.best3Won +
        statsImproved.best5Won +
        statsImproved.customWon;
      statsImproved.gameLost =
        statsImproved.classicLost +
        statsImproved.best3Lost +
        statsImproved.best5Lost +
        statsImproved.customLost;
      ret.data = statsImproved;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  // --------------------------------  PRIVATE METHODS  ------------------------------- //

  private defineLeagueStats(
    stats: Stats,
    side: 'Left' | 'Right',
    winSide: 'Left' | 'Right',
    type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story',
    score: ScoreInfo,
    nbRound: number,
    result: Result,
  ): Stats {
    if (winSide === 'Left') {
      if (side === 'Left') {
        if (type === 'Classic') stats.leagueClassicWon += 1;
        else if (type === 'Best3') stats.leagueBest3Won += 1;
        else if (type === 'Best5') stats.leagueBest5Won += 1;
        result.win = true;
      } else {
        if (type === 'Classic') stats.leagueClassicLost += 1;
        else if (type === 'Best3') stats.leagueBest3Lost += 1;
        else if (type === 'Best5') stats.leagueBest5Lost += 1;
      }
    } else {
      if (side === 'Left') {
        if (type === 'Classic') stats.leagueClassicLost += 1;
        else if (type === 'Best3') stats.leagueBest3Lost += 1;
        else if (type === 'Best5') stats.leagueBest5Lost += 1;
      } else {
        if (type === 'Classic') stats.leagueClassicWon += 1;
        else if (type === 'Best3') stats.leagueBest3Won += 1;
        else if (type === 'Best5') stats.leagueBest5Won += 1;
        result.win = true;
      }
    }
    if (score.rageQuit) {
      if (side === score.rageQuit) stats.leagueRageQuitLost += 1;
      else stats.leagueRageQuitWin += 1;
      result.rageQuit = true;
    }
    result.roundWin = side === 'Left' ? score.leftRound : score.rightRound;
    result.roundLost = side === 'Left' ? score.rightRound : score.leftRound;
    stats.leagueRoundWon += result.roundWin;
    stats.leagueRoundLost += result.roundLost;
    let leftPointWin = 0;
    let rightPointWin = 0;
    for (let i = 0; i < nbRound; i++) {
      leftPointWin += score.round[i].left;
      rightPointWin += score.round[i].right;
    }
    result.pointWin = side === 'Left' ? leftPointWin : rightPointWin;
    result.pointLost = side === 'Left' ? rightPointWin : leftPointWin;
    stats.leaguePointWon += result.pointWin;
    stats.leaguePointLost += result.pointLost;
    return stats;
  }

  private definePartyStats(
    stats: Stats,
    side: 'Left' | 'Right',
    winSide: 'Left' | 'Right',
    type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story',
    score: ScoreInfo,
    nbRound: number,
    result: Result,
  ): Stats {
    if (winSide === 'Left') {
      if (side === 'Left') {
        if (type === 'Classic') stats.partyClassicWon += 1;
        else if (type === 'Best3') stats.partyBest3Won += 1;
        else if (type === 'Best5') stats.partyBest5Won += 1;
        else if (type === 'Custom') stats.partyCustomWon += 1;
        result.win = true;
      } else {
        if (type === 'Classic') stats.partyClassicLost += 1;
        else if (type === 'Best3') stats.partyBest3Lost += 1;
        else if (type === 'Best5') stats.partyBest5Lost += 1;
        else if (type === 'Custom') stats.partyCustomLost += 1;
      }
    } else {
      if (side === 'Left') {
        if (type === 'Classic') stats.partyClassicLost += 1;
        else if (type === 'Best3') stats.partyBest3Lost += 1;
        else if (type === 'Best5') stats.partyBest5Lost += 1;
        else if (type === 'Custom') stats.partyCustomLost += 1;
      } else {
        if (type === 'Classic') stats.partyClassicWon += 1;
        else if (type === 'Best3') stats.partyBest3Won += 1;
        else if (type === 'Best5') stats.partyBest5Won += 1;
        else if (type === 'Custom') stats.partyCustomWon += 1;
        result.win = true;
      }
    }
    if (score.rageQuit) {
      if (side === score.rageQuit) stats.partyRageQuitLost += 1;
      else stats.partyRageQuitWin += 1;
      result.rageQuit = true;
    } else if (score.disconnect) {
      if (side === score.disconnect) stats.partyDisconnectLost += 1;
      else stats.partyDisconnectWin += 1;
    }
    result.roundWin = side === 'Left' ? score.leftRound : score.rightRound;
    result.roundLost = side === 'Left' ? score.rightRound : score.leftRound;
    stats.partyRoundWon += result.roundWin;
    stats.partyRoundLost += result.roundLost;
    let leftPointWin = 0;
    let rightPointWin = 0;
    for (let i = 0; i < nbRound; i++) {
      leftPointWin += score.round[i].left;
      rightPointWin += score.round[i].right;
    }
    result.pointWin = side === 'Left' ? leftPointWin : rightPointWin;
    result.pointLost = side === 'Left' ? rightPointWin : leftPointWin;
    stats.partyPointWon += result.pointWin;
    stats.partyPointLost += result.pointLost;
    return stats;
  }

  private defineTrainingStats(
    stats: Stats,
    side: 'Left' | 'Right',
    winSide: 'Left' | 'Right',
    type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story',
    score: ScoreInfo,
    nbRound: number,
    result: Result,
  ) {
    if (winSide === 'Left') {
      if (side === 'Left') {
        if (type === 'Classic') stats.trainingClassicWon += 1;
        else if (type === 'Best3') stats.trainingBest3Won += 1;
        else if (type === 'Best5') stats.trainingBest5Won += 1;
        else if (type === 'Custom') stats.trainingCustomWon += 1;
        else if (type === 'Story') stats.trainingStoryWon += 1;
        result.win = true;
      } else {
        if (type === 'Classic') stats.trainingClassicLost += 1;
        else if (type === 'Best3') stats.trainingBest3Lost += 1;
        else if (type === 'Best5') stats.trainingBest5Lost += 1;
        else if (type === 'Custom') stats.trainingCustomLost += 1;
        else if (type === 'Story') stats.trainingStoryLost += 1;
      }
    } else {
      if (side === 'Left') {
        if (type === 'Classic') stats.trainingClassicLost += 1;
        else if (type === 'Best3') stats.trainingBest3Lost += 1;
        else if (type === 'Best5') stats.trainingBest5Lost += 1;
        else if (type === 'Custom') stats.trainingCustomLost += 1;
        else if (type === 'Story') stats.trainingStoryLost += 1;
      } else {
        if (type === 'Classic') stats.trainingClassicWon += 1;
        else if (type === 'Best3') stats.trainingBest3Won += 1;
        else if (type === 'Best5') stats.trainingBest5Won += 1;
        else if (type === 'Custom') stats.trainingCustomWon += 1;
        else if (type === 'Story') stats.trainingStoryWon += 1;
        result.win = true;
      }
    }
    result.roundWin = side === 'Left' ? score.leftRound : score.rightRound;
    result.roundLost = side === 'Left' ? score.rightRound : score.leftRound;
    stats.trainingRoundWon += result.roundWin;
    stats.trainingRoundLost += result.roundLost;
    let leftPointWin = 0;
    let rightPointWin = 0;
    for (let i = 0; i < nbRound; i++) {
      leftPointWin += score.round[i].left;
      rightPointWin += score.round[i].right;
    }
    result.pointWin = side === 'Left' ? leftPointWin : rightPointWin;
    result.pointLost = side === 'Left' ? rightPointWin : leftPointWin;
    return stats;
  }

  // --------------------------------  PRIVATE METHODS  -------------------------------- //

  private async checkAchievement(stats: Stats, userId: number): Promise<void> {
    try {
      const winLeague =
        stats.leagueClassicWon + stats.leagueBest3Won + stats.leagueBest5Won;
      const winParty =
        stats.partyClassicWon +
        stats.partyBest3Won +
        stats.partyBest5Won +
        stats.partyCustomWon;
      const winTraining =
        stats.trainingClassicWon +
        stats.trainingBest3Won +
        stats.trainingBest5Won +
        stats.trainingCustomWon +
        stats.trainingStoryWon;
      const winGame = winLeague + winParty + winTraining;

      if (
        winGame === 1 ||
        winGame === 10 ||
        winGame === 100 ||
        winGame === 1000
      ) {
        await this.achievementService.achievementCompleted(userId, {
          code: `GAME_WIN_${winGame}`,
        });
      }
      if (winLeague === 1 || winLeague === 10 || winLeague === 100) {
        await this.achievementService.achievementCompleted(userId, {
          code: `LEAGUE_WIN_${winLeague}`,
        });
      }
      if (winParty === 1 || winParty === 10 || winParty === 100) {
        await this.achievementService.achievementCompleted(userId, {
          code: `PARTY_WIN_${winParty}`,
        });
      }
      if (winTraining === 1 || winTraining === 10 || winTraining === 100) {
        await this.achievementService.achievementCompleted(userId, {
          code: `TRAINING_WIN_${winTraining}`,
        });
      }

      const loseLeague =
        stats.leagueClassicLost + stats.leagueBest3Lost + stats.leagueBest5Lost;
      const loseParty =
        stats.partyClassicLost +
        stats.partyBest3Lost +
        stats.partyBest5Lost +
        stats.partyCustomLost;
      const loseTraining =
        stats.trainingClassicLost +
        stats.trainingBest3Lost +
        stats.trainingBest5Lost +
        stats.trainingCustomLost +
        stats.trainingStoryLost;
      const loseGame = loseLeague + loseParty + loseTraining;

      if (
        loseGame === 1 ||
        loseGame === 10 ||
        loseGame === 100 ||
        loseGame === 1000
      ) {
        await this.achievementService.achievementCompleted(userId, {
          code: `GAME_LOSE_${loseGame}`,
        });
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async checkLevelUp(stats: Stats, userId: number): Promise<boolean> {
    try {
      const nextLevel: NextLevel = await this.experienceService.getNextLevelXp(
        stats.level,
      );
      if (!nextLevel)
        throw new Error('Error while getting next level experience');
      if (stats.playerXP >= nextLevel.cumulativeXpToNext) {
        stats.level += 1;
        this.levelUpAnnonce.push({
          userId: stats.userId.toString(),
          level: stats.level,
        });
        const level = stats.level;
        if (
          level === 2 ||
          level === 5 ||
          level === 10 ||
          level === 20 ||
          level === 30 ||
          level === 40 ||
          level === 50 ||
          level === 60 ||
          level === 70 ||
          level === 80 ||
          level === 90 ||
          level === 100
        ) {
          await this.achievementService.achievementCompleted(userId, {
            code: `LEVEL_${level}`,
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
