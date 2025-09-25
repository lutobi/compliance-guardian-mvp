# STS Connections Tender – Appendix 1 V3.1

Client: Terminal Investment Namibia (TiN)
Version: V1.0 (Draft)
Date: 2025-08-20

---

## Notes
- Source of truth: Appendix 1 - RFP connection of STSs V3.1 and new “Appendices copy/”.
- FO termination at Cargo Building per V3.1; legacy Substation 1 FO superseded.
- Mobile substation used during works; permanent MV tie-in point to be confirmed with TiN.
- LC/UPC connectors assumed unless TiN mandates APC.
- BoQ quantities/prices indicative; update after field survey and vendor confirmation.

---

## Compliance Statement
This offer is prepared in accordance with Appendix 1 - RFP connection of STSs V3.1. Where requirements are clarified or assumed, these are explicitly noted. Final alignment will be completed after review of any addenda and receipt of final design inputs.

---

## Scope Coverage (Crosswalk to Appendix 1 – V3.1)
- Engineering & Design
  - MV SLD and feeder architecture (mobile substation → CTP6 → STS05/STS06; STS04 migration to CTP5)
  - CTP6 and CTP5 pit GA: MV junction box and drum designs, earthing, labeling
  - Cable sizing method, protection & coordination per TiN settings
  - FO star topology Cargo Building ↔ CTP6/CTP5; splice plans; rack elevations
  - Network segmentation, VLAN/ACL, OT edge security
  - Optical budget and acceptance criteria
- Procurement
  - MV XLPE cable (IEC 60502-2), termination/joint kits, SS IP67/IK10 enclosures (C5M)
  - OS2 9/125 μm cable, IP68 closures, LC/UPC panels/pigtails, labels
  - Certificates of conformity and type test reports
- Installation
  - STS04 controlled isolation at CTP6, reroute to CTP5, new JB/drum and terminations
  - STS05/STS06 drums and JBs at CTP6; feeders from mobile substation
  - FO pull from Cargo Building to CTP6; splice at closure; rack terminations
- Testing & Commissioning
  - MV IR/continuity, withstand/VLF; protection setting verification
  - FO OTDR 1310/1550 nm; insertion loss; polarity
  - SCADA/Network VLAN/ACL verification and link checks
- Documentation & Handover
  - As-built DWG/PDF, splice maps, cable schedules, protection settings
  - Test packs (MV/FO), O&M manuals, training records, handover checklist
  - Legalisation dossier per V3.1
- Project Mgmt & Admin
  - Programme (Gantt), RACI, risk register, permitting schedule
  - Document control (10 working day review SLA), meeting cadence, escalation

---

# Part A – Electrical Offer (Technical)

## Design Basis & Standards
- Standards: DIN/EN/ISO; Electrical: DIN/VDE, EN, IEC; European standards prevail.
- MV level TBC; feeder current/volt drop sized from ZPMC OEM data and TiN system parameters.
- Earthing per IEC 61936-1; sheath bonding scheme to avoid circulating currents.

## System Architecture (SLD overview)
```text
[Employer MV Switchgear] --(config per TiN)--> [Mobile Substation]* --> Feeder(s) --> [CTP6]
                                                                    +--> [CTP6 JB+Drum → STS05]
                                                                    +--> [CTP6 JB+Drum → STS06]
STS04 Migration: [CTP6 Disconnect] X → Duct reroute → [CTP5 New JB+Drum → STS04]
*Mobile substation for works; permanent tie-in point TBC
```

## CTP6/CTP5 Junction Box & Drum Design
- Stainless enclosure IP67/IK10, C5M; padlockable; filtered breathers.
- IN feeder termination with stress-control kits (IEC 60502-2).
- OUT A to STS05 drum/tail; OUT B to STS06 drum/tail (stress-control kits).
- Copper earth bar with test link; external earth lug to grid.
- Engraved UV-stable labels; torque labels on terminations.

## Method Statement
- Pre-conditions and permits
  Prior to any site activity, we will confirm the final tie-in arrangement with TiN, issue IFC drawings and ITPs, and obtain all permits to work (PTW) and LOTO authorizations. A task-specific RAMS briefing will be held with the crew, including lifting plans for drums and confined-space controls for pit work. Materials will be inspected against certificates of conformity and staging areas will be set up with weather protection.

- STS04 migration (CTP6 → CTP5)
  1) Isolation and LOTO: Coordinate an outage window with TiN. Apply LOTO at the mobile substation/feeder source and at CTP6, test for absence of voltage using a calibrated tester, then apply portable earths where required.
  2) Route verification: Rod-and-rope from CTP6 to CTP5 ducts, pass a mandrel to confirm clearance, CCTV if resistance is encountered, and dewater pits as needed. Document any obstructions and agree minor civil remediation if required.
  3) Install CTP5 JB & drum: Set base and mount the stainless (C5M) enclosure. Fit earth bar and test link, prepare gland plates, and seal unused entries. Position and secure the cable drum assembly; provide slack loops and mechanical protection where cable exits the pit.
  4) Cable handling and pull: Position the donor and receiving stations with rollers, bell mouths, and rub blocks. Use a capstan winch with in-line dynamometer to monitor pulling tension. Apply approved cable lubricant and use rollers/bell mouths at all bends. Maintain minimum bend radius and sidewall pressure per manufacturer. Record tension and pull length in the pull log.
  5) Terminations at CTP5: Measure and cut to length. Strip sheath and insulation to kit template, abrade/clean semicon per instructions, install stress-control tube, insulation tube, and lug as specified. Crimp using calibrated die set to manufacturer pattern; heat-shrink/gel components per kit sequence. Fit boots, sealing mastic, and anti-tracking sleeves where required. Dress and torque to manufacturer values; record in torque log. Apply phase identification and permanent labels.
  6) Disconnection at CTP6: Safely disconnect STS04 feeders, cap/insulate as required, and update labels to reflect new routing. Remove temporary earths after proving dead and completing tests.

