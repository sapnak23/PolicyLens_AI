/**
 * Deep Semantic Policy Parser v2
 * Extracts rich, multi-dimensional signals from any plain-English policy.
 */
export const parsePolicy = (policy) => {
  const p = policy.toLowerCase().trim();
  const words = p.split(/\s+/);

  // --- DIRECTIONAL INTENT (weighted verb detection) ---
  const positiveVerbs = /\b(raise|increase|expand|extend|introduce|create|fund|invest|improve|boost|establish|provide|add|build|support|launch|grow|enable|strengthen|reform|mandate|subsidise|subsidize|free|waive|guarantee|protect|enforce)\b/;
  const negativeVerbs = /\b(cut|reduce|lower|decrease|abolish|eliminate|restrict|ban|privatise|privatize|remove|defund|halt|freeze|limit|slash|shrink|end|scrap|repeal|cap|block|stop|delay|withdraw)\b/;

  const isPositiveAction = positiveVerbs.test(p);
  const isNegativeAction = negativeVerbs.test(p);
  const isMandatory = /\b(mandatory|compulsory|require|must|all|universal|ban|illegal|enforce|law|legislation|act)\b/.test(p);
  const isVoluntary = /\b(voluntary|optional|incentive|encourage|recommend|pilot|trial)\b/.test(p);

  // --- POLICY DOMAINS ---
  const domains = {
    wage:        /\b(wage|salary|pay|minimum wage|income|earnings|pay rise|hourly rate|living wage)\b/.test(p),
    housing:     /\b(rent|housing|home|accommodation|property|landlord|tenant|mortgage|affordable home|eviction|build|planning|leasehold|social housing)\b/.test(p),
    environment: /\b(carbon|climate|green|emission|pollution|fossil|renewable|net.?zero|sustainability|biodiversity|rewild|plastic|recycl|solar|wind farm)\b/.test(p),
    tax:         /\b(tax|levy|duty|tariff|surcharge|vat|income tax|corporation tax|council tax|stamp duty|inheritance tax|capital gains)\b/.test(p),
    healthcare:  /\b(nhs|health|hospital|medical|care|doctor|nurse|mental health|medicine|gp|prescription|social care|dentist)\b/.test(p),
    education:   /\b(school|education|university|tuition|student|training|skill|college|apprenticeship|nursery|curriculum|ofsted|teacher)\b/.test(p),
    welfare:     /\b(benefit|welfare|universal credit|pension|disability|allowance|social security|food bank|poverty|child benefit)\b/.test(p),
    transport:   /\b(transport|bus|train|rail|road|motorway|cycling|pedestrian|infrastructure|ev|electric vehicle|freeport)\b/.test(p),
    business:    /\b(business|corporation|company|enterprise|startup|entrepreneur|regulation|red tape|planning permission|planning law)\b/.test(p),
    immigration: /\b(immigration|migrant|asylum|border|visa|points.?based|refugee)\b/.test(p),
    crime:       /\b(crime|police|prison|justice|sentencing|drug|violence|knife|cctv|probation)\b/.test(p),
    defence:     /\b(defence|defense|military|army|nato|security|nuclear|terrorism)\b/.test(p),
  };

  // Dominant domain
  const activeDomains = Object.entries(domains).filter(([,v]) => v).map(([k]) => k);
  const primaryDomain = activeDomains[0] || 'general';

  // --- MAGNITUDE DETECTION ---
  const allNumbers = [...p.matchAll(/(\d+\.?\d*)\s*(%|£|billion|million|thousand|per hour|per week|per year|k\b)?/gi)];
  const mainNumber = allNumbers.length > 0 ? parseFloat(allNumbers[0][1]) : null;
  const mainUnit = allNumbers.length > 0 ? (allNumbers[0][2] || '').toLowerCase() : '';
  const isCurrency = mainUnit.includes('£') || p.includes('£');
  const isHighMagnitude = (mainNumber && (
    (mainUnit.includes('billion')) ||
    (mainUnit.includes('million') && mainNumber > 100) ||
    (mainUnit.includes('%') && mainNumber > 25) ||
    (mainUnit.includes('hour') && mainNumber > 25)
  ));
  const isModerate = mainNumber && !isHighMagnitude;
  const hasSpecificFigure = mainNumber !== null;

  // --- BENEFICIARY ANALYSIS ---
  const benefitsWealthy   = /\b(corporation|business|investor|capital|shareholder|profit|private sector|landlord|developer)\b/.test(p);
  const benefitsWorkers   = /\b(worker|employee|staff|labour|union|working.?class|low.?income|minimum wage|frontline)\b/.test(p);
  const benefitsPublic    = /\b(public|community|citizen|society|national|everyone|all|universal|people|common)\b/.test(p);
  const benefitsYouth     = /\b(young|student|child|youth|generation|future|school)\b/.test(p);
  const benefitsElderly   = /\b(pension|elder|elderly|retire|old age|care home)\b/.test(p);

  // --- SENTIMENT DIRECTION ---
  // "Raise minimum wage" → positive for workers
  // "Cut corporation tax" → positive for wealthy
  // "Ban fossil fuels" → negative for fossil industry, positive for environment
  const netSentimentForWorkers = (benefitsWorkers && isPositiveAction) ? 'positive' :
                                  (benefitsWorkers && isNegativeAction) ? 'negative' : 'neutral';

  // --- LEGITIMACY CHECK ---
  const isNonsense = p.length < 8 ||
    /\b(infinite|destroy everything|delete all|kill|nonsense|garbage|test123|lorem ipsum|asdf)\b/.test(p) ||
    words.length < 3;

  // --- CONTRADICTION DETECTION ---
  // e.g. "raise taxes and cut spending" — conflicting signals
  const hasConflict = isPositiveAction && isNegativeAction;

  // Clean summary phrase
  const subject = policy.trim().split(' ').slice(0, 6).join(' ');

  return {
    raw: policy,
    subject,
    primaryDomain,
    activeDomains,
    isPositiveAction,
    isNegativeAction,
    isMandatory,
    isVoluntary,
    hasConflict,
    // Domain flags
    isWage: domains.wage,
    isHousing: domains.housing,
    isEnvironment: domains.environment,
    isTax: domains.tax,
    isHealthcare: domains.healthcare,
    isEducation: domains.education,
    isWelfare: domains.welfare,
    isTransport: domains.transport,
    isBusiness: domains.business,
    isImmigration: domains.immigration,
    // Numbers
    mainNumber,
    mainUnit,
    isCurrency,
    isHighMagnitude,
    isModerate,
    hasSpecificFigure,
    // Beneficiaries
    benefitsWealthy,
    benefitsWorkers,
    benefitsPublic,
    benefitsYouth,
    benefitsElderly,
    netSentimentForWorkers,
    // Validity
    isNonsense,
    direction: isNegativeAction && !isPositiveAction ? 'negative'
             : isPositiveAction && !isNegativeAction ? 'positive'
             : 'mixed',
  };
};
