/**
 * Aplica (parcialmente) um export de "correções canônicas" do editor admin
 * (App.tsx -> exportAdminCanonicalDrafts) direto em artifactBookData.ts.
 *
 * O editor trabalha com uma lista achatada de CanonicalBookBlock (kind:
 * heading/subheading/paragraph/pause/...), mas a fonte real é uma árvore de
 * chapters/sections/blocks tipados (p/pause/divider/step-header/list) onde
 * headings de seção são AUTO-GERADOS a partir de section.title. Este script:
 *
 *  1. Reconstrói a lista achatada real (com proveniência: qual section/block)
 *     usando a MESMA função de conversão do app (artifactBlockToCanonical),
 *     pra nunca divergir da heurística de pause->paragraph etc.
 *  2. Alinha essa lista contra o draft exportado (merge/split/edit/delete
 *     são detectados por igualdade de texto normalizado).
 *  3. Aplica direto no objeto JS os casos inequívocos (texto mudou, blocos
 *     mesclados, blocos divididos, bloco de corpo removido).
 *  4. Sinaliza (não aplica) qualquer coisa estrutural: heading novo criado
 *     no meio do texto, remoção de heading de seção, capítulos hardcoded em
 *     canonicalBook.ts (nota-do-autor/epigrafe/capa-digital), capítulos
 *     compostos de múltiplos artifactChapters (ex.: epilogo).
 *
 * Uso:
 *   npx tsx scripts/apply-canonical-draft.ts [caminho-do-json-exportado]
 *   (sem argumento, pega o opdds-correcoes-canonicas-*.json mais recente em ~/Downloads)
 *
 * Depois de rodar: conferir o diff (git diff), rodar `npm run canonical:generate`
 * na raiz do projeto, e tratar manualmente os itens sinalizados.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { artifactBlockToCanonical, normalizeBookText, artifactChapterMap } from '../src/data/canonicalBook';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.APPLY_CANONICAL_DATA_FILE
  ? path.resolve(process.env.APPLY_CANONICAL_DATA_FILE)
  : path.resolve(__dirname, '../src/data/artifactBookData.ts');
const HARDCODED_CHAPTERS = new Set(['capa-digital', 'epigrafe', 'nota-do-autor']);

type AnyBlock = Record<string, any>;
type AnySection = { id: string; title?: string; blocks: AnyBlock[] };
type AnyChapter = { id: string; sections: AnySection[] };

type Prov =
  | { kind: 'title'; sectionIndex: number }
  | { kind: 'body'; sectionIndex: number; blockIndex: number; itemIndex?: number };

type FlatBlock = { kind: string; text: string; className?: string; prov: Prov };

type DraftBlock = { id: string; kind: string; text: string; className?: string };

const norm = (text: string) => (text ?? '').replace(/\s+/g, ' ').trim();

function flattenArtifactChapter(chapter: AnyChapter): FlatBlock[] {
  const out: FlatBlock[] = [];
  const includeHeading = chapter.sections.length > 1;
  chapter.sections.forEach((section, sectionIndex) => {
    const hasOwnStepHeader = section.blocks.some((block: AnyBlock) => block.type === 'step-header');
    if (includeHeading && section.title && !hasOwnStepHeader) {
      out.push({
        kind: sectionIndex === 0 ? 'subheading' : 'heading',
        text: normalizeBookText(section.title),
        className: 'reader-canonical-section-title',
        prov: { kind: 'title', sectionIndex },
      });
    }
    section.blocks.forEach((block, blockIndex) => {
      const converted = artifactBlockToCanonical('x', 1, 0, block as any);
      const isList = block.type === 'list';
      converted.forEach((cb, itemIndex) => {
        out.push({
          kind: cb.kind,
          text: cb.text,
          className: cb.className,
          prov: isList
            ? { kind: 'body', sectionIndex, blockIndex, itemIndex }
            : { kind: 'body', sectionIndex, blockIndex },
        });
      });
    });
  });
  return out;
}

type Op =
  | { type: 'unchanged'; base: FlatBlock }
  | { type: 'text-edit'; base: FlatBlock; newText: string }
  | { type: 'merge'; bases: FlatBlock[]; newText: string }
  | { type: 'split'; base: FlatBlock; parts: string[] }
  | { type: 'delete'; base: FlatBlock }
  | { type: 'flag-insert'; draft: DraftBlock }
  | { type: 'flag-misaligned'; baseRemaining: FlatBlock[]; draftRemaining: DraftBlock[] };

function align(base: FlatBlock[], draft: DraftBlock[]): Op[] {
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  const LOOKAHEAD = 6;

  while (i < base.length || j < draft.length) {
    if (i >= base.length) {
      ops.push({ type: 'flag-insert', draft: draft[j] });
      j++;
      continue;
    }
    if (j >= draft.length) {
      ops.push({ type: 'delete', base: base[i] });
      i++;
      continue;
    }
    const b = base[i];
    const d = draft[j];
    if (norm(b.text) === norm(d.text)) {
      ops.push(b.kind === d.kind ? { type: 'unchanged', base: b } : { type: 'text-edit', base: b, newText: d.text });
      i++;
      j++;
      continue;
    }

    // merge: draft[j] == base[i] + base[i+1] + ...
    let mergedText = norm(b.text);
    let merged = false;
    for (let k = i + 1; k < Math.min(base.length, i + LOOKAHEAD); k++) {
      mergedText += ' ' + norm(base[k].text);
      if (mergedText === norm(d.text)) {
        ops.push({ type: 'merge', bases: base.slice(i, k + 1), newText: d.text });
        i = k + 1;
        j++;
        merged = true;
        break;
      }
      if (mergedText.length > norm(d.text).length + 20) break;
    }
    if (merged) continue;

    // split: base[i] == draft[j] + draft[j+1] + ...
    let splitText = norm(d.text);
    let split = false;
    for (let k = j + 1; k < Math.min(draft.length, j + LOOKAHEAD); k++) {
      splitText += ' ' + norm(draft[k].text);
      if (splitText === norm(b.text)) {
        ops.push({ type: 'split', base: b, parts: draft.slice(j, k + 1).map((x) => x.text) });
        i++;
        j = k + 1;
        split = true;
        break;
      }
      if (splitText.length > norm(b.text).length + 20) break;
    }
    if (split) continue;

    // base[i] was deleted (skip it, retry same draft block)
    if (i + 1 < base.length && norm(base[i + 1].text) === norm(d.text)) {
      ops.push({ type: 'delete', base: b });
      i++;
      continue;
    }
    // draft[j] is a genuine insertion (skip it, retry same base block)
    if (j + 1 < draft.length && norm(draft[j + 1].text) === norm(b.text)) {
      ops.push({ type: 'flag-insert', draft: d });
      j++;
      continue;
    }

    // plain text edit, same rough shape
    const ratio = norm(d.text).length / Math.max(1, norm(b.text).length);
    if (b.kind === d.kind && ratio > 0.5 && ratio < 2) {
      ops.push({ type: 'text-edit', base: b, newText: d.text });
      i++;
      j++;
      continue;
    }

    // last resort: try to resync further ahead instead of giving up on the whole rest of the chapter
    let resynced = false;
    const WINDOW = 12;
    for (let bi = i; bi < Math.min(base.length, i + WINDOW) && !resynced; bi++) {
      for (let dj = j; dj < Math.min(draft.length, j + WINDOW); dj++) {
        if (bi === i && dj === j) continue; // already known not to match
        if (norm(base[bi].text) === norm(draft[dj].text)) {
          ops.push({ type: 'flag-misaligned', baseRemaining: base.slice(i, bi), draftRemaining: draft.slice(j, dj) });
          i = bi;
          j = dj;
          resynced = true;
          break;
        }
      }
    }
    if (resynced) continue;

    ops.push({ type: 'flag-misaligned', baseRemaining: base.slice(i), draftRemaining: draft.slice(j) });
    break;
  }
  return ops;
}

function applyOpsToChapter(chapter: AnyChapter, ops: Op[], log: string[]) {
  // plan[sectionIndex] = { title?: string, blockPlan: Map<blockIndex, action> }
  type BlockAction =
    | { type: 'keep' }
    | { type: 'edit'; text: string }
    | { type: 'remove' }
    | { type: 'split'; parts: string[] };
  const titlePlan = new Map<number, string>();
  const blockPlan = new Map<string, BlockAction>(); // key `${sectionIndex}:${blockIndex}`
  const itemEdits = new Map<string, { itemIndex: number; text: string }[]>(); // key `${sectionIndex}:${blockIndex}` -> item edits

  const flagged: Op[] = [];

  for (const op of ops) {
    if (op.type === 'unchanged') continue;

    if (op.type === 'text-edit') {
      const { prov } = op.base;
      if (prov.kind === 'title') {
        titlePlan.set(prov.sectionIndex, op.newText.trim());
      } else if (prov.itemIndex !== undefined) {
        const key = `${prov.sectionIndex}:${prov.blockIndex}`;
        const list = itemEdits.get(key) ?? [];
        list.push({ itemIndex: prov.itemIndex, text: op.newText.replace(/^[•\-*]\s*/, '').trim() });
        itemEdits.set(key, list);
      } else {
        blockPlan.set(`${prov.sectionIndex}:${prov.blockIndex}`, { type: 'edit', text: op.newText.trim() });
      }
      continue;
    }

    if (op.type === 'merge') {
      const bodyBases = op.bases.every((b) => b.prov.kind === 'body' && b.prov.itemIndex === undefined);
      const sameSection = new Set(op.bases.map((b) => (b.prov as any).sectionIndex)).size === 1;
      if (!bodyBases || !sameSection) {
        flagged.push(op);
        continue;
      }
      const [first, ...rest] = op.bases;
      const sIdx = (first.prov as any).sectionIndex;
      blockPlan.set(`${sIdx}:${(first.prov as any).blockIndex}`, { type: 'edit', text: op.newText.trim() });
      for (const b of rest) {
        blockPlan.set(`${sIdx}:${(b.prov as any).blockIndex}`, { type: 'remove' });
      }
      continue;
    }

    if (op.type === 'split') {
      const { prov } = op.base;
      if (prov.kind !== 'body' || prov.itemIndex !== undefined) {
        flagged.push(op);
        continue;
      }
      blockPlan.set(`${prov.sectionIndex}:${prov.blockIndex}`, { type: 'split', parts: op.parts.map((p) => p.trim()) });
      continue;
    }

    if (op.type === 'delete') {
      const { prov } = op.base;
      if (prov.kind === 'title' || prov.itemIndex !== undefined) {
        flagged.push(op);
        continue;
      }
      blockPlan.set(`${prov.sectionIndex}:${prov.blockIndex}`, { type: 'remove' });
      continue;
    }

    flagged.push(op);
  }

  // apply title edits
  for (const [sectionIndex, newTitle] of titlePlan) {
    const oldTitle = chapter.sections[sectionIndex].title;
    chapter.sections[sectionIndex].title = newTitle;
    log.push(`  título seção[${sectionIndex}] (${chapter.sections[sectionIndex].id}): "${oldTitle}" -> "${newTitle}"`);
  }

  // apply block-level edits per section
  chapter.sections.forEach((section, sectionIndex) => {
    const originalBlocks = section.blocks;
    const newBlocks: AnyBlock[] = [];
    let sectionChanged = false;
    originalBlocks.forEach((block, blockIndex) => {
      const key = `${sectionIndex}:${blockIndex}`;
      const action = blockPlan.get(key);
      const itemEditsForBlock = itemEdits.get(key);

      if (itemEditsForBlock && block.type === 'list' && Array.isArray(block.items)) {
        const items = [...block.items];
        for (const e of itemEditsForBlock) {
          log.push(`  item lista seção[${sectionIndex}] bloco[${blockIndex}] item[${e.itemIndex}]: "${items[e.itemIndex]}" -> "${e.text}"`);
          items[e.itemIndex] = e.text;
        }
        newBlocks.push({ ...block, items });
        sectionChanged = true;
        return;
      }

      if (!action || action.type === 'keep') {
        newBlocks.push(block);
        return;
      }
      sectionChanged = true;
      if (action.type === 'edit') {
        log.push(`  texto seção[${sectionIndex}] (${section.id}) bloco[${blockIndex}] type=${block.type}: "${norm(block.text).slice(0, 60)}..." -> "${norm(action.text).slice(0, 60)}..."`);
        newBlocks.push({ ...block, text: action.text });
        return;
      }
      if (action.type === 'remove') {
        log.push(`  removido seção[${sectionIndex}] (${section.id}) bloco[${blockIndex}] type=${block.type}: "${norm(block.text).slice(0, 60)}..."`);
        return;
      }
      if (action.type === 'split') {
        log.push(`  dividido seção[${sectionIndex}] (${section.id}) bloco[${blockIndex}] em ${action.parts.length} partes`);
        for (const part of action.parts) {
          newBlocks.push({ ...block, text: part });
        }
        return;
      }
    });
    if (sectionChanged) section.blocks = newBlocks;
  });

  return flagged;
}

