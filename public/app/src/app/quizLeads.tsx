import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Download, MessageCircle, NotebookPen, RefreshCw, Search, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import {
  deleteQuizLead,
  deleteQuizLeadsByContact,
  downloadQuizLeadsCsv,
  fetchQuizLeads,
  fetchQuizLeadsResumo,
  updateQuizLead,
  type QuizLead,
  type QuizLeadFilters,
  type QuizLeadGroup,
  type QuizLeadStatus,
  type QuizLeadsResumo,
} from '../services/auth';

const PILARES: Record<string, string> = {
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

const STATUS_LABELS: Record<QuizLeadStatus, string> = {
  novo: 'Novo',
  carta_enviada: 'Carta enviada',
  em_conversa: 'Em conversa',
  comprou: 'Comprou',
  descadastrado: 'Descadastrado',
};

const STATUS_TONE: Record<QuizLeadStatus, string> = {
  novo: '',
  carta_enviada: 'info',
  em_conversa: 'info',
  comprou: 'success',
  descadastrado: 'muted',
};

const PAGE_SIZE = 50;

function pilarNome(lead: QuizLead) {
  return lead.pilarNome || PILARES[lead.pilarResultado] || lead.pilarResultado;
}

function formatWhatsapp(digits: string) {
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
}

function formatDateTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function origemLabel(lead: QuizLead) {
  if (!lead.utmSource && !lead.utmCampaign) return 'direto';
  return [lead.utmSource, lead.utmCampaign].filter(Boolean).join(' / ');
}

function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] || nome;
}

function mensagemCarta(lead: QuizLead) {
  return [
    `Oi, ${primeiroNome(lead.nome)}. Aqui é o Diego, autor de O Poder dos Desacreditados.`,
    '',
    `Seu dilema é o do ${pilarNome(lead)}. Como prometido, aqui está a Carta de Sustentação dele: ${lead.cartaUrl || ''}`,
    '',
    'Uma sugestão: leia num momento em que você possa parar depois. Ela funciona melhor assim.',
    '',
    'Se quiser, me responde aqui com uma palavra sobre o que sentiu. Eu leio.',
  ].join('\n');
}

function whatsappLink(lead: QuizLead) {
  return `https://wa.me/55${lead.whatsapp}?text=${encodeURIComponent(mensagemCarta(lead))}`;
}

