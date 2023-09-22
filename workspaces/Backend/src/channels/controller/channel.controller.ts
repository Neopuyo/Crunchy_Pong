import { UserChannelRelation } from '@/utils/typeorm/UserChannelRelation';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Request,
} from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { EditChannelRelationDto } from '../dto/EditChannelRelation.dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get(':id')
  async getChannelById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    try {
      return await this.channelService.getChannelUsersRelations(
        req.user.id,
        id,
      );
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('/relation/:id')
  async getSelfChannelRelation(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReturnDataTyped<UserChannelRelation>> {
    try {
      const repChannelAndRelation =
        await this.channelService.getOneChannelUserRelation(req.user.id, id);
      if (
        repChannelAndRelation.data &&
        repChannelAndRelation.data.channel &&
        repChannelAndRelation.data.channel.password
      )
        repChannelAndRelation.data.channel.password = '';
      return repChannelAndRelation;
    } catch (e: any) {
      return {
        success: false,
        message: e.message,
        error: e,
      };
    }
  }

  @Put('editRelation')
  async editRelation(@Request() req, @Body() edit: EditChannelRelationDto) {
    let rep: ReturnData = {
      success: false,
      message: '',
    };

    try {
      const checkRep = await this.channelService.checkEditAuthorization(
        req.user.id,
        edit,
      );
      if (!checkRep.success) throw new Error(checkRep.message);

      rep = await this.channelService.editRelation(req.user.id, edit);
      if (!rep.success) throw new Error(rep.message);
    } catch (error) {
      rep.success = false;
      rep.message = error.message;
    }

    return rep;
  }
}
