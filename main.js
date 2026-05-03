import { 
  createIcons, Zap, GraduationCap, Building2, Briefcase, 
  Landmark, Users, Check, AlertCircle, MessageSquare, 
  Highlighter, Box, Loader2, Lightbulb, TrendingUp, 
  HardHat, X, Send, MessageCircle, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, RefreshCw, Clock, AlertTriangle,
  CalendarClock, ChevronDown, ArrowDown, Terminal,
  Shield, ShieldOff, ShieldAlert
} from 'lucide';
import { PolicyOrchestrator } from './src/orchestrator.js';
import { bpService } from './src/browserpod_service.js';

// Initialize Lucide Icons
const iconSet = { 
  zap: Zap, 
  'graduation-cap': GraduationCap, 
  'building-2': Building2, 
  briefcase: Briefcase, 
  landmark: Landmark, 
  users: Users, 
  check: Check, 
  'alert-circle': AlertCircle, 
  'message-square': MessageSquare, 
  highlighter: Highlighter, 
  box: Box, 
  'loader-2': Loader2, 
  lightbulb: Lightbulb, 
  'trending-up': TrendingUp, 
  'hard-hat': HardHat,
  x: X,
  send: Send,
  'message-circle': MessageCircle,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'refresh-cw': RefreshCw,
  // Long-Term Consequences icons (NEW)
  clock: Clock,
  'alert-triangle': AlertTriangle,
  'calendar-clock': CalendarClock,
  'chevron-down': ChevronDown,
  'arrow-down': ArrowDown,
  terminal: Terminal,
  shield: Shield,
  'shield-off': ShieldOff,
  'shield-alert': ShieldAlert
};

const orchestrator = new PolicyOrchestrator();

// UI Elements
const policyInput = document.getElementById('policy-input');
const categorySelect = document.getElementById('policy-category');
const analyzeBtn = document.getElementById('analyze-btn');
const inputSection = document.getElementById('input-section');
const initialAnalysisSection = document.getElementById('initial-analysis');
const debateSection = document.getElementById('debate-section');
const resultsSection = document.getElementById('results-section');
const agentGrid = document.getElementById('agent-grid');
const startDebateBtn = document.getElementById('start-debate-btn');
const viewResultsBtn = document.getElementById('view-results-btn');
const debateTimeline = document.getElementById('debate-timeline');
const debateStatus = document.getElementById('debate-status');
const debateLoader = document.getElementById('debate-loader');
const highlightsContainer = document.getElementById('highlights-container');
const jumpToLatestBtn = document.getElementById('jump-to-latest-btn');
const newMessagesIndicator = document.getElementById('new-messages-indicator');
const exchangeList = document.getElementById('exchange-list');
const securitySection = document.getElementById('security-section');
const proceedToVerdictBtn = document.getElementById('proceed-to-verdict-btn');

// Chat UI Elements
const chatModal = document.getElementById('chat-modal');
const closeChatModalBtn = document.getElementById('close-chat-modal');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const activeChatName = document.getElementById('active-chat-name');
const activeChatAvatar = document.getElementById('active-chat-avatar');
const activeChatStatus = document.getElementById('active-chat-status');
const activeChatStats = document.getElementById('active-chat-stats');
const terminalContainer = document.getElementById('terminal-container');
const toggleTerminalBtn = document.getElementById('toggle-terminal');
const closeTerminalBtn = document.getElementById('close-terminal');

let activeVoiceId = null;

// Global Icon Initializer
const refreshIcons = () => createIcons({ icons: iconSet });

refreshIcons();

// BrowserPod Initialization
const podStatus = document.getElementById('pod-status');
const podStatusText = podStatus.querySelector('.status-text');

if (window.location.search.includes('portal=true')) {
  podStatus.classList.add('ready');
  podStatusText.textContent = "Running in Portal View";
  // In portal view, we use the app logic locally without a nested pod
  bpService.isReady = true;
  bpService.isFallback = true;
} else {
  bpService.initialize().then(() => {
    if (bpService.isFallback) {
      podStatus.classList.add('fallback');
      podStatusText.textContent = "Pod Offline (Local Mode)";
      podStatusText.style.color = 'var(--accent-orange)';
    } else {
      podStatus.classList.add('ready');
      podStatusText.textContent = "BrowserPod Online - Starting Portal...";
      // Automatically start the server once BrowserPod is ready
      bpService.startServer().catch(console.error);
    }
  }).catch(err => {
    console.error("Initialization error:", err);
    podStatusText.textContent = "Pod Offline (SharedArrayBuffer?)";
    podStatusText.style.color = 'var(--danger)';
  });
}

