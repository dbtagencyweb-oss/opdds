// Os 9 dilemas do quiz da LP. O código (pilar_N) é o que trafega e vai ao
// Meta; o nome só aparece no banco, no admin e na automação.
export const PILARES: Record<string, string> = {
  pilar_1: 'I · Reconhecimento',
  pilar_2: 'II · Família',
  pilar_3: 'III · Luto',
  pilar_4: 'IV · Trabalho',
  pilar_5: 'V · Dor',
  pilar_6: 'VI · Desejo',
  pilar_7: 'VII · Fé',
  pilar_8: 'VIII · Escassez',
  pilar_9: 'IX · Vazio',
};

export const PILAR_CODES = Object.keys(PILARES);

export const ATOS: Record<string, string> = {
  ato_1: 'I · Sobrevivência',
  ato_2: 'II · Reconstrução',
  ato_3: 'III · Continuidade',
};

/** pilar_1..3 → ato_1, pilar_4..6 → ato_2, pilar_7..9 → ato_3. */
export function atoDoPilar(pilar: string): string {
  const n = Number(String(pilar).replace('pilar_', ''));
  return `ato_${Math.min(3, Math.max(1, Math.ceil(n / 3)))}`;
}
