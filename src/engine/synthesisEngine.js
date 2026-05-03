export const synthesizeResults = (agentResults, policy) => {
  const scores = agentResults.map(r => r.impact_score);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Determine winners and losers
  const sorted = [...agentResults].sort((a, b) => b.impact_score - a.impact_score);
  const benefitsMost = sorted[0].voice;
  const harmedMost = sorted[sorted.length - 1].voice;

  // Rating mapping
  let rating = "Neutral";
  if (averageScore > 2.5) rating = "Highly Favorable";
  else if (averageScore > 0.5) rating = "Favorable";
  else if (averageScore < -2.5) rating = "Highly Critical";
  else if (averageScore < -0.5) rating = "Critical";

  // Dynamic Trade-offs analysis (Polished for Realism)
  const tradeOffs = [
    { text: `The core tension lies between the ${benefitsMost.replace('_', ' ')}'s optimism regarding ${sorted[0].benefits[0].toLowerCase()} and the ${harmedMost.replace('_', ' ')}'s acute fear of ${sorted[sorted.length - 1].risks[0].toLowerCase()}.` },
    { text: `We're seeing a direct clash between long-term systemic gains and the immediate 'sticker shock' of operational costs. The room is split on who should bear that initial burden.` },
    { text: `There's a significant 'trust gap' here: the ${benefitsMost.replace('_', ' ')} is looking at a best-case scenario, while the ${harmedMost.replace('_', ' ')} is modeling for survival. Those two worlds haven't met in the middle yet.` }
  ];

  // Final recommendation (Human-Centric & Real)
  const favorability = agentResults.filter(r => r.current_impact > 0).length;
  const criticalVoices = agentResults.filter(r => r.current_impact < -2).map(a => a.voice.replace('_', ' '));
  const proVoices = agentResults.filter(r => r.current_impact > 2).map(a => a.voice.replace('_', ' '));
  
  let recommendation = "";
  
  if (favorability >= 6) {
    recommendation = `The room is surprisingly aligned: "${policy}" has a clear path forward. While the ${harmedMost.replace('_', ' ')} still has some valid nerves about ${sorted[sorted.length-1].risks[0].toLowerCase()}, the collective momentum is too strong to ignore. We recommend a full green-light, but keep a close eye on those specific implementation friction points in the first quarter.`;
  } else if (favorability >= 4) {
    recommendation = `We have a 'soft yes', but it's fragile. There's a real appetite to move on "${policy}", but the ${criticalVoices.length > 0 ? criticalVoices.join(' and ') : 'skeptics'} won't sign off without iron-clad guarantees. It's a classic case of balancing high-level growth against ground-level pain. Our advice? Don't rush it. Build in a 12-month pilot phase and fix the ${sorted[sorted.length-1].risks[0].toLowerCase()} issues before a total rollout.`;
  } else if (favorability >= 2) {
    recommendation = `Honestly? This is a tough sell. The deliberation exposed some deep, structural fractures that "${policy}" just doesn't bridge yet. For every win for the ${benefitsMost.replace('_', ' ')}, there's a serious blow to the ${harmedMost.replace('_', ' ')}. You're looking at a deeply contested implementation. We suggest going back to the drawing board—specifically to address the ${sorted[sorted.length-1].risks[0].toLowerCase()}—before this hits the real world.`;
  } else {
    recommendation = `The consensus is effectively a 'stop'. The room feels that "${policy}" is fundamentally misaligned with current economic realities. The risks to ${harmedMost.replace('_', ' ')} are seen as terminal rather than manageable. Unless you can radically shift the value proposition for the ${criticalVoices.join(', ')}, proceeding now would likely trigger a systemic backlash. It's time for a total redesign.`;
  }

  return {
    overall_rating: rating,
    average_score: averageScore.toFixed(1),
    who_benefits_most: benefitsMost.charAt(0).toUpperCase() + benefitsMost.slice(1).replace('_', ' '),
    who_is_harmed_most: harmedMost.charAt(0).toUpperCase() + harmedMost.slice(1).replace('_', ' '),
    major_trade_offs: tradeOffs,
    final_recommendation: recommendation
  };
};
