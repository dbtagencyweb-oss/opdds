export type BookGroupId = 'quebra' | 'fundamentos' | 'acolhimento' | 'sobrevivencia' | 'reconstrucao' | 'continuidade' | 'encerramento';

export const bookGroups = [
  { id: 'quebra', eyebrow: 'Quebra de expectativa', title: 'Antes de começar', description: 'O livro desmonta a promessa de solução rápida e apresenta quem é o desacreditado.' },
  { id: 'fundamentos', eyebrow: 'Fundamentos da obra', title: 'A Tríade Humana Fundamental', description: 'Consciência, Julgamento e Presença formam a lente usada em toda a jornada.' },
  { id: 'acolhimento', eyebrow: 'Acolhimento e orientação', title: 'Como atravessar o livro', description: 'Uma entrada sem pressa, cobrança ou obrigação de leitura linear.' },
  { id: 'sobrevivencia', eyebrow: 'Ato I · Primeira Tríade', title: 'A Sobrevivência', description: 'Reconhecer o que existe, compreender as lealdades e dar nome às ausências.' },
  { id: 'reconstrucao', eyebrow: 'Ato II · Segunda Tríade', title: 'A Reconstrução', description: 'Separar valor de desempenho, sustentar a dor e autorizar o desejo.' },
  { id: 'continuidade', eyebrow: 'Ato III · Terceira Tríade', title: 'A Continuidade', description: 'Permanecer quando faltam certeza, abundância e respostas prontas.' },
  { id: 'encerramento', eyebrow: 'Encerramento', title: 'Onde a presença continua', description: 'A carta final e um epílogo que devolvem o leitor à vida.' },
] as const;

const pillarSections = ['Limiar', 'Manifesto de abertura', 'Narrativa profunda', 'Consciência', 'Julgamento', 'Presença', 'Âncora prática', 'Fecho do pilar'];

