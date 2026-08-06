import { IsString, IsOptional, MaxLength } from 'class-validator';

export class GenerateCanvasDto {
  @IsString()
  @MaxLength(500)
  prompt: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  context?: string;

  @IsString()
  @IsOptional()
  canvasId?: string;
}