// Helper: Get Icon for Voice
const getIconForVoice = (v) => {
  const icons = { 
    student: 'graduation-cap', 
    employer: 'building-2', 
    small_business: 'briefcase', 
    government: 'landmark', 
    public: 'users',
    economist: 'trending-up',
    worker: 'hard-hat'
  };
  return icons[v] || 'users';
};

const AGENT_ROLES = {
  student: 'Student & Youth Representative',
  employer: 'Corporate Employer',
  small_business: 'Small Business Owner',
  government: 'Government & Policy',
  public: 'General Public',
  economist: 'Independent Economist',
  worker: 'Frontline Worker',
};

const STANCE_COLORS = {
  positive: 'var(--success)',
  negative: 'var(--danger)',
  mixed: 'var(--accent-orange)',
};

// ── Navigation ───────────────────────────────────────────────────────────────

const showSection = (sectionId) => {
  [inputSection, initialAnalysisSection, debateSection, securitySection, resultsSection].forEach(s => {
    if (s) s.classList.add('hidden');
  });
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('animate-in');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── Agent Cards ──────────────────────────────────────────────────────────────

const createAgentCard = (agent) => {
  const card = document.createElement('div');
  card.className = 'agent-card';
  card.onclick = () => openChatModal(agent.voice);

  const impactClass = agent.current_impact > 0 ? 'impact-positive' : agent.current_impact < 0 ? 'impact-negative' : 'impact-neutral';
  const role = AGENT_ROLES[agent.voice] || agent.voice;
  const stanceLabel = orchestrator.getStanceLabel(agent);
  const stanceColor = STANCE_COLORS[stanceLabel.toLowerCase()] || 'var(--text-muted)';

  card.innerHTML = `
    <div class="agent-header" style="display: flex; align-items: center; gap: 1.25rem;">
      <div class="agent-icon" style="background: ${stanceColor}22; border: 2px solid ${stanceColor}44; width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px ${stanceColor}22;">
        <i data-lucide="${getIconForVoice(agent.voice)}" style="color: ${stanceColor}; width: 32px; height: 32px;"></i>
      </div>
      <div class="agent-info" style="flex: 1;">
        <h3 style="font-family: 'Outfit'; font-size: 1.2rem; font-weight: 700; text-transform: capitalize; color: #fff; display: flex; align-items: center; gap: 0.6rem;">
          <i data-lucide="${getIconForVoice(agent.voice)}" style="width: 18px; height: 18px; color: ${stanceColor}; opacity: 0.8;"></i>
          ${role}
        </h3>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-top: 0.5rem;">
          <span class="impact-badge ${impactClass}" style="font-size: 0.7rem;">${agent.current_impact > 0 ? '+' : ''}${agent.current_impact} Impact</span>
          <span style="font-size: 0.75rem; color: ${stanceColor}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">● ${agent.stance}</span>
        </div>
      </div>
    </div>

    <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin-top: 0.5rem; border-left: 2px solid ${stanceColor}66; padding-left: 1rem; font-style: italic;">"${agent.summary}"</p>

    <div style="margin-top: auto; padding-top: 1rem;">
      <label style="font-size: 0.65rem; color: var(--primary); letter-spacing: 1.5px; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
        <i data-lucide="lightbulb" style="width: 12px;"></i> POSITION DRIVERS
      </label>
      <ul class="card-list">
        ${agent.benefits.slice(0, 2).map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-top: 1rem; padding-top: 1.25rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="zap" style="width: 12px;"></i> Logic Confidence
      </span>
      <span style="font-size: 1.5rem; font-weight: 800; color: var(--primary); font-family: 'Outfit';">${agent.confidence}%</span>
    </div>
  `;

  return card;
};

const renderAgentCards = (agents) => {
  agentGrid.innerHTML = '';
  agents.forEach(agent => agentGrid.appendChild(createAgentCard(agent)));
  refreshIcons();
};

// ── Debate Logic ─────────────────────────────────────────────────────────────

function buildDebateArena() {
  const existingList = document.getElementById('exchange-list');
  if (existingList) existingList.innerHTML = '';
  
  // Add/Update Arena Header
  let header = debateTimeline.querySelector('.arena-header');
  if (!header) {
    header = document.createElement('div');
    header.className = 'arena-header';
    debateTimeline.prepend(header);
  }
  
  header.innerHTML = `
    <div class="arena-side-label pro-label"><i data-lucide="check-circle"></i> PRO — In Favour</div>
    <div class="arena-side-label con-label"><i data-lucide="x-circle"></i> CON — Against</div>
  `;
  refreshIcons();
}

function bubbleHTML(msg, isPro) {
  if (!msg) return '<div style="flex:1;"></div>';
  const role  = AGENT_ROLES[msg.agent] || msg.agent.replace(/_/g, ' ');
  const icon  = getIconForVoice(msg.agent);
  const color = isPro ? 'var(--success)' : 'var(--danger)';
  return `
    <div class="debate-bubble-v2 ${isPro ? 'pro-bubble' : 'con-bubble'}">
      <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: ${color}; margin-bottom: 0.75rem;">
        <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
        <span>${role}</span>
      </div>
      <p class="bubble-text">${msg.message}</p>
    </div>
  `;
}

async function appendExchangePair(pair) {
  const row = document.createElement('div');
  row.className = 'exchange-row';
  row.innerHTML = `
    <div style="flex:1; display:flex;">${bubbleHTML(pair.pro, true)}</div>
    <div style="flex:1; display:flex;">${bubbleHTML(pair.con, false)}</div>
  `;
  const list = document.getElementById('exchange-list');
  if (list) {
    list.appendChild(row);
    refreshIcons();
    renderAgentCards(orchestrator.state.agents);
    
    // Auto-scroll logic (User controlled)
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200);
    if (!isAtBottom) {
      jumpToLatestBtn.classList.remove('hidden');
      newMessagesIndicator.classList.remove('hidden');
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }
}

const scrollToBottom = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  jumpToLatestBtn.classList.add('hidden');
  newMessagesIndicator.classList.add('hidden');
};

