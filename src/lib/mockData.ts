// Mock portfolio data for PM Research
export interface PortfolioPosition {
    id: string;
    ticker: string;
    name: string;
    assetClass: "AI" | "Orbital" | "Automation" | "Quantum" | "Energy";
    entryPrice: number;
    currentPrice: number;
    returnPercent: number;
    status: "Open" | "Closed";
    entryDate: string;
    pmScore: number;
}

export const mockPortfolio: PortfolioPosition[] = [
    {
        id: "1",
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        assetClass: "AI",
        entryPrice: 450.25,
        currentPrice: 875.30,
        returnPercent: 94.4,
        status: "Open",
        entryDate: "2024-01-15",
        pmScore: 98,
    },
    {
        id: "2",
        ticker: "PLTR",
        name: "Palantir Technologies",
        assetClass: "AI",
        entryPrice: 16.80,
        currentPrice: 24.35,
        returnPercent: 44.9,
        status: "Open",
        entryDate: "2024-02-20",
        pmScore: 92,
    },
    {
        id: "3",
        ticker: "RKLB",
        name: "Rocket Lab USA",
        assetClass: "Orbital",
        entryPrice: 4.25,
        currentPrice: 8.90,
        returnPercent: 109.4,
        status: "Open",
        entryDate: "2024-03-05",
        pmScore: 95,
    },
    {
        id: "4",
        ticker: "IONQ",
        name: "IonQ Inc",
        assetClass: "Quantum",
        entryPrice: 8.50,
        currentPrice: 12.75,
        returnPercent: 50.0,
        status: "Open",
        entryDate: "2024-04-10",
        pmScore: 88,
    },
    {
        id: "5",
        ticker: "PATH",
        name: "UiPath Inc",
        assetClass: "Automation",
        entryPrice: 18.40,
        currentPrice: 22.10,
        returnPercent: 20.1,
        status: "Open",
        entryDate: "2024-05-15",
        pmScore: 85,
    },
    {
        id: "6",
        ticker: "ASTR",
        name: "Astra Space",
        assetClass: "Orbital",
        entryPrice: 2.15,
        currentPrice: 1.45,
        returnPercent: -32.6,
        status: "Closed",
        entryDate: "2024-01-20",
        pmScore: 45,
    },
    {
        id: "7",
        ticker: "SMCI",
        name: "Super Micro Computer",
        assetClass: "AI",
        entryPrice: 285.00,
        currentPrice: 920.50,
        returnPercent: 223.0,
        status: "Open",
        entryDate: "2024-02-01",
        pmScore: 96,
    },
    {
        id: "8",
        ticker: "ENPH",
        name: "Enphase Energy",
        assetClass: "Energy",
        entryPrice: 132.50,
        currentPrice: 118.20,
        returnPercent: -10.8,
        status: "Closed",
        entryDate: "2024-03-12",
        pmScore: 62,
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

export const mockResearchNotes: ResearchNote[] = [
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
];
