/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/utils/typeorm/Message.entity';
import { MessagesService } from './messages.service';
import { ChannelModule } from '@/channels/channel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ChannelModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessageModule {}
