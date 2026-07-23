export type BookGroupId =
  | 'abertura'
  | 'quebra'
  | 'fundamentos'
  | 'acolhimento'
  | 'sobrevivencia'
  | 'reconstrucao'
  | 'continuidade'
  | 'encerramento';

export const bookGroups = [
  { id: 'abertura', eyebrow: 'Abertura', title: 'Abertura', description: 'Textos iniciais da versão física antes do índice: entrada, nota do autor e créditos.' },
  { id: 'quebra', eyebrow: 'Quebra de expectativa', title: 'Quebra de expectativa', description: 'O livro desacelera promessas rápidas e apresenta quem é o desacreditado.' },
  { id: 'fundamentos', eyebrow: 'Fundamento da obra', title: 'Fundamento da obra', description: 'Consciência, Julgamento e Presença formam a lente usada em toda a jornada.' },
  { id: 'acolhimento', eyebrow: 'Acolhimento e orientação', title: 'Acolhimento e orientação', description: 'Uma entrada sem pressa, cobrança ou obrigação de leitura linear.' },
  { id: 'sobrevivencia', eyebrow: 'Ato I — Tríade da Sobrevivência', title: 'Ato I — Tríade da Sobrevivência', description: 'Reconhecer o que existe, compreender as lealdades e dar nome às ausências.' },
  { id: 'reconstrucao', eyebrow: 'Ato II — Tríade da Reconstrução', title: 'Ato II — Tríade da Reconstrução', description: 'Separar valor de desempenho, sustentar a dor e autorizar o desejo.' },
  { id: 'continuidade', eyebrow: 'Ato III — Tríade da Continuidade', title: 'Ato III — Tríade da Continuidade', description: 'Permanecer quando faltam certeza, abundância e respostas prontas.' },
  { id: 'encerramento', eyebrow: 'Encerramento', title: 'Encerramento', description: 'A carta final, o posfácio e a reflexão final devolvem o leitor à vida.' },
] as const;

const pillarSections = [
  'Abertura',
  'Limiar',
  'Manifesto de Abertura',
  'Narrativa Profunda',
  'Consciência',
  'Julgamento',
  'Carta de Sustentação',
  'Âncora Prática',
  'A Regra',
  'Fecho do Pilar',
];

