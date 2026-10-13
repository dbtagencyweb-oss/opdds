/**
 * IP real de quem fez a requisição. Na produção o tráfego chega por
 * Cloudflare → Render: o Cloudflare sobrescreve `cf-connecting-ip` com o IP
 * do cliente (não dá para forjar passando por ele). Fora disso, cai no
 * primeiro X-Forwarded-For (com `trust proxy` ligado) e no IP da conexão.
 */
export function clientIp(req: Record<string, any>): string {
  const header = (name: string) => {
    const value = req.headers?.[name];
    return String(Array.isArray(value) ? value[0] : value || '').trim();
  };

  return header('cf-connecting-ip') || header('true-client-ip') || req.ips?.[0] || req.ip || '';
}
