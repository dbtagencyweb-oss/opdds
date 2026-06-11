export const PRODUCT_KEYS = {
  pdf: 'opdds_pdf',
  base: 'opdds_base',
  workbook: 'opdds_diario',
  igentMind30: 'opdds_igentmind_30d',
  igentMind90: 'opdds_igentmind_90d',
  group: 'opdds_grupo',
  vip: 'opdds_vip',
} as const;

export type ProductKey = typeof PRODUCT_KEYS[keyof typeof PRODUCT_KEYS];

export const PRODUCT_LABELS: Record<ProductKey, string> = {
  [PRODUCT_KEYS.pdf]: 'PDF do livro',
  [PRODUCT_KEYS.base]: 'Livro + App + Áudios',
  [PRODUCT_KEYS.workbook]: 'Diário dos Desacreditados',
  [PRODUCT_KEYS.igentMind30]: 'iGentMIND 30 dias',
  [PRODUCT_KEYS.igentMind90]: 'iGentMIND 90 dias',
  [PRODUCT_KEYS.group]: 'Grupo de apoio',
  [PRODUCT_KEYS.vip]: 'Pacote VIP',
};
