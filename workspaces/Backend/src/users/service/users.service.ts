/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm/User.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { CryptoService } from 'src/utils/crypto/crypto';
import { Channel } from 'src/utils/typeorm/Channel.entity';
import { Avatar } from 'src/utils/typeorm/Avatar.entity';
import { EditUserDto } from '../dto/EditUser.dto';
import { repDto } from '../dto/rep.dto';
import { Token } from 'src/utils/typeorm/Token.entity';
import { BackupCode } from '@/utils/typeorm/BackupCode.entity';
import * as bcrypt from 'bcrypt';
import { SocketToken } from '@/utils/typeorm/SocketToken.entity';
import { StatsService } from '@/stats/service/stats.service';
import { Notif } from '@/utils/typeorm/Notif.entity';
import { Image } from '@/utils/typeorm/Image.entity';
import { EditChannelRelationDto } from '@/channels/dto/EditChannelRelation.dto';
import { StoryService } from '@/story/service/story.service';
import { AchievementService } from '@/achievement/service/achievement.service';
import { MatchmakingService } from '@/matchmaking/service/matchmaking.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(BackupCode)
    private readonly backupCodeRepository: Repository<BackupCode>,
    @InjectRepository(SocketToken)
    private readonly socketTokenRepository: Repository<SocketToken>,
    @InjectRepository(Notif)
    private readonly notifRepository: Repository<Notif>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,

    private readonly achievementService: AchievementService,
    private readonly cryptoService: CryptoService,
    private readonly matchmakingService: MatchmakingService,
    private readonly statsService: StatsService,
    private readonly storyService: StoryService,
  ) {}

  async addUser(CreateUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.save(CreateUserDto);

      const achievement = await this.achievementService.createAchievement({
        userId: user.id,
      });
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'achievement')
        .of(user.id)
        .set(achievement);

      const matchmaking = await this.matchmakingService.createMatchmaking({
        userId: user.id,
      });
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'matchmaking')
        .of(user.id)
        .set(matchmaking);

      const stats = await this.statsService.createStats({
        userId: user.id,
      });
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'stats')
        .of(user.id)
        .set(stats);

      const notif = await this.notifRepository.save(new Notif());
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'notif')
        .of(user.id)
        .set(notif);

      const story = await this.storyService.createStory({
        userId: user.id,
      });
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'trainingStory')
        .of(user.id)
        .set(story);

      return user;
    } catch (error) {
      this.log(error.message);
      throw new BadRequestException();
    }
  }

  async saveUserEntity(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async getUserByLogin(login: string) {
    return await this.userRepository.findOne({ where: { login: login } });
  }

  async getUserByEmail(email: string, provider: string) {
    const emailDecrypted = (
      await this.cryptoService.decrypt(email)
    ).toLowerCase();
    const clients = await this.userRepository.find();

    for (const client of clients) {
      const emailClient = await this.cryptoService.decrypt(client.email);
      if (
        emailClient.toLowerCase() === emailDecrypted &&
        client.provider === provider
      )
        return client;
    }
    return null;
  }

  async getUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  private async getChannelById(id: number) {
    return await this.channelRepository.findOne({
      where: { id: id },
    });
  }

  async getUserChannels(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['channels', 'channels.avatar', 'avatar'],
    });
  }

  async getUserPongies(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['pongies', 'pongies.avatar', 'avatar'],
    });
  }

  async getUserAvatar(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['avatar'],
    });
  }

  async getUserBackupCodes(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['backupCodes'],
    });
  }

  async getUserImages(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['images'],
    });
  }

  async getUserTokens(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['tokens'],
    });
  }

  async saveToken(token: Token) {
    await this.tokenRepository.save(token);
  }

  async saveBackupCode(user: User, backupCode: string) {
    const backupCodeEntity = new BackupCode();
    backupCodeEntity.code = backupCode;
    backupCodeEntity.user = user;

    return await this.backupCodeRepository.save(backupCodeEntity);
  }

  async deleteToken(token: Token) {
    await this.tokenRepository.remove(token);
  }

  async deleteBackupCode(backupCode: BackupCode) {
    await this.backupCodeRepository.remove(backupCode);
  }

  async deleteAllUserTokens(user: User) {
    await this.tokenRepository.remove(user.tokens);
    const socketTokens: SocketToken[] = await this.socketTokenRepository.find({
      where: { userId: user.id },
    });
    await this.socketTokenRepository.remove(socketTokens);
  }

  async deleteBackupCodes(user: User) {
    await this.backupCodeRepository.remove(user.backupCodes);
  }

  async getUserByCode(code: string) {
    return await this.userRepository.findOne({
      where: { verifyCode: code },
    });
  }

  async updateUser(id: number, properties: Partial<User>) {
    await this.userRepository.update(id, properties);
  }

  async updateUserChannels(user: User, channel: Channel) {
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'channels')
      .of(user.id)
      .add(channel);
  }

  async updateUserAvatar(user: User, avatar: Avatar) {
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'avatar')
      .of(user.id)
      .set(avatar);
  }

  async updateUserPongies(user: User, pongie: User) {
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'pongies')
      .of(user.id)
      .add(pongie);
  }

  async updateUserBackupCodes(user: User, backupCodes: BackupCode[]) {
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'backupCodes')
      .of(user.id)
      .set(backupCodes);
  }

  async getChannelByName(name: string) {
    return await this.channelRepository.findOne({
      where: { name: name },
      relations: ['users'],
    });
  }

  async editUser(userId: number, properties: EditUserDto) {
    const rep: repDto = {
      success: false,
      message: '',
    };

    try {
      const updatedProperties: string[] = [];

      for (const key in properties) {
        if (properties.hasOwnProperty(key) && properties[key] !== undefined) {
          updatedProperties.push(key);
        }
      }

      if (updatedProperties.length > 0) {
        if (updatedProperties.indexOf('login') !== -1) {
          rep.message = 'sorry, editing login is not implemented yet';
        } else {
          this.updateUser(userId, properties);

          rep.success = true;
          rep.message = `Properties : ${updatedProperties.join(
            ', ',
          )} : successfully updated`;

          this.log(`${rep.message} for user : ${userId}`);
        }
      } else {
        rep.message = 'missing or incorrect properties sent in request';
      }
    } catch (error) {
      rep.message = error.message;
    }

    return rep;
  }

  public async createChannelUserRelation(
    channelInfos: EditChannelRelationDto,
  ): Promise<ReturnData> {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const user = await this.getUserById(channelInfos.userId);
      const channel = await this.getChannelById(channelInfos.channelId);

      if (!user || !channel) throw new Error('user or channel not found');

      await this.updateUserChannels(user, channel);

      rep.success = true;
    } catch (e) {
      rep.message = e.message;
      rep.error = e;
    }

    return rep;
  }

  
  async checkPassword(userId: number, passwordCrypted: string) {
    try {
      if (!passwordCrypted) throw new Error('no password');

      const user = await this.getUserById(userId);

      if (!user) throw new Error('no user');

      const password = await this.cryptoService.decrypt(passwordCrypted);

      const isMatch = await bcrypt.compare(password, user.passwordHashed);

      if (!isMatch)
        return {
          success: false,
          error: 'wrong',
        };

      return {
        success: true,
      };
    } catch (error) {
      this.log(error.message);
      throw new BadRequestException();
    }
  }

  async updatePassword(userId: number, password: string) {
    try {
      if (!password) throw new Error('no password');
      
      const user = await this.getUserById(userId);
      
      if (!user) throw new Error('no user');

      await this.updateUser(user.id, {
        passwordHashed: password,
      });
      
      return {
        success: true,
      };
    } catch (error) {
      this.log(error.message);
      throw new BadRequestException();
    }
  }

  async addImage(userId: number, imageUrl: string, public_id: string) {
    try {
      if (!imageUrl || !public_id) throw new Error('no image url');

      const user = await this.getUserById(userId);

      if (!user) throw new Error('no user');

			const	imageUrlCrypted = await this.cryptoService.encrypt(imageUrl);
			const	publicIdCrypted = await this.cryptoService.encrypt(public_id);

      const newImage = new Image();
      newImage.imageUrl = imageUrlCrypted;
      newImage.user = user;
      newImage.publicId = publicIdCrypted;

      const imageSaved = await this.imageRepository.save(newImage);

      if (!imageSaved) throw new Error('cannot save image');

      // Achievement completed
      await this.achievementService.achievementCompleted(
        user.id, {
          code: "UPLOAD_PICTURE",
        },
      );

      return imageSaved;
    } catch (error) {
      this.log(error.message);
      throw new BadRequestException();
    }
  }

  async getImages(userId: number) {
    try {
      const user = await this.getUserImages(userId);

      if (!user) throw new Error('no user');

      let images = user.images;

      if (!images) return [];

      images = await Promise.all(
        images.map(async (image) => {
          image.imageUrl = await this.cryptoService.decrypt(image.imageUrl);
          image.publicId = await this.cryptoService.decrypt(image.publicId);
          return image;
        }),
      );

      return user.images;
    } catch (error) {
      this.log(error.message);
      throw new BadRequestException();
    }
  }

  async deleteImage(imageId: number) {
    try {
      if (!imageId) throw new Error('no image id');

      const image = await this.imageRepository.findOne({
        where: { id: imageId },
      });

      if (!image) return;

      await this.imageRepository.remove(image);
    } catch (error) {
      this.log(error.message);
      throw new BadRequestException();
    }
  }

  // tools
  private log(message?: any) {
    const yellow = '\x1b[33m';
    const stop = '\x1b[0m';

    if (!process.env || !process.env.ENVIRONNEMENT || process.env.ENVIRONNEMENT !== "dev") return;

    process.stdout.write(yellow + '[user service]  ' + stop);
    console.log(message);
  }
}
