import { IsEmail, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  token!: string;
}

export class UpdateProfileDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class CreateInviteDto {
  @Transform(({ value }) => String(value || '').trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  plan?: 'pdf' | 'basic' | 'workbook' | 'igent7' | 'igent30' | 'igent90' | 'group' | 'vip';

  @IsOptional()
  @Transform(({ value }) => value === '' || value == null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
