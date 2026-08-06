import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsString()
  @IsOptional()
  context?: string;
}
