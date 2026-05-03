/**
 * Knowledge Integration Engine
 * Handles "Internet Data" simulation and "Previous Comments" memory.
 */

export class KnowledgeEngine {
  constructor() {
    this.memoryKey = 'policylens_memory';
  }

  // 1. Train on Previous Comments (Memory)
  saveSession(policy, category, verdict) {
    const memory = this.getMemory();
    memory.push({
      timestamp: new Date().toISOString(),
      policy: policy,
      category: category,
      verdictRating: verdict.overall_rating,
      keyPivot: verdict.who_benefits_most
    });
    // Keep only the last 10 sessions to avoid Bloat
    if (memory.length > 10) memory.shift();
    localStorage.setItem(this.memoryKey, JSON.stringify(memory));
  }

  getMemory() {
    try {
      return JSON.parse(localStorage.getItem(this.memoryKey)) || [];
    } catch {
      return [];
    }
  }

  getRelevantHistory(currentPolicy) {
    const memory = this.getMemory();
    if (memory.length === 0) return null;

    // Find a similar past policy (simplified check)
    const pLow = currentPolicy.toLowerCase();
    const isWage = pLow.includes('wage') || pLow.includes('pay');
    const isHousing = pLow.includes('rent') || pLow.includes('housing');
    
    let relevantMatch = memory.find(m => {
      const mLow = m.policy.toLowerCase();
      return (isWage && (mLow.includes('wage') || mLow.includes('pay'))) ||
             (isHousing && (mLow.includes('rent') || mLow.includes('housing')));
    });

    if (relevantMatch) {
      return `Building on our previous deliberation regarding '${relevantMatch.policy.substring(0, 20)}...' which concluded with a '${relevantMatch.verdictRating}' rating, we must update our stance.`;
    }
    return null;
  }

  // 2. Train on Internet (Live Context Simulation)
  getLiveInternetContext(topic) {
    // In a real production app, this would be an API call to a search engine or LLM.
    // For the Hackathon demo, we simulate fetching live web statistics.
    const liveData = {
      wages: [
        "According to a live web scrape of the ONS, inflation dropped to 2.1% this morning.",
        "Trending online: 450,000 workers signed a petition today demanding this exact intervention.",
        "Live market data shows SME confidence indices are currently at a 5-year low."
      ],
      housing: [
        "Live Rightmove API data shows urban rents spiked 1.4% in the last 72 hours alone.",
        "Internet sentiment analysis indicates a 400% surge in 'eviction' searches today.",
        "Live financial feeds show construction material costs have stabilized globally."
      ],
      environment: [
        "Live global feeds show atmospheric CO2 crossed 425ppm this week.",
        "Trending on social media: major protests are currently mobilizing around this issue.",
        "Live commodity markets show the price of renewable lithium has dropped 3% today."
      ],
      critical: [
        "Real-time social media sentiment on this proposal is currently 98% negative.",
        "Live market feeds indicate severe capital flight warnings if this is pursued.",
        "Internet scraping shows zero credible economic institutions supporting this approach."
      ],
      general: [
        "Live polling data aggregated from the web shows a 50/50 split on this approach.",
        "Trending news feeds highlight this exact issue as the primary concern for voters today.",
        "Real-time economic indicators suggest the market is extremely volatile right now."
      ]
    };

    const pool = liveData[topic] || liveData.general;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