function percent(value: number) {
  return `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

export function QuizLeadsPanel() {
  const [draft, setDraft] = useState<QuizLeadFilters>({});
  const [filters, setFilters] = useState<QuizLeadFilters>({});
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<QuizLeadGroup[]>([]);
  const [totalGrupos, setTotalGrupos] = useState(0);
  const [resumo, setResumo] = useState<QuizLeadsResumo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [lgpdContact, setLgpdContact] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const [list, summary] = await Promise.all([fetchQuizLeads({ ...filters, page }), fetchQuizLeadsResumo(filters)]);
      setGroups(list.items);
      setTotalGrupos(list.totalGrupos);
      setResumo(summary);
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível carregar os leads.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (event?: React.FormEvent) => {
    event?.preventDefault();
    setPage(1);
    setFilters({ ...draft });
  };

  const clearFilters = () => {
    setDraft({});
    setPage(1);
    setFilters({});
  };

  const replaceLead = (updated: QuizLead) => {
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        lead: group.lead.id === updated.id ? { ...group.lead, ...updated } : group.lead,
        anteriores: group.anteriores.map((lead) => (lead.id === updated.id ? { ...lead, ...updated } : lead)),
      })),
    );
  };

  const patchLead = async (lead: QuizLead, input: Parameters<typeof updateQuizLead>[1]) => {
    try {
      replaceLead(await updateQuizLead(lead.id, input));
      return true;
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível salvar.');
      return false;
    }
  };

  const enviarCarta = (lead: QuizLead) => {
    if (!lead.cartaUrl && !window.confirm('Este pilar ainda não tem link de carta configurado (CARTAS_URLS). Abrir o WhatsApp mesmo assim?')) return;
    // Abre antes de qualquer await para o navegador não bloquear a nova aba.
    window.open(whatsappLink(lead), '_blank', 'noopener');
    void patchLead(lead, { status: lead.status === 'novo' ? 'carta_enviada' : undefined, cartaEnviada: true });
  };

  const salvarObservacao = async (lead: QuizLead) => {
    const observacao = notes[lead.id] ?? lead.observacao ?? '';
    if (await patchLead(lead, { observacao })) setMessage(`Observação de ${primeiroNome(lead.nome)} salva.`);
  };

  const excluir = async (lead: QuizLead) => {
    if (!window.confirm(`Excluir de vez o registro de ${lead.nome} (${formatWhatsapp(lead.whatsapp)}) de ${formatDateTime(lead.createdAt)}? Não dá para desfazer.`)) return;
    try {
      await deleteQuizLead(lead.id);
      setMessage('Registro excluído.');
      await load();
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível excluir.');
    }
  };

  const excluirPorContato = async (event: React.FormEvent) => {
    event.preventDefault();
    const contato = lgpdContact.trim();
    if (!contato) return;
    const input = contato.includes('@') ? { email: contato } : { whatsapp: contato };
    if (!window.confirm(`Apagar TODOS os registros de ${contato}? Não dá para desfazer.`)) return;
    try {
      const result = await deleteQuizLeadsByContact(input);
      setMessage(`${result.removidos} registro(s) de ${contato} excluído(s).`);
      setLgpdContact('');
      await load();
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível excluir.');
    }
  };

  const exportar = async () => {
    try {
      await downloadQuizLeadsCsv(filters);
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível exportar.');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalGrupos / PAGE_SIZE));
  const maxPilar = Math.max(1, ...(resumo?.porPilar.map((row) => row.total) ?? [0]));

  const renderActions = (lead: QuizLead) => (
    <div className="quiz-leads-actions">
      <button type="button" className="quiz-leads-wa" onClick={() => enviarCarta(lead)} title="Abre o WhatsApp com a mensagem de entrega e marca a carta como enviada">
        <MessageCircle size={15} />
        <span>Enviar carta</span>
      </button>
      <button type="button" onClick={() => setExpanded((current) => ({ ...current, [lead.id]: !current[lead.id] }))} title="Observação e detalhes">
        <NotebookPen size={15} />
      </button>
      <button type="button" className="danger" onClick={() => void excluir(lead)} title="Excluir (LGPD)">
        <Trash2 size={15} />
      </button>
    </div>
  );

  const renderDetails = (lead: QuizLead) => (
    <div className="quiz-leads-details admin-panel">
      <div className="quiz-leads-detail-grid">
        <span><b>E-mail</b>{lead.email || '-'}</span>
        <span><b>Ato</b>{lead.atoNome || lead.ato}</span>
        <span><b>Prólogo</b>{lead.prologo || '-'}</span>
        <span><b>Pontuações</b>{Array.isArray(lead.pontuacoes) ? lead.pontuacoes.join(' · ') : '-'}</span>
        <span><b>Carta enviada</b>{formatDateTime(lead.cartaEnviadaEm)}</span>
        <span><b>Comprou em</b>{formatDateTime(lead.compradorEm)}</span>
        <span><b>UTM</b>{[lead.utmSource, lead.utmMedium, lead.utmCampaign, lead.utmContent].filter(Boolean).join(' / ') || 'direto'}</span>
        <span><b>Carta</b>{lead.cartaUrl ? <a href={lead.cartaUrl} target="_blank" rel="noreferrer">abrir link</a> : 'sem link configurado'}</span>
      </div>
      <label>
        <span>Observação</span>
        <textarea
          rows={3}
          value={notes[lead.id] ?? lead.observacao ?? ''}
          onChange={(event) => setNotes((current) => ({ ...current, [lead.id]: event.target.value }))}
        />
      </label>
      <Button variant="ghost" onClick={() => void salvarObservacao(lead)}>Salvar observação</Button>
    </div>
  );

  const renderRow = (lead: QuizLead, group: QuizLeadGroup | null) => (
    <React.Fragment key={lead.id}>
      <article className={`quiz-leads-row${group ? '' : ' previous'}`}>
        <time>{formatDateTime(lead.createdAt)}</time>
        <div className="quiz-leads-person">
          <strong>{lead.nome}</strong>
          <small>{formatWhatsapp(lead.whatsapp)}</small>
        </div>
        <span className="quiz-leads-pilar">{pilarNome(lead)}</span>
        <small className="quiz-leads-origem">{origemLabel(lead)}</small>
        <select
          className={`quiz-leads-status ${STATUS_TONE[lead.status]}`}
          value={lead.status}
          onChange={(event) => void patchLead(lead, { status: event.target.value as QuizLeadStatus })}
          aria-label="Status do lead"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {renderActions(lead)}
        {group && group.anteriores.length > 0 ? (
          <button
            type="button"
            className="quiz-leads-expand"
            onClick={() => setExpanded((current) => ({ ...current, [`g:${group.whatsapp}`]: !current[`g:${group.whatsapp}`] }))}
          >
            <ChevronDown size={14} style={{ transform: expanded[`g:${group.whatsapp}`] ? 'rotate(180deg)' : undefined }} />
            +{group.anteriores.length} anterior{group.anteriores.length > 1 ? 'es' : ''}
          </button>
        ) : <span />}
      </article>
      {expanded[lead.id] && renderDetails(lead)}
    </React.Fragment>
  );

  return (
    <section className="quiz-leads">
      <section className="admin-events-panel">
        <div className="admin-section-head">
          <div>
            <p className="kicker">Quiz da LP</p>
            <h2>Leads do quiz</h2>
          </div>
          <div className="quiz-leads-head-actions">
            <Button variant="ghost" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={15} /> {loading ? 'Carregando…' : 'Atualizar'}
            </Button>
            <Button variant="ghost" onClick={() => void exportar()}>
              <Download size={15} /> Exportar CSV
            </Button>
          </div>
        </div>

        <form className="quiz-leads-filters admin-panel" onSubmit={applyFilters}>
          <label>
            <span>De</span>
            <input type="date" value={draft.de ?? ''} onChange={(event) => setDraft({ ...draft, de: event.target.value })} />
          </label>
          <label>
            <span>Até</span>
            <input type="date" value={draft.ate ?? ''} onChange={(event) => setDraft({ ...draft, ate: event.target.value })} />
          </label>
          <label>
            <span>Pilar</span>
            <select value={draft.pilar ?? ''} onChange={(event) => setDraft({ ...draft, pilar: event.target.value })}>
              <option value="">Todos</option>
              {Object.entries(PILARES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={draft.status ?? ''} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Origem</span>
            <select value={draft.origem ?? ''} onChange={(event) => setDraft({ ...draft, origem: event.target.value })}>
              <option value="">Todas</option>
              {(resumo?.porOrigem ?? []).map((row) => <option key={row.origem} value={row.origem}>{row.origem}</option>)}
              {draft.origem && !(resumo?.porOrigem ?? []).some((row) => row.origem === draft.origem) && (
                <option value={draft.origem}>{draft.origem}</option>
              )}
            </select>
          </label>
          <label className="quiz-leads-search">
            <span>Busca</span>
            <input
              type="search"
              placeholder="Nome, WhatsApp ou e-mail"
              value={draft.q ?? ''}
              onChange={(event) => setDraft({ ...draft, q: event.target.value })}
            />
          </label>
          <div className="quiz-leads-filter-buttons">
            <Button type="submit"><Search size={15} /> Filtrar</Button>
            <Button variant="ghost" onClick={clearFilters}>Limpar</Button>
          </div>
        </form>
      </section>

      {message && <div className="admin-message">{message}</div>}

      {resumo && (
        <section className="quiz-leads-summary">
          <div className="admin-overview-grid">
            <article className="account-card admin-stat-card">
              <p className="kicker">Leads</p>
              <strong>{resumo.total}</strong>
              <span>{resumo.pessoas} pessoa(s) diferentes no período</span>
            </article>
            <article className="account-card admin-stat-card">
              <p className="kicker">Compraram</p>
              <strong>{resumo.compraram}</strong>
              <span>Pessoas com compra aprovada na Kiwify</span>
            </article>
            <article className="account-card admin-stat-card">
              <p className="kicker">Lead → compra</p>
              <strong>{percent(resumo.taxaCompra)}</strong>
              <span>Por pessoa (WhatsApp)</span>
            </article>
            <article className="account-card admin-stat-card">
              <p className="kicker">Por ato</p>
              <div className="quiz-leads-atos">
                {resumo.porAto.map((row) => (
                  <span key={row.codigo}><b>{row.total}</b> {row.nome}</span>
                ))}
              </div>
            </article>
          </div>
          <article className="account-card quiz-leads-pilares">
            <p className="kicker">Por pilar</p>
            <div>
              {resumo.porPilar.map((row) => (
                <div key={row.codigo} className="quiz-leads-bar">
                  <span>{row.nome}</span>
                  <i style={{ width: `${(row.total / maxPilar) * 100}%` }} />
                  <b>{row.total}</b>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      <section className="admin-events-panel">
        <div className="quiz-leads-row quiz-leads-header" aria-hidden="true">
          <span>Data</span>
          <span>Nome / WhatsApp</span>
          <span>Pilar</span>
          <span>Origem</span>
          <span>Status</span>
          <span>Ações</span>
          <span />
        </div>
        <div className="quiz-leads-list">
          {groups.length === 0 ? (
            <div className="empty-state">{loading ? 'Carregando…' : 'Nenhum lead encontrado com esses filtros.'}</div>
          ) : (
            groups.map((group) => (
              <div className="quiz-leads-group" key={group.whatsapp}>
                {renderRow(group.lead, group)}
                {expanded[`g:${group.whatsapp}`] && group.anteriores.map((lead) => renderRow(lead, null))}
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="quiz-leads-pager">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <span>Página {page} de {totalPages}</span>
            <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
          </div>
        )}
      </section>

      <form className="account-card admin-panel quiz-leads-lgpd" onSubmit={excluirPorContato}>
        <label>
          <span>Pedido de exclusão (LGPD): apaga todos os registros de um WhatsApp ou e-mail</span>
          <input
            placeholder="(11) 98765-4321 ou pessoa@email.com"
            value={lgpdContact}
            onChange={(event) => setLgpdContact(event.target.value)}
          />
        </label>
        <Button type="submit" variant="ghost"><Trash2 size={15} /> Excluir tudo desse contato</Button>
      </form>
    </section>
  );
}