window.addEventListener('scroll', () => {
  const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 50);
  if (isAtBottom) {
    jumpToLatestBtn.classList.add('hidden');
    newMessagesIndicator.classList.add('hidden');
  }
});

if (jumpToLatestBtn) jumpToLatestBtn.onclick = scrollToBottom;

function insertRoundBanner(round) {
  const list = document.getElementById('exchange-list');
  if (!list) return;
  const banner = document.createElement('div');
  banner.style.textAlign = 'center';
  banner.style.margin = '2rem 0';
  banner.innerHTML = `<span style="font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; color: var(--text-muted); text-transform: uppercase;">Round ${round} · ${getRoundLabel(round)}</span>`;
  list.appendChild(banner);
}

const getRoundLabel = (round) => ['Opening Statements', 'Cross-Examination', 'Rebuttal & Negotiation', 'Final Verdicts'][round - 1] || `Round ${round}`;

// ── Chat Modal Logic ─────────────────────────────────────────────────────────

const openChatModal = (voiceId) => {
  activeVoiceId = voiceId;
  chatModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  selectChatAgent(voiceId);
};

const closeChatModal = () => {
  chatModal.classList.add('hidden');
  document.body.style.overflow = '';
};

const selectChatAgent = (voiceId) => {
  const agent = orchestrator.getAgent(voiceId);
  if (!agent) return;

  const role = AGENT_ROLES[voiceId] || voiceId;
  const stanceLabel = orchestrator.getStanceLabel(agent);
  const stanceColor = STANCE_COLORS[stanceLabel.toLowerCase()] || 'var(--text-muted)';
  const vote = agent.final_vote || 'Pending';

  activeChatName.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <i data-lucide="${getIconForVoice(voiceId)}" style="width: 24px; height: 24px; color: ${stanceColor};"></i>
      <span>${role}</span>
    </div>
  `;
  activeChatAvatar.innerHTML = `<i data-lucide="${getIconForVoice(voiceId)}" style="width: 32px; height: 32px; color: #fff;"></i>`;
  activeChatAvatar.style.background = stanceColor;
  activeChatAvatar.style.boxShadow = `0 0 30px ${stanceColor}44`;
  activeChatStatus.innerHTML = `<span style="background: ${stanceColor}22; color: ${stanceColor}; border: 1px solid ${stanceColor}44; padding: 0.25rem 0.75rem; border-radius: 2rem; font-weight: 800; font-size: 0.7rem; letter-spacing: 0.5px;">${stanceLabel.toUpperCase()}</span>`;
  activeChatStats.innerHTML = `
    <div style="text-align: right;">
      <label style="display:block; font-size: 0.6rem; color: var(--text-muted);">Impact</label>
      <span style="font-weight: 800; color: ${agent.current_impact > 0 ? 'var(--success)' : 'var(--danger)'}">${agent.current_impact > 0 ? '+' : ''}${agent.current_impact.toFixed(1)}</span>
    </div>
    <div style="text-align: right;">
      <label style="display:block; font-size: 0.6rem; color: var(--text-muted);">Status</label>
      <span style="font-weight: 800; color: var(--primary);">${vote}</span>
    </div>
  `;
  chatInput.value = '';
  chatInput.focus();
  renderChatMessages(voiceId);
  refreshIcons();
  
  // Trigger opening message if empty
  if (!orchestrator.state.chatHistory[voiceId] || orchestrator.state.chatHistory[voiceId].length === 0) {
    activeChatStatus.innerHTML = `<span style="background: var(--primary)22; color: var(--primary); border: 1px solid var(--primary)44; padding: 0.25rem 0.75rem; border-radius: 2rem; font-weight: 800; font-size: 0.7rem; letter-spacing: 0.5px; animation: pulse 2s infinite;">TYPING...</span>`;
    
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typing);
    
    orchestrator.getAgentOpening(voiceId).then(() => {
      renderChatMessages(voiceId);
    });
  }
};

const renderChatMessages = (voiceId) => {
  const history = orchestrator.state.chatHistory[voiceId] || [];
  chatMessages.innerHTML = '';

  if (history.length === 0) {
    chatMessages.innerHTML = `
      <div style="text-align: center; margin: auto; color: var(--text-muted);">
        <i data-lucide="message-square" style="width: 48px; height: 48px; opacity: 0.1; margin-bottom: 1rem;"></i>
        <p>Private consultation with ${AGENT_ROLES[voiceId].split(' ')[0]} enabled.</p>
      </div>
    `;
  } else {
    history.forEach(msg => {
      const div = document.createElement('div');
      div.className = `message ${msg.role}`;
      div.textContent = msg.content;
      chatMessages.appendChild(div);
    });
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
  refreshIcons();
};

const handleSendChat = async () => {
  const content = chatInput.value.trim();
  if (!content || !activeVoiceId) return;

  chatInput.value = '';
  if (!orchestrator.state.chatHistory[activeVoiceId]) orchestrator.state.chatHistory[activeVoiceId] = [];
  orchestrator.state.chatHistory[activeVoiceId].push({ role: 'user', content });
  renderChatMessages(activeVoiceId);

  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Show status as typing
  activeChatStatus.innerHTML = `<span style="background: var(--primary)22; color: var(--primary); border: 1px solid var(--primary)44; padding: 0.25rem 0.75rem; border-radius: 2rem; font-weight: 800; font-size: 0.7rem; letter-spacing: 0.5px; animation: pulse 2s infinite;">TYPING...</span>`;

  await orchestrator.sendChatMessage(activeVoiceId, content);
  renderChatMessages(activeVoiceId);
};

// ── Orchestration ────────────────────────────────────────────────────────────

const initializeDeliberation = async () => {
  const policy = policyInput.value.trim();
  if (!policy) return alert("Please enter a policy proposal.");

  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<div class="loader-glow"></div> Deliberating...';

  try {
    // Wait for Pod if it's still booting (with 10s timeout)
    if (!bpService.isReady) {
      analyzeBtn.innerHTML = '<div class="loader-glow"></div> Booting Pod...';
      const timeout = Date.now() + 10000;
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (bpService.isReady || Date.now() > timeout) { 
            clearInterval(check); 
            resolve(); 
          }
        }, 500);
      });
    }

    // Ensure we are ready, even if in fallback
    if (!bpService.isReady) {
      console.warn("Pod boot timed out, forcing fallback mode.");
      bpService.isReady = true;
      bpService.isFallback = true;
    }

    // Run a Pod task (Demonstration of BrowserPod Compute)
    analyzeBtn.innerHTML = '<div class="loader-glow"></div> Pod Analyzing...';
    await bpService.runTask('analyze', [policy, categorySelect.value]);

    const agents = await orchestrator.runInitialAnalysis(policy, categorySelect.value);
    renderAgentCards(agents);
    showSection('initial-analysis');
  } catch (err) {
    console.error(err);
    alert("Simulation failed. Check console for SharedArrayBuffer/Pod status.");
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i data-lucide="zap"></i> Initialize Deliberation';
    refreshIcons();
  }
};

const startDebate = async () => {
  showSection('debate-section');
  buildDebateArena();

  for (let r = 1; r <= 4; r++) {
    debateStatus.textContent = `Round ${r} of 4 — ${getRoundLabel(r)}`;
    debateLoader.classList.remove('hidden');
    await new Promise(res => setTimeout(res, 800));
    debateLoader.classList.add('hidden');
    insertRoundBanner(r);
    const { pairs } = await orchestrator.runDebateRound(r);
    for (const pair of pairs) {
      await appendExchangePair(pair);
      await new Promise(res => setTimeout(res, 1200));
    }
  }
  viewResultsBtn.classList.remove('hidden');
  refreshIcons();
};

const showSecurityAnalysis = async () => {
  showSection('security-section');
  const secData = await orchestrator.runSecurityAnalysis();
  renderSecurityAnalysis(secData);
};

const renderSecurityAnalysis = (data) => {
  const riskLevelEl = document.getElementById('security-risk-level');
  const riskFillEl = document.getElementById('security-risk-fill');
  const summaryEl = document.getElementById('security-summary');
  const threatsEl = document.getElementById('security-threats');
  const consequencesEl = document.getElementById('security-consequences');

  const riskLabels = {
    low: 'Safe to Proceed',
    medium: 'Moderate Risk',
    high: 'High Implementation Risk'
  };

  riskLevelEl.textContent = riskLabels[data.risk_level] || data.risk_level;
  riskLevelEl.style.color = data.risk_level === 'high' ? 'var(--danger)' : data.risk_level === 'medium' ? 'var(--accent-orange)' : 'var(--success)';
  
  riskFillEl.style.width = `${100 - data.risk_score}%`;
  riskFillEl.style.background = data.risk_level === 'high' ? 'var(--danger)' : data.risk_level === 'medium' ? 'var(--accent-orange)' : 'var(--success)';

  summaryEl.textContent = data.summary;
  threatsEl.innerHTML = data.top_threats.map(t => `<li>${t}</li>`).join('');
  
  consequencesEl.innerHTML = data.long_term_consequences.map(c => `
    <div class="consequence-item" style="padding: 1.25rem; background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.15); border-radius: 1.25rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
      <i data-lucide="shield-alert" style="width:12px; margin-bottom: 0.5rem; display:block; color: var(--accent-orange);"></i>
      ${c}
    </div>
  `).join('');

  // Vulnerabilities
  document.getElementById('vulnerability-list').innerHTML = data.vulnerabilities.map(v => `
    <div class="v-item">
      <div class="v-name">${v.name}</div>
      <div class="v-risk" style="background: ${v.risk === 'High' ? 'var(--danger)' : v.risk === 'Medium' ? 'var(--accent-orange)' : 'var(--success)'}">${v.risk}</div>
    </div>
  `).join('');

  // Mitigations
  document.getElementById('mitigation-body').innerHTML = data.mitigations.map(m => `
    <tr>
      <td style="font-weight:700;">${m.step}</td>
      <td>${m.effort}</td>
      <td style="color:var(--primary); font-weight:800;">${m.benefit}</td>
    </tr>
  `).join('');

  // Compliance
  const gdpr = document.getElementById('comp-gdpr');
  const nist = document.getElementById('comp-nist');
  const iso = document.getElementById('comp-iso');

  gdpr.textContent = data.compliance.gdpr;
  gdpr.className = `comp-status ${data.compliance.gdpr === 'Pass' ? '' : 'warn'}`;
  
  nist.textContent = data.compliance.nist;
  nist.className = `comp-status ${data.compliance.nist === 'Aligned' ? '' : 'warn'}`;

  iso.textContent = data.compliance.iso27001;
  iso.className = `comp-status ${data.compliance.iso27001 === 'Certified' ? '' : 'fail'}`;

  refreshIcons();
};



const showFinalVerdict = async () => {
  showSection('results-section');
  await orchestrator.runVoting();
  const finalData = await orchestrator.finalizeVerdict();
  
  document.getElementById('core-pivot').textContent = orchestrator.state.keyPivot;
  document.getElementById('overall-rating').textContent = finalData.verdict.overall_rating;
  document.getElementById('avg-score').textContent = finalData.verdict.average_score;
  const whoBenefits = finalData.verdict.who_benefits_most;
  const beneficiaryVoice = orchestrator.state.agents.find(a => AGENT_ROLES[a.voice].includes(whoBenefits.split(' ')[0]))?.voice || 'users';
  const stanceColor = STANCE_COLORS[orchestrator.getStanceLabel(orchestrator.getAgent(beneficiaryVoice)).toLowerCase()] || 'var(--primary)';

  document.getElementById('who-benefits').innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
      <i data-lucide="${getIconForVoice(beneficiaryVoice)}" style="width: 24px; color: ${stanceColor};"></i>
      <span>${whoBenefits}</span>
    </div>
  `;
  document.getElementById('final-recommendation').textContent = finalData.verdict.final_recommendation;
  
  highlightsContainer.innerHTML = finalData.highlights.map(h => `
    <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 1.5rem; border: 1px solid var(--glass-border); display: flex; gap: 1rem;">
      <i data-lucide="lightbulb" style="color: var(--accent-orange); flex-shrink: 0;"></i>
      <span style="font-size: 0.95rem; color: var(--text-muted);">${h.text}</span>
    </div>
  `).join('');

  // Render Long-Term Consequences panel (NEW)
  if (finalData.longTermData) {
    renderLongTermPanel(finalData.longTermData);
  }
  
  refreshIcons();
};

