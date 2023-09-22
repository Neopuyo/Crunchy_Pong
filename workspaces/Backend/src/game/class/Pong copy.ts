// import standard nest packages
import { Server } from 'socket.io';
import { WsException } from '@nestjs/websockets';

// import game engine logic
import { ActionDTO } from '../dto/Action.dto';
import {
  GameData,
  Player,
  InitData,
} from '@transcendence/shared/types/Game.types';
import {
  ScoreMessage,
  StatusMessage,
  UpdateData,
} from '@transcendence/shared/types/Message.types';
import { defineTimer } from '@transcendence/shared/game/pongUtils';
import { initPong } from '@transcendence/shared/game/initPong';

// import classes and entities
import { UserInfo } from './UserInfo';
import { Game } from '@/utils/typeorm/Game.entity';

// import services
import { GameService } from '../service/game.service';
import { ScoreService } from '@/score/service/score.service';
import { ColoredLogger } from '../colored-logger';

import {
  ScoreInfo,
  ScoreUpdate,
} from '@transcendence/shared/types/Score.types';
import { StatsUpdate } from '@transcendence/shared/types/Stats.types';

import { updatePong } from '@transcendence/shared/game/updatePong';

import {
  BACK_FPS,
  TIMER_DECONNECTION,
  TIMER_PAUSE,
  TIMER_RESTART,
  TIMER_START,
} from '@transcendence/shared/constants/Game.constants';
import { StatsService } from '@/stats/service/stats.service';
import { PauseUpdate } from '@transcendence/shared/types/Pause.types';
import { StatusService } from '@/statusService/status.service';

export class Pong {
  // Game Loop variables
  private lastTimestamp: number = 0;
  private isGameLoopRunning: boolean = false;
  private framesThisSecond = 0;
  private lastFpsUpdate = 0;
  private currentFps = 0;
  private updateGameInterval: NodeJS.Timeout | null = null;
  private disconnectLoopRunning: 'Left' | 'Right' | null = null;
  private pauseLoopRunning: 'Left' | 'Right' | null = null;

  // Game data
  private playerLeft: UserInfo[];
  private playerRight: UserInfo[];
  private spectators: UserInfo[] = [];
  private data: GameData;

  constructor(
    private readonly server: Server,
    public readonly gameId: string,
    private readonly gameDB: Game,
    private readonly gameService: GameService,
    private readonly scoreService: ScoreService,
    private readonly statsService: StatsService,
    private readonly statusService: StatusService,
    private readonly logger: ColoredLogger,
    score: ScoreInfo,
  ) {
    if (this.gameDB) {
      const initData: InitData = {
        id: this.gameDB.id,
        name: this.gameDB.name,
        type: this.gameDB.type,
        mode: this.gameDB.mode,
        hostSide: this.gameDB.hostSide,
        actualRound: this.gameDB.actualRound,
        maxPoint: this.gameDB.maxPoint,
        maxRound: this.gameDB.maxRound,
        difficulty: this.gameDB.difficulty,
        push: this.gameDB.push,
        pause: this.gameDB.pause,
        background: this.gameDB.background,
        ball: this.gameDB.ball,
        score: score,
      };
      this.data = initPong(initData);
    }
  }

  // ---------------------------------  INIT METHODS  --------------------------------- //

  public async initPlayer(): Promise<void> {
    try {
      this.data.playerLeft = await this.gameService.definePlayer(
        this.gameDB.hostSide === 'Left'
          ? this.gameDB.host
          : this.gameDB.opponent,
        'Left',
        this.gameDB.hostSide === 'Left',
      );
      this.data.playerLeftStatus = 'Disconnected';
      this.data.playerRight = await this.gameService.definePlayer(
        this.gameDB.hostSide === 'Right'
          ? this.gameDB.host
          : this.gameDB.opponent,
        'Right',
        this.gameDB.hostSide === 'Right',
      );
      this.data.playerRightStatus = 'Disconnected';
    } catch (error) {
      this.logger.error(
        `Error Initializing Players: ${error.message}`,
        'Pong - initPlayer',
        error,
      );
      throw new WsException('Error while initializing players');
    }
  }

  // --------------------------------  JOIN METHODS  --------------------------------- //

