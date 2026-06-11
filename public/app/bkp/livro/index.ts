// src/data/livro/index.ts
import * as p0 from './00-prefacio';
import * as p1 from './01-introducao';
import * as p2 from './02-pilar1';
import * as p3 from './03-pilar2';
import * as p4 from './04-pilar3';
import * as p5 from './05-pilar4';
import * as p6 from './06-pilar5';
import * as p7 from './07-pilar6';
import * as p8 from './08-pilar7';
import * as p9 from './09-pilar8';
import * as p10 from './10-pilar9';
import * as p11 from './11-carta';
import * as p12 from './12-epilogo';

const get = (mod: any) => Object.values(mod)[0];

export const bookContent = [
  get(p0), get(p1), get(p2), get(p3), get(p4), get(p5), 
  get(p6), get(p7), get(p8), get(p9), get(p10), get(p11), get(p12)
];