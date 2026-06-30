const ENTRY_KEY = 'opd_workbook_entry';
const SAVED_AT_KEY = 'opd_workbook_saved_at';
const ANSWERS_KEY = 'opd_workbook_answers';
const LETTERS_KEY = 'opd_reader_letters';
const LETTER_META_KEY = 'opd_reader_letter_meta';
const READER_NOTES_KEY = 'opd_reader_notes';
const AUDIO_PROGRESS_KEY = 'opd_audio_progress';

export type LetterMeta = {
  before?: string;
  after?: string;
  updatedAt?: string;
};

export type ReaderNote = {
  id: string;
  page: number;
  chapterId: string;
  title: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type AudioProgressEntry = {
  heard: boolean;
  currentTime: number;
  duration: number;
  updatedAt: string;
};

export function loadLocalWorkbookEntry() {
  return localStorage.getItem(ENTRY_KEY) ?? '';
}

export function saveLocalWorkbookEntry(content: string) {
  localStorage.setItem(ENTRY_KEY, content);
  localStorage.setItem(SAVED_AT_KEY, new Date().toISOString());
}

export function getLocalWorkbookSavedAt() {
  return localStorage.getItem(SAVED_AT_KEY);
}

export function loadLocalWorkbookAnswers(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(ANSWERS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveLocalWorkbookAnswers(answers: Record<string, string>) {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  localStorage.setItem(SAVED_AT_KEY, new Date().toISOString());
}

export function loadLocalLetters(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LETTERS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveLocalLetters(letters: Record<string, string>) {
  localStorage.setItem(LETTERS_KEY, JSON.stringify(letters));
  localStorage.setItem(SAVED_AT_KEY, new Date().toISOString());
}

export function loadLocalLetterMeta(): Record<string, LetterMeta> {
  try {
    return JSON.parse(localStorage.getItem(LETTER_META_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveLocalLetterMeta(meta: Record<string, LetterMeta>) {
  localStorage.setItem(LETTER_META_KEY, JSON.stringify(meta));
  localStorage.setItem(SAVED_AT_KEY, new Date().toISOString());
}

export function loadLocalReaderNotes(): ReaderNote[] {
  try {
    const notes = JSON.parse(localStorage.getItem(READER_NOTES_KEY) ?? '[]');
    return Array.isArray(notes) ? notes : [];
  } catch {
    return [];
  }
}

export function saveLocalReaderNotes(notes: ReaderNote[]) {
  localStorage.setItem(READER_NOTES_KEY, JSON.stringify(notes));
  localStorage.setItem(SAVED_AT_KEY, new Date().toISOString());
}

export function loadLocalAudioProgress(): Record<string, AudioProgressEntry> {
  try {
    return JSON.parse(localStorage.getItem(AUDIO_PROGRESS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveLocalAudioProgress(progress: Record<string, AudioProgressEntry>) {
  localStorage.setItem(AUDIO_PROGRESS_KEY, JSON.stringify(progress));
  localStorage.setItem(SAVED_AT_KEY, new Date().toISOString());
}
