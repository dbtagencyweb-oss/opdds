import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { getMetaAdAccountId, getMetaAdsAccessToken } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;
const REQUEST_TIMEOUT_MS = 15_000;

const VALID_PERIODS = new Set([
  'today', 'yesterday', 'last_3d', 'last_7d', 'last_14d', 'last_28d', 'last_30d', 'this_month', 'last_month', 'maximum',
]);

const VALID_STATUSES = new Set(['ACTIVE', 'PAUSED', 'ARCHIVED', 'DELETED', 'IN_PROCESS', 'WITH_ISSUES']);

function safePeriod(period?: string) {
  const value = String(period || 'last_7d');
  return VALID_PERIODS.has(value) ? value : 'last_7d';
}

function safeStatus(status?: string) {
  const value = String(status || 'ACTIVE').toUpperCase();
  return value === 'ALL' || VALID_STATUSES.has(value) ? value : 'ACTIVE';
}

function numberParam(value: any, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function maskToken(token: string) {
  if (!token) return null;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function endOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(23, 59, 59, 999);
  return clone;
}

function daysAgo(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() - days);
  return clone;
}

/**
 * Aproxima o intervalo de datas de um date_preset da Meta, usado só quando a
 * resposta do Graph não trouxe insights (então não há date_start/date_stop reais
 * pra copiar) — ex.: conta sem campanhas no filtro de nome.
 */
function resolvePeriodRange(period: string, now: Date = new Date()): { since: Date; until: Date } {
  const until = endOfDay(now);
  switch (period) {
    case 'today':
      return { since: startOfDay(now), until };
    case 'yesterday': {
      const y = daysAgo(now, 1);
      return { since: startOfDay(y), until: endOfDay(y) };
    }
    case 'last_3d':
      return { since: startOfDay(daysAgo(now, 2)), until };
    case 'last_14d':
      return { since: startOfDay(daysAgo(now, 13)), until };
    case 'last_28d':
      return { since: startOfDay(daysAgo(now, 27)), until };
    case 'last_30d':
      return { since: startOfDay(daysAgo(now, 29)), until };
    case 'this_month':
      return { since: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), until };
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { since: startOfDay(start), until: endOfDay(end) };
    }
    case 'maximum':
      return { since: startOfDay(daysAgo(now, 365 * 3)), until };
    case 'last_7d':
    default:
      return { since: startOfDay(daysAgo(now, 6)), until };
  }
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

type CampaignMetric = {
  id: string; name: string; status: string; objective: string;
  spend: number; impressions: number; reach: number; clicks: number;
  ctr: number; cpc: number; cpm: number; frequency: number;
  conversions: number; revenue: number; roas: number; cpa: number;
};