  public async join(user: UserInfo): Promise<any> {
    const data: ReturnData = {
      success: false,
      message: '',
    };

    // Update gameDB if opponent is not set
    if (this.gameDB.opponent === -1) {
      try {
        this.gameDB.opponent = await this.gameService.checkOpponent(
          this.gameDB.id,
        );
      } catch (error) {
        this.logger.error(
          `Error Updating game opponent: ${error.message}`,
          'Pong - Join',
          error,
        );
        throw new WsException('Error while updating game opponent');
      }
    }

    if (user.id === this.gameDB.host || user.id === this.gameDB.opponent) {
      try {
        await this.joinAsPlayer(user);
        this.statusService.add(user.id.toString(), 'in game');
        this.logger.log(
          `User ${user.id} joined ${this.gameId} as ${
            user.id === this.gameDB.host ? 'Host' : 'Opponent'
          }`,
          'Pong - Join',
        );
      } catch (error) {
        this.logger.error(
          `Error Joining as player: ${error.message}`,
          'Pong - Join',
          error,
        );
        throw new WsException('Error while joining as player');
      }
    } else {
      this.spectators.push(user);
      this.logger.log(
        `User ${user.id} joined ${this.gameId} as Spectator`,
        'Pong - Join',
      );
    }
    user.socket.join(this.gameId);
    data.success = true;
    data.message = 'User joined game';
    data.data = this.data;
    return data;
  }

  // --------------------------------  ACTION METHODS  -------------------------------- //

  private pauseLoop(side: 'Left' | 'Right') {
    if (!this.disconnectLoopRunning && this.pauseLoopRunning) {
      const actualTime = new Date().getTime();
      if (actualTime >= this.data.timer.end) {
        this.data.timer = defineTimer(
          TIMER_RESTART,
          'ReStart',
          side === 'Left'
            ? this.data.playerLeft.name
            : this.data.playerRight.name,
        );
        this.data.status = 'Playing';
        this.data.sendStatus = true;
        this.pauseLoopRunning = null;
      } else {
        setTimeout(() => {
          this.pauseLoop(side);
        }, 1000);
      }
    }
  }

  private startPauseLoop(side: 'Left' | 'Right') {
    if (!this.disconnectLoopRunning) {
      this.data.status = 'Stopped';
      this.data.sendStatus = true;
      this.data.updatePause = true;
      this.data.timer = defineTimer(
        TIMER_PAUSE,
        'Pause',
        side === 'Left'
          ? this.data.playerLeft.name
          : this.data.playerRight.name,
      );
      this.pauseLoopRunning = side;
      this.pauseLoop(side);
    }
  }

  private stopPauseLoop(side: 'Left' | 'Right') {
    if (!this.disconnectLoopRunning) {
      this.data.status = 'Playing';
      this.data.sendStatus = true;
      this.data.timer = defineTimer(
        TIMER_RESTART,
        'ReStart',
        side === 'Left'
          ? this.data.playerLeft.name
          : this.data.playerRight.name,
      );
      this.pauseLoopRunning = null;
    }
  }

  private handleStop(action: ActionDTO) {
    if (this.data.status === 'Playing') {
      // Check if player is allowed to pause
      if (
        this.playerLeft.length > 0 &&
        this.playerLeft[0].id === action.userId &&
        this.data.pause.left
      ) {
        this.data.pause.left--;
        this.data.pause.status = 'Left';
      } else if (
        this.playerRight.length > 0 &&
        this.playerRight[0].id === action.userId &&
        this.data.pause.right
      ) {
        this.data.pause.right--;
        this.data.pause.status = 'Right';
      } else return;

      // Pause the game
      this.startPauseLoop(
        this.playerLeft[0].id === action.userId ? 'Left' : 'Right',
      );
    } else if (this.data.status === 'Stopped') {
      // Check if player is allowed to restart
      if (
        this.playerLeft.length > 0 &&
        this.playerLeft[0].id === action.userId &&
        this.data.pause.status === 'Right'
      ) {
        return;
      } else if (
        this.playerRight.length > 0 &&
        this.playerRight[0].id === action.userId &&
        this.data.pause.status === 'Left'
      ) {
        return;
      }

      // Restart the game
      this.stopPauseLoop(
        this.playerLeft[0].id === action.userId ? 'Left' : 'Right',
      );
    }
  }

