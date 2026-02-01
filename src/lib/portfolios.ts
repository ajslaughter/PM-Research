// Portfolio data for PM Research

// Simplified portfolio position - just ticker and weight
// All other data (name, assetClass, yearlyClose, pmScore) comes from stockDatabase
export interface PortfolioPosition {
    ticker: string;
    weight: number; // Percentage (0-100), should sum to 100 per portfolio
}

// Portfolio category for filtering
export type PortfolioCategory = 'Magnificent 7' | 'AI Infrastructure' | 'Energy Renaissance' | 'Physical AI';

// Portfolio structure
export interface Portfolio {
    id: string;
    name: string;
    description: string;
    category: PortfolioCategory;
    positions: PortfolioPosition[];
}

// AI Infrastructure Portfolio Tickers
export const AI_Infrastructure_Portfolio = ['IREN', 'CORZ', 'CRWV', 'APLD', 'NBIS'];

// Energy Renaissance Portfolio Tickers
export const Energy_Renaissance_Portfolio = ['CEG', 'OKLO', 'VRT', 'BWXT'];

// Physical AI Portfolio Tickers
export const Physical_AI_Portfolio = ['ISRG', 'TER', 'RKLB', 'TSLA'];

// Default portfolios
export const defaultPortfolios: Portfolio[] = [
    {
        id: "pm-research",
        name: "PM Research Portfolio",
        description: "Mag 7 + Bitcoin - Core Holdings",
        category: "Magnificent 7",
        positions: [
            { ticker: "NVDA", weight: 12.5 },
            { ticker: "MSFT", weight: 12.5 },
            { ticker: "AAPL", weight: 12.5 },
            { ticker: "GOOGL", weight: 12.5 },
            { ticker: "AMZN", weight: 12.5 },
            { ticker: "META", weight: 12.5 },
            { ticker: "TSLA", weight: 12.5 },
            { ticker: "BTC-USD", weight: 12.5 },
        ],
    },
    {
        id: "innovation",
        name: "Innovation Portfolio",
        description: "High-Growth Tech & Space",
        category: "Magnificent 7",
        positions: [
            { ticker: "RKLB", weight: 20 },
            { ticker: "SMCI", weight: 20 },
            { ticker: "VRT", weight: 20 },
            { ticker: "AVGO", weight: 20 },
            { ticker: "IONQ", weight: 20 },
        ],
    },
    {
        id: "robotics",
        name: "Robotics Portfolio",
        description: "Automation & Robotics",
        category: "Magnificent 7",
        positions: [
            { ticker: "ISRG", weight: 25 },
            { ticker: "ABB", weight: 25 },  // NYSE ticker (corrected from ABBNY)
            { ticker: "FANUY", weight: 25 },
            { ticker: "PATH", weight: 25 },
        ],
    },
    {
        id: "ai-infrastructure",
        name: "AI Infrastructure Portfolio",
        description: "Data Centers, Mining & Compute Infrastructure",
        category: "AI Infrastructure",
        positions: [
            { ticker: "IREN", weight: 20 },
            { ticker: "CORZ", weight: 20 },
            { ticker: "CRWV", weight: 20 },
            { ticker: "APLD", weight: 20 },
            { ticker: "NBIS", weight: 20 },
        ],
    },
    {
        id: "energy-renaissance",
        name: "Energy Renaissance Portfolio",
        description: "Nuclear, Grid & Power Infrastructure",
        category: "Energy Renaissance",
        positions: [
            { ticker: "CEG", weight: 25 },
            { ticker: "OKLO", weight: 25 },
            { ticker: "VRT", weight: 25 },
            { ticker: "BWXT", weight: 25 },
        ],
    },
    {
        id: "physical-ai",
        name: "Physical AI Portfolio",
        description: "Robotics, Automation & Embodied AI",
        category: "Physical AI",
        positions: [
            { ticker: "ISRG", weight: 25 },
            { ticker: "TER", weight: 25 },
            { ticker: "RKLB", weight: 25 },
            { ticker: "TSLA", weight: 25 },
        ],
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
        fullContent: `## Market Overview

The commercial space sector has reached a decisive inflection point. Launch costs have declined **40% YoY**, driven by reusability advances and increased competition. The market is transitioning from "access to space" (the SpaceX era) to "space as infrastructure" (the next decade).

### The Addressable Market

*   **Launch Services**: $15B annually by 2028, growing 12% CAGR
*   **Satellite Manufacturing**: $25B market with vertical integration trends
*   **Space Infrastructure**: On-orbit servicing, debris removal, and logistics emerging as new categories

## Competitive Landscape

Rocket Lab (RKLB) has established itself as the **unambiguous #2 launch provider globally**, with Electron achieving unprecedented reliability metrics:

*   **Launch Success Rate**: 97.5% across 50+ missions
*   **Cadence**: Achieving every-other-week launches in 2026
*   **Customer Diversity**: NASA, NRO, commercial constellation operators, and international defense customers

### The Manifest Moat

Our proprietary launch tracking data reveals RKLB's manifest is **85% booked through 2027**, providing revenue visibility rarely seen in the aerospace sector. Key contracts include:

*   **Globalstar MDA**: Multi-launch agreement for constellation replenishment
*   **Synspective**: Japanese SAR constellation deployment
*   **Capella Space**: Continued partnership for radar satellite launches
*   **Classified Government**: NRO and allied nation defense payloads

This backlog de-risks the base business while Neutron development continues.

## Neutron: The Medium-Lift Catalyst

Neutron represents RKLB's transition from small-sat specialist to full-spectrum launch provider:

*   **Payload Capacity**: 13,000 kg to LEO (vs. Electron's 300 kg)
*   **Reusability**: First stage designed for 10+ reflights
*   **Target Market**: Mega-constellation deployment, competing directly with SpaceX Falcon 9

### Development Milestones

*   **Q4 2025**: Archimedes engine qualification complete
*   **Q1 2026**: Full-scale tank structural testing
*   **H2 2026**: Maiden flight targeted from Wallops Island

### SpaceX Pricing Pressure Analysis

SpaceX has aggressively reduced Falcon 9 pricing, but the impact on RKLB is more nuanced than headlines suggest:

*   **Small-Sat Niche**: Electron serves dedicated small-sat customers who cannot wait for rideshare windows
*   **Responsiveness Premium**: Government customers pay for launch-on-demand capability
*   **Neutron Positioning**: Targeting $55M price point vs. Falcon 9's $67M list price

The Neutron price point, combined with RKLB's reliability record, creates a credible competitive position even against SpaceX's cost advantages.

## Vertical Integration Strategy

RKLB's acquisition strategy has transformed it from a launch company to a space systems company:

*   **Sinclair Interplanetary**: Reaction wheels and star trackers
*   **PSC**: Solar arrays and power systems
*   **SolAero**: Space-grade solar cells (acquired from Hanwha)

This vertical integration enables RKLB to capture value across the satellite supply chain, reducing dependence on launch margins alone.

## Risk Factors

*   **SpaceX Dominance**: SpaceX controls 65%+ of global launch market; pricing pressure remains structural
*   **Neutron Execution**: First-stage rocket development is notoriously difficult; timeline slippage possible
*   **Regulatory Environment**: FAA launch licensing bottlenecks affect entire industry
*   **Customer Concentration**: Top 5 customers represent significant revenue percentage

## Thesis Conclusion

RKLB represents the highest-quality pure-play space investment available in public markets. The 85% manifest booking through 2027, combined with Neutron development progress, creates a clear path to revenue growth. We maintain our **PM Score of 95**—the strongest conviction rating outside of AI infrastructure.`,
        date: "2026-01-12",
        pmScore: 95,
        category: "Alpha Signal",
        readTime: "10 min",
        relatedTickers: ["RKLB"],
        author: "PM Research Alpha Desk"
    },
    {
        id: "r3",
        title: "Quantum Computing: Timeline Acceleration",
        summary: "Error correction breakthroughs suggest commercial viability sooner than consensus expects.",
        fullContent: `## Thesis Update

Recent breakthroughs in quantum error correction have **materially changed our timeline thesis**. The quantum computing investment case has shifted from "science project" to "infrastructure buildout"—and the market has not fully repriced this transition.

### The Error Correction Breakthrough

Quantum computing's fundamental challenge has always been decoherence: qubits lose their quantum state before useful computation completes. Error correction was theoretically possible but practically elusive—until now.

## Technical Developments

### Google Willow: Below-Threshold Error Rates

Google's **Willow chip** represents a watershed moment in quantum computing history:

*   **105 Qubits**: Largest high-fidelity superconducting qubit array demonstrated
*   **Below-Threshold Errors**: For the first time, adding more qubits *reduces* rather than *increases* error rates—the fundamental requirement for scalable quantum computing
*   **Benchmark Performance**: Completed a random circuit sampling task in under 5 minutes that would take classical supercomputers 10 septillion (10^25) years
*   **Error Rate Metrics**: Achieved 1-qubit gate errors of 0.1% and 2-qubit gate errors of 0.5%—approaching fault-tolerant thresholds

The "below-threshold" achievement cannot be overstated: it proves that quantum error correction *works at scale*, transforming quantum computing from theoretical promise to engineering challenge.

### IonQ: Algorithmic Performance Gains

IonQ's trapped-ion architecture has achieved complementary breakthroughs:

*   **3x Performance Gains**: Algorithmic optimizations have tripled effective qubit utilization without hardware changes
*   **#AQ 35 Achievement**: IonQ's Forte system reached Algorithmic Qubit (AQ) metric of 35—the highest commercially available
*   **Gate Fidelity**: 99.9% single-qubit and 99.4% two-qubit gate fidelities enable complex algorithm execution
*   **Enterprise Adoption**: AQ metric provides customers with meaningful performance benchmarking, accelerating procurement decisions

IonQ's approach of maximizing per-qubit quality (vs. Google's qubit quantity) creates a complementary path to quantum advantage.

### Enterprise Pilot Expansion

The enterprise quantum computing pipeline has expanded dramatically:

*   **Financial Services**: JPMorgan, Goldman Sachs, and Fidelity have moved from research partnerships to production pilot programs for portfolio optimization and risk modeling
*   **Pharmaceutical**: Merck, Roche, and Pfizer are running molecular simulation workloads that demonstrate clear quantum advantage timelines
*   **Logistics**: BMW and Airbus have deployed quantum optimization for supply chain and routing problems
*   **Chemistry**: BASF and Dow are evaluating catalyst discovery applications with measurable speedup potential

## Investment Implications

### Timeline Compression

The quantum computing timeline has compressed from **"10+ years" to "3-5 years"** for initial commercial applications:

*   **2026-2027**: Quantum advantage demonstrated for specific optimization problems
*   **2027-2028**: First revenue-generating quantum applications in production
*   **2028-2030**: Fault-tolerant quantum computers enabling broader use cases

This timeline compression creates a window for early-mover investors before the "quantum premium" is fully priced in.

### The Investment Landscape

*   **IONQ**: Pure-play quantum computing with the clearest path to near-term commercial applications. Trapped-ion architecture offers superior coherence times. **PM Score: 82**
*   **GOOGL**: Willow breakthrough validates quantum leadership, but quantum represents <1% of company value. Exposure is "free option" attached to core business.
*   **IBM**: Quantum roadmap credible but execution has lagged Google and IonQ. Hybrid classical-quantum approach may prove prescient.

## Risk Factors

*   **Technology Risk**: Quantum computing remains at the frontier of physics; unexpected challenges possible
*   **Valuation Sensitivity**: Quantum pure-plays trade at speculative multiples; near-term disappointments create volatility
*   **Timeline Uncertainty**: "3-5 years" estimates have historically proven optimistic in quantum computing
*   **Competition**: Well-funded private competitors (PsiQuantum, Rigetti) may leapfrog public companies

## Position Update

We are initiating formal coverage on quantum pure-plays with PM Score methodology. IonQ represents our highest-conviction quantum position based on:

*   Clearest near-term commercial pathway
*   Superior qubit quality metrics (AQ 35)
*   Expanding enterprise customer base
*   Reasonable valuation relative to TAM

The quantum computing investment thesis has transitioned from "technology bet" to "infrastructure timing." We are positioning for the timeline compression.`,
        date: "2026-01-10",
        pmScore: 88,
        category: "Sector Analysis",
        readTime: "12 min",
        relatedTickers: ["IONQ", "GOOGL"],
        author: "PM Research Alpha Desk"
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
        fullContent: `## Macro Thesis

The energy transition is undergoing a **fundamental phase shift**. The first decade (2015-2025) was about generation: solar panel costs fell 90%, wind turbines scaled, and renewables reached grid parity. The next decade (2025-2035) will be about **infrastructure**: the grid itself becomes the bottleneck and the opportunity.

### The Transmission Paradox

The U.S. has added more renewable generation capacity in the past 5 years than the previous 20 combined. But this power cannot reach consumers:

*   **Interconnection Queue**: 2,600 GW of generation projects are waiting for grid connection—more than twice current U.S. installed capacity
*   **Average Wait Time**: 5+ years from application to interconnection
*   **Curtailment**: Texas alone curtailed 8% of wind generation in 2025 due to transmission constraints

The generation buildout has outpaced the grid. This creates a multi-decade infrastructure investment opportunity.

## Investment Opportunity

Grid infrastructure companies are positioned for a **multi-decade growth runway** with unprecedented visibility. The combination of electrification, renewable integration, and grid reliability requirements creates compounding demand.

### Key Metrics

*   **US Grid Investment Needs**: $2.5T through 2035 (DOE estimate)
*   **Current Infrastructure Utilization**: 87% average, with critical corridors at 95%+
*   **Transmission Backlog**: 70,000+ miles of new transmission lines required

## IRA Spending Acceleration

The Inflation Reduction Act has fundamentally altered grid investment economics:

*   **$370B in Energy/Climate Spending**: Largest clean energy investment in U.S. history
*   **Direct Pay Provisions**: Enable tax-exempt entities (utilities, municipalities) to access full credit value
*   **Transmission Investment Tax Credit**: 30% ITC for qualifying transmission projects—first-ever federal transmission incentive
*   **Domestic Content Bonuses**: Additional 10% credit for U.S.-manufactured components, reshoring supply chains

### Spending Velocity

IRA implementation has **accelerated faster than expected**:

*   **$150B+** in announced grid investments since IRA passage
*   Major utilities (NextEra, Duke, Southern) have increased CAPEX guidance 15-25%
*   Private equity and infrastructure funds raising dedicated grid investment vehicles

The IRA creates a 10-year runway of incentivized investment with bipartisan durability (investments flow to red and blue states alike).

## High-Voltage DC (HVDC): The Technology Catalyst

Traditional AC transmission loses 3-5% of power per 1,000 miles. HVDC cuts losses to 0.3%—enabling long-distance transmission that makes renewables viable nationwide.

### HVDC Advantages

*   **Efficiency**: 10x lower line losses than AC for distances >400 miles
*   **Capacity**: Higher power density per right-of-way
*   **Controllability**: Precise power flow management, critical for intermittent renewables
*   **Interconnection**: Can connect asynchronous grids (e.g., Texas to Eastern Interconnection)

### The HVDC Buildout

Major HVDC projects in development:

*   **SOO Green**: 350-mile underground line connecting Midwest wind to PJM market
*   **Champlain Hudson Power Express**: 339-mile line delivering Canadian hydro to NYC
*   **SunZia**: 550-mile line connecting New Mexico wind/solar to Arizona/California
*   **Grain Belt Express**: 800-mile line from Kansas wind to Eastern markets

Total HVDC investment pipeline exceeds **$50B** over the next decade.

### Key Beneficiaries

*   **Quanta Services (PWR)**: Largest electrical grid contractor; exposure to both transmission construction and grid modernization
*   **MasTec (MTZ)**: Diversified infrastructure with growing clean energy transmission segment
*   **Hitachi Energy**: Global leader in HVDC converter stations (60%+ market share)
*   **Siemens Energy**: HVDC technology provider with strong order backlog

## Grid Modernization: Beyond Transmission

The investment opportunity extends beyond new transmission lines:

*   **Grid-Enhancing Technologies (GETs)**: Software and hardware that increase existing line capacity 30-40% at 10% of new line cost
*   **Battery Storage Integration**: Grid-scale batteries require sophisticated interconnection and control systems
*   **Distribution Automation**: Smart inverters, advanced metering, and distributed energy management
*   **Wildfire Hardening**: Western utilities investing $30B+ in system hardening and undergrounding

## Risk Factors

*   **Permitting Delays**: Transmission projects face 10+ year permitting timelines; reform uncertain
*   **Interconnection Bottlenecks**: Even with investment, bureaucratic delays may limit deployment speed
*   **Interest Rate Sensitivity**: Infrastructure projects are capital-intensive; higher rates increase project costs
*   **Political Risk**: IRA provisions could face modification in future administrations (though most investment is contracted)

## PM Research Watchlist

We are adding grid infrastructure names to our formal coverage universe:

*   **Quanta Services (PWR)**: PM Score 84—highest-quality pure-play on grid buildout
*   **Vertiv (VRT)**: PM Score 86—crossover play on data center and grid infrastructure
*   **EATON (ETN)**: PM Score 81—diversified electrical equipment with grid exposure

The grid infrastructure thesis offers a rare combination: **visible multi-decade demand, bipartisan policy support, and technological moats**. We are initiating sector coverage with an Overweight rating.`,
        date: "2026-01-05",
        pmScore: 82,
        category: "Sector Analysis",
        readTime: "11 min",
        relatedTickers: ["PWR", "VRT", "ETN"],
        author: "PM Research Alpha Desk"
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
    {
        id: "r7",
        title: "Local Intelligence: The Claude Cowork & Mac Mini Renaissance",
        summary: "Anthropic's 'Cowork' transforms the Mac Mini into a dedicated AI agent server, shifting the paradigm from cloud-chat to local autonomous execution.",
        fullContent: `## The Rise of the AI Coworker

Anthropic recently launched **Claude Cowork** (January 2026), an agentic desktop application for macOS that runs in an isolated local VM using Apple's Virtualization Framework. This represents a fundamental shift in how humans interact with AI—from chat interfaces to autonomous digital coworkers.

### 1. The Mac Mini Craze

The release has triggered a surge in Mac Mini sales, as users repurpose M4/M5 Pro units as dedicated local servers for AI agents. Cowork brings the agentic power of **Claude Code** to non-technical tasks:

*   **Autonomous Operations**: Sorting chaotic downloads, drafting reports from scattered notes, creating spreadsheets from screenshots, and managing email triage without human intervention.
*   **Security & Isolation**: Running in a local VM ensures that sensitive file system operations remain sandboxed—critical for enterprise deployment.
*   **Bridge to Everyday Users**: While Claude Code serves developers, Cowork democratizes agentic AI for knowledge workers, administrators, and professionals who need AI assistance without technical expertise.

The "dedicated AI server" concept has resonated deeply: users are deploying Mac Minis as always-on digital assistants that handle repetitive tasks 24/7, effectively creating a new category of personal infrastructure.

### 2. The NVIDIA/Anthropic Infrastructure Moat

While the UI is local, the intelligence is powered by a massive strategic partnership. Anthropic has moved its primary scaling infrastructure to **NVIDIA Grace Blackwell** and the upcoming **Vera Rubin** systems. Key elements:

*   **10GW Infrastructure Agreement**: Ensuring "intelligence per watt" leadership as AI model sizes continue to scale exponentially.
*   **Hybrid Architecture**: Local execution for privacy-sensitive operations, cloud inference for complex reasoning tasks—optimal for enterprise compliance requirements.
*   **Latency Optimization**: Grace Blackwell's unified memory architecture enables sub-100ms response times for agentic tool calls.

### 3. Model Context Protocol: The Universal Standard

Cowork utilizes the **Model Context Protocol (MCP)** as the standard for connecting AI to local tools and data sources. With over **100M monthly downloads**, MCP has become the industry standard for AI-application interoperability.

*   **Tool Integration**: Native connections to file systems, browsers, calendars, and enterprise applications.
*   **Ecosystem Lock-in**: As developers build MCP-compatible tools, Anthropic's ecosystem advantage compounds—similar to Apple's App Store dynamics.
*   **Enterprise Adoption**: Fortune 500 companies are standardizing on MCP for internal AI tool development.

## Technical Analysis

The Cowork architecture demonstrates Anthropic's strategic vision: own the agentic interface layer while remaining hardware-agnostic for inference. This positions the company to capture value regardless of which chips ultimately dominate the AI compute landscape.

### Investment Implications

*   **AAPL**: Mac Mini sales uplift provides incremental revenue in a mature hardware category. The "AI server" positioning extends the product lifecycle and justifies premium pricing.
*   **NVDA**: Infrastructure partnership ensures Anthropic remains a top-5 GPU customer. Grace Blackwell production constraints become even more acute.
*   **Enterprise Software**: Traditional automation tools (RPA, workflow platforms) face disruption from AI agents that can navigate interfaces directly.

## Thesis Conclusion

Claude Cowork represents the first mass-market implementation of autonomous AI agents for non-developers. The Mac Mini repurposing trend validates our thesis that AI infrastructure will decentralize into homes and small offices. We are adding AAPL to our Innovation Watchlist based on this catalyst.`,
        date: "2026-01-25",
        pmScore: 94,
        category: "Alpha Signal",
        readTime: "11 min",
        relatedTickers: ["NVDA", "AAPL"],
        author: "PM Research Alpha Desk"
    },
    {
        id: "r8",
        title: "Intel's 14A Pivot: Reclaiming the Angstrom Throne",
        summary: "Intel's 1.4nm pilot phase marks the most significant technical pivot in a decade, with High-NA EUV delivering a 12-18 month lead over TSMC.",
        fullContent: `## The Angstrom Era

Intel has officially entered the pilot phase for its **14A (1.4nm)** process node, aiming for high-volume manufacturing by early 2027. This represents the most significant technical turnaround in semiconductor history—and the market is underestimating its implications.

### 1. High-NA EUV First Mover Advantage

Intel is the **first foundry in the world** to deploy the **ASML Twinscan EXE:5200B**, a $400M machine capable of 8nm resolution in a single pass. This is not incremental progress; it is a generational leap.

*   **The Technical Lead**: Mastering "field-stitching" has given Intel a **12-18 month window** over TSMC and Samsung. TSMC is not expected to adopt High-NA EUV at scale until late 2027.
*   **Overlay Accuracy**: Intel has achieved **0.7nm overlay accuracy**—a critical metric for high-volume AI GPU production where defect density directly impacts yields.
*   **The EUV Bottleneck**: ASML can only produce ~20 High-NA tools per year. Intel's early commitment secures capacity that competitors cannot access.

### 2. Architecture: RibbonFET 2 & PowerDirect

The 14A node introduces two architectural innovations that compound the lithography advantage:

*   **RibbonFET 2**: Intel's second-generation Gate-All-Around (GAA) architecture delivers superior electrostatic control versus Samsung's first-gen GAA implementation.
*   **PowerDirect**: An evolution of PowerVia backside power delivery, reducing total power consumption by **25-35%** compared to frontside power delivery. This is critical for AI workloads where power efficiency determines total cost of ownership.

The combination of High-NA EUV + RibbonFET 2 + PowerDirect creates a process node that competitors cannot replicate until 2028 at the earliest.

## Beneficiaries & Partnerships

### Foundry Customer Wins

*   **AWS (AMZN)**: Amazon has committed to Intel 14A for next-generation Graviton processors, seeking domestic manufacturing for their custom AI silicon and reducing dependence on TSMC.
*   **Microsoft (MSFT)**: Azure custom silicon roadmap includes Intel 14A for Maia 2 AI accelerators. Microsoft explicitly cited "supply chain diversification" as the strategic rationale.

These anchor customers provide **multi-billion dollar revenue visibility** for Intel Foundry Services—transforming it from a cost center to a profit driver.

### The National Security Premium

The CHIPS Act has fundamentally altered the semiconductor investment thesis. Intel is the only advanced foundry with **domestic U.S. manufacturing** at scale. For AI chips used in defense, aerospace, and critical infrastructure, Intel 14A is not a choice—it is the only option.

## Technical Analysis

Intel's stock remains significantly discounted versus its technical progress. The market is pricing in past execution failures while ignoring forward indicators:

*   **Process Roadmap**: Intel 18A (1.8nm) is already in production with positive yield commentary. 14A builds on this foundation.
*   **Customer Pipeline**: The AWS and Microsoft wins de-risk the foundry business model.
*   **Capacity Investment**: $100B+ in announced fab investments (Ohio, Arizona, Germany) ensures long-term supply security.

### Risk Factors

*   **Execution History**: Intel has repeatedly missed process targets (10nm, 7nm). Skepticism is warranted until HVM confirmation.
*   **TSMC Response**: TSMC's N2 node at 2nm with GAA remains competitive for customers who prioritize ecosystem over process leadership.
*   **Capital Requirements**: The foundry transformation requires sustained investment through a period of depressed margins.

## Thesis Conclusion

Intel 14A represents the most compelling risk/reward setup in semiconductors. If execution continues on the current trajectory, Intel will possess the world's most advanced manufacturing process by 2027. The AWS and Microsoft commitments validate the technical thesis with real customer dollars. We are upgrading INTC to Overweight with a **PM Score of 92**.`,
        date: "2026-01-25",
        pmScore: 92,
        category: "Deep Dive",
        readTime: "13 min",
        relatedTickers: ["INTC", "ASML", "AMZN", "MSFT"],
        author: "S. Cohen, Chief Strat."
    },
    {
        id: "r9",
        title: "Celestial Connectivity: AST SpaceMobile's Direct-to-Device Moat",
        summary: "Following the SHIELD contract win and BlueBird 6 deployment, ASTS is positioned to dominate the $151B satellite-to-cell market.",
        fullContent: `## The Direct-to-Device Revolution

AST SpaceMobile (ASTS) has emerged as the clear leader in direct-to-device satellite connectivity—the ability for standard, unmodified smartphones to connect directly to satellites. This is not incremental improvement; it is infrastructure transformation.

### 1. Strategic Contract Wins

The ASTS thesis has been fundamentally de-risked by two major developments:

*   **SHIELD Contract**: The U.S. Space Force selected ASTS for critical defense communications infrastructure, validating the technology for the most demanding use cases. This contract provides both revenue visibility and implicit technology certification.
*   **BlueBird 6 Deployment**: The successful deployment of the sixth BlueBird satellite completes initial constellation coverage for key markets. Commercial service launch is imminent.

### 2. Carrier Partnership Moat

ASTS has assembled the most comprehensive carrier partnership network in the satellite industry:

*   **AT&T (T)**: Lead U.S. partner with exclusive spectrum coordination.
*   **Verizon (VZ)**: Strategic investment and commercial agreement for subscriber access.
*   **Vodafone**: Pan-European deployment partner covering 300M+ subscribers.
*   **Rakuten**: Japanese market access with 5G integration roadmap.

These partnerships are **not** pilot programs—they are contractual commitments with revenue share structures. Tier-1 carriers have integrated ASTS into their "subscriber defense" strategies, using ubiquitous coverage as a competitive differentiator against each other and against cable/fixed wireless competitors.

### 3. Technical Architecture

Unlike competitors (Starlink, Lynk), ASTS utilizes massive phased-array antennas (900 sq meters per satellite) to achieve direct smartphone connectivity without device modification:

*   **Standard 5G Protocol**: Works with existing 4G/5G smartphones—no app, no hardware change required.
*   **Voice + Data**: Full cellular service including voice calls, unlike competitors limited to emergency messaging.
*   **Bandwidth Advantage**: Each BlueBird satellite provides cellular-grade throughput sufficient for streaming video.

## Market Opportunity

The total addressable market for satellite-to-cell connectivity is projected at **$151B** by 2030, based on:

*   **Coverage Gap Revenue**: 3B+ people globally lack reliable cellular coverage.
*   **Emergency Services**: Governments mandating emergency connectivity for rural populations.
*   **Maritime/Aviation**: Premium connectivity for transportation sectors.

ASTS has first-mover advantage in the highest-value segment (standard device connectivity), while competitors focus on modified devices or emergency-only messaging.

## Technical Analysis

ASTS exhibits strong technical momentum:

*   **MACD**: Bullish crossover confirmed, indicating sustained buying pressure.
*   **Relative Strength**: Trading **44% above 100-day SMA**, reflecting institutional accumulation.
*   **Volume Profile**: Elevated volume on up days versus down days confirms trend strength.

### Launch Roadmap

Management has outlined plans for **45-60 additional satellite launches** by year-end 2026, which would complete global coverage and unlock the full revenue potential of carrier partnerships.

### Risk Factors

*   **Capital Intensity**: Satellite manufacturing and launch costs remain substantial. Additional equity raises possible.
*   **Execution Risk**: Space deployment carries inherent technical risk; any launch failure impacts timeline.
*   **Competition**: SpaceX/T-Mobile partnership represents formidable competition, though currently limited to text messaging.
*   **Regulatory**: International spectrum coordination remains complex across different markets.

## Thesis Conclusion

ASTS represents a rare "infrastructure monopoly in formation" opportunity. The combination of carrier partnerships, technical moat, and contract wins creates a defensible position in a $151B market. The 45-60 satellite launch roadmap provides clear catalysts through 2026. We are initiating coverage with a **PM Score of 89** and adding ASTS to the Innovation Watchlist.`,
        date: "2026-01-25",
        pmScore: 89,
        category: "Alpha Signal",
        readTime: "10 min",
        relatedTickers: ["ASTS", "T", "VZ"],
        author: "PM Research Alpha Desk"
    },
    {
        id: "r10",
        title: "CoWoS Crunch: The Packaging Bottleneck Nobody's Pricing",
        summary: "TSMC allocation memo leaked. Advanced packaging capacity math doesn't work through 2027.",
        fullContent: `TSMC internal allocation memo leaked: 35% of CoWoS to NVIDIA.
One customer. Through 2027.
Total CoWoS capacity for 2026: 2.8M wafer-starts.
GB200 demand alone: 3.2M.
The math doesn't work.
Equipment lead times are 18 months.
The GPU shortage ended.
The packaging shortage just started.`,
        date: "2026-01-28",
        pmScore: 91,
        category: "Alpha Signal",
        readTime: "2 min",
        relatedTickers: ["TSM", "NVDA", "AMD", "AMAT"],
        author: "PM Research Alpha Desk"
    },
];
