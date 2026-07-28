import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, X, Copy, CheckCircle2, Edit3, Trash2, Star, Link2, Lightbulb, Search,
  ExternalLink, Target, AlertTriangle, Zap, BarChart2, Hash, Sparkles,
  FolderOpen, Calendar, Instagram, MessageCircle, Mail, Video, Cloud, Wand2,
  Layers, Eye, MousePointer, ShoppingCart, DollarSign, BookOpen, Image as ImageIcon,
  RefreshCw, Radio, TrendingUp, Percent, Users2, MonitorSmartphone,
} from 'lucide-react';
import {
  fetchMetaAdsConfig, fetchMetaAdsCampaigns, fetchMetaAdsAdvisor,
  type MetaAdsConfig, type MetaAdsCampaign, type MetaAdsAdvisorResponse,
} from '../services/auth';

const TAG_COLORS: Record<string, string> = {
  Criativo: '#b18a66',
  'Mídia paga': '#3b82f6',
  Depoimento: '#ec4899',
  Copy: '#f59e0b',
  UGC: '#f97316',
  Parceria: '#10b981',
  Outros: '#6b7280',
};
const PRIORITIES = ['Alta', 'Média', 'Baixa'] as const;
const TAGS = Object.keys(TAG_COLORS);

function useLocalStorageState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback<React.Dispatch<React.SetStateAction<T>>>((next) => {
    setValue((current) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // localStorage indisponível (modo privado etc.) — segue só em memória.
      }
      return resolved;
    });
  }, [key]);
  return [value, set];
}

/* ─── Nomenclatura Meta ──────────────────────────────────────────────────── */

const META_OBJECTIVES = ['Conversao', 'Trafego', 'Awareness', 'Retargeting', 'Alcance', 'Engajamento'];
const META_AUDIENCES = ['Frio-Amplo', 'Frio-Interesse', 'Retargeting-Checkout', 'Retargeting-Perfil', 'Lookalike-Compradores', 'Lookalike-Leitura'];
const META_PLACEMENTS = ['Feed', 'Stories', 'Reels', 'Audience-Network', 'Todos'];
const META_FORMATS = ['Video', 'Carrossel', 'Static', 'UGC', 'DynamicCreative'];