- STS05/STS06 new feeders at CTP6
  1) Pit preparation: Clean and inspect CTP6 pits. Mount two JB enclosures (for STS05 and STS06) on corrosion-resistant fixings. Install filtered breathers and gland plates.
  2) Earthing: Bond each JB to the earth grid using tinned copper with labeled test links; verify continuity to grid (< 1 Ω target) and document readings.
  3) Drums and feeders: Position drums for STS05/STS06 with spindle stands and braking control. Pull feeders from the mobile substation location to CTP6 JBs, maintaining bend radius and using rollers at all changes of direction. Protect cable at pit entries with grommets/bushings and seal with rated compounds.
  4) Terminations and labeling: Complete stress-control terminations per kit procedures (as above). Torque check, apply phase/feeder labels, and fit engraved plates per TiN schema. Dress conductors to avoid mechanical stress.
  5) Protection settings: Receive TiN-approved setting sheet. Apply/verify settings on source protection (mobile substation or upstream relay) and document all parameters. Prepare coordination plots for the handover file.

- Inspections and hold points
  Hold/witness points will be observed at isolation verification, completed terminations (before enclosure close-up), and pre-energization test review. TiN representatives will be invited to witness per ITP. Punch items, if any, will be closed before energization.

## Testing & Commissioning
- Visual and mechanical checks
  Verify enclosure IP integrity, gland seals, torque on terminals, and completeness of labels/marking. Confirm earthing connections and test link status. Review torque and pull logs for completeness.

- Insulation resistance (IR) and continuity
  Perform IR per conductor and conductor-to-earth using a calibrated megohmmeter at the correct test voltage for the circuit rating (e.g., 5 kV DC for 6–11 kV class, 10 kV DC for higher ratings as applicable). Record temperature-corrected values and compare to manufacturer and project thresholds. Verify conductor continuity and phase identification end-to-end; check R1/R2 as applicable.

- VLF/withstand testing
  Conduct Very-Low-Frequency withstand at 0.1 Hz at the specified kV level (e.g., 2×U0) for the prescribed duration (typically 30 minutes) per IEC/IEEE guidance. Monitor for instability or partial discharge indications if instrumented. Acceptance: no breakdown, test completes at setpoint with stable current profile.

- Earthing tests
  Measure pit-to-grid continuity (< 1 Ω target) and, where required, perform earth resistance tests using clamp or 3-point methods. Verify sheath bonding continuity per design.

- Protection verification
  Secondary injection: Verify relay pickup, time-current characteristics, instantaneous elements, and lockout logic against the TiN setting sheet. Check CT polarity and ratio. Where feasible, perform end-to-end functional trip checks to confirm breaker operation and interlocks.

- Energization procedure
  Hold a pre-energization review. Remove temporary earths, restore enclosures, and clear the work area. Stage energization: first no-load verification (phase rotation, voltage presence), then incremental load. Perform a thermal scan after 2–4 hours of load to identify hotspots; rectify and re-scan if anomalies are detected. Compile the test dossier with signed sheets and as-built redlines.

## Acceptance Criteria
  - IR ≥ manufacturer thresholds; no partial discharge evidence.
  - Withstand/VLF passed; protection settings signed off.
  - Earthing continuity within limits; labels complete and correct.

## Part A – Electrical Bill of Quantities (BoQ)
| Item                 | Description / Spec                                                     | Qty  | Unit | Unit Price (USD) | Amount (USD) |
|----------------------|------------------------------------------------------------------------|------|------|------------------|--------------|
| MV Cable             | 3C XLPE, IEC 60502-2, cross-section TBC, kV rating per TiN            | 1200 | Lm   | $85.00           | $102000.00   |
| MV Terminations      | Indoor/Outdoor termination kits, stress-control, IEC type-tested      | 12   | Set  | $450.00          | $5400.00     |
| MV Joints (spares)   | Heat/cold-shrink joint kits, IEC type-tested                           | 4    | Set  | $600.00          | $2400.00     |
| MV Junction Boxes    | SS IP67/IK10, C5M, earth bar, labels (CTP6×2, CTP5×1)                  | 3    | EA   | $3500.00         | $10500.00    |
| Cable Drums          | Marine-grade reels with IP67 tails for STS04/05/06                    | 3    | EA   | $1200.00         | $3600.00     |
| Earthing Kit         | 25–50 mm² Cu, clamps, test links                                      | 1    | Lot  | $2800.00         | $2800.00     |
| Surge Protection     | Per TiN policy for pit equipment                                       | 3    | EA   | $450.00          | $1350.00     |
| Labels/Marking       | UV-stable engraved plates; markers                                    | 1    | Lot  | $600.00          | $600.00      |
| Testing Services     | VLF/withstand, IR, certificates                                       | 1    | Lot  | $4500.00         | $4500.00     |
| Installation & Comm. | MV works labor                                                        | 1    | Lot  | $38000.00        | $38000.00    |

