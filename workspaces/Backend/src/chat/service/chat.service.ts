/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { ChannelService } from '@/channels/service/channel.service';
import { UsersService } from 'src/users/service/users.service';
import { CryptoService } from 'src/utils/crypto/crypto';
import { Channel } from 'src/utils/typeorm/Channel.entity';
import { User } from 'src/utils/typeorm/User.entity';
import { UserChannelRelation } from 'src/utils/typeorm/UserChannelRelation';
import { UserPongieRelation } from 'src/utils/typeorm/UserPongieRelation';
import { Not, Repository } from 'typeorm';
import { channelDto } from '../dto/channel.dto';
import { Socket, Server } from 'socket.io';
import { sendMsgDto } from '../dto/sendMsg.dto';
import { newMsgDto } from '../dto/newMsg.dto';
import { MessagesService } from 'src/messages/messages.service';
import { SocketToken } from '@/utils/typeorm/SocketToken.entity';
import { getPongieDto } from '../dto/getPongie.dto';
import { EditChannelRelationDto } from '@/channels/dto/EditChannelRelation.dto';
import { Notif } from '@/utils/typeorm/Notif.entity';
import { ClearNotifDto } from '../dto/clearNotif.dto';
import { NotifMessages } from '@/utils/typeorm/NotifMessages.entity';
import { MakeMessage } from '@/messages/dto/makeMessage';
import { Game } from '@/utils/typeorm/Game.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,

    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,

    @InjectRepository(UserPongieRelation)
    private readonly userPongieRelation: Repository<UserPongieRelation>,

    @InjectRepository(UserChannelRelation)
    private readonly userChannelRelation: Repository<UserChannelRelation>,

    @InjectRepository(SocketToken)
    private readonly socketTokenRepository: Repository<SocketToken>,

    @InjectRepository(Notif)
    private readonly notifRepository: Repository<Notif>,

    @InjectRepository(NotifMessages)
    private readonly notifMessagesRepository: Repository<NotifMessages>,

    private readonly channelService: ChannelService,
    private readonly cryptoService: CryptoService,
    private readonly messageService: MessagesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async saveToken(token: string, userId: number) {
    try {
      const value = await this.cryptoService.encrypt(token);
      const tokenEntity = new SocketToken();
      tokenEntity.value = value;
      tokenEntity.userId = userId;

      await this.socketTokenRepository.save(tokenEntity);
    } catch (error) {
      this.log(error);
    }
  }

  async getStatus(updateStatus: Map<string, string>, userId: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      if (!user) throw new Error('no user found');

      return Object.fromEntries(updateStatus);
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getNotif(userId: number) {
    try {
      const user: User = await this.usersService.getUserById(userId);

      if (!user) throw new WsException('no user found');

      return user.notif;
    } catch (error) {
      this.log('ChatGateway getNotif() error : ' + error.message);
      throw new WsException(error.message);
    }
  }

  async getNotifMsg(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['notif', 'notif.notifMessages'],
      });

      if (!user) throw new WsException('no user found');

      let notifMessages = user.notif.notifMessages;

      if (notifMessages.length !== 0) {
        notifMessages = await Promise.all(
          notifMessages.map(async (notif) => {
            const relation = await this.userChannelRelation.findOne({
              where: { userId: userId, channelId: notif.channelId },
            });

            if (relation && relation.isBanned) return;

            return notif;
          }),
        );
      }

      notifMessages = notifMessages.filter((notif) => notif);

      return notifMessages;
    } catch (error) {
      this.log(error);
      throw new WsException(error.message);
    }
  }

  async clearNotif(
    userId: number,
    toClear: ClearNotifDto,
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserById(userId);

      if (!user) throw new WsException('no user found');

      if (toClear.which === 'redPongies') {
        const updatedNotif = user.notif.redPongies.filter(
          (id) => id !== toClear.id,
        );
        await this.notifRepository.update(user.notif.id, {
          redPongies: updatedNotif,
        });

        if (userSockets.length !== 0) {
          for (const socket of userSockets) {
            server.to(socket.id).emit('notif', {
              why: 'updatePongies',
            });
          }
        }
      } else if (toClear.which === 'messages') {
        const notifUser = user.notif;

        const notif = await this.notifRepository.findOne({
          where: { id: notifUser.id },
          relations: ['notifMessages'],
        });

        const notifMsg = notif.notifMessages.find(
          (notif) => notif.channelId === toClear.id,
        );

        if (notifMsg) await this.notifMessagesRepository.remove(notifMsg);

        if (userSockets.length !== 0) {
          for (const socket of userSockets) {
            server.to(socket.id).emit('notifMsg');
          }
        }
      }
    } catch (error) {
      this.log(error.message);
      throw new WsException(error.message);
    }
  }

  async getLoginWithAvatar(userId: number) {
    try {
      const user = await this.usersService.getUserAvatar(userId);

      if (!user) throw new Error('no user found');

      if (user.avatar.decrypt)
        user.avatar.image = await this.cryptoService.decrypt(user.avatar.image);

      return {
        login: user.login,
        avatar: user.avatar,
      };
    } catch (error) {
      this.log(error);
      throw new WsException(error.message);
    }
  }

  async getChannels(userId: number) {
    try {
      const relations = await this.userChannelRelation.find({
        where: { userId: userId, isBanned: false },
        relations: [
          'channel',
          'channel.avatar',
          'channel.lastMessage',
          'channel.lastMessage.user',
        ],
      });

      if (!relations) return [];

      let channels = await Promise.all(
        relations.map(async (relation) => {
          const channel = relation.channel;
          let pongieId: number;

          if (
            channel.type === 'private' &&
            !relation.invited &&
            !relation.joined
          )
            return;

          if (channel.type === 'privateMsg') {
            const ids = channel.name.split(' ');
            if (userId.toString() === ids[0]) pongieId = parseInt(ids[1]);
            else pongieId = parseInt(ids[0]);

            const pongie = await this.usersService.getUserAvatar(pongieId);
            if (!pongie) throw new Error('no pongie found');

            if (pongie.avatar.decrypt)
              pongie.avatar.image = await this.cryptoService.decrypt(
                pongie.avatar.image,
              );

            channel.avatar = pongie.avatar;
            channel.name = pongie.login;
          }

          if (relation.joined === false || relation.isBanned === true) {
            channel.lastMessage = null;
          }

          if (!relation.isBoss && channel && channel.password)
            channel.password = '';

          // delete last message if user banned
          const lastUser = channel.lastMessage?.user;

          if (lastUser && channel.type !== 'privateMsg') {
            const relationPongie = await this.userPongieRelation.findOne({
              where: { userId: userId, pongieId: lastUser.id },
            });

            if (relationPongie) {
              if (relationPongie.isBlacklisted || relationPongie.hasBlacklisted)
                channel.lastMessage = null;
            }
          }

          return {
            ...channel,
            isBoss: relation.isBoss,
            isChanop: relation.isChanOp,
            joined: relation.joined,
            invited: relation.invited,
            isBanned: relation.isBanned,
            muted: relation.muted,
            statusPongieId: pongieId,
          };
        }),
      );

      // [?]
      channels = channels.filter((channel) => channel);

      return channels;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getChannelsProfile(userId: number) {
    try {
      const relations = await this.userChannelRelation.find({
        where: { userId: userId, isBanned: false },
        relations: ['channel', 'channel.avatar'],
      });

      if (!relations) return [];

      let channels = await Promise.all(
        relations.map(async (relation) => {
          const channel = relation.channel;

          if (channel.type === 'privateMsg') return;

          return {
            ...channel,
            joined: relation.joined,
            invited: relation.invited,
            isBanned: relation.isBanned,
            isChanop: relation.isChanOp,
          };
        }),
      );

      channels = channels.filter((channel) => channel);

      return channels;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getChannelProfile(userId: number, channelId: number) {
    try {
      const channel = await this.channelRepository.findOne({
        where: { id: channelId },
        relations: ['avatar'],
      });

      if (!channel)
        return {
          error: 'no channel found',
        };

      if (channel.avatar?.decrypt && channel.avatar?.image?.length > 0) {
        channel.avatar.image = await this.cryptoService.decrypt(
          channel.avatar.image,
        );
      }

      const myChannel = await this.userChannelRelation.findOne({
        where: { userId: userId, channelId: channelId },
      });

      if (myChannel) {
        if (myChannel.isBanned)
          return {
            error: 'banned',
          };

        if (
          channel.type === 'private' &&
          (!myChannel.joined || !myChannel.invited)
        )
          return {
            error: 'private channel',
          };

        return {
          id: channel.id,
          name: channel.name,
          avatar: channel.avatar,
          type: channel.type,
          isBoss: myChannel.isBoss,
          isChanOp: myChannel.isChanOp,
          joined: myChannel.joined,
          invited: myChannel.invited,
          isBanned: myChannel.isBanned,
          muted: myChannel.muted,
        };
      }

      return {
        id: channel.id,
        name: channel.name,
        avatar: channel.avatar,
        type: channel.type,
        isBoss: false,
        isChanOp: false,
        joined: false,
        invited: false,
        isBanned: false,
        muted: false,
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getChannel(
    channelId: number,
    userId: number,
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserChannels(userId);
      const channel = await this.channelService.getChannelById(channelId);
      let   pongieId: number = 0;

      if (!user) throw new Error('no channel or user found');

      if (!channel)
        return {
          success: false,
          error: 'no channel',
          channel: null,
        };

      // check if relation exists
      let relation = await this.userChannelRelation.findOne({
        where: { channelId: channelId, userId: userId },
        relations: ['user', 'channel'],
      });

      if (!relation) {
        await this.usersService.updateUserChannels(user, channel);
        relation = await this.userChannelRelation.findOne({
          where: { channelId: channelId, userId: userId },
          relations: ['user', 'channel'],
        });
      }

      if (!relation) throw new Error('cannot create relation');

      if (relation.isBanned)
        return {
          success: false,
          error: 'banned',
          channel: null,
        };

      if (channel.type === 'privateMsg') {
        const ids = channel.name.split(' ');

        if (ids.length !== 2) throw new Error('error in channel name');

        if (ids[0] === userId.toString())
          pongieId = parseInt(ids[1]);
        else
          pongieId = parseInt(ids[0]);

        const pongie = await this.usersService.getUserAvatar(
          pongieId,
        );

        if (pongie.avatar.decrypt)
          pongie.avatar.image = await this.cryptoService.decrypt(
            pongie.avatar.image,
          );

        channel.avatar = pongie.avatar;
        channel.name = pongie.login;
      }

      if (!relation.joined && channel.type === 'private')
        return {
          success: false,
          error: 'private',
          channel: null,
        };

      if (!relation.joined && channel.type === 'protected')
        return {
          success: false,
          error: 'protected',
          channel: { ...channel, password: '' },
        };

      if (channel.type !== 'privateMsg' && !relation.joined) {
        const date = new Date();
        const content = `${user.login} just joined the channel`;

        const msg: sendMsgDto = {
          content: content,
          date: date.toISOString(),
          sender: null,
          channelName: relation.channel.name,
          channelId: channelId,
          isServerNotif: true,
        };

        const saveServerNotif: MakeMessage = {
          content: content,
          channel: relation.channel,
          isServerNotif: true,
        };

        try {
          this.messageService.addMessage(saveServerNotif);
        } catch (dbError) {
          this.log('saving notif in db failed : ' + dbError.message);
        }

        server.to('channel:' + channelId).emit('sendMsg', msg);
        'channel:' + channelId;
      }

      relation.joined = true;
      await this.userChannelRelation.save(relation);

      server.to('channel:' + channelId).emit('notif', {
        why: 'updateChannels',
      });

      if (userSockets.length >= 1) {
        for (const socket of userSockets) {
          socket.join('channel:' + channel.id);
        }
      }

      // Only channel Master can get channel password
      if (relation && channel && channel.password && !relation.isBoss) {
        channel.password = '';
      }

      const channelRelation = {
        ...channel,
        joined: relation.joined,
        isBanned: relation.isBanned,
        invited: relation.invited,
        isChanOp: relation.isChanOp,
        muted: relation.muted,
        statusPongieId: pongieId,
      };

      return {
        success: true,
        error: '',
        channel: channelRelation,
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getChannelId(opponentId: number, userId: number) {
    try {

      const user = await this.usersService.getUserChannels(userId);
      const pongie = await this.usersService.getUserChannels(opponentId);

      if (!pongie || !userId) throw new Error('no user found');

      // find name of the channel (both ids)
      const channelName =
        userId < opponentId
          ? userId + ' ' + opponentId
          : opponentId + ' ' + userId;

      let channel = await this.channelService.getChannelByName(
        channelName,
        true,
      );

      if (!channel) {

        this.log(`user[${user.login}] + pongie[${pongie.login}] ==> need creation of channel [${channelName}]`);

        channel = await this.channelService.addChannel(
          channelName,
          'privateMsg',
        );
      }

      if (!channel)
        throw new Error('no channel');

      // check if relation exists for both pongers
      let relationUser = await this.userChannelRelation.findOne({
        where: { channelId: channel.id, userId: userId },
        relations: ['user', 'channel'],
      });

      if (!relationUser) {
        await this.usersService.updateUserChannels(user, channel);
        relationUser = await this.userChannelRelation.findOne({
          where: { channelId: channel.id, userId: userId },
          relations: ['user', 'channel'],
        });
      }

      let relationPongie = await this.userChannelRelation.findOne({
        where: { channelId: channel.id, userId: pongie.id },
        relations: ['user', 'channel'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserChannels(pongie, channel);
        relationPongie = await this.userChannelRelation.findOne({
          where: { channelId: channel.id, userId: pongie.id },
          relations: ['user', 'channel'],
        });
      }

      if (!relationPongie || !relationUser)
        throw new Error('cannot create relation');

      return channel.id;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getAllChannels(id: number): Promise<channelDto[]> {
    try {
      // get all channels
      const channels = await this.channelRepository.find({
        relations: ['avatar'],
        where: { type: Not('privateMsg') },
      });

      // get channels already joined
      const myRelations = await this.userChannelRelation.find({
        where: { userId: id },
        relations: ['channel'],
      });

      let all = channels.map((channel) => {
        let see = true;

        if (channel.type === 'private') see = false;

        const myRelation = myRelations.find(
          (relation) => relation.channel.id === channel.id,
        );

        if (myRelation && myRelation.isBanned)
          return null;

        if (myRelation && channel.type === 'private' && (
            myRelation.joined || myRelation.invited))
          see = true;

        if (myRelation && see)
          return {
            id: channel.id,
            name: channel.name,
            avatar: channel.avatar,
            type: channel.type,
            joined: myRelation.joined,
            invited: myRelation.invited,
            isBanned: myRelation.isBanned,
            isChanOp: myRelation.isChanOp,
            muted: myRelation.muted,
          };

        if (see)
          return {
            id: channel.id,
            name: channel.name,
            avatar: channel.avatar,
            type: channel.type,
            joined: false,
            invited: false,
            isBanned: false,
            isChanOp: false,
            muted: false,
          };

        return null;
      });

      all = all.filter((channel) => channel);

      return all;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getAllPongies(id: number): Promise<getPongieDto[]> {
    try {
      let pongies = await this.userRepository.find({
        where: { verified: true },
        relations: ['avatar'],
      });

      pongies = pongies.filter((pongie) => pongie.id !== id);
      pongies = pongies.filter((pongie) => pongie.login && pongie.login !== '');

      const myPongies: getPongieDto[] = await this.getPongies(id, false);

      let all = await Promise.all(
        pongies.map(async (pongie) => {
          const myPongie = myPongies.find(
            (myPongie) => myPongie.id === pongie.id,
          );

          if (myPongie) {
            if (myPongie && myPongie.isBlacklisted) return;

            return {
              id: myPongie.id,
              login: myPongie.login,
              avatar: myPongie.avatar,
              isFriend: myPongie.isFriend,
              isInvited: myPongie.isInvited,
              hasInvited: myPongie.hasInvited,
              isBlacklisted: myPongie.isBlacklisted,
              hasBlacklisted: myPongie.hasBlacklisted,
            };
          }

          if (pongie.avatar?.decrypt && pongie.avatar?.image?.length > 0) {
            pongie.avatar.image = await this.cryptoService.decrypt(
              pongie.avatar.image,
            );
          }

          return {
            id: pongie.id,
            login: pongie.login,
            avatar: pongie.avatar,
            isFriend: false,
            isInvited: false,
            hasInvited: false,
            isBlacklisted: false,
            hasBlacklisted: false,
          };
        }),
      );

      all = all.filter((pongie) => pongie);

      return all;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getPongie(userId: number, pongieId: number) {
    try {
      const pongie = await this.userRepository.findOne({
        where: { verified: true, id: pongieId },
        relations: ['avatar'],
      });

      if (!pongie)
        return {
          error: 'no pongie found',
        };

      if (pongie.avatar?.decrypt && pongie.avatar?.image?.length > 0) {
        pongie.avatar.image = await this.cryptoService.decrypt(
          pongie.avatar.image,
        );
      }

      const myPongie = await this.userPongieRelation.findOne({
        where: { userId: userId, pongieId: pongieId },
      });

      if (myPongie) {
        if (myPongie.isBlacklisted)
          return {
            error: 'blacklisted',
          };

        return {
          id: pongie.id,
          login: pongie.login,
          avatar: pongie.avatar,
          isFriend: myPongie.isFriend,
          isInvited: myPongie.isInvited,
          hasInvited: myPongie.hasInvited,
          isBlacklisted: myPongie.isBlacklisted,
          hasBlacklisted: myPongie.hasBlacklisted,
        };
      }

      return {
        id: pongie.id,
        login: pongie.login,
        avatar: pongie.avatar,
        isFriend: false,
        isInvited: false,
        hasInvited: false,
        isBlacklisted: false,
        hasBlacklisted: false,
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getPongies(id: number, blacklisted: boolean, friends: boolean = false): Promise<getPongieDto[]> {
    try {
      const relations = await this.userPongieRelation.find({
        where: { userId: id },
        relations: ['pongie', 'pongie.avatar'],
      });

      if (!relations) return [];

      let all = await Promise.all(
        relations.map(async (relation) => {
          if (blacklisted && relation.isBlacklisted) return;

          if (friends && !relation.isFriend) return;

          if (
            relation.pongie.avatar?.decrypt &&
            relation.pongie.avatar?.image?.length > 0
          ) {
            relation.pongie.avatar.image = await this.cryptoService.decrypt(
              relation.pongie.avatar.image,
            );
          }
          return {
            id: relation.pongieId,
            login: relation.pongie.login,
            avatar: relation.pongie.avatar,
            isFriend: relation.isFriend,
            isInvited: relation.isInvited,
            hasInvited: relation.hasInvited,
            isBlacklisted: relation.isBlacklisted,
            hasBlacklisted: relation.hasBlacklisted,
          };
        }),
      );

      all = all.filter((pongie) => pongie);

      return all;
    } catch (error) {
      this.log(error);
      throw new WsException(error.message);
    }
  }

  async deletePongie(
    userId: number,
    pongieId: number,
    pongieSockets: Socket[],
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserPongies(userId);
      const pongie = await this.usersService.getUserPongies(pongieId);

      if (!user || !pongie) throw new Error('no user found');

      let relationUser = await this.userPongieRelation.findOne({
        where: { userId: userId, pongieId: pongieId },
        relations: ['user', 'pongie'],
      });

      if (!relationUser) {
        await this.usersService.updateUserPongies(user, pongie);
        relationUser = await this.userPongieRelation.findOne({
          where: { userId: userId, pongieId: pongieId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationUser) throw new Error('cannot create relation');

      let relationPongie = await this.userPongieRelation.findOne({
        where: { userId: pongieId, pongieId: userId },
        relations: ['user', 'pongie'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserPongies(pongie, user);
        relationPongie = await this.userPongieRelation.findOne({
          where: { userId: pongieId, pongieId: userId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationPongie) throw new Error('cannot create relation');

      relationUser.isFriend = false;
      relationPongie.isFriend = false;
      relationUser.isInvited = false;
      relationPongie.isInvited = false;
      relationUser.hasInvited = false;
      relationPongie.hasInvited = false;

      await this.userPongieRelation.save(relationUser);
      await this.userPongieRelation.save(relationPongie);

      const updatedRedPongies = pongie.notif.redPongies.filter(
        (id) => id !== user.id,
      );

      await this.notifRepository.update(pongie.notif.id, {
        redPongies: updatedRedPongies,
      });

      if (pongieSockets.length !== 0) {
        for (const socket of pongieSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
        }
      }

      if (userSockets.length !== 0) {
        for (const socket of userSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      this.log(error);
      throw new WsException('cannot delete pongie');
    }
  }

  async cancelInvitation(
    userId: number,
    pongieId: number,
    pongieSockets: Socket[],
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserPongies(userId);
      const pongie = await this.usersService.getUserPongies(pongieId);

      if (!user || !pongie) throw new Error('no user found');

      let relationUser = await this.userPongieRelation.findOne({
        where: { userId: userId, pongieId: pongieId },
        relations: ['user', 'pongie'],
      });

      if (!relationUser) {
        await this.usersService.updateUserPongies(user, pongie);
        relationUser = await this.userPongieRelation.findOne({
          where: { userId: userId, pongieId: pongieId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationUser) throw new Error('cannot create relation');

      let relationPongie = await this.userPongieRelation.findOne({
        where: { userId: pongieId, pongieId: userId },
        relations: ['user', 'pongie'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserPongies(pongie, user);
        relationPongie = await this.userPongieRelation.findOne({
          where: { userId: pongieId, pongieId: userId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationPongie) throw new Error('cannot create relation');

      relationUser.isInvited = false;
      relationPongie.isInvited = false;
      relationUser.hasInvited = false;
      relationPongie.hasInvited = false;

      await this.userPongieRelation.save(relationUser);
      await this.userPongieRelation.save(relationPongie);

      const updatedRedPongies = pongie.notif.redPongies.filter(
        (id) => id !== user.id,
      );
      await this.notifRepository.update(pongie.notif.id, {
        redPongies: updatedRedPongies,
      });

      if (pongieSockets.length !== 0) {
        for (const socket of pongieSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
        }
      }

      if (userSockets.length !== 0) {
        for (const socket of userSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      this.log(error);
      throw new WsException('cannot delete pongie');
    }
  }

  async cancelBlacklist(
    userId: number,
    pongieId: number,
    pongieSockets: Socket[],
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserPongies(userId);
      const pongie = await this.usersService.getUserPongies(pongieId);

      if (!user || !pongie) throw new Error('no user found');

      let relationUser = await this.userPongieRelation.findOne({
        where: { userId: userId, pongieId: pongieId },
        relations: ['user', 'pongie'],
      });

      if (!relationUser) {
        await this.usersService.updateUserPongies(user, pongie);
        relationUser = await this.userPongieRelation.findOne({
          where: { userId: userId, pongieId: pongieId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationUser) throw new Error('cannot create relation');

      let relationPongie = await this.userPongieRelation.findOne({
        where: { userId: pongieId, pongieId: userId },
        relations: ['user', 'pongie'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserPongies(pongie, user);
        relationPongie = await this.userPongieRelation.findOne({
          where: { userId: pongieId, pongieId: userId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationPongie) throw new Error('cannot create relation');

      relationUser.hasBlacklisted = false;
      relationPongie.isBlacklisted = false;

      await this.userPongieRelation.save(relationUser);
      await this.userPongieRelation.save(relationPongie);

      if (relationPongie.isFriend || relationPongie.isInvited)
        await this.notifRepository.update(pongie.notif.id, {
          redPongies: [...pongie.notif.redPongies, user.id],
        });

      // update relation channel privateMsg
      const channelName =
        userId < pongieId ? userId + ' ' + pongieId : pongieId + ' ' + userId;

      const channel = await this.channelService.getChannelByName(
        channelName,
        true,
      );

      let relationChannelUser: UserChannelRelation;
      let relationChannelPongie: UserChannelRelation;

      if (channel) {
        // update relations user channel
        relationChannelUser = await this.userChannelRelation.findOne({
          where: { userId: userId, channelId: channel.id },
          relations: ['user', 'channel'],
        });

        if (relationChannelUser) {
          relationChannelUser.isBanned = false;
          await this.userChannelRelation.save(relationChannelUser);
        }

        // update relations pongie channel
        relationChannelPongie = await this.userChannelRelation.findOne({
          where: { userId: pongieId, channelId: channel.id },
          relations: ['user', 'channel'],
        });

        if (relationChannelPongie) {
          relationChannelPongie.isBanned = false;
          await this.userChannelRelation.save(relationChannelPongie);
        }
      }

      if (pongieSockets.length !== 0) {
        for (const socket of pongieSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
          server.to(socket.id).emit('notif', {
            why: 'updateChannels',
          });
          server.to(socket.id).emit('notifMsg');

          if (channel) {
            socket.join('channel:' + channel.id);
            server.to(socket.id).emit('editRelation', {
              channelId: channel.id,
              userId: pongie.id,
              senderId: user.id,
              newRelation: relationChannelPongie,
            });
          }
        }
      }

      if (userSockets.length !== 0) {
        for (const socket of userSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
          server.to(socket.id).emit('notif', {
            why: 'updateChannels',
          });
          server.to(socket.id).emit('notifMsg');

          if (channel) {
            socket.join('channel:' + channel.id);
            server.to(socket.id).emit('editRelation', {
              channelId: channel.id,
              userId: user.id,
              senderId: user.id,
              newRelation: relationChannelUser,
            });
          }
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      this.log(error);
      throw new WsException('cannot delete pongie');
    }
  }

  async blacklist(
    userId: number,
    pongieId: number,
    pongieSockets: Socket[],
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserPongies(userId);
      const pongie = await this.usersService.getUserPongies(pongieId);

      if (!user || !pongie) throw new Error('no user found');

      let relationUser = await this.userPongieRelation.findOne({
        where: { userId: userId, pongieId: pongieId },
        relations: ['user', 'pongie'],
      });

      if (!relationUser) {
        await this.usersService.updateUserPongies(user, pongie);
        relationUser = await this.userPongieRelation.findOne({
          where: { userId: userId, pongieId: pongieId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationUser) throw new Error('cannot create relation');

      let relationPongie = await this.userPongieRelation.findOne({
        where: { userId: pongieId, pongieId: userId },
        relations: ['user', 'pongie'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserPongies(pongie, user);
        relationPongie = await this.userPongieRelation.findOne({
          where: { userId: pongieId, pongieId: userId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationPongie) throw new Error('cannot create relation');

      relationUser.hasBlacklisted = true;
      relationPongie.isBlacklisted = true;

      await this.userPongieRelation.save(relationUser);
      await this.userPongieRelation.save(relationPongie);

      // update relation channel privateMsg
      const channelName =
        userId < pongieId ? userId + ' ' + pongieId : pongieId + ' ' + userId;

      const channel = await this.channelService.getChannelByName(
        channelName,
        true,
      );

      let relationChannelUser: UserChannelRelation;
      let relationChannelPongie: UserChannelRelation;

      if (channel) {
        // update relations user channel
        relationChannelUser = await this.userChannelRelation.findOne({
          where: { userId: userId, channelId: channel.id },
          relations: ['user', 'channel'],
        });

        if (relationChannelUser) {
          relationChannelUser.isBanned = true;
          await this.userChannelRelation.save(relationChannelUser);
        }

        // update relations pongie channel
        relationChannelPongie = await this.userChannelRelation.findOne({
          where: { userId: pongieId, channelId: channel.id },
          relations: ['user', 'channel'],
        });

        if (relationChannelPongie) {
          relationChannelPongie.isBanned = true;
          await this.userChannelRelation.save(relationChannelPongie);
        }
      }

      const updatedRedPongies = pongie.notif.redPongies.filter(
        (id) => id !== user.id,
      );
      await this.notifRepository.update(pongie.notif.id, {
        redPongies: updatedRedPongies,
      });

      if (pongieSockets.length !== 0) {
        for (const socket of pongieSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
          server.to(socket.id).emit('notif', {
            why: 'updateChannels',
          });
          server.to(socket.id).emit('notifMsg');

          if (channel) {
            socket.leave('channel:' + channel.id);
            server.to(socket.id).emit('editRelation', {
              channelId: channel.id,
              userId: pongie.id,
              senderId: user.id,
              newRelation: relationChannelPongie,
            });
          }
        }
      }

      if (userSockets.length !== 0) {
        for (const socket of userSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
          server.to(socket.id).emit('notif', {
            why: 'updateChannels',
          });
          server.to(socket.id).emit('notifMsg');

          if (channel) {
            socket.leave('channel:' + channel.id);
            server.to(socket.id).emit('editRelation', {
              channelId: channel.id,
              userId: user.id,
              senderId: user.id,
              newRelation: relationChannelUser,
            });
          }
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      this.log(error);
      throw new WsException('cannot delete pongie');
    }
  }

  async addChannel(userId: number, channelId: number) {
    try {
      const relation = await this.userChannelRelation.findOne({
        where: { userId: userId, channelId: channelId },
        relations: ['user', 'channel'],
      });

      if (!relation) {
        const user = await this.usersService.getUserPongies(userId);
        const channel = await this.channelService.getChannelById(channelId);

        await this.usersService.updateUserChannels(user, channel);
      }
      // else {
      //   await this.userPongieRelation.save(relation);
      // }
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async getChannelUsers(channelId: number): Promise<User[]> {
    return (await this.channelService.getChannelUsers(channelId)).users;
  }

  async getChannelById(channelId: number): Promise<Channel> {
    return await this.channelService.getChannelById(channelId);
  }

  async getMessages(channelId: number, userId: number) {
    try {
      const channel = await this.channelService.getChannelMessages(channelId);

      channel.messages = await Promise.all(
        channel.messages.map(async (message) => {
          // check if user banned
          if (!message.isServerNotif) {
            const pongie = message.user;

            const relation = await this.userPongieRelation.findOne({
              where: { userId: userId, pongieId: pongie.id },
            });

            if (relation && (relation.isBlacklisted || relation.hasBlacklisted))
              return;
          }

          // decrypt image if needed
          if (
            !message.isServerNotif &&
            message.user &&
            message.user.avatar.decrypt
          ) {
            message.user.avatar.image = await this.cryptoService.decrypt(
              message.user.avatar.image,
            );
          }

          return message;
        }),
      );

      channel.messages = channel.messages.filter((message) => message);

      return channel.messages;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async addPongie(
    userId: number,
    pongieId: number,
    pongieSockets: Socket[],
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const user = await this.usersService.getUserPongies(userId);
      const pongie = await this.usersService.getUserPongies(pongieId);

      if (!user || !pongie) throw new Error('no user found');

      let relationUser = await this.userPongieRelation.findOne({
        where: { userId: userId, pongieId: pongieId },
        relations: ['user', 'pongie'],
      });

      if (!relationUser) {
        await this.usersService.updateUserPongies(user, pongie);
        relationUser = await this.userPongieRelation.findOne({
          where: { userId: userId, pongieId: pongieId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationUser) throw new Error('cannot create relation');

      if (relationUser.isBlacklisted)
        return {
          success: true,
          error: 'isBlacklisted',
          msg: '',
        };

      let relationPongie = await this.userPongieRelation.findOne({
        where: { userId: pongieId, pongieId: userId },
        relations: ['user', 'pongie'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserPongies(pongie, user);
        relationPongie = await this.userPongieRelation.findOne({
          where: { userId: pongieId, pongieId: userId },
          relations: ['user', 'pongie'],
        });
      }

      if (!relationPongie) throw new Error('cannot create relation');

      if (relationPongie.hasBlacklisted) {
        relationUser.isBlacklisted = true;
        await this.userPongieRelation.save(relationUser);
        return {
          success: true,
          error: 'isBlacklisted',
          msg: '',
        };
      }

      // if invitation already sent add Friend
      if (relationPongie.hasInvited || relationUser.isInvited) {
        relationUser.isFriend = true;
        relationPongie.isFriend = true;
        relationUser.isInvited = false;
        relationPongie.isInvited = false;
        relationUser.hasInvited = false;
        relationPongie.hasInvited = false;
        await this.userPongieRelation.save(relationUser);
        await this.userPongieRelation.save(relationPongie);

        await this.notifRepository.update(pongie.notif.id, {
          redPongies: [...pongie.notif.redPongies, user.id],
        });

        if (pongieSockets.length !== 0) {
          for (const socket of pongieSockets) {
            server.to(socket.id).emit('notif', {
              why: 'updatePongies',
            });
          }
        }

        if (userSockets.length !== 0) {
          for (const socket of userSockets) {
            server.to(socket.id).emit('notif', {
              why: 'updatePongies',
            });
          }
        }

        return {
          success: 'true',
          error: '',
          msg: 'friend',
        };
      }

      relationUser.hasInvited = true;
      relationPongie.isInvited = true;

      await this.userPongieRelation.save(relationUser);
      await this.userPongieRelation.save(relationPongie);

      await this.notifRepository.update(pongie.notif.id, {
        redPongies: [...pongie.notif.redPongies, user.id],
      });

      if (pongieSockets.length !== 0) {
        for (const socket of pongieSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
        }
      }

      if (userSockets.length !== 0) {
        for (const socket of userSockets) {
          server.to(socket.id).emit('notif', {
            why: 'updatePongies',
          });
        }
      }

      return {
        success: true,
        error: '',
        msg: 'invited',
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  // check before if channel exists
  async joinChannel(
    userId: number,
    channelId: number,
    channelName: string,
    channelType: 'public' | 'protected' | 'private' | 'privateMsg',
    userSockets: Socket[],
    server: Server,
    password?: string,
  ) {
    let isCreation: boolean = false;
    let isProtected: boolean = false;

    try {
      // check if user exists
      const user = await this.usersService.getUserChannels(userId);
      if (!user) throw new Error('no user found');

      // check if channel already exists
      let channel = undefined;

      if (channelId !== -1)
        channel = await this.channelService.getChannelById(channelId);

      if (!channel) {
        isCreation = true;
        channel = await this.channelService.addChannel(
          channelName,
          channelType,
          password,
        );

        if (!channel)
          return {
            success: false,
            exists: true,
            banned: false,
            channel: null,
          };
      }

      if (channel && channel.type === 'protected') isProtected = true;

      // check if user already in channel
      let relation = await this.userChannelRelation.findOne({
        where: { userId: userId, channelId: channelId },
        relations: ['user', 'channel'],
      });

      // if relation does not exist, create it
      if (!relation) {
        this.log(
          `user[${user.login}] has no relation with channel[${channel.name}][${channel.type}], creating relation`,
        );
        await this.usersService.updateUserChannels(user, channel);
        relation = await this.userChannelRelation.findOne({
          where: { userId: userId, channelId: channel.id },
          relations: ['user', 'channel'],
        });
      }

      // check if channel creation (adding isBoss user trait)
      if (isCreation) {
        relation.isBoss = true;
        await this.userChannelRelation.save(relation);
      }

      // check if user banned
      if (relation.isBanned)
        return {
          success: false,
          exists: false,
          banned: true,
          channel: null,
        };

      if (
        channel.type === 'private' &&
        !isCreation &&
        !relation.joined &&
        !relation.invited
      )
        return {
          success: false,
          exists: false,
          banned: true,
          channel: null,
        };

      // check if user is not joined
      if (!relation.joined && (!isProtected || relation.isBoss)) {
        relation.joined = true;
        relation.invited = false;
        await this.userChannelRelation.save(relation);

        const date = new Date();
        const content = `${user.login} just joined the channel`;

        const msg: sendMsgDto = {
          content: content,
          date: date.toISOString(),
          sender: null,
          channelName: relation.channel.name,
          channelId: channelId,
          isServerNotif: true,
        };

        const saveServerNotif: MakeMessage = {
          content: content,
          channel: relation.channel,
          isServerNotif: true,
        };

        try {
          this.messageService.addMessage(saveServerNotif);
        } catch (dbError) {
          this.log('saving notif in db failed : ' + dbError.message);
        }

        server.to('channel:' + channelId).emit('sendMsg', msg);

        // Upload Data for clients in channel profile component
        server.to('channel:' + channelId).emit('editRelation', {
          channelId: channelId,
          newRelation: {
            joined: true,
          },
          userId: userId,
          senderId: userId,
        });

        this.log(`user[${userId}] joined channel ${relation.channel.name}`);
      }

      if (userSockets.length >= 1 && (!isProtected || relation.isBoss)) {
        for (const socket of userSockets) {
          socket.join('channel:' + channel.id);
          socket.emit('notif', {
            why: 'updateChannels',
          });
        }
      }

      const channelRelation = {
        ...channel,
        isBoss: relation.isBoss,
        isChanOp: relation.isChanOp,
        joined: relation.joined,
        isBanned: relation.isBanned,
        invited: relation.invited,
        muted: relation.muted,
      };

      return {
        success: true,
        exists: false,
        banned: false,
        channel: channelRelation,
      };
    } catch (error) {
      throw new WsException(error.msg);
    }
  }

  async joinPongie(
    userId: number,
    pongieId: number,
    userSockets: Socket[],
    pongieSockets: Socket[],
  ) {
    try {
      // check if user exists
      const user = await this.usersService.getUserChannels(userId);
      const pongie = await this.usersService.getUserChannels(pongieId);

      if (!user || !pongie) throw new Error('no user found');

      // check if channel of type 'privateMsg' already exists
      const channelName = this.channelService.formatPrivateMsgChannelName(
        userId.toString(),
        pongieId.toString(),
      );

      let channel = await this.channelService.getChannelByName(
        channelName,
        true,
      );

      if (!channel)
        channel = await this.channelService.addChannel(
          channelName,
          'privateMsg',
        );

      // check if relations exists
      let relationUser = await this.userChannelRelation.findOne({
        where: { userId: userId, channelId: channel.id },
        relations: ['user', 'channel'],
      });

      if (!relationUser) {
        await this.usersService.updateUserChannels(user, channel);
        relationUser = await this.userChannelRelation.findOne({
          where: { userId: userId, channelId: channel.id },
          relations: ['user', 'channel'],
        });
      }

      let relationPongie = await this.userChannelRelation.findOne({
        where: { userId: pongie.id, channelId: channel.id },
        relations: ['user', 'channel'],
      });

      if (!relationPongie) {
        await this.usersService.updateUserChannels(pongie, channel);
        relationPongie = await this.userChannelRelation.findOne({
          where: { userId: pongieId, channelId: channel.id },
          relations: ['user', 'channel'],
        });
      }

      // check if banned
      if (relationUser.isBanned || relationPongie.isBanned)
        return {
          success: false,
          exists: false,
          banned: true,
          channel: null,
        };

      if (!relationUser.joined) {
        relationUser.joined = true;
        await this.userChannelRelation.save(relationUser);
      }

      if (!relationPongie.joined) {
        relationPongie.joined = true;
        await this.userChannelRelation.save(relationPongie);
      }

      if (userSockets.length >= 1) {
        for (const socket of userSockets) {
          socket.join('channel:' + channel.id);
          socket.emit('notif', {
            why: 'updateChannels',
          });
        }
      }

      if (pongieSockets.length >= 1) {
        for (const socket of pongieSockets) {
          socket.join('channel:' + channel.id);
          socket.emit('notif', {
            why: 'updateChannels',
          });
        }
      }

      if (pongie.avatar.decrypt)
        pongie.avatar.image = await this.cryptoService.decrypt(
          pongie.avatar.image,
        );

      channel.name = pongie.login;
      channel.avatar = pongie.avatar;

      const channelrelation = {
        ...channel,
        joined: true,
        isBanned: relationUser.isBanned,
        invited: relationUser.invited,
        isChanop: relationUser.isChanOp,
        muted: relationUser.muted,
        statusPongieId: pongieId,
      };

      return {
        success: true,
        exists: false,
        banned: false,
        channel: channelrelation,
      };
    } catch (error) {
      this.log(error.message);
      throw new WsException(error.message);
    }
  }

  async leave(
    userId: number,
    channelId: number,
    userSockets: Socket[],
    server: Server,
  ) {
    try {
      const relation = await this.userChannelRelation.findOne({
        where: { userId: userId, channelId: channelId },
        relations: ['user', 'channel'],
      });

      if (!relation) throw new Error('no relation found');

      relation.joined = false;
      await this.userChannelRelation.save(relation);

      const date = new Date();
      const content = `${relation.user.login} just left`;

      const msg: sendMsgDto = {
        content: content,
        date: date.toISOString(),
        sender: null,
        channelName: relation.channel.name,
        channelId: channelId,
        isServerNotif: true,
      };

      // leave channel for all sockets of the user
      // update channels in the user profile
      if (userSockets.length >= 1) {
        for (const socket of userSockets) {
          socket.leave('channel:' + channelId);
          socket.emit('notif', {
            why: 'updateChannels',
          });
        }
      }

      // Upload Data for clients in channel profile component
      server.to('channel:' + channelId).emit('editRelation', {
        channelId: channelId,
        newRelation: {
          joined: false,
        },
        userId: userId,
        senderId: userId,
      });

      // send message server
      server.to('channel:' + channelId).emit('sendMsg', msg);

      const saveServerNotif: MakeMessage = {
        content: content,
        channel: relation.channel,
        isServerNotif: true,
      };

      try {
        this.messageService.addMessage(saveServerNotif);
      } catch (dbError) {
        this.log('saving notif in db failed : ' + dbError.message);
      }

      return {
        success: true,
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  // memo : Container of connected users : Map<socket, user id>
  async joinLeaveRoomProcByEditRelation(
    isLeave: boolean,
    edit: EditChannelRelationDto,
    connectedUsers: Map<Socket, string>,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const repRelation = await this.channelService.getOneChannelUserRelation(
        edit.userId,
        edit.channelId,
      );
      if (!repRelation.success) throw new Error(repRelation.message);

      const whatToDo = this.shouldJoinOrLeave(edit, repRelation.data);

      if (whatToDo !== 'nothing') {
        const sockets: Socket[] = [];
        for (const [socket, value] of connectedUsers) {
          if (value === edit.userId.toString()) sockets.push(socket);
        }

        if (whatToDo === 'join' && !isLeave) {
          sockets.forEach((socket) => {
            socket.join(`channel:${edit.channelId}`);
            this.log(
              `Connected User[${edit.userId}] joined channel(room)[${edit.channelId}] procByEdit Relation`,
            );
          });
        } else if (whatToDo === 'leave' && isLeave) {
          sockets.forEach((socket) => {
            socket.leave(`channel:${edit.channelId}`);
            this.log(
              `Connected User[${edit.userId}] left channel(room)[${edit.channelId}] procByEdit Relation`,
            );
          });
        }
      }

      rep.success = true;
    } catch (error: any) {
      rep.success = false;
      rep.message = error.message;
    }

    return rep;
  }

  private shouldJoinOrLeave(
    edit: EditChannelRelationDto,
    current: UserChannelRelation,
  ): 'join' | 'leave' | 'nothing' {
    let whatToDo: 'join' | 'leave' | 'nothing' = 'nothing';
    const next = edit.newRelation;

    if (
      next.joined === false ||
      (next.isBanned === true && current.joined === true)
    )
      whatToDo = 'leave';
    else if (
      next.joined === true ||
      (next.isBanned === false && current.joined === true)
    )
      whatToDo = 'join';

    return whatToDo;
  }

  async receiveNewMsg(
    message: newMsgDto,
    reqUserId: number,
    server: Server,
    connectedUsers: Map<Socket, string>,
  ) {
    try {
      const now: Date | string = new Date();
      const nowtoISOString = now.toISOString();

      const [fetchedChannel, sender, repRelation] = await Promise.all([
        this.channelService.getChannelById(message.channelId),
        this.usersService.getUserAvatar(reqUserId),
        this.channelService.getOneChannelUserRelation(
          reqUserId,
          message.channelId,
        ),
      ]);

      if (sender.avatar.decrypt) {
        sender.avatar.image = await this.cryptoService.decrypt(
          sender.avatar.image,
        );
      }

      if (repRelation.success && repRelation.data)
        this.verifyChatAllowed(repRelation.data);
      else throw new Error(repRelation.message);

      const sendMsg: sendMsgDto = {
        content: message.content,
        date: nowtoISOString,
        sender: sender,
        channelName: fetchedChannel.name,
        channelId: fetchedChannel.id,
        isServerNotif: false,
        join: message.join,
      };

      const makeMsg: MakeMessage = {
        content: message.content,
        user: sender,
        channel: fetchedChannel,
        isServerNotif: false,
        join: message.join,
      };

      this.log(
        `[${reqUserId}] sending : [${sendMsg.content}] to : [${fetchedChannel.name}]`,
      );

      await this.messageService.addMessage(makeMsg);

      this.log(`message emit to room : 'channel:${sendMsg.channelId}'`);

      // get sockets in the room
      const clientSockets = await server
        .in('channel:' + sendMsg.channelId)
        .fetchSockets();
      const pongieBannedIds: string[] = [];

      if (!clientSockets || clientSockets.length === 0) return;

      for (const connectedUser of connectedUsers) {
        if (clientSockets.find((socket) => socket.id === connectedUser[0].id)) {
          const relation = await this.userPongieRelation.findOne({
            where: { userId: reqUserId, pongieId: parseInt(connectedUser[1]) },
          });

          if (
            !relation ||
            (relation && !relation.isBlacklisted && !relation.hasBlacklisted)
          ) {
            server.to(connectedUser[0].id).emit('sendMsg', sendMsg);
            server.to(connectedUser[0].id).emit('notif', {
              why: 'updateChannels',
            });
          }

          if (relation && (relation.isBlacklisted || relation.hasBlacklisted)) {
            pongieBannedIds.push(relation.pongieId.toString());
          }
        }
      }

      await this.receiveNewMsgNotif(
        message.channelId,
        sender.id,
        server,
        pongieBannedIds,
      );
    } catch (error) {
      this.log(`receiveNewMsg error : ${error.message}`);
      throw new WsException(error.message);
    }
  }

  private verifyChatAllowed(relation: UserChannelRelation): void {
    if (!relation.joined)
      throw new Error(
        `Channel [${relation.channelId}] chat not allowed : user[${relation.userId}] need join channel`,
      );
    else if (relation.isBoss) return;
    else if (relation.isBanned)
      throw new Error(
        `Channel [${relation.channelId}] chat not allowed : user[${relation.userId}] banned from channel`,
      );
    else if (relation.muted)
      throw new Error(
        `Channel [${relation.channelId}] chat not allowed : user[${relation.userId}] is muted`,
      );
  }

  private async receiveNewMsgNotif(
    channelId: number,
    userId: number,
    server: Server,
    pongieBannedIds: string[],
  ) {
    try {
      this.log(`receiveNewMsgNotif channelid = ${channelId}, userId = ${userId} et pongiebanned = ${pongieBannedIds}`);
      const relations = await this.userChannelRelation.find({
        where: {
          channelId: channelId,
          userId: Not(userId),
          joined: true,
          isBanned: false,
        },
        relations: ['user', 'user.notif'],
      });

      if (relations.length >= 1) {
        for (const relation of relations) {
          if (pongieBannedIds.find((id) => id === relation.user.id.toString()))
            return;

          const notifMessages = relation.user.notif.notifMessages.find(
            (notif) => notif.channelId === channelId,
          );

          if (notifMessages) {
            await this.notifMessagesRepository.update(notifMessages.id, {
              nbMessages: notifMessages.nbMessages + 1,
            });
          } else {
            const notifMessage = new NotifMessages();

            notifMessage.channelId = channelId;
            notifMessage.nbMessages = 1;
            notifMessage.notif = relation.user.notif;

            await this.notifMessagesRepository.save(notifMessage);
          }
        }
      }
      server.to('channel:' + channelId).emit('notifMsg');
    } catch (error) {
      this.log(`receiveNewMsgNotif error : ${error.message}`);
    }
  }

  private async receiveChannelInvitationNotif(
    channelId: number,
    userId: number,
  ) {
    try {
      const relations = await this.userChannelRelation.find({
        where: {
          channelId: channelId,
          userId: userId,
        },
        relations: ['user', 'user.notif'],
      });

      if (relations.length >= 1) {
        for (const relation of relations) {

          const notifMessages = relation.user.notif.notifMessages.find(
            (notif) => notif.channelId === channelId,
          );

          if (notifMessages && notifMessages.nbMessages === 0) {
            await this.notifMessagesRepository.update(notifMessages.id, {
              nbMessages: notifMessages.nbMessages + 1,
            });
          } else if (!notifMessages) {
            const notifMessage = new NotifMessages();

            notifMessage.channelId = channelId;
            notifMessage.nbMessages = 1;
            notifMessage.notif = relation.user.notif;

            await this.notifMessagesRepository.save(notifMessage);
          }
        }
      }

    } catch (error) {
      this.log(`receiveChannelInvitationNotif error : ${error.message}`);
    }
  }

  async joinAllMyChannels(socket: Socket, userId: number) {
    const relations = await this.userChannelRelation.find({
      where: { userId: userId, joined: true, isBanned: false },
    });

    relations.map((relation) => {
      socket.join('channel:' + relation.channelId);
    });
  }

  async sendEditRelationNotif(
    infos: EditChannelRelationDto & { server: Server; from: number, connectedUsers: Map<Socket, string> },
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {

      const content: string = await this.makeEditRelationNotifContent(infos);
      await this.sendServerNotifMsg(infos.channelId, content, infos.server);

      if ((infos.newRelation.invited && infos.newRelation.invited === true)
        || ('isBanned' in infos.newRelation && infos.newRelation.isBanned === false)) {

        const user = await this.usersService.getUserById(infos.userId);
        if (!user) throw new Error("can't find the user");

        // Create a notif beetween the target user and the channel where he is invited
        await this.receiveChannelInvitationNotif(infos.channelId, infos.userId);

        // Get socket to emit a refresh channel + notifMessage
        const userSockets: Socket[] = [];

        for (const [key, val] of infos.connectedUsers) {
           if (val === infos.userId.toString()) userSockets.push(key);
        }

        if (userSockets.length >= 1) {
          for (const socket of userSockets) {
            infos.server.to(socket.id).emit('notif', {
              why: 'updateChannels',
            });

            infos.server.to(socket.id).emit('notifMsg');
          }
        }
      }

      if ('isBanned' in infos.newRelation && infos.newRelation.isBanned === true) {
        // Get socket to emit a refresh channel + notifMessage
        const userSockets: Socket[] = [];

        for (const [key, val] of infos.connectedUsers) {
           if (val === infos.userId.toString()) userSockets.push(key);
        }

        if (userSockets.length >= 1) {
          for (const socket of userSockets) {
            infos.server.to(socket.id).emit('notif', {
              why: 'updateChannels',
            });

            infos.server.to(socket.id).emit('notifMsg');
          }
        }
      }

      if (('invited' in infos.newRelation && infos.newRelation.invited === false && !infos.newRelation.joined)
          || ('joined' in infos.newRelation && infos.newRelation.joined === false)) {
        // Get socket to emit a refresh channel + notifMessage
        const userSockets: Socket[] = [];

        for (const [key, val] of infos.connectedUsers) {
           if (val === infos.userId.toString()) userSockets.push(key);
        }
        await this.clearNotif(infos.userId, {
          which: "messages",
          id: infos.channelId,
        }, userSockets, infos.server);
      }

      rep.success = true;

    } catch (e) {
      rep.error = e;
      rep.message = e.message;
    }

    return rep;
  }

  public async sendServerNotifMsgPublic(
    channelId: number,
    senderId: number,
    endContent: string,
    server: Server,
  ) {
    try {
      const login = (await this.usersService.getUserById(senderId)).login;
      const content = login + ' ' + endContent;

      const rep = await this.sendServerNotifMsg(channelId, content, server);
      if (!rep.success) {
        throw new Error(rep.message);
      }
    } catch (e) {
      this.log(`[sendServerNotifMsgPublic] error : ${e.message}`);
    }
  }

  // tools
  private async sendServerNotifMsg(
    channelId: number,
    content: string,
    server: Server,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const now = new Date();
      const nowtoISOString = now.toISOString();

      const channel = await this.channelService.getChannelById(channelId);

      if (!channel) throw new Error(`Can't retrieve channel[${channelId}]`);
      else if (channel.type === 'privateMsg') return;

      const notif: sendMsgDto = {
        content: content,
        date: nowtoISOString,
        sender: undefined,
        channelName: '',
        channelId: channelId,
        isServerNotif: true,
      };

      const newMessage: MakeMessage = {
        content: content,
        user: undefined,
        channel: channel,
        isServerNotif: true,
      };

      server.to('channel:' + channelId).emit('sendMsg', notif);
      const repMsg = await this.messageService.addMessage(newMessage);
      if (!repMsg.success) throw new Error(repMsg.message);

      rep.success = true;
    } catch (e) {
      this.log('Error : ' + e.message);
      rep.error = e;
      rep.message = e.message;
    }

    return rep;
  }

  async makeEditRelationNotifContent(
    infos: EditChannelRelationDto & { server: Server; from: number, connectedUsers: Map<Socket, string> },
  ) {
    let content: string = '';
    let needEnd: boolean = true;

    try {
      const isSelf: boolean = infos.from === infos.userId;
      const whoFrom = await this.usersService.getUserById(infos.from);
      const whotTo = isSelf
        ? whoFrom
        : await this.usersService.getUserById(infos.userId);

      if (!whoFrom) throw new Error("can't find the edit relation maker");
      if (!whotTo) throw new Error("can't find the edit relation target");

      let action: string;

      if (infos.newRelation.isBoss === true) {
        action = 'grants channel Master privilege';
      } else if (infos.newRelation.isBoss === false) {
        action = 'removes channel Master privilege';
      } else if (infos.newRelation.isChanOp === true) {
        action = 'grants channel Operator privilege';
      } else if (infos.newRelation.isChanOp === false) {
        action = 'removes channel Operator privilege';
      } else if (infos.newRelation.isBanned === true) {
        action = 'gives a ban penalty';
      } else if (infos.newRelation.isBanned === false) {
        action = 'removes the ban penalty';
      } else if (infos.newRelation.joined === true && !isSelf) {
        action = 'allows joinning channel';
      } else if (infos.newRelation.joined === true && isSelf) {
        action = 'just joined the channel';
        needEnd = false;
      } else if (infos.newRelation.joined === false && !isSelf) {
        action = 'gives a channel kick';
      } else if (infos.newRelation.joined === false && isSelf) {
        action = 'left channel';
        needEnd = false;
      } else if (infos.newRelation.invited === true) {
        action = 'gives a channel invitation';
      } else if (infos.newRelation.invited === false) {
        action = 'cancels the channel invitation';
      } else if (infos.newRelation.muted === true) {
        action = 'gives a mute penalty';
      } else if (infos.newRelation.muted === false) {
        action = 'removes the mute penalty';
      } else {
        throw new Error('no relation boolean found');
      }

      if (isSelf) {
        content = needEnd
          ? `${whoFrom.login} ${action} to itself`
          : `${whoFrom.login} ${action}`;
      } else {
        content = needEnd
          ? `${whoFrom.login} ${action} to ${whotTo.login}`
          : `${whoFrom.login} ${action}`;
      }
    } catch (e) {
      this.log('makeEditRelationNotifContent() error : ' + e.message);
    }

    return content;
  }

  // Memo connected users : Map<socket, user id>
  public forceUpdateChannel(
    userId: number,
    connectedUsers: Map<Socket, string>,
  ) {
    const sockets: Socket[] = [];
    for (const [socket, value] of connectedUsers) {
      if (value === userId.toString()) sockets.push(socket);
    }

    sockets.forEach((socket) => {
      this.log(
        `forceUpdateChannel emit empty editRelation to user[${userId}]->socket[${socket.id}]`,
      );
      socket.emit('editRelation', {});
    });
  }

  async joinButtonActive(gameId: string) {
    try {

      const game = await this.gameRepository.findOne({
        where: { id: gameId },
      });

      if (!game || game.opponent !== -1 || game.status !== 'Not Started')
        return {
          active: false,
          gameId: gameId,
        };
    
      return {
        active: true,
        gameId: gameId,
      };
    }
    catch (error) {
      throw new WsException(error.message);
    }
  }

  private log(message?: any) {
    const green = '\x1b[32m';
    const stop = '\x1b[0m';

    if (!process.env || !process.env.ENVIRONNEMENT || process.env.ENVIRONNEMENT !== "dev") return;

    process.stdout.write(green + '[chat service]  ' + stop);
    console.log(message);
  }
}