// ── Event Listeners ──────────────────────────────────────────────────────────

analyzeBtn.onclick = initializeDeliberation;
startDebateBtn.onclick = startDebate;
viewResultsBtn.onclick = showSecurityAnalysis;
proceedToVerdictBtn.onclick = showFinalVerdict;
sendChatBtn.onclick = handleSendChat;
closeChatModalBtn.onclick = closeChatModal;

chatInput.onkeypress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendChat();
  }
};

document.querySelectorAll('.back-to-input').forEach(b => b.onclick = () => showSection('input-section'));
document.querySelectorAll('.back-to-initial').forEach(b => b.onclick = () => showSection('initial-analysis'));
document.querySelectorAll('.back-to-debate').forEach(b => b.onclick = () => showSection('debate-section'));

// Terminal Handlers
if (toggleTerminalBtn) toggleTerminalBtn.onclick = () => terminalContainer.classList.toggle('hidden');
if (closeTerminalBtn) closeTerminalBtn.onclick = () => terminalContainer.classList.add('hidden');

// ── Portal Modal Logic ────────────────────────────────────────────────────────

const portalModal = document.getElementById('portal-modal');
const openPortalBtn = document.getElementById('open-portal-btn');
const closePortalModalBtn = document.getElementById('close-portal-modal');
const launchPortalBtn = document.getElementById('launch-portal-btn');
const portalUrlDiv = document.getElementById('portal-url');
const portalIframe = document.getElementById('portal-iframe');