- Total (Electrical): $171,150.00

## Part A – Electrical Commercial Offer
- Payment Schedule:
  - 20% advance
  - 30% materials on site
  - 30% substantial completion
  - 10% Testing & Commissioning
  - 10% final handover & legalisation
- Warranty: 12 months minimum; optional 24 months.
- Exclusions: Permanent MV tie-in hardware if outside scope; civil works beyond pit reinstatement.
- Employer-Supplied Items: MV switchgear (per V3.1).

---

# Part B – Communications Offer (Technical)

## Design Basis & Standards
- OS2 9/125 μm single-mode; LC/UPC unless TiN mandates APC.
- Star topology: Cargo Building FO rack → CTP6 closure → STS05/STS06; CTP5 → STS04.
- Labeling per TIA-606 and TiN schema; OT edge security.

## Fibre Optic Star Topology
```text
[Core A/B @ Cargo Building]
  |           |
  +--[FO Rack: LC/UPC Panels]--+
                               |
                        OS2 24F to CTP6
                               |
                         [CTP6 FO Closure]
                           |          |
                         STS05      STS06
Additional: OS2 to CTP5 → STS04
```

## CTP6 Splice Plan (Tray Allocation)
- Tray1: STS05 C1↔Backbone C1, C2↔C2; Tray2: STS05 C3↔C3, C4↔C4.
- Tray3: STS06 C1↔C5, C2↔C6; Tray4: STS06 C3↔C7, C4↔C8; Tray5–6 spares.

## Cargo Building Rack Elevation (OT Edge)
- U35: FO Panel #1 (STS05)
- U34: FO Panel #2 (STS06)
- U33: Cable Management
- U32: OT Core Switch
- U31: Industrial Firewall/OT Edge
- U30: PDU/UPS

## Optical Budget & Acceptance Thresholds
- Assume 0.8 km @1310 nm: 0.28 dB fiber loss; 2×0.25 dB connectors; 4×0.1 dB splices; margin 3 dB; design budget ≈ 4.18 dB.
- Acceptance: IL ≤ 2.0 dB typical; ≤ 3.0 dB max with extra panels; clean OTDR traces.

## Method Statement
- Pre-works and duct preparation
  Confirm route from Cargo Building to CTP6. Obtain PTWs and establish confined-space controls for any manhole access (gas test, ventilation, tripod/harness if required). Rod the ducts, pass a mandrel to confirm diameter/obstructions, install pull rope, and label intermediate access points. Dewater and clean chambers as needed.

- Cable pulling (OS2 single-mode)
  Stage the cable reel with spindle stands and braking control. Set up a capstan winch with in-line dynamometer to monitor pulling tension. Apply approved cable lubricant and use rollers/bell mouths at all bends. Maintain minimum bend radius and sidewall pressure per manufacturer. Record peak tension and pull length. At entries, fit bushings and seal penetrations with rated compounds.

- CTP6 closure installation and splicing
  Mount the IP68 closure, allocate trays per the splice plan, and provide service loops. Prepare fibers: strip, clean with lint-free wipes and alcohol, cleave, and fusion-splice to pigtails per tray allocation. Apply splice protectors and dress fibers to maintain bend radius. Close and seal the closure; pressure test if required by spec.

- Cargo Building rack terminations
  Prepare LC/UPC patch panels in the designated rack U-spaces. Route incoming cables through cable management, bond metallic strength members to rack ground, and terminate pigtails to adapters. Label ports and cables per the TIA-606/TiN schema. Document tray maps and rack elevations.

- Cleaning, inspection, and housekeeping
  Clean all connectors with one-click tools and inspection scopes. Verify that grommets, seals, and grounding are in place. Update the splice schedule and labeling register.

## Testing & Commissioning
  Conduct a progressive test regime:
  1) Visual and label audit: Confirm labels match the schedule, closures and panels are sealed and grounded, and fiber management is neat.
  2) Polarity/continuity: Use a visual fault locator and light source to verify A-to-B polarity according to the mapping; correct any cross-overs.
  3) OTDR bi-directional: Test at 1310/1550 nm using launch and tail fibers. Record event tables for connectors/splices and overall attenuation; investigate reflective events or high loss splices.
  4) Insertion loss (OLTS): Measure end-to-end IL; acceptance per budget (≤ 2.0 dB typical path, ≤ 3.0 dB maximum if extra panels present). Record reflectance where instruments support it.
  5) Documentation: Save OTDR traces (both directions), IL results, and updated tray maps. Compile into the test pack with sign-off sheets.

## Acceptance Criteria
  - OTDR/IL within thresholds; polarity OK; labels match schedule.
  - Rack terminations neat; grounding per standard; documentation complete.

