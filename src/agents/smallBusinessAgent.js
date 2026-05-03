import { parsePolicy } from '../engine/policyParser.js';

/**
 * SMALL BUSINESS AGENT — "Deborah Walsh, 47, owner of a high-street bakery & deli"
 * Ideology: Centrist. Survivalist. Deeply practical. No ideology — just cashflow.
 * Loves her staff and community but is one bad month from insolvency.
 * Will support anything that puts money in her customers' pockets.
 * Will fiercely oppose anything that hikes her non-negotiable overheads.
 */
export const analyzeAsSmallBusiness = (policy, category) => {
  const c = parsePolicy(policy);

  let score = 0; let stance = 'mixed'; let summary = ''; let benefits = []; let risks = [];

  if (c.isNonsense) return nonsenseResult('small_business');

  if (c.isWage && c.isPositiveAction) {
    if (c.mainNumber && c.mainNumber > 18) {
      score = -5; stance = 'negative';
      summary = `I've run this bakery for nineteen years. I pay my staff as well as I can afford. But at £${c.mainNumber}/hour, my wage bill doubles overnight. I can't raise my bread prices that fast without losing customers to the supermarket next door. The government doesn't understand that small businesses have zero buffer. We'd close. Simple as that.`;
      benefits = ['Our remaining staff would earn more', 'Reduces turnover in our team once stabilised'];
      risks = [`At £${c.mainNumber}/hr, our monthly payroll becomes unviable`, 'Forced to reduce opening hours or cut staff to survive', 'Unable to compete with large chains who absorb costs via economies of scale', 'High street closure wave would devastate community character'];
    } else {
      score = -1; stance = 'mixed';
      summary = `I support fair wages — I really do. My team are family to me. But I need time and a support package. Give me a three-year phase-in and a small business NI rebate and I'll make it work. Without that, you're asking me to absorb a cost shock I simply can't pass on without losing customers.`;
      benefits = ['Better-paid staff means lower churn and better customer service', 'Local workers earn more, spend more locally — good for our footfall', 'Levels the playing field against low-wage competitors'];
      risks = ['Short implementation window creates a cash-flow crisis', 'No comparable NI relief for small firms vs. large corporations', 'Margin compression forces cuts in quality or investment'];
    }
  } else if (c.isWage && c.isNegativeAction) {
    score = 0; stance = 'mixed';
    summary = `This cuts both ways for me. Lower mandatory wages ease my payroll pressure — but if my customers have less money in their pockets, they stop buying their morning coffee or their Saturday cake. I'm caught between operational relief and consumer demand collapse. It's genuinely not clear which effect wins.`;
    benefits = ['Immediate relief on payroll pressure', 'Prevents forced closures in the short term'];
    risks = ['Reduced local consumer spending directly hits our revenue', 'Lower wages = more stressed staff = higher turnover', 'Community poverty worsens — bad for local high street survival'];
  } else if (c.isHousing && c.isPositiveAction) {
    score = 3; stance = 'positive';
    summary = `This is brilliant for us, actually. When people spend 60% of their income on rent, they don't have money left for a nice meal out or a loaf of artisan bread. Stable housing = more disposable income = more footfall for us. Also means our staff can afford to live locally and actually show up reliably.`;
    benefits = ['More local consumer spending power boosts our revenue', 'Staff can afford to live locally reducing turnover and commute issues', 'Stable community = loyal long-term customer base'];
    risks = ['If developer investment dries up, local area economic activity may also fall', 'Commercial rent pressures remain unaddressed'];
  } else if (c.isTax && c.isNegativeAction) {
    score = 2; stance = 'positive';
    summary = `Tax cuts? I'll take it. Every pound we don't give to the taxman is a pound I can reinvest in the business, pay my team, or keep the lights on during a quiet January. Small businesses have an outsized tax burden relative to our size — any relief is genuinely welcome.`;
    benefits = ['Frees up cash for operational investment', 'Reduces compliance burden which costs us time and money', 'Makes trading through difficult months more viable'];
    risks = ['If public services degrade, local footfall suffers', 'Risk of backlash if seen as unfair to workers'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = -1; stance = 'mixed';
    summary = `I care about the environment — I've got solar panels on my roof and I buy local ingredients to cut food miles. But a carbon tax or green levy hits my energy bills and my supplier costs at once. I need targeted grants for small firms, not just a blanket levy that assumes we have the same resources as Tesco.`;
    benefits = ['Creates incentive to invest in energy-efficient equipment', 'Good for local sourcing and community sustainability narrative'];
    risks = ['Energy cost spikes directly hit our heating, refrigeration and baking bills', 'Green upgrade capital is completely out of reach without direct grants'];
  } else {
    score = c.isNegativeAction ? -1 : 1;
    stance = 'mixed';
    summary = `My first question for any policy is: what does it do to my costs and my customers' spending power? I'm not ideological — I'm practical. ${c.isPositiveAction ? 'If this puts money in people\'s pockets or reduces my overhead, I\'m cautiously supportive.' : 'If this adds cost or uncertainty, I\'m against it.'}`;
    benefits = ['Possible indirect economic uplift'];
    risks = ['Small businesses absorb uncertainty disproportionately', 'Compliance costs always fall hardest on firms without legal teams'];
  }

  return { voice: 'small_business', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 89 };
};

export const smallBusinessDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`I've run my shop for nineteen years. "${p}" is the first policy in a decade that helps rather than hurts.`,
            `When my customers have more money, they come through my door. "${p}" puts money back in their pockets.`,
            `I'm not political. But "${p}" reduces my costs — and that means I can protect my staff's hours.`],
      con: [`${proContext ? `They said "${snip(proContext,6)}..." — ` : ''}that's fine for a corporation. I have a 4% margin and no buffer.`,
            `"${p}" sounds great on paper. On my till receipts it looks like a closure notice.`,
            `I support the principle — but nobody in this room has asked what happens to businesses like mine.`],
    },
    2: {
      pro: [`${opponentRole} says it's too expensive. But my footfall drops when my customers can't pay their rent. This fixes that.`,
            `Look at the footfall data on the high street when disposable income rises. "${p}" drives that.`,
            `The big firms will absorb this fine. So will I — because my customers will actually have money to spend.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}but a supermarket has the margins to absorb shocks. I don't. Why is that so hard to understand?`,
            `${opponentRole}: show me the small business impact assessment for "${p}". It doesn't exist. That's my objection.`,
            `You're asking me to trust a policy designed in Whitehall by people who've never had to make payroll on a Friday.`],
    },
    3: {
      pro: [`I'll take conditional support. Phase "${p}" in over two years and keep me in the loop on SME impacts.`,
            `Support — if there's a small business rate relief package alongside it. My overheads don't pause.`,
            `I'm cautiously in. Just give me a helpline and a transition window and I'll manage it.`],
      con: [`Three-year phase-in plus an NI rebate for firms under 20 staff. That's my condition for support.`,
            `I won't vote for "${p}" until there's a small business impact clause in the primary legislation.`,
            `Fix the cliff-edge implementation and I'll move to conditional support. Right now this is a death warrant.`],
    },
    4: {
      pro: [`Final vote: support. "${p}" brings more people through my door. That's the bottom line.`,
            `Implement with conditions. Give me the phase-in and I'll make it work. My community needs this.`,
            `Proceed. The whole high street benefits when our customers are better off.`],
      con: [`Final: reject. "${p}" doesn't have a small business survival clause. I can't vote for my own closure.`,
            `Redesign. Come back with an SME exemption for the first 36 months and we have a deal.`,
            `Reject as written. I'm not against the goal — I'm against the implementation killing us to achieve it.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');
const nonsenseResult = (id) => ({
  voice: id, stance: 'negative', impact_score: -5, current_impact: -5,
  summary: 'This makes no sense and would likely destroy my business. Hard no.',
  benefits: ['None'], risks: ['Business closure risk'], confidence: 99
});