export const bookStructure = [
  { id: 'capa-digital', title: 'O Poder dos Desacreditados', shortTitle: 'Capa digital', groupId: 'abertura', kind: 'cover', pdfPage: 1, summary: 'Há um poder que só aparece na ausência de expectativa.' },
  { id: 'epigrafe', title: 'Entre', shortTitle: 'Entrada', groupId: 'abertura', kind: 'chapter', pdfPage: 2, summary: 'Toda travessia começa antes do primeiro passo: no instante em que você deixa de lutar contra si mesmo.' },
  { id: 'nota-do-autor', title: 'Nota do autor', shortTitle: 'Nota do autor', groupId: 'abertura', kind: 'chapter', pdfPage: 3, summary: 'Nota sobre o processo de escrita e o cuidado de não transformar presença em performance.' },
  { id: 'creditos', title: 'Créditos', shortTitle: 'Créditos', groupId: 'abertura', kind: 'chapter', pdfPage: 4, summary: 'Dados autorais e direitos da obra.' },
  { id: 'quebra1', title: 'Por que este livro não é autoajuda', shortTitle: 'Por que este livro não é autoajuda', groupId: 'quebra', kind: 'chapter', pdfPage: 5, summary: 'Este livro desacelera promessas rápidas e acompanha quem está tentando não se perder enquanto a vida acontece.' },
  { id: 'quebra2', title: 'Sobre o Desacreditado', shortTitle: 'Sobre o Desacreditado', groupId: 'quebra', kind: 'chapter', pdfPage: 6, summary: 'Quem continuou sem testemunha, aplauso ou reconhecimento encontra aqui uma linguagem para o próprio ponto real.' },
  { id: 'quebra3', title: 'Além da autoajuda', shortTitle: 'Além da autoajuda', groupId: 'quebra', kind: 'chapter', pdfPage: 7, summary: 'Um contraponto à obrigação de transformar dor em espetáculo, desempenho ou sucesso visível.' },
  { id: 'fund1', title: 'A Tríade Humana Fundamental', shortTitle: 'A Tríade Humana Fundamental', groupId: 'fundamentos', kind: 'chapter', pdfPage: 8, summary: 'Consciência percebe, Julgamento interpreta e Presença permite permanecer sem se destruir.' },
  { id: 'fund2', title: 'Autor, ferramenta e presença', shortTitle: 'Autor, ferramenta e presença', groupId: 'fundamentos', kind: 'chapter', pdfPage: 9, summary: 'A autoria como presença sustentada: experiência humana, ferramenta e responsabilidade.' },
  { id: 'fund3', title: 'Da dualidade à trialidade', shortTitle: 'Da dualidade à trialidade', groupId: 'fundamentos', kind: 'chapter', pdfPage: 10, summary: 'Entre sentir e reagir existe um terceiro espaço: a possibilidade de permanecer consciente.' },
  { id: 'acol1', title: 'Prefácio', shortTitle: 'Prefácio', groupId: 'acolhimento', kind: 'chapter', pdfPage: 11, summary: 'Leia sem se cobrar. Pare quando tocar fundo e deixe para depois o que ainda não fizer sentido.' },
  { id: 'acol2', title: 'Introdução', shortTitle: 'Introdução', groupId: 'acolhimento', kind: 'chapter', pdfPage: 12, summary: 'Os pilares são territórios emocionais, não metas nem fases obrigatórias.' },
  { id: 'pilar1', title: 'Pilar I — Reconhecimento', shortTitle: 'Reconhecimento', groupId: 'sobrevivencia', kind: 'chapter', pillar: 1, roman: 'I', pdfPage: 13, summary: 'Onde a negação cessa e o indivíduo encontra o próprio ponto real.', sections: pillarSections },
  { id: 'pilar2', title: 'Pilar II — Família e lealdades invisíveis', shortTitle: 'Família', groupId: 'sobrevivencia', kind: 'chapter', pillar: 2, roman: 'II', pdfPage: 14, summary: 'Lealdades invisíveis e o primeiro lugar onde aprendemos a nos calar.', sections: pillarSections },
  { id: 'interludio', title: 'Interlúdio — Pertencimento e rejeição', shortTitle: 'Interlúdio', groupId: 'sobrevivencia', kind: 'chapter', pdfPage: 15, summary: 'Uma dobra entre pertencimento, rejeição e o modo como o vínculo atravessa a sobrevivência.' },
  { id: 'pilar3', title: 'Pilar III — Luto, ausência e quebra de laços', shortTitle: 'Luto', groupId: 'sobrevivencia', kind: 'chapter', pillar: 3, roman: 'III', pdfPage: 16, summary: 'Mortes reais e simbólicas, ausências sem ritual e aquilo que continua doendo.', sections: pillarSections },
  { id: 'caderno1', title: 'Caderno de presença — Tríade da Sobrevivência', shortTitle: 'Caderno de presença', groupId: 'sobrevivencia', kind: 'caderno', pdfPage: 17, summary: 'Perguntas de escrita para integrar a primeira tríade.' },
  { id: 'pilar4', title: 'Pilar IV — Trabalho, valor e identidade', shortTitle: 'Trabalho', groupId: 'reconstrucao', kind: 'chapter', pillar: 4, roman: 'IV', pdfPage: 18, summary: 'Quando produzir deixa de significar existir e o valor se separa da utilidade.', sections: pillarSections },
  { id: 'pilar5', title: 'Pilar V — Dor, fuga e anestesia', shortTitle: 'Dor', groupId: 'reconstrucao', kind: 'chapter', pillar: 5, roman: 'V', pdfPage: 19, summary: 'Rotas de escape que começaram como sobrevivência.', sections: pillarSections },
  { id: 'pilar6', title: 'Pilar VI — Desejo, amor e frustração', shortTitle: 'Desejo', groupId: 'reconstrucao', kind: 'chapter', pillar: 6, roman: 'VI', pdfPage: 20, summary: 'Quando o vínculo deixa de ser encontro e vira prova.', sections: pillarSections },
  { id: 'caderno2', title: 'Caderno de presença — Tríade da Reconstrução', shortTitle: 'Caderno de presença', groupId: 'reconstrucao', kind: 'caderno', pdfPage: 21, summary: 'Perguntas de escrita para integrar a segunda tríade.' },
  { id: 'pilar7', title: 'Pilar VII — Fé, sentido e desencanto', shortTitle: 'Fé', groupId: 'continuidade', kind: 'chapter', pillar: 7, roman: 'VII', pdfPage: 22, summary: 'Fé, sentido e desencanto para quem deixou de acreditar por cansaço.', sections: pillarSections },
  { id: 'pilar8', title: 'Pilar VIII — Escassez, medo e sustentação', shortTitle: 'Escassez', groupId: 'continuidade', kind: 'chapter', pillar: 8, roman: 'VIII', pdfPage: 23, summary: 'Ver a falta sem se tornar falta e recuperar escala diante da urgência.', sections: pillarSections },
  { id: 'pilar9', title: 'Pilar IX — Vazio, presença e continuidade', shortTitle: 'Vazio', groupId: 'continuidade', kind: 'chapter', pillar: 9, roman: 'IX', pdfPage: 24, summary: 'O silêncio deixa de ser ameaça e a continuidade se torna cuidado.', sections: pillarSections },
  { id: 'caderno3', title: 'Caderno de presença — Tríade da Continuidade', shortTitle: 'Caderno de presença', groupId: 'continuidade', kind: 'caderno', pdfPage: 25, summary: 'Perguntas de escrita para integrar a terceira tríade.' },
  { id: 'enc1', title: 'Epílogo — Onde a presença continua', shortTitle: 'Epílogo', groupId: 'encerramento', kind: 'chapter', pdfPage: 26, summary: 'O livro termina sem exigir conclusão: a proposta continua na forma de presença.' },
  { id: 'caderno4', title: 'Caderno de presença — Reflexão final', shortTitle: 'Caderno de presença', groupId: 'encerramento', kind: 'caderno', pdfPage: 27, summary: 'Perguntas finais para registrar o que permanece depois da travessia.' },
  { id: 'enc2', title: 'Carta final do autor', shortTitle: 'Carta final', groupId: 'encerramento', kind: 'chapter', pdfPage: 28, summary: 'Uma carta para quem não precisa de aplauso, mas de respeito pela própria permanência.' },
  { id: 'enc3', title: 'Posfácio', shortTitle: 'Posfácio', groupId: 'encerramento', kind: 'chapter', pdfPage: 29, summary: 'Uma última pausa: não transforme estas páginas em meta.' },
] as const;