## Part B – Communications Bill of Quantities (BoQ)
| Item                   | Description / Spec                                         | Qty  | Unit | Unit Price (USD) | Amount (USD) |
|------------------------|------------------------------------------------------------|------|------|------------------|--------------|
| OS2 FO Cable           | 9/125 μm single-mode, duct-grade, dielectric/armoured TBC | 1600 | Lm   | $1.50            | $2400.00     |
| FO Closures            | IP68 splice closures with trays (CTP6)                     | 2    | EA   | $350.00          | $700.00      |
| Patch Panels           | 19" LC/UPC 24F/48F panels (Cargo Building)                 | 2    | EA   | $280.00          | $560.00      |
| Pigtails & Patch Cords | LC/UPC G.652.D                                            | 36   | EA   | $12.00           | $432.00      |
| Rack Accessories       | Cable mgmt, blanks, grounding                              | 1    | Lot  | $350.00          | $350.00      |
| Labels/Tags            | TIA-606 compliant                                         | 1    | Lot  | $200.00          | $200.00      |
| Splicing & Testing     | Fusion splice, OTDR/IL with reports                        | 1    | Lot  | $2200.00         | $2200.00     |
| Installation & Comm.   | FO works labor                                             | 1    | Lot  | $6000.00         | $6000.00     |

- Total (Communications): $12,842.00

## Part B – Communications Commercial Offer
- Payment Schedule:
  - 20% advance
  - 30% materials on site
  - 30% substantial completion
  - 10% Testing & Commissioning
  - 10% final handover & legalisation
- Warranty: 12 months minimum; optional 24 months.
- Exclusions: Active network switches unless specified; civil works beyond duct access.
- Employer-Supplied Items: FO racks in Cargo Building (per V3.1).

---

# Project Management & Administration

## Project Management Plan (Narrative)
We apply a PMI/PRINCE2-aligned governance framework tailored for terminal operations. A dedicated Project Manager (PM) leads planning, coordination, and reporting; a Site Supervisor controls day-to-day works; Engineering manages design changes and technical queries. Baseline scope, schedule, and cost are established at kick-off and controlled through a formal change process. Weekly site coordination meetings align look-ahead activities, access windows, and permits; a monthly steering forum resolves escalations and reviews KPIs (HSE, schedule performance, quality, risks, commercial).

Schedule is managed with a resource-loaded Gantt and a 3-week rolling look-ahead. Constraints (permits, outages, materials) are tracked and cleared prior to task start. Risks are reviewed weekly, with owners, mitigations, and residual ratings updated. Issues and RFIs are logged and answered within agreed SLAs. Commercial management includes progress valuations, milestone invoicing, and change orders. Interfaces with TiN Power, ICT/OT, HSE and Operations are governed by an interface register that defines data requirements (e.g., protection settings, rack allocations) and hold/witness points.

 Quality is embedded via an approved ITP; each hold/witness point ties to objective evidence (photos, torque logs, test results). HSE is enforced through PTW/LOTO, toolbox talks, and task-specific RAMS. Communications follow a documented plan covering progress reports, dashboard metrics, and distribution lists. All decisions and approvals are recorded in meeting minutes and form part of the handover dossier.

## Documentation & Handover Plan
We implement disciplined document control with a dedicated coordinator and a structured register (drawings, RFIs, NCRs, ITPs, test records, vendor data). Submittals follow a standard numbering convention and revision policy; reviews are completed within a 10-working-day SLA unless accelerated by agreement. Only approved IFC/IFU drawings are used for site works; redlines are captured daily and rolled into as-builts prior to energization.

Test packs are organized by system and location, linking ITP checkpoints to evidence (photos, torque logs, OTDR traces, VLF/IR reports). O&M manuals compile datasheets, warranties, recommended maintenance, and spare parts. The handover dossier includes: as-built DWG/PDF sets, ITP/test records, certificates of conformity and type tests, training agendas and attendance, asset register (tags/serials/locations), and the legalisation dossier required by Appendix 1 V3.1. Digital deliverables are provided in both native (DWG, XLSX) and PDF formats with an index for traceability. A formal handover meeting reviews punch list status and acceptance certificates.

## Programme (Gantt Milestones)
| Phase                        | Duration (wks) | Notes                                           |
|-----------------------------|----------------|-------------------------------------------------|
| Surveys & Data Collection   | 2              | Duct CTP6↔Cargo Building; rack audit; earthing |
| Detailed Design & Approvals | 4              | IFC package and ITPs                            |
| Procurement & Logistics     | 6              | Overlaps design tail; long-leads                |
| Installation (MV+FO)        | 6              | Method statements executed; RAMS                |
| Testing & Commissioning     | 2              | MV + FO acceptance                              |
| Legalisation & Closeout     | 2              | Docs, O&M, training, handover                   |

## RACI
| Role        | Design | Procure | Install | Test/Comm | Docs/Handover |
|-------------|--------|---------|---------|-----------|---------------|
| Contractor  | R      | R       | R       | R         | R             |
| TiN PM/Tech | A/C    | C       | C       | C         | A/C           |
| TiN IT/ICT  | C      | C       | C       | A/C       | C             |
| HSE         | A      | C       | A       | A         | C             |

## Risk Register (Initial)
| Risk                       | Impact             | Mitigation                              |
|----------------------------|--------------------|-----------------------------------------|
| Duct congestion/water      | Delay/route change | Rod/CCTV, dewater, alt path             |
| Protection miscoordination | Trips/unsafe ops   | Review TiN settings; coordination study |
| FO attenuation high        | Link failure       | Splice quality, budget margin, rework   |
| Corrosion (marine)         | Premature failure  | C5M materials, IP67/68, SS hardware     |
| Ops disruption             | Outage risk        | Work windows, notices, staging          |

---

