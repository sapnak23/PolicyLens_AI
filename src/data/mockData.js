export const analyzePolicy = (policy, category) => {
  const p = policy.toLowerCase();
  
  // Simple keyword matching for demo purposes
  const isWageIncrease = p.includes('wage') || p.includes('salary') || p.includes('pay');
  const isHousing = p.includes('housing') || p.includes('rent') || p.includes('accommodation');
  const isEducation = p.includes('education') || p.includes('tuition') || p.includes('student');
  const isTax = p.includes('tax') || p.includes('vat');
  const isEnvironment = p.includes('climate') || p.includes('green') || p.includes('carbon');

  return {
    isWageIncrease,
    isHousing,
    isEducation,
    isTax,
    isEnvironment,
    intensity: p.length > 50 ? 'high' : 'medium'
  };
};

export const samplePolicies = [
  {
    title: "Increase Minimum Wage",
    description: "Increase the national minimum wage to £20 per hour for all workers over 18.",
    category: "Economic"
  },
  {
    title: "Rent Cap for Students",
    description: "Implement a 3% annual cap on rent increases for purpose-built student accommodation.",
    category: "Housing"
  },
  {
    title: "Carbon Tax on Imports",
    description: "Introduce a new carbon border adjustment tax on all industrial imports from high-emission countries.",
    category: "Environmental"
  }
];
