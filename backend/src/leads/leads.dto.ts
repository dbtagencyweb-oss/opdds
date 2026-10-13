import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  Equals,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { PILAR_CODES } from './pilares';
import { normalizeWhatsapp } from './phone';

export const LEAD_STATUSES = ['novo', 'carta_enviada', 'em_conversa', 'comprou', 'descadastrado'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const trimmed = ({ value }: { value: any }) => (value == null ? value : String(value).trim());
const emptyToUndefined = ({ value }: { value: any }) => {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text === '' ? undefined : text;
};

// Contrato: LEIA-ME-backend-quiz.md (POST {apiUrl}/leads).
export class CreateLeadDto {
  @Transform(trimmed)
  @IsString()
  @Length(1, 80)
  nome!: string;

  @Transform(({ value }) => normalizeWhatsapp(value))
  @Matches(/^\d{10,11}$/, { message: 'whatsapp deve ter DDD + número (10 ou 11 dígitos).' })
  whatsapp!: string;

  @IsOptional()
  @Transform(({ value }) => (value == null || String(value).trim() === '' ? undefined : String(value).trim().toLowerCase()))
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @Equals(true, { message: 'É preciso aceitar receber o resultado para enviar o contato.' })
  consentimento!: boolean;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(300)
  prologo?: string;

  @IsIn(PILAR_CODES)
  pilarResultado!: string;

  // pilarNome e ato vêm do quiz, mas o servidor deriva os dois do código.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  pilarNome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  ato?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  cartaUrl?: string;

  @IsArray()
  @ArrayMaxSize(12)
  @IsInt({ each: true })
  @Min(0, { each: true })
  pontuacoes!: number[];

  @IsOptional()
  @IsObject()
  utms?: Record<string, unknown>;

  @Transform(trimmed)
  @IsString()
  @Length(8, 100)
  eventId!: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  fbc?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  fbp?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(2000)
  pageUrl?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsIn(LEAD_STATUSES)
  status?: LeadStatus;

  // String vazia limpa a observação.
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  observacao?: string;

  // true marca a carta como enviada agora.
  @IsOptional()
  @IsBoolean()
  cartaEnviada?: boolean;
}
