import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCanvasDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  settings?: Record<string, any>;
}
