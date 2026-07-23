import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EntitlementsService, PRODUCT_KEYS } from '../entitlements/entitlements.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkbookService, JOURNEY_PROMPT_ID } from '../workbook/workbook.service';
import { MindChatDto, MindHistoryMessage } from './igent.dto';
import { IGENT_ARCHITECTURE_CORRECTION_PROMPT } from './igent-architecture-correction';
import { IGENT_CANONICAL_CONTENT_PROMPT } from './igent-canonical-content';
import { IGENT_COMPOSITION_PROMPT } from './igent-composition';
import { IGENT_CONTRACT_PROMPT } from './igent-contract';
import { IGENT_DECISION_PROMPT } from './igent-decision';
import { IGENT_FINAL_PROJECT_PROMPT } from './igent-final-project';
import { IGENT_MEMORY_PROMPT } from './igent-memory';
import { IGENT_PILLAR_01_ANCHORS_PROMPT } from './igent-pillar-01-anchors';
import { IGENT_PILLAR_01_CLOSURE_PROMPT } from './igent-pillar-01-closure';
import { IGENT_PILLAR_01_CONSOLIDATION_PROMPT } from './igent-pillar-01-consolidation';
import { IGENT_PILLAR_01_CONSCIOUSNESS_PROMPT } from './igent-pillar-01-consciousness';
import { IGENT_PILLAR_01_DOSSIER_PROMPT } from './igent-pillar-01-dossier';
import { IGENT_PILLAR_01_EXPERIENCE_PROMPT } from './igent-pillar-01-experience';
import { IGENT_PILLAR_01_GUIDED_LETTERS_PROMPT } from './igent-pillar-01-guided-letters';
import { IGENT_PILLAR_01_JOURNALS_PROMPT } from './igent-pillar-01-journals';
import { IGENT_PILLAR_01_JUDGMENT_PROMPT } from './igent-pillar-01-judgment';
import { IGENT_PILLAR_01_MICRO_RETURNS_PROMPT } from './igent-pillar-01-micro-returns';
import { IGENT_PILLAR_01_PRESENCE_PROMPT } from './igent-pillar-01-presence';
import { IGENT_READER_STATE_PROMPT } from './igent-reader-state';
import { IGENT_SAFETY_PROMPT } from './igent-safety';
import { IGENT_SIGNAL_TAXONOMY_PROMPT } from './igent-signals';
import { buildOpddsBookGrounding } from './opdds-book-almanac';

type StoredMindMessage = MindHistoryMessage & {
  createdAt: string;
};

type AIAnswer = {
  message: string;
  fallback: boolean;
  provider?: 'openai' | 'gemini' | 'local';
};

