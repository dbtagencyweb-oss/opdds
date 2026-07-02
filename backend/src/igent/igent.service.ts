import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { EntitlementsService, PRODUCT_KEYS } from '../entitlements/entitlements.service';
import { PrismaService } from '../prisma/prisma.service';
import { MindChatDto, MindHistoryMessage } from './igent.dto';

type StoredMindMessage = MindHistoryMessage & {
  createdAt: string;
};

const MASTER_PROMPT = `
Voce e o iGentMIND, agente de leitura e presenca do livro O Poder dos Desacreditados.
Responda sempre em portugues do Brasil, com tom firme, humano e direto.
Voce nao diagnostica, nao faz terapia, nao promete cura e nao substitui cuidado profissional.
Seu trabalho e:
- acolher sem vitimizar;
- separar fato, julgamento e proximo gesto possivel;
- usar a linguagem do livro: presenca, reconhecimento, culpa silenciosa, continuidade;
- devolver uma pratica pequena e uma pergunta final clara.
Se houver indicio de risco imediato, automutilacao ou violencia, oriente procurar ajuda emergencial local e uma pessoa de confianca.
Nao invente capitulos, beneficios, dados medicos ou promessas. Seja breve: 2 a 5 paragrafos curtos.
`.trim();

@Injectable()
export class IGentService {
  private readonly logger = new Logger(IGentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
  ) {}

  async chat(userId: string, dto: MindChatDto) {
    await this.ensureMindAccess(userId);

    const cleanMessage = dto.message.trim();
    const context = this.safeContext(dto.context);
    const history = this.cleanHistory(dto.messages);
    const session = dto.sessionId
      ? await this.prisma.mindSession.findFirst({ where: { id: dto.sessionId, userId } })
      : null;

    const answer = await this.generateAnswer(cleanMessage, history, context, dto.topic);
    const createdAt = new Date().toISOString();
    const previousMessages = Array.isArray(session?.messages) ? (session?.messages as StoredMindMessage[]) : [];
    const nextMessages: StoredMindMessage[] = [
      ...previousMessages,
      { role: 'user' as const, content: cleanMessage, createdAt },
      { role: 'assistant' as const, content: answer.message, createdAt },
    ].slice(-80);

    const saved = session
      ? await this.prisma.mindSession.update({
          where: { id: session.id },
          data: {
            topic: dto.topic || session.topic,
            messages: nextMessages as any,
          },
        })
      : await this.prisma.mindSession.create({
          data: {
            userId,
            topic: dto.topic,
            messages: nextMessages as any,
          },
        });

    return {
      sessionId: saved.id,
      message: answer.message,
      fallback: answer.fallback,
    };
  }

  private async ensureMindAccess(userId: string) {
    const [mind30, mind90, vip] = await Promise.all([
      this.entitlements.hasProduct(userId, PRODUCT_KEYS.igentMind30),
      this.entitlements.hasProduct(userId, PRODUCT_KEYS.igentMind90),
      this.entitlements.hasProduct(userId, PRODUCT_KEYS.vip),
    ]);

    if (!mind30 && !mind90 && !vip) {
      throw new ForbiddenException('iGentMIND nao liberado para este usuario.');
    }
  }

  private async generateAnswer(
    message: string,
    history: MindHistoryMessage[],
    context: Record<string, unknown>,
    topic?: string,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { message: this.fallbackAnswer(message, topic), fallback: true };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.55,
          max_tokens: 650,
          messages: [
            { role: 'system', content: MASTER_PROMPT },
            { role: 'user', content: this.contextPrompt(context, topic) },
            ...history.slice(-10),
            { role: 'user', content: message },
          ],
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        this.logger.warn(`OpenAI retornou ${response.status}: ${details.slice(0, 240)}`);
        return { message: this.fallbackAnswer(message, topic), fallback: true };
      }

      const data = await response.json();
      const content = String(data?.choices?.[0]?.message?.content || '').trim();
      return { message: content || this.fallbackAnswer(message, topic), fallback: !content };
    } catch (error) {
      this.logger.warn(`Falha ao gerar resposta do iGentMIND: ${error instanceof Error ? error.message : String(error)}`);
      return { message: this.fallbackAnswer(message, topic), fallback: true };
    }
  }

  private contextPrompt(context: Record<string, unknown>, topic?: string) {
    return [
      `Tema atual: ${topic || 'nao informado'}.`,
      'Use o contexto abaixo apenas se ele ajudar. Nao cite dados internos sem necessidade.',
      JSON.stringify(context).slice(0, 5000),
    ].join('\n\n');
  }

  private cleanHistory(messages?: MindHistoryMessage[]) {
    if (!Array.isArray(messages)) return [];
    return messages
      .filter((item) => (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 1800) }))
      .filter((item) => item.content);
  }

  private safeContext(context?: Record<string, unknown>) {
    if (!context || typeof context !== 'object') return {};
    return JSON.parse(JSON.stringify(context));
  }

  private fallbackAnswer(message: string, topic?: string) {
    const hint = topic ? ` sobre ${topic}` : '';
    const compact = message.length > 180 ? `${message.slice(0, 177)}...` : message;
    return [
      `Eu li o que voce trouxe${hint}. O ponto principal agora nao e resolver tudo de uma vez, e separar o peso real do julgamento que ficou colado nele.`,
      `O que aparece aqui: "${compact}". Trate isso como material de reconhecimento, nao como sentenca sobre quem voce e.`,
      'Plano de presenca: escreva uma frase comecando com "o fato e..." e outra com "o medo esta dizendo...". Depois escolha um gesto pequeno para as proximas horas.',
      'Qual parte disso precisa ser reconhecida antes de ser corrigida?',
    ].join('\n\n');
  }
}
