/**
 * Security Agent - Software & Cyber Security Perspective
 * Analyzes policy implementation from a safety and technical risk standpoint.
 */

export const analyzeSecurity = (policy, category) => {
  const p = policy.toLowerCase();
  
  // Logic to determine risk based on keywords
  const isDataHeavy = p.includes('data') || p.includes('privacy') || p.includes('user') || p.includes('personal');
  const isFinancial = p.includes('money') || p.includes('pay') || p.includes('tax') || p.includes('finance');
  const isRegulation = p.includes('law') || p.includes('mandate') || p.includes('regulation');
  const isSoftware = p.includes('software') || p.includes('app') || p.includes('code') || p.includes('system');

  let riskLevel = "low";
  let score = 90; // High score = safer

  if (isFinancial || isDataHeavy) {
    riskLevel = "medium";
    score = 65;
  }
  if (isSoftware && (isDataHeavy || isFinancial)) {
    riskLevel = "high";
    score = 35;
  }

  // Predefined threat pools
  const threatPool = {
    high: [
      "Supply Chain Vulnerability in Automated Implementations",
      "Large-scale Credential Phishing via Policy Misuse",
      "Systemic Privacy Leakage in Distributed Data Silos"
    ],
    medium: [
      "Insecure API Endpoints for Stakeholder Data Sharing",
      "Social Engineering targeting Policy Beneficiaries",
      "Local Storage Mismanagement of Sensitive Credentials"
    ],
    low: [
      "Minor Configuration Drift in Public Dashboards",
      "Superficial UI Spoofing of Policy Materials",
      "Low-impact Metadata Exposure"
    ]
  };

  const consequencesPool = {
    high: [
      "Permanent erosion of public trust in digital governance.",
      "Systemic financial exposure across the entire SME sector.",
      "Multi-decade litigation cycle over mass privacy violations."
    ],
    medium: [
      "Intermittent service disruptions during high-load periods.",
      "Gradual accumulation of shadow IT systems to bypass restrictions.",
      "Increased operational overhead for security auditing."
    ],
    low: [
      "Negligible impact on the long-term technical debt.",
      "Minor adjustments required for annual compliance reviews.",
      "Normal evolution of standard security patches."
    ]
  };

  return {
    voice: "security_agent",
    risk_level: riskLevel,
    risk_score: score,
    summary: `From a technical implementation standpoint, "${policy}" presents a ${riskLevel} risk profile. Our primary concern is how the underlying software systems will handle the ${isDataHeavy ? 'large-scale data processing' : 'standard transactional requirements'} without introducing new attack surfaces.`,
    top_threats: threatPool[riskLevel],
    long_term_consequences: consequencesPool[riskLevel],
    recommended_safeguards: [
      "Implement Zero-Trust Architecture for all internal data pivots.",
      "Enforce hardware-level isolation for sensitive policy execution.",
      "Regular automated penetration testing of implementation endpoints."
    ],
    vulnerabilities: [
      { name: "Identity Spoofing", risk: "High", impact: "Unauthorized policy benefit claims" },
      { name: "Data Exfiltration", risk: "Medium", impact: "Leakage of stakeholder sentiment metadata" },
      { name: "Logic Manipulation", risk: "Low", impact: "Minor distortion of aggregate deliberation results" }
    ],
    mitigations: [
      { step: "Multi-Factor Auth", effort: "Low", benefit: "Critical" },
      { step: "End-to-End Encryption", effort: "Medium", benefit: "High" },
      { step: "Air-gapped Storage", effort: "High", benefit: "Maximum" }
    ],
    compliance: {
      gdpr: score > 70 ? "Pass" : "Review Required",
      nist: score > 50 ? "Aligned" : "Gaps Detected",
      iso27001: score > 80 ? "Certified" : "Non-Compliant"
    },
    confidence_level: 85,
    is_secure: score > 50
  };
};
