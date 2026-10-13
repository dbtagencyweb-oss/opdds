import { Body, Controller, Delete, Get, Header, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateLeadDto } from './leads.dto';
import { LeadFilters, LeadsService } from './leads.service';

function filtersFrom(query: Record<string, string | undefined>): LeadFilters {
  return { de: query.de, ate: query.ate, pilar: query.pilar, status: query.status, origem: query.origem, q: query.q };
}

@Controller('admin/leads')
@UseGuards(JwtAuthGuard, AdminGuard)
export class LeadsAdminController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@Query() query: Record<string, string | undefined>) {
    return this.leads.list(filtersFrom(query), Number(query.page) || 1, Number(query.pageSize) || 50);
  }

  @Get('resumo')
  resumo(@Query() query: Record<string, string | undefined>) {
    return this.leads.resumo(filtersFrom(query));
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="leads-quiz.csv"')
  exportCsv(@Query() query: Record<string, string | undefined>) {
    return this.leads.exportCsv(filtersFrom(query));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateLeadDto) {
    return this.leads.update(id, body);
  }

  // Declarada antes de ':id' para "por-contato" não ser lido como id.
  @Delete('por-contato')
  removeByContact(@Query('whatsapp') whatsapp?: string, @Query('email') email?: string) {
    return this.leads.removeByContact({ whatsapp, email });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leads.remove(id);
  }
}