@Injectable()
export class MetaAdsService {
  private readonly logger = new Logger(MetaAdsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private assertConfigured(accountIdOverride?: string) {
    const token = getMetaAdsAccessToken();
    const accountId = accountIdOverride
      ? (accountIdOverride.startsWith('act_') ? accountIdOverride : `act_${accountIdOverride.replace(/[^\d]/g, '')}`)
      : getMetaAdAccountId();

    if (!token) {
      throw new HttpException({ error: 'META_ADS_ACCESS_TOKEN não configurado', code: 'META_TOKEN_MISSING' }, HttpStatus.PRECONDITION_REQUIRED);
    }
    if (!accountId) {
      throw new HttpException({ error: 'META_AD_ACCOUNT_ID não configurado', code: 'META_ACCOUNT_MISSING' }, HttpStatus.PRECONDITION_REQUIRED);
    }
    return { token, accountId };
  }

  private async graphGet(path: string, token: string, params: Record<string, any> = {}) {
    const query = new URLSearchParams({ ...params, access_token: token });
    try {
      const response = await fetchWithTimeout(`${GRAPH_URL}/${path.replace(/^\/+/, '')}?${query.toString()}`, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) {
        const metaError = data?.error;
        this.logger.warn(`Meta Marketing API falhou (${path}): ${metaError?.message || response.statusText}`);
        throw new HttpException(
          { error: metaError?.message || response.statusText, code: metaError?.code || 'META_API_ERROR', type: metaError?.type },
          response.status || HttpStatus.BAD_GATEWAY,
        );
      }
      return data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.warn(`Falha de rede ao chamar Meta Marketing API (${path}): ${error instanceof Error ? error.message : error}`);
      throw new HttpException({ error: 'Falha ao conectar com a Meta Marketing API', code: 'META_NETWORK_ERROR' }, HttpStatus.BAD_GATEWAY);
    }
  }

  getConfig() {
    const token = getMetaAdsAccessToken();
    const accountId = getMetaAdAccountId();
    return {
      configured: Boolean(token && accountId),
      hasToken: Boolean(token),
      tokenPreview: maskToken(token),
      accountId: accountId || null,
      graphVersion: GRAPH_VERSION,
    };
  }

  async testConnection(accountIdOverride?: string) {
    const { token, accountId } = this.assertConfigured(accountIdOverride);
    const data = await this.graphGet(accountId, token, { fields: 'id,name,account_status,currency,timezone_name,business_name' });
    return { ok: true, account: data, graphVersion: GRAPH_VERSION, fetchedAt: new Date().toISOString() };
  }

  private pickCreativeImage(creative: any) {
    return (
      creative?.image_url
      || creative?.thumbnail_url
      || creative?.object_story_spec?.link_data?.picture
      || creative?.object_story_spec?.video_data?.image_url
      || creative?.asset_feed_spec?.images?.[0]?.url
      || creative?.asset_feed_spec?.images?.[0]?.thumbnail_url
      || ''
    );
  }

  private async getCampaignCreativeMap(accountId: string, token: string, campaignIds: string[]) {
    const ids = campaignIds.filter(Boolean).slice(0, 100);
    if (!ids.length) return {} as Record<string, any>;

    try {
      const data = await this.graphGet(`${accountId}/ads`, token, {
        fields: 'id,name,effective_status,campaign{id},creative{id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec,effective_object_story_id}',
        filtering: JSON.stringify([{ field: 'campaign.id', operator: 'IN', value: ids }]),
        limit: 200,
      });

      return (Array.isArray(data?.data) ? data.data : []).reduce((acc: Record<string, any>, ad: any) => {
        const campaignId = ad?.campaign?.id;
        if (!campaignId || acc[campaignId]) return acc;
        const creative = ad?.creative || {};
        acc[campaignId] = {
          adPreview: { id: ad.id, name: ad.name, status: ad.effective_status },
          creative: { ...creative, image_url: this.pickCreativeImage(creative) },
        };
        return acc;
      }, {});
    } catch (error) {
      this.logger.warn(`Não foi possível buscar miniaturas dos criativos Meta: ${error instanceof Error ? error.message : error}`);
      return {};
    }
  }

  async getCampaigns(query: any) {
    const { token, accountId } = this.assertConfigured(query?.accountId);
    const period = safePeriod(query?.period);
    const status = safeStatus(query?.status);
    const limit = numberParam(query?.limit, 50, 200);
    const nameFilter = String(query?.q || '').trim().toLowerCase();
    const effectiveStatus = status === 'ALL' ? ['ACTIVE', 'PAUSED', 'ARCHIVED', 'WITH_ISSUES'] : [status];

    const insightFields = ['spend', 'impressions', 'clicks', 'cpc', 'cpm', 'ctr', 'reach', 'purchase_roas', 'actions', 'action_values', 'frequency', 'date_start', 'date_stop'].join(',');
    const fields = [
      'id', 'name', 'status', 'effective_status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time',
      `insights.date_preset(${period}){${insightFields}}`,
    ].join(',');

    const data = await this.graphGet(`${accountId}/campaigns`, token, {
      fields,
      effective_status: JSON.stringify(effectiveStatus),
      limit,
    });

    const allCampaigns = Array.isArray(data?.data) ? data.data : [];
    const campaigns = nameFilter
      ? allCampaigns.filter((campaign: any) => String(campaign.name || '').toLowerCase().includes(nameFilter))
      : allCampaigns;
    const creativeMap = await this.getCampaignCreativeMap(accountId, token, campaigns.map((campaign: any) => campaign.id));

    return {
      data: campaigns.map((campaign: any) => ({ ...campaign, ...(creativeMap[campaign.id] || {}) })),
      paging: data?.paging || null,
      meta: {
        accountId, period, status, graphVersion: GRAPH_VERSION, fetchedAt: new Date().toISOString(),
        totalBeforeFilter: allCampaigns.length,
        q: nameFilter || null,
      },
    };
  }

  async getAudiences(query: any) {
    const { token, accountId } = this.assertConfigured(query?.accountId);
    const limit = numberParam(query?.limit, 50, 200);
    const data = await this.graphGet(`${accountId}/customaudiences`, token, {
      fields: 'id,name,subtype,approximate_count,delivery_status,operation_status,lookalike_spec,time_created,time_updated',
      limit,
    });

    return {
      data: (data?.data || []).map((audience: any) => ({
        id: audience.id,
        name: audience.name,
        type: audience.lookalike_spec ? 'LOOKALIKE' : 'CUSTOM',
        subtype: audience.subtype || (audience.lookalike_spec ? 'LOOKALIKE' : 'CUSTOM'),
        size: audience.approximate_count ? String(audience.approximate_count) : 'Indisponível',
        status: audience.delivery_status?.code || audience.operation_status?.code || 'unknown',
      })),
      paging: data?.paging || null,
      meta: { accountId, graphVersion: GRAPH_VERSION, fetchedAt: new Date().toISOString() },
    };
  }

  private summarizeTargeting(targeting: any) {
    if (!targeting) return null;

    const genderMap: Record<number, string> = { 1: 'Homens', 2: 'Mulheres' };
    const genders = Array.isArray(targeting.genders) && targeting.genders.length
      ? targeting.genders.map((code: number) => genderMap[code] || String(code)).join(', ')
      : 'Todos';

    const locations = [
      ...(targeting.geo_locations?.countries || []),
      ...(targeting.geo_locations?.regions || []).map((item: any) => item.name),
      ...(targeting.geo_locations?.cities || []).map((item: any) => item.name),
    ].filter(Boolean);

    const customAudiences = (targeting.custom_audiences || []).map((item: any) => item.name || item.id);
    const excludedAudiences = (targeting.excluded_custom_audiences || []).map((item: any) => item.name || item.id);
    const interests = (targeting.flexible_spec || [])
      .flatMap((spec: any) => [...(spec.interests || []), ...(spec.behaviors || [])])
      .map((item: any) => item.name || item.id);

    return {
      ageMin: targeting.age_min ?? null,
      ageMax: targeting.age_max ?? null,
      genders,
      locations,
      customAudiences,
      excludedAudiences,
      interests,
    };
  }

  private async getAdSetCreatives(accountId: string, token: string, adsetIds: string[]) {
    const ids = adsetIds.filter(Boolean).slice(0, 100);
    if (!ids.length) return {} as Record<string, any[]>;

    try {
      const data = await this.graphGet(`${accountId}/ads`, token, {
        fields: 'id,name,effective_status,adset{id},creative{id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec}',
        filtering: JSON.stringify([{ field: 'adset.id', operator: 'IN', value: ids }]),
        limit: 200,
      });

      return (Array.isArray(data?.data) ? data.data : []).reduce((acc: Record<string, any[]>, ad: any) => {
        const adsetId = ad?.adset?.id;
        if (!adsetId) return acc;
        const creative = ad?.creative || {};
        acc[adsetId] = acc[adsetId] || [];
        acc[adsetId].push({
          adId: ad.id,
          adName: ad.name,
          status: ad.effective_status,
          title: creative.title || creative.name || '',
          body: creative.body || '',
          imageUrl: this.pickCreativeImage(creative),
        });
        return acc;
      }, {});
    } catch (error) {
      this.logger.warn(`Não foi possível buscar criativos por conjunto de anúncios: ${error instanceof Error ? error.message : error}`);
      return {};
    }
  }

  async getAdSets(campaignId: string, query: any) {
    if (!campaignId) {
      throw new HttpException({ error: 'campaignId é obrigatório', code: 'CAMPAIGN_ID_MISSING' }, HttpStatus.BAD_REQUEST);
    }
    const { token, accountId } = this.assertConfigured(query?.accountId);
    const period = safePeriod(query?.period);

    const insightFields = ['spend', 'impressions', 'clicks', 'cpc', 'ctr'].join(',');
    const fields = [
      'id', 'name', 'status', 'effective_status', 'optimization_goal', 'daily_budget', 'lifetime_budget',
      'targeting',
      `insights.date_preset(${period}){${insightFields}}`,
    ].join(',');

    const data = await this.graphGet(`${campaignId}/adsets`, token, { fields, limit: 100 });
    const adsets = Array.isArray(data?.data) ? data.data : [];
    const creativesByAdset = await this.getAdSetCreatives(accountId, token, adsets.map((adset: any) => adset.id));

    return {
      data: adsets.map((adset: any) => {
        const insight = adset?.insights?.data?.[0] || {};
        return {
          id: adset.id,
          name: adset.name,
          status: adset.effective_status || adset.status,
          optimizationGoal: adset.optimization_goal,
          spend: Number(insight.spend || 0),
          impressions: Number(insight.impressions || 0),
          clicks: Number(insight.clicks || 0),
          ctr: Number(insight.ctr || 0),
          cpc: Number(insight.cpc || 0),
          targeting: this.summarizeTargeting(adset.targeting),
          creatives: creativesByAdset[adset.id] || [],
        };
      }),
      meta: { campaignId, accountId, period, graphVersion: GRAPH_VERSION, fetchedAt: new Date().toISOString() },
    };
  }

  private getActionValue(insights: any, actionType: string) {
    return Number(insights?.actions?.find((item: any) => item.action_type === actionType)?.value || 0);
  }

  private getRevenue(insights: any) {
    return Number(insights?.action_values?.find((item: any) => item.action_type === 'purchase')?.value || 0);
  }

  private getRoas(insights: any) {
    const direct = Number(insights?.purchase_roas?.[0]?.value || 0);
    if (direct > 0) return direct;
    const spend = Number(insights?.spend || 0);
    const revenue = this.getRevenue(insights);
    return spend > 0 && revenue > 0 ? revenue / spend : 0;
  }

  private campaignMetric(campaign: any): CampaignMetric {
    const insights = campaign?.insights?.data?.[0] || {};
    const spend = Number(insights.spend || 0);
    const clicks = Number(insights.clicks || 0);
    const impressions = Number(insights.impressions || 0);
    const reach = Number(insights.reach || 0);
    const conversions = this.getActionValue(insights, 'purchase');
    const revenue = this.getRevenue(insights);
    const roas = this.getRoas(insights);

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.effective_status || campaign.status,
      objective: campaign.objective,
      spend, impressions, reach, clicks,
      ctr: Number(insights.ctr || 0),
      cpc: Number(insights.cpc || 0),
      cpm: Number(insights.cpm || 0),
      frequency: Number(insights.frequency || 0),
      conversions, revenue, roas,
      cpa: conversions > 0 ? spend / conversions : 0,
    };
  }

