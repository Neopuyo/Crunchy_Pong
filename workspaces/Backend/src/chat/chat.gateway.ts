/* eslint-disable prettier/prettier */
import {
  OnModuleInit,
  Req,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guard/wsJwt.guard';
import { verify } from 'jsonwebtoken';
import { newMsgDto } from './dto/newMsg.dto';
import { ChannelAuthGuard } from './guard/channelAuthGuard';
import { channelIdDto } from './dto/channelId.dto';
import { Channel } from 'src/utils/typeorm/Channel.entity';
import { EditChannelRelationDto } from '@/channels/dto/EditChannelRelation.dto';
import { JoinDto } from './dto/join.dto';
import { ClearNotifDto } from './dto/clearNotif.dto';
import { ChatService } from './service/chat.service';
import { ChannelService } from '@/channels/service/channel.service';
import { StatusService } from '@/statusService/status.service';
import { editChannelPasswordDto } from './dto/editChannelPassword.dto';
import { editChannelTypeDto } from './dto/editChannelType.dto';
import { AchievementService } from '@/achievement/service/achievement.service';
import { AchievementAnnonce } from '@transcendence/shared/types/Achievement.types';
import { LevelUpAnnonce } from '@transcendence/shared/types/Stats.types';
import { StatsService } from '@/stats/service/stats.service';

@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: [`http://${process.env.HOST_IP}:3000`, 'http://localhost:3000'],
  },
  namespace: '/chat',
  path: '/chat/socket.io',
})
export class ChatGateway implements OnModuleInit {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly chatService: ChatService,
    private readonly channelService: ChannelService,
    private readonly statsService: StatsService,
    private readonly statusService: StatusService,
  ) {}

  // Container of connected users : Map<socket, user id>
  private connectedUsers: Map<Socket, string> = new Map<Socket, string>();
  private notSendAchivementAnnonce: AchievementAnnonce[] = [];
  private notSendLevelUpAnnonce: LevelUpAnnonce[] = [];

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];

      try {
        const payload = verify(token, process.env.JWT_SECRET) as any;

        if (!payload.sub) {
          socket.disconnect();
          return;
        }

        this.connectedUsers.set(socket, payload.sub.toString());
        this.statusService.add(payload.sub.toString(), 'connected');

        this.chatService.joinAllMyChannels(socket, payload.sub);
        this.chatService.saveToken(token, payload.sub);
        if (this.notSendAchivementAnnonce.length > 0) {
          this.notSendAchivementAnnonce.forEach((achievement) => {
            if (achievement.userId === payload.sub.toString()) {
              this.server
                .to(socket.id)
                .emit('achievement', achievement.achievement);
              this.notSendAchivementAnnonce.splice(
                this.notSendAchivementAnnonce.indexOf(achievement),
                1,
              );
            }
          });
        }
        if (this.notSendLevelUpAnnonce.length > 0) {
          this.notSendLevelUpAnnonce.forEach((levelUp) => {
            if (levelUp.userId === payload.sub.toString()) {
              this.server.to(socket.id).emit('levelUp', levelUp.level);
              this.notSendLevelUpAnnonce.splice(
                this.notSendLevelUpAnnonce.indexOf(levelUp),
                1,
              );
            }
          });
        }

        socket.on('disconnect', () => {
          this.connectedUsers.delete(socket);

          // update status
          if (this.connectedUsers.size > 0) {
            let connected = false;

            for (const user of this.connectedUsers) {
              if (user[1] === payload.sub.toString()) {
                connected = true;
                break;
              }
            }

            if (!connected)
              this.statusService.add(payload.sub.toString(), 'disconnected');
          }

          if (
            process.env &&
            process.env.ENVIRONNEMENT &&
            process.env.ENVIRONNEMENT === 'dev'
          ) {
            console.log(`User with ID ${payload.sub} disconnected`); // [?]
            for (const connect of this.connectedUsers) {
              console.log(
                'Socket id: ',
                connect[0].id + ' , user id : ' + connect[1],
              );
            }
          }
        });

        if (process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === 'dev') {
          console.log('connected users = '); // [?]
          for (const connect of this.connectedUsers) {
            console.log(
              'Socket id: ',
              connect[0].id + ' , user id : ' + connect[1],
            );
          }
        }
      } catch (error) {
        this.log(error);
        socket.disconnect();
      }
    });

    setInterval(() => {
      const updateStatus = this.statusService.updateStatus;

      if (updateStatus.size > 0)
        this.server.emit('updateStatus', Object.fromEntries(updateStatus));

      this.statusService.remove(updateStatus);
    }, 1000);

    setInterval(() => {
      const achievementAnnonce = this.achievementService.achivementAnnonce;

      while (achievementAnnonce.length > 0) {
        const achievement = achievementAnnonce.shift();
        let send = false;
        this.connectedUsers.forEach((value, key) => {
          if (value === achievement.userId) {
            this.server.to(key.id).emit('achievement', achievement.achievement);
            send = true;
          }
        });
        if (!send) {
          this.notSendAchivementAnnonce.push(achievement);
        }
      }
    }, 1000);

    setInterval(() => {
      const levelUpAnnonce = this.statsService.levelUpAnnonce;

      while (levelUpAnnonce.length > 0) {
        const levelUp = levelUpAnnonce.shift();
        let send = false;
        this.connectedUsers.forEach((value, key) => {
          if (value === levelUp.userId) {
            this.server.to(key.id).emit('levelUp', levelUp.level);
            send = true;
          }
        });
        if (!send) {
          this.notSendLevelUpAnnonce.push(levelUp);
        }
      }
    }, 1000);
  }

  @UseGuards(ChannelAuthGuard)
  @SubscribeMessage('newMsg')
  async receiveNewMsg(@MessageBody() message: newMsgDto, @Request() req) {
    await this.chatService.receiveNewMsg(
      message,
      req.user.id,
      this.server,
      this.connectedUsers,
    );
  }

  @SubscribeMessage('disconnectClient')
  async disconnectClient(@Request() req, @ConnectedSocket() socket: Socket) {
    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString() && key !== socket) key.disconnect();
    }
  }

  @SubscribeMessage('getStatus')
  async getStatus(@Req() req) {
    return this.chatService.getStatus(this.statusService.status, req.user.id);
  }

  @SubscribeMessage('notif')
  async notif(
    @MessageBody()
    payload: {
      why: string;
    },
    @Req() req,
  ) {
    if (!payload) throw new WsException('no argument for notif');

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString())
        this.server.to(key.id).emit('notif', payload);
    }
  }

  @SubscribeMessage('getNotif')
  async getNotif(@Req() req) {
    return await this.chatService.getNotif(req.user.id);
  }

  @SubscribeMessage('getNotifMsg')
  async getNotifMsg(@Req() req) {
    return await this.chatService.getNotifMsg(req.user.id);
  }

  @SubscribeMessage('clearNotif')
  async clearNotif(@Req() req, @MessageBody() toClear: ClearNotifDto) {
    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.clearNotif(
      req.user.id,
      toClear,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('getLoginWithAvatar')
  async getLoginWithAvatar(@Req() req) {
    return await this.chatService.getLoginWithAvatar(req.user.id);
  }

  @SubscribeMessage('getChannel')
  async getChannel(@Req() req, @MessageBody() channelId: number) {
    if (!channelId) throw new WsException('no channel id');

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.getChannel(
      channelId,
      req.user.id,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('getChannelId')
  async getChannelId(@Req() req, @MessageBody() opponentId: number) {
    this.log(`'getChannelId' event, with opponentId: ${opponentId}`);

    if (!opponentId) throw new WsException('no opponent id');

    return await this.chatService.getChannelId(opponentId, req.user.id);
  }

  @SubscribeMessage('getChannels')
  async getChannels(@Request() req) {
    return await this.chatService.getChannels(req.user.id);
  }

  @SubscribeMessage('getChannelProfile')
  async getChannelProfile(@Request() req, @MessageBody() channelId: number) {
    if (!channelId) throw new WsException('no channel id');

    return await this.chatService.getChannelProfile(req.user.id, channelId);
  }

  @SubscribeMessage('getChannelsProfile')
  async getChannelsProfile(@MessageBody() userId: number) {
    if (!userId) throw new WsException('no given id');
    return await this.chatService.getChannelsProfile(userId);
  }

  @SubscribeMessage('getAllChannels')
  async getAllChannels(@Request() req) {
    return await this.chatService.getAllChannels(req.user.id);
  }

  @SubscribeMessage('getPongie')
  async getPongie(@Request() req, @MessageBody() pongieId: number) {
    if (!pongieId) throw new WsException('no pongie id');

    return await this.chatService.getPongie(req.user.id, pongieId);
  }

  @SubscribeMessage('getPongies')
  async getPongies(@MessageBody() userId: number) {
    if (!userId) throw new WsException('no given id');
    return await this.chatService.getPongies(userId, true);
  }

  @SubscribeMessage('getMyFriends')
  async getMyFriends(@MessageBody() userId: number) {
    if (!userId) throw new WsException('no given id');
    return await this.chatService.getPongies(userId, false, true);
  }

  @SubscribeMessage('getAllPongies')
  async getAllPongies(@Request() req) {
    return await this.chatService.getAllPongies(req.user.id);
  }

  @SubscribeMessage('addPongie')
  async addPongie(@MessageBody() pongieId: number, @Request() req) {
    if (!pongieId) throw new WsException('no pongie id');

    const pongieSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === pongieId.toString()) pongieSockets.push(key);
    }

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.addPongie(
      req.user.id,
      pongieId,
      pongieSockets,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('deletePongie')
  async deletePongie(@MessageBody() pongieId: number, @Request() req) {
    if (!pongieId) throw new WsException('no pongie id');

    const pongieSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === pongieId.toString()) pongieSockets.push(key);
    }

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.deletePongie(
      req.user.id,
      pongieId,
      pongieSockets,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('cancelInvitation')
  async cancelInvitation(@MessageBody() pongieId: number, @Request() req) {
    if (!pongieId) throw new WsException('no pongie id');

    const pongieSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === pongieId.toString()) pongieSockets.push(key);
    }

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.cancelInvitation(
      req.user.id,
      pongieId,
      pongieSockets,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('cancelBlacklist')
  async cancelBlacklist(@MessageBody() pongieId: number, @Request() req) {
    if (!pongieId) throw new WsException('no pongie id');

    const pongieSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === pongieId.toString()) pongieSockets.push(key);
    }

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.cancelBlacklist(
      req.user.id,
      pongieId,
      pongieSockets,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('blacklist')
  async blacklist(@MessageBody() pongieId: number, @Request() req) {
    if (!pongieId) throw new WsException('no pongie id');

    const pongieSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === pongieId.toString()) pongieSockets.push(key);
    }

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.blacklist(
      req.user.id,
      pongieId,
      pongieSockets,
      userSockets,
      this.server,
    );
  }

  @SubscribeMessage('join')
  async join(@MessageBody() payload: JoinDto, @Request() req) {
    if (
      payload.channelType === 'protected' &&
      payload.isCreation &&
      (!payload.password || payload.password.length === 0)
    )
      throw new WsException('no password');

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    if (payload.channelType === 'privateMsg') {
      const pongieSockets: Socket[] = [];

      for (const [key, val] of this.connectedUsers) {
        if (val === payload.id.toString()) pongieSockets.push(key);
      }

      return await this.chatService.joinPongie(
        req.user.id,
        payload.id,
        userSockets,
        pongieSockets,
      );
    } else
      return await this.chatService.joinChannel(
        req.user.id,
        payload.id,
        payload.channelName,
        payload.channelType,
        userSockets,
        this.server,
        payload.password,
      );
  }

  @SubscribeMessage('leave')
  async leave(@MessageBody() channelId: number, @Request() req) {
    if (!channelId) throw new WsException('no given id');

    const userSockets: Socket[] = [];

    for (const [key, val] of this.connectedUsers) {
      if (val === req.user.id.toString()) userSockets.push(key);
    }

    return await this.chatService.leave(
      req.user.id,
      channelId,
      userSockets,
      this.server,
    );
  }

  @UseGuards(ChannelAuthGuard)
  @SubscribeMessage('getMessages')
  async getMessages(@MessageBody() payload: channelIdDto, @Req() req) {
    return await this.chatService.getMessages(payload.channelId, req.user.id);
  }

  @UseGuards(ChannelAuthGuard)
  @SubscribeMessage('getChannelName')
  async getChannelName(@MessageBody() payload: channelIdDto) {
    this.log(`'getChannelName' event, with channelId: ${payload.channelId}`);
    const channel: Channel = await this.chatService.getChannelById(
      payload.channelId,
    );
    return {
      success: channel ? true : false,
      message: channel ? channel.name : '',
    };
  }

  @SubscribeMessage('editRelation')
  async sendEditRelationEvents(
    @MessageBody() payload: EditChannelRelationDto,
    @Request() req,
  ): Promise<ReturnData> {
    this.log(`editRelation called by user[${req.user.id}]`);

    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      // [0] check permissions in user relation
      const repAutho = await this.channelService.checkEditAuthorization(
        req.user.id,
        payload,
      );
      if (!repAutho.success)
        throw new Error(
          repAutho.message ? repAutho.message : 'checkEditAuthorization failed',
        );

      // [1] update socket JOIN room if needed by editRelation
      const repJoin = await this.chatService.joinLeaveRoomProcByEditRelation(
        false,
        payload,
        this.connectedUsers,
      );
      if (!repJoin.success)
        throw new Error(repJoin.message ? repJoin.message : 'proc join failed');

      // [2] follow up to update channel profile + handleEditRelation in <ChatChannel />
      const updatedPayload1 = {
        ...payload,
        senderId: req.user.id,
      };
      this.server
        .to('channel:' + payload.channelId)
        .emit('editRelation', updatedPayload1);

      // [3] send Server Notif message into the channel (not privateMsg Channel !)
      const updatedPayload2 = {
        ...payload,
        server: this.server,
        from: req.user.id,
        connectedUsers: this.connectedUsers,
      };

      const repNotif =
        await this.chatService.sendEditRelationNotif(updatedPayload2);
      if (!repNotif.success) {
        throw new Error(
          repNotif.message ? repNotif.message : 'sendEditRelationNotif failed',
        );
      } else {
        this.log(`SendEditRelationNotif in channel[${payload.channelId}]`);
      }

      // [4] update socket LEAVE room if needed by editRelations
      const repLeave = await this.chatService.joinLeaveRoomProcByEditRelation(
        true,
        payload,
        this.connectedUsers,
      );
      if (!repLeave.success)
        throw new Error(
          repLeave.message ? repLeave.message : 'proc Leave failed',
        );

      // [5] Force update Channel to targeted user (ie: for invitations)
      this.chatService.forceUpdateChannel(payload.userId, this.connectedUsers);

      rep.success = true;
    } catch (error: any) {
      this.log(`edit Relation Error : ${error.message}`);

      rep.error = error;
      rep.message = error.message
        ? error.message
        : "unknown error in chatGateway => @SubscribeMessage('editRelation')";
    }

    return rep;
  }

  @SubscribeMessage('forceJoinPrivateMsgChannel')
  async forceJoinPrivateMsgChannel(
    @Request() req,
    @MessageBody() payload: channelIdDto,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const repJoin = await this.channelService.forceJoinPrivateMsgChannel(
        req.user.id,
        payload.channelId,
        this.connectedUsers,
      );
      if (!repJoin.success) {
        throw new Error(repJoin.message);
      }
      rep.success = repJoin.success;
    } catch (error: any) {
      this.log(`forceJoinPrivateMsgChannel error : ${error.message}`);
      rep.error = error;
      rep.message = error.message;
    }

    return rep;
  }

  @UseGuards(ChannelAuthGuard)
  @SubscribeMessage('editChannelPassword')
  async editChannelPassword(
    @Request() req,
    @MessageBody() payload: editChannelPasswordDto,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const repEdit: ReturnData & { isProtected: boolean } =
        await this.channelService.editChannelPassword(
          req.user.id,
          payload.channelId,
          payload.password,
        );
      if (!repEdit.success) {
        throw new Error(repEdit.message);
      }

      if (repEdit.isProtected) {
        const endContent: string =
          'changed the channel password to ' + payload.password;
        this.chatService.sendServerNotifMsgPublic(
          payload.channelId,
          req.user.id,
          endContent,
          this.server,
        );
      }

      rep.success = repEdit.success;
    } catch (error: any) {
      this.log(`editChannelPassword error : ${error.message}`);
      rep.error = error;
      rep.message = error.message;
    }

    return rep;
  }

  @SubscribeMessage('verifyChannelPassword')
  async verifyChannelPassword(
    @Request() req,
    @MessageBody() payload: editChannelPasswordDto,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const repVerify: ReturnData =
        await this.channelService.verifyChannelPassword(
          req.user.id,
          payload.channelId,
          payload.password,
        );
      if (!repVerify.success) {
        throw new Error(repVerify.message);
      }

      rep.success = repVerify.success;
      if (rep.success)
        this.channelService.sendUpdateChannelnotif(
          payload.channelId,
          this.connectedUsers,
          this.server,
        );
    } catch (error: any) {
      this.log(`verifyChannelPassword error : ${error.message}`);
      rep.error = error;
      rep.message = error.message;
    }

    return rep;
  }

  @UseGuards(ChannelAuthGuard)
  @SubscribeMessage('editChannelType')
  async editChannelType(
    @Request() req,
    @MessageBody() payload: editChannelTypeDto,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const repEdit = await this.channelService.editChannelType(
        req.user.id,
        payload.channelId,
        payload.type,
      );
      if (!repEdit.success) {
        throw new Error(repEdit.message);
      }

      let endContent: string = 'changed channel type to ' + payload.type;
      if (payload.type === 'protected') {
        endContent += ', password is ' + repEdit.password;
      }

      this.chatService.sendServerNotifMsgPublic(
        payload.channelId,
        req.user.id,
        endContent,
        this.server,
      );

      this.channelService.sendUpdateChannelnotif(
        payload.channelId,
        this.connectedUsers,
        this.server,
      );

      rep.success = repEdit.success;
    } catch (error: any) {
      this.log(`editChannelType error : ${error.message}`);
      rep.error = error;
      rep.message = error.message;
    }

    return rep;
  }

  @SubscribeMessage('isUserInChannel')
  async isUserInChannel(@Request() req, @MessageBody() payload: channelIdDto) {
    try {
      const isInto = await this.channelService.isUserInChannel(
        req.user.id,
        payload.channelId,
      );
      return isInto;
    } catch (e: any) {
      this.log(`isUserInChannel error : ${e.message}`);
      return false;
    }
  }

  @SubscribeMessage('joinButton')
  async joinButtonActive(@MessageBody() gameId: string) {
    return await this.chatService.joinButtonActive(gameId);
  }

  // tools

  private log(message?: any) {
    const green = '\x1b[32m';
    const stop = '\x1b[0m';

    if (
      !process.env ||
      !process.env.ENVIRONNEMENT ||
      process.env.ENVIRONNEMENT !== 'dev'
    )
      return;

    process.stdout.write(green + '[chat gateway]  ' + stop);
    console.log(message);
  }
}