## Executive Summary
We propose a turnkey electrical and communications connection of STS cranes in accordance with Appendix 1 – RFP V3.1. Our solution delivers safe isolation and migration of STS04 to CTP5, new junction box and drum assemblies at CTP6 for STS05/STS06, and a resilient OS2 fibre star linking CTP6/CTP5 to the Cargo Building. The approach prioritizes safety (no energized work), marine-grade materials (C5M), rigorous QA/ITP, and complete documentation for legalisation.

## Detailed Architectures & Diagrams
### High-Level Integration
```text
[Employer MV Switchgear] → [Mobile Substation]* → [CTP6 JB+Drums] → STS05/STS06
                                              └→ [CTP5 JB+Drum] → STS04 (migration)
[Cargo Building FO Rack] ↔ OS2 24F ↔ [CTP6 Closure] ↔ STS05/STS06
[Cargo Building FO Rack] ↔ OS2 ↔ [CTP5 Closure] ↔ STS04
*Mobile substation used during works; permanent tie-in TBC with TiN
```

### CTP6 MV Junction Box (Internal Layout)
```text
┌────────────────────── SS Enclosure (IP67/IK10, C5M) ──────────────────────┐
│  IN Feeder L1 L2 L3  ──┐   ┌─ OUT A → Drum STS05  L1 L2 L3               │
│  Screen/Earth → Earth Bar│  │  OUT B → Drum STS06  L1 L2 L3               │
│  Breather/Filter        │  │  Earth bar with test link                    │
│  Labels & torque table  │  │  External earth lug                          │
└───────────────────────────────────────────────────────────────────────────┘
```

### Cargo Building Rack (OT Edge)
```text
U35: FO Panel #1 (STS05)   U32: OT Core Switch
U34: FO Panel #2 (STS06)   U31: Industrial Firewall/OT Edge
U33: Cable Management      U30: PDU/UPS
```

### Network Segmentation (Illustrative)
```text
VLAN 210 (STS05 OT) | VLAN 220 (STS06 OT) | VLAN 200 (Mgmt) | ACLs: OT↔IT restricted
```

## Engineering & Design Approach
### Electrical (MV)
Our electrical design begins with a clear definition of operational scenarios and design criteria agreed with TiN. We derive design current from ZPMC OEM data and confirm upstream fault levels and protection philosophy. Cable sizing considers ampacity, voltage drop, short-circuit thermal withstand, and installation conditions. Protection settings are coordinated across source breakers, feeders and any intermediate relays; outputs include a formal setting sheet, coordination curves, and remarks on selectivity and clearing times. Earthing is designed to IEC 61936-1 with explicit targets for step/touch voltage and pit-to-grid continuity; sheath bonding is specified to avoid circulating currents while maintaining fault return paths. Marine exposure is addressed through C5M-grade stainless hardware, IP67 enclosures, sealed glands, and protected routing. All terminations are specified with manufacturer torque values and permanent labeling per TiN schema, with torque logs captured in the ITP.

### Fibre Optics (FO)
The FO design adopts OS2 G.652.D single-mode throughout, with LC/UPC connectors unless TiN mandates APC for specific links. We define a star topology from the Cargo Building to field closures, allocate tray maps to preserve spares and growth, and specify service loop policies. An optical budget is computed per path with allowances for fiber loss, connector and splice losses, and a 3 dB design margin; acceptance thresholds are tied to this budget. Splicing is planned as fusion with tray allocation and polarity verified end-to-end; connector cleanliness and inspection are mandated. Mechanical considerations include maintaining minimum bend radius, controlling pull tension/sidewall pressure, and sealing all entries. The design package comprises rack elevations, splice plans, labeling schedules, and test acceptance criteria aligned to the ITP.

## Procurement & Logistics Plan
We operate a structured source-to-site process governed by a procurement plan and a live materials tracker. RFQs are issued to approved vendors with technical datasheets, standards compliance (IEC/EN), and environmental requirements (C5M, IP ratings). Bids undergo a technical evaluation against mandatory criteria (type-test reports, CoCs, warranty terms, lead times) before commercial adjudication. Purchase Orders embed quality clauses (inspection rights, documentation deliverables, packing/marking) and define hold/witness points.

Expediting begins at award: vendors submit manufacturing schedules, inspection & test plans, and submittals (drawings, labels, torque tables) for approval. We plan FAT where applicable and require MTRs/CoCs prior to dispatch. Logistics is aligned to the installation sequence and outage windows; packaging specifies moisture barriers, desiccants/inhibitors for marine environments, and shock/tilt indicators. Shipments include full documentation sets (CoC, type tests, packing lists) and are insured under the agreed Incoterms. Site receiving uses an RFI process: items are inspected, logged to the materials register (including serial/lot numbers), and quarantined if nonconforming. Sensitive items (FO components, MV kits) are stored in controlled conditions; kitting aligns to ITP steps to prevent premature unboxing.

## Installation Approach (General)
Site works commence after mobilisation, safety induction, and permit acceptance. Each activity is governed by an approved Method Statement and task risk assessment (RAMS). Supervisors brief the team daily (TBT), confirming roles, interface constraints, and hold points. Barriers, signage, and exclusion zones are established before work; confined-space and lifting plans are enforced where applicable. Sequencing prioritizes safety and operations continuity: we stage isolations, pre-stage materials, and validate temporary works before introducing any outage. Quality is built-in: checkpoints are recorded with photos, torque/measurement logs, and redlines captured contemporaneously for as-builts. Housekeeping, environmental protections (spill kits, dewatering controls), and reinstatement are maintained throughout.

