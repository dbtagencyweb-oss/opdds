import { IsArray, IsEmail, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const plans = ['pdf', 'basic', 'workbook', 'igent30', 'igent90', 'group', 'vip'] as const;

export class AdminCreateInviteDto {
  @Transform(({ value }) => String(value || '').trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  name?: string;

  @IsIn(plans)
  plan!: typeof plans[number];

  @IsOptional()
  @Transform(({ value }) => value === '' || value == null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

export class AdminGrantPlanDto {
  @IsIn(plans)
  plan!: typeof plans[number];

  @IsOptional()
  @Transform(({ value }) => value === '' || value == null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

export class AdminGrantProductDto {
  @IsString()
  productKey!: string;

  @IsOptional()
  @Transform(({ value }) => value === '' || value == null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

export class AdminBookPageContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsString()
  content!: string;
}

export class AdminBookAudioDto {
  @IsString()
  @MaxLength(80)
  chapterId!: string;

  @IsString()
  @MaxLength(80)
  sectionKey!: string;

  @IsString()
  @MaxLength(120)
  label!: string;

  @IsString()
  @MaxLength(500)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;
}

export class AdminBookAudioMetaDto {
  @IsString()
  @MaxLength(80)
  chapterId!: string;

  @IsString()
  @MaxLength(80)
  sectionKey!: string;

  @IsOptional()
  @IsIn(['ok', 'review', 'record', 'placeholder'])
  productionStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  productionNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class AdminBookAudioOrderDto {
  @IsString()
  @MaxLength(80)
  chapterId!: string;

  @IsArray()
  @IsString({ each: true })
  sectionKeys!: string[];
}
