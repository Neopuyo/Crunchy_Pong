/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Put,
  Request,
} from '@nestjs/common';
import { AvatarService } from '../service/avatar.service';
import { UpdateUserAvatarDto } from '../dto/update-user-avatar.dto';
import { AvatarDto } from '../dto/Avatar.dto';

@Controller('avatar')
export class AvatarController {
  constructor(
    private readonly avatarService: AvatarService,
  ) {}

  @Get(':id/:isChannel')
  async getAvatarById(
    @Param('id', ParseIntPipe) id: number,
    @Param('isChannel', ParseBoolPipe) isChannel: boolean,
  ) {
    return await this.avatarService.getAvatarById(id, isChannel);
  }

  @Put()
  async updateUserAvatar(
    @Request() req,
    @Body() updateUserAvatarDto: UpdateUserAvatarDto,
  ) {
    return await this.avatarService.editChannelAvatarColors(req, updateUserAvatarDto);
  }

  @Put('avatarUser')
  async updateUserAvatarUser(@Request() req, @Body() avatar: AvatarDto) {
    return await this.avatarService.editUserAvatar(req.user.id, avatar);
  }
}
