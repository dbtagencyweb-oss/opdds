import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { artifactBookData } from '../../public/app/src/data/artifactBookData';
import { bookChapters, getChapterIndexForPillar } from '../../public/app/src/data/book';
import { extractCanonicalJournalPrompts } from '../../public/app/src/data/canonicalPrompts';
import { OPDDS_CANONICAL_BOOK_INDEX } from '../../backend/src/igent/opdds-canonical-book-data';
import { buildOpddsBookGrounding } from '../../backend/src/igent/opdds-book-almanac';
import { buildLocalMindResponse } from '../../public/app/src/data/igentMindLocalResponder';

describe('canonical book integration', () => {
  it('keeps frontend and backend section IDs aligned and free of replacement characters', () => {
    const artifactIds = artifactBookData.chapters.flatMap((chapter) => chapter.sections.map((section) => section.id));
    const backendIds = OPDDS_CANONICAL_BOOK_INDEX.chapters
      .filter((chapter) => chapter.id !== 'capa-digital')
      .flatMap((chapter) => chapter.sections.map((section) => section.id));

    expect(backendIds).toEqual(artifactIds);
    expect(readFileSync(resolve('backend/src/igent/opdds-canonical-book-data.ts'), 'utf8')).not.toContain('\uFFFD');
  });

  it.each([
    ['caderno1', 5],
    ['caderno2', 5],
    ['caderno3', 5],
    ['caderno4', 6],
  ])('extracts only the real questions from %s', (chapterId, expected) => {
    const chapter = artifactBookData.chapters.find((item) => item.id === chapterId);
    expect(chapter).toBeDefined();
    const prompts = extractCanonicalJournalPrompts(chapterId, chapter!.sections);
    expect(prompts).toHaveLength(expected);
    expect(prompts.every((prompt) => prompt.text.endsWith('?'))).toBe(true);
  });
});

describe('semantic grounding and navigation', () => {
  it.each([
    ['minha família e o pertencimento', 'pilar2'],
    ['estou vivendo um luto e uma perda', 'pilar3'],
    ['uso fuga e anestesia para não sentir a dor', 'pilar5'],
    ['o trabalho virou a medida do meu valor', 'pilar4'],
  ])('grounds "%s" in %s', (message, expectedChapterId) => {
    const grounding = buildOpddsBookGrounding({ message });
    expect(grounding.references.slice(0, 2).map((reference) => reference.chapterId)).toContain(expectedChapterId);
    expect(grounding.context.length).toBeLessThan(7000);
  });

  it('prioritizes the explicit current chapter', () => {
    const grounding = buildOpddsBookGrounding({
      message: 'quero entender este trecho',
      context: { currentChapter: { id: 'pilar9' } },
    });
    expect(grounding.references[0]?.chapterId).toBe('pilar9');
  });

  it('maps all nine pillars by stable chapter identity', () => {
    expect(Array.from({ length: 9 }, (_, index) => bookChapters[getChapterIndexForPillar(index)]?.id))
      .toEqual(Array.from({ length: 9 }, (_, index) => `pilar${index + 1}`));
  });
});

describe('audio catalog', () => {
  it('contains only files that exist in public/media', () => {
    const missing = bookChapters.flatMap((chapter) => chapter.audioTracks
      .filter((track) => !existsSync(resolve('public', track.url.replace(/^\//, ''))))
      .map((track) => `${chapter.id}:${track.url}`));
    expect(missing).toEqual([]);
  });
});

describe('local iGent progression', () => {
  it('answers an everyday-example request instead of repeating the mode introduction', () => {
    const response = buildLocalMindResponse({
      intent: 'understand',
      pillarIndex: 0,
      territory: 'Reconhecimento',
      message: 'Me sugira um exemplo cotidiano sobre o pilar reconhecimento',
    });

    expect(response.text).toContain('Uma pessoa percebe que está exausta');
    expect(response.text).not.toContain('Posso ajudar a clarear');
    expect(response.replies).toContain('Comparar com julgamento');
  });

  it('progresses from example to conceptual distinction', () => {
    const response = buildLocalMindResponse({
      intent: 'understand',
      pillarIndex: 0,
      territory: 'Reconhecimento',
      message: 'Comparar com julgamento',
    });

    expect(response.text).toContain('reconhecer é descrever');
    expect(response.text).toContain('julgar é transformar');
  });

  it('keeps reflection to one open question', () => {
    const response = buildLocalMindResponse({
      intent: 'reflect',
      pillarIndex: 0,
      territory: 'Reconhecimento',
      message: 'Eu finjo que não estou cansado para continuar produzindo',
    });

    expect(response.text.match(/\?/g)).toHaveLength(1);
    expect(response.text).toContain('Eu finjo que não estou cansado');
  });
});