  private buildRulesAdvisor(campaigns: any[], meta: any) {
    const items = campaigns.map((campaign) => this.campaignMetric(campaign));
    const active = items.filter((item) => item.status === 'ACTIVE');
    const totals = items.reduce(
      (acc, item) => {
        acc.spend += item.spend;
        acc.clicks += item.clicks;
        acc.impressions += item.impressions;
        acc.conversions += item.conversions;
        acc.revenue += item.revenue;
        return acc;
      },
      { spend: 0, clicks: 0, impressions: 0, conversions: 0, revenue: 0 },
    );

    const summary = {
      period: meta?.period || 'last_7d',
      totalCampaigns: items.length,
      activeCampaigns: active.length,
      spend: Number(totals.spend.toFixed(2)),
      clicks: totals.clicks,
      impressions: totals.impressions,
      conversions: totals.conversions,
      revenue: Number(totals.revenue.toFixed(2)),
      ctr: totals.impressions > 0 ? Number(((totals.clicks / totals.impressions) * 100).toFixed(2)) : 0,
      cpc: totals.clicks > 0 ? Number((totals.spend / totals.clicks).toFixed(2)) : 0,
      roas: totals.spend > 0 ? Number((totals.revenue / totals.spend).toFixed(2)) : 0,
    };

    const priorities: any[] = [];

    if (summary.spend < 30) {
      priorities.push({
        title: 'Coletar mais dados antes de decisões agressivas',
        reason: 'O investimento do período ainda é baixo para conclusões estatísticas fortes.',
        action: 'Mantenha as campanhas principais rodando até ter volume mínimo de cliques e eventos.',
        impact: 'Evita pausar anúncios promissores cedo demais.',
        urgency: 'media',
      });
    }

    const noConversion = active.filter((item) => item.spend >= 20 && item.conversions === 0);
    if (noConversion.length) {
      priorities.push({
        title: 'Investigar campanhas com gasto e zero conversões',
        reason: `${noConversion.length} campanha(s) ativa(s) já gastaram sem registrar compra.`,
        action: 'Revise o evento de conversão (Purchase via Kiwify), a página de vendas e o checkout antes de aumentar orçamento.',
        impact: 'Protege o caixa e reduz desperdício de mídia.',
        urgency: 'alta',
      });
    }

    const lowCtr = active.filter((item) => item.impressions >= 1000 && item.ctr < 1);
    if (lowCtr.length) {
      priorities.push({
        title: 'Melhorar criativos com CTR baixo',
        reason: `${lowCtr.length} campanha(s) estão abaixo de 1% de CTR.`,
        action: 'Teste hooks mais diretos: dor de quem já tentou de tudo, depoimento real, pergunta de qualificação.',
        impact: 'Pode reduzir CPC e aumentar entrada de tráfego qualificado.',
        urgency: 'alta',
      });
    }

    const fatigue = active.filter((item) => item.frequency >= 3.5);
    if (fatigue.length) {
      priorities.push({
        title: 'Checar fadiga de público',
        reason: `${fatigue.length} campanha(s) com frequência acima de 3.5.`,
        action: 'Renove os criativos, amplie o público ou crie uma variação de mensagem para evitar saturação.',
        impact: 'Ajuda a segurar CTR e CPM.',
        urgency: 'media',
      });
    }

    const best = [...active].filter((item) => item.spend > 0).sort((a, b) => (b.roas || b.ctr) - (a.roas || a.ctr))[0];
    if (best) {
      priorities.push({
        title: `Escalar com cautela: ${best.name}`,
        reason: best.roas > 0 ? `Melhor ROAS do período: ${best.roas.toFixed(2)}x.` : 'Melhor combinação de CTR/CPC entre campanhas ativas.',
        action: 'Aumente o orçamento em 15% a 25% e acompanhe CPA/CTR nas próximas 24h.',
        impact: 'Escala o que já está mostrando sinal positivo sem desorganizar o aprendizado.',
        urgency: 'media',
      });
    }

    const campaignActions = active.map((item) => {
      const notes: string[] = [];
      if (item.spend >= 20 && item.conversions === 0) notes.push('revisar conversão/oferta antes de escalar');
      if (item.ctr < 1 && item.impressions >= 1000) notes.push('trocar hook criativo');
      if (item.cpc > 2.5) notes.push('testar público/posicionamento para reduzir CPC');
      if (item.frequency >= 3.5) notes.push('renovar criativo por fadiga');
      if (item.roas >= 2) notes.push('candidata a aumento gradual de verba');
      return {
        campaignId: item.id,
        campaignName: item.name,
        status: item.status,
        spend: item.spend,
        ctr: item.ctr,
        cpc: item.cpc,
        roas: item.roas,
        recommendation: notes.length ? notes.join('; ') : 'manter monitoramento e acumular mais dados',
      };
    });

    const experiments = [
      {
        title: 'Criativo de dor concreta',
        hypothesis: 'Quem já tentou várias abordagens responde melhor a uma dor específica do que a uma promessa genérica.',
        setup: 'Criar 2 anúncios com "antes vs. depois": performar recuperação sozinho vs. ter um espaço que acompanha sem exigir.',
        successMetric: 'CTR acima de 1,5% e CPC abaixo da média atual.',
      },
      {
        title: 'Depoimento real com urgência limpa',
        hypothesis: 'Prova social específica (leitor real) aumenta conversão mais que anúncio 100% institucional.',
        setup: 'Testar um anúncio só com depoimento em vídeo + CTA direto pro checkout.',
        successMetric: 'CPA menor que a campanha atual vencedora.',
      },
    ];

    return {
      provider: 'rules' as const,
      generatedAt: new Date().toISOString(),
      summary,
      priorities,
      campaignActions,
      experiments,
      nextQuestions: [
        'Qual é o CPA máximo aceitável pra esse produto?',
        'Qual evento está sendo otimizado: Purchase, InitiateCheckout ou clique?',
        'Existe criativo novo pronto pra testar essa semana?',
      ],
    };
  }