function MetaNamingPanel() {
  const [obj, setObj] = useState('Conversao');
  const [aud, setAud] = useState('Frio-Amplo');
  const [plac, setPlac] = useState('Reels');
  const [fmt, setFmt] = useState('Video');
  const [hook, setHook] = useState('');
  const [version, setVersion] = useState('v1');
  const [copied, setCopied] = useState('');

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const campaign = `OPDDS_${obj}_${today}`;
  const adset = `AS_${aud}_${plac}`;
  const ad = `AD_${fmt}_${hook ? hook.slice(0, 20).replace(/\s/g, '_').toUpperCase() : 'HOOK'}_${version}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="studio-panel-body">
      <div className="studio-field-grid">
        {[
          { label: 'Objetivo', val: obj, set: setObj, opts: META_OBJECTIVES },
          { label: 'Público', val: aud, set: setAud, opts: META_AUDIENCES },
          { label: 'Placement', val: plac, set: setPlac, opts: META_PLACEMENTS },
          { label: 'Formato', val: fmt, set: setFmt, opts: META_FORMATS },
        ].map((field) => (
          <label key={field.label}>
            <span>{field.label}</span>
            <select value={field.val} onChange={(event) => field.set(event.target.value)}>
              {field.opts.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        ))}
        <label>
          <span>Hook (resumo)</span>
          <input value={hook} onChange={(event) => setHook(event.target.value)} placeholder="ex: DorPerformar, DepoimentoReal..." />
        </label>
        <label>
          <span>Versão</span>
          <input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="v1" />
        </label>
      </div>

      <div className="studio-naming-rows">
        {[
          { label: 'Campanha', val: campaign, key: 'camp' },
          { label: 'Conjunto de anúncios', val: adset, key: 'adset' },
          { label: 'Anúncio', val: ad, key: 'ad' },
        ].map((row) => (
          <div key={row.key} className="studio-naming-row">
            <div>
              <small>{row.label}</small>
              <p>{row.val}</p>
            </div>
            <button type="button" onClick={() => copy(row.val, row.key)}>
              {copied === row.key ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            </button>
          </div>
        ))}
        <button type="button" className="studio-primary-button" onClick={() => copy(`${campaign}\n${adset}\n${ad}`, 'all')}>
          {copied === 'all' ? 'Copiado!' : 'Copiar nomenclatura completa'}
        </button>
      </div>
    </div>
  );
}

/* ─── Kanban de criativos ────────────────────────────────────────────────── */

type KanbanTask = { id: number; col: string; text: string; tag: string; priority: string };

const KANBAN_COLS = [
  { id: 'todo', label: 'A fazer', color: '#8b8880' },
  { id: 'doing', label: 'Em progresso', color: '#b18a66' },
  { id: 'review', label: 'Revisão', color: '#f59e0b' },
  { id: 'done', label: 'Concluído', color: '#75b798' },
];

const INIT_TASKS: KanbanTask[] = [
  { id: 1, col: 'todo', text: 'Gravar depoimento em vídeo de um leitor real', tag: 'UGC', priority: 'Alta' },
  { id: 2, col: 'todo', text: 'Configurar campanha Meta Ads — Aquisição fria', tag: 'Mídia paga', priority: 'Alta' },
  { id: 3, col: 'doing', text: 'Escrever copy de retargeting pra quem abandonou o checkout', tag: 'Copy', priority: 'Alta' },
  { id: 4, col: 'review', text: 'Revisar carrossel "3 sinais de que você está performando recuperação"', tag: 'Criativo', priority: 'Média' },
  { id: 5, col: 'done', text: 'Publicar prévia em áudio do manifesto', tag: 'Criativo', priority: 'Alta' },
];

function CreativeKanban() {
  const [tasks, setTasks] = useLocalStorageState<KanbanTask[]>('opdds_studio_kanban', INIT_TASKS);
  const [newText, setNewText] = useState('');
  const [newTag, setNewTag] = useState('Criativo');
  const [newPrio, setNewPrio] = useState('Média');
  const [newCol, setNewCol] = useState('todo');
  const [adding, setAdding] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const addTask = () => {
    if (!newText.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now(), col: newCol, text: newText.trim(), tag: newTag, priority: newPrio }]);
    setNewText('');
    setAdding(false);
  };

  const moveTask = (id: number, col: string) => setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, col } : task)));
  const deleteTask = (id: number) => setTasks((prev) => prev.filter((task) => task.id !== id));
  const totalByCol = (col: string) => tasks.filter((task) => task.col === col).length;

  return (
    <div className="studio-panel-body">
      {!adding ? (
        <button type="button" className="studio-primary-button studio-inline-button" onClick={() => setAdding(true)}>
          <Plus size={14} /> Nova tarefa
        </button>
      ) : (
        <div className="studio-add-card">
          <textarea value={newText} onChange={(event) => setNewText(event.target.value)} placeholder="Descreva a tarefa..." />
          <div className="studio-add-card-row">
            <select value={newCol} onChange={(event) => setNewCol(event.target.value)}>
              {KANBAN_COLS.map((col) => <option key={col.id} value={col.id}>{col.label}</option>)}
            </select>
            <select value={newTag} onChange={(event) => setNewTag(event.target.value)}>
              {TAGS.map((tag) => <option key={tag}>{tag}</option>)}
            </select>
            <select value={newPrio} onChange={(event) => setNewPrio(event.target.value)}>
              {PRIORITIES.map((prio) => <option key={prio}>{prio}</option>)}
            </select>
            <button type="button" className="studio-primary-button" onClick={addTask}>Adicionar</button>
            <button type="button" className="studio-ghost-button" onClick={() => setAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="studio-kanban-board">
        {KANBAN_COLS.map((col) => (
          <div
            key={col.id}
            className={`studio-kanban-col ${dragOver === col.id ? 'is-over' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragOver(col.id); }}
            onDrop={(event) => { event.preventDefault(); if (dragging !== null) moveTask(dragging, col.id); setDragging(null); setDragOver(null); }}
          >
            <div className="studio-kanban-col-head">
              <span className="studio-dot" style={{ backgroundColor: col.color }} />
              <p>{col.label}</p>
              <small>{totalByCol(col.id)}</small>
            </div>
            <div className="studio-kanban-col-body">
              {tasks.filter((task) => task.col === col.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(event) => { setDragging(task.id); event.dataTransfer.effectAllowed = 'move'; }}
                  className="studio-kanban-card"
                >
                  <p>{task.text}</p>
                  <div className="studio-kanban-card-foot">
                    <div className="studio-kanban-tags">
                      <span style={{ backgroundColor: TAG_COLORS[task.tag] || '#6b7280' }}>{task.tag}</span>
                      <span className={`studio-priority studio-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                    <div className="studio-kanban-actions">
                      {KANBAN_COLS.filter((other) => other.id !== col.id).map((other) => (
                        <button key={other.id} type="button" title={`Mover para ${other.label}`} style={{ backgroundColor: other.color }} onClick={() => moveTask(task.id, other.id)}>
                          {other.label[0]}
                        </button>
                      ))}
                      <button type="button" className="studio-kanban-delete" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Editor de copy (documentos estruturados) ──────────────────────────── */

type CopyDoc = { name: string; fields: Record<string, string>; drive: string; updatedAt: string };

const COPY_FIELDS = [
  { id: 'hook', label: 'Hook', placeholder: 'Os primeiros 3 segundos que param o scroll...' },
  { id: 'headline', label: 'Headline', placeholder: 'Título principal do anúncio...' },
  { id: 'body', label: 'Corpo do texto', placeholder: 'Texto principal do anúncio ou legenda...' },
  { id: 'cta', label: 'CTA', placeholder: 'Chamada para ação...' },
  { id: 'script', label: 'Roteiro', placeholder: 'Roteiro completo do vídeo...' },
  { id: 'email', label: 'E-mail', placeholder: 'Assunto + corpo do e-mail...' },
];

function CopyDocsEditor() {
  const [docs, setDocs] = useLocalStorageState<Record<string, CopyDoc>>('opdds_studio_copies', {});
  const [active, setActive] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState(false);

  const docIds = Object.keys(docs);
  const currentDoc = active ? docs[active] : null;

  const createDoc = () => {
    if (!newName.trim()) return;
    const id = `doc_${Date.now()}`;
    setDocs((prev) => ({ ...prev, [id]: { name: newName.trim(), fields: {}, drive: '', updatedAt: new Date().toISOString() } }));
    setActive(id);
    setNewName('');
    setCreating(false);
  };

  const updateField = (docId: string, fieldId: string, value: string) => {
    setDocs((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], fields: { ...prev[docId].fields, [fieldId]: value }, updatedAt: new Date().toISOString() },
    }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const updateDrive = (docId: string, value: string) => setDocs((prev) => ({ ...prev, [docId]: { ...prev[docId], drive: value } }));
  const deleteDoc = (id: string) => {
    setDocs((prev) => { const next = { ...prev }; delete next[id]; return next; });
    if (active === id) setActive(null);
  };

  return (
    <div className="studio-editor-layout">
      <div className="studio-editor-sidebar">
        {!creating ? (
          <button type="button" className="studio-primary-button studio-inline-button" onClick={() => setCreating(true)}>
            <Plus size={13} /> Novo copy
          </button>
        ) : (
          <div className="studio-editor-new">
            <input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && createDoc()}
              placeholder="Nome do copy..."
            />
            <div className="studio-editor-new-row">
              <button type="button" className="studio-primary-button" onClick={createDoc}>Criar</button>
              <button type="button" className="studio-ghost-button" onClick={() => setCreating(false)}><X size={12} /></button>
            </div>
          </div>
        )}
        {docIds.map((id) => (
          <div key={id} className={`studio-editor-doc ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
            <Edit3 size={12} />
            <span>{docs[id].name}</span>
            <button type="button" onClick={(event) => { event.stopPropagation(); deleteDoc(id); }}><Trash2 size={11} /></button>
          </div>
        ))}
        {docIds.length === 0 && !creating && <p className="studio-empty-hint">Nenhum copy salvo ainda</p>}
      </div>

      <div className="studio-editor-main">
        {!currentDoc ? (
          <div className="studio-empty-state">
            <Edit3 size={28} />
            <p>Selecione ou crie um copy</p>
            <small>Todos os textos são salvos automaticamente neste navegador</small>
          </div>
        ) : (
          <div className="studio-editor-doc-body">
            <div className="studio-editor-doc-head">
              <p>{currentDoc.name}</p>
              {saved && <span className="studio-saved-badge"><CheckCircle2 size={11} /> Salvo</span>}
            </div>
            <div className="studio-drive-field">
              <FolderOpen size={14} />
              <input
                value={currentDoc.drive || ''}
                onChange={(event) => updateDrive(active as string, event.target.value)}
                placeholder="Cole o link do Google Drive (pasta ou arquivo do criativo)..."
              />
              {currentDoc.drive && (
                <a href={currentDoc.drive} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /></a>
              )}
            </div>
            {COPY_FIELDS.map((field) => {
              const value = currentDoc.fields?.[field.id] || '';
              const isLong = field.id === 'script' || field.id === 'email' || field.id === 'body';
              return (
                <label key={field.id} className="studio-editor-field">
                  <span>{field.label}<small>{value.length} caracteres</small></span>
                  <textarea
                    value={value}
                    onChange={(event) => updateField(active as string, field.id, event.target.value)}
                    placeholder={field.placeholder}
                    rows={isLong ? 5 : 2}
                  />
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Brainstorm ─────────────────────────────────────────────────────────── */

type Idea = { id: number; text: string; tag: string; starred: boolean; createdAt: string };
type BrainLink = { id: number; url: string; title: string; category: string; starred: boolean; createdAt: string };

const LINK_CATEGORIES = ['Referência', 'Concorrente', 'Inspiração', 'Ad Spy', 'Parceria', 'Ferramenta'];

function BrainstormBank() {
  const [ideas, setIdeas] = useLocalStorageState<Idea[]>('opdds_studio_ideas', []);
  const [links, setLinks] = useLocalStorageState<BrainLink[]>('opdds_studio_links', []);
  const [tab, setTab] = useState<'ideas' | 'links'>('ideas');
  const [newIdea, setNewIdea] = useState('');
  const [newIdeaTag, setNewIdeaTag] = useState('Criativo');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLinkCat, setNewLinkCat] = useState('Referência');

  const addIdea = () => {
    if (!newIdea.trim()) return;
    setIdeas((prev) => [{ id: Date.now(), text: newIdea.trim(), tag: newIdeaTag, starred: false, createdAt: new Date().toLocaleDateString('pt-BR') }, ...prev]);
    setNewIdea('');
  };

  const addLink = () => {
    if (!newUrl.trim()) return;
    setLinks((prev) => [{ id: Date.now(), url: newUrl.trim(), title: newTitle.trim() || newUrl, category: newLinkCat, starred: false, createdAt: new Date().toLocaleDateString('pt-BR') }, ...prev]);
    setNewUrl('');
    setNewTitle('');
  };

  const toggleIdeaStar = (id: number) => setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, starred: !idea.starred } : idea)));
  const toggleLinkStar = (id: number) => setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, starred: !link.starred } : link)));
  const deleteIdea = (id: number) => setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  const deleteLink = (id: number) => setLinks((prev) => prev.filter((link) => link.id !== id));

  return (
    <div className="studio-panel-body">
      <div className="studio-subtabs">
        <button type="button" className={tab === 'ideas' ? 'active' : ''} onClick={() => setTab('ideas')}>Ideias</button>
        <button type="button" className={tab === 'links' ? 'active' : ''} onClick={() => setTab('links')}>Links</button>
      </div>

      {tab === 'ideas' && (
        <div className="studio-panel-body">
          <div className="studio-idea-form">
            <textarea
              value={newIdea}
              onChange={(event) => setNewIdea(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && event.ctrlKey && addIdea()}
              placeholder="Nova ideia, insight ou referência... (Ctrl+Enter para salvar)"
              rows={2}
            />
            <div>
              <select value={newIdeaTag} onChange={(event) => setNewIdeaTag(event.target.value)}>
                {TAGS.map((tag) => <option key={tag}>{tag}</option>)}
              </select>
              <button type="button" className="studio-primary-button" onClick={addIdea}>Salvar</button>
            </div>
          </div>
          <div className="studio-idea-grid">
            {[...ideas.filter((idea) => idea.starred), ...ideas.filter((idea) => !idea.starred)].map((idea) => (
              <div key={idea.id} className="studio-idea-card">
                <div>
                  <p>{idea.text}</p>
                  <div className="studio-idea-actions">
                    <button type="button" className={idea.starred ? 'is-starred' : ''} onClick={() => toggleIdeaStar(idea.id)}>
                      <Star size={13} fill={idea.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button type="button" onClick={() => deleteIdea(idea.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="studio-idea-meta">
                  <span style={{ backgroundColor: TAG_COLORS[idea.tag] || '#6b7280' }}>{idea.tag}</span>
                  <small>{idea.createdAt}</small>
                </div>
              </div>
            ))}
            {ideas.length === 0 && (
              <div className="studio-empty-state">
                <Lightbulb size={26} />
                <p>Nenhuma ideia salva ainda</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'links' && (
        <div className="studio-panel-body">
          <div className="studio-link-form">
            <input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="URL do link..." />
            <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Título (opcional)" />
            <select value={newLinkCat} onChange={(event) => setNewLinkCat(event.target.value)}>
              {LINK_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
            <button type="button" className="studio-primary-button" onClick={addLink}>Salvar</button>
          </div>
          <div className="studio-link-list">
            {[...links.filter((link) => link.starred), ...links.filter((link) => !link.starred)].map((link) => (
              <div key={link.id} className="studio-link-row">
                <Link2 size={14} />
                <div>
                  <p>{link.title}</p>
                  <small>{link.url}</small>
                </div>
                <span>{link.category}</span>
                <button type="button" className={link.starred ? 'is-starred' : ''} onClick={() => toggleLinkStar(link.id)}>
                  <Star size={12} fill={link.starred ? 'currentColor' : 'none'} />
                </button>
                <a href={link.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /></a>
                <button type="button" onClick={() => deleteLink(link.id)}><Trash2 size={12} /></button>
              </div>
            ))}
            {links.length === 0 && (
              <div className="studio-empty-state">
                <Link2 size={26} />
                <p>Nenhum link salvo ainda</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Diagnóstico de vendas ("Destravar Vendas") ────────────────────────── */

const FUNNEL_STEPS = [
  { key: 'cpm', label: 'Impressão', icon: Eye, color: '#6366f1', desc: 'Alcance dos criativos', benchmark: 'CPM < R$25 = eficiente', good: 25, warn: 45 },
  { key: 'ctr', label: 'Clique', icon: MousePointer, color: '#3b82f6', desc: 'CTR do anúncio', benchmark: 'CTR > 1,5% = bom', good: 1.5, warn: 0.8, inverted: true },
  { key: 'checkout', label: 'Checkout iniciado', icon: ShoppingCart, color: '#b18a66', desc: 'Chegou na página da Kiwify', benchmark: 'Custo por checkout < R$8 = eficiente', good: 8, warn: 15 },
  { key: 'conversao', label: 'Compra aprovada', icon: DollarSign, color: '#f59e0b', desc: 'Taxa de aprovação do checkout', benchmark: 'Conversão > 25% = saudável', good: 25, warn: 12, inverted: true },
  { key: 'ativacao', label: 'Ativação', icon: BookOpen, color: '#75b798', desc: 'Abriu o app em até 48h', benchmark: 'Ativação > 40% = ótimo', good: 40, warn: 20, inverted: true },
];

const SALES_CHECKLIST = [
  {
    cat: 'Criativos de conversão',
    items: [
      { id: 'c1', text: 'Tenho pelo menos 3 hooks diferentes testados (dor, curiosidade, transformação)', hard: true },
      { id: 'c2', text: 'Meus vídeos mostram o livro/app em uso real nos primeiros 3 segundos', hard: true },
      { id: 'c3', text: 'Tenho depoimento real de leitor (não ator) como anúncio', hard: true },
      { id: 'c4', text: 'Tenho creative com prova social (número de leitores, avaliações)', hard: false },
      { id: 'c5', text: 'Tenho creative de resposta direta (dor + solução + CTA direto)', hard: true },
    ],
  },
  {
    cat: 'Configuração de mídia paga',
    items: [
      { id: 'm1', text: 'Evento de conversão configurado pro "Purchase" real (Kiwify + Conversions API), não só clique', hard: true },
      { id: 'm2', text: 'Estou testando pelo menos 3 públicos em paralelo', hard: false },
      { id: 'm3', text: 'Tenho retargeting de quem chegou no checkout mas não comprou', hard: false },
      { id: 'm4', text: 'Budget mínimo de R$30/dia por conjunto de anúncios pra sair da fase de aprendizado', hard: true },
      { id: 'm5', text: 'A campanha aponta pra página de vendas certa pro público (fria vs. quente)', hard: false },
    ],
  },
  {
    cat: 'Onboarding e ativação do leitor',
    items: [
      { id: 'o1', text: 'O primeiro passo depois da compra é abrir o livro, não criar conta', hard: true },
      { id: 'o2', text: 'Tenho e-mail/mensagem de boas-vindas incentivando abrir o app em até 24h', hard: false },
      { id: 'o3', text: 'Meço a ativação (% que abre o app) separada da compra', hard: true },
      { id: 'o4', text: 'Existe uma prévia/trecho gratuito antes da compra completa, reduzindo objeção', hard: false },
      { id: 'o5', text: 'Tenho fluxo de recuperação pra quem comprou mas não voltou em 48h', hard: true },
    ],
  },
];

function diagStatus(value: string, good: number, warn: number, inverted = false) {
  const n = parseFloat(String(value).replace(',', '.'));
  if (!value || Number.isNaN(n)) return null;
  const passGood = inverted ? n >= good : n <= good;
  const passWarn = inverted ? n >= warn : n <= warn;
  if (passGood) return { color: '#75b798', label: 'Bom' };
  if (passWarn) return { color: '#f59e0b', label: 'Atenção' };
  return { color: '#ef4444', label: 'Melhorar' };
}

function SalesDiagnosis() {
  const [checks, setChecks] = useLocalStorageState<Record<string, boolean>>('opdds_studio_diagnosis', {});
  const [metrics, setMetrics] = useLocalStorageState<Record<string, string>>('opdds_studio_metrics', { cpm: '', ctr: '', checkout: '', conversao: '', ativacao: '' });

  const toggle = (id: string) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalItems = SALES_CHECKLIST.reduce((acc, cat) => acc + cat.items.length, 0);
  const totalChecked = Object.values(checks).filter(Boolean).length;
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;
  const hardMissing = SALES_CHECKLIST.flatMap((cat) => cat.items).filter((item) => item.hard && !checks[item.id]);

  return (
    <div className="studio-panel-body">
      <div className="studio-card">
        <p className="studio-card-title">Onde está o gargalo do seu funil?</p>
        <p className="studio-card-subtitle">Preencha os números reais da campanha e veja onde está o bloqueio.</p>
        <div className="studio-funnel-grid">
          {FUNNEL_STEPS.map((step) => {
            const Icon = step.icon;
            const status = diagStatus(metrics[step.key], step.good, step.warn, step.inverted);
            return (
              <div key={step.key} className="studio-funnel-step">
                <div className="studio-funnel-icon" style={{ backgroundColor: `${step.color}22` }}>
                  <Icon size={17} style={{ color: step.color }} />
                </div>
                <p>{step.label}</p>
                <small>{step.desc}</small>
                <input
                  value={metrics[step.key] || ''}
                  onChange={(event) => setMetrics((prev) => ({ ...prev, [step.key]: event.target.value }))}
                  placeholder="valor"
                />
                {status && <span style={{ color: status.color }}>{status.label}</span>}
                <p className="studio-funnel-benchmark">{step.benchmark}</p>
              </div>
            );
          })}
        </div>
      </div>

      {hardMissing.length > 0 && (
        <div className="studio-alert-card">
          <p><AlertTriangle size={14} /> {hardMissing.length} ações críticas em falta que estão bloqueando vendas</p>
          <div>
            {hardMissing.slice(0, 4).map((item) => <p key={item.id}>{item.text}</p>)}
          </div>
        </div>
      )}

      <div className="studio-card">
        <div className="studio-score-head">
          <p>Score de prontidão para vendas</p>
          <strong style={{ color: pct >= 70 ? '#75b798' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>{pct}%</strong>
        </div>
        <div className="studio-score-track"><span style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#75b798' : pct >= 40 ? '#f59e0b' : '#ef4444' }} /></div>
        <small>{totalChecked}/{totalItems} itens concluídos</small>
      </div>

      {SALES_CHECKLIST.map((cat) => (
        <div key={cat.cat} className="studio-card">
          <p className="studio-card-title">{cat.cat}</p>
          <div className="studio-checklist">
            {cat.items.map((item) => (
              <label key={item.id} className={checks[item.id] ? 'is-checked' : ''}>
                <span className="studio-checkbox" onClick={() => toggle(item.id)}>{checks[item.id] && <CheckCircle2 size={12} />}</span>
                <span onClick={() => toggle(item.id)}>
                  {item.text}
                  {item.hard && !checks[item.id] && <small> · crítico para vendas</small>}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Ad Spy ─────────────────────────────────────────────────────────────── */

const SPY_RESOURCES = [
  { name: 'Meta Ad Library — Livros de autoajuda BR', url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=livro+autoajuda&search_type=keyword_unordered', desc: 'Anúncios ativos de livros de autoajuda no Brasil agora mesmo.', tag: 'Essencial', color: '#1877F2' },
  { name: 'Meta Ad Library — Desenvolvimento pessoal', url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=desenvolvimento+pessoal&search_type=keyword_unordered', desc: 'Anúncios de cursos, e-books e mentorias de desenvolvimento pessoal.', tag: 'Essencial', color: '#1877F2' },
  { name: 'Meta Ad Library — Saúde mental', url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=saude+mental&search_type=keyword_unordered', desc: 'Criativos da categoria saúde mental/terapia — estude os hooks emocionais.', tag: 'Referência', color: '#1877F2' },
  { name: 'TikTok Creative Center', url: 'https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en', desc: 'Top anúncios de performance no TikTok por categoria.', tag: 'TikTok', color: '#010101' },
  { name: 'Swipe-Worthy (Swipe Files)', url: 'https://swiped.co/?s=self+help', desc: 'Banco de anúncios de alta performance salvos por profissionais de marketing.', tag: 'Swipe File', color: '#f59e0b' },
  { name: 'Foreplay.co', url: 'https://foreplay.co', desc: 'Plataforma de swipe file colaborativo — salve e organize anúncios por campanha.', tag: 'Ferramenta', color: '#6366f1' },
  { name: 'BigSpy', url: 'https://bigspy.com/adspy/?platform=facebook&type=image&country=BR&q=livro', desc: 'Spy tool gratuita com filtro por país. Veja anúncios de livros/e-books no BR.', tag: 'Spy Tool', color: '#ef4444' },
];

const CREATIVE_FRAMEWORKS = [
  { name: 'Hook → Dor → Solução → Prova → CTA', type: 'Conversão direta', example: 'Você já tentou de tudo pra "se resolver" e nada funcionou? O Poder dos Desacreditados não é mais um livro de fórmulas — é presença pra quem já cansou de performar recuperação. Comece você também.' },
  { name: 'Antes vs. Depois', type: 'Transformação', example: 'Antes: se cobrando por não conseguir "virar a chave". Depois: um espaço que acompanha sem exigir — livro, diário e um mentor que devolve perguntas, não respostas prontas.' },
  { name: 'Pergunta de qualificação', type: 'Filtro de público', example: 'Você já se sentiu desacreditado — por si mesmo ou pelos outros? Se sim, esse projeto foi feito pensando em você.' },
  { name: 'Prova social específica', type: 'Credibilidade', example: 'Centenas de leitores já começaram a travessia. O que eles descobriram nas primeiras páginas?' },
  { name: 'UGC autêntico', type: 'Confiança', example: 'Depoimento real de um leitor sobre como o livro chegou até ele — gravado no celular, sem produção.' },
  { name: 'Educação + Pitch', type: 'Público quente', example: '3 sinais de que você está performando recuperação em vez de vivê-la [carrossel educativo] + slide final: conheça O Poder dos Desacreditados.' },
];

function AdSpyPanel() {
  return (
    <div className="studio-panel-body">
      <div className="studio-tip-card">
        <p><Search size={13} /> Como usar o Ad Spy pra desbloquear criativos</p>
        <p>
          Abra o Meta Ad Library todo dia por 10 minutos. Busque "livro autoajuda", "desenvolvimento pessoal",
          "saúde mental". Anúncio rodando há mais de 30 dias = está performando. Copie a <strong>estrutura</strong>,
          não o texto. Adapte pro contexto do projeto.
        </p>
      </div>

      <div className="studio-spy-grid">
        {SPY_RESOURCES.map((resource) => (
          <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer" className="studio-spy-card">
            <div className="studio-spy-icon" style={{ backgroundColor: `${resource.color}22` }}>
              <Search size={15} style={{ color: resource.color }} />
            </div>
            <div>
              <div>
                <p>{resource.name}</p>
                <span style={{ backgroundColor: resource.color }}>{resource.tag}</span>
              </div>
              <small>{resource.desc}</small>
            </div>
            <ExternalLink size={13} />
          </a>
        ))}
      </div>

      <div className="studio-card">
        <p className="studio-card-title">Frameworks de criativos que convertem</p>
        <div className="studio-framework-list">
          {CREATIVE_FRAMEWORKS.map((framework, index) => (
            <div key={framework.name} className="studio-framework-card">
              <div>
                <span>{index + 1}</span>
                <p>{framework.name}</p>
                <small>{framework.type}</small>
              </div>
              <p className="studio-framework-example">"{framework.example}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Calendário de conteúdo ─────────────────────────────────────────────── */

type CalendarItem = {
  id: number; title: string; date: string; time: string; channel: string; status: string;
  objective: string; drive: string; thumbnail: string; sequence: string; copy: string;
};

const CHANNELS = [
  { id: 'meta', label: 'Meta Ads', icon: Hash, color: '#1877F2', path: '' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C', path: '' },
  { id: 'tiktok', label: 'TikTok Ads', icon: Video, color: '#010101', path: 'https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en' },
  { id: 'email', label: 'E-mail', icon: Mail, color: '#75b798', path: '' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366', path: '' },
];

const DEFAULT_SCHEDULE: CalendarItem[] = [
  { id: 1, title: 'Hook "cansado de performar recuperação" + CTA livro', date: new Date().toISOString().slice(0, 10), time: '09:00', channel: 'instagram', status: 'Brief', objective: 'Atrair quem já tentou várias abordagens de autoajuda', drive: '', thumbnail: '', sequence: 'Avulso', copy: '' },
  { id: 2, title: 'Depoimento real de leitor — primeiras páginas', date: new Date().toISOString().slice(0, 10), time: '18:30', channel: 'meta', status: 'Producao', objective: 'Prova social pra público frio', drive: '', thumbnail: '', sequence: 'Avulso', copy: '' },
];

const SEQUENCE_TEMPLATES = [
  { id: 'launch', name: 'Lançamento de oferta', items: [['Teaser da dor principal', 'instagram'], ['Depoimento + prova social', 'meta'], ['Trecho/prévia do livro', 'tiktok'], ['Lembrete de checkout abandonado', 'email'], ['Follow-up de ativação', 'whatsapp']] },
  { id: 'ugc', name: 'UGC de leitores', items: [['Convite pra compartilhar trecho favorito', 'instagram'], ['Repost de depoimento', 'instagram'], ['Retargeting pra quem viu', 'meta'], ['E-mail de ativação', 'email']] },
  { id: 'emotional', name: 'Campanha emocional', items: [['Storytelling de travessia real', 'instagram'], ['Carrossel educativo acolhedor', 'meta'], ['E-mail sensível pra quem comprou mas não voltou', 'email']] },
] as const;

function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function getChannel(channelId: string) {
  return CHANNELS.find((channel) => channel.id === channelId) || CHANNELS[0];
}

function ContentCalendar() {
  const today = new Date().toISOString().slice(0, 10);
  const [items, setItems] = useLocalStorageState<CalendarItem[]>('opdds_studio_calendar', DEFAULT_SCHEDULE);
  const [form, setForm] = useState({ title: '', date: today, time: '09:00', channel: 'instagram', status: 'Brief', objective: '', drive: '', thumbnail: '', sequence: 'Avulso', copy: '' });
  const [sequenceBase, setSequenceBase] = useState(today);
  const [sequenceTemplate, setSequenceTemplate] = useState<string>(SEQUENCE_TEMPLATES[0].id);
  const [channelFilter, setChannelFilter] = useState('all');

  const filteredItems = [...items]
    .filter((item) => channelFilter === 'all' || item.channel === channelFilter)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const groupedByDate = filteredItems.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const addItem = () => {
    if (!form.title.trim()) return;
    setItems((prev) => [{ ...form, id: Date.now(), title: form.title.trim() }, ...prev]);
    setForm((prev) => ({ ...prev, title: '', objective: '', drive: '', thumbnail: '', copy: '' }));
  };

  const updateItem = (id: number, patch: Partial<CalendarItem>) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const deleteItem = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

  const generateSequence = () => {
    const template = SEQUENCE_TEMPLATES.find((item) => item.id === sequenceTemplate) || SEQUENCE_TEMPLATES[0];
    const created: CalendarItem[] = template.items.map(([title, channel], index) => ({
      id: Date.now() + index,
      title,
      date: addDays(sequenceBase, index * 2),
      time: index % 2 === 0 ? '09:00' : '18:30',
      channel,
      status: 'Brief',
      objective: `Sequência: ${template.name}`,
      drive: '',
      thumbnail: '',
      sequence: template.name,
      copy: '',
    }));
    setItems((prev) => [...created, ...prev]);
  };

  return (
    <div className="studio-calendar-layout">
      <div className="studio-calendar-main">
        <div className="studio-calendar-head">
          <div>
            <p className="studio-card-title">Programação multicanal</p>
            <small>Planeje posts, sequências, miniaturas e Drive num só lugar.</small>
          </div>
          <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
            <option value="all">Todos os canais</option>
            {CHANNELS.map((channel) => <option key={channel.id} value={channel.id}>{channel.label}</option>)}
          </select>
        </div>

        {Object.entries(groupedByDate).map(([date, dayItems]) => (
          <div key={date} className="studio-calendar-day">
            <div className="studio-calendar-day-head">
              <Calendar size={13} />
              <p>{new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
              <small>({dayItems.length})</small>
            </div>
            <div className="studio-calendar-day-grid">
              {dayItems.map((item) => {
                const channel = getChannel(item.channel);
                const Icon = channel.icon;
                return (
                  <div key={item.id} className="studio-calendar-card">
                    <div className="studio-calendar-card-thumb">
                      {item.thumbnail ? <img src={item.thumbnail} alt="" /> : <ImageIcon size={20} />}
                    </div>
                    <div className="studio-calendar-card-body">
                      <div className="studio-calendar-card-tags">
                        <span style={{ backgroundColor: channel.color }}><Icon size={9} /> {channel.label}</span>
                        <span className="studio-calendar-status">{item.status}</span>
                        <small>{item.time}</small>
                      </div>
                      <p>{item.title}</p>
                      {(item.objective || item.copy) && <small>{item.objective || item.copy}</small>}
                      <div className="studio-calendar-card-links">
                        {item.drive && <a href={item.drive} target="_blank" rel="noreferrer"><Cloud size={10} /> Drive</a>}
                        {channel.path && <a href={channel.path} target="_blank" rel="noreferrer"><ExternalLink size={10} /> Canal</a>}
                      </div>
                      <div className="studio-calendar-card-inputs">
                        <input value={item.thumbnail || ''} onChange={(event) => updateItem(item.id, { thumbnail: event.target.value })} placeholder="URL miniatura" />
                        <input value={item.drive || ''} onChange={(event) => updateItem(item.id, { drive: event.target.value })} placeholder="Link Drive" />
                      </div>
                      <div className="studio-calendar-card-foot">
                        <select value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value })}>
                          {['Brief', 'Producao', 'Revisao', 'Aprovado', 'Publicado'].map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <button type="button" onClick={() => deleteItem(item.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && <p className="studio-empty-hint">Nenhum item agendado ainda</p>}
      </div>

      <div className="studio-calendar-side">
        <div className="studio-card">
          <p className="studio-card-title">Novo post programado</p>
          <div className="studio-calendar-form">
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título do post/campanha" />
            <div className="studio-calendar-form-row">
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
            </div>
            <select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}>
              {CHANNELS.map((channel) => <option key={channel.id} value={channel.id}>{channel.label}</option>)}
            </select>
            <textarea value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value })} placeholder="Objetivo e público-alvo" rows={2} />
            <input value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} placeholder="URL da miniatura" />
            <input value={form.drive} onChange={(event) => setForm({ ...form, drive: event.target.value })} placeholder="Link Google Drive" />
            <button type="button" className="studio-primary-button" onClick={addItem}>Adicionar ao calendário</button>
          </div>
        </div>

        <div className="studio-card">
          <p className="studio-card-title">Gerar sequência</p>
          <div className="studio-calendar-form">
            <select value={sequenceTemplate} onChange={(event) => setSequenceTemplate(event.target.value)}>
              {SEQUENCE_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </select>
            <input type="date" value={sequenceBase} onChange={(event) => setSequenceBase(event.target.value)} />
            <button type="button" className="studio-primary-button" onClick={generateSequence}><Wand2 size={13} /> Criar agenda automática</button>
          </div>
        </div>

        <div className="studio-card studio-card-dark">
          <p className="studio-card-title">Canais</p>
          <div className="studio-channel-grid">
            {CHANNELS.map((channel) => {
              const Icon = channel.icon;
              const count = items.filter((item) => item.channel === channel.id).length;
              const content = (
                <>
                  <Icon size={14} style={{ color: channel.color === '#010101' ? '#fff' : channel.color }} />
                  <p>{channel.label}</p>
                  <small>{count} itens</small>
                </>
              );
              return channel.path ? (
                <a key={channel.id} href={channel.path} target="_blank" rel="noreferrer">{content}</a>
              ) : (
                <div key={channel.id}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Inteligência de marketing ──────────────────────────────────────────── */

const PRODUCT_ANGLES = [
  { module: 'Livro', angle: 'Leitura com presença', hook: 'Você não precisa se consertar pra continuar.', audience: 'Quem já tentou de tudo' },
  { module: 'Diário', angle: 'Escrita guiada', hook: 'Algumas perguntas precisam ser feitas em voz alta, mesmo que só pra você mesmo.', audience: 'Quem processa melhor escrevendo' },
  { module: 'iGentMIND', angle: 'Mentor por IA', hook: 'Um espaço que devolve perguntas, não respostas prontas.', audience: 'Quem busca acompanhamento entre sessões' },
  { module: 'Áudios', angle: 'Ouvir em movimento', hook: 'Pra quem não tem tempo de sentar e ler, mas precisa continuar.', audience: 'Rotina corrida' },
  { module: 'Comunidade', angle: 'Pertencimento', hook: 'Menos vitrine, mais continuidade.', audience: 'Quem busca não estar sozinho na travessia' },
];

function MarketingIntelligence() {
  const [metrics] = useLocalStorageState<Record<string, string>>('opdds_studio_metrics', {});
  const [calendarItems] = useLocalStorageState<CalendarItem[]>('opdds_studio_calendar', DEFAULT_SCHEDULE);
  const [tasks] = useLocalStorageState<KanbanTask[]>('opdds_studio_kanban', INIT_TASKS);
  const [ideas] = useLocalStorageState<Idea[]>('opdds_studio_ideas', []);
  const [links] = useLocalStorageState<BrainLink[]>('opdds_studio_links', []);

  const ctr = Number(String(metrics.ctr || '').replace(',', '.'));
  const ativacao = Number(String(metrics.ativacao || '').replace(',', '.'));
  const blockers = [
    ctr > 0 && ctr < 1.5 ? 'CTR baixo: priorize hooks de dor/curiosidade e depoimentos reais nos primeiros segundos.' : null,
    ativacao > 0 && ativacao < 40 ? 'Ativação baixa: a campanha deve vender a entrada na leitura, não só a compra — reforce o e-mail de boas-vindas.' : null,
    tasks.filter((task) => task.priority === 'Alta' && task.col !== 'done').length > 3 ? 'Muitas tarefas de alta prioridade em aberto: reduza escopo e publique sequências menores.' : null,
  ].filter(Boolean) as string[];

  const cards = [
    { label: 'Posts agendados', value: calendarItems.length, icon: Calendar, color: '#b18a66' },
    { label: 'Tarefas abertas', value: tasks.filter((task) => task.col !== 'done').length, icon: BarChart2, color: '#f59e0b' },
    { label: 'Ideias salvas', value: ideas.length, icon: Lightbulb, color: '#75b798' },
    { label: 'Referências', value: links.length, icon: Link2, color: '#3b82f6' },
  ];

  return (
    <div className="studio-panel-body">
      <div className="studio-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="studio-stat-card">
              <Icon size={17} style={{ color: card.color }} />
              <small>{card.label}</small>
              <strong>{card.value}</strong>
            </div>
          );
        })}
      </div>

      <div className="studio-intel-layout">
        <div className="studio-card">
          <p className="studio-card-title"><Layers size={15} /> Ângulos do sistema OPDDS</p>
          <div className="studio-angle-grid">
            {PRODUCT_ANGLES.map((signal) => (
              <div key={signal.module} className="studio-angle-card">
                <p className="studio-angle-module">{signal.module}</p>
                <p className="studio-angle-title">{signal.angle}</p>
                <p>{signal.hook}</p>
                <small>Público: {signal.audience}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-card studio-card-dark">
          <p className="studio-card-title"><Sparkles size={15} /> Recomendações agora</p>
          <div className="studio-recommendation-list">
            {(blockers.length ? blockers : [
              'Priorize depoimentos reais de leitores como criativo principal antes de aumentar verba.',
              'Toda campanha de Meta deve ter uma versão de retargeting pra quem viu o checkout.',
              'Use o Editor de Copy pra manter hook, headline e CTA consistentes entre canais.',
            ]).map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Monitor de campanhas (Meta Marketing API) ──────────────────────────── */

const PERIOD_OPTIONS = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'last_7d', label: 'Últimos 7 dias' },
  { id: 'last_14d', label: 'Últimos 14 dias' },
  { id: 'last_30d', label: 'Últimos 30 dias' },
  { id: 'this_month', label: 'Este mês' },
  { id: 'last_month', label: 'Mês passado' },
];

const STATUS_OPTIONS = [
  { id: 'ACTIVE', label: 'Ativas' },
  { id: 'PAUSED', label: 'Pausadas' },
  { id: 'ALL', label: 'Todas' },
];

const URGENCY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatCurrency(value: number | undefined) {
  return currencyFormatter.format(Number(value) || 0);
}

function formatNumber(value: number | undefined) {
  return numberFormatter.format(Number(value) || 0);
}

function formatPercent(value: number | undefined) {
  return `${(Number(value) || 0).toFixed(2)}%`;
}

function campaignInsight(campaign: MetaAdsCampaign) {
  return campaign.insights?.data?.[0] || {};
}

function MetaAdsMonitor() {
  const [config, setConfig] = useState<MetaAdsConfig | null>(null);
  const [accountId, setAccountId] = useState('');
  const [period, setPeriod] = useState('last_7d');
  const [status, setStatus] = useState('ACTIVE');
  const [campaigns, setCampaigns] = useState<MetaAdsCampaign[]>([]);
  const [advisor, setAdvisor] = useState<MetaAdsAdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetaAdsConfig()
      .then((data) => {
        setConfig(data);
        if (data.accountId) setAccountId(data.accountId);
      })
      .catch(() => setConfig({ configured: false, hasToken: false, tokenPreview: null, accountId: null, graphVersion: '' }));
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchMetaAdsCampaigns({ period, status, accountId: accountId || undefined });
      setCampaigns(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível buscar as campanhas.');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAdvisor = async () => {
    setAdvisorLoading(true);
    setError('');
    try {
      const response = await fetchMetaAdsAdvisor({ period, status, accountId: accountId || undefined });
      setAdvisor(response);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível gerar a análise.');
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleSearch = () => {
    loadCampaigns();
    loadAdvisor();
  };

  const aiSummary = advisor?.ai?.summary || advisor?.summary;
  const priorities = advisor?.ai?.priorities?.length ? advisor.ai.priorities : advisor?.priorities || [];
  const experiments = advisor?.ai?.experiments?.length ? advisor.ai.experiments : advisor?.experiments || [];
  const nextQuestions = advisor?.ai?.nextQuestions?.length ? advisor.ai.nextQuestions : advisor?.nextQuestions || [];

  const kpis = advisor?.summary ? [
    { label: 'Investimento', value: formatCurrency(advisor.summary.spend), icon: DollarSign, color: '#b18a66' },
    { label: 'ROAS', value: `${(advisor.summary.roas || 0).toFixed(2)}x`, icon: TrendingUp, color: advisor.summary.roas >= 1 ? '#75b798' : '#ef4444' },
    { label: 'CPC médio', value: formatCurrency(advisor.summary.cpc), icon: MousePointer, color: '#3b82f6' },
    { label: 'CTR', value: formatPercent(advisor.summary.ctr), icon: Percent, color: '#f59e0b' },
    { label: 'Conversões', value: formatNumber(advisor.summary.conversions), icon: CheckCircle2, color: '#75b798' },
    { label: 'Cliques', value: formatNumber(advisor.summary.clicks), icon: Radio, color: '#8b8880' },
    { label: 'Impressões', value: formatNumber(advisor.summary.impressions), icon: Eye, color: '#6366f1' },
    { label: 'Receita', value: formatCurrency(advisor.summary.revenue), icon: Users2, color: '#b18a66' },
  ] : [];

  if (config && !config.configured) {
    return (
      <div className="studio-panel-body">
        <div className="studio-card">
          <p className="studio-card-title"><MonitorSmartphone size={15} /> Monitor de campanhas ainda não conectado</p>
          <p className="studio-card-subtitle">
            Esse módulo lê métricas reais da Meta Marketing API (gasto, ROAS, CTR, cliques). Pra ativar, gere um token
            de acesso com permissão <strong>ads_read</strong> em Configurações de Negócios → Usuários do sistema, e
            configure no backend:
          </p>
          <div className="studio-naming-rows">
            <div className="studio-naming-row"><div><small>Variável</small><p>META_ADS_ACCESS_TOKEN</p></div></div>
            <div className="studio-naming-row"><div><small>Variável</small><p>META_AD_ACCOUNT_ID</p></div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-panel-body">
      <div className="studio-card studio-monitor-toolbar">
        <div>
          <small>Conexão backend</small>
          <p>{config?.hasToken ? <span className="studio-status-ok">Meta configurado</span> : 'Carregando...'} <small>{config?.graphVersion}</small></p>
        </div>
        <label>
          <span>Ad account ID</span>
          <input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="act_xxxxxxxxxxxx" />
        </label>
        <label>
          <span>Período</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            {PERIOD_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUS_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <button type="button" className="studio-primary-button" onClick={handleSearch} disabled={loading || advisorLoading}>
          <RefreshCw size={13} className={loading || advisorLoading ? 'is-spinning' : ''} /> Buscar
        </button>
      </div>

      {error && <div className="studio-alert-card"><p><AlertTriangle size={14} /> {error}</p></div>}

      {advisor && (
        <div className="studio-card">
          <div className="studio-monitor-head">
            <p className="studio-card-title"><Sparkles size={15} /> Assistente de tráfego</p>
            <small>{advisor.provider === 'rules' ? 'Análise por regras' : `IA (${advisor.provider})`} · {advisor.summary.totalCampaigns} campanha(s), {advisor.summary.activeCampaigns} ativa(s)</small>
          </div>
          <div className="studio-monitor-diagnosis">
            <div className="studio-diagnosis-card studio-diagnosis-diag">
              <small>Diagnóstico</small>
              <p>{aiSummary?.diagnosis || `Período com ${advisor.summary.totalCampaigns} campanha(s) e investimento de ${formatCurrency(advisor.summary.spend)}.`}</p>
            </div>
            <div className="studio-diagnosis-card studio-diagnosis-risk">
              <small>Risco</small>
              <p>{aiSummary?.mainRisk || (advisor.summary.spend < 30 ? 'O investimento do período ainda é baixo para conclusões estatísticas fortes.' : 'Sem risco crítico identificado pelas regras.')}</p>
            </div>
            <div className="studio-diagnosis-card studio-diagnosis-opp">
              <small>Oportunidade</small>
              <p>{aiSummary?.bestOpportunity || 'Identifique a campanha vencedora e escale com cautela.'}</p>
            </div>
          </div>

          <div className="studio-monitor-columns">
            <div>
              <p className="studio-card-title">Prioridades</p>
              <div className="studio-priority-list">
                {priorities.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="studio-priority-item">
                    <div>
                      <p>{item.title}</p>
                      {item.urgency && <span className={`studio-urgency studio-urgency-${item.urgency}`}>{URGENCY_LABEL[item.urgency] || item.urgency}</span>}
                    </div>
                    <small>{item.reason}</small>
                    {item.action && <p className="studio-priority-action">{item.action}</p>}
                  </div>
                ))}
                {!priorities.length && <p className="studio-empty-hint">Sem prioridades no momento.</p>}
              </div>
            </div>
            <div>
              <p className="studio-card-title">Testes sugeridos</p>
              <div className="studio-priority-list">
                {experiments.map((item) => (
                  <div key={item.title} className="studio-priority-item">
                    <p>{item.title}</p>
                    <small>{item.hypothesis || item.setup}</small>
                    {item.successMetric && <p className="studio-priority-action">{item.successMetric}</p>}
                  </div>
                ))}
                {!experiments.length && <p className="studio-empty-hint">Nenhum teste sugerido ainda.</p>}
              </div>
            </div>
          </div>

          {nextQuestions.length > 0 && (
            <p className="studio-monitor-questions">
              <strong>Para refinar o assistente:</strong> {nextQuestions.join(' · ')}
            </p>
          )}
        </div>
      )}

      {kpis.length > 0 && (
        <div className="studio-stat-grid">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="studio-stat-card">
                <Icon size={17} style={{ color: kpi.color }} />
                <small>{kpi.label}</small>
                <strong>{kpi.value}</strong>
              </div>
            );
          })}
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="studio-card">
          <p className="studio-card-title">Campanhas</p>
          <div className="studio-campaign-list">
            {campaigns.map((campaign) => {
              const insight = campaignInsight(campaign);
              return (
                <div key={campaign.id} className="studio-campaign-row">
                  {campaign.creative?.image_url ? (
                    <img src={campaign.creative.image_url} alt="" />
                  ) : (
                    <div className="studio-campaign-thumb"><ImageIcon size={16} /></div>
                  )}
                  <div>
                    <p>{campaign.name}</p>
                    <small>{campaign.objective} · {campaign.effective_status || campaign.status}</small>
                  </div>
                  <div className="studio-campaign-metrics">
                    <span>{formatCurrency(Number(insight.spend))}</span>
                    <span>{formatPercent(Number(insight.ctr))}</span>
                    <span>{formatCurrency(Number(insight.cpc))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !campaigns.length && !error && (
        <p className="studio-empty-hint">Clique em "Buscar" pra carregar as campanhas do período selecionado.</p>
      )}
    </div>
  );
}

/* ─── Shell principal ────────────────────────────────────────────────────── */

const STUDIO_TABS = [
  { id: 'monitor', label: 'Monitor de campanhas', icon: MonitorSmartphone },
  { id: 'diagnosis', label: 'Destravar vendas', icon: Target },
  { id: 'calendar', label: 'Calendário', icon: Calendar },
  { id: 'kanban', label: 'Kanban', icon: BarChart2 },
  { id: 'editor', label: 'Editor de copy', icon: Edit3 },
  { id: 'intel', label: 'Inteligência', icon: Sparkles },
  { id: 'naming', label: 'Nomenclatura Meta', icon: Hash },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb },
  { id: 'spy', label: 'Ad Spy', icon: Search },
] as const;

export function MarketingStudioTabs() {
  const [activeTab, setActiveTab] = useState<typeof STUDIO_TABS[number]['id']>('monitor');

  return (
    <div className="studio-shell">
      <div className="studio-tabs" role="tablist" aria-label="Estúdio de marketing">
        {STUDIO_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'monitor' && <MetaAdsMonitor />}
      {activeTab === 'diagnosis' && <SalesDiagnosis />}
      {activeTab === 'calendar' && <ContentCalendar />}
      {activeTab === 'kanban' && <CreativeKanban />}
      {activeTab === 'editor' && <CopyDocsEditor />}
      {activeTab === 'intel' && <MarketingIntelligence />}
      {activeTab === 'naming' && <MetaNamingPanel />}
      {activeTab === 'brainstorm' && <BrainstormBank />}
      {activeTab === 'spy' && <AdSpyPanel />}
    </div>
  );
}
