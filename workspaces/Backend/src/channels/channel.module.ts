/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ChannelController } from './controller/channel.controller';
import { ChannelService } from './service/channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/utils/typeorm/Channel.entity';
import { Avatar } from 'src/utils/typeorm/Avatar.entity';
import { UserChannelRelation } from 'src/utils/typeorm/UserChannelRelation';
import { CryptoService } from '@/utils/crypto/crypto';
import { UsersModule } from '@/users/users.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Avatar, Channel, UserChannelRelation]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ChannelController],
  providers: [ChannelService, CryptoService],
  exports: [ChannelService],
})
export class ChannelModule {}