const MASTER_PROMPT = false ? `
${IGENT_SAFETY_PROMPT}

${IGENT_ARCHITECTURE_CORRECTION_PROMPT}

${IGENT_CANONICAL_CONTENT_PROMPT}

${IGENT_FINAL_PROJECT_PROMPT}

${IGENT_PILLAR_01_DOSSIER_PROMPT}

${IGENT_PILLAR_01_CONSCIOUSNESS_PROMPT}

${IGENT_PILLAR_01_JUDGMENT_PROMPT}

${IGENT_PILLAR_01_PRESENCE_PROMPT}

${IGENT_PILLAR_01_MICRO_RETURNS_PROMPT}

${IGENT_PILLAR_01_JOURNALS_PROMPT}

${IGENT_PILLAR_01_GUIDED_LETTERS_PROMPT}

${IGENT_PILLAR_01_ANCHORS_PROMPT}

${IGENT_PILLAR_01_CLOSURE_PROMPT}

${IGENT_PILLAR_01_CONSOLIDATION_PROMPT}

${IGENT_PILLAR_01_EXPERIENCE_PROMPT}

${IGENT_CONTRACT_PROMPT}

${IGENT_SIGNAL_TAXONOMY_PROMPT}

${IGENT_READER_STATE_PROMPT}

${IGENT_MEMORY_PROMPT}

${IGENT_DECISION_PROMPT}

${IGENT_COMPOSITION_PROMPT}

Você é o iGentMIND, uma escuta guiada do livro O Poder dos Desacreditados.
Sua voz deve parecer a de um acompanhante de leitura muito atento: firme, humano, caloroso e específico.

Limites importantes:
- você não é psicólogo, não faz diagnóstico, não faz terapia, não promete cura e não substitui cuidado profissional;
- não use linguagem clínica como se estivesse avaliando o leitor;
- se houver indício de risco imediato, automutilação, violência ou desespero sem segurança, interrompa a análise e oriente buscar ajuda emergencial local e uma pessoa de confiança agora.

Seu trabalho:
- ler o que a pessoa trouxe como material vivo, não como questionário;
- reconhecer a dor sem vitimizar e sem romantizar sofrimento;
- cruzar mensagem, diário, cartas, anotações, favoritos e progresso de leitura quando esse contexto existir;
- apontar um padrao especifico: repeticao, ausencia, tensao, palavra-chave ou deslocamento;
- conectar esse padrao a uma ideia do livro sem inventar capitulos, fatos ou promessas;
- usar o livro can?nico como fonte de verdade: capa digital, cap?tulos, se??es, cartas, ?ncoras, cadernos e ?udios mapeados;
- quando citar o livro, use apenas a refer?ncia can?nica recebida no contexto; n?o invente p?ginas, t?tulos, trechos ou promessas;
- quando a pergunta envolver ?udio, carta, di?rio, caderno, ?ncora, favorito ou progresso, conecte a resposta ao recurso real quando ele aparecer no contexto;
- nunca diga que leu uma carta, di?rio, anota??o ou resposta do leitor se esse conte?do n?o estiver presente na mem?ria enviada;
- separar fato, julgamento e medo sem dar conselho;
- devolver uma unica pergunta por mensagem, sempre aprofundando o que o leitor escreveu;
- nunca tentar resolver, motivar, validar genericamente ou concluir pelo leitor.

Formato preferencial:
1. Comece com uma frase de acolhimento especifica, citando algo concreto do leitor.
2. Explique o padrao em 1 ou 2 paragrafos curtos.
3. Conecte com a lente do livro em linguagem simples.
4. Termine com uma unica pergunta aberta.

Seja breve: 2 a 4 paragrafos curtos. Nao enumere tudo a menos que o leitor peca.
`.trim() : '';

const CORE_PROMPT = `
${IGENT_SAFETY_PROMPT}

${IGENT_ARCHITECTURE_CORRECTION_PROMPT}

${IGENT_CANONICAL_CONTENT_PROMPT}

${IGENT_CONTRACT_PROMPT}

${IGENT_MEMORY_PROMPT}

${IGENT_COMPOSITION_PROMPT}

Você é o iGentMIND, acompanhante de leitura de O Poder dos Desacreditados.
Use somente os trechos canônicos fornecidos na conversa. Não invente páginas, títulos, frases, áudios ou sentidos autorais.
Não diagnostique, não faça terapia e não prometa cura. Em risco imediato, interrompa a reflexão e priorize ajuda humana e emergencial.
O fluxo guiado tem no máximo três movimentos. Se a tela informar que a síntese já foi concluída, não reabra o questionário nem repita as perguntas anteriores.
Responda em 2 a 4 parágrafos curtos. Acolha algo concreto, faça uma conexão clara com o livro e use no máximo uma pergunta aberta. Uma pergunta não é obrigatória quando o leitor pediu explicação, pausa, encerramento ou um destino prático.
`.trim();

