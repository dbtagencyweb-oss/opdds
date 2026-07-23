import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { artifactBookData } from '../public/app/src/data/artifactBookData';
import { bookChapters, onboardingSteps } from '../public/app/src/data/book';
import { extractCanonicalJournalPrompts } from '../public/app/src/data/canonicalPrompts';
import { OPDDS_CANONICAL_BOOK_INDEX } from '../backend/src/igent/opdds-canonical-book-data';

const failures: string[] = [];
const assert = (condition: unknown, message: string) => {
  if (!condition) failures.push(message);
};

const sourceFiles = [
  'public/app/src/data/artifactBookData.ts',
  'backend/src/igent/opdds-canonical-book-data.ts',
];
for (const file of sourceFiles) {
  assert(!readFileSync(resolve(file), 'utf8').includes('\uFFFD'), `${file} contains Unicode replacement characters`);
}

const artifactSectionIds = artifactBookData.chapters.flatMap((chapter) => chapter.sections.map((section) => section.id));
const indexedSectionIds = OPDDS_CANONICAL_BOOK_INDEX.chapters
  .filter((chapter) => chapter.id !== 'capa-digital')
  .flatMap((chapter) => chapter.sections.map((section) => section.id));
assert(
  JSON.stringify(artifactSectionIds) === JSON.stringify(indexedSectionIds),
  'Backend canonical sections differ from artifactBookData',
);

const expectedPromptCounts: Record<string, number> = { caderno1: 5, caderno2: 5, caderno3: 5, caderno4: 6 };
for (const chapter of artifactBookData.chapters.filter((item) => item.kind === 'caderno')) {
  const prompts = extractCanonicalJournalPrompts(chapter.id, chapter.sections);
  assert(prompts.length === expectedPromptCounts[chapter.id], `${chapter.id} has ${prompts.length} prompts`);
  assert(prompts.every((prompt) => prompt.text.endsWith('?')), `${chapter.id} contains a non-question prompt`);
}

const mappedAudioUrls = new Set<string>();
const validateAudioUrl = (url: string | null | undefined, source: string) => {
  if (!url || !url.startsWith('/media/audios/')) return;
  mappedAudioUrls.add(url);
  const relative = url.replace(/^\//, '');
  assert(existsSync(resolve('public', relative)), `Missing audio: ${source} -> ${url}`);
};

for (const chapter of bookChapters) {
  validateAudioUrl(chapter.audioUrl, `${chapter.id} (principal)`);
  for (const track of chapter.audioTracks) validateAudioUrl(track.url, `${chapter.id} (${track.label})`);
}

onboardingSteps.forEach((step, index) => validateAudioUrl(step.audioUrl, `onboarding ${index + 1}`));

const audioReferenceFiles = [
  'public/app/src/App.tsx',
  'public/app/src/components/ReaderShell.tsx',
  'public/app/src/data/book.ts',
];
const staticAudioPattern = /["'`](\/media\/audios\/[^"'`$]+?\.(?:mp3|wav|m4a|ogg))["'`]/gi;
for (const file of audioReferenceFiles) {
  const source = readFileSync(resolve(file), 'utf8');
  for (const match of source.matchAll(staticAudioPattern)) validateAudioUrl(match[1], file);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Content valid: ${OPDDS_CANONICAL_BOOK_INDEX.chapters.length} chapters, ${indexedSectionIds.length + 1} sections, ${mappedAudioUrls.size} mapped audio files found.`);
