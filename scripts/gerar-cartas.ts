/**
 * Gera as páginas das 9 Cartas de Sustentação da LP a partir do livro.
 *
 *   npm run cartas:gerar
 *
 * Fonte do texto: índice canônico do livro (backend/src/igent/opdds-canonical-book-data.ts,
 * regenerado por `npm run canonical:generate`). Modelo visual: lp/carta/_modelo/index.html.
 * Saída: lp/carta/cartas.json e lp/carta/<romano>/index.html (i … ix), para subir na LP.
 *
 * O texto é copiado como está no livro: só o marcador [br] vira parágrafo próprio.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { OPDDS_CANONICAL_BOOK_INDEX } from '../backend/src/igent/opdds-canonical-book-data';

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'lp', 'carta');
const MODELO = path.join(OUT_DIR, '_modelo', 'index.html');
// Os áudios do livro ficam publicados no subdomínio do app.
const MEDIA_BASE = 'https://app.opoderdosdesacreditados.online';

type Bloco = { tipo: 'p' | 'quote'; texto: string };
type Carta = {
  pilar: string;
  romano: string;
  codigo: string;
  ato: string;
  triade: string;
  titulo: string;
  blocos: Bloco[];
  audioUrl: string | null;
};

const PILARES = [
  { n: 1, romano: 'I', nome: 'Reconhecimento' },
  { n: 2, romano: 'II', nome: 'Família' },
  { n: 3, romano: 'III', nome: 'Luto' },
  { n: 4, romano: 'IV', nome: 'Trabalho' },
  { n: 5, romano: 'V', nome: 'Dor' },
  { n: 6, romano: 'VI', nome: 'Desejo' },
  { n: 7, romano: 'VII', nome: 'Fé' },
  { n: 8, romano: 'VIII', nome: 'Escassez' },
  { n: 9, romano: 'IX', nome: 'Vazio' },
];

const ATOS = [
  { romano: 'I', triade: 'Tríade da Sobrevivência' },
  { romano: 'II', triade: 'Tríade da Reconstrução' },
  { romano: 'III', triade: 'Tríade da Continuidade' },
];

function falha(mensagem: string): never {
  console.error(`\n✖ ${mensagem}\n`);
  process.exit(1);
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string);

/** Texto da seção → título (1ª linha) + blocos. `[br]` e linha em branco separam parágrafos. */
function blocosDoTexto(texto: string): { titulo: string; blocos: Bloco[] } {
  const [primeira, ...resto] = texto.replace(/\r/g, '').split('\n');
  const blocos = resto
    .join('\n')
    .split(/\n\s*\n|\[br\]/i)
    .map((trecho) => trecho.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map<Bloco>((trecho) => ({ tipo: /^“[^”]*”$/.test(trecho) ? 'quote' : 'p', texto: trecho }));
  return { titulo: primeira.trim(), blocos };
}

// ── aplicaNome do modelo: mesma função do navegador, testada aqui ──────────────
const modelo = fs.readFileSync(MODELO, 'utf8');
const trechoNome = modelo.match(/function aplicaNome[\s\S]*?(?=\n\/\* ===== render)/);
if (!trechoNome) falha('Não achei aplicaNome/__testeNome no modelo.');
const sandbox: any = { window: {} };
vm.runInNewContext(`${trechoNome[0]}\nthis.aplicaNome = aplicaNome;`, sandbox);
const aplicaNome: (texto: string, nome: string) => string = sandbox.aplicaNome;

const testes: Array<{ in: string; out: string; ok: boolean }> = sandbox.window.__testeNome();
const quebrados = testes.filter((teste) => !teste.ok);
console.log(`Testes de {nome}: ${testes.length - quebrados.length}/${testes.length} ok`);
if (quebrados.length) falha(`aplicaNome falhou em: ${JSON.stringify(quebrados, null, 2)}`);

// ── Cartas a partir do livro ─────────────────────────────────────────────────
const capitulos: any[] = (OPDDS_CANONICAL_BOOK_INDEX as any).chapters;
const cartas: Record<string, Carta> = {};

for (const pilar of PILARES) {
  const capitulo = capitulos.find((c) => c.id === `pilar${pilar.n}`);
  if (!capitulo) falha(`Capítulo pilar${pilar.n} não encontrado no livro.`);
  if (!new RegExp(`^Pilar ${pilar.romano} — ${pilar.nome}`).test(capitulo.title)) {
    falha(`pilar${pilar.n} tem o título "${capitulo.title}", esperado "Pilar ${pilar.romano} — ${pilar.nome}…". O livro mudou de ordem?`);
  }
  const secoes = capitulo.sections.filter((s: any) => /^carta de sustenta/i.test(s.title));
  if (secoes.length !== 1) falha(`Pilar ${pilar.romano}: ${secoes.length} seções "Carta de Sustentação" (esperado 1).`);

  const faixa = (capitulo.audioTracks || []).find((t: any) => /carta de sustenta/i.test(t.label));
  const { titulo, blocos } = blocosDoTexto(secoes[0].text);
  if (!titulo || blocos.length === 0) falha(`Pilar ${pilar.romano}: carta vazia.`);

  const ato = ATOS[Math.ceil(pilar.n / 3) - 1];
  cartas[pilar.romano.toLowerCase()] = {
    pilar: `${pilar.romano} · ${pilar.nome}`,
    romano: pilar.romano,
    codigo: `pilar_${pilar.n}`,
    ato: ato.romano,
    triade: ato.triade,
    titulo,
    blocos,
    audioUrl: faixa?.url ? `${MEDIA_BASE}${faixa.url}` : null,
  };
}

// ── Páginas ─────────────────────────────────────────────────────────────────
function troca(html: string, padrao: RegExp, novo: string, rotulo: string) {
  const achados = html.match(new RegExp(padrao.source, padrao.flags.includes('g') ? padrao.flags : `${padrao.flags}g`));
  if (!achados || achados.length !== 1) falha(`Modelo: "${rotulo}" apareceu ${achados?.length ?? 0} vezes (esperado 1).`);
  return html.replace(padrao, () => novo);
}

const NOSCRIPT = '<noscript><style>#env{display:none}.carta p{opacity:1;transform:none;filter:none}body{overflow:auto}</style></noscript>';

function pagina(carta: Carta) {
  const dados = { pilar: carta.pilar, romano: carta.romano, codigo: carta.codigo, ato: carta.ato, triade: carta.triade, audioUrl: carta.audioUrl, blocos: carta.blocos };
  // Versão sem nome escrita direto no HTML (o JS só substitui).
  const paragrafos = carta.blocos
    .map((b) => `<p${b.tipo === 'quote' ? ' class="quote"' : ''}>${escapeHtml(aplicaNome(b.texto, ''))}</p>`)
    .join('');
  const json = JSON.stringify(dados).replace(/</g, '\\u003c');

  let html = modelo;
  html = troca(html, /<title>[^<]*<\/title>/, `<title>Carta de Sustentação · ${escapeHtml(carta.pilar)} — O Poder dos Desacreditados</title>`, 'title');
  html = troca(html, /<span id="envPilar">[^<]*<\/span>/, `<span id="envPilar">${escapeHtml(carta.pilar)}</span>`, 'envPilar');
  html = troca(html, /<b id="sealNum">[^<]*<\/b>/, `<b id="sealNum">${carta.romano}</b>`, 'sealNum');
  html = troca(html, /<div class="label" id="lbl">[^<]*<\/div>/, `<div class="label" id="lbl">Carta de Sustentação · ${escapeHtml(carta.pilar)}</div>`, 'lbl');
  html = troca(html, /<div class="sub" id="sub">[^<]*<\/div>/, `<div class="sub" id="sub">Ato ${carta.ato} · ${escapeHtml(carta.triade)}</div>`, 'sub');
  html = troca(html, /<p class="ctitle" id="ctitle">[^<]*<\/p>/, `<p class="ctitle" id="ctitle">${escapeHtml(carta.titulo)}</p>`, 'ctitle');
  html = troca(html, /<article class="carta" id="carta"><\/article>/, `<article class="carta" id="carta">${paragrafos}</article>`, 'article');
  html = troca(html, /\/\* ===== DADOS[^\n]*\n\s*var CARTA=\{[\s\S]*?\n \]\};/, `/* ===== DADOS (gerado por scripts/gerar-cartas.ts a partir do livro) ===== */\nvar CARTA=${json};`, 'CARTA');
  html = troca(html, /\n\s*if\(t==='demo'\)\{[^\n]*/, '', 'modo demo');
  html = troca(html, /<\/head>/, `${NOSCRIPT}\n</head>`, '</head>');
  if (/\[Demonstração\]|Marina/.test(html)) falha(`Página ${carta.romano}: sobrou conteúdo de demonstração.`);
  return html;
}

fs.writeFileSync(path.join(OUT_DIR, 'cartas.json'), `${JSON.stringify(cartas, null, 2)}\n`);
for (const [romano, carta] of Object.entries(cartas)) {
  const dir = path.join(OUT_DIR, romano);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pagina(carta));
  console.log(`  carta/${romano}/  ${carta.pilar.padEnd(18)} ${String(carta.blocos.length).padStart(2)} parágrafos  áudio: ${carta.audioUrl ? 'sim' : 'não'}  "${carta.titulo}"`);
}
console.log(`\nPronto: ${Object.keys(cartas).length} cartas em ${path.relative(ROOT, OUT_DIR)}/`);