## Value Engineering & Alternatives
We evaluate alternatives that reduce lifecycle cost and risk without compromising compliance. Examples include optimized enclosure sizes/material grades for C5M exposure, selection of termination kit technologies suitable for humidity and salt fog, and alternative fiber routes to avoid congested ducts. Where TiN standards allow, we propose LC/APC on long spans to improve return loss, or corrosion-resistant fixings to extend service life. Each option is documented with cost/schedule/maintenance impact and submitted for approval.

## Sustainability & Environmental Management
Our Environmental Management Plan addresses waste minimization, segregation, and responsible disposal; control of dewatering discharges; spill prevention and response; and noise/light management for adjacent operations. We prefer low-VOC consumables, reusable packaging where practical, and local sourcing to reduce transport emissions. All activities comply with TiN environmental policies and statutory requirements; incidents are logged and reviewed in weekly HSE reports.

## Interface & Stakeholder Management
Interfaces span Operations, Power, ICT/OT, HSE, and external authorities. We maintain an interface register identifying owners, data dependencies (e.g., settings sheets, rack allocations), and approval gates. Weekly coordination meetings track look-ahead constraints and access windows; changes are channelled through the change control process with impact assessments. A clear escalation path (Site Supervisor → PM → Steering) ensures timely decisions.

## Asset Registration & Tagging
All new assets are tagged per TiN’s schema and registered into the asset register/CMMS. Tagging covers enclosures, terminations, cables, closures, panels, and protective devices. Serial numbers, test certificates, torque records, and location references are linked to each asset. We can provide QR-coded labels to expedite future maintenance and audits.

## Detailed Scope of Work
### In Scope
- MV: STS04 isolation and migration to CTP5; new JBs/drums at CTP6 for STS05/06; MV terminations; earthing; labeling.
- FO: Cargo Building ↔ CTP6 star links; closures; rack panels; labeling; OTDR/IL tests.
- Documentation: IFC/IFU drawings, ITPs, test packs, O&M, training, legalisation dossier.
- Project Mgmt: programme, RACI, risk, meetings, change control, HSE.

### Out of Scope (unless stated)
- Civil works beyond pit reinstatement; active network switches unless specified.
- Permanent MV tie-in hardware if outside scope; utility feeder upgrades.

## Project Deliverables
- Drawings: SLDs, pit GA, cable schedules, splice maps, rack elevations, labeling schedules.
- Calculations: cable sizing, volt drop, protection coordination, optical budget.
- QA/ITP: inspection/test records, factory certificates (IEC type tests), torque logs.
- Handover: as-built DWG/PDF, O&M manuals, training records, legalisation dossier.

## Hardware & Software Requirements
### Hardware (examples or equivalent)
- MV terminations/joints (IEC 60502-2 type-tested), SS IP67/IK10 enclosures (C5M), cable drums.
- OS2 24F cable, IP68 closures with trays, LC/UPC panels/pigtails, labels per TIA-606.
- OT edge firewall/switch (industrial grade), PDU/UPS as required by TiN standard.

### Software/Tools
- CAD (AutoCAD), protection coordination tool (ETAP/EasyPower), document control (Confluence/SharePoint),
  test software for OTDR/IL, commissioning templates, issue tracker.

## Step-by-Step Implementation Plan
1) Pre-Mobilisation (Week 0–2)
   - Kick-off; surveys (ducts, pits, racks); safety file submission; permit planning.
   - Preliminary designs; risk workshop; procurement of long-leads.
2) Detailed Design & Approvals (Week 2–6)
   - IFC drawings; protection settings; splice plans; ITPs; method statements; TiN approvals.
3) Procurement & FAT (Week 4–10)
   - Order MV kits, enclosures, FO hardware; receive certificates; pre-assembly checks.
4) Installation (Week 8–14)
   - MV: STS04 LOTO and migration; CTP6 JBs/drums for STS05/06; earthing; labels.
   - FO: Pull Cargo→CTP6; closures; rack terminations; labeling.
5) Testing & Commissioning (Week 14–16)
   - MV: IR, continuity, VLF/withstand; protection setting verification.
   - FO: OTDR (1310/1550), IL, polarity; documentation of traces.
6) Handover & Legalisation (Week 16–18)
   - As-builts, test packs, training, legalisation dossier; punch list close-out.

## Quality Plan & ITP (Summary)
| Stage                     | Checkpoint                              | Hold/Witness | Record |
|---------------------------|-----------------------------------------|--------------|--------|
| Material Receiving        | CoC, visual, type tests                 | W            | RFI-01 |
| JB/Drum Installation      | Fixings, IP rating, earthing continuity | H            | ITR-10 |
| MV Terminations           | Prep/fit, torque, labels                | W            | ITR-20 |
| FO Splicing/Terminations  | Tray map, splice loss, polarity         | W            | ITR-30 |
| Testing (MV/FO)           | IR/VLF; OTDR/IL                         | H            | ITR-40 |
| Pre-energization Review   | Docs complete, permits, LOTO            | H            | ITR-50 |

## HSE & RAMS Summary
- No energized work; LOTO mandatory; PTW process per TiN.
- Confined space/duct entry controls; lifting plans for drums; hot work permits if any.
- Environmental: dewatering controls, spill kits, waste disposal; corrosion mitigation (C5M).

