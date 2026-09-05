/* ============================================================
   GERENTE FINANCEIRO — App Logic
   ============================================================ */

let DATA = null;

// ─── BOOT ─────────────────────────────────────────────────
async function boot() {
  try {
    const res = await fetch('data/financas.json');
    DATA = await res.json();
  } catch(e) {
    // fallback: DATA already embedded inline by index.html
  }
  renderAll();
}

function renderAll() {
  renderSidebar();
  renderDashboard();
  renderChat();
  renderHistorico();
  renderParcelamentos();
  renderFaturas();
  renderMetas();
  renderPlanoConta();
}

// ─── NAVIGATION ───────────────────────────────────────────
function goTo(id, el) {
  // Hide all screens
  document.querySelectorAll('.screen, .screen-chat').forEach(s => {
    s.classList.remove('active');
  });
  // Deactivate nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  // Show target
  const screen = document.getElementById('screen-' + id);
  if (screen) screen.classList.add('active');
  // Activate nav item
  if (el) el.classList.add('active');
  else {
    const navItem = document.querySelector(`.nav-item[data-screen="${id}"]`);
    if (navItem) navItem.classList.add('active');
  }
  // Update topbar
  const titles = {
    dashboard: 'Dashboard', chat: 'Chat com Agente', historico: 'Histórico',
    parcelamentos: 'Parcelamentos', faturas: 'Faturas a Pagar',
    metas: 'Metas Financeiras', plano: 'Plano de Contas',
    importar: 'Importar Arquivo'
  };
  const t = document.getElementById('topbar-title');
  if (t) t.textContent = titles[id] || id;
}

// ─── SIDEBAR ──────────────────────────────────────────────
function renderSidebar() {
  if (!DATA) return;
  const u = DATA.usuario;
  document.querySelectorAll('.avatar').forEach(av => { av.textContent = u.initials; });
  document.querySelectorAll('.avatar-name').forEach(el => { el.textContent = u.nome; });
  document.querySelectorAll('.avatar-sub').forEach(el => { el.textContent = `${u.cidade} · ${u.uf}`; });
}

// ─── HELPERS ──────────────────────────────────────────────
function fmt(val) {
  const abs = Math.abs(val);
  return 'R$ ' + abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtSigned(val) {
  const sign = val >= 0 ? '+ ' : '− ';
  return sign + fmt(val);
}
function fmtDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
}
function fmtMonth(str) {
  if (!str) return '';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { month:'short' }).replace('.','').toLowerCase();
}
function pct(part, total) { return total ? Math.round((part / total) * 100) : 0; }

