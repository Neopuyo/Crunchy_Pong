import {
  Controller,
  Post,
  Get,
  Req,
  UsePipes,
  ValidationPipe,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { LobbyService } from '../service/lobby.service';
import { Public } from 'src/utils/decorators/public.decorator';
import { CreateGameDTO } from '@/game/dto/CreateGame.dto';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  // 00 - api/lobby/status
  @Public()
  @Get('status')
  Status() {
    return 'Working !';
  }

  // 01 - api/lobby/create
  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  CreateGame(@Req() req, @Body() game: CreateGameDTO) {
    return this.lobbyService.CreateGame(req.user.id, game);
  }

  // 02 - api/lobby/userInGame
  @Get('userInGame')
  userInGame(@Req() req) {
    return this.lobbyService.IsInGame(req.user.id);
  }

  // 03 - api/lobby/otherInGame/:userId
  @Get('otherInGame/:userId')
  otherInGame(@Param('userId', ParseIntPipe) userId: number) {
    return this.lobbyService.IsInGame(userId);
  }

  // 04 - api/lobby/ongoingInvite/:inviterId
  @Get('ongoingInvite/:inviterId')
  ongoingInvite(@Param('inviterId', ParseIntPipe) inviterId: number) {
    return this.lobbyService.OngoingInvite(inviterId);
  }

  // 05 - api/lobby/getCurrentGame/:mode?
  @Get('getCurrentGame/:mode?')
  GetCurrentGame(@Param('mode') mode?: 'League' | 'Party') {
    return this.lobbyService.GetCurrentGame(mode);
  }

  // 06 - api/lobby/GetLeague
  @Get('getLeaderboard')
  GetLeaderboard() {
    return this.lobbyService.GetLeaderboard();
  }

  // 07 - api/lobby/join
  @Put('join/:gameId')
  JoinGame(@Req() req, @Param('gameId') gameId: string) {
    return this.lobbyService.JoinGame(req.user.id, gameId);
  }

  // 08 - api/lobby/quit
  @Post('quit')
  Quit(@Req() req) {
    return this.lobbyService.Quit(req.user.id);
  }
}
