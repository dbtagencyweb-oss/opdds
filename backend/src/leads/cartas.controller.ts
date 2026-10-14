import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';

// Pública: chamada pela página da carta na LP. CORS só da LP (main.ts).
@Controller('cartas')
export class CartasController {
  constructor(private readonly leads: LeadsService) {}

  @Throttle({ default: { limit: 30, ttl: 600_000 } })
  @Get('abrir')
  async abrir(@Query('t') token?: string, @Query('preview') preview?: string) {
    const dados = await this.leads.abrirCarta(String(token || ''), preview === '1');
    // Token inexistente ou lead excluído: 404 sem detalhes.
    if (!dados) throw new NotFoundException();
    return dados;
  }
}