// ─── DASHBOARD ────────────────────────────────────────────
function renderDashboard() {
  if (!DATA) return;
  const r = DATA.resumo_mensal;

  setEl('dash-receitas',     fmt(r.receitas));
  setEl('dash-despesas',     fmt(r.despesas_competencia));
  setEl('dash-saldo',        fmt(r.saldo_disponivel));
  setEl('dash-parcelas',     fmt(r.parcelas_futuras_6m));
  setEl('dash-comprometimento', r.comprometimento_pct + '%');

  renderBarChart();
  renderDonut();
  renderRecentTx();
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderBarChart() {
  const wrap = document.getElementById('bar-chart');
  if (!wrap || !DATA) return;
  const hist = DATA.historico_mensal;
  const maxV = Math.max(...hist.map(h => Math.max(h.receitas, h.despesas)));
  wrap.innerHTML = '';
  hist.forEach(h => {
    const ih = Math.round((h.receitas / maxV) * 90);
    const eh = Math.round((h.despesas / maxV) * 90);
    wrap.innerHTML += `
      <div class="bar-col">
        <div class="bar income" style="height:${ih}px" title="Receita: ${fmt(h.receitas)}"></div>
        <div class="bar expense" style="height:${eh}px" title="Despesa: ${fmt(h.despesas)}"></div>
        <div class="bar-label">${h.mes}</div>
      </div>`;
  });
}

function renderDonut() {
  const svg = document.getElementById('donut-svg');
  const leg = document.getElementById('donut-legend');
  if (!svg || !leg || !DATA) return;
  const cats = DATA.categorias_grafico;
  let offset = 25;
  let circles = '';
  cats.forEach(c => {
    circles += `<circle cx="21" cy="21" r="15.92" fill="transparent"
      stroke="${c.cor}" stroke-width="6"
      stroke-dasharray="${c.pct} ${100 - c.pct}"
      stroke-dashoffset="${-offset + 25}" />`;
    offset += c.pct;
  });
  svg.innerHTML = circles + `<text x="21" y="22" text-anchor="middle" font-size="4" font-family="Instrument Sans" fill="#5a6278" dominant-baseline="central">maio</text>`;

  leg.innerHTML = cats.map(c => `
    <div class="flex items-center justify-between" style="padding:5px 0; border-bottom:1px solid var(--cloud);">
      <div class="flex items-center gap-2">
        <div style="width:9px;height:9px;border-radius:50%;background:${c.cor};flex-shrink:0"></div>
        <span class="text-sm">${c.nome}</span>
      </div>
      <span class="text-sm" style="font-weight:600">${c.pct}%</span>
    </div>`).join('');
}

function renderRecentTx() {
  const el = document.getElementById('recent-tx');
  if (!el || !DATA) return;
  const txs = DATA.transacoes.filter(t => t.status === 'confirmado').slice(0, 5);
  el.innerHTML = txs.map(t => txItem(t)).join('');
}

function txItem(t) {
  const isPos = t.valor > 0;
  const projected = t.status === 'projetado';
  const badge = t.parcelado
    ? `<span class="badge badge-ember">${t.parcela_atual}/${t.total_parcelas} parc.</span>`
    : isPos
      ? `<span class="badge badge-teal">entrada</span>`
      : `<span class="badge badge-slate">confirmado</span>`;
  const projBadge = projected ? `<span class="badge badge-slate">projetado</span>` : badge;
  return `
    <div class="tx-item ${projected ? 'tx-projected' : ''}">
      <div class="tx-icon" style="background:${t.cor}">${t.icon}</div>
      <div class="tx-info">
        <div class="tx-name">${t.descricao}</div>
        <div class="tx-meta">${fmtDate(t.data)} · ${t.categoria}${t.cartao ? ' · Cartão' : ' · Conta'}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${isPos ? 'pos' : 'neg'}">${isPos ? '+' : '−'} ${fmt(t.valor)}</div>
        <div style="margin-top:3px">${projBadge}</div>
      </div>
    </div>`;
}

// ─── CHAT ─────────────────────────────────────────────────
const CHAT_RESPONSES = {
  default: [
    "Entendido! Vou registrar isso para você. Pode confirmar o valor e a categoria?",
    "Registrado com sucesso! ✅ Deseja adicionar alguma observação?",
    "Feito! Lembrei também que você tem faturas vencendo em breve. Quer dar uma olhada?",
    "Anotado! Sua meta de reserva de emergência está em 53% — vamos continuar firme 💪"
  ],
  resumo: `Em maio você recebeu <strong>R$ 8.400</strong> e gastou <strong>R$ 5.230</strong> (competência).<br>Saldo disponível: <strong>R$ 3.170</strong>. Maiores gastos: Moradia (28%), Alimentação (22%) e Transporte (18%).`,
  parcelas: `Você tem <strong>3 parcelamentos ativos</strong> com débito futuro total de <strong>R$ 5.480</strong>.<br>Em junho: R$ 620 comprometidos (TV + Geladeira). 📅`,
  metas: `Você tem <strong>3 metas ativas</strong>:<br>🏖️ Fortaleza — 50% ✅<br>🚨 Reserva emergência — 53% ⚠️<br>🖥️ Servidor home — 50% 🟡`,
  saldo: `Seu saldo total em contas é de <strong>R$ 5.250,50</strong>.<br>BB: R$ 3.420 · Nubank: R$ 1.180 · Caixa: R$ 650.`,
  comprometimento: `Seu comprometimento atual é de <strong>62%</strong> da renda.<br>Isso inclui despesas fixas, parcelas e recorrências. O ideal é manter abaixo de 70%. 👍`,
};

function renderChat() {
  // Already rendered in HTML; just ensure input works
}

function sendChat(text) {
  const input = document.getElementById('chat-input');
  const msg = text || (input ? input.value.trim() : '');
  if (!msg) return;
  appendMsg(msg, 'user');
  if (input) input.value = '';

  setTimeout(() => {
    const low = msg.toLowerCase();
    let resp = CHAT_RESPONSES.default[Math.floor(Math.random() * CHAT_RESPONSES.default.length)];
    if (low.includes('resumo') || low.includes('mês') || low.includes('mes') || low.includes('gastei')) resp = CHAT_RESPONSES.resumo;
    else if (low.includes('parcela') || low.includes('parcelamento')) resp = CHAT_RESPONSES.parcelas;
    else if (low.includes('meta')) resp = CHAT_RESPONSES.metas;
    else if (low.includes('saldo') || low.includes('conta')) resp = CHAT_RESPONSES.saldo;
    else if (low.includes('comprometimento') || low.includes('renda')) resp = CHAT_RESPONSES.comprometimento;
    appendMsg(resp, 'agent');
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 700);
}

function appendMsg(text, type) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isUser = type === 'user';
  msgs.innerHTML += `
    <div class="msg ${type}">
      <div class="msg-av">${isUser ? (DATA?.usuario?.initials || 'EU') : '🤖'}</div>
      <div class="msg-body">
        <div class="msg-bubble">${text}</div>
        <div class="msg-time">${now}</div>
      </div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
}

// ─── HISTÓRICO ────────────────────────────────────────────
function renderHistorico() {
  const el = document.getElementById('historico-list');
  if (!el || !DATA) return;
  el.innerHTML = DATA.transacoes.map(t => txItem(t)).join('');
}

// ─── PARCELAMENTOS ────────────────────────────────────────
function renderParcelamentos() {
  if (!DATA) return;

  const totalDebito = DATA.parcelamentos.reduce((sum, p) => {
    return sum + (p.valor_parcela * (p.total_parcelas - p.parcela_atual));
  }, 0);
  setEl('parc-total-debito', fmt(totalDebito));
  setEl('parc-count', DATA.parcelamentos.length);

  const list = document.getElementById('parc-list');
  if (!list) return;
  list.innerHTML = DATA.parcelamentos.map(p => {
    const pagas = p.parcela_atual;
    const restantes = p.total_parcelas - pagas;
    const valorRestante = restantes * p.valor_parcela;
    const progPct = pct(pagas, p.total_parcelas);
    const fillClass = progPct >= 70 ? 'fill-teal' : progPct >= 40 ? 'fill-gold' : 'fill-ember';
    const statusColor = restantes <= 2 ? 'var(--teal)' : restantes <= 4 ? 'var(--gold)' : 'var(--ember)';
    return `
      <div class="inst-card">
        <div class="inst-top">
          <div>
            <div class="inst-name">${p.icon} ${p.nome}</div>
            <div class="inst-store">${p.loja} · ${p.categoria}</div>
          </div>
          <div>
            <div class="inst-amount">${fmt(p.valor_total)}</div>
            <div class="inst-remaining" style="color:${statusColor}">${fmt(valorRestante)} restante</div>
          </div>
        </div>
        <div class="inst-meta">
          <span>${pagas} de ${p.total_parcelas} parcelas pagas</span>
          <span>${fmt(p.valor_parcela)}/mês</span>
        </div>
        <div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${progPct}%"></div></div>
        <div class="text-xs text-muted mt-2">
          ${restantes <= 2 ? '✅ Quase lá! ' : ''}Quitação prevista: ${formatMonthYear(p.data_quitacao)}
        </div>
      </div>`;
  }).join('');

  // Calendar
  const cal = document.getElementById('parc-calendar');
  if (!cal) return;
  cal.innerHTML = DATA.calendario_parcelas.map(c => `
    <div class="cal-cell ${c.valor > 0 ? 'active' : ''}">
      <div class="cal-month">${c.mes}</div>
      <div class="cal-val ${c.valor === 0 ? 'zero' : ''}">${c.valor > 0 ? fmt(c.valor) : '—'}</div>
    </div>`).join('');
}

function formatMonthYear(str) {
  if (!str) return '';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// ─── FATURAS ──────────────────────────────────────────────
function renderFaturas() {
  if (!DATA) return;
  const upcoming = DATA.faturas.filter(f => f.status !== 'pago');
  const paid     = DATA.faturas.filter(f => f.status === 'pago');

  const totalVencer = upcoming.filter(f => f.status === 'a_vencer').reduce((s, f) => s + f.valor, 0);
  setEl('fat-vencer', fmt(totalVencer));

  const upEl = document.getElementById('faturas-upcoming');
  const pdEl = document.getElementById('faturas-paid');
  if (upEl) upEl.innerHTML = upcoming.map(f => invoiceItem(f)).join('');
  if (pdEl) pdEl.innerHTML = paid.map(f => invoiceItem(f)).join('');
}

function invoiceItem(f) {
  const d = new Date(f.vencimento + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const mon = d.toLocaleDateString('pt-BR', { month:'short' }).replace('.','');
  const statusMap = {
    a_vencer: ['badge-ember', 'A vencer'],
    projetado: ['badge-slate', 'Projetado'],
    pago: ['badge-teal', 'Pago ✓']
  };
  const [bClass, bLabel] = statusMap[f.status] || ['badge-slate', f.status];
  const borderStyle = f.status === 'a_vencer' ? 'border-color: var(--gold-l); background: var(--gold-l);' : '';
  return `
    <div class="invoice-item" style="${borderStyle}">
      <div class="invoice-date-box" style="${f.status === 'pago' ? 'background:var(--teal-l)' : f.status === 'a_vencer' ? 'background:var(--gold-l)' : ''}">
        <div class="invoice-day" style="${f.status === 'pago' ? 'color:var(--teal)' : f.status === 'a_vencer' ? 'color:var(--gold)' : ''}">${day}</div>
        <div class="invoice-mon">${mon}</div>
      </div>
      <div class="invoice-info">
        <div class="invoice-name">${f.nome}</div>
        <div class="invoice-desc">${f.transacoes.length} transação(ões) incluídas</div>
      </div>
      <div class="invoice-right">
        <div class="invoice-amount">${fmt(f.valor)}</div>
        <div style="margin-top:4px"><span class="badge ${bClass}">${bLabel}</span></div>
      </div>
    </div>`;
}

// ─── METAS ────────────────────────────────────────────────
function renderMetas() {
  if (!DATA) return;
  const el = document.getElementById('metas-list');
  if (!el) return;
  el.innerHTML = DATA.metas.map(m => {
    const p = pct(m.valor_atual, m.valor_meta);
    const fill = m.status === 'risco' ? 'fill-rose' : m.status === 'atencao' ? 'fill-gold' : 'fill-teal';
    const badge = m.status === 'risco'
      ? `<span class="badge badge-rose">em risco</span>`
      : m.status === 'atencao'
        ? `<span class="badge badge-ember">atenção</span>`
        : `<span class="badge badge-teal">no prazo</span>`;
    const alert = m.status === 'risco'
      ? `<div class="text-xs mt-2" style="color:var(--rose)">⚠️ Parcelas de junho comprometem este mês. Meta em risco.</div>`
      : '';
    return `
      <div class="goal-card">
        <div class="goal-top">
          <div class="goal-icon" style="background:${m.cor}">${m.icon}</div>
          <div style="flex:1">
            <div class="goal-name">${m.nome}</div>
            <div class="goal-deadline">Prazo: ${formatMonthYear(m.prazo)} · ${fmt(m.mensal)}/mês</div>
          </div>
          ${badge}
        </div>
        <div class="progress-track"><div class="progress-fill ${fill}" style="width:${p}%"></div></div>
        <div class="goal-amounts">
          <span class="text-sm" style="font-weight:600;color:${m.status === 'risco' ? 'var(--rose)' : 'var(--teal)'}">${fmt(m.valor_atual)} guardados</span>
          <span class="text-sm text-muted">Meta: ${fmt(m.valor_meta)}</span>
        </div>
        <div class="text-xs text-muted mt-2">${p}% concluído · faltam ${fmt(m.valor_meta - m.valor_atual)}</div>
        ${alert}
      </div>`;
  }).join('') + `
    <div class="goal-card" style="border-style:dashed;background:var(--paper);text-align:center;padding:24px;cursor:pointer"
         onclick="goTo('chat', document.querySelector('[data-screen=chat]'))">
      <div style="font-size:24px;margin-bottom:8px">🎯</div>
      <div style="font-size:14px;font-weight:500;color:var(--mist)">Adicionar nova meta</div>
      <div class="text-xs text-muted mt-2">Diga ao agente qual é seu objetivo</div>
    </div>`;
}

// ─── PLANO DE CONTAS ──────────────────────────────────────
function renderPlanoConta() {
  if (!DATA) return;
  const r = DATA.resumo_mensal;
  const el = document.getElementById('plano-tabela');
  if (!el) return;
  el.innerHTML = `
    <div class="plan-row"><span class="plan-label">Total de Receitas</span><span class="plan-val text-teal">${fmt(r.receitas)}</span></div>
    <div class="plan-row"><span class="plan-label sub">— Despesas Fixas</span><span class="plan-val">${fmt(r.despesas_fixas)}</span></div>
    <div class="plan-row"><span class="plan-label sub">— Parcelas / Financiamentos</span><span class="plan-val">${fmt(r.parcelas_futuras_6m / 6)}</span></div>
    <div class="plan-row"><span class="plan-label sub">— Despesas Variáveis</span><span class="plan-val">${fmt(r.despesas_variaveis)}</span></div>
    <div class="plan-row total"><span>Saldo Disponível</span><span class="plan-val">${fmt(r.saldo_disponivel)}</span></div>
    <div class="plan-row highlight"><span>Renda Livre Real</span><span class="plan-val text-teal">${fmt(r.renda_livre)}</span></div>
    <div class="plan-row"><span class="plan-label">Comprometimento da renda</span>
      <span>
        <span class="badge ${r.comprometimento_pct > 70 ? 'badge-rose' : 'badge-gold'}">${r.comprometimento_pct}%</span>
      </span>
    </div>`;
}

// ─── MODAL NOVO LANÇAMENTO ────────────────────────────────
function openLancamento() {
  const el = document.getElementById('modal-lancamento');
  if (el) el.classList.add('open');
}
function closeLancamento() {
  const el = document.getElementById('modal-lancamento');
  if (el) el.classList.remove('open');
}

// ─── TOGGLE DASHBOARD MODE ────────────────────────────────
function toggleDashMode(btn, mode) {
  document.querySelectorAll('.dash-toggle').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const r = DATA?.resumo_mensal;
  if (!r) return;
  const val = mode === 'caixa' ? r.despesas_caixa : r.despesas_competencia;
  const label = mode === 'caixa' ? 'Saída de caixa' : 'Gastos (competência)';
  setEl('dash-despesas', fmt(val));
  const labelEl = document.getElementById('dash-despesas-label');
  if (labelEl) labelEl.textContent = label;
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
