import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class ReaderJourneyDto {
  @IsOptional()
  @IsString()
  workbookEntry?: string;

  @IsOptional()
  @IsObject()
  workbookAnswers?: Record<string, string>;

  @IsOptional()
  @IsObject()
  canonicalJournalAnswers?: Record<string, string>;

  @IsOptional()
  @IsString()
  workbookPrompt?: string;

  @IsOptional()
  @IsObject()
  letters?: Record<string, string>;

  @IsOptional()
  @IsObject()
  letterMeta?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  readerNotes?: unknown[];

  @IsOptional()
  @IsArray()
  anchors?: unknown[];

  @IsOptional()
  @IsObject()
  audioProgress?: Record<string, unknown>;
}
