import { IsArray, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export type MindRole = 'user' | 'assistant';

export type MindHistoryMessage = {
  role: MindRole;
  content: string;
};

export class MindChatDto {
  @IsString()
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsArray()
  messages?: MindHistoryMessage[];

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
