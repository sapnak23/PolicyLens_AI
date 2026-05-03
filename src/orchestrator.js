import { analyzeAsStudent, studentDebate } from './agents/studentAgent.js';
import { analyzeAsEmployer, employerDebate } from './agents/employerAgent.js';
import { analyzeAsSmallBusiness, smallBusinessDebate } from './agents/smallBusinessAgent.js';
import { analyzeAsGovernment, governmentDebate } from './agents/governmentAgent.js';
import { analyzeAsPublic, publicDebate } from './agents/publicAgent.js';
import { analyzeAsEconomist, economistDebate } from './agents/economistAgent.js';
import { analyzeAsWorker, workerDebate } from './agents/workerAgent.js';
import { synthesizeResults } from './engine/synthesisEngine.js';
import { KnowledgeEngine } from './engine/knowledgeEngine.js';
import { analyzeSecurity } from './agents/securityAgent.js';

// Map each voice ID to its own debate voice function
const DEBATE_VOICES = {
  student:      studentDebate,
  employer:     employerDebate,
  small_business: smallBusinessDebate,
  government:   governmentDebate,
  public:       publicDebate,
  economist:    economistDebate,
  worker:       workerDebate,
};


export class PolicyOrchestrator {
  constructor() {
    this.knowledge = new KnowledgeEngine();
    this.state = {
      policy: '',
      category: '',
      agents: [],
      debateHistory: [],
      highlights: [],
      keyPivot: '',
      voteResult: null,
      finalVerdict: null,
      longTermData: null,   // NEW: three-phase temporal projections
      currentStep: 'input',
      chatHistory: {}, // Stores { voiceId: [{role, content}] }
      securityAnalysis: null // NEW: Security evaluation result
    };
  }
  getAgent(voiceId) {
    return this.state.agents.find(a => a.voice === voiceId);
  }

  getStanceLabel(agent) {
    if (!agent || !agent.stance) return 'Mixed';
    const s = agent.stance.toLowerCase();
    const mapping = {
      'positive': 'Positive',
      'support': 'Positive',
      'negative': 'Negative',
      'oppose': 'Negative',
      'mixed': 'Mixed',
      'conditional_support': 'Mixed',
      'uncertain': 'Mixed'
    };
    return mapping[s] || 'Mixed';
  }

  async sendChatMessage(voiceId, content) {
    const agent = this.getAgent(voiceId);
    if (!agent) return "Representative not found.";

    if (!this.state.chatHistory[voiceId]) this.state.chatHistory[voiceId] = [];
    
    // Generate agent response
    const response = await this.generateAgentResponse(agent, content);

    // Add agent response
    this.state.chatHistory[voiceId].push({ role: 'agent', content: response });

    return response;
  }

  async getAgentOpening(voiceId) {
    const agent = this.getAgent(voiceId);
    if (!agent) return "Hello.";
    
    if (!this.state.chatHistory[voiceId]) this.state.chatHistory[voiceId] = [];
    if (this.state.chatHistory[voiceId].length > 0) return null; // Already started

    const response = await this.generateAgentResponse(agent, "init_opening");
    this.state.chatHistory[voiceId].push({ role: 'agent', content: response });
    return response;
  }

