import { parsePolicy } from '../engine/policyParser.js';

export const analyzeAsPublic = (policy, category) => {
  const c = parsePolicy(policy);
  if (c.isNonsense) return bad('public');

  let score = 0, stance = 'mixed', summary = '', benefits = [], risks = [];

  if (c.isWage && c.isPositiveAction) {
    score = 5; stance = 'positive';
    const fig = c.mainNumber ? `£${c.mainNumber}/hour` : 'higher wages';
    summary = `${fig} — that's real money for real people. I'm a delivery driver. I do 50 hours a week and I still can't save. My wife works part-time in a care home. If both our jobs paid properly, we might — for the first time — not have to make choices between food and heating. This isn't an economic abstraction to me. This is whether my kids eat properly.`;
    benefits = ['Immediate, tangible income rise for 4+ million low-wage workers', 'Children lifted out of in-work poverty', 'Restores the basic principle that work should pay a liveable income'];
    risks = ['If employers cut hours instead of raising hourly rates, net effect may disappoint', 'Price rises for essentials could erode some of the gain'];
  } else if (c.isWage && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `I genuinely don't know what world these people live in. We are already at the edge. My rent went up 18% this year. My energy bill doubled. And now you want to cut the wages of people like me? This isn't austerity — it's cruelty dressed up in spreadsheets. You will not find a single person I know who supports this.`;
    benefits = ['None for ordinary working families'];
    risks = ['Families pushed into food bank dependency overnight', 'Communities collapse as local spending vanishes', 'Social trust in democratic institutions destroyed'];
  } else if (c.isHousing && c.isPositiveAction) {
    score = 5; stance = 'positive';
    summary = `My landlord tried to give me 60 days notice last March — no reason. I have three kids in local schools. I had zero protection. This policy gives people like me something we've never had: the right to call a place home without fearing it can be ripped away. That matters more than anything else on this list.`;
    benefits = ['Security of tenure — the foundation of stable family life', 'Real negotiating power for tenants against exploitative landlords', 'Keeps families rooted in communities their children grow up in'];
    risks = ['If landlords exit the market, rental supply falls', 'Risk of poor maintenance if landlords can\'t raise rents to cover costs'];
  } else if (c.isHousing && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `Taking away housing protections right now — when rents are at record highs and people are sleeping in cars — is unconscionable. I know three families in my area who were evicted this year. This policy would make their situation the norm, not the exception.`;
    benefits = ['Arguably frees up the housing market'];
    risks = ['Mass evictions and homelessness', 'Children forced out of schools mid-year', 'Communities destroyed — a generation of damage'];
  } else if (c.isHealthcare && c.isPositiveAction) {
    score = 5; stance = 'positive';
    summary = `The NHS is what we contribute to when we're well and rely on when we're not. It is the greatest equaliser this country has. More investment means shorter waits, better care, and fewer preventable deaths. Strongly, unequivocally in favour.`;
    benefits = ['Shorter waiting times for everyone, regardless of income', 'Better staffing levels — quality of care improves', 'Preventable deaths decline — a direct, measurable human benefit'];
    risks = ['Money must reach frontline care, not management and consultants'];
  } else if (c.isHealthcare && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `Don't. Touch. The NHS. That is not a negotiating position. It is what separates us from a system where your child dies because you can't afford treatment. Anyone proposing this has never sat in A&E with a sick family member and no money.`;
    benefits = ['Short-term fiscal saving (that will be spent threefold on the consequences)'];
    risks = ['Preventable deaths on lengthening waiting lists', 'Mental health crisis deepens without support services', 'Public fury — this ends political careers'];
  } else if (c.isWelfare && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `Benefits aren't "handouts" — they're what you fall back on when life goes wrong. I've been on Universal Credit. It is already brutal, degrading, and insufficient. Cutting it further doesn't incentivise people — it destroys them. Anyone who's ever needed it knows that.`;
    benefits = ['Deficit reduction optics for political credibility'];
    risks = ['Surge in food bank demand', 'Increased homelessness and rough sleeping', 'Children going without meals — the most damning possible failure'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = 3; stance = 'positive';
    summary = `I care about climate. I don't want my kids to inherit a broken world. But I need to know this doesn't mean my energy bill goes up while the people who caused the problem pay nothing. Do it fairly — make polluters pay, not ordinary people — and you'll have public support. Do it as a stealth tax and watch the backlash.`;
    benefits = ['Liveable future for current children', 'Cleaner air and water in industrial communities', 'Green jobs in areas that desperately need economic renewal'];
    risks = ['Energy cost rises hit working families before anyone else', 'Public turns against climate policy if it feels like punishment for being poor'];
  } else if (c.isTax && c.benefitsWealthy && c.isNegativeAction) {
    score = -3; stance = 'negative';
    summary = `Tax cuts for corporations and the wealthy. Again. We've heard the "investment will trickle down" promise for 40 years. In those 40 years, ordinary families got food banks, zero-hours contracts, and overcrowded schools. I don't believe this argument anymore and I suspect most people don't either.`;
    benefits = ['Theoretical growth dividend'];
    risks = ['Reduced public services to fund corporate giveaway', 'Worsening inequality and social division', 'Erosion of already-depleted public trust'];
  } else if (c.isTransport && c.isPositiveAction) {
    score = 3; stance = 'positive';
    summary = `Good public transport changes everything — how far you can work from home, whether your kids can get to school, whether an elderly parent can get to appointments. This has my support, though I'll believe it when the buses actually turn up on time.`;
    benefits = ['Reduces car dependency and associated costs for lower-income families', 'Improves access to jobs and services outside your immediate area', 'Environmental benefit from modal shift'];
    risks = ['Risk of underinvestment in rural and suburban routes that need it most'];
  } else if (c.isNegativeAction) {
    score = -3; stance = 'negative';
    summary = `Whenever I hear a politician say "cuts" I know who's actually going to feel it — not the people in the room making the decision, but the people like me who rely on the services, the pay, and the protections being reduced. I'm against this until I see compelling evidence it doesn't hurt ordinary people.`;
    benefits = ['Possible efficiency gain if genuinely well-designed'];
    risks = ['Working families bear disproportionate cost of any reduction', 'Public services that take years to build are destroyed in months'];
  } else {
    score = c.isPositiveAction ? 2 : 0; stance = 'mixed';
    summary = `I don't follow policy for a living. I follow my bank balance and what I see around me. My question for any policy is simple: does it make life better or harder for ordinary families? This one — I genuinely can't tell yet. I'll wait to see how it plays out on the ground.`;
    benefits = ['Potential improvement in community conditions'];
    risks = ['Gap between policy promise and real-world delivery is usually vast'];
  }

  return { voice: 'public', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 85 };
};

const bad = (id) => ({ voice: id, stance: 'negative', impact_score: -5, current_impact: -5, summary: 'This makes no sense to me or anyone in my community. Policies that can\'t be explained to an ordinary person usually hide who they\'re really designed to help.', benefits: ['None'], risks: ['More cynicism about politics', 'Further erosion of trust in institutions'], confidence: 99 });

export const publicDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`Look — "${p}" means I can actually pay my bills this month. That's it. That's the argument.`,
            `People like me don't care about fiscal multipliers. "${p}" makes life more liveable. I'm in.`,
            `I've been waiting for something like "${p}" for years. Regular people need this.`],
      con: [`${proContext ? `They say "${snip(proContext,6)}..." — ` : ''}sounds brilliant. Until you ask who actually foots the bill.`,
            `"${p}" — if it's so good, why do I feel like ordinary people will absorb the cost as usual?`,
            `I want to believe in "${p}". I really do. But I've heard these promises before.`],
    },
    2: {
      pro: [`${opponentRole} is running models. I'm watching people choose between food and heating. "${p}" fixes the second problem.`,
            `The public didn't vote for more complexity. We voted for things to get better. "${p}" does that.`,
            `While ${opponentRole} debates multipliers, people like me are just asking: does "${p}" help or not? It does.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}that's what they always say. Then prices go up and we're worse off than before.`,
            `I'm not against "${p}" in theory. I'm against being told it's great while we absorb the hidden downside.`,
            `If this is so good for regular people, why are the people I actually trust worried about it?`],
    },
    3: {
      pro: [`I support "${p}" — but only if the benefit reaches us directly, not filtered through six layers of bureaucracy.`,
            `Give me a clear date, a clear number, and a direct benefit. Then I'm fully in.`,
            `Conditional yes — as long as this isn't watered down into nothing before it reaches real households.`],
      con: [`Show me the household impact in plain numbers and I'll reconsider. Jargon is not reassurance.`,
            `I'll move to yes on "${p}" when I can see exactly what I'll get and by when. Right now? Unclear.`,
            `Make the direct public benefit legally binding — not aspirational — and I'll change my vote.`],
    },
    4: {
      pro: [`Final: yes. "${p}" puts money in normal people's pockets. Just implement it — stop debating it.`,
            `Vote to proceed. The public needs wins. "${p}" is a win. Don't overthink it.`,
            `Support. The ordinary person's case for "${p}" hasn't been refuted — just debated by people who don't need it.`],
      con: [`Final: no. "${p}" still hasn't shown me where the benefit lands for people like me. Not good enough.`,
            `Reject. If this were as good as claimed, the people I trust would be more confident. They're not.`,
            `No vote until "${p}" has a direct, measurable, legally-binding public benefit. Rewrite it.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');

