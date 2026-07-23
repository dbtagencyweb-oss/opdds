import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReaderJourneyDto } from './workbook.dto';
import { OPDDS_CANONICAL_BOOK_INDEX } from '../igent/opdds-canonical-book-data';

const JOURNEY_PROMPT_ID = '__reader_journey_snapshot_v1';
const JOURNEY_PROMPT = 'Snapshot privado da jornada do leitor';

type ReaderJourneySnapshot = {
  workbookEntry: string;
  workbookAnswers: Record<string, string>;
  canonicalJournalAnswers: Record<string, string>;
  workbookPrompt: string;
  letters: Record<string, string>;
  letterMeta: Record<string, unknown>;
  readerNotes: unknown[];
  anchors: unknown[];
  audioProgress: Record<string, unknown>;
  updatedAt?: string;
};

const EMPTY_SNAPSHOT: ReaderJourneySnapshot = {
  workbookEntry: '',
  workbookAnswers: {},
  canonicalJournalAnswers: {},
  workbookPrompt: '',
  letters: {},
  letterMeta: {},
  readerNotes: [],
  anchors: [],
  audioProgress: {},
};

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async getJourney(userId: string) {
    return this.getJourneySnapshot(userId);
  }

  async saveJourney(userId: string, input: ReaderJourneyDto) {
    const current = await this.getJourneySnapshot(userId);
    const snapshot = this.normalizeSnapshot({
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    });
    const isEmpty = !snapshot.workbookEntry.trim()
      && !Object.values(snapshot.workbookAnswers).some((value) => value.trim())
      && !Object.values(snapshot.canonicalJournalAnswers).some((value) => value.trim())
      && !Object.values(snapshot.letters).some((value) => value.trim())
      && snapshot.readerNotes.length === 0
      && snapshot.anchors.length === 0
      && Object.keys(snapshot.audioProgress).length === 0;
    if (isEmpty) {
      await this.prisma.workbookEntry.deleteMany({ where: { userId, promptId: JOURNEY_PROMPT_ID } });
      return snapshot;
    }
    const content = JSON.stringify(snapshot);
    const existing = await this.prisma.workbookEntry.findFirst({
      where: { userId, promptId: JOURNEY_PROMPT_ID },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      await this.prisma.workbookEntry.update({
        where: { id: existing.id },
        data: { prompt: JOURNEY_PROMPT, content },
      });
    } else {
      await this.prisma.workbookEntry.create({
        data: { userId, promptId: JOURNEY_PROMPT_ID, prompt: JOURNEY_PROMPT, content },
      });
    }

    return snapshot;
  }

  async deleteJourney(userId: string) {
    const result = await this.prisma.workbookEntry.deleteMany({
      where: { userId, promptId: JOURNEY_PROMPT_ID },
    });
    return { deleted: result.count };
  }

  async getJourneySnapshot(userId: string): Promise<ReaderJourneySnapshot> {
    const entry = await this.prisma.workbookEntry.findFirst({
      where: { userId, promptId: JOURNEY_PROMPT_ID },
      orderBy: { updatedAt: 'desc' },
    });
    if (!entry?.content) return { ...EMPTY_SNAPSHOT };

    try {
      return this.normalizeSnapshot(JSON.parse(entry.content));
    } catch {
      return { ...EMPTY_SNAPSHOT };
    }
  }

  async buildJourneyContext(userId: string, scopes: {
    diary?: boolean;
    caderno?: boolean;
    letters?: boolean;
    notes?: boolean;
    anchors?: boolean;
  } = {}) {
    const snapshot = await this.getJourneySnapshot(userId);
    const answerLines = Object.entries(snapshot.workbookAnswers)
      .filter(([, value]) => String(value || '').trim())
      .slice(-12)
      .map(([key, value]) => `- diário ${key}: ${this.clip(value, 320)}`);
    const canonicalPromptById = new Map<string, string>(
      OPDDS_CANONICAL_BOOK_INDEX.chapters.flatMap((chapter) =>
        chapter.journalPrompts.flatMap((prompt) => [
          [prompt.id, prompt.text] as const,
          ...(('legacyIds' in prompt ? prompt.legacyIds : []) ?? []).map((id) => [id, prompt.text] as const),
        ]),
      ),
    );
    const canonicalJournalLines = Object.entries(snapshot.canonicalJournalAnswers)
      .filter(([, value]) => String(value || '').trim())
      .slice(-21)
      .map(([key, value]) => `- ${canonicalPromptById.get(key) || `Caderno ${key}`}: ${this.clip(value, 420)}`);
    const letterLines = Object.entries(snapshot.letters)
      .filter(([, value]) => String(value || '').trim())
      .slice(-6)
      .map(([key, value]) => `- carta ${key}: ${this.clip(value, 420)}`);
    const noteLines = snapshot.readerNotes
      .map((note) => this.readObject(note))
      .filter((note) => String(note.note || '').trim())
      .slice(-10)
      .map((note) => `- pagina ${note.page || '?'} ${note.title ? `(${this.clip(String(note.title), 80)})` : ''}: ${this.clip(String(note.note), 280)}`);
    const anchorLines = snapshot.anchors
      .map((anchor) => this.readObject(anchor))
      .filter((anchor) => String(anchor.title || anchor.content || anchor.text || '').trim())
      .slice(-8)
      .map((anchor) => `- âncora ${this.clip(String(anchor.title || anchor.type || 'prática'), 80)}: ${this.clip(String(anchor.content || anchor.text || anchor.status || ''), 240)}`);

    return [
      scopes.diary && snapshot.workbookEntry.trim() ? `Escrita livre do diário${snapshot.workbookPrompt ? ` (${this.clip(snapshot.workbookPrompt, 160)})` : ''}:\n- ${this.clip(snapshot.workbookEntry, 700)}` : '',
      scopes.diary && answerLines.length ? `Respostas do diário:\n${answerLines.join('\n')}` : '',
      scopes.caderno && canonicalJournalLines.length ? `Respostas aos Cadernos canônicos:\n${canonicalJournalLines.join('\n')}` : '',
      scopes.letters && letterLines.length ? `Cartas privadas:\n${letterLines.join('\n')}` : '',
      scopes.notes && noteLines.length ? `Anotações e marcações:\n${noteLines.join('\n')}` : '',
      scopes.anchors && anchorLines.length ? `Âncoras práticas:\n${anchorLines.join('\n')}` : '',
    ].filter(Boolean).join('\n\n').slice(0, 7000);
  }

  private normalizeSnapshot(value: unknown): ReaderJourneySnapshot {
    const data = this.readObject(value);
    return {
      workbookEntry: this.cleanString(data.workbookEntry, 20000),
      workbookAnswers: this.cleanStringRecord(data.workbookAnswers, 120, 8000),
      canonicalJournalAnswers: this.cleanStringRecord(data.canonicalJournalAnswers, 80, 8000),
      workbookPrompt: this.cleanString(data.workbookPrompt, 500),
      letters: this.cleanStringRecord(data.letters, 30, 16000),
      letterMeta: this.cleanRecord(data.letterMeta, 40),
      readerNotes: this.cleanArray(data.readerNotes, 220),
      anchors: this.cleanArray(data.anchors, 80),
      audioProgress: this.cleanRecord(data.audioProgress, 500),
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    };
  }

  private cleanStringRecord(value: unknown, maxKeys: number, maxValueLength: number) {
    const record = this.readObject(value);
    return Object.fromEntries(
      Object.entries(record)
        .slice(0, maxKeys)
        .map(([key, item]) => [this.cleanString(key, 120), this.cleanString(item, maxValueLength)])
        .filter(([key]) => key),
    );
  }

  private cleanRecord(value: unknown, maxKeys: number) {
    const record = this.readObject(value);
    return Object.fromEntries(Object.entries(record).slice(0, maxKeys));
  }

  private cleanArray(value: unknown, maxItems: number) {
    return Array.isArray(value) ? value.slice(0, maxItems) : [];
  }

  private readObject(value: unknown): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
  }

  private cleanString(value: unknown, maxLength: number) {
    return String(value || '').slice(0, maxLength);
  }

  private clip(value: unknown, maxLength: number) {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean.length > maxLength ? `${clean.slice(0, maxLength - 3)}...` : clean;
  }
}

export { JOURNEY_PROMPT_ID };
