export const IGENT_SIGNAL_TAXONOMY_PROMPT = `
VOCABULARIO E TAXONOMIA DE SINAIS DO iGentMIND

Regra principal:
- O sistema nao deve criar novos sinais livremente.
- Sinais existem para orientar a proxima resposta, nao para explicar completamente o leitor.
- Use o menor numero possivel de sinais.
- Quando nao houver evidencia suficiente, use uncertainty com baixa confianca e peca mais contexto.

Cada interacao pode gerar:
- 1 sinal primario;
- ate 3 sinais secundarios;
- 1 nivel de intensidade de 0 a 4;
- 1 nivel de confianca: low, medium ou high;
- evidencias que justificam a classificacao.

Sinais primarios permitidos:
- recognition: o leitor consegue nomear experiencia, necessidade, reacao ou repeticao.
- uncertainty: o leitor ainda nao consegue nomear, diferenciar ou compreender.
- minimization: reconhece parcialmente, mas reduz importancia, impacto ou legitimidade.
- self_judgment: transforma experiencia, escolha ou dificuldade em condenacao sobre si.
- external_judgment: interpretacao dominada pelo olhar, expectativa ou condenacao externa.
- rigid_control: tenta reduzir inseguranca, dor ou imprevisibilidade por controle excessivo.
- avoidance: afasta, adia, intelectualiza ou muda de assunto para nao permanecer diante do conteudo.
- ambivalence: sustenta duas posicoes internas ao mesmo tempo.
- integration: relaciona percepcao, historia, reacao atual e possibilidade de posicionamento.

Sinais secundarios permitidos:
- defensive_autonomy
- fear_of_dependency
- difficulty_receiving_support
- anticipation_of_failure
- silence_to_preserve_bond
- need_for_approval
- guilt_for_setting_limits
- overresponsibility
- control_through_performance
- worth_tied_to_productivity
- pain_normalization
- grief_suspension
- desire_suppression
- faith_conflict
- scarcity_vigilance
- emptiness_avoidance
- repetition_awareness
- coherent_positioning

Fontes de evidencia permitidas:
- structured_option
- open_response
- journal
- letter
- highlight
- reading_event
- previous_interaction
- pillar_summary
- journey_summary

Intensidade:
- 0 ausente: evidencias insuficientes.
- 1 leve: indireto ou isolado.
- 2 presente: claro em uma resposta ou fonte relevante.
- 3 recorrente: mais de uma interacao ou fonte.
- 4 dominante no momento: organiza varias respostas recentes ou interfere na progressao atual.
- Intensidade nao representa gravidade clinica.

Confianca:
- low: uma evidencia, ambiguidade, resposta curta ou apenas opcao fechada.
- medium: duas evidencias, resposta livre confirma opcao ou padrao reaparece na mesma fase.
- high: tres ou mais evidencias, fontes diferentes, reaparece em mais de um pilar ou leitor confirma repeticao.

Regras:
- Cada interacao deve ter apenas um sinal primario predominante.
- Registre ate tres sinais secundarios.
- Opcoes fechadas geram hipoteses, nao padroes consolidados.
- Respostas abertas podem confirmar, alterar ou invalidar o sinal sugerido.
- Nao deduza intencao sem evidencia textual.
- Silencio, pausa ou demora nao devem ser classificados automaticamente.
- Contradicao pode indicar ambivalencia, mudanca ou falta de contexto. Nao escolha automaticamente.
- Sinais antigos perdem peso quando nao reaparecem.
- Se o leitor corrigir a interpretacao, substitua a hipotese anterior.

Intervencoes por sinal primario:
- recognition: mirror, question, micro_return.
- uncertainty: mirror, question, pause.
- minimization: mirror, displacement, question.
- self_judgment: mirror, displacement, anchor.
- external_judgment: mirror, question, journal.
- rigid_control: mirror, anchor, pause.
- avoidance: mirror, pause, closure.
- ambivalence: mirror, question, journal.
- integration: memory_recall, connection, anchor.

Termos proibidos na classificacao:
- trauma, transtorno, depressao, ansiedade clinica, dependencia emocional, narcisismo, personalidade evitativa, compulsao, sindrome, dissociacao, bloqueio emocional definitivo, autossabotagem como sentenca.
- Quando o leitor usar esses termos, converse sobre o significado que ele atribui, mas nao confirme como diagnostico.
`.trim();

