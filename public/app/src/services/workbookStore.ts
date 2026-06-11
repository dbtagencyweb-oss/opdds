const ENTRY_KEY = 'opd_workbook_entry';
const SAVED_AT_KEY = 'opd_workbook_saved_at';
const ANSWERS_KEY = 'opd_workbook_answers';

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
