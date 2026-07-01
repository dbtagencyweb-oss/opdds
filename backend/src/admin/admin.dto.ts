import { IsEmail, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const plans = ['pdf', 'basic', 'workbook', 'igent30', 'igent90', 'group', 'vip'] as const;

export class AdminCreateInviteDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsIn(plans)
  plan!: typeof plans[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

export class AdminGrantPlanDto {
  @IsIn(plans)
  plan!: typeof plans[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

export class AdminGrantProductDto {
  @IsString()
  productKey!: string;

  @IsOptional()
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
