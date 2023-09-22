/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AvatarController } from './controller/avatar.controller';
import { AvatarService } from './service/avatar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from 'src/utils/typeorm/Avatar.entity';
import { UsersModule } from '@/users/users.module';
import { ChannelModule } from '@/channels/channel.module';
import { forwardRef } from '@nestjs/common';
import { CryptoService } from '@/utils/crypto/crypto';

@Module({
  imports: [
    TypeOrmModule.forFeature([Avatar]),
    ChannelModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AvatarController],
  providers: [AvatarService, CryptoService],
  exports: [AvatarService],
})
export class AvatarModule {}