  async generateAgentResponse(agent, userMessage) {
    const policy = this.state.policy;
    const vote = agent.final_vote || 'Pending';
    const stance = this.getStanceLabel(agent);
    const history = this.state.chatHistory[agent.voice] || [];
    const msg = userMessage.toLowerCase();
    
    // 1. Fetch Context from Knowledge Engine
    const liveTopic = policy.includes('wage') ? 'wages' : policy.includes('rent') ? 'housing' : 'general';
    const liveContext = this.knowledge.getLiveInternetContext(liveTopic);
    const pastContext = this.knowledge.getRelevantHistory(policy);

    // 2. Persona Base
    const personas = {
      student: {
        voice: "Student",
        tone: "passionate and direct",
        principles: ["affordability", "future security", "cost of living"],
        catchphrases: ["Let's be real", "From where I'm standing", "My generation is already squeezed"],
      },
      employer: {
        voice: "Employer",
        tone: "analytical and bottom-line focused",
        principles: ["margins", "headcount", "operational reality"],
        catchphrases: ["Looking at the arithmetic", "We have to consider the margins", "The operational reality is"],
      },
      small_business: {
        voice: "Small Business Owner",
        tone: "blunt and survival-focused",
        principles: ["cash flow", "regulation", "local community"],
        catchphrases: ["I don't have a safety net", "Small firms are different", "We're on the front lines"],
      },
      government: {
        voice: "Government Advisor",
        tone: "institutional and cautious",
        principles: ["fiscal risk", "implementation", "public finance"],
        catchphrases: ["From a policy standpoint", "The treasury view is", "We must govern for all"],
      },
      public: {
        voice: "Public Advocate",
        tone: "empathetic and fairness-focused",
        principles: ["equality", "social justice", "transparency"],
        catchphrases: ["Is this fair?", "Think about the average family", "We value social equity"],
      },
      economist: {
        voice: "Economist",
        tone: "objective and data-driven",
        principles: ["incentives", "market efficiency", "inflation"],
        catchphrases: ["The dynamic model shows", "Consider the incentives", "Statistically speaking"],
      },
      worker: {
        voice: "Worker Representative",
        tone: "grounded and security-focused",
        principles: ["real wages", "dignity", "job safety"],
        catchphrases: ["At the coalface", "It's about our paychecks", "We want security, not promises"],
      }
    };

    const p = personas[agent.voice] || personas.public;
    const catchphrase = p.catchphrases[Math.floor(Math.random() * p.catchphrases.length)];

    // 3. Simulated Thinking Delay (Adaptive)
    const delay = Math.min(2500, 800 + (msg.length * 5));
    await new Promise(resolve => setTimeout(resolve, delay));

    // 4. Initial Opening Strategy
    if (msg === "init_opening") {
      let response = `${catchphrase}, I have some strong views here. ${pastContext ? pastContext + ' ' : ''}`;
      response += `As a ${p.voice}, my priority is ${p.principles[0]}. Based on "${policy}", I'm currently leaning ${stance}. `;
      response += `I'm seeing live reports that ${liveContext.toLowerCase()} — which only reinforces my position. What part of my stance concerns you most?`;
      return response;
    }

    // 5. Intent Classification & Response Generation
    
    // A. The "Why" / Reasoning Intent
    if (/\b(why|reason|explain|logic|understand|basis)\b/.test(msg)) {
      const impactText = agent.current_impact > 2 ? "extremely positive" : agent.current_impact < -2 ? "very damaging" : "mixed";
      return `${catchphrase}. The math is simple: I see this as ${impactText} for my interests. Specifically, ${p.principles.join(' and ')} are at stake. ${liveContext} Does that help you understand my ${stance} stance?`;
    }

    // B. The "Challenge" / Disagreement Intent
    if (/\b(wrong|disagree|challenge|incorrect|but|however|mistake|lie)\b/.test(msg)) {
      return `I appreciate the pushback, but you're missing the ${p.tone} reality. ${catchphrase}, if we ignore the impact on ${p.principles[1]}, the whole thing collapses. How do you reconcile "${policy}" with the fact that ${liveContext.toLowerCase()}?`;
    }

    // C. The "Modification" / 'What If' Intent
    if (/\b(change|modify|if i|what if|better|improvement|add|remove|fix)\b/.test(msg)) {
      const suggest = agent.voice === 'employer' ? 'tax offsets' : agent.voice === 'student' ? 'rent caps' : 'direct subsidies';
      return `That's an interesting pivot. ${catchphrase}, if you added ${suggest}, my ${stance} vote might soften. But as it stands, "${policy}" doesn't do enough to protect ${p.principles[0]}. What exactly would you change first?`;
    }

    // D. The "Trade-off" Intent
    if (/\b(trade-off|compromise|balance|middle ground|fairness)\b/.test(msg)) {
      return `Balance is a nice word, but ${p.voice}s usually end up on the losing side of 'balance'. ${catchphrase}, if you want my support, you have to show me how ${p.principles[2]} isn't being sacrificed for ${this.state.keyPivot || 'political optics'}.`;
    }

    // E. Specific Keyword Response (Dynamic)
    const keywords = ['money', 'cost', 'future', 'risk', 'benefit', 'people', 'business', 'environment'];
    const matched = keywords.find(k => msg.includes(k));
    if (matched) {
      return `${catchphrase}. You mentioned ${matched}. For a ${p.voice}, ${matched} is inextricably linked to ${p.principles[Math.floor(Math.random() * p.principles.length)]}. That's why I'm ${stance}. What's your take on the ${matched} aspect?`;
    }

    // F. Fallback / Conversational
    const responses = [
      `That's a fair point to raise. ${catchphrase}, I'm looking at "${policy}" through a ${p.tone} lens. How do you think my peers would react to that?`,
      `Interesting. ${liveContext} In light of that, do you still think my ${stance} position is unjustified?`,
      `${catchphrase}, I'm focused on ${p.principles[0]}. If we can't solve that, the rest is noise. What are your thoughts on the ${p.principles[0]} impact?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async runInitialAnalysis(policy, category) {
    this.state.policy = policy;
    this.state.category = category;
    this.state.currentStep = 'initial';

    const baseAgents = [
      analyzeAsStudent(policy, category),
      analyzeAsEmployer(policy, category),
      analyzeAsSmallBusiness(policy, category),
      analyzeAsGovernment(policy, category),
      analyzeAsPublic(policy, category),
      analyzeAsEconomist(policy, category),
      analyzeAsWorker(policy, category)
    ];

    // Each agent already has its own independent scoring from its own parser.
    // We just add tracking fields here.
    this.state.agents = baseAgents.map(agent => ({
      ...agent,
      history: [],
      changed_position: false,
      current_stance: agent.stance,
      current_impact: agent.impact_score
    }));

    return this.state.agents;
  }

  async runDebateRound(roundNumber) {
    this.state.currentStep = 'debate';

    let proAgents = this.state.agents.filter(a => a.current_impact > 0);
    let conAgents  = this.state.agents.filter(a => a.current_impact <= 0);

    // Safety: if everyone lands on one side, split by median score
    if (proAgents.length === 0 || conAgents.length === 0) {
      const sorted = [...this.state.agents].sort((a, b) => b.current_impact - a.current_impact);
      const mid = Math.ceil(sorted.length / 2);
      proAgents = sorted.slice(0, mid);
      conAgents  = sorted.slice(mid);
    }

    // Generate PRO side first — then pass their key point to CON for direct rebuttal
    const proMessages = proAgents.map(a => {
      const oldStance = this.getStanceLabel(a);
      const result = this.generateDetailedDebateMessage(a, roundNumber, null);
      if (result.impactShift) a.current_impact = Math.max(-5, Math.min(5, a.current_impact + result.impactShift));
      
      const newStance = this.getStanceLabel(a);
      if (oldStance !== newStance) a.changed_position = true;
      
      a.strongest_argument = result.text;
      return { agent: a.voice, message: result.text, side: 'pro', round: roundNumber };
    });

    // CON agents receive the first PRO statement as "what they're responding to"
    const proContext = proMessages[0] ? proMessages[0].message : null;
    const conMessages = conAgents.map(a => {
      const oldStance = this.getStanceLabel(a);
      const result = this.generateDetailedDebateMessage(a, roundNumber, proContext);
      if (result.impactShift) a.current_impact = Math.max(-5, Math.min(5, a.current_impact + result.impactShift));
      
      const newStance = this.getStanceLabel(a);
      if (oldStance !== newStance) a.changed_position = true;

      a.strongest_argument = result.text;
      return { agent: a.voice, message: result.text, side: 'con', round: roundNumber };
    });

    // Pair them up — longest side determines row count
    const maxLen = Math.max(proMessages.length, conMessages.length);
    const pairs = [];
    for (let i = 0; i < maxLen; i++) {
      pairs.push({ pro: proMessages[i] || null, con: conMessages[i] || null });
    }

    this.state.debateHistory.push(...proMessages, ...conMessages);
    return { pairs, round: roundNumber };
  }

  /**
   * Dispatches to each agent's own debate voice function.
   * Each voice has a completely different personality, vocabulary, and argument style.
   */
  generateDetailedDebateMessage(agent, round, proContext = null) {
    const policy   = this.state.policy;
    const pLow     = policy.toLowerCase();
    const isNonsense = pLow.length < 8 || /\b(nonsense|delete all|infinite|garbage|test123)\b/.test(pLow);

    if (isNonsense) {
      return { text: round % 2 === 1
        ? `"${policy}" has no coherent structure or evidence — terminal rejection.`
        : `I urge every perspective to reject this. No mechanism, no logic, no credible case.`,
        impactShift: -1 };
    }

    const otherAgents  = this.state.agents.filter(a => a.voice !== agent.voice);
    const opponents    = otherAgents.filter(a => (a.current_impact > 0) !== (agent.current_impact > 0));
    const allies       = otherAgents.filter(a => (a.current_impact > 0) === (agent.current_impact > 0) && a.voice !== agent.voice);
    const opponentRole = opponents[0] ? opponents[0].voice.replace(/_/g, ' ') : 'other perspectives';
    const allyRole     = allies[0]    ? allies[0].voice.replace(/_/g, ' ')    : 'fellow voices';
    const isPos        = agent.current_impact > 0;

    // Call each agent's own unique debate voice
    const voiceFn = DEBATE_VOICES[agent.voice];
    const text = voiceFn
      ? voiceFn(round, policy, proContext, opponentRole, allyRole, isPos)
      : `My position on "${policy}": ${isPos ? 'support' : 'oppose'}.`;

    let impactShift = 0;
    if (round === 3) impactShift = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);

    return { text, impactShift };
  }

  async runVoting() {
    this.state.currentStep = 'voting';
    this.state.agents.forEach(agent => {
      let vote = 'Implement';
      if (agent.current_impact <= -2) vote = 'Reject';
      else if (agent.current_impact < 2) vote = 'Implement with conditions';

      agent.final_vote = vote;
      agent.vote_reason = `After 4 rounds deliberating "${this.state.policy}", my impact score of ${agent.current_impact.toFixed(1)} leads me to: ${vote}.`;
    });

    const votes = this.state.agents.map(a => a.final_vote);
    const counts = { Implement: 0, Reject: 0, 'Implement with conditions': 0 };
    votes.forEach(v => counts[v]++);

    this.state.voteResult = {
      counts,
      summary: counts.Implement + counts['Implement with conditions'] > 4 ? 'Broad Support (with conditions)' : 'Deeply Contested'
    };

    return this.state.agents;
  }

  async runSecurityAnalysis() {
    this.state.securityAnalysis = analyzeSecurity(this.state.policy, this.state.category);
    return this.state.securityAnalysis;
  }

  async finalizeVerdict() {
    this.state.currentStep = 'final';
    
    // Ensure voting has occurred
    if (!this.state.voteResult) {
      await this.runVoting();
    }

    // Ensure security analysis has occurred
    if (!this.state.securityAnalysis) {
      await this.runSecurityAnalysis();
    }

    this.state.finalVerdict = synthesizeResults(this.state.agents, this.state.policy);

    // Merge Security Risk into Final Recommendation (User-Friendly Advisory)
    const sec = this.state.securityAnalysis;
    if (sec.risk_level === 'high') {
      this.state.finalVerdict.final_recommendation = `⚠️ TECHNICAL BLOCKER: While the stakeholder deliberation shows merit, we have a major security hurdle. "${this.state.policy}" carries significant security baggage—specifically around ${sec.top_threats[0].toLowerCase()}. We'd suggest pausing implementation until the underlying architecture is much more resilient. ` + this.state.finalVerdict.final_recommendation;
    } else if (sec.risk_level === 'medium') {
      this.state.finalVerdict.final_recommendation += ` One final note: implementation is feasible, but the technical team needs to prioritize securing the ${sec.top_threats[0].toLowerCase()} risks identified in our audit. It's manageable, but it shouldn't be an afterthought.`;
    }

    // Key pivot derived from the actual policy text
    const p = this.state.policy.toLowerCase();
    const pivotOptions =
      p.includes('wage') || p.includes('pay')     ? ['Wage Justice', 'Labor Market Shift', 'Income Inequality', 'Pay Floor Debate']
      : p.includes('rent') || p.includes('hous')  ? ['Housing Security', 'Tenant Rights', 'Rent Crisis', 'Urban Affordability']
      : p.includes('carbon') || p.includes('clim')? ['Climate Urgency', 'Carbon Cost', 'Green Transition', 'Net Zero Delivery']
      : p.includes('tax')                          ? ['Fiscal Trade-off', 'Tax Burden', 'Revenue Debate', 'Investment Signal']
      : p.includes('nhs') || p.includes('health') ? ['NHS Survival', 'Healthcare Access', 'Care Crisis', 'Health Investment']
      : p.includes('school') || p.includes('educ')? ['Education Access', 'Skills Gap', 'Learning Equity', 'Human Capital']
      : ['Policy Tension', 'Systemic Change', 'Social Trade-off', 'Reform Debate'];

    this.state.keyPivot = pivotOptions[Math.floor(Math.random() * pivotOptions.length)];

    // Highlights derived from actual debate outcomes
    const highlights = [];
    const changed      = this.state.agents.filter(a => a.changed_position);
    const positive     = this.state.agents.filter(a => a.current_impact > 2);
    const negative     = this.state.agents.filter(a => a.current_impact < -2);
    const broadSupport = this.state.voteResult.counts.Implement + this.state.voteResult.counts['Implement with conditions'] > 5;

    highlights.push({
      type: 'agreement',
      text: broadSupport
        ? `The consensus leans toward 'yes', but it's a cautious one. The room agrees that "${this.state.policy}" is worth the attempt, provided we don't ignore the very real implementation hurdles identified.`
        : `We're looking at a deeply fractured room. There's no clear consensus on "${this.state.policy}" yet—the benefits are too concentrated and the risks are too systemic for a simple sign-off.`
    });

    if (negative.length > 0) {
      highlights.push({
        type: 'conflict',
        text: `The ${negative.map(a => a.voice.replace(/_/g, ' ')).join(' and ')} are the primary friction points. For them, this isn't just a policy debate; it's a question of operational survival.`
      });
    } else {
      highlights.push({
        type: 'conflict',
        text: `While the overall mood is positive, a quiet tension remains between the immediate 'sticker shock' of implementation and the promise of future systemic gains.`
      });
    }

    if (positive.length > 0 && negative.length > 0) {
      highlights.push({
        type: 'trade-off',
        text: `The simulation exposed a stark reality: the "${this.state.policy}" proposal essentially moves the needle for the ${positive[0].voice.replace(/_/g, ' ')} by pulling it away from the ${negative[0].voice.replace(/_/g, ' ')}.`
      });
    } else {
      highlights.push({
        type: 'trade-off',
        text: `The fundamental trade-off is one of timing. Are we willing to accept the certainty of current pain for the probability of a better long-term outcome? The room is still weighing that.`
      });
    }

    if (changed.length > 0) {
      highlights.push({
        type: 'outcome',
        text: `The debate actually moved the needle. We saw ${changed.length} stakeholder(s) reconsider their stance after hearing the opposing side—proving that this proposal is still 'pliable' if the right concessions are made.`
      });
    } else {
      highlights.push({
        type: 'outcome',
        text: `Positions hardened rather than softened. This suggests the interests involved are too structurally divergent for a compromise—you may need a completely different instrument to find middle ground.`
      });
    }

    this.state.highlights = highlights;

    // Generate long-term temporal projections (NEW)
    this.state.longTermData = this.generateLongTermProjections();

    // Save to memory for future deliberations
    this.knowledge.saveSession(this.state.policy, this.state.category, this.state.finalVerdict);

    return {
      verdict: this.state.finalVerdict,
      highlights: this.state.highlights,
      voteResult: this.state.voteResult,
      longTermData: this.state.longTermData,
      securityAnalysis: this.state.securityAnalysis // NEW
    };
  }

