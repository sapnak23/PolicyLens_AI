import { parsePolicy } from '../engine/policyParser.js';

export const analyzeAsWorker = (policy, category) => {
  const c = parsePolicy(policy);
  if (c.isNonsense) return bad('worker');

  let score = 0, stance = 'mixed', summary = '', benefits = [], risks = [];

  if (c.isWage && c.isPositiveAction) {
    score = 5; stance = 'positive';
    const fig = c.mainNumber ? `£${c.mainNumber}/hour` : 'a higher wage floor';
    summary = `${fig}. That's what dignity costs in 2026. I work on an NHS ward — 12-hour shifts, missed breaks, watching colleagues burn out. We are the people who kept this country alive through a pandemic and this is what we asked for in return: a wage that covers rent, food, and heating without choosing between them. No phase-ins. No conditions. Implement it.`;
    benefits = ['Immediate income lift for 4.1 million workers at or near the current floor', 'Strongest anti-poverty intervention available without means-testing', 'Rebuilds the dignity of frontline work that years of stagnation eroded'];
    risks = ['Employers may respond with hours rationing — enforcement is essential', 'Risk of "work intensification" without union protections alongside the wage floor', 'Zero-hours contract workers most vulnerable to retaliatory schedule cuts'];
  } else if (c.isWage && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `No. I want to be absolutely clear. Cutting wages — or making it easier to pay us less — is not an economic policy. It is a decision about whose suffering is acceptable. We did not become the "backbone of Britain" during a crisis to have that used as cover for paying us less after it. Every union in this country will strike if this passes.`;
    benefits = ['None for working people'];
    risks = ['Wave of industrial action across NHS, education, transport and logistics', 'Mass exodus from public services that are already critically understaffed', 'Living standards collapse for the lowest-paid — the most politically and socially destabilising outcome possible'];
  } else if (c.isHealthcare && c.isPositiveAction) {
    score = 5; stance = 'positive';
    summary = `I work in the NHS. I know what understaffing looks like — not in a spreadsheet, but in a corridor at 3am with two nurses covering a ward that should have six. More investment in healthcare is not just popular: it is morally necessary. It also directly helps us — better staffing ratios, safer working conditions, and careers we can actually sustain.`;
    benefits = ['Safer staffing ratios — better for both workers and patients', 'Improved morale in a workforce on the edge of collapse', 'Reduces the 40% turnover rate that is destroying institutional knowledge'];
    risks = ['Funding must reach frontline staff, not management layers', 'Without workforce planning, money alone doesn\'t solve the staffing crisis'];
  } else if (c.isHealthcare && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `I have watched colleagues walk out because they cannot do the job properly anymore. Cutting the NHS budget further isn't an economic decision — it is a decision about how many people you're comfortable watching die in corridors. We will not stand for it. Industrial action is not a threat — it is a certainty.`;
    benefits = ['Short-term fiscal saving that will cost multiples in the long run'];
    risks = ['Preventable deaths increase as waiting lists grow beyond crisis levels', 'Healthcare workers leave the profession — a loss that takes a decade to rebuild', 'Hospital closures or service withdrawals in already-underserved areas'];
  } else if (c.isWelfare && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `Benefits are what workers fall back on when they're sick, injured, or between jobs. Cutting them doesn't only hurt the unemployed — it destroys the safety net that gives every working person the confidence to take risks, change jobs, or survive a bad month. Frontline workers know this better than anyone.`;
    benefits = ['Deficit reduction'];
    risks = ['Workers lose the safety net that gives them bargaining power', 'Food poverty increases immediately and measurably', 'Mental health crisis deepens — directly increasing NHS pressure'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = 2; stance = 'mixed';
    summary = `I care about the planet — my kids will live in it. But "Just Transition" cannot be a slogan. If you close the coal plant or the steel works, you build the wind farm right there, train us to run it, and pay us the same rates. That is a deal I will sign. A green economy that leaves industrial workers behind is not justice — it's just a different set of victims.`;
    benefits = ['Green jobs in communities that desperately need economic renewal', 'Cleaner working environments — industrial disease is still a frontline reality', 'Long-term planetary stability is in every worker\'s interest'];
    risks = ['Industrial job losses without legally binding green job guarantees', 'Energy costs rise before workers see the green employment benefits', 'Transition must be enshrined in legislation, not vague political promises'];
  } else if (c.isTax && c.benefitsWealthy && c.isNegativeAction) {
    score = -3; stance = 'negative';
    summary = `Tax cuts for corporations while I'm working a second job to cover my bills? The "investment will trickle down" argument has been used to justify decades of wage suppression. We do the work. We create the value. And then the gains flow to shareholders while we're told there's nothing left for pay rises. Not interested.`;
    benefits = ['Theoretical productivity stimulus'];
    risks = ['Public services deteriorate to fund corporate giveaways', 'Worsens power imbalance between employers and workers', 'Destroys the public infrastructure that makes workers\' communities liveable'];
  } else if (c.isTransport && c.isPositiveAction) {
    score = 3; stance = 'positive';
    summary = `For workers like me — shift patterns, early starts, late finishes — public transport is non-negotiable. A good bus or rail network is the difference between a job being viable or not. I support investment in infrastructure that serves working communities, not just commuter corridors.`;
    benefits = ['Reduces transport costs that disproportionately burden low-income workers', 'Expands geographic reach of job market for workers without cars', 'Evening and weekend services support shift workers who current networks ignore'];
    risks = ['Risk of under-investment in suburban and rural routes', 'Rail privatisation must not be allowed to absorb public investment into shareholder returns'];
  } else if (c.isNegativeAction) {
    score = -3; stance = 'negative';
    summary = `Whenever I hear "cuts" I ask: who actually pays? It's never the people in the boardrooms or the think tanks. It's always the workers, the carers, the cleaners — the people who keep everything running and get the least credit for it. I am against this policy until I see evidence that its costs don't land on us.`;
    benefits = ['Possible efficiency gain if genuinely well-targeted'];
    risks = ['Cost of cuts always lands disproportionately on frontline workers', 'Services that workers rely on are hardest hit by austerity'];
  } else {
    score = c.isPositiveAction ? 2 : 0; stance = 'mixed';
    summary = `My test for every policy: does the person doing the actual work end up more secure, better paid, and more respected? This one — I'm not sure yet. I'll be watching the implementation carefully. Promises mean nothing without enforcement.`;
    benefits = ['Possible improvement if implementation is genuinely worker-centred'];
    risks = ['Policy capture by interests that don\'t represent workers is the default outcome', 'Enforcement gaps always hurt the most vulnerable workers most'];
  }

  return { voice: 'worker', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 91 };
};

const bad = (id) => ({ voice: id, stance: 'negative', impact_score: -5, current_impact: -5, summary: 'This proposal has no coherent benefit for anyone who does actual work. It is either incoherent or harmful by design.', benefits: ['None'], risks: ['Exploitation of working people', 'Complete destruction of the social contract'], confidence: 99 });

export const workerDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`We have been fighting for "${p}" for fifteen years. Today we make the case — and we won't be dismissed.`,
            `"${p}" is not a favour. It is recognition of value that has always been there and always been ignored.`,
            `The workers in this room created the wealth that funds this entire debate. "${p}" is us asking for our share.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}we've heard that before. The question is: who protects us when it goes wrong?`,
            `"${p}" — we're not against the stated goal. We're against being the ones who absorb the cost when it fails.`,
            `Our members are watching this deliberation. If "${p}" harms frontline workers, we will know. And we will act.`],
    },
    2: {
      pro: [`${opponentRole} talks about margins. Our members talk about being able to pay rent. "${p}" addresses the second.`,
            `We are not asking for charity. "${p}" is a transfer of value from those who extracted it to those who created it.`,
            `The productivity data is clear: workers who are financially secure are more productive. "${p}" is good economics.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}that's management language for "trust us". Our members have been told to trust management before.`,
            `${opponentRole}: if "${p}" is so neutral on workers, why are our shop stewards reporting members in fear of losing hours?`,
            `We don't accept that workers must absorb all implementation risk while capital absorbs all the upside.`],
    },
    3: {
      pro: [`We'll support "${p}" with a collective bargaining protection clause and a no-redundancy guarantee during transition.`,
            `Conditional support: union reps on the implementation board, statutory consultation rights, no fire-and-rehire loopholes.`,
            `We move to yes on "${p}" — but the conditions are written into the legislation. Not a side letter. The law.`],
      con: [`Our members vote no until there's a legally binding worker protection clause in the primary bill. Not a promise.`,
            `We'll withdraw our opposition to "${p}" when there's a no-detriment clause covering every worker it affects.`,
            `Collective agreement or no agreement. That's been our position since day one and it hasn't changed.`],
    },
    4: {
      pro: [`Final: support. "${p}" is overdue. We vote to implement and we'll hold every signatoy to the conditions.`,
            `Implement. "${p}" represents a meaningful shift toward recognising the dignity of labour. We vote yes.`,
            `Yes — with conditions binding in law. Our members deserve nothing less and we won't accept anything less.`],
      con: [`Final: reject. Four rounds and not one legally binding worker protection. We will not enable this.`,
            `Reject. "${p}" as written is a transfer of risk from capital to labour with no compensation. Not acceptable.`,
            `No. Our members will not vote to implement a policy that leaves them exposed. Come back with legal protections.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');