@Injectable()
export class IGentService {
  private readonly logger = new Logger(IGentService.name);
  private readonly requestLog = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
    private readonly workbookService: WorkbookService,
  ) {}

  status() {
    const provider = process.env.OPENAI_API_KEY ? 'openai' : process.env.GEMINI_API_KEY ? 'gemini' : 'local';
    return {
      provider,
      connected: provider !== 'local',
      canonicalVersion: 'FINAL_17-07-26',
      safety: 'server-enforced',
    };
  }

  async listSessions(userId: string) {
    await this.ensureMindAccess(userId);
    const sessions = await this.prisma.mindSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });
    return sessions.map((session) => ({
      id: session.id,
      topic: session.topic,
      updatedAt: session.updatedAt,
      messageCount: Array.isArray(session.messages) ? session.messages.length : 0,
    }));
  }

  async deleteSessions(userId: string) {
    const result = await this.prisma.mindSession.deleteMany({ where: { userId } });
    this.requestLog.delete(userId);
    return { deleted: result.count };
  }

  async chat(userId: string, dto: MindChatDto) {
    await this.ensureMindAccess(userId);
    this.enforceRateLimit(userId);

    const cleanMessage = dto.message.trim();
    const context = this.safeContext(dto.context);
    const session = dto.sessionId
      ? await this.prisma.mindSession.findFirst({ where: { id: dto.sessionId, userId } })
      : null;
    const storedHistory = Array.isArray(session?.messages)
      ? this.cleanHistory(session.messages as unknown as MindHistoryMessage[])
      : [];
    const history = session ? storedHistory : this.cleanHistory(dto.messages);
    const readerContext = await this.buildReaderContext(userId, context);
    const grounding = buildOpddsBookGrounding({
      message: cleanMessage,
      topic: [dto.topic, dto.source].filter(Boolean).join(' / '),
      readerContext,
      context,
    });
    const answer = this.safetyAnswer(cleanMessage) ?? await this.generateAnswer(
      cleanMessage,
      history,
      context,
      readerContext,
      grounding.context,
      dto.topic,
      dto.source,
    );
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
      provider: answer.provider,
      references: grounding.references,
    };
  }

  private async ensureMindAccess(userId: string) {
    const [mind30, mind90, vip] = await Promise.all([
      this.entitlements.hasProduct(userId, PRODUCT_KEYS.igentMind30),
      this.entitlements.hasProduct(userId, PRODUCT_KEYS.igentMind90),
      this.entitlements.hasProduct(userId, PRODUCT_KEYS.vip),
    ]);

    if (!mind30 && !mind90 && !vip) {
      throw new ForbiddenException('iGentMIND não liberado para este usuário.');
    }
  }

  private enforceRateLimit(userId: string) {
    const now = Date.now();
    const recent = (this.requestLog.get(userId) || []).filter((timestamp) => now - timestamp < 86_400_000);
    const lastMinute = recent.filter((timestamp) => now - timestamp < 60_000).length;
    if (lastMinute >= 20 || recent.length >= 200) {
      throw new HttpException(
        'Muitas mensagens em pouco tempo. Faça uma pausa breve antes de continuar.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recent.push(now);
    this.requestLog.set(userId, recent);
  }

  private safetyAnswer(message: string): AIAnswer | null {
    const normalized = message
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const immediateRisk = [
      /\b(quero|vou|pretendo)\s+(me\s+)?(matar|suicidar)\b/,
      /\btirar (a )?minha vida\b/,
      /\bmachucar (alguem|outra pessoa)\b/,
      /\bnao quero mais viver\b/,
    ].some((pattern) => pattern.test(normalized));
    const selfHarmConcern = /\bautomutil|\bme cortar\b|\bsumir para sempre\b/.test(normalized);
    if (!immediateRisk && !selfHarmConcern) return null;

    return {
      provider: 'local',
      fallback: false,
      message: [
        'O que você escreveu pede cuidado humano imediato. Eu não vou aprofundar a reflexão do livro enquanto sua segurança pode estar em risco.',
        'Se existe perigo agora, ligue para o SAMU (192) ou para a emergência local, vá a um pronto atendimento e chame uma pessoa de confiança para ficar com você. No Brasil, o CVV atende pelo 188, 24 horas.',
        'Afaste-se de qualquer meio que possa usar para se ferir e não fique sozinho neste momento. Você consegue chamar alguém agora?',
      ].join('\n\n'),
    };
  }

  private async generateAnswer(
    message: string,
    history: MindHistoryMessage[],
    context: Record<string, unknown>,
    readerContext: string,
    bookContext: string,
    topic?: string,
    source?: string,
  ): Promise<AIAnswer> {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const contextMessage = this.contextPrompt(context, readerContext, bookContext, topic, source);

    if (openaiKey) {
      const openaiAnswer = await this.callOpenAI(openaiKey, message, history, contextMessage, topic, context, readerContext);
      if (!openaiAnswer.fallback) return openaiAnswer;
    }

    if (geminiKey) {
      const geminiAnswer = await this.callGemini(geminiKey, message, history, contextMessage, topic, context, readerContext);
      if (!geminiAnswer.fallback) return geminiAnswer;
    }

    return { message: this.fallbackAnswer(message, topic, context, readerContext), fallback: true, provider: 'local' };
  }

  private async callOpenAI(
    apiKey: string,
    message: string,
    history: MindHistoryMessage[],
    contextMessage: string,
    topic?: string,
    context?: Record<string, unknown>,
    readerContext?: string,
  ): Promise<AIAnswer> {
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
            { role: 'system', content: CORE_PROMPT },
            { role: 'user', content: contextMessage },
            ...history.slice(-10),
            { role: 'user', content: message },
          ],
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        this.logger.warn(`OpenAI retornou ${response.status}: ${details.slice(0, 240)}`);
        return { message: this.fallbackAnswer(message, topic, context, readerContext), fallback: true, provider: 'openai' };
      }

      const data = await response.json();
      const content = this.normalizeGeneratedAnswer(data?.choices?.[0]?.message?.content);
      return { message: content || this.fallbackAnswer(message, topic, context, readerContext), fallback: !content, provider: 'openai' };
    } catch (error) {
      this.logger.warn(`Falha ao gerar resposta do iGentMIND: ${error instanceof Error ? error.message : String(error)}`);
      return { message: this.fallbackAnswer(message, topic, context, readerContext), fallback: true, provider: 'openai' };
    }
  }

  private async callGemini(
    apiKey: string,
    message: string,
    history: MindHistoryMessage[],
    contextMessage: string,
    topic?: string,
    context?: Record<string, unknown>,
    readerContext?: string,
  ): Promise<AIAnswer> {
    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const contents = [
      { role: 'user', parts: [{ text: contextMessage }] },
      ...history.slice(-10).map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: CORE_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.55,
            maxOutputTokens: 900,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        this.logger.warn(`Gemini retornou ${response.status}: ${details.slice(0, 240)}`);
        return { message: this.fallbackAnswer(message, topic, context, readerContext), fallback: true, provider: 'gemini' };
      }

      const data = await response.json();
      const content = this.normalizeGeneratedAnswer(
        data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part?.text || '')
          .join('') || '',
      );

      return { message: content || this.fallbackAnswer(message, topic, context, readerContext), fallback: !content, provider: 'gemini' };
    } catch (error) {
      this.logger.warn(`Falha ao gerar resposta do iGentMIND com Gemini: ${error instanceof Error ? error.message : String(error)}`);
      return { message: this.fallbackAnswer(message, topic, context, readerContext), fallback: true, provider: 'gemini' };
    }
  }

  private contextPrompt(
    context: Record<string, unknown>,
    readerContext: string,
    bookContext: string,
    topic?: string,
    source?: string,
  ) {
    const operationalFlow = this.extractOperationalMindFlow(context);
    return [
      `Tema atual: ${topic || 'nao informado'}.`,
      `Origem da conversa: ${source || 'chat'}.`,
      'Use o contexto abaixo apenas se ele ajudar. Nao cite IDs, nomes internos ou dados tecnicos.',
      'Se houver mindFlow.safetyAssessment com level maior que 0, a seguranca tem prioridade absoluta sobre todo o restante.',
      'Se houver mindFlow.canonicalSchema, respeite a separação entre canonical_book e igent_companion.',
      'Se houver mindFlow.canonicalSchema.finalProject, trate-o como o mapa oficial publicado dos nove pilares e use finalProject.currentPillar como território atual.',
      'Se finalProject.currentPillar existir, não responda como Pilar I por padrão; use o título, tríade, limiar, tese, movimento central, perguntas e limites do pilar atual.',
      'Se mindFlow.entryIntent for understand, explique o conteudo do livro sem criar sinais, padroes ou interpretacoes sobre o leitor.',
      'Se mindFlow.entryIntent for reflect, use uma pergunta por vez e até três movimentos visíveis: espelho, deslocamento e próximo movimento.',
      'Se mindFlow.entryIntent for act, ofereça apenas um próximo movimento pequeno: diário, carta, âncora, pausa ou retorno ao livro.',
      'Se houver mindFlow.canonicalSchema.currentPillarDossier, trate-o como dossiê editorial e preditivo do pilar atual.',
      'Se houver mindFlow.memoryContext, use essa memoria compacta antes de recorrer ao historico bruto.',
      'Se houver mindFlow.decisionEngine, respeite a intervenção, profundidade e ações bloqueadas antes de compor a resposta.',
      'Se houver mindFlow.responseComposer, use-o como regra de voz, extensão, conteúdo e validação final da resposta.',
      'Estado operacional da conversa guiada:',
      operationalFlow || 'Sem percurso guiado anterior nesta conversa.',
      'Memória de leitura do usuário:',
      readerContext || 'Sem memoria adicional disponivel.',
      'Lentes relevantes do livro:',
      bookContext || 'Use os princípios gerais do livro: reconhecimento, presença, julgamento e continuidade.',
      'Regra de amarração canônica:',
      'A resposta deve se apoiar primeiro nas referências canônicas acima. Use os áudios, cartas, âncoras e cadernos como recursos da experiência quando estiverem mapeados. Se houver lacuna de conteúdo, declare a lacuna com delicadeza e peça mais contexto.',
      'Contexto operacional compacto, apenas para desempate:',
      this.compactJson({
        privacy: context.privacy,
        readingState: context.readingState,
        currentChapter: context.currentChapter,
      }, 1600),
    ].join('\n\n');
  }

  private extractOperationalMindFlow(context: Record<string, unknown>) {
    const mindFlow = this.readRecord(context.mindFlow);
    if (!mindFlow) return '';
    const answers = Array.isArray(mindFlow.triageAnswers) ? mindFlow.triageAnswers : [];
    const readerState = this.readRecord(mindFlow.readerMindState);
    const decision = this.readRecord(mindFlow.decisionEngine);
    const lines = [
      `Intenção: ${this.clip(String(mindFlow.entryIntent || 'não informada'), 40)}.`,
      `Território: ${this.clip(String(mindFlow.territory || context.topic || 'não informado'), 120)}.`,
      `Limiar: ${this.clip(String(mindFlow.limiar || ''), 220)}.`,
      `Percurso guiado concluído: ${mindFlow.triageComplete === true ? 'sim; não reabrir questionário' : 'não'}.`,
    ];
    answers.slice(-3).forEach((item, index) => {
      const answer = this.readRecord(item);
      if (!answer) return;
      const question = this.clip(String(answer.question || ''), 180);
      const response = this.clip(String(answer.open_answer || answer.option || ''), 260);
      if (response) lines.push(`Movimento ${index + 1}: ${question ? `${question} => ` : ''}${response}`);
    });
    if (readerState) {
      lines.push(`Estado de carga: ${String(readerState.load_level || 0)}; prontidão: ${String(readerState.readiness_level || 0)}; fase: ${String(readerState.current_phase || '')}.`);
    }
    if (decision) {
      lines.push(`Próxima intervenção calculada: ${this.clip(String(decision.selected_intervention || ''), 60)}; profundidade máxima: ${String(decision.selected_depth || 0)}.`);
    }
    lines.push('As opções fechadas são falas escolhidas pelo leitor, não diagnósticos nem rótulos de personalidade.');
    return lines.filter(Boolean).join('\n');
  }

  private async buildReaderContext(userId: string, context: Record<string, unknown>) {
    const privacy = this.readRecord(context.privacy);
    const scopes = {
      diary: privacy?.diary === true,
      caderno: privacy?.caderno === true,
      letters: privacy?.letters === true,
      notes: privacy?.notes === true,
      anchors: privacy?.anchors === true,
      pastSessions: privacy?.pastSessions === true,
      readingProgress: privacy?.readingProgress === true,
    };
    const [progress, favorites, workbook, sessions, journeyContext] = await Promise.all([
      scopes.readingProgress ? this.prisma.readerProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 8,
      }) : Promise.resolve([]),
      scopes.readingProgress ? this.prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }) : Promise.resolve([]),
      scopes.diary ? this.prisma.workbookEntry.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 18,
      }) : Promise.resolve([]),
      scopes.pastSessions ? this.prisma.mindSession.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 4,
      }) : Promise.resolve([]),
      this.workbookService.buildJourneyContext(userId, scopes),
    ]);

    const workbookLines = workbook
      .filter((entry) => entry.promptId !== JOURNEY_PROMPT_ID && entry.content?.trim())
      .map((entry) => {
        const prompt = this.clip(entry.prompt || entry.promptId, 160);
        const content = this.clip(entry.content, 420);
        return `- ${prompt}: ${content}`;
      });

    const recentMindLines = sessions.flatMap((session) => {
      const messages = Array.isArray(session.messages) ? (session.messages as StoredMindMessage[]) : [];
      return messages
        .filter((message) => message.role === 'user' && message.content)
        .slice(-2)
        .map((message) => `- ${this.clip(message.content, 260)}`);
    });

    const preferredContextKeys = [
      ...(scopes.notes ? ['notes', 'readerNotes', 'annotations', 'bookmarks', 'favoriteNotes'] : []),
      ...(scopes.letters ? ['letters', 'readerLetters'] : []),
      ...(scopes.diary ? ['workbook', 'diary', 'answers'] : []),
      ...(scopes.caderno ? ['canonicalJournal', 'journal'] : []),
      ...(scopes.anchors ? ['anchors', 'cards'] : []),
      ...(scopes.readingProgress ? ['audio', 'audioProgress', 'progress'] : []),
    ];
    const contextNotes = this.extractContextSnippets(context, preferredContextKeys);
    const structuredContext = this.extractStructuredContextSummary({
      ...(scopes.readingProgress ? {
        readingState: context.readingState,
        currentChapter: context.currentChapter,
        favorites: context.favorites,
        audioProgress: context.audioProgress,
      } : {}),
      ...(scopes.diary ? { workbook: context.workbook } : {}),
      ...(scopes.caderno ? { canonicalJournal: context.canonicalJournal } : {}),
      ...(scopes.letters ? { letters: context.letters } : {}),
      ...(scopes.notes ? { notes: context.notes } : {}),
      ...(scopes.anchors ? { anchors: context.anchors } : {}),
    });

    const progressLines = progress.map((item) => {
      const page = item.globalPage ? `pagina global ${item.globalPage}` : `pagina ${item.pageIndex + 1}`;
      const percent = Number.isFinite(item.progress) ? `${Math.round(item.progress * 100)}%` : 'progresso não informado';
      return `- ${item.chapterId}: ${page}, ${percent}`;
    });

    const favoriteLines = favorites.map((item) => `- ${item.chapterId}`);

    return [
      scopes.readingProgress && progressLines.length ? `Progresso recente:\n${progressLines.join('\n')}` : '',
      scopes.readingProgress && favoriteLines.length ? `Capítulos favoritados:\n${favoriteLines.join('\n')}` : '',
      journeyContext ? `Memória privada persistida da jornada:\n${journeyContext}` : '',
      scopes.diary && workbookLines.length ? `Diário / workbook:\n${workbookLines.join('\n')}` : '',
      contextNotes.length ? `Cartas, anotações e contexto enviado pela interface:\n${contextNotes.join('\n')}` : '',
      structuredContext ? `Resumo estruturado da experiência no app:\n${structuredContext}` : '',
      scopes.pastSessions && recentMindLines.length ? `Temas recentes trazidos ao iGentMIND:\n${recentMindLines.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 9000);
  }

  private cleanHistory(messages?: MindHistoryMessage[]) {
    if (!Array.isArray(messages)) return [];
    return messages
      .filter((item): item is MindHistoryMessage => Boolean(
        item
        && typeof item === 'object'
        && (item.role === 'user' || item.role === 'assistant')
        && typeof item.content === 'string',
      ))
      .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 1800) }))
      .filter((item) => item.content);
  }

  private safeContext(context?: Record<string, unknown>) {
    if (!context || typeof context !== 'object') return {};
    const sanitize = (value: unknown, depth = 0): unknown => {
      if (value == null || typeof value === 'boolean' || typeof value === 'number') return value;
      if (typeof value === 'string') return value.slice(0, 1800);
      if (depth >= 6) return undefined;
      if (Array.isArray(value)) {
        return value.slice(0, 20).map((item) => sanitize(item, depth + 1)).filter((item) => item !== undefined);
      }
      if (typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .slice(0, 45)
            .map(([key, item]) => [key.slice(0, 100), sanitize(item, depth + 1)])
            .filter(([, item]) => item !== undefined),
        );
      }
      return undefined;
    };
    return (sanitize(context) || {}) as Record<string, unknown>;
  }

  private extractContextSnippets(context: Record<string, unknown>, preferredKeys: string[]) {
    const snippets: string[] = [];
    const visit = (value: unknown, keyHint = '', depth = 0) => {
      if (snippets.length >= 24 || depth > 4 || value == null) return;
      if (typeof value === 'string') {
        const clean = value.replace(/\s+/g, ' ').trim();
        if (clean.length >= 8) snippets.push(`- ${keyHint || 'contexto'}: ${this.clip(clean, 320)}`);
        return;
      }
      if (typeof value === 'number' || typeof value === 'boolean') return;
      if (Array.isArray(value)) {
        value.slice(0, 10).forEach((item, index) => visit(item, `${keyHint || 'item'} ${index + 1}`, depth + 1));
        return;
      }
      if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
          const normalizedKey = key.toLowerCase();
          const isPreferred = preferredKeys.some((preferred) => normalizedKey.includes(preferred.toLowerCase()));
          if (isPreferred || depth > 0) visit(item, key, depth + 1);
        });
      }
    };

    visit(context);
    return snippets;
  }

  private extractStructuredContextSummary(context: Record<string, unknown>) {
    const lines: string[] = [];
    const readingState = this.readRecord(context.readingState);
    const currentChapter = this.readRecord(context.currentChapter);
    const workbook = this.readRecord(context.workbook);
    const canonicalJournal = Array.isArray(context.canonicalJournal) ? context.canonicalJournal : [];
    const letters = Array.isArray(context.letters) ? context.letters : [];
    const anchors = Array.isArray(context.anchors) ? context.anchors : [];
    const notes = Array.isArray(context.notes) ? context.notes : [];
    const favorites = Array.isArray(context.favorites) ? context.favorites : [];
    const audioProgress = this.readRecord(context.audioProgress);

    if (currentChapter) {
      lines.push(`Capítulo atual: ${this.clip(String(currentChapter.title || currentChapter.id || ''), 180)}.`);
      if (currentChapter.summary) lines.push(`Resumo do capítulo atual: ${this.clip(String(currentChapter.summary), 260)}.`);
    }

    if (readingState) {
      lines.push(`Estado de leitura: rota=${String(readingState.route || '')}; progresso=${String(readingState.progress || '')}%; grupo=${String(readingState.currentGroup || '')}.`);
    }

    if (workbook) {
      const freeWriting = this.clip(String(workbook.freeWriting || ''), 360);
      if (freeWriting) lines.push(`Diário livre recente: ${freeWriting}`);
      const answers = Array.isArray(workbook.answers) ? workbook.answers : [];
      answers.slice(0, 6).forEach((item, index) => {
        const answer = this.readRecord(item);
        if (answer?.answer) {
          lines.push(`Resposta de diário ${index + 1}: ${this.clip(String(answer.question || ''), 120)} => ${this.clip(String(answer.answer), 260)}`);
        }
      });
    }

    canonicalJournal.slice(-12).forEach((item, index) => {
      const answer = this.readRecord(item);
      if (answer?.answer) {
        lines.push(`Resposta de Caderno ${index + 1}: ${this.clip(String(answer.prompt || ''), 160)} => ${this.clip(String(answer.answer), 300)}`);
      }
    });

    letters.slice(-5).forEach((item, index) => {
      const letter = this.readRecord(item);
      if (letter?.excerpt) lines.push(`Carta privada ${index + 1}: ${this.clip(String(letter.excerpt), 260)}`);
    });

    anchors.slice(-6).forEach((item, index) => {
      const anchor = this.readRecord(item);
      if (anchor?.content || anchor?.title) {
        lines.push(`Âncora ${index + 1}: ${this.clip([anchor.title, anchor.content, anchor.status].filter(Boolean).join(' - '), 240)}`);
      }
    });

    notes.slice(-6).forEach((item, index) => {
      const note = this.readRecord(item);
      if (note?.excerpt || note?.title) lines.push(`Anotação ${index + 1}: ${this.clip([note.title, note.excerpt].filter(Boolean).join(' - '), 240)}`);
    });

    favorites.slice(-8).forEach((item, index) => {
      const favorite = this.readRecord(item);
      if (favorite?.title) lines.push(`Favorito ${index + 1}: ${this.clip(String(favorite.title), 140)}`);
    });

    if (audioProgress) {
      const heard = Object.entries(audioProgress).filter(([, value]) => {
        const item = this.readRecord(value);
        return item?.heard === true || value === true;
      });
      if (heard.length) lines.push(`Áudios marcados como ouvidos: ${heard.slice(-8).map(([url]) => this.clip(url, 120)).join('; ')}`);
    }

    return lines.slice(0, 36).join('\n');
  }

  private compactJson(value: unknown, maxLength: number) {
    try {
      return JSON.stringify(value).slice(0, maxLength);
    } catch {
      return '{}';
    }
  }

  private normalizeGeneratedAnswer(value: unknown) {
    return String(value || '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, 2600);
  }

  private clip(value: string, maxLength: number) {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean.length > maxLength ? `${clean.slice(0, maxLength - 3)}...` : clean;
  }

  private fallbackAnswer(message: string, topic?: string, context?: Record<string, unknown>, readerContext = '') {
    const mindFlow = this.readRecord(context?.mindFlow);
    const entryIntent = String(mindFlow?.entryIntent || '');
    const territory = String(mindFlow?.territory || topic || 'este trecho');
    const limiar = String(mindFlow?.limiar || '');
    const persistedMemory = this.clip(readerContext, 520);

    if (entryIntent === 'act') {
      return [
        `Estou no modo próximo movimento em ${territory}.`,
        'Não vou tratar essa escolha como uma resposta pessoal nem formar sinal sobre você.',
        limiar
          ? `Âncora breve: por alguns segundos, fique com o limiar "${limiar}" sem tentar explicar.`
          : 'Âncora breve: por alguns segundos, observe o que apareceu sem tentar explicar.',
        'Frase de apoio: "Eu posso reconhecer isso sem resolver agora."',
        'Depois disso, você pode voltar ao livro ou guardar esse fio para retomar depois.',
      ].join('\n\n');
    }

    if (entryIntent === 'understand') {
      return [
        `Estou no modo explicação em ${territory}.`,
        'Aqui o objetivo é clarear o conteúdo do livro, não interpretar você.',
        limiar
          ? `O trecho trabalha este limiar: "${limiar}".`
          : 'O trecho trabalha uma passagem do livro que pede leitura sem pressa.',
        'Se isso começar a tocar sua vida, você pode escolher refletir depois. Agora, basta entender o movimento do texto.',
      ].join('\n\n');
    }

    const hint = topic ? ` sobre ${topic}` : '';
    const compact = message.length > 180 ? `${message.slice(0, 177)}...` : message;
    return [
      `Eu li o que você trouxe${hint}. O ponto principal agora não é resolver tudo de uma vez, é separar o peso real do julgamento que ficou colado nele.`,
      persistedMemory ? `Também estou considerando o que ficou salvo na sua jornada: ${persistedMemory}` : '',
      `O que aparece aqui: "${compact}". Trate isso como material de reconhecimento, não como sentença sobre quem você é.`,
      'Antes de qualquer resposta pronta, qual parte disso você ainda está tentando explicar para não precisar nomear?',
    ].filter(Boolean).join('\n\n');
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
  }
}
