import { describe, expect, it, vi } from 'vitest';
import { IGentService } from '../../backend/src/igent/igent.service';

const createService = () => {
  const prisma = {
    readerProgress: { findMany: vi.fn(async () => []) },
    favorite: { findMany: vi.fn(async () => []) },
    workbookEntry: { findMany: vi.fn(async () => []) },
    mindSession: { findMany: vi.fn(async () => []) },
  };
  const workbookService = { buildJourneyContext: vi.fn(async () => '') };
  const service = new IGentService(prisma as any, {} as any, workbookService as any);
  return { service, prisma, workbookService };
};

describe('orquestração do iGentMIND no backend', () => {
  it('entrega ao provedor a sequência guiada compacta e avisa que a síntese terminou', () => {
    const { service } = createService();
    const prompt = (service as any).contextPrompt({
      privacy: {},
      mindFlow: {
        entryIntent: 'reflect',
        territory: 'Trabalho',
        limiar: 'merecimento ligado à produtividade',
        triageComplete: true,
        triageAnswers: [
          { question: 'Onde preciso produzir para merecer estar aqui?', option: 'Eu reconheço que isso está acontecendo comigo.' },
          { question: 'Que acusação aparece quando descanso?', open_answer: 'Eu me chamo de preguiçoso.' },
        ],
        canonicalSchema: { payloadQueNaoDeveDominarOPrompt: 'x'.repeat(5000) },
      },
    }, '', 'Referência canônica do capítulo Trabalho.', 'Trabalho', 'workbook');

    expect(prompt).toContain('Percurso guiado concluído: sim; não reabrir questionário');
    expect(prompt).toContain('Onde preciso produzir para merecer estar aqui?');
    expect(prompt).toContain('Eu me chamo de preguiçoso.');
    expect(prompt).not.toContain('payloadQueNaoDeveDominarOPrompt');
  });

  it('não consulta progresso, Diário ou sessões quando o leitor não autorizou', async () => {
    const { service, prisma, workbookService } = createService();
    await (service as any).buildReaderContext('reader-1', { privacy: {} });

    expect(prisma.readerProgress.findMany).not.toHaveBeenCalled();
    expect(prisma.favorite.findMany).not.toHaveBeenCalled();
    expect(prisma.workbookEntry.findMany).not.toHaveBeenCalled();
    expect(prisma.mindSession.findMany).not.toHaveBeenCalled();
    expect(workbookService.buildJourneyContext).toHaveBeenCalledWith('reader-1', expect.objectContaining({
      diary: false,
      caderno: false,
      pastSessions: false,
      readingProgress: false,
    }));
  });
});
