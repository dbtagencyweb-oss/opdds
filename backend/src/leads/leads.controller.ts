import { Body, Controller, ForbiddenException, Get, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { clientIp } from '../common/client-ip';
import { getLeadsCorsOrigins } from '../config/env';
import { CreateLeadDto } from './leads.dto';
import { LeadsService } from './leads.service';

// Rotas públicas do quiz da LP. O CORS delas é configurado à parte no main.ts.
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // A LP chama ao abrir o quiz só para acordar o Render; não toca no banco.
  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post()
  async create(@Body() body: CreateLeadDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // O CORS só barra a leitura no navegador; aqui a origem errada nem grava.
    const origin = req.headers.origin;
    if (origin && !getLeadsCorsOrigins().includes(origin)) {
      throw new ForbiddenException('Origem não permitida.');
    }

    const result = await this.leads.create(body, {
      ip: clientIp(req) || null,
      userAgent: String(req.headers['user-agent'] || '').slice(0, 500) || null,
    });

    if (result.duplicate) res.status(200);
    return { ok: true };
  }
}