  private async buildAiAdvisor(base: ReturnType<MetaAdsService['buildRulesAdvisor']>) {
    const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!openaiKey && !geminiKey) return base;

    const payload = {
      summary: base.summary,
      campaigns: base.campaignActions.slice(0, 20),
      rulePriorities: base.priorities,
    };

    const prompt = `Você é uma assistente sênior de tráfego pago para "O Poder dos Desacreditados", um livro digital sobre presença emocional vendido via Kiwify (não é um app com instalação — é uma compra direta de e-book/experiência de leitura).
Analise os dados de Meta Ads abaixo e responda APENAS em JSON válido. Seja prática, conservadora com verba e orientada a ação. Não invente dados ausentes.

Formato:
{
  "summary": { "diagnosis": "...", "mainRisk": "...", "bestOpportunity": "..." },
  "priorities": [{ "title": "...", "reason": "...", "action": "...", "impact": "...", "urgency": "alta|media|baixa" }],
  "campaignActions": [{ "campaignName": "...", "recommendation": "...", "budgetAction": "manter|aumentar|reduzir|pausar|testar", "why": "..." }],
  "experiments": [{ "title": "...", "hypothesis": "...", "setup": "...", "successMetric": "..." }],
  "nextQuestions": ["..."]
}

Dados:
${JSON.stringify(payload)}`;