  private handlePush(action: ActionDTO) {
    if (
      this.playerLeft.length > 0 &&
      this.playerLeft[0].id === action.userId &&
      !this.data.playerLeftDynamic.push
    )
      this.data.playerLeftDynamic.push = 1;
    else if (
      this.playerRight.length > 0 &&
      this.playerRight[0].id === action.userId &&
      !this.data.playerRightDynamic.push
    )
      this.data.playerRightDynamic.push = 1;
  }

  public playerAction(action: ActionDTO) {
    if (
      (this.playerLeft.length > 0 && this.playerLeft[0].id === action.userId) ||
      (this.playerRight.length > 0 && this.playerRight[0].id === action.userId)
    ) {
      if (action.move === 'Stop' && this.data.pause.active) {
        this.handleStop(action);
      } else if (action.move === 'Push') {
        this.handlePush(action);
      } else {
        if (this.playerLeft[0].id === action.userId)
          this.data.playerLeftDynamic.move = action.move;
        else if (this.playerRight[0].id === action.userId)
          this.data.playerRightDynamic.move = action.move;
      }
    }
  }

  // ---------------------------------  EMITS METHODS  -------------------------------- //

  private sendPlayerData(player: Player) {
    this.server.to(this.gameId).emit('player', player);
    this.logger.log("Player's data sent", 'Pong - sendPlayerDatas');
  }

  private sendStatus() {
    const status: StatusMessage = {
      status: this.data.status,
      result: this.data.result,
      winSide: this.data.winSide,
      playerLeft: this.data.playerLeftStatus,
      playerRight: this.data.playerRightStatus,
      timer: this.data.timer,
      pause: this.data.pause,
    };
    this.server.to(this.gameId).emit('status', status);
  }

  private sendUpdate() {
    const update: UpdateData = {
      playerLeftDynamic: this.data.playerLeftDynamic,
      playerRightDynamic: this.data.playerRightDynamic,
      ball: this.data.ball,
    };
    this.server.to(this.gameId).emit('update', update);
  }

  private sendScore() {
    const score: ScoreMessage = {
      score: this.data.score,
      actualRound: this.data.actualRound,
    };
    this.server.to(this.gameId).emit('score', score);
  }

  // ---------------------------------  LOOP METHODS  --------------------------------- //

  private startGameLoop() {
    if (!this.isGameLoopRunning) {
      this.isGameLoopRunning = true;
      this.lastTimestamp = performance.now();
      this.updateGameInterval = setInterval(() => this.gameLoop(), BACK_FPS);
    }
  }

  private async gameLoop() {
    const timestamp = performance.now();
    this.lastTimestamp = timestamp;

    if (this.data.status === 'Playing') {
      updatePong(this.data);
      this.sendUpdate();
    }
    if (this.data.updateScore) {
      this.sendScore();
      this.updateDBScore();
      this.data.updateScore = false;
    }
    if (this.data.sendStatus) {
      this.updateDBStatus();
      if (this.data.status === 'Finished') {
        this.stopGameLoop();
        await this.updateDBStats();
      }
      this.sendStatus();
      this.data.sendStatus = false;
    }
    if (this.data.updatePause) {
      this.updateDBPause();
      this.data.updatePause = false;
    }

    // Calculate FPS
    this.framesThisSecond++;
    if (timestamp > this.lastFpsUpdate + 1000) {
      this.currentFps = this.framesThisSecond;
      this.framesThisSecond = 0;
      this.lastFpsUpdate = timestamp;
    }
  }

  private stopGameLoop() {
    this.isGameLoopRunning = false;
    if (this.updateGameInterval) {
      clearTimeout(this.updateGameInterval);
      this.updateGameInterval = null;
    }
  }

  // -------------------------------  UPDATE DB METHODS  ------------------------------ //

  private async updateDBScore() {
    try {
      const scoreUpdate: ScoreUpdate = {
        actualRound: this.data.actualRound,
        left: 0,
        right: 0,
        leftRound: this.data.score.leftRound,
        rightRound: this.data.score.rightRound,
      };
      if (
        this.data.actualRound > 0 &&
        this.data.score.round[this.data.actualRound].left === 0 &&
        this.data.score.round[this.data.actualRound].right === 0
      ) {
        scoreUpdate.actualRound--;
      }
      scoreUpdate.left = this.data.score.round[scoreUpdate.actualRound].left;
      scoreUpdate.right = this.data.score.round[scoreUpdate.actualRound].right;
      await this.scoreService.updateScore(this.gameId, scoreUpdate);
    } catch (error) {
      this.logger.error(
        `Error Updating Score: ${error.message}`,
        'Pong - updateDBScore',
        error,
      );
    }
  }