## Detailed BoQ (Expanded)
### Part A – Electrical (Materials & Services)
| Item                          | Qty   | Unit | Unit Price (USD) | Amount (USD) |
|-------------------------------|-------|------|------------------|--------------|
| Preliminaries (PM, HSE, QA)   | 1     | Lot  | 18,500.00        | 18,500.00    |
| Detailed Design & IFC         | 1     | Lot  | 12,000.00        | 12,000.00    |
| MV Cable 3C XLPE (IEC 60502-2)| 1,200 | Lm   | 85.00            | 102,000.00   |
| MV Termination Kits           | 12    | Set  | 450.00           | 5,400.00     |
| MV Joint Kits (spares)        | 4     | Set  | 600.00           | 2,400.00     |
| SS JB Enclosures (C5M)        | 3     | EA   | 3,500.00         | 10,500.00    |
| Cable Drums with tails        | 3     | EA   | 1,200.00         | 3,600.00     |
| Earthing Kit & Materials      | 1     | Lot  | 2,800.00         | 2,800.00     |
| Surge Protection              | 3     | EA   | 450.00           | 1,350.00     |
| Labels/Marking                | 1     | Lot  | 600.00           | 600.00       |
| Testing Services (MV)         | 1     | Lot  | 4,500.00         | 4,500.00     |
| Installation & Commissioning  | 1     | Lot  | 38,000.00        | 38,000.00    |
| Subtotal (Electrical, direct) |       |      |                  | 201,650.00   |

### Part B – Communications (Materials & Services)
| Item                          | Qty   | Unit | Unit Price (USD) | Amount (USD) |
|-------------------------------|-------|------|------------------|--------------|
| OS2 FO Cable                  | 1,600 | Lm   | 1.50             | 2,400.00     |
| IP68 FO Closures              | 2     | EA   | 350.00           | 700.00       |
| LC/UPC Rack Panels            | 2     | EA   | 280.00           | 560.00       |
| Pigtails & Patch Cords        | 36    | EA   | 12.00            | 432.00       |
| Rack Accessories              | 1     | Lot  | 350.00           | 350.00       |
| Labels/Tags (TIA-606)         | 1     | Lot  | 200.00           | 200.00       |
| Splicing & Testing            | 1     | Lot  | 2,200.00         | 2,200.00     |
| Installation & Commissioning  | 1     | Lot  | 6,000.00         | 6,000.00     |
| Subtotal (Comms, direct)      |       |      |                  | 12,842.00    |

### Commercial Summary
| Category             | Amount (USD) |
|----------------------|--------------|
| Electrical Subtotal  | 201,650.00   |
| Communications Subtotal | 12,842.00 |
| Overheads & Profit (10%)| 21,449.20 |
| Contingency (5%)     | 10,724.60    |
| Total Offer (USD)    | 246,665.80   |

Notes: Pricing is indicative; update after survey/vendor quotes. OHP/contingency percentages adjustable per TiN policy.

## Commercial Terms (Expanded)
- Validity: 60 days from date.
- Payment milestones as listed; retention 5% if applicable (release on final handover/legalisation).
- Lead times (indicative): MV kits 4–6 wks; SS enclosures 3–4 wks; FO materials 2–3 wks.
- Incoterms: DDP site (unless agreed otherwise). Warranty 12 months; extendable.
- Exclusions/Clarifications: no civil beyond reinstatement; no active IT equipment unless specified; permanent MV tie-in hardware if outside scope.

## Compliance Matrix Template (to Appendix 1 – V3.1)
| Clause Ref | Requirement Summary                  | Compliance (Y/N/Part) | Proposal Section Reference | Notes/Deviation |
|------------|--------------------------------------|------------------------|----------------------------|-----------------|
| A1-1       | MV connection STS04 migration to CTP5| Y                      | Part A: Method, Drawings   |                 |
| A1-2       | New JBs/drums for STS05/06 at CTP6   | Y                      | Part A: JB Design          |                 |
| A1-3       | FO termination at Cargo Building     | Y                      | Part B: Rack Elevation     |                 |
| ...        | ...                                  | ...                    | ...                        | ...             |

## Assumptions, Constraints, Dependencies
- MV tie‑in point and final MV rating to be confirmed with TiN (mobile substation used during works).
- FO connectors default LC/UPC unless TiN mandates APC.
- Work windows and access coordinated with operations; permits and escorts provided by TiN.

## Change Control & Governance
- Change requests logged with impact on scope/time/cost; TiN approval before execution.
- Weekly progress meetings; monthly steering; KPIs (HSE, schedule, quality, risks).

## Communications & Reporting Plan
- Weekly look-ahead; ITP status tracker; RFI log; test pack index; drawing register.

## What We Will Avoid
- Energized work; non-compliant materials; unsealed penetrations; undocumented splices; inadequate labeling.

## Appendices (to be embedded/attached)
- IFC/IFU drawing set; ITP index and forms; method statements; risk assessments (task-specific).
- Certificates of conformity/type tests; torque logs; OTDR traces; VLF reports.
- Training agenda & attendance; handover checklist; legalisation dossier.

---

