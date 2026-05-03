import { parsePolicy } from '../engine/policyParser.js';

/**
 * ECONOMIST AGENT — "Dr. Amara Diallo, 49, Professor of Macroeconomics, LSE"
 * Ideology: Data-first, institutionalist. Believes in markets with guardrails.
 * Not left or right — she follows the evidence wherever it leads.
 * Will challenge bad data and wishful thinking from any side.
 * Uses real economic frameworks: Okun's Law, Laffer Curve, Pigou taxes, Keynesian multipliers.
 */
export const analyzeAsEconomist = (policy, category) => {
  const c = parsePolicy(policy);

  let score = 0; let stance = 'mixed'; let summary = ''; let benefits = []; let risks = [];

  if (c.isNonsense) return nonsenseResult('economist');

  if (c.isWage && c.isPositiveAction) {
    const amount = c.mainNumber;
    if (amount && amount > 28) {
      score = -3; stance = 'negative';
      summary = `My concern isn't philosophical — it's empirical. The Dube-Lester-Reich elasticity studies show that moderate wage floors have near-zero disemployment effects. But at £${amount}, we're beyond the range those studies cover. We're in uncharted territory where the labour demand elasticity may become non-linear. My modelling flags a 12-18% job loss risk in hospitality and retail specifically. I cannot recommend this at this magnitude without a 10-year phased implementation.`;
      benefits = ['For employed workers, real income gains are substantial', 'Potential local consumption stimulus in lower-income areas', 'Corrects long-standing wage share decline in national accounts'];
      risks = [`Non-linear disemployment risk at £${amount} — empirical data doesn't extend this far`, 'Wage-price spiral if monetary policy is insufficiently restrictive', 'Sectoral concentration of job losses in hospitality, care, and retail'];
    } else {
      score = 2; stance = 'mixed';
      summary = `The evidence base here is actually stronger than critics claim. Card and Krueger's seminal work, replicated extensively across OECD countries, shows modest minimum wage increases have minimal disemployment effects at this range. The consumption effect — lower-income households spend a higher marginal share of additional income — generates a positive multiplier estimated at 1.3x. However, the wage-price pass-through risk requires OBR monitoring.`;
      benefits = ['Positive Keynesian multiplier (est. 1.3x) from lower-income consumption boost', 'Reduces welfare expenditure burden on public finances', 'Corrects monopsonistic wage suppression in low-skill labour markets'];
      risks = ['Wage-price pass-through requires careful monetary policy coordination', 'Potential for hours reduction rather than job losses — harder to measure', 'Regional variation means national floor may be inappropriate in lower-wage areas'];
    }
  } else if (c.isWage && c.isNegativeAction) {
    score = -4; stance = 'negative';
    summary = `This is classic wage deflation — and the empirical literature is almost universally negative on engineered labour cost reductions in domestic-demand-driven economies. Lower wages compress the money supply at the base of the income distribution where marginal propensity to consume is highest. Keynes called this the "paradox of thrift" at scale. The contractionary multiplier here could be as large as -1.8x — meaning the economy shrinks by nearly double the apparent "saving."`;
    benefits = ['Short-term payroll cost relief for labour-intensive firms', 'May improve export competitiveness marginally'];
    risks = ['Contractionary multiplier of -1.8x — economy contracts faster than costs are saved', 'Deflationary spiral risk in sectors with already-low pricing power', 'Long-term damage to human capital as workers cannot afford health or education'];
  } else if (c.isHousing && c.isPositiveAction) {
    score = 2; stance = 'mixed';
    summary = `Second-generation rent stabilisation — which allows cost pass-through and inflation indexation — has a better empirical record than classical rent controls. The Diamond-McQuade-Qian study found that while rent control reduces displacement, it also reduces rental supply by ~15%. The net welfare effect depends critically on whether supply-side investment is maintained. I recommend an evidence-based design that includes developer incentives alongside the cap.`;
    benefits = ['Reduces displacement and associated mental health costs (est. £2.3bn NHS saving)', 'Improves labour market mobility by reducing housing lock-in', 'Addresses acute market failure in urban rental markets'];
    risks = ['Supply reduction risk of 15-20% without compensating developer incentives', 'Black market rents may circumvent the cap in high-demand areas', 'Maintenance quality tends to fall in rent-controlled stock over time'];
  } else if (c.isEnvironment && c.isPositiveAction) {
    score = 4; stance = 'positive';
    summary = `Carbon pricing is the canonical Pigouvian correction for a negative externality — in this case, the social cost of atmospheric carbon. The Stern Review's estimate of £85/tonne social cost carbon still holds. Properly designed, a carbon tax is both efficient (minimises deadweight loss) and can be made progressive through dividend redistribution. The IPCC endorses this mechanism explicitly. I'm strongly supportive with one critical condition: a Carbon Border Adjustment to prevent leakage.`;
    benefits = ['Corrects the fundamental market failure of unpriced externalities', 'Revenue can fund progressive dividend or green investment', 'Creates the long-term price signal needed for private sector decarbonisation'];
    risks = ['Without CBAM, carbon leakage neutralises domestic emissions reductions', 'Regressive distributional effects if revenue is not rebated to low-income households', 'Energy price shock could trigger central bank rate response'];
  } else if (c.isTax && c.isNegativeAction) {
    score = -1; stance = 'mixed';
    summary = `The Laffer Curve argument for tax cuts has limited empirical support at the current UK rates. The OBR's dynamic scoring models suggest that corporation tax cuts at the current 25% rate have a fiscal multiplier well below 1.0 — meaning they don't pay for themselves. I'm not opposed to targeted reliefs with clear productivity conditions, but broad cuts in the hope of a growth dividend are not well-supported by the literature.`;
    benefits = ['Marginal improvement in investment attractiveness metrics', 'Reduced compliance burden at the margin'];
    risks = ['Fiscal multiplier below 1.0 at current rates — deficit-widening without growth offset', 'Revenue shortfall likely to result in public service degradation', 'OBR likely to revise growth forecasts downward, undermining the policy rationale'];
  } else if (c.isHealthcare || c.isEducation) {
    score = c.isPositiveAction ? 4 : -4;
    stance = c.isPositiveAction ? 'positive' : 'negative';
    summary = c.isPositiveAction
      ? `The SROI (Social Return on Investment) on health and education spending is among the highest in the public sector literature. Early childhood education returns £7-£12 per £1 spent over a 20-year horizon. Preventative healthcare saves approximately £3 in acute costs per £1 invested. This is the strongest fiscal case for any spending category. Strongly support.`
      : `This is fiscally illiterate. Human capital investment is the primary driver of long-term productivity growth. Cutting it is analogous to a firm eliminating its R&D budget to save money in a recession — the short-term saving creates a permanently weaker competitive position. The long-run cost is multiples of the apparent saving.`;
    benefits = c.isPositiveAction ? ['High SROI — £7-12 return per £1 in early education', 'Reduces long-term welfare and healthcare spending', 'Improves aggregate productivity and potential output'] : ['Short-term fiscal saving'];
    risks = c.isPositiveAction ? ['Risk of supply constraints — workforce must be in place before spending increases'] : ['Permanent productivity loss', 'Long-term fiscal position worsens as human capital degrades', 'Skills shortage amplifies across entire economy'];
  } else {
    score = c.isPositiveAction ? 1 : -1;
    stance = 'mixed';
    summary = `Preliminary assessment requires a more detailed model specification. Key variables I need to understand: the fiscal multiplier, distributional effects across income deciles, and any supply-side structural implications. My provisional reading: ${c.isPositiveAction ? 'potentially positive, contingent on implementation quality' : 'risks outweigh stated benefits absent stronger evidence'}.`;
    benefits = ['Potential macroeconomic uplift if properly designed'];
    risks = ['Policy design quality is paramount — poorly designed policies can have negative multipliers', 'Distributional effects often differ significantly from headline projections'];
  }

  return { voice: 'economist', stance, impact_score: score, current_impact: score, summary, benefits, risks, confidence: 96 };
};

