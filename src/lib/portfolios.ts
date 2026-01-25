// Mock portfolio data for PM Research
export interface PortfolioPosition {
    id: string;
    ticker: string;
    name: string;
    assetClass: "AI Hardware" | "Cloud/AI" | "Consumer Tech" | "Search/AI" | "E-Commerce" | "Social/AI" | "Auto/Robotics" | "Digital Assets" | "Space" | "Quantum" | "Grid Infrastructure" | "Data Center";
    entryPrice: number;
    ytdReferencePrice: number; // Dec 31, 2025 close price (or entry price if bought in 2026)
    currentPrice: number;
    returnPercent: number;
    status: "Open" | "Closed";
    entryDate?: string; // Made optional as new data doesn't include it
    pmScore: number;
}

// Mag 7 + BTC (Equally Weighted Strategy)
// Entry prices represent fictional "2026 Open" baseline
export const corePortfolio: PortfolioPosition[] = [
    {
        id: "NVDA",
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        assetClass: "AI Hardware",
        entryPrice: 189.84, // Jan 2, 2026 Open
        ytdReferencePrice: 137.49, // Dec 31, 2025 Close
        currentPrice: 186.23, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 98,
    },
    {
        id: "MSFT",
        ticker: "MSFT",
        name: "Microsoft Corp",
        assetClass: "Cloud/AI",
        entryPrice: 472.94, // Jan 2, 2026 Open
        ytdReferencePrice: 421.05, // Dec 31, 2025 Close
        currentPrice: 459.86, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 94,
    },
    {
        id: "AAPL",
        ticker: "AAPL",
        name: "Apple Inc.",
        assetClass: "Consumer Tech",
        entryPrice: 271.01, // Jan 2, 2026 Open
        ytdReferencePrice: 242.84, // Dec 31, 2025 Close
        currentPrice: 255.53, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 89,
    },
    {
        id: "GOOGL",
        ticker: "GOOGL",
        name: "Alphabet Inc.",
        assetClass: "Search/AI",
        entryPrice: 315.15, // Jan 2, 2026 Open
        ytdReferencePrice: 190.23, // Dec 31, 2025 Close
        currentPrice: 330.00, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 91,
    },
    {
        id: "AMZN",
        ticker: "AMZN",
        name: "Amazon.com Inc.",
        assetClass: "E-Commerce",
        entryPrice: 226.50, // Jan 2, 2026 Open
        ytdReferencePrice: 223.15, // Dec 31, 2025 Close
        currentPrice: 239.36, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 90,
    },
    {
        id: "META",
        ticker: "META",
        name: "Meta Platforms",
        assetClass: "Social/AI",
        entryPrice: 650.41, // Jan 2, 2026 Open
        ytdReferencePrice: 579.18, // Dec 31, 2025 Close
        currentPrice: 620.16, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 93,
    },
    {
        id: "TSLA",
        ticker: "TSLA",
        name: "Tesla Inc.",
        assetClass: "Auto/Robotics",
        entryPrice: 438.07, // Jan 2, 2026 Open
        ytdReferencePrice: 410.44, // Dec 31, 2025 Close
        currentPrice: 437.50, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 87,
    },
    {
        id: "BTC-USD",
        ticker: "BTC-USD",
        name: "Bitcoin",
        assetClass: "Digital Assets",
        entryPrice: 88733.07, // Jan 2, 2026 Open
        ytdReferencePrice: 93354.54, // Dec 31, 2025 Close
        currentPrice: 92480.52, // Jan 19, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 85,
    },
];

// PM Research Innovation Portfolio
// High-conviction plays from our research coverage
export const innovationPortfolio: PortfolioPosition[] = [
    {
        id: "RKLB",
        ticker: "RKLB",
        name: "Rocket Lab USA",
        assetClass: "Space",
        entryPrice: 28.50, // Jan 2, 2026 Open
        ytdReferencePrice: 25.12, // Dec 31, 2025 Close
        currentPrice: 27.85, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 95,
    },
    {
        id: "SMCI",
        ticker: "SMCI",
        name: "Super Micro Computer",
        assetClass: "Data Center",
        entryPrice: 32.80, // Jan 2, 2026 Open
        ytdReferencePrice: 29.45, // Dec 31, 2025 Close
        currentPrice: 31.15, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 92,
    },
    {
        id: "VRT",
        ticker: "VRT",
        name: "Vertiv Holdings",
        assetClass: "Data Center",
        entryPrice: 132.50, // Jan 2, 2026 Open
        ytdReferencePrice: 118.75, // Dec 31, 2025 Close
        currentPrice: 128.92, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 91,
    },
    {
        id: "AVGO",
        ticker: "AVGO",
        name: "Broadcom Inc.",
        assetClass: "AI Hardware",
        entryPrice: 242.50, // Jan 2, 2026 Open
        ytdReferencePrice: 225.80, // Dec 31, 2025 Close
        currentPrice: 238.75, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 94,
    },
    {
        id: "IONQ",
        ticker: "IONQ",
        name: "IonQ Inc.",
        assetClass: "Quantum",
        entryPrice: 42.75, // Jan 2, 2026 Open
        ytdReferencePrice: 38.20, // Dec 31, 2025 Close
        currentPrice: 40.55, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 88,
    },
];

