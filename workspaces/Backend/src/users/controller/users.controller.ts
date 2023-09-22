/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { Public } from 'src/utils/decorators/public.decorator';
import 'src/utils/extensions/stringExtension';
import { EditUserDto } from '../dto/EditUser.dto';
import { AvatarService } from '@/avatar/service/avatar.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly avatarService: AvatarService,
  ) {}

  @Get('me')
  async getUserProfile(@Request() req) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user');

      return user;
    }
    catch (error) {
      throw new NotFoundException();
    }
  }

  // GET user + his dependency avatar
  @Get('myAvatar')
  getUserProfileWithAvatar(@Request() req) {
    const user = this.usersService.getUserAvatar(req.user.id);

    if (!user) throw new NotFoundException();

    return user;
  }

  @Get('profile/:id')
  async getUserByLogin(@Param('id') id: number) {
    const user = await this.usersService.getUserById(id);

    if (!user) throw new NotFoundException();

    return user;
  }

  @Public()
  @Get('email')
  async checkDoubleEmail(@Query('email') email: string) {
    const decodeUrl = decodeURIComponent(email);
    const user = await this.usersService.getUserByEmail(decodeUrl, 'email');

    if (user)
      return {
        exists: true,
      };
    return {
      exists: false,
    };
  }

  @Get('login')
  async checkDoubleLogin(@Query('login') login: string) {
    try {
      const decodeUrl = decodeURIComponent(login);
      const user = await this.usersService.getUserByLogin(decodeUrl);

      if (user) return { exists: true };
      return { exists: false };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Put()
  async editUser(@Request() req, @Body('properties') properties: EditUserDto) {
    return await this.usersService.editUser(req.user.id, properties);
  }

  @Public()
  @Delete('disconnect/:id')
  async deleteTokens(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.usersService.getUserTokens(id);

      if (user) return await this.usersService.deleteAllUserTokens(user);
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
    }
  }

  @Delete('disconnectByToken')
  async deleteTokensByAccessToken(@Req() req) {
    try {
      const user = await this.usersService.getUserTokens(req.user.id);

      if (user) return await this.usersService.deleteAllUserTokens(user);
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
    }
  }

  @Put('changeLogin')
  async changeLogin(@Req() req, @Body() { login }: EditUserDto) {
    try {
      const user = await this.usersService.getUserAvatar(req.user.id);

      if (!user) throw new Error('no user found');

      const userWithLogin = await this.usersService.getUserByLogin(login);
      if (userWithLogin)
        return {
          success: false,
          error: 'exists',
        };

      this.usersService.updateUser(user.id, {
        login: login,
      });

      const avatar = user.avatar;
      if (avatar.text.length !== 0) {
        avatar.text = login.toUpperCase().slice(0, 3);
        await this.avatarService.updateAvatar(avatar.id, avatar);
      }

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Post('checkPassword')
  async checkPassword(@Req() req, @Body('password') password: string) {
    return await this.usersService.checkPassword(req.user.id, password);
  }

  @Put('updatePassword')
  async updatePassword(@Req() req, @Body('password') password: string) {
    return await this.usersService.updatePassword(req.user.id, password);
  }

  @Post('addImage')
  async addImage(
    @Req() req,
    @Body()
    {
      imageUrl,
      public_id,
    }: {
      imageUrl: string;
      public_id: string;
    },
  ) {
    return await this.usersService.addImage(req.user.id, imageUrl, public_id);
  }

  @Get('getImages')
  async getImages(@Req() req) {
    return await this.usersService.getImages(req.user.id);
  }

  @Delete('deleteImage')
  async deleteImage(@Body('imageId') imageId: number) {
    return await this.usersService.deleteImage(imageId);
  }
}