// Register the portal callback from BrowserPod
bpService.onPortalCallback = ({ url, port }) => {
  const portalPreviewUrl = url + "?portal=true";
  portalUrlDiv.innerHTML = `Running on internal port ${port}. Preview: <a href="${url}" target="_blank" style="color: var(--primary); text-decoration: underline;">${url}</a>`;
  portalIframe.src = portalPreviewUrl;
  if (launchPortalBtn) launchPortalBtn.style.display = 'none';
  
  // Automatically open the portal modal
  openPortalModal();
  
  refreshIcons();
};

const openPortalModal = () => {
  portalModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closePortalModal = () => {
  portalModal.classList.add('hidden');
  document.body.style.overflow = '';
};

if (openPortalBtn) openPortalBtn.onclick = openPortalModal;
if (closePortalModalBtn) closePortalModalBtn.onclick = closePortalModal;

if (launchPortalBtn) {
  launchPortalBtn.onclick = async () => {
    launchPortalBtn.innerHTML = '<div class="loader-glow"></div> Starting...';
    launchPortalBtn.disabled = true;
    try {
      await bpService.startServer();
    } catch (err) {
      console.error(err);
      launchPortalBtn.innerHTML = 'Failed to start';
      launchPortalBtn.style.background = 'var(--danger)';
    }
  };
}

// Close modal on background click
portalModal.onclick = (e) => { if (e.target === portalModal) closePortalModal(); };
chatModal.onclick = (e) => { if (e.target === chatModal) closeChatModal(); };

// ── Long-Term Consequences Panel ──────────────────────────────────────────────

/**
 * renderLongTermPanel
 * Generates the three-column consequence timeline from orchestrator data.
 * Called after finalizeVerdict() returns longTermData.
 */
const renderLongTermPanel = (data) => {
  const panel = document.getElementById('long-term-panel');
  if (!panel) return;

  const SENTIMENT_CONFIG = {
    positive: { color: 'var(--accent-teal)',   bg: 'rgba(45, 212, 191, 0.08)', border: 'rgba(45, 212, 191, 0.2)', dot: '#2dd4bf' },
    negative: { color: 'var(--danger)',         bg: 'rgba(244, 63, 94, 0.08)',  border: 'rgba(244, 63, 94, 0.2)',  dot: '#f43f5e' },
    mixed:    { color: 'var(--accent-orange)',  bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.2)', dot: '#fbbf24' },
  };

  const itemHTML = (item) => {
    const cfg = SENTIMENT_CONFIG[item.sentiment] || SENTIMENT_CONFIG.mixed;
    return `
      <div class="lt-item" style="border-left: 3px solid ${cfg.dot}; background: ${cfg.bg}; border-top: 1px solid ${cfg.border}; border-right: 1px solid ${cfg.border}; border-bottom: 1px solid ${cfg.border};">
        <div class="lt-item-header">
          <i data-lucide="${item.icon}" style="width: 14px; height: 14px; color: ${cfg.color}; flex-shrink: 0;"></i>
          <span class="lt-item-label" style="color: ${cfg.color};">${item.label}</span>
        </div>
        <p class="lt-item-desc">${item.description}</p>
      </div>
    `;
  };

  const phases = [
    { key: 'immediate', title: 'Immediate',  timeLabel: '0 – 12 Months', pillClass: 'immediate-pill', items: data.immediate },
    { key: 'midTerm',   title: 'Mid-Term',   timeLabel: '1 – 5 Years',   pillClass: 'midterm-pill',   items: data.midTerm   },
    { key: 'longTerm',  title: 'Long-Term',  timeLabel: '5+ Years',      pillClass: 'longterm-pill',  items: data.longTerm  },
  ];

  panel.innerHTML = `
    <div class="lt-timeline">
      ${phases.map((phase, idx) => `
        <div class="lt-phase ${phase.pillClass}-phase">
          <div class="lt-phase-header">
            <div class="lt-phase-dot ${phase.pillClass}-dot"></div>
            <div>
              <div class="lt-phase-name">${phase.title}</div>
              <div class="lt-phase-time">${phase.timeLabel}</div>
            </div>
          </div>
          <div class="lt-phase-items">
            ${(phase.items || []).map(item => itemHTML(item)).join('')}
          </div>
        </div>
        ${idx < phases.length - 1 ? '<div class="lt-phase-bridge"></div>' : ''}
      `).join('')}
    </div>
  `;

  refreshIcons();
};

// Long-Term Toggle Handler
const ltToggleBtn   = document.getElementById('lt-toggle-btn');
const ltToggleIcon  = document.getElementById('lt-toggle-icon');
const ltToggleLabel = document.getElementById('lt-toggle-label');
const ltPanel       = document.getElementById('long-term-panel');

if (ltToggleBtn) {
  ltToggleBtn.onclick = () => {
    const isOpen = ltPanel && !ltPanel.classList.contains('hidden');
    if (isOpen) {
      ltPanel.classList.add('hidden');
      ltPanel.classList.remove('lt-panel-open');
      ltToggleBtn.setAttribute('aria-expanded', 'false');
      ltToggleLabel.textContent = 'Explore Timeline';
      // Rotate icon back to right-facing chevron
      if (ltToggleIcon) {
        ltToggleIcon.style.transform = 'rotate(0deg)';
      }
    } else {
      ltPanel.classList.remove('hidden');
      ltPanel.classList.add('lt-panel-open');
      ltToggleBtn.setAttribute('aria-expanded', 'true');
      ltToggleLabel.textContent = 'Collapse';
      if (ltToggleIcon) {
        ltToggleIcon.style.transform = 'rotate(90deg)';
      }
      // Scroll panel into view smoothly
      ltPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };
}