// PM Research Robotics Portfolio
// Pure-play robotics and automation
export const roboticsPortfolio: PortfolioPosition[] = [
    {
        id: "ISRG",
        ticker: "ISRG",
        name: "Intuitive Surgical",
        assetClass: "Auto/Robotics",
        entryPrice: 580.25, // Jan 2, 2026 Open
        ytdReferencePrice: 545.80, // Dec 31, 2025 Close
        currentPrice: 572.40, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 94,
    },
    {
        id: "IRBT",
        ticker: "IRBT",
        name: "iRobot Corporation",
        assetClass: "Auto/Robotics",
        entryPrice: 12.50, // Jan 2, 2026 Open
        ytdReferencePrice: 10.25, // Dec 31, 2025 Close
        currentPrice: 11.85, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 78,
    },
    {
        id: "ABB",
        ticker: "ABB",
        name: "ABB Ltd",
        assetClass: "Auto/Robotics",
        entryPrice: 55.80, // Jan 2, 2026 Open
        ytdReferencePrice: 52.15, // Dec 31, 2025 Close
        currentPrice: 54.25, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 86,
    },
    {
        id: "FANUY",
        ticker: "FANUY",
        name: "Fanuc Corporation",
        assetClass: "Auto/Robotics",
        entryPrice: 14.20, // Jan 2, 2026 Open
        ytdReferencePrice: 13.45, // Dec 31, 2025 Close
        currentPrice: 13.95, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 82,
    },
    {
        id: "PATH",
        ticker: "PATH",
        name: "UiPath Inc.",
        assetClass: "Auto/Robotics",
        entryPrice: 15.75, // Jan 2, 2026 Open
        ytdReferencePrice: 14.20, // Dec 31, 2025 Close
        currentPrice: 15.10, // Jan 24, 2026 Close
        returnPercent: 0,
        status: "Open",
        pmScore: 85,
    },
];

// Portfolio configuration for dropdown
export interface PortfolioConfig {
    id: string;
    name: string;
    description: string;
    data: PortfolioPosition[];
}

export const portfolioConfigs: PortfolioConfig[] = [
    {
        id: "mag7",
        name: "PM Research Portfolio",
        description: "Mag 7 + Bitcoin - Core Holdings",
        data: corePortfolio,
    },
    {
        id: "innovation",
        name: "Innovation Portfolio",
        description: "High-Conviction Research Picks",
        data: innovationPortfolio,
    },
    {
        id: "robotics",
        name: "Robotics Portfolio",
        description: "Pure-Play Automation & Robotics",
        data: roboticsPortfolio,
    },
];

// Mock research notes
export interface ResearchNote {
    id: string;
    title: string;
    summary: string;
    fullContent: string;
    date: string;
    pmScore: number;
    category: "Alpha Signal" | "Sector Analysis" | "Risk Alert" | "Deep Dive";
    readTime: string;
    relatedTickers?: string[];
    author?: string;
}