    if (openaiKey) {
      const aiResult = await this.callOpenAiAdvisor(openaiKey, prompt);
      if (aiResult) return { ...base, provider: 'openai' as const, aiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini', ai: aiResult };
    }
    if (geminiKey) {
      const aiResult = await this.callGeminiAdvisor(geminiKey, prompt);
      if (aiResult) return { ...base, provider: 'gemini' as const, aiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash', ai: aiResult };
    }
    return base;
  }

  private async callOpenAiAdvisor(apiKey: string, prompt: string) {
    try {
      const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.25,
          response_format: { type: 'json_object' },
          messages: [{ role: 'system', content: prompt }],
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      this.logger.warn(`Assistente Meta Ads (OpenAI) caiu para regras: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  private async callGeminiAdvisor(apiKey: string, prompt: string) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.25, responseMimeType: 'application/json' },
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      this.logger.warn(`Assistente Meta Ads (Gemini) caiu para regras: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  async getAdvisor(query: any) {
    const campaigns = await this.getCampaigns(query);
    const base = this.buildRulesAdvisor(campaigns.data || [], campaigns.meta);
    return this.buildAiAdvisor(base);
  }

  /**
   * Compara o que a Meta reporta como "Purchase" (atribuição própria dela, sujeita a
   * janela de atribuição/perda de sinal) com as vendas que a Kiwify de fato confirmou
   * via webhook no mesmo período — isso dá o ROAS real de investimento, não o auto-relatado.
   */
  async getReconciliation(query: any) {
    const period = safePeriod(query?.period);
    const campaignsResponse = await this.getCampaigns({ ...query, status: 'ALL', limit: 200 });
    const campaigns = campaignsResponse.data || [];

    const firstDatedInsight = campaigns
      .map((campaign: any) => campaign?.insights?.data?.[0])
      .find((insight: any) => insight?.date_start && insight?.date_stop);

    const fallbackRange = resolvePeriodRange(period);
    const dateStart = firstDatedInsight?.date_start || toDateOnly(fallbackRange.since);
    const dateStop = firstDatedInsight?.date_stop || toDateOnly(fallbackRange.until);

    const since = new Date(`${dateStart}T00:00:00`);
    const until = new Date(`${dateStop}T23:59:59.999`);

    const metaTotals = campaigns.reduce(
      (acc: { purchases: number; revenue: number; spend: number }, campaign: any) => {
        const insight = campaign?.insights?.data?.[0] || {};
        acc.purchases += this.getActionValue(insight, 'purchase');
        acc.revenue += this.getRevenue(insight);
        acc.spend += Number(insight.spend || 0);
        return acc;
      },
      { purchases: 0, revenue: 0, spend: 0 },
    );

    const events = await this.prisma.purchaseEvent.findMany({
      where: {
        provider: 'KIWIFY',
        eventType: { in: ['ACCESS_GRANTED', 'RENEWAL_GRANTED', 'INVITE_CREATED'] },
        createdAt: { gte: since, lte: until },
      },
      select: { payload: true },
    });

    let kiwifyPurchases = 0;
    let kiwifyRevenue = 0;
    let missingValueCount = 0;
    for (const event of events) {
      kiwifyPurchases += 1;
      const value = Number((event.payload as any)?.value);
      if (Number.isFinite(value) && value > 0) {
        kiwifyRevenue += value;
      } else {
        missingValueCount += 1;
      }
    }

    const spend = Number(metaTotals.spend.toFixed(2));
    const metaRevenue = Number(metaTotals.revenue.toFixed(2));
    const metaPurchases = Number(metaTotals.purchases.toFixed(2));
    kiwifyRevenue = Number(kiwifyRevenue.toFixed(2));

    return {
      period,
      since: dateStart,
      until: dateStop,
      spend,
      meta: {
        purchases: metaPurchases,
        revenue: metaRevenue,
        roas: spend > 0 && metaRevenue > 0 ? Number((metaRevenue / spend).toFixed(2)) : 0,
      },
      kiwify: {
        purchases: kiwifyPurchases,
        revenue: kiwifyRevenue,
        roas: spend > 0 && kiwifyRevenue > 0 ? Number((kiwifyRevenue / spend).toFixed(2)) : 0,
        missingValueCount,
      },
      delta: {
        purchases: Number((kiwifyPurchases - metaPurchases).toFixed(2)),
        revenue: Number((kiwifyRevenue - metaRevenue).toFixed(2)),
      },
    };
  }
}
