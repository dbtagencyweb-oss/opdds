-- Drop BookPageRevision: the admin per-PDF-page editor is being removed.
-- Its key space (real PDF page numbers) collided with the chapter/logical
-- numbering used everywhere else (see commit be17038), causing wrong
-- chapter titles in the reader. The canonical book text
-- (artifactBookData.ts) is now the single source of truth.
DROP TABLE "BookPageRevision";