const nonsenseResult = (id) => ({
  voice: id, stance: 'negative', impact_score: -5, current_impact: -5,
  summary: 'This proposal violates basic economic logic. No credible model produces a positive outcome. I recommend immediate withdrawal.',
  benefits: ['None identifiable'], risks: ['Immediate systemic economic risk', 'Undermines credibility of the policy process'], confidence: 99
});

export const economistDebate = (round, policy, proContext, opponentRole, allyRole, isPos) => {
  const p = snip(policy, 7);
  const voices = {
    1: {
      pro: [`The empirical literature on "${p}" is constructive. Card & Krueger (1994) and subsequent meta-analyses support this direction.`,
            `My models produce a positive multiplier for "${p}" — between 1.2 and 1.8, depending on the financing mechanism.`,
            `The SROI calculation on "${p}" is robust. The data supports implementation with appropriate conditionality.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}that framing ignores the substitution effect and long-run elasticity. The model is incomplete.`,
            `"${p}" has a documented empirical problem: the distributional gains at the median mask significant losses at the tails.`,
            `The Laffer curve implications of "${p}" haven't been addressed. I'm not opposed — I'm waiting for the full model.`],
    },
    2: {
      pro: [`${opponentRole} cites implementation risk. The IMF's 2022 meta-analysis of 42 similar policies shows a 78% positive outcome rate.`,
            `The elasticity argument against "${p}" assumes perfectly competitive markets. We don't have those. The monopsony literature is clear.`,
            `Card-Krueger is routinely misapplied by opponents of "${p}". The actual finding supports this intervention.`],
      con: [`${proContext ? `"${snip(proContext,6)}..." — ` : ''}but the Pigou externality hasn't been priced in. The social cost is understated by at least 30%.`,
            `${opponentRole}'s multiplier assumption breaks down under tight monetary policy. The BoE rate environment changes the calculation.`,
            `"${p}" ignores the general equilibrium effect. Partial equilibrium analysis is insufficient for a policy of this magnitude.`],
    },
    3: {
      pro: [`I support "${p}" conditional on a dynamic scoring mechanism and an annual OBR distributional analysis.`,
            `The fiscal case holds — but I want a 12-month econometric review built into the legislation. Evidence-based policy requires evidence.`,
            `Conditional support. The model is positive. But policy feedback loops require monitoring — make that statutory.`],
      con: [`My conditions: an independent distributional impact analysis, a Pigou correction mechanism, and a 2-year review clause.`,
            `I'll move to conditional support if "${p}" includes an automatic stabiliser trigger based on employment data.`,
            `The economic case is marginal, not conclusive. I need a robust counterfactual assessment before I can vote yes.`],
    },
    4: {
      pro: [`Final: Implement. The weight of empirical evidence — 47 studies, IMF, ILO, OBR — supports "${p}".`,
            `Vote to proceed. The multiplier is positive, the distributional gain is real, and the implementation risk is manageable.`,
            `Implement with conditions: annual econometric review, distributional monitoring, and a feedback mechanism. The economics work.`],
      con: [`Final: reject. The general equilibrium model doesn't hold. "${p}" creates positive partial effects and negative macro outcomes.`,
            `The data doesn't support implementation at this stage. Redesign with better counterfactual modelling and I'll reconsider.`,
            `Reject. The empirical case is insufficient. I require a minimum of three independent econometric reviews before this proceeds.`],
    },
  };
  const pool = voices[round][isPos ? 'pro' : 'con'];
  return pool[Math.floor(Math.random() * pool.length)];
};

const snip = (str, n) => (str || '').split(' ').slice(0, n).join(' ');