export const researchNotes: ResearchNote[] = [
    {
        id: "r1",
        title: "AI Infrastructure: The Next Wave of CAPEX",
        summary: "Beyond the GPU: Why liquid cooling, custom silicon, and edge inference define the 2026 alpha generation landscape.",
        fullContent: `
## The CAPEX Supercycle
The market consensus underestimates the duration of the current infrastructure buildout. Hyperscaler CAPEX is projected to hit **$240B in 2026** (up 18% YoY), but the mix is shifting. The "Easy Money" phase of buying generic H100 clusters is over; the "Efficiency Phase" has begun.

### 1. The Power Bottleneck & Liquid Cooling
Data center power density has tripled in 3 years. Air cooling hits a physical wall at 40kW/rack. The GB200 NVL72 rack requires ~120kW. This is a binary event for liquid cooling providers.
*   **Bull Thesis**: Vertiv (VRT) and SMCI are not just "hardware" plays; they are critical path utilities for the AI economy.
*   **The Alpha**: Look for component suppliers (connectors, CDUs) rather than just integrators.

### 2. Custom Silicon vs. Merchant Silicon
While NVIDIA remains King, the hyperscalers (Amazon Inferentia, Google Axion, Microsoft Maia) are aggressively vertically integrating.
*   **Implication**: Pure-play foundry revenue (TSMC) is a safer long-term bet than single-chip designers if competition compresses margins.
*   **Watch**: Broadcom (AVGO) as the "Arms Dealer" for custom ASICs.

### 3. Edge Inference: The Next Frontier
Training models requires massive centralized clusters. *Running* them (inference) requires proximity to the user. We expect a massive re-rating of edge-compute providers and localized datacenters.

## Thesis Conclusion
We are rotating exposure from "Generic AI Beta" (indices) to "Infrastructure Alpha" (Thermal Management & Custom Silicon). The easy money is made; now we hunt for specific technical moats.
    `,
        date: "2026-01-15",
        pmScore: 96,
        category: "Deep Dive",
        readTime: "12 min",
        relatedTickers: ["NVDA", "SMCI", "VRT", "AVGO"],
        author: "S. Cohen, Chief Strat."
    },
    {
        id: "r2",
        title: "Orbital Economy: Commercial Space Inflection",
        summary: "Rocket Lab emerges as the clear second entrant. Launch cadence data reveals market opportunity.",
        fullContent: `
## Market Overview
The commercial space sector has reached an inflection point with launch costs declining 40% YoY.

## Competitive Landscape
Rocket Lab (RKLB) has established itself as the clear #2 launch provider, with Electron achieving unprecedented reliability metrics.

## Alpha Generation
Our proprietary launch tracking data shows RKLB's manifest is 85% booked through 2027, providing revenue visibility rarely seen in the sector.

## Risk Factors
- SpaceX pricing pressure
- Neutron development timeline
- Regulatory headwinds

## PM Score: 95
Strong conviction based on: launch cadence, backlog growth, Neutron progress.
    `,
        date: "2026-01-12",
        pmScore: 95,
        category: "Alpha Signal",
        readTime: "8 min",
    },
    {
        id: "r3",
        title: "Quantum Computing: Timeline Acceleration",
        summary: "Error correction breakthroughs suggest commercial viability sooner than consensus expects.",
        fullContent: `
## Thesis Update
Recent breakthroughs in quantum error correction have materially changed our timeline thesis.

## Technical Development
- Google's Willow chip demonstrated below-threshold error rates
- IonQ's algorithmic improvements showing 3x performance gains
- Enterprise pilot programs expanding rapidly

## Investment Implications
The quantum computing timeline has compressed from "10+ years" to "3-5 years" for initial commercial applications.

## Position Update
Initiating coverage on quantum pure-plays with PM Score methodology.
    `,
        date: "2026-01-10",
        pmScore: 88,
        category: "Sector Analysis",
        readTime: "10 min",
    },
    {
        id: "r4",
        title: "Risk Alert: Automation Sector Headwinds",
        summary: "Enterprise software spending deceleration impacting automation valuations.",
        fullContent: `
## Alert Summary
We're issuing a risk alert for the automation sector based on our enterprise spending analysis.

## Key Concerns
1. Budget cycles extending from Q1 to Q3
2. AI co-pilot adoption cannibalizing RPA budgets
3. Competition intensifying from hyperscaler offerings

## Affected Positions
- PATH: Reducing conviction, PM Score lowered to 85
- Monitoring for further deterioration

## Recommended Action
Trim automation exposure, rotate to AI infrastructure.
    `,
        date: "2026-01-08",
        pmScore: 72,
        category: "Risk Alert",
        readTime: "5 min",
    },
    {
        id: "r5",
        title: "Energy Transition: Grid Infrastructure Play",
        summary: "Electrification thesis points to grid modernization as the next multi-decade opportunity.",
        fullContent: `
## Macro Thesis
The energy transition is shifting from generation (solar/wind) to infrastructure (grid, storage, transmission).

## Investment Opportunity
Grid infrastructure companies are positioned for a multi-decade growth runway.

## Key Metrics
- US grid investment needs: $2.5T through 2035
- Current infrastructure utilization: 87%
- Regulatory tailwinds: IRA spending acceleration

## PM Research Watchlist
Adding grid infrastructure names to our coverage universe.
    `,
        date: "2026-01-05",
        pmScore: 82,
        category: "Sector Analysis",
        readTime: "7 min",
    },
    {
        id: "r6",
        title: "SMR Nuclear: The AI Power Renaissance",
        summary: "Small Modular Reactors emerge as the definitive solution for hyperscaler energy demands. Meta-Oklo and NuScale-Entra1 partnerships signal a new nuclear supercycle.",
        fullContent: `
## The AI Energy Crisis

The artificial intelligence revolution has created an unprecedented energy paradox: the most valuable companies on Earth cannot find enough electricity to power their growth. Global data center power demand is projected to surge **165% by 2030**, with the IEA forecasting annual consumption of 945 terawatt-hours—equivalent to Japan's entire national electricity usage. This is not a distant concern; it is a **present-tense capital allocation crisis**.

Traditional grid infrastructure cannot scale fast enough. Renewable intermittency creates reliability gaps incompatible with 99.999% uptime requirements. The market is mispricing the urgency—and the solution.

### The SMR Thesis

Small Modular Reactors (SMRs) represent the technological convergence of three critical requirements:
*   **Baseload Reliability**: 90%+ capacity factors vs. 25-35% for solar/wind
*   **Carbon Neutrality**: Zero operational emissions, satisfying ESG mandates
*   **Scalable Deployment**: Factory-built, site-assembled, 300MW-1GW modules

The SMR market is projected to reach **$7B in 2026** and accelerate to **$18.7B by 2040**. But the real alpha is not in market sizing—it's in understanding *who* is buying.

## Hyperscaler Validation

### Meta-Oklo Partnership (1.2 GW)
The definitive signal arrived in late 2025: Meta committed to purchasing up to **1.2 gigawatts** of nuclear capacity from Oklo Inc. This is not a press release—it is an anchor customer providing capital commitment visibility that de-risks the entire Oklo business model. BofA upgraded OKLO to Buy with a $127 price target following this announcement.

### NuScale-Entra1 Strategic Alliance
NuScale Power, holder of the *only* NRC-certified SMR design, entered a global partnership with Entra1 Energy. The catalyst: up to **$25 billion in capital** from Japan's $550B U.S. investment initiative, targeting SMR deployments for AI data centers, manufacturing, and defense. NuScale is also collaborating with the Tennessee Valley Authority on a **6-gigawatt SMR program**—the largest announced SMR initiative in U.S. history.

### The NVIDIA Signal
Jensen Huang has publicly emphasized that SMRs are essential for powering the next generation of AI infrastructure. When the CEO of the world's most valuable semiconductor company identifies your technology as critical path, the market should listen.

## Alpha Extraction

### Bull Thesis
The SMR sector is transitioning from "speculative technology bet" to "contracted infrastructure play." The hyperscaler partnerships provide:
*   Multi-year revenue visibility (previously absent)
*   Creditworthy counterparties (Meta, TVA)
*   Regulatory de-risking through institutional backing

### The Trade
*   **OKLO**: Pre-revenue but now with anchor customer. First commercial operations expected late 2027. Current valuation prices in execution risk, but the Meta deal fundamentally changes the risk/reward calculus.
*   **SMR (NuScale)**: First-mover regulatory advantage. The Entra1 partnership and TVA program provide multiple shots on goal. Oak Ridge National Laboratory validation confirms technical readiness.
*   **CEG (Constellation Energy)**: The "picks and shovels" play. Largest U.S. nuclear operator with existing fleet optionality and SMR integration capabilities.

### Technical Moat Analysis
NuScale's NRC certification represents a **5-7 year head start** on competitors. This is not easily replicated. The regulatory barrier creates a natural oligopoly structure that investors systematically undervalue.

## Risk Factors

*   **Execution Timeline**: Commercial operations remain 18-24 months away for lead projects
*   **Cost Overruns**: The Idaho National Lab cancellation (2023) remains a cautionary data point
*   **Valuation Sensitivity**: OKLO trades at speculative multiples; any delay creates significant downside
*   **Policy Risk**: Nuclear permitting reform remains incomplete; regulatory friction persists

## PM Research Conviction

We are initiating coverage on the SMR nuclear sector with a **PM Score of 91**. The hyperscaler validation fundamentally changes the investment thesis from "technology speculation" to "infrastructure deployment." The AI power crisis is structural and multi-year; SMRs are the highest-conviction solution.

### Position Sizing
This is a barbell trade: combine the high-beta pure-plays (OKLO, SMR) with the stable cash-flow generator (CEG) to manage volatility while maintaining exposure to the nuclear renaissance.
    `,
        date: "2026-01-26",
        pmScore: 91,
        category: "Alpha Signal",
        readTime: "14 min",
        relatedTickers: ["OKLO", "SMR", "CEG"],
        author: "PM Research Alpha Desk"
    },
];
