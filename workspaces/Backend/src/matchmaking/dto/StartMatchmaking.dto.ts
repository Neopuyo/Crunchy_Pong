import { IsNotEmpty, IsString } from 'class-validator';

export default class StartMatchmakingDTO {
  @IsNotEmpty()
  @IsString()
  type: 'Classic' | 'Best3' | 'Best5';
}
