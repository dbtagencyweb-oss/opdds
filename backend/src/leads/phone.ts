/**
 * Normaliza telefone para DDD + número, só dígitos e sem o DDI 55
 * ("+55 (11) 98765-4321" → "11987654321").
 */
export function normalizeWhatsapp(value: unknown): string {
  let digits = String(value ?? '').replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  return digits;
}

/**
 * Formas equivalentes do mesmo celular, com e sem o 9º dígito, para cruzar o
 * telefone do checkout com o que a pessoa digitou no quiz.
 */
export function whatsappVariants(value: unknown): string[] {
  const digits = normalizeWhatsapp(value);
  if (digits.length === 11 && digits[2] === '9') return [digits, digits.slice(0, 2) + digits.slice(3)];
  if (digits.length === 10 && /[6-9]/.test(digits[2])) return [digits, `${digits.slice(0, 2)}9${digits.slice(2)}`];
  return digits.length >= 10 ? [digits] : [];
}
