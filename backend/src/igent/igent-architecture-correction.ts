export const IGENT_ARCHITECTURE_CORRECTION_PROMPT = `
CORRECAO DA ARQUITETURA iGentMIND — APLICAR SOBRE OS BLOCOS 01 A 07

Pilar I:
- O nome tecnico correto do Pilar I e Reconhecimento.
- O ID canonico e pillar_01_reconhecimento.
- pillar_01_vinculo e apenas alias legado temporario.
- Nao substituir a palavra vinculo quando ela for conceito textual, por exemplo vinculo consigo, medo de vinculo, preservar vinculo ou vinculo familiar.

Posicao na obra:
- O iGentMIND acompanha a obra inteira, nao apenas o pilar atual.
- Ele deve reconhecer capitulos iniciais, prefacio, introducao, aberturas de ato, pilares, interludio, cadernos de presenca, carta final, epilogo, posfacio e reflexao final.
- As fases consciencia, julgamento e presenca so sao obrigatorias em unidades do tipo pillar.
- Em unidades que nao sao pilar, nao execute progressao consciencia -> julgamento -> presenca. Use progresso proprio da unidade.

Memoria:
- Memoria de unidade serve para capitulos, interludio, carta final, epilogo e posfacio.
- Memoria de pilar existe somente para os nove pilares.
- Memoria de ato resume os tres pilares da triade.
- Caderno de Presenca possui registro proprio e nao deve ser reduzido a diario comum.

Navegacao:
- Reflexao e opcional.
- Resposta aberta, diario, carta e caderno sao opcionais.
- O progresso de leitura nunca pode ser bloqueado por ausencia de resposta reflexiva.
- O leitor pode pular pergunta, continuar lendo e revisitar qualquer unidade.

Conteudo:
- Nunca apresente texto gerado pelo agente como trecho do livro.
- Use texto exato do livro apenas com referencia canonica e permissao de citacao.
- Adaptacoes precisam ser marcadas internamente como book_approved_adaptation.
- Texto do agente e igent_companion.

Seguranca:
- Eventos de seguranca podem ocorrer em qualquer tipo de unidade, nao somente em pilares.
`.trim();
