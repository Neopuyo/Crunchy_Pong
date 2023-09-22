/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelService } from '@/channels/service/channel.service';
import { UsersService } from 'src/users/service/users.service';
import { Avatar } from 'src/utils/typeorm/Avatar.entity';
import { Repository } from 'typeorm';
import { AvatarDto } from '../dto/Avatar.dto';
import { UpdateUserAvatarDto } from '../dto/update-user-avatar.dto';
import { CryptoService } from '@/utils/crypto/crypto';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly channelService: ChannelService,
    private readonly cryptoService: CryptoService,
  ) {}

  async createAvatar(avatarDto: AvatarDto) {
    return await this.avatarRepository.save(avatarDto);
  }

  public async getAvatarById(id: number, isChannel: boolean) {
    try {
      if (!isChannel) {
        const user = await this.usersService.getUserAvatar(id);

        if (!user) throw new Error('no user found');

        const avatar = user.avatar;

        if (!avatar) throw new Error('avatar not found');

        return avatar;
      } else {
        const channel = await this.channelService.getChannelAvatar(id);

        if (!channel) throw new Error('no channel found');

        const avatar = channel.avatar;

        if (!avatar) throw new Error('avatar not found');

        return avatar;
      }
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async editUserAvatarColors(
    req: any,
    updateUserAvatarDto: UpdateUserAvatarDto,
  ) {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const avatar: Avatar = (
        await this.usersService.getUserAvatar(req.user.id)
      )?.avatar;

      if (!avatar) {
        const defaultAvatar = this.createDefaultAvatar();
        rep.message = 'Avatar not found - default avatar created instead';

        if (!defaultAvatar)
          rep.message = 'Avatar not found, then failed default avatar creation';
      } else {
        avatar.borderColor = updateUserAvatarDto.borderColor;
        avatar.backgroundColor = updateUserAvatarDto.backgroundColor;
        await this.avatarRepository.update(avatar.id, avatar);

        this.log(
          `user : ${req.user.login} - border color updated: ${updateUserAvatarDto.borderColor} - background color updated: ${updateUserAvatarDto.backgroundColor}`,
        );
        rep.success = true;
        rep.message = 'Avatar colors successfully updated';
      }
    } catch (error) {
      rep.message = error.message;
    }
    return rep;
  }

  async editUserAvatar(userId: number, avatar: AvatarDto) {
    const rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const user = await this.usersService.getUserAvatar(userId);

      if (!user) throw new Error('no user');

      const avatarUser = user.avatar;

      if (!avatarUser) {
        const newAvatar = await this.avatarRepository.save(avatar);
        await this.usersService.updateUserAvatar(user, newAvatar);
        rep.success = true;
        rep.message = 'Avatar successfully updated';
      } else {
        if (avatar.decrypt)
          avatar.image = await this.cryptoService.encrypt(avatar.image);
        await this.avatarRepository.update(avatarUser.id, {
          ...avatar,
        });

        this.log(`user : ${userId} avatar totally updated`);
        rep.success = true;
        rep.message = 'Avatar successfully updated';
      }
    } catch (error) {
      rep.message = error.message;
    }
    return rep;
  }

  async editChannelAvatarColors(
    req: any,
    updateUserAvatarDto: UpdateUserAvatarDto,
  ) {
    const rep: ReturnData = {
      success: false,
      message: '',
    };
    try {
      const check = await this.channelService.checkChanOpPrivilege(
        req.user.id,
        updateUserAvatarDto.channelId,
      );

      if (!check.isOk) throw new Error(rep.error);

      const avatar: Avatar = (
        await this.channelService.getChannelAvatar(
          updateUserAvatarDto.channelId,
        )
      )?.avatar;

      if (!avatar)
        throw new Error(
          `error while fetching avatar of channel(id: ${updateUserAvatarDto.channelId})`,
        );
      avatar.borderColor = updateUserAvatarDto.borderColor;
      avatar.backgroundColor = updateUserAvatarDto.backgroundColor;
      await this.avatarRepository.update(avatar.id, avatar);

      this.log(
        `channel(id: ${updateUserAvatarDto.channelId}) avatar updated by user : ${req.user.login} - border color updated: ${updateUserAvatarDto.borderColor} - background color updated: ${updateUserAvatarDto.backgroundColor}`,
      );

      rep.success = true;
      rep.message = `channel(id: ${updateUserAvatarDto.channelId}) avatar updated by user : ${req.user.login} - border color updated: ${updateUserAvatarDto.borderColor} - background color updated: ${updateUserAvatarDto.backgroundColor}`;
    } catch (error) {
      rep.message = error.message;
      rep.error = error;
    }

    return rep;
  }

  public async updateAvatar(avatarId: number, avatar: Avatar) {
    await this.avatarRepository.update(avatarId, {
      ...avatar,
    });
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~ tools ~~~~~~~~~~~~~~~~~~~~~~ */

  private async createDefaultAvatar() {
    const avatar: AvatarDto = {
      image: '',
      text: '',
      variant: 'circular',
      borderColor: '#22d3ee',
      backgroundColor: '#22d3ee',
      empty: true,
      decrypt: false,
    };

    return await this.avatarRepository.save(avatar);
  }

  private log(message?: any) {
    const cyan = '\x1b[36m';
    const stop = '\x1b[0m';

    if (!process.env || !process.env.ENVIRONNEMENT || process.env.ENVIRONNEMENT !== "dev") return;

    process.stdout.write(cyan + '[Avatar service]  ' + stop);
    console.log(message);
  }
}
