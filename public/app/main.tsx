// src/data/livro/index.ts

// Usamos "import * as" para pegar TUDO o que tem no arquivo
// Isso evita o erro "Module has no exported member"
import * as p0 from './src/data/livro/00-prefacio';
import * as p1 from './src/data/livro/01-introducao';
import * as p2 from './src/data/livro/02-pilar1';
import * as p3 from './src/data/livro/03-pilar2';
import * as p4 from './src/data/livro/04-pilar3';
import * as p5 from './src/data/livro/05-pilar4';
import * as p6 from './src/data/livro/06-pilar5';
import * as p7 from './src/data/livro/07-pilar6';
import * as p8 from './src/data/livro/08-pilar7';
import * as p9 from './src/data/livro/09-pilar8';
import * as p10 from './src/data/livro/10-pilar9';
import * as p11 from './src/data/livro/11-carta';
import * as p12 from './src/data/livro/12-epilogo';

// Função auxiliar que pega o primeiro conteúdo exportado, não importa o nome
const get = (module: any) => Object.values(module)[0];

export const bookContent = [
  get(p0),
  get(p1),
  get(p2),
  get(p3),
  get(p4),
  get(p5),
  get(p6),
  get(p7),
  get(p8),
  get(p9),
  get(p10),
  get(p11),
  get(p12),
];