  private async updateDBPause() {
    try {
      const pauseUpdate: PauseUpdate = {
        left: this.data.pause.left,
        right: this.data.pause.right,
      };
      await this.scoreService.updatePause(this.gameId, pauseUpdate);
    } catch (error) {
      this.logger.error(
        `Error Updating Pause: ${error.message}`,
        'Pong - updateDBPause',
        error,
      );
    }
  }

  private async updateDBStatus() {
    try {
      await this.gameService.updateStatus(
        this.gameId,
        this.data.status,
        this.data.result,
        this.data.actualRound,
      );
    } catch (error) {
      this.logger.error(
        `Error Updating Status: ${error.message}`,
        'Pong - updateDBStatus',
        error,
      );
    }
  }

  private async updateDBStats() {
    try {
      const update: StatsUpdate = {
        type: this.data.type,
        mode: this.data.mode,
        side: 'Left',
        winSide: this.data.winSide,
        score: this.data.score,
        nbRound: this.data.maxRound,
        maxPoint: this.data.maxPoint,
      };
      await this.statsService.updateStats(this.data.playerLeft.id, update);
      update.side = 'Right';
      await this.statsService.updateStats(this.data.playerRight.id, update);
    } catch (error) {
      this.logger.error(
        `Error Updating Stats: ${error.message}`,
        'Pong - updateDBStats',
        error,
      );
    }
  }

  // ---------------------------------  JOIN METHODS  --------------------------------- //

  private async joinAsPlayer(user: UserInfo) {
    if (user.id === this.gameDB.host) {
      this.joinAsHost(user);
    } else if (user.id === this.gameDB.opponent) {
      try {
        await this.joinAsOpponent(user);
      } catch (error) {
        this.logger.error(
          `Error Joining as opponent: ${error.message}`,
          'Pong - JoinAsOpponent',
          error,
        );
        throw new WsException('Error while joining as opponent');
      }
    }
    // Update status if ready to play
    if (
      this.playerLeft &&
      this.data.playerLeftStatus === 'Connected' &&
      this.playerRight &&
      this.data.playerRightStatus === 'Connected'
    ) {
      if (this.data.status === 'Not Started') {
        this.data.status = 'Playing';
        this.data.sendStatus = true;
        this.data.timer = defineTimer(TIMER_START, 'Start');
        this.startGameLoop();
      } else if (this.data.status === 'Stopped') {
        this.data.status = 'Playing';
        this.data.sendStatus = true;
        this.startGameLoop();
        this.data.timer = defineTimer(TIMER_RESTART, 'ReStart');
      }
    }
  }

  private joinAsHost(user: UserInfo) {
    user.isPlayer = true;
    if (this.gameDB.hostSide === 'Left') {
      if (!this.playerLeft.includes(user)) {
        this.playerLeft.push(user);
      }
      this.data.playerLeftStatus = 'Connected';
      if (this.disconnectLoopRunning === 'Left') this.stopDisconnectLoop();
    } else if (this.gameDB.hostSide === 'Right') {
      if (!this.playerRight.includes(user)) {
        this.playerRight.push(user);
      }
      this.data.playerRightStatus = 'Connected';
      if (this.disconnectLoopRunning === 'Right') this.stopDisconnectLoop();
    }
  }

  private async joinAsOpponent(user: UserInfo) {
    user.isPlayer = true;
    if (this.gameDB.hostSide === 'Left') {
      if (!this.playerRight.includes(user)) {
        this.playerRight.push(user);
      }
      if (this.data.playerRight.id === -1) {
        this.data.playerRight = await this.gameService.definePlayer(
          user.id,
          'Right',
          false,
        );
        this.sendPlayerData(this.data.playerRight);
      }
      this.data.playerRightStatus = 'Connected';
      if (this.disconnectLoopRunning === 'Left') this.stopDisconnectLoop();
    } else if (this.gameDB.hostSide === 'Right') {
      if (!this.playerLeft.includes(user)) {
        this.playerLeft.push(user);
      }
      if (this.data.playerLeft.id === -1) {
        this.data.playerLeft = await this.gameService.definePlayer(
          user.id,
          'Left',
          false,
        );
        this.sendPlayerData(this.data.playerLeft);
      }
      this.data.playerLeftStatus = 'Connected';
      if (this.disconnectLoopRunning === 'Left') this.stopDisconnectLoop();
    }
  }

