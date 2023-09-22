/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  // Container of user status updates : Map<userId, status>
  // status = "connected", "disconnected", "in game"
  public status: Map<string, string> = new Map<string, string>();
  public updateStatus: Map<string, string> = new Map<string, string>();

  public add(userId: string, status: 'connected' | 'disconnected' | 'in game') {
    if (status === 'disconnected' && this.status.has(userId))
      this.status.delete(userId);
    else this.status.set(userId, status);

    this.updateStatus.set(userId, status);
  }

  public remove(updateStatus: Map<string, string>) {
    for (const status of updateStatus) {
      if (
        this.updateStatus.has(status[0]) &&
        this.updateStatus.get(status[0]) === status[1]
      )
        this.updateStatus.delete(status[0]);
    }
  }
}
