import { Socket } from 'socket.io';
import { ColoredLogger } from '../colored-logger';

export class UserInfo {
  public pingSend = 0;
  private readonly logger: ColoredLogger;

  constructor(
    public id: number,
    public socket: Socket,
    public gameId: string,
    public isPlayer: boolean,
  ) {
    this.logger = new ColoredLogger(UserInfo.name);
  }

  public sendPing(): void {
    this.socket.emit('ping');
    this.pingSend++;
  }
}
