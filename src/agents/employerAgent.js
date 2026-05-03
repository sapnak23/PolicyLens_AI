import { parsePolicy } from '../engine/policyParser.js';

export const analyzeAsEmployer = (policy, category) => {
  const c = parsePolicy(policy);
  if (c.isNonsense) return bad('employer');

  let score = 0, stance = 'mixed', summary = '', benefits = [], risks = [];

  if (c.isWage && c.isPositiveAction) {
    score = c.mainNumber > 22 ? -4 : -2; 
    stance = 'negative';
    const fig = c.mainNumber ? `£${c.mainNumber}/hr` : 'this level';
    summary = `At ${fig}, our annualised payroll across 3,400 direct employees increases by £8.2M. That is not absorbed — it is passed to consumers or extracted from headcount. Simple arithmetic.`;
    benefits = ['Reduced turnover if wage genuinely improves retention', 'Potential consumer spending uplift in local markets'];
    risks = [`£8.2M direct payroll impact — forces restructuring`, 'Acceleration of automation in repetitive roles', 'SME supply chain partners face insolvency risk'];
  } else if (c.isWage && c.isNegativeAction) {
    score = 3; stance = 'positive';
    summary = 'Payroll flexibility allows us to protect jobs in a downturn. This is operationally sensible from a business continuity perspective.';
    benefits = ['Margin stability in low-demand periods', 'Job preservation through flexibility'];
    risks = ['Reputational risk if perceived as anti-worker', 'Consumer spending may fall — hitting our revenues'];
  } else if (c.isTax && c.isNegativeAction) {
    score = 4; stance = 'positive';
    summary = 'Every point off corporation tax is capital that stays in the business. We deploy it in R&D, capex, and headcount — not shareholder returns, as critics assume.';
    benefits = ['Frees capital for R&D and expansion', 'Improves UK competitiveness for inward investment', 'Reduces compliance overhead'];
    risks = ['Fiscal credibility risk if deficit widens', 'Public services deteriorate — long-term productivity cost'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = -2; stance = 'mixed';
    summary = 'Carbon pricing without a border adjustment mechanism is a unilateral competitiveness tax. We support net zero but not if it means offshoring production to jurisdictions with zero standards.';
    benefits = ['Long-term energy cost stability', 'Green premium positioning for export markets'];
    risks = ['Carbon leakage — production shifts abroad', 'Capital expenditure for compliance is immediate and substantial'];
  } else if (c.isHousing && c.isPositiveAction) {
    score = 2; stance = 'positive';
    summary = 'Stable housing reduces staff attrition. Our London sites lose 35% of entry-level staff annually largely due to housing costs. This policy addresses a real operational problem.';
    benefits = ['Reduced staff turnover in high-cost cities', 'Larger labour pool if workers can afford to live locally'];
    risks = ['Rental supply contraction could worsen housing access', 'Commercial rents remain unaddressed'];
  } else if (c.isNegativeAction) {
    score = 2; stance = 'positive';
    summary = 'Regulatory reduction and cost relief allows capital to be redeployed productively. We cautiously support this.';
    benefits = ['Reduced compliance burden', 'Capital redeployment into growth'];
    risks = ['Risk of consumer confidence decline', 'Political backlash may create regulatory uncertainty'];
  } else {
    score = -1; stance = 'mixed';
    summary = 'Our primary filter: does this improve or worsen the operating environment? This proposal is ambiguous on that question.';
    benefits = ['Possible market stability benefit']; risks = ['Regulatory uncertainty', 'Implementation cost unclear'];
  }
  return { voice: 'employer', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 91 };
};

export const employerDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`The numbers support "${p}". Our modelling shows a net neutral to positive operating impact.`,
            `We've run the scenario analysis. "${p}" is implementable and the business case is there.`,
            `Contrary to what critics assume, "${p}" aligns with our long-term talent and retention strategy.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}the modelling doesn't support that. Our payroll exposure is £8.2M. That's not ideology, that's arithmetic.`,
            `We've stress-tested "${p}" against our P&L. The margin compression forces a restructuring conversation.`,
            `I'm not against the intent. I'm against the financial reality that no one in this room is accounting for.`],
    },
    2: {
      pro: [`${opponentRole} cites implementation risk. We've modelled it. The retention benefit offsets the cost within 18 months.`,
            `The labour market data backs this up. Turnover costs us more annually than the payroll increase would.`,
            `This isn't ideology — it's operational mathematics. The case for "${p}" holds up.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}that modelling assumes zero substitution effect. We are already pricing automation.`,
            `${opponentRole}'s 18-month payback assumes stable demand. We are not in that environment.`,
            `The economic case for "${p}" works at the macro level. It does not work at the firm level. Those are different problems.`],
    },
    3: {
      pro: [`We support "${p}" with a three-year phase-in and NI relief for SMEs below 50 employees. That's our offer.`,
            `Conditional support: statutory implementation, annual OBR review, and a sector-specific exemption mechanism.`,
            `We're willing to proceed. But we need a transition framework — not a cliff edge.`],
      con: [`Add a sector exemption for low-margin industries and a phase-in over 36 months. Then we talk.`,
            `Our position: reject as written, but a phased implementation bill with cost offset mechanisms gets our support.`,
            `The principle is right. The execution plan is what's killing this. Fix the rollout and we're in.`],
    },
    4: {
      pro: [`Final vote: Implement with phase-in. The business community can absorb "${p}" with the right transition framework.`,
            `Proceed. The talent and retention data ultimately outweigh the short-term payroll pressure.`,
            `Support with conditions. Phase-in plus NI relief. We've modelled this — it works.`],
      con: [`Final: Reject as written. £8.2M payroll impact with no offset mechanism is not a transition — it's a cliff.`,
            `Vote to redesign. Bring us a phased bill with sector flexibility and we'll support it.`,
            `Reject. The economic case exists in theory. The delivery mechanism destroys it in practice.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');
const bad = (id) => ({ voice: id, stance: 'negative', impact_score: -5, current_impact: -5, summary: 'No credible financial model supports this.', benefits: ['None'], risks: ['Total business risk'], confidence: 99 });