## Engineering Calculations & Acceptance Criteria
### MV Cable Sizing & Volt Drop (example criteria)
- Design current Ib from ZPMC load; select cable with Iz ≥ Ib·k (derating for ambient, grouping).
- Short-circuit check: I²t withstand vs prospective Ik''; verify thermal/mechanical withstand per IEC 60949.
- Volt drop: ΔV = I·(R·cosφ + X·sinφ)·L. Acceptance: ≤ 5% at full load feeder end (project criterion), ≤ 3% typical.
- Termination torque per manufacturer; record in torque log.

### Earthing & Bonding
- Target earth resistance and step/touch voltage compliance per IEC 61936-1; continuity test ≤ 1 Ω pit-to-grid.
- Sheath bonding scheme to avoid circulating currents; bond drums/JBs to grid with labeled test links.

### Fibre Optical Budget (worked form)
- Loss_total = α·L + N_c·L_c + N_s·L_s + margin.
- Example: α=0.35 dB/km @1310 nm, L=0.8 km, N_c=2, L_c=0.25 dB, N_s=4, L_s=0.1 dB, margin=3 dB → ≈ 4.18 dB.
- Acceptance: IL ≤ 2.0 dB typical for single splice/patch path; OTDR traces clean, no macro-bends; polarity verified.

## Network & Cybersecurity Design
### Logical Topology
- VLANs: 200 Mgmt, 210 STS05 OT, 220 STS06 OT; 802.1Q trunk to OT core; ACLs block inter-VLAN except mgmt jump host.

### ACL Example (illustrative)
```text
deny ip vlan210 any vlan220 any
permit tcp vlan210 host <mgmt> eq 22
permit icmp vlan210 host <ntp>
deny ip any any log
```

### Services
- Time: NTP/PTP as per TiN; Syslog to SIEM; SNMPv3 to NMS; backups encrypted; role-based access.
- Security: firewall OT/IT demilitarized zone; MFA for admin; allowlist MACs on edge switches.

## Hardware Bill of Materials (representative or equivalent)
- MV termination/joint kits (e.g., Raychem/3M, IEC 60502-2 type-tested).
- SS enclosures IP67/IK10, C5M (e.g., Rittal/Rose) with breathers and gland plates.
- OS2 24F cable (e.g., Corning/Commscope), IP68 closures with trays (e.g., 3M/Corning).
- LC/UPC panels, pigtails, patch cords; labeling consumables (engraved plates, sleeves).
- Test equipment: OTDR (e.g., EXFO MaxTester), IL meter, insulation tester, VLF set.

## Software & Tooling
- ETAP/EasyPower for coordination; AutoCAD for drawings; SharePoint/Confluence for document control.
- EXFO TestSuite (or equivalent) for OTDR/IL reports; checklist apps for ITP execution.

## Work Breakdown Structure (WBS)
1. Project Initiation
   1.1 Kick-off, 1.2 Safety file, 1.3 Survey & data collection, 1.4 Risk workshop
2. Design
   2.1 SLDs, 2.2 JB/Drum GA, 2.3 Cable sizing/VD, 2.4 Coordination settings, 2.5 FO splice maps, 2.6 ITPs/MoMs
3. Procurement
   3.1 RFQs, 3.2 Tech eval, 3.3 POs, 3.4 FAT/certificates, 3.5 Logistics
4. Installation
   4.1 MV STS04 migration, 4.2 CTP6 JBs/drums, 4.3 Earthing/labels, 4.4 FO pull/splice/terminate
5. Testing & Commissioning
   5.1 MV IR/VLF, 5.2 Protection verification, 5.3 FO OTDR/IL/polarity, 5.4 Integrated checks
6. Handover & Legalisation
   6.1 As-builts, 6.2 O&M/training, 6.3 Dossier, 6.4 Punch list close

## Acceptance Test Procedures (ATP) – Checklists
### MV
- Visual/ID checks, torque log complete, IR ≥ threshold, VLF pass, settings signed by TiN.
### FO
- Polarity pass, IL within limit, OTDR traces attached, labels verified to schedule.
### Documentation
- Drawings as-built, test packs signed, asset register updated, training delivered.

## Spares & O&M
- MV: 2× termination kits, 1× joint kit, labels set, spare glands.
- FO: spare pigtails/patch cords, splice trays, labels; closure consumables.
- O&M: preventive maintenance checklist, cleaning kits, documentation updates.

## Training Plan
- Operator module (4h): isolation/energization, labeling, inspections.
- Maintenance module (6h): MV termination inspection, earthing checks, FO cleaning/testing basics.
- Documentation & HSE module (2h): records, permits, PPE, incident reporting.

## Warranty & SLA
- 12 months workmanship/materials; option to extend. Response: 4h remote, 24–48h on-site; defect rectification within 5 working days typical.

## Risk Matrix (Likelihood × Consequence)
| Risk | L | C | Rating | Mitigation |
|------|---|---|--------|------------|
| Duct blockage | M | M | M | Pre-rod/CCTV; alternate route |
| Weather delays | M | L | M | Float in programme; weather windows |
| Material lead time | H | M | H | Early PO; vendor expediting |

## Templates
- RFI form, NCR form, Change Request, ITP checklist sheets, Daily Site Report, Toolbox Talk form.

---

## File Locations
- Generated DOCX: `deliverables/STS_Tender_V3_1.docx`.
- Full tender content (this file): `deliverables/STS_Tender_V3_1_Content.md`.
- Sources: `scripts/sts_tender_content.json` + `scripts/generate-sts-tender-docx.js`.
- Regenerate DOCX anytime: `npm run generate:sts-docx`.