export const pillarLetters = [
  ['I', 'Carta de Reconhecimento', 'Escreva para a parte de você que passou tempo demais sendo tratada como inimiga.', 'Hoje eu reconheço que...'],
  ['II', 'Carta de Devolução', 'Escreva o que recebeu da família, o que honra e o que já não precisa carregar.', 'Com respeito à minha história, eu devolvo...'],
  ['III', 'Carta à Ausência', 'Dê nome ao que não voltou e ao que ainda permanece vivo em você.', 'Hoje eu reconheço a ausência de...'],
  ['IV', 'Carta ao Meu Valor', 'Escreva para si sem usar resultado, produtividade ou utilidade como medida.', 'Mesmo quando eu não produzo...'],
  ['V', 'Carta à Minha Dor', 'Converse com a dor sem expulsá-la e sem transformá-la em identidade.', 'Eu percebo que você aparece quando...'],
  ['VI', 'Carta de Autorização', 'Nomeie aquilo que deseja sem pedir desculpas e sem exigir garantia.', 'Eu me autorizo a querer...'],
  ['VII', 'Carta ao Não Saber', 'Deixe dúvida, fé e desencanto ocuparem a mesma página.', 'Eu ainda não sei, mas...'],
  ['VIII', 'Carta do Suficiente', 'Separe o que falta, o que ainda existe e qual ação mínima é possível.', 'Hoje falta..., ainda existe..., e eu posso...'],
  ['IX', 'Carta de Continuidade', 'Escreva um pacto pequeno para não desaparecer de si quando o vazio chegar.', 'Quando eu não tiver respostas, escolho...'],
  ['∞', 'Carta para Quem Eu Me Tornei', 'Registre o que deseja lembrar sem transformar a jornada em meta.', 'Depois desta travessia, eu quero me lembrar de...'],
].map(([roman, title, prompt, starter], index) => ({ id: index === 9 ? 'final' : `pilar-${index + 1}`, pillar: index + 1, roman, title, prompt, starter }));
