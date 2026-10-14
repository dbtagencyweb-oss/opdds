import { Body, Controller, ForbiddenException, Get, Header, HttpCode, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { clientIp } from '../common/client-ip';
import { getLeadsCorsOrigins } from '../config/env';
import { CreateLeadDto } from './leads.dto';
import {
  CSP_ENVIAR_CARTA,
  paginaConfirmarDescadastro,
  paginaDescadastrado,
  paginaEnviarCarta,
  paginaLinkExpirado,
  paginaLinkInvalido,
} from './descadastro-page';
import { assinaturaValida } from './alerta';
import { PILARES } from './pilares';
import { primeiroNome } from './cartas';
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

  // Link do rodapé do e-mail da carta: só mostra a confirmação.
  @Throttle({ default: { limit: 20, ttl: 600_000 } })
  @Get('descadastrar')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async confirmarDescadastro(@Query('t') token?: string, @Res({ passthrough: true }) res?: Response) {
    const lead = await this.leads.findByToken(String(token || ''));
    if (!lead) {
      res?.status(404);
      return paginaLinkInvalido();
    }
    return paginaConfirmarDescadastro(lead.cartaToken);
  }

  @Throttle({ default: { limit: 20, ttl: 600_000 } })
  @Post('descadastrar')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async descadastrar(@Body('t') token?: string, @Res({ passthrough: true }) res?: Response) {
    const ok = await this.leads.descadastrar(String(token || ''));
    if (!ok) {
      res?.status(404);
      return paginaLinkInvalido();
    }
    return paginaDescadastrado();
  }

  // Botão "Enviar carta no WhatsApp" dos avisos (e-mail/CallMeBot). O GET só
  // mostra a página que se envia sozinha; o POST marca e redireciona ao wa.me.
  @Throttle({ default: { limit: 30, ttl: 600_000 } })
  @Get(':id/whatsapp')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  async paginaWhatsapp(
    @Param('id') id: string,
    @Query('e') expira: string,
    @Query('s') sig: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Content-Security-Policy', CSP_ENVIAR_CARTA);
    const lead = assinaturaValida(id, expira, sig) ? await this.leads.findById(id) : null;
    if (!lead) {
      res.status(404);
      return paginaLinkExpirado();
    }
    return paginaEnviarCarta(primeiroNome(lead.nome), PILARES[lead.pilarResultado] ?? lead.pilarResultado);
  }

  @Throttle({ default: { limit: 30, ttl: 600_000 } })
  @Post(':id/whatsapp')
  async enviarWhatsapp(
    @Param('id') id: string,
    @Query('e') expira: string,
    @Query('s') sig: string,
    @Res() res: Response,
  ) {
    const lead = assinaturaValida(id, expira, sig) ? await this.leads.findById(id) : null;
    if (!lead) {
      res.status(404).setHeader('Content-Security-Policy', CSP_ENVIAR_CARTA);
      res.type('html').send(paginaLinkExpirado());
      return;
    }
    res.redirect(303, await this.leads.marcarCartaEnviada(lead));
  }
}
