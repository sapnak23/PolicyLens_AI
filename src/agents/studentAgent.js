import { parsePolicy } from '../engine/policyParser.js';

export const analyzeAsStudent = (policy, category) => {
  const c = parsePolicy(policy);
  if (c.isNonsense) return bad('student', 'This proposal is structurally incoherent.');

  let score = 0, stance = 'mixed', summary = '', benefits = [], risks = [];

  if (c.isWage && c.isPositiveAction) {
    score = c.mainNumber > 28 ? -1 : 4; stance = score > 0 ? 'positive' : 'mixed';
    summary = c.mainNumber > 28
      ? `At £${c.mainNumber}/hr, entry-level jobs disappear — which hits students hardest. Wrong magnitude.`
      : `This directly changes whether studying is financially viable for 78% of us who work part-time.`;
    benefits = ['Part-time earnings rise without extra hours', 'Reduces reliance on high-interest debt', 'Access to education becomes real, not just advertised'];
    risks = ['Hours may be cut by employers to offset payroll', 'Entry-level hiring may slow in hospitality'];
  } else if (c.isHousing && c.isPositiveAction) {
    score = 5; stance = 'positive';
    summary = 'We are being charged £1,200/month for a room while maintenance loans cover half. This is urgent.';
    benefits = ['Direct relief on our single largest expense', 'Improved mental health from housing security', 'Enables studying near campus'];
    risks = ['Supply may fall if landlords exit the market', 'Risk of short-let displacement'];
  } else if (c.isEducation && c.isPositiveAction) {
    score = 5; stance = 'positive';
    summary = 'Investment in education is the highest-ROI public expenditure that exists. Every penny of this.';
    benefits = ['Improved quality and access', 'Reduces financial barriers', 'Builds human capital the economy needs'];
    risks = ['Funding may be absorbed by administration', 'Requires robust accountability'];
  } else if (c.isEducation && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = 'Cutting education is a betrayal. We already carry unprecedented debt. This narrows opportunity permanently.';
    benefits = ['Short-term fiscal optics'];
    risks = ['Permanent erosion of social mobility', 'Brain drain', 'Long-term productivity collapse'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = 4; stance = 'positive';
    summary = 'Climate change is the defining crisis of our generation. We live with these consequences for 60+ years.';
    benefits = ['Addresses our existential challenge', 'Green economy creates graduate jobs', 'Delay compounds the cost exponentially'];
    risks = ['Must not fall hardest on low-income students', 'Skills transition support required'];
  } else if (c.isWelfare && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = 'Welfare cuts make higher education a privilege for the wealthy again. Completely opposed.';
    benefits = ['Short-term deficit reduction'];
    risks = ['Low-income students face impossible choices', 'Drop-out rates surge', 'Inequality deepens permanently'];
  } else if (c.isNegativeAction) {
    score = -3; stance = 'negative';
    summary = 'Cuts never land on those with resources. They land on us — young, precarious, politically powerless.';
    benefits = ['Possible efficiency if well-targeted'];
    risks = ['Disproportionate burden on youth', 'Rarely reversible'];
  } else {
    score = c.isPositiveAction ? 2 : 0; stance = 'mixed';
    summary = `Is this good or bad for young people? That's my only filter. Currently: ${c.isPositiveAction ? 'cautiously optimistic' : 'undecided'}.`;
    benefits = ['Possible indirect benefit']; risks = ['Unclear distributional impact'];
  }
  return { voice: 'student', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 88 };
};

export const studentDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`We are the generation that inherits this — "${p}" is exactly what access to opportunity looks like.`,
            `Students and young workers have zero buffer. "${p}" changes that calculus immediately.`,
            `This isn't abstract policy. "${p}" is the difference between attending lectures and dropping out.`],
      con: [`${proContext ? `They said "${snip(proContext,6)}..." — ` : ''}but which students actually benefit? Not the ones with zero-hours contracts.`,
            `"${p}" sounds progressive. But if it kills the part-time jobs we depend on, it helps nobody.`,
            `I'm not opposed in principle — but the implementation risk hits my community first.`],
    },
    2: {
      pro: [`${opponentRole} talks about risk. What about the risk of staying poor? ${p} is the lesser evil.`,
            `You cannot argue for the status quo and pretend it has no victims. Ask any first-year student.`,
            `Every year we delay costs the next cohort their shot. "${p}" isn't radical — it's overdue.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}still doesn't answer: what happens to students who lose their shifts when this passes?`,
            `I want this to work. I just need the implementation not to collapse entry-level employment.`,
            `${opponentRole} cites evidence. So do I: precarious workers are the first cut when costs rise.`],
    },
    3: {
      pro: [`My offer: full support for "${p}" with a youth employment protection clause written in.`,
            `I'll take conditional support. Phase it in over two years, protect apprenticeship wages. Deal.`,
            `The benefit here outweighs my concerns. I'm voting to proceed with a student impact review at 12 months.`],
      con: [`I want to get to yes on "${p}". Give me a zero-hours contract ban alongside it and I'm in.`,
            `Fix the hours-cutting loophole in legislation and I move to conditional support. That's my position.`,
            `Opposed as written — but one amendment on entry-level job protection and we have a deal.`],
    },
    4: {
      pro: [`Final: Implement. "${p}" — the opposition didn't find a flaw that outweighs the generational benefit.`,
            `Vote to proceed. We've been promised "later" for too long. It's always later.`,
            `Implement with Conditions. Youth employment clause in legislation, then full rollout. Done.`],
      con: [`Final: Reject as written. The entry-level job risk is real and nobody has addressed it with law.`,
            `Redesign. "${p}" needs a student work protection mechanism before it gets my vote.`,
            `Conditional reject — come back with enforceable protections for precarious youth workers.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');
const bad = (id, summary) => ({ voice: id, stance: 'negative', impact_score: -5, current_impact: -5, summary, benefits: ['None'], risks: ['Total risk'], confidence: 99 });
