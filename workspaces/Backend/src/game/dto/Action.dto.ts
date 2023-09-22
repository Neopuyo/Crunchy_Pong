import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Action } from '@transcendence/shared/types/Game.types';

export class ActionDTO {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  move: Action;

  @IsString()
  @IsNotEmpty()
  playerSide: 'Left' | 'Right';
}