function findDraftFile(argPath?: string): string {
  if (argPath) return path.resolve(argPath);
  const downloads = path.join(os.homedir(), 'Downloads');
  const candidates = fs
    .readdirSync(downloads)
    .filter((f) => /^opdds-correcoes-canonicas-.*\.json$/i.test(f))
    .map((f) => ({ f, mtime: fs.statSync(path.join(downloads, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!candidates.length) throw new Error(`Nenhum opdds-correcoes-canonicas-*.json encontrado em ${downloads}`);
  return path.join(downloads, candidates[0].f);
}

function main() {
  const draftPath = findDraftFile(process.argv[2]);
  console.log(`Draft: ${draftPath}`);
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const marker = 'export const artifactBookData = ';
  const start = raw.indexOf(marker);
  if (start < 0) throw new Error('Marcador "export const artifactBookData = " não encontrado no arquivo.');
  const prefix = raw.slice(0, start + marker.length);
  let jsonText = raw.slice(start + marker.length).trimEnd();
  if (jsonText.endsWith(';')) jsonText = jsonText.slice(0, -1);
  const data: { chapters: AnyChapter[] } = JSON.parse(jsonText);

  let anyApplied = false;
  const allFlags: { chapterId: string; op: Op }[] = [];

  for (const chapterId of Object.keys(draft.chapters)) {
    console.log(`\n=== ${chapterId} ===`);
    if (HARDCODED_CHAPTERS.has(chapterId)) {
      console.log('  MANUAL: capítulo hardcoded em canonicalBook.ts (não vem de artifactBookData.ts). Edite a função especial diretamente.');
      continue;
    }
    const artifactIds = artifactChapterMap[chapterId] ?? [chapterId];
    if (artifactIds.length > 1) {
      console.log(`  MANUAL: capítulo composto de múltiplos artifactChapters (${artifactIds.join(', ')}) — não suportado automaticamente ainda.`);
      continue;
    }
    const chapter = data.chapters.find((c) => c.id === artifactIds[0]);
    if (!chapter) {
      console.log(`  AVISO: capítulo "${artifactIds[0]}" não encontrado em artifactBookData.ts.`);
      continue;
    }

    const baseline = flattenArtifactChapter(chapter);
    const draftBlocks: DraftBlock[] = draft.chapters[chapterId];
    const ops = align(baseline, draftBlocks);

    const log: string[] = [];
    const flagged = applyOpsToChapter(chapter, ops, log);

    if (log.length) {
      anyApplied = true;
      console.log('  aplicado:');
      log.forEach((l) => console.log(l));
    } else {
      console.log('  nada a aplicar (já bate com o draft).');
    }
    if (flagged.length) {
      flagged.forEach((op) => allFlags.push({ chapterId, op }));
    }
  }

  if (allFlags.length) {
    console.log('\n\n### SINALIZADO PARA REVISÃO MANUAL ###');
    for (const { chapterId, op } of allFlags) {
      if (op.type === 'flag-insert') {
        console.log(`[${chapterId}] bloco novo no draft (kind=${op.draft.kind}): "${norm(op.draft.text).slice(0, 100)}"`);
      } else if (op.type === 'flag-misaligned') {
        console.log(`[${chapterId}] desalinhamento — restam ${op.baseRemaining.length} blocos originais e ${op.draftRemaining.length} blocos no draft sem casar:`);
        op.baseRemaining.slice(0, 3).forEach((b) => console.log(`   base : kind=${b.kind} "${norm(b.text).slice(0, 80)}"`));
        op.draftRemaining.slice(0, 3).forEach((d) => console.log(`   draft: kind=${d.kind} "${norm(d.text).slice(0, 80)}"`));
      } else if (op.type === 'merge' || op.type === 'split' || op.type === 'delete') {
        console.log(`[${chapterId}] ${op.type} envolvendo título de seção ou item de lista — precisa de decisão manual.`);
      }
    }
  }

  if (!anyApplied) {
    console.log('\nNada foi alterado no arquivo.');
    return;
  }

  const newJsonText = JSON.stringify(data, null, 2);
  const newFileText = prefix + newJsonText + ';\n';
  fs.writeFileSync(DATA_FILE, newFileText, 'utf8');
  console.log(`\nEscrito em ${DATA_FILE}. Rode "npm run canonical:generate" na raiz e confira o git diff.`);
}

main();