  /**
   * NEW: generateLongTermProjections
   * Derives three time-horizon consequence buckets from existing agent data.
   * Immediate (0-12mo), Mid-Term (1-5yr), Long-Term (5yr+).
   * Purely deterministic — no new API calls.
   */
  generateLongTermProjections() {
    const agents   = this.state.agents;
    const policy   = this.state.policy;
    const p        = policy.toLowerCase();
    const avgScore = agents.reduce((s, a) => s + a.current_impact, 0) / agents.length;
    const positive = agents.filter(a => a.current_impact > 1);
    const negative = agents.filter(a => a.current_impact < -1);
    const changed  = agents.filter(a => a.changed_position);

    // ── Helper: pick a sentiment string from score ──────────────────────────
    const sentiment = (score) => score > 1.5 ? 'positive' : score < -1.5 ? 'negative' : 'mixed';

    // ── IMMEDIATE CONSEQUENCES (0 – 12 months) ───────────────────────────────
    const immediate = [];

    // Operational/economic shock
    if (negative.length > 0) {
      immediate.push({
        label: 'Implementation Shock',
        description: `${negative.map(a => a.voice.replace(/_/g, ' ')).join(', ')} face direct cost pressure within the first year — expect resistance, legal challenge, or compliance delays.`,
        sentiment: 'negative',
        icon: 'alert-triangle'
      });
    }

    if (positive.length > 0) {
      immediate.push({
        label: 'Early Beneficiaries',
        description: `${positive.map(a => a.voice.replace(/_/g, ' ')).join(', ')} will see tangible gains within months of rollout — building early public support for the policy.`,
        sentiment: 'positive',
        icon: 'trending-up'
      });
    }

    // Category-specific immediate
    if (p.includes('wage') || p.includes('pay')) {
      immediate.push({
        label: 'Labour Market Adjustment',
        description: 'Employers begin repricing labour contracts within 6 months. Expect an uptick in hiring freezes and zero-hours contracts as firms adjust to the new floor.',
        sentiment: 'mixed',
        icon: 'clock'
      });
    } else if (p.includes('rent') || p.includes('hous')) {
      immediate.push({
        label: 'Rental Market Freeze',
        description: 'Landlords pause new lettings to assess viability. Renters in sitting tenancies benefit immediately; new renters may face reduced choice.',
        sentiment: 'mixed',
        icon: 'clock'
      });
    } else if (p.includes('tax')) {
      immediate.push({
        label: 'Fiscal Signal',
        description: 'Bond markets and institutional investors re-price UK risk premium within weeks. Gilt yields may shift before a single measure is implemented.',
        sentiment: avgScore > 0 ? 'positive' : 'negative',
        icon: 'trending-up'
      });
    } else if (p.includes('nhs') || p.includes('health')) {
      immediate.push({
        label: 'Capacity Signal',
        description: 'NHS trusts receive budget signal but workforce capacity lags 12–18 months behind. Immediate effect is administrative — not yet clinical.',
        sentiment: 'mixed',
        icon: 'clock'
      });
    } else {
      immediate.push({
        label: 'Political & Public Response',
        description: 'Media scrutiny peaks in the first 90 days. Public polling will determine the political durability of the policy beyond its first year.',
        sentiment: 'mixed',
        icon: 'clock'
      });
    }

    // ── MID-TERM CONSEQUENCES (1 – 5 years) ──────────────────────────────────
    const midTerm = [];

    if (changed.length > 0) {
      midTerm.push({
        label: 'Coalition Realignment',
        description: `${changed.length} stakeholder group(s) shifted position during deliberation — indicating a workable political coalition can be built within 2–3 years if concessions are formalised.`,
        sentiment: 'positive',
        icon: 'trending-up'
      });
    } else {
      midTerm.push({
        label: 'Entrenched Polarisation',
        description: 'Zero position changes during deliberation signals structural divergence. Expect sustained lobbying campaigns and possible legal challenges over years 2–4.',
        sentiment: 'negative',
        icon: 'alert-triangle'
      });
    }

    if (p.includes('wage') || p.includes('pay')) {
      midTerm.push({
        label: 'Wage-Price Dynamics',
        description: 'Over 3–5 years, the inflationary pass-through from higher labour costs works through the system. Consumer prices adjust 1.2–1.8% above baseline in low-margin sectors.',
        sentiment: 'mixed',
        icon: 'calendar-clock'
      });
      midTerm.push({
        label: 'Productivity Dividend',
        description: 'Evidence from comparable OECD interventions shows a 3-year lag before worker motivation and reduced turnover translate into measurable productivity gains.',
        sentiment: 'positive',
        icon: 'trending-up'
      });
    } else if (p.includes('carbon') || p.includes('clim')) {
      midTerm.push({
        label: 'Green Investment Wave',
        description: 'Carbon price signal drives private capital allocation toward low-carbon alternatives over 3–5 years. Estimated £4–7bn in green infrastructure investment unlocked.',
        sentiment: 'positive',
        icon: 'trending-up'
      });
      midTerm.push({
        label: 'Energy Cost Transition',
        description: 'Energy-intensive industries face 15–25% cost increases until alternatives scale. Supply chain reshoring partially offsets this over years 3–5.',
        sentiment: 'mixed',
        icon: 'calendar-clock'
      });
    } else if (p.includes('school') || p.includes('educ')) {
      midTerm.push({
        label: 'Skills Pipeline Formation',
        description: 'The first cohort to fully benefit from the policy enters the labour market in years 3–5, beginning to address the skills gap identified by employers.',
        sentiment: 'positive',
        icon: 'trending-up'
      });
    } else if (p.includes('rent') || p.includes('hous')) {
      midTerm.push({
        label: 'Supply Contraction Risk',
        description: 'Academic evidence shows rental supply falls 10–18% within 4 years of hard caps absent compensating developer incentives. Government must act on supply simultaneously.',
        sentiment: 'negative',
        icon: 'alert-triangle'
      });
    } else {
      midTerm.push({
        label: 'Institutional Adaptation',
        description: 'Public institutions, regulatory bodies, and market participants fully adapt their operating models within 2–4 years, normalising the new policy environment.',
        sentiment: 'mixed',
        icon: 'calendar-clock'
      });
      midTerm.push({
        label: 'Second-Order Effects',
        description: "Supply chains, adjacent markets, and social behaviours respond to the policy's incentives in ways that amplify or dampen the original intent \u2014 for better or worse.",
        sentiment: avgScore > 0 ? 'positive' : 'mixed',
        icon: 'trending-up'
      });
    }

    // ── LONG-TERM CONSEQUENCES (5+ years) ────────────────────────────────────
    const longTerm = [];

    const ltSentiment = sentiment(avgScore);

    if (p.includes('wage') || p.includes('pay')) {
      longTerm.push({
        label: 'Income Inequality Trajectory',
        description: 'Over a decade, minimum wage floors consistently reduce Gini coefficients by 0.02–0.04 in comparable economies. This policy could deliver a structural, lasting reduction in wage inequality.',
        sentiment: 'positive',
        icon: 'trending-up'
      });
      longTerm.push({
        label: 'Automation Acceleration',
        description: 'Higher labour costs create a decade-long incentive for capital substitution. Robotics and AI adoption in retail, logistics, and hospitality accelerates materially beyond 2035.',
        sentiment: 'negative',
        icon: 'alert-triangle'
      });
    } else if (p.includes('carbon') || p.includes('clim')) {
      longTerm.push({
        label: 'Net Zero Contribution',
        description: "Sustained carbon pricing is the single most effective policy instrument for long-run decarbonisation. If maintained, this policy contributes 8–14% of the UK's 2050 net-zero pathway.",
        sentiment: 'positive',
        icon: 'trending-up'
      });
      longTerm.push({
        label: 'Competitive Transformation',
        description: 'UK industries that invest early in low-carbon technology gain a first-mover export advantage in the $9 trillion global clean economy by 2035.',
        sentiment: 'positive',
        icon: 'trending-up'
      });
    } else if (p.includes('school') || p.includes('educ')) {
      longTerm.push({
        label: 'Human Capital Compounding',
        description: 'Education investment returns compound over 15–20 years. Each cohort entering a stronger system raises the productivity floor for the next. The 2040 workforce will be definitively shaped by this choice.',
        sentiment: 'positive',
        icon: 'trending-up'
      });
    } else if (p.includes('rent') || p.includes('hous')) {
      longTerm.push({
        label: 'Urban Demographic Shift',
        description: 'Long-term rent controls restructure who can afford to live in cities. Over a decade, this shifts urban demographics toward lower-to-middle income residents, with compounding effects on local services and political representation.',
        sentiment: 'mixed',
        icon: 'calendar-clock'
      });
    } else if (p.includes('tax')) {
      longTerm.push({
        label: 'Fiscal Trajectory',
        description: avgScore > 0
          ? 'If growth assumptions are realised, the policy becomes self-funding over 7–10 years, creating fiscal headroom for future investment in public services.'
          : 'Sustained revenue shortfall compounds over a decade. The OBR projects a 0.3–0.5% permanent reduction in potential output under this fiscal scenario.',
        sentiment: avgScore > 0 ? 'positive' : 'negative',
        icon: avgScore > 0 ? 'trending-up' : 'alert-triangle'
      });
    } else {
      longTerm.push({
        label: 'Systemic Normalisation',
        description: 'In the long run, the most enduring impact of this policy will be the behavioural and institutional norms it embeds. Once normalised, policy reversals become politically costly regardless of efficacy.',
        sentiment: ltSentiment,
        icon: 'calendar-clock'
      });
    }

    // Universal long-term: generational equity always applies
    longTerm.push({
      label: 'Generational Equity',
      description: negative.length > positive.length
        ? 'The current generation bears the implementation costs while future generations may inherit the structural benefits — or the unresolved structural damage if design flaws are not corrected.'
        : "This policy represents a long-term investment where today's fiscal commitment translates into structural advantages for the cohorts that follow — a genuine inter-generational transfer.",
      sentiment: negative.length > positive.length ? 'mixed' : 'positive',
      icon: 'clock'
    });

    return { immediate, midTerm, longTerm };
  }
}
