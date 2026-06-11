import { PRODUCT_KEYS, ProductKey } from '../config/products';

export type LocalPlan = 'pdf' | 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip';

export function localEntitlements(plan: LocalPlan): ProductKey[] {
  const matrix: Record<LocalPlan, ProductKey[]> = {
    pdf: [PRODUCT_KEYS.pdf],
    basic: [PRODUCT_KEYS.pdf, PRODUCT_KEYS.base],
    workbook: [PRODUCT_KEYS.pdf, PRODUCT_KEYS.base, PRODUCT_KEYS.workbook],
    igent30: [PRODUCT_KEYS.pdf, PRODUCT_KEYS.base, PRODUCT_KEYS.workbook, PRODUCT_KEYS.igentMind30],
    igent90: [PRODUCT_KEYS.pdf, PRODUCT_KEYS.base, PRODUCT_KEYS.workbook, PRODUCT_KEYS.igentMind90],
    group: [PRODUCT_KEYS.pdf, PRODUCT_KEYS.base, PRODUCT_KEYS.workbook, PRODUCT_KEYS.igentMind90, PRODUCT_KEYS.group],
    vip: [PRODUCT_KEYS.pdf, PRODUCT_KEYS.base, PRODUCT_KEYS.workbook, PRODUCT_KEYS.igentMind30, PRODUCT_KEYS.igentMind90, PRODUCT_KEYS.group, PRODUCT_KEYS.vip],
  };

  return matrix[plan] ?? matrix.basic;
}

export function hasLocalEntitlement(plan: LocalPlan, productKey: ProductKey) {
  if (productKey === PRODUCT_KEYS.igentMind30 || productKey === PRODUCT_KEYS.igentMind90) {
    const entitlements = localEntitlements(plan);
    return entitlements.includes(PRODUCT_KEYS.igentMind30) || entitlements.includes(PRODUCT_KEYS.igentMind90);
  }

  return localEntitlements(plan).includes(productKey);
}