  // --------------------------------  DISCONNECT METHODS  -------------------------------- //

  public async disconnect(user: UserInfo, manual: boolean): Promise<any> {
    const data: ReturnData = {
      success: false,
      message: '',
    };
    if (this.playerLeft.length > 0 && this.playerLeft[0].id === user.id) {
      this.playerLeft = this.playerLeft.filter(
        (player) => player.socket.id !== user.socket.id,
      );
      if (manual && this.data.status === 'Playing') this.rageQuit('Left');
      else if (this.playerLeft.length === 0) this.disconnectPlayer('Left');
    } else if (
      this.playerRight.length > 0 &&
      this.playerRight[0].id === user.id
    ) {
      this.playerRight = null;
      if (manual && this.data.status === 'Playing') this.rageQuit('Right');
      else if (this.playerLeft.length === 0) this.disconnectPlayer('Right');
    } else {
      if (this.spectators.length === 0) {
        data.message = 'No spectators in the game';
        return data;
      }
      this.spectators = this.spectators.filter(
        (spectator) => spectator !== user,
      );
    }
    user.socket.leave(this.gameId);
    data.success = true;
    data.message = 'User disconnected from game';
    return data;
  }

  private disconnectLoop(side: 'Left' | 'Right') {
    if (this.disconnectLoopRunning) {
      const actualTime = new Date().getTime();
      if (this.data.timer.reason !== 'Deconnection') {
        this.stopDisconnectLoop();
        return;
      } else if (actualTime > this.data.timer.end) {
        this.data.status = 'Finished';
        if (side === 'Left') {
          this.data.result =
            this.gameDB.hostSide === 'Left' ? 'Opponent' : 'Host';
          this.data.winSide = 'Right';
          this.data.score.disconnect = 'Left';
        } else if (side === 'Right') {
          this.data.result =
            this.gameDB.hostSide === 'Right' ? 'Opponent' : 'Host';
          this.data.winSide = 'Left';
          this.data.score.disconnect = 'Right';
        }
        this.data.sendStatus = true;
      } else {
        // continue checking every second
        setTimeout(() => {
          this.disconnectLoop(side);
        }, 1000);
      }
    }
  }

  private startDisconnectLoop(side: 'Left' | 'Right') {
    if (!this.disconnectLoopRunning) {
      this.disconnectLoopRunning = side;
      this.disconnectLoop(side);
    }
  }

  private stopDisconnectLoop() {
    this.disconnectLoopRunning = null;
  }

  private disconnectPlayer(side: 'Left' | 'Right') {
    if (side === 'Left') {
      this.data.playerLeftStatus = 'Disconnected';
      if (this.data.status === 'Playing') {
        this.data.status = 'Stopped';
        this.data.sendStatus = true;
        this.data.timer = defineTimer(
          TIMER_DECONNECTION,
          'Deconnection',
          this.data.playerLeft.name,
        );
        if (this.data.playerRightStatus === 'Connected')
          this.startDisconnectLoop('Left');
        else this.stopDisconnectLoop();
      }
    } else if (side === 'Right') {
      this.data.playerRightStatus = 'Disconnected';
      if (this.data.status === 'Playing') {
        this.data.status = 'Stopped';
        this.data.sendStatus = true;
        this.data.timer = defineTimer(
          TIMER_DECONNECTION,
          'Deconnection',
          this.data.playerRight.name,
        );
        if (this.data.playerLeftStatus === 'Connected')
          this.startDisconnectLoop('Right');
        else this.stopDisconnectLoop();
      }
    }
  }

  private async rageQuit(side: 'Left' | 'Right') {
    this.data.status = 'Finished';
    this.data.sendStatus = true;
    this.data.updateScore = true;
    if (side === 'Left') {
      this.data.result = this.gameDB.hostSide === 'Left' ? 'Opponent' : 'Host';
      this.data.winSide = 'Right';
      this.data.score.rageQuit = 'Left';
      await this.scoreService.updateRageQuit(this.gameId, 'Left');
    } else if (side === 'Right') {
      this.data.result = this.gameDB.hostSide === 'Right' ? 'Opponent' : 'Host';
      this.data.winSide = 'Left';
      this.data.score.rageQuit = 'Right';
      await this.scoreService.updateRageQuit(this.gameId, 'Right');
    }
  }
}