export const bookStructure = [
  { id: 'nao-e-autoajuda', title: 'Por que este livro não é autoajuda', shortTitle: 'Por que não é autoajuda', groupId: 'quebra', kind: 'capitulo', pdfPage: 10, summary: 'Uma obra que não promete vencer, consertar ou acelerar: oferece presença para quem continua.' },
  { id: 'o-desacreditado', title: 'Sobre o Desacreditado', shortTitle: 'O Desacreditado', groupId: 'quebra', kind: 'capitulo', pdfPage: 20, summary: 'O desacreditado não é quem desistiu, mas quem permaneceu sem receber reconhecimento.' },
  { id: 'alem-da-autoajuda', title: 'Além da Autoajuda', shortTitle: 'Além da Autoajuda', groupId: 'quebra', kind: 'capitulo', pdfPage: 31, summary: 'Um contraponto à obrigação de transformar dor em espetáculo, desempenho ou sucesso visível.' },
  { id: 'triade-humana', title: 'A Tríade Humana Fundamental', shortTitle: 'A Tríade Humana', groupId: 'fundamentos', kind: 'capitulo', pdfPage: 37, summary: 'Consciência percebe, Julgamento interpreta e Presença permite permanecer sem se destruir.' },
  { id: 'autor-ferramenta-presenca', title: 'Autor, Ferramenta e Presença', shortTitle: 'Autor, Ferramenta e Presença', groupId: 'fundamentos', kind: 'capitulo', pdfPage: 46, summary: 'A autoria como presença sustentada: experiência humana, ferramenta e responsabilidade.' },
  { id: 'dualidade-trialidade', title: 'Da Dualidade à Trialidade', shortTitle: 'Da Dualidade à Trialidade', groupId: 'fundamentos', kind: 'capitulo', pdfPage: 53, summary: 'Entre sentir e reagir existe um terceiro espaço: a possibilidade de permanecer consciente.' },
  { id: 'prefacio', title: 'Prefácio', shortTitle: 'Prefácio', groupId: 'acolhimento', kind: 'prefacio', pdfPage: 63, summary: 'Leia sem se cobrar. Pare quando tocar fundo e deixe para depois o que ainda não fizer sentido.' },
  { id: 'introducao', title: 'Introdução', shortTitle: 'Introdução', groupId: 'acolhimento', kind: 'introducao', pdfPage: 66, summary: 'Os pilares são territórios emocionais, não metas nem fases obrigatórias.' },
  { id: 'reconhecimento', title: 'Pilar I — Reconhecimento', shortTitle: 'Reconhecimento', groupId: 'sobrevivencia', kind: 'pilar', pillar: 1, roman: 'I', pdfPage: 72, summary: 'Onde a negação cessa e o indivíduo encontra o próprio ponto real.', sections: pillarSections },
  { id: 'familia', title: 'Pilar II — Família', shortTitle: 'Família', groupId: 'sobrevivencia', kind: 'pilar', pillar: 2, roman: 'II', pdfPage: 109, summary: 'Lealdades invisíveis e o primeiro lugar onde aprendemos a nos calar.', sections: pillarSections },
  { id: 'luto', title: 'Pilar III — Luto', shortTitle: 'Luto', groupId: 'sobrevivencia', kind: 'pilar', pillar: 3, roman: 'III', pdfPage: 154, summary: 'Mortes reais e simbólicas, ausências sem ritual e aquilo que continua doendo.', sections: pillarSections },
  { id: 'trabalho', title: 'Pilar IV — Trabalho', shortTitle: 'Trabalho', groupId: 'reconstrucao', kind: 'pilar', pillar: 4, roman: 'IV', pdfPage: 173, summary: 'Quando produzir deixa de significar existir e o valor se separa da utilidade.', sections: pillarSections },
  { id: 'dor', title: 'Pilar V — Dor', shortTitle: 'Dor', groupId: 'reconstrucao', kind: 'pilar', pillar: 5, roman: 'V', pdfPage: 189, summary: 'Dor, fuga e anestesia: rotas de escape que começaram como sobrevivência.', sections: pillarSections },
  { id: 'desejo', title: 'Pilar VI — Desejo', shortTitle: 'Desejo', groupId: 'reconstrucao', kind: 'pilar', pillar: 6, roman: 'VI', pdfPage: 207, summary: 'Amor, projeção e frustração quando o vínculo deixa de ser encontro e vira prova.', sections: pillarSections },
  { id: 'fe', title: 'Pilar VII — Fé', shortTitle: 'Fé', groupId: 'continuidade', kind: 'pilar', pillar: 7, roman: 'VII', pdfPage: 228, summary: 'Fé, sentido e desencanto para quem deixou de acreditar por cansaço.', sections: pillarSections },
  { id: 'escassez', title: 'Pilar VIII — Escassez', shortTitle: 'Escassez', groupId: 'continuidade', kind: 'pilar', pillar: 8, roman: 'VIII', pdfPage: 243, summary: 'Ver a falta sem se tornar falta e recuperar escala diante da urgência.', sections: pillarSections },
  { id: 'vazio', title: 'Pilar IX — Vazio', shortTitle: 'Vazio', groupId: 'continuidade', kind: 'pilar', pillar: 9, roman: 'IX', pdfPage: 255, summary: 'O silêncio deixa de ser ameaça e a continuidade se torna cuidado.', sections: pillarSections },
  { id: 'carta-final', title: 'Carta Final do Autor', shortTitle: 'Carta Final', groupId: 'encerramento', kind: 'carta-final', pdfPage: 272, summary: 'Uma carta para quem não precisa de aplauso, mas de respeito pela própria permanência.' },
  { id: 'epilogo', title: 'Epílogo — Onde a Presença Continua', shortTitle: 'Epílogo', groupId: 'encerramento', kind: 'epilogo', pdfPage: 277, summary: 'O livro termina sem exigir conclusão: a proposta continua na forma de presença.', sections: ['Epílogo', 'Posfácio', 'Caderno de Presença · Reflexão final'] },
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
