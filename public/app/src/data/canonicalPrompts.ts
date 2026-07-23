export type CanonicalPrompt = {
  id: string;
  text: string;
  legacyIds?: string[];
};

type PromptBlock = { text?: string };
type PromptSection = { id: string; blocks: readonly PromptBlock[] };

const compact = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const normalizeForMatch = (value = '') =>
  compact(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const oldReaderAcceptedPrompt = (value = '') => {
  const clean = normalizeForMatch(value);
  if (!clean) return false;
  if (/^caderno de presenca$|^ato\s+|^triade\s+|^reflexao/.test(clean)) return false;
  if (/^antes de |^apos atravessar|^nao procure|^nem toda travessia|^escreva aqui/.test(clean)) return false;
  if (clean.includes('_____')) return false;
  return clean.includes('?') || /^\d+\./.test(clean);
};

const extractQuestions = (value = '') => {
  const clean = compact(value);
  if (!clean || clean.includes('_____')) return [];

  const numbered = Array.from(clean.matchAll(/(?:^|\s)\d+\.\s*([^?]+\?)/g), (match) => compact(match[1]));
  if (numbered.length) return numbered;
  if (!clean.includes('?')) return [];

  return clean
    .split('?')
    .slice(0, -1)
    .map((part) => compact(part.replace(/^.*?[.!:]\s+(?=[A-ZÀ-Ý])/u, '')))
    .filter(Boolean)
    .map((part) => `${part}?`);
};

const promptHash = (value: string) => {
  let hash = 2166136261;
  for (const character of normalizeForMatch(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const promptSlug = (value: string) =>
  normalizeForMatch(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42) || 'pergunta';

/** Extracts only canonical questions and keeps old IDs available for migration. */
export const extractCanonicalJournalPrompts = (
  chapterId: string,
  sections: readonly PromptSection[],
): CanonicalPrompt[] => {
  const prompts: CanonicalPrompt[] = [];
  for (const section of sections) {
    let oldPromptIndex = 0;
    for (const block of section.blocks) {
      const sourceText = compact(block.text ?? '');
      const legacyId = oldReaderAcceptedPrompt(sourceText)
        ? `${chapterId}-${section.id}-${++oldPromptIndex}`
        : undefined;
      for (const text of extractQuestions(sourceText)) {
        prompts.push({
          id: `${chapterId}-${section.id}-${promptSlug(text)}-${promptHash(text)}`,
          text,
          ...(legacyId ? { legacyIds: [legacyId] } : {}),
        });
      }
    }
  }
  return prompts;
};
