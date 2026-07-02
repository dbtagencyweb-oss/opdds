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
  sessionId?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsArray()
  messages?: MindHistoryMessage[];

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
