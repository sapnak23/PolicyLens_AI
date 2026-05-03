import { parsePolicy } from '../engine/policyParser.js';

export const analyzeAsGovernment = (policy, category) => {
  const c = parsePolicy(policy);
  if (c.isNonsense) return bad('government');

  let score = 0, stance = 'mixed', summary = '', benefits = [], risks = [];

  if (c.isWage && c.isPositiveAction) {
    const amt = c.mainNumber;
    if (amt && amt > 25) {
      score = -2; stance = 'mixed';
      summary = `At £${amt}/hour, our fiscal exposure in the public sector alone is significant — preliminary Treasury modelling indicates a £14-18bn direct cost to NHS, education and local government payrolls without corresponding revenue uplift in the short term. We support the direction but require a phased implementation, a Spending Review, and OBR sign-off before we could legislate at this level. Governance without fiscal prudence is not governance.`;
      benefits = ['Reduces in-work poverty and associated welfare costs', 'Strong public mandate across all demographics', 'Reduces NHS mental health demand linked to financial stress'];
      risks = [`£14-18bn public sector payroll exposure at £${amt}/hr`, 'Immediate Spending Review required — no fiscal headroom exists', 'Risk of wage-price spiral if monetary policy not coordinated with BoE'];
    } else {
      score = 3; stance = 'positive';
      summary = `Our modelling is constructive. A wage floor at this level is projected to reduce Universal Credit expenditure by approximately £3.8bn per year as in-work poverty falls and NI receipts rise. The OBR score is broadly net positive over a 5-year horizon. This aligns with our "Make Work Pay" mandate and is fiscally defensible.`;
      benefits = ['£3.8bn projected annual Universal Credit saving', 'Increased income tax and NI receipts improve fiscal trajectory', 'Delivers core social mandate without structural deficit expansion'];
      risks = ['Public sector employers face payroll pressure requiring managed transition', 'OBR will flag short-term inflationary risk', 'Sectoral variation means national floor may require exemptions'];
    }
  } else if (c.isWage && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `Our fiscal analysis is unambiguous: this is a trap. Every £1 saved in direct wage cost generates approximately £1.40 in additional Universal Credit, housing benefit, and NHS demand costs within 24 months. Beyond the economics, this would trigger a constitutional crisis with the TUC, UNISON and NHS unions — a generalised strike in public services would be catastrophic for the government's fiscal credibility.`;
    benefits = ['Nominal short-term payroll saving in public sector'];
    risks = ['£1.40 additional welfare cost per £1 of wage saving — net fiscal negative', 'Inevitable general strike — political and economic destabilisation', 'Tax receipt collapse as consumer spending falls across the economy'];
  } else if (c.isHousing && c.isPositiveAction) {
    score = 3; stance = 'positive';
    summary = `Housing instability is now a tier-one risk in our social risk register. The rent-to-income ratio in London has reached 58%, generating significant NHS mental health demand, labour market immobility, and intergenerational inequality. This policy has 71% public support, positive cross-party momentum, and a credible fiscal case. We support implementation with supply-side safeguards to protect housing stock investment.`;
    benefits = ['Reduces NHS mental health burden — estimated £2.3bn annual saving', 'Improves labour market mobility — GDP benefit of 0.4-0.6%', 'Strong social mandate — delivers on commitments to renters'];
    risks = ['Legal challenge from Landlords\' Association is highly probable', 'Must include developer incentives to prevent supply contraction', 'Implementation complexity across devolved nations requires coordination'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = 4; stance = 'positive';
    summary = `We are legally obligated under the Climate Change Act 2008. A carbon pricing mechanism is the most economically efficient tool available and generates approximately £12bn annually — earmarked for our Green Transition Fund. The critical condition is a Carbon Border Adjustment Mechanism to protect domestic industrial competitiveness. Without CBAM, this creates carbon leakage and industrial flight without environmental benefit.`;
    benefits = ['£12bn annual revenue for green infrastructure investment', 'Meets COP and Climate Change Act legal obligations', 'Positions UK favourably in green industrial policy globally'];
    risks = ['Regressive without income-linked household rebates', 'CBAM implementation requires WTO-compliant design — legal risk', 'Energy price spike could be politically damaging without strong communication strategy'];
  } else if (c.isTax && c.isNegativeAction && c.benefitsWealthy) {
    score = -2; stance = 'mixed';
    summary = `Every 1% reduction in corporation tax costs approximately £3bn in annual revenue. The OBR's dynamic scoring suggests a growth dividend of 0.1-0.15% of GDP per 1% cut — a fiscal multiplier well below 1.0 at current rates. We cannot recommend broad cuts without identified efficiency savings to compensate. Targeted reliefs with investment conditionality are our preferred instrument.`;
    benefits = ['Marginal improvement in FDI attractiveness metrics', 'Political signal of pro-growth orientation'];
    risks = ['£3bn+ annual revenue shortfall per 1% cut — requires spending cuts to compensate', 'OBR unlikely to validate growth assumptions — fiscal credibility risk', 'Public services under further pressure at a time of existing constraint'];
  } else if (c.isHealthcare && c.isPositiveAction) {
    score = 4; stance = 'positive';
    summary = `The fiscal case for NHS investment is strong: every £1 of preventative care saves an estimated £3 in acute intervention costs over a 10-year horizon. Current waiting list costs — in terms of economic inactivity and productivity loss — are estimated at £12bn annually. This investment is not a cost; it is a fiscal strategy.`;
    benefits = ['Reduces £12bn annual productivity loss from waiting list-driven inactivity', 'Preventative care reduces long-term acute spending', 'Politically essential — NHS remains the most trusted public institution'];
    risks = ['Must be accompanied by workforce planning — money without staff is ineffective', 'Risk of productivity capture by management layers rather than frontline delivery'];
  } else if (c.isHealthcare && c.isNegativeAction) {
    score = -5; stance = 'negative';
    summary = `The Treasury has modelled this and the result is clear: cutting NHS funding generates negative returns within 3 years as acute demand, mental health crisis, and workforce exodus compound. This is not a saving — it is a deferred cost multiplied by at least 2.5x. Beyond the fiscal case, the political destruction would be total. This is not a policy the Government can endorse.`;
    benefits = ['Short-term headline deficit reduction'];
    risks = ['2.5x cost amplification in acute demand within 3 years', 'Total political destruction — the NHS is the third rail of British politics', 'NHS workforce collapse requires a decade to rebuild'];
  } else if (c.isWelfare && c.isNegativeAction) {
    score = -3; stance = 'negative';
    summary = `Welfare cuts carry a deceptive fiscal logic. The apparent saving is frequently offset within 2 years by increased NHS mental health demand, homelessness services, and criminal justice costs. Our cross-departmental modelling consistently shows that cuts to preventative welfare increase total public expenditure by 30-60% within a decade. We oppose this on both fiscal and social grounds.`;
    benefits = ['Short-term welfare line reduction in public accounts'];
    risks = ['30-60% cost amplification across NHS, homelessness and criminal justice within a decade', 'Surge in child poverty — long-term human capital damage', 'Public backlash severely constrains fiscal credibility in other areas'];
  } else if (c.isTransport && c.isPositiveAction) {
    score = 3; stance = 'positive';
    summary = `Infrastructure investment in transport has a well-evidenced fiscal multiplier of 1.5-2.0x over a 10-year horizon. It improves labour market mobility, reduces regional inequality, and generates long-term productivity gains. This aligns with our levelling-up framework and has cross-party support. We recommend prioritising high-density routes with the greatest economic impact.`;
    benefits = ['Fiscal multiplier of 1.5-2.0x over 10 years', 'Reduces regional economic inequality — strategic levelling-up priority', 'Improves business confidence and inward investment in connected areas'];
    risks = ['Capital costs are significant and require long-term fiscal commitment', 'Benefits are long-horizon — politically difficult to maintain funding across election cycles'];
  } else if (c.isNegativeAction) {
    score = -1; stance = 'mixed';
    summary = `We apply four tests to all policy: fiscal sustainability, social equity, macroeconomic stability, and political feasibility. This proposal raises concerns on at least two of those dimensions. We would require a full Treasury impact assessment and OBR review before offering support.`;
    benefits = ['Possible short-term fiscal relief'];
    risks = ['Risk of deferred cost amplification', 'Social and political backlash potential not yet modelled'];
  } else {
    score = c.isPositiveAction ? 2 : 0; stance = 'mixed';
    summary = `Initial assessment: requires cross-departmental impact modelling. The directional intent is ${c.isPositiveAction ? 'broadly positive and aligns with our social renewal agenda' : 'unclear and requires further specification before the Government can form a view'}. Treasury and OBR review recommended.`;
    benefits = ['Possible alignment with National Renewal strategy'];
    risks = ['Policy design quality is critical — poor implementation creates negative fiscal outcomes'];
  }

  return { voice: 'government', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 94 };
};

export const governmentDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`Treasury modelling is constructive on "${p}". OBR projects a net fiscal positive over a 5-year horizon.`,
            `Our four tests — fiscal, equity, stability, feasibility — are satisfied by "${p}". We support implementation.`,
            `"${p}" aligns with our mandate and reduces our welfare exposure. The numbers work.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}we cannot validate that without a full OBR assessment. We are not there yet.`,
            `The Treasury has modelled "${p}". The fiscal exposure is significant and has not been addressed.`,
            `We apply four tests to every policy. "${p}" is failing at least two. We cannot support it as written.`],
    },
    2: {
      pro: [`${opponentRole} raises fiscal concerns. Our modelling shows the welfare saving offsets the implementation cost within 24 months.`,
            `The OBR's dynamic scoring on "${p}" is positive. The fiscal case is not opinion — it is evidence.`,
            `We've done the cross-departmental analysis. "${p}" reduces NHS, housing, and criminal justice demand simultaneously.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}the OBR does not validate that multiplier assumption. I need to be clear about that.`,
            `${opponentRole}: where is the spending review to fund this? We have zero fiscal headroom for uncosted commitments.`,
            `We support the direction of "${p}" but the fiscal mechanism is inadequate. This is not ideological — it is arithmetic.`],
    },
    3: {
      pro: [`Government position: support with a Spending Review commitment and OBR sign-off before implementation. That's our condition.`,
            `We'll legislate for "${p}" with a phased rollout, statutory review at year one, and Treasury oversight. Done.`,
            `Conditional support. Treasury modelling holds — we proceed with full OBR transparency and parliamentary scrutiny.`],
      con: [`Two conditions: a full OBR impact assessment and a cross-departmental mitigation plan. Without both, we cannot proceed.`,
            `The Government will not implement "${p}" without fiscal headroom identified in the next Spending Review.`,
            `We want to say yes. The current fiscal position prevents it. Identify the funding source and we move.`],
    },
    4: {
      pro: [`Government's final position: Implement with conditions. The OBR case is sound. The implementation framework is workable.`,
            `We support "${p}". The fiscal case, the social mandate, and the delivery mechanism all hold up to scrutiny.`,
            `Final vote: proceed. The alternative — inaction — carries a higher long-term fiscal cost than implementation.`],
      con: [`Final position: reject as written. "${p}" requires a spending review before implementation — that is non-negotiable.`,
            `We cannot support "${p}" without OBR sign-off. That is our constitutional obligation. The answer is no for now.`,
            `Reject. Bring back a costed, OBR-validated version and the Government will support it. Not before.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');
const bad = (id) => ({ voice: id, stance: 'negative', impact_score: -5, current_impact: -5, summary: 'This proposal would not survive a single round of Treasury scrutiny. It lacks fiscal coherence, structural logic, and any credible implementation pathway.', benefits: ['None'], risks: ['Immediate fiscal and constitutional crisis', 'No credible delivery mechanism exists'], confidence: 99 });
