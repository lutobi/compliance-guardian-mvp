# STS Connections Tender – Appendix 1 V3.1 — Communications Offer (Standalone)

Client: Terminal Investment Namibia (TiN)
Version: V1.0 (Draft)
Date: 2025-08-20

---

## Executive Summary
Selex Engineering proposes a turnkey communications program (fiber optic backbone and OT edge) fully aligned to Appendix 1 – RFP V3.1. We will deliver a resilient OS2 star from CTP6/CTP5 to the Cargo Building with disciplined splicing, TIA‑606 labeling, and acceptance testing, and integrate the OT edge with secure segmentation and time synchronization per TiN policy. The outcome is a clean, performant, and maintainable communications layer that supports SCADA/ops with verifiable evidence for legalisation.

- What we will do differently
  - Clean‑build discipline: IEC/TIA cleaning, inspection, and endface certification before every mate; no‑touch workflow.
  - Optical assurance by design: splice plans with loss budgets, service loops, bend‑radius control, and 30% spare fibers where feasible.
  - Segmentation that scales: VLANs per crane, dedicated Mgmt VLAN, ACLs enforcing least‑privilege, and firewall‑delimited OT/IT.
  - Evidence‑driven acceptance: OTDR (1310/1550), IL, and polarity results embedded in ITRs, with photo logs of every closure/panel.
  - Traceability: TIA‑606 IDs across cables/closures/panels/ports; as‑builts updated within 48 hours of field change.

- How we will deliver professionally
  - PMO rigor: baseline Gantt, RACI, risk/change control, and daily site diary; vendor expediting aligned to the pull/splice sequence.
  - Field workmanship: IP68 closures with strain relief, moisture control, and gel management; rack dressing to standard.
  - Technical assurance: IDC/IDR with TiN, pre‑splice mockups, and independent checker review of OTDR/IL traces.
  - Security readiness: configuration backups, role‑based access, MFA for admin, and NTP/PTP distribution with monitored drift.
  - Handover pack quality: splice maps, labeling schedules, calibrated instrument certs, O&M/training records, legalisation dossier.

- Why Selex Engineering
  - Port‑grade FO and OT delivery: marine exposure experience, closure integrity, and panel workmanship proven in terminals.
  - End‑to‑end capability: FO backbone, OT switching, firewall policy, and SCADA gateway integration under one accountable team.
  - Mature QA/ITP templates: standard checklists and ITR mappings reduce rework, accelerate acceptance, and improve traceability.
  - Lessons‑learned culture: prior port rollouts inform labeling, change control, and NMS/SIEM onboarding for day‑1 visibility.

## Compliance Statement
This offer is prepared in accordance with Appendix 1 - RFP connection of STSs V3.1. Where requirements are clarified or assumed, these are explicitly noted. Final alignment will be completed after review of any addenda and receipt of final design inputs.

## Delivery Commitments Snapshot — Communications
- Safety: PTW/LOTO; confined‑space controls for ducts/chambers; lifting plans for reels; stop‑work authority. See `## Installation Approach (General)` and `## HSE & RAMS Summary`.
- Quality & Evidence: 100% ITP adherence with photos, OTDR/IL traces, polarity checks; calibrated instruments tied to ITRs. See `## Quality Plan & ITP (Summary — Communications)` and `## Acceptance Test Procedures (ATP)`.
- Acceptance Readiness: thresholds for OTDR/IL met bi‑directionally; polarity and labeling audit passed before handover. See `## Acceptance Criteria` and `## FAT/SAT — Communications`.
- Traceability & Labeling: TIA‑606 schema across cables/closures/panels/ports; asset register updated within 48 hours of field change. See `## Labeling Schema Example (TIA-606/TiN)` and `## Asset Registration & Tagging`.
- Documentation SLAs: reviews ≤ 10 working days; witness invites ≥ 48h prior; actions/minutes issued within 24h. See `### Reporting & Meeting Cadence` and `## Documentation & Handover Plan`.
- Interfaces & Governance: weekly coordination and monthly steering with KPIs (HSE, schedule, quality, risks); change control applied to all scope changes. See `## RACI` and `## Interface & Stakeholder Management`.

## Delivery Workflow Map (ASCII)
```text
[Kick-off & Surveys] -> [Design & IDC/IDR] -> [Procurement/Expedite]
        H/W                    H/W                      |
                 [Installation (Pull/Splice; Method Statements, RAMS)]
                                H/W -> [T&C: OTDR/IL/Polarity]
                                              H/W -> [Handover & Legalisation]

Keys: H/W = Hold/Witness (ITR-10/20/30/40/50); Approvals: IFC; Docs: splice maps, traces, as-builts, O&M, legalisation dossier
```

## Compliance Matrix (Appendix 1 – RFP V3.1)
Legend: C = Compliant, PC = Partially Compliant, D = Deviation

### A) Technical & Design
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-A1] | FO/network standards and materials | Solution Strategy & Reference Architecture; Technical Materials Specification | C | IEC/TIA standards; port‑grade components |
| [Pending-A2] | OT edge design (VLANs, ACLs, segmentation) | OT Edge Logical Architecture; Network & Cybersecurity Design | C | Segmented VLANs; ACLs; DMZ; MFA |

### B) Method Statement & Sequencing
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-B1] | Installation methodology and sequencing | Installation Method Statement (FO) | C | Clean‑build discipline; evidence capture |
| [Pending-B2] | Closure/panel workmanship controls | FO Close‑Up Checklist | C | Labeling; strain‑relief; IP integrity |

### C) Testing & Commissioning
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-C1] | Optical testing requirements | Testing & Commissioning; Acceptance Test Procedures | C | OTDR, IL, polarity, continuity |

### D) QA/ITP & HSE
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-D1] | Quality plan, ITP, ITR mapping | Quality Plan & ITP; ITR Mapping (ITR‑10/20/30/40/50) | C | Hold/Witness mapped; evidence‑driven |
| [Pending-D2] | HSE, permits, RAMS | Project Management Plan (Narrative) | C | PTW/LOTO; task RAMS |

### E) Documentation, Training & Legalisation
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-E1] | Handover dossier & legalisation | Documentation & Handover Plan | C | As‑builts, test packs, approvals |
| [Pending-E2] | Training deliverables | Training Plan | C | Modules, assessments, artefacts |

### F) Programme & Milestones
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-F1] | Baseline programme & reporting | Programme (Gantt Milestones) | C | Baseline + look‑ahead cadence |

### G) Commercial Terms
| RFP Clause | Requirement | Where addressed | Compliance | Notes |
|---|---|---|---|---|
| [Pending-G1] | Warranty & SLAs | Warranty & SLA | C | 12 months (option 24); response/restore/rectify |
| [Pending-G2] | Employer‑supplied items | Commercial summary; Scope Notes | C | FO racks in Cargo Building per V3.1 |

---

## Scope Coverage — Communications
- Engineering & Design
  - FO star topology Cargo Building ↔ CTP6/CTP5; splice plans; rack elevations
  - Network segmentation, VLAN/ACL, OT edge security
  - Optical budget and acceptance criteria
- Procurement
  - OS2 9/125 μm cable, IP68 closures, LC/UPC panels/pigtails, labels
  - Certificates of conformity and type test reports
- Installation
  - FO pull from Cargo Building to CTP6; splice at closure; rack terminations
- Testing & Commissioning
  - FO OTDR 1310/1550 nm; insertion loss; polarity; documentation
- Documentation & Handover
  - As-built DWG/PDF, splice maps, labeling schedules
  - Test packs (FO), O&M manuals, training records, handover checklist
  - Legalisation dossier per V3.1
- Project Mgmt & Admin
  - Programme (Gantt), RACI, risk register, permitting schedule
  - Document control (10 working day review SLA), meeting cadence, escalation

---

# Part B – Communications Offer (Technical)

## Solution Strategy & Reference Architecture — Communications
- Design discipline: OS2 star topology with documented splice plans, 30% spare fibers minimum where feasible, service loops at closures/racks, and TIA-606 labeling across all assets (cables, trays, ports).
- Reliability: Dual-core concept at Cargo Building (Core A/B) with segregated patching and clear labeling to reduce human error. Closures rated IP68 with strain relief and bend-radius control.
  - Security: OT network segmented by VLANs per crane, ACLs enforcing least-privilege, firewall delimiting OT/IT, MFA for admin access, encrypted backups, and NTP/PTP per TiN policy.
  - QA/ITP alignment: Each activity (pulling, splicing, cleaning, testing) tied to hold/witness points with evidence (photos, OTDR traces, IL reports). Redlines drive as-built updates prior to handover.

### Overall Architecture (Electrical + SCADA + Telecomms)
```text
                                [Control Room / NOC]
                                +-------------------+
                                |  SCADA Servers    |
                                |  Historian / HMI  |
                                +---------+---------+
                                          |
                                       FO/L2 (OT)
                                          |
                            +-------------v-------------+
                            |     OT Core Switch        |
                            | (Layer-2/3, VLANs, NTP)   |
                            +-------------+-------------+
                                          |
                               FO/L2 or IEC-61850 MMS
                                          |
              +---------------------------v---------------------------+
              |                 SCADA Gateway / RTU                  |
              | (Dry Contacts / 61850 Goose, Time Sync, Security)    |
              +-----------+-------------------------------+-----------+
                          |                               |
                       DI/DO                        FO (Mgmt/Telemetry)
                          |                               |
   ==============================================================================================
   ELECTRICAL FEEDERS (11 kV, informed guess per UniGear ZS1 12/20 kV class and TiN settings)
   ----------------------------------------------------------------------------------------------
           [Employer MV Switchgear @ Cargo Building]  <--- permanent tie-in (informed guess)
                      |   (Feeder Fxx, 11 kV)     \
                      |                            \ (for works)
                      |                             \--> [Mobile Substation]
                      |                                      |
                      |                                      +--> Feeder to [CTP6]
                      |
                      |-------------------------- MV Cable Route (in ducts) ---------------------. 
                                                                                                  |
                                                                                                  v
                                         +-------------------+          +-------------------+
                                         |  CTP6 MV JB  A    |          |  CTP6 MV JB  B    |
                                         |  + Cable Drum --> |--------->|  + Cable Drum --> |-----> STS06
                                         |  STS05            |          |  STS06            |
                                         +-------------------+          +-------------------+
                                                     |
                                                     | (STS04 migration path)
                                                     |    X  [CTP6 existing STS04 disconnect]
                                                     v
                                            +-------------------+
                                            |  CTP5 MV JB       |
                                            |  + Cable Drum --> |-----> STS04
                                            +-------------------+

   ==============================================================================================
   TELECOMMS (Passive FO) — OS2 9/125 μm, 24F, duct-grade dielectric
   ----------------------------------------------------------------------------------------------
    [Cargo Building FO Rack (LC/UPC Panels)]
                      |
                      | OS2 24F Backbone (in same duct corridor, ref. Layout Sheets 4–5)
                      v
              +------------------+             +------------------+
              |  FO Closure #1   |-------------|  FO Closure #2   |--- OT Core Switch / Gateway
              |  (splice trays)  |             |  (splice trays)  |    (Mgmt/Telemetry VLANs)
              +------------------+             +------------------+
                         |                               |
                         | patch/pigtails                | patch/pigtails
                         v                               v
              [Cargo Building Panels]           [OT/Control Integration]
```

```text
 ................................ Proposed Works (this tender) ................................
 : - New CTP6 MV JB A/B with Cable Drums to STS05/STS06
 : - New CTP5 MV JB with Cable Drum to STS04 (migration)
 : - MV Termination Kits; IR + VLF Withstand Testing; Labels/Tags (TIA-606)
 : - Earthing kit; Surge protection at pits; Documentation & ITP execution
 : - OS2 24F FO backbone, IP68 closures, LC/UPC rack panels, pigtails/patch cords
 : - Permanent tie-in @ Cargo Building MV switchgear (informed guess; shortest route and
 :   spare feeder per Terminal Layout and protection sheet; pending TiN confirmation)
 ..............................................................................................
```

### Reference Architecture (OT Edge logical)
```text
[Core A]=======================[Core B]            (Dual-core @ Cargo Building)
       \\         L3/VRRP/LACP   //
            [Industrial Firewall (HA pair)]          (OT/IT boundary, ACLs)
                          |
                      [OT Core Stack]
                    /                 \
          VLAN210 (STS05)         VLAN220 (STS06)
               |                         |
            [STS05]                   [STS06]
               |                         |
         Mgmt VLAN 99 -------------- Mgmt VLAN 99        (FO mgmt/telemetry to RTU/SCADA GW)

  Time/NTP/PTP:  [NTP/PTP Grandmaster] --> OT Core --> Edge (per TiN policy)
  Monitoring:    [NMS/SIEM] <---- Syslog/SNMP/NetFlow from OT Core/Firewall/Switches

  --------------------------- Optional / Recommended ---------------------------
  - Redundancy: VRRP/LACP on core uplinks; firewall HA with state sync; dual PSUs where feasible
  - Segmentation: Dedicated VLANs per crane, mgmt VLAN separated; ACLs least-privilege by role
  - Time Sync: NTP/PTP hierarchy with fallback; auth NTP where supported; log time drift alerts
  - Security: MFA for admin, config backups, encrypted logs, change control, jump host workflow
  - Monitoring: SNMP traps, syslog to SIEM, NetFlow for anomaly detection; NTP/PTP status checks
  ------------------------------------------------------------------------------
```

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

### Design Diagrams & Appendices (links)
- Communication duct layout (Sheet 4 of 9): [open](Appendices%20copy/3%29%20Communication%20duct%20layout%20%28sheet%204%20of%209%29.pdf)
- Communication duct layout (Sheet 5 of 9): [open](Appendices%20copy/4%29%20Communication%20duct%20layout%20%28sheet%205%20of%209%29.pdf)
- Terminal Layout: [open](Appendices%20copy/5%29%20TERMINAL%20LAYOUT.pdf)
- Prysmian Protolon (SMK) LWL: [open](Appendices%20copy/7%29%20Prysmian-%C2%A0Protolon%28SMK%29-LWL.pdf)

#### Plan-View Route Schematic (derived from duct layout)
```text
 [Cargo Building FO Rack]
        |
        +--> [Duct Route] --> [CTP6 Closure] --> STS05
        |                           \\--> STS06
        |
        +--> [Duct Route] --> [CTP5 Closure] --> STS04

 Notes:
  - Routing and chambers per Communication duct layout (Sheets 4–5) and Terminal Layout.
  - Branch length basis ≈ 0.8 km per branch; verify via survey/as-built.
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

## Labeling Schema Example (TIA-606/TiN)
| Asset Type | Label Example        | Description                          |
|------------|----------------------|--------------------------------------|
| Cable      | CB-FO-24F-CTP6-01    | Cargo Building → CTP6, 24F, cable #1 |
| Closure    | CTP6-CL-01           | CTP6 main FO closure #1              |
| Panel Port | CB-R1-P1-LC01        | Cargo Bldg, Rack1, Panel1, LC-01     |
| Splice Tray| CTP6-CL-01-TRAY02    | Closure tray #2                      |
| Fibre Core | F-CTP6-01-C01        | Fibre core #1 in cable 01            |

## Optical Budget & Acceptance Thresholds
- Assumed two branches: Cargo Building ↔ CTP6 ≈ 0.8 km; Cargo Building ↔ CTP5 ≈ 0.8 km.
- Per branch @1310 nm: 0.8 km fiber ≈ 0.28 dB; connectors 2×0.25 dB; splices 4×0.1 dB; margin 3 dB; design budget ≈ 4.18 dB.
- Acceptance: IL ≤ 2.0 dB typical; ≤ 3.0 dB max with extra panels; clean OTDR traces.
 - Datasheet basis: G.652.D attenuation typical ≈ 0.35 dB/km @1310 nm; use datasheet typicals where available. See Prysmian Protolon (SMK) LWL: [open](Appendices%20copy/7%29%20Prysmian-%C2%A0Protolon%28SMK%29-LWL.pdf)
 - Engineering note: Final budget will be verified against as-built splice/connector counts and measured lengths per duct layout drawings.

## Method Statement
- Pre-works and duct preparation
  Confirm route from Cargo Building to CTP6. Obtain PTWs and establish confined-space controls for any manhole access (gas test, ventilation, tripod/harness if required). Rod the ducts, pass a mandrel to confirm diameter/obstructions, install pull rope, and label intermediate access points. Dewater and clean chambers as needed.

- Cable pulling (OS2 single-mode)
  Stage the cable reel with spindle stands and braking control. Set up a capstan winch with in-line dynamometer to monitor pulling tension. Apply approved cable lubricant and use rollers/bell mouths at all bends. Maintain minimum bend radius and sidewall pressure per manufacturer datasheet (e.g., Prysmian Protolon (SMK) LWL: [open](Appendices%20copy/7%29%20Prysmian-%C2%A0Protolon%28SMK%29-LWL.pdf)). Record peak tension and pull length. At entries, fit bushings and seal penetrations with rated compounds.

- CTP6 closure installation and splicing
  Mount the IP68 closure, allocate trays per the splice plan, and provide service loops. Prepare fibers: strip, clean with lint-free wipes and alcohol, cleave, and fusion-splice to pigtails per tray allocation. Apply splice protectors and dress fibers to maintain bend radius. Close and seal the closure; pressure test if required by spec.

- Cargo Building rack terminations
  Prepare LC/UPC patch panels in the designated rack U-spaces. Route incoming cables through cable management, bond metallic strength members to rack ground, and terminate pigtails to adapters. Label ports and cables per the TIA-606/TiN schema. Document tray maps and rack elevations.

  - Cleaning, inspection, and housekeeping
    Clean all connectors with one-click tools and inspection scopes. Verify that grommets, seals, and grounding are in place. Update the splice schedule and labeling register.

### CTP6/CTP5 Closure & Drum Handling — FO
- Drum setup: spindle stands with braking; arrows indicate pay-off direction; keep drum flanges aligned with duct entry to minimize sidewall pressure.
- Tension control: capstan winch with in-line load cell; log peak tension and distance; comply with manufacturer limits.
- Bend radius: use bell mouths/rollers; maintain minimum bend radius at all entries and within closure trays.
- Closure practice: allocate trays as per plan; heat-shrink/protect sleeves; pressure test if specified; ensure desiccant where required.
 - Service loops: provide loops at closure and racks; secure with velcro, not cable ties on bare fibres.

 ```text
 [Drum] --brake--> [Capstan] --> [Duct/Route] --> [CTP6 Closure]
    ^ load cell (tension log)      (rollers/bell mouths)
 ```

### FO Close-Up Checklist (Closure/Panel)
- Closure: trays allocated and labeled; splice protectors seated; fibres dressed with bend radius respected; desiccant (if specified) in place.
- Seals/glands: correct sizes installed; IP rating maintained; strain relief fitted; no sharp edges; entry ports plugged if unused.
- Grounding: metallic strength member/bond wire grounded to rack earth; continuity verified and logged.
- Panel: pigtail slack managed; ports labeled per TIA-606/TiN; port map posted inside rack door.
- Cleanliness: all connectors cleaned and inspected (scope) prior to close-up; endface photos sampled.
- Evidence: photo set (overall, trays, seals, labels); ITR reference noted; hold/witness sign-off completed.

### ATP Micro-Checklists (FO) — ITR Mapping
- ITR-10 (Closure/Panel Installation): mounting/fixings level; seals/glands; grounding bonds; labeling applied; service loops and tray allocation; photos.
- ITR-20 (Cable Pull Log): route pre-check; rollers/bell mouths set; lubricant type/batch; load-cell readings (start/peak/end); sidewall pressure/bend-radius checks; weather; pay-off direction.
- ITR-30 (Splicing/Terminations): cleaning/inspection; cleave quality; splice loss per joint recorded; tray/core mapping; polarity verified; panel terminations dressed.
- ITR-40 (Testing): OTDR bi-di with launch/tail; IL (OLTS) results; instrument calibration IDs; anomalies logged and rectified.
- ITR-50 (Pre-energization/Readiness): documents complete (splice maps, port maps, traces); label audit passed; punch list closed/owners/dates.

### CTP6/CTP5 Closure & Handover Steps — FO
- Pit/chamber reinstatement: remove debris; verify drainage; seal entries; update photos.
- Spares & O&M: deliver closure seal kits, spare trays, pigtails/patch cords, cleaning kits; inventory sheet signed.
- Training: brief TiN maintainers on port maps, cleaning/inspection routine, test pack retrieval; attendance recorded.
- Documentation: update asset register with tag IDs and port maps; upload OTDR traces and IL tables; index in handover dossier.

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

## Factory Acceptance Test (FAT) & Site Acceptance Test (SAT) — Communications
- FAT (vendor/pre-assembly)
  - Verify cable datasheets (OS2 G.652.D), certificates of conformity, and type-test reports for closures/panels.
  - Inspect closures, trays, adapters, and pigtails for part numbers, batch, and physical condition; confirm IL/return-loss ratings from vendor.
  - Pre-assemble rack panels where applicable; check labeling plates and engraving quality; verify earthing/bonding accessories.
  - Instrument calibration certificates for OTDR/OLTS/inspection scopes available and in date.
- SAT (on-site)
  - Visual/audit: labels per TIA-606 and TiN schema; closure seals/glands correct; grounding bonds installed; bend-radius respected.
  - Cleaning/inspection: one-click cleaning and endface scope inspection before measurements; record representative photos.
  - Testing: bi-directional OTDR at 1310/1550 nm with launch/tail fibers; OLTS insertion loss; polarity/continuity check.
  - Acceptance: results within budget; anomalies investigated and rectified; all traces and IL tables saved to the test pack.
- Handover Readiness
  - Updated splice maps and rack elevations; completed ITP checklists with hold/witness sign-offs; O&M and training records compiled.

## Technical Materials Specification — Communications
- FO Cable: OS2 9/125 μm single-mode, dielectric/armoured, duct-grade.
- Closures: IP68 with trays, suitable for OS2 24F cable.
- Patch Panels: 19" LC/UPC 24F/48F, with labeling plates and engraving.
- Pigtails & Patch Cords: LC/UPC G.652.D, with inspection and test reports.
- Labels/Tags: TIA-606 compliant, with engraving and adhesive suitable for OT environment.
- Test Equipment: OTDR (1310/1550 nm), OLTS, inspection scopes, and one-click cleaning tools.
 - Datasheet basis: Prysmian Protolon (SMK) LWL (or equivalent) for attenuation, bend radius, and pull tension guidance: [open](Appendices%20copy/7%29%20Prysmian-%C2%A0Protolon%28SMK%29-LWL.pdf)

---

# Project Management & Administration

## Project Management Plan (Narrative)
We apply a PMI/PRINCE2-aligned governance framework tailored for terminal operations. A dedicated Project Manager (PM) leads planning, coordination, and reporting; a Site Supervisor controls day-to-day works; Engineering manages design changes and technical queries. Baseline scope, schedule, and cost are established at kick-off and controlled through a formal change process. Weekly site coordination meetings align look-ahead activities, access windows, and permits; a monthly steering forum resolves escalations and reviews KPIs (HSE, schedule performance, quality, risks, commercial).

Schedule is managed with a resource-loaded Gantt and a 3-week rolling look-ahead. Constraints (permits, outages, materials) are tracked and cleared prior to task start. Risks are reviewed weekly, with owners, mitigations, and residual ratings updated. Issues and RFIs are logged and answered within agreed SLAs. Commercial management includes progress valuations, milestone invoicing, and change orders. Interfaces with TiN Power, ICT/OT, HSE and Operations are governed by an interface register that defines data requirements (e.g., rack allocations) and hold/witness points.

Quality is embedded via an approved ITP; each hold/witness point ties to objective evidence (photos, OTDR/IL results). HSE is enforced through PTW/LOTO, toolbox talks, and task-specific RAMS. Communications follow a documented plan covering progress reports, dashboard metrics, and distribution lists. All decisions and approvals are recorded in meeting minutes and form part of the handover dossier.
## Engineering Methods & Template Pack — Communications
- Calculations & Optical Budget
  - Optical budget workbook with margins; route length basis from duct drawings; polarity mapping. See `## Optical Budget & Acceptance Thresholds`.
- QA/ITP & ATP Artefacts
  - ITR‑10/20/30/40/50 forms; Cable Pull Log; Splice Loss Sheet; OTDR/IL result tables; Close‑up checklists. See `## Quality Plan & ITP (Summary — Communications)` and `## Acceptance Test Procedures (ATP)`.
- Safety & Permitting Pack
  - PTW/LOTO; confined‑space permit and gas test log; lifting plan/tackle inspection; RAMS templates. See `## HSE & RAMS Summary`.
- Drawings, Schedules & Registers
  - Splice maps, rack elevations; labeling schedule per TIA‑606; asset register template with port/core fields. See `## Labeling Schema Example (TIA-606/TiN)` and `## Asset Registration & Tagging`.
- Change & Configuration Management
  - RFI and Change Request forms; revision log; configuration backup policy for OT edge (if in scope) and NTP/Syslog settings.
- Training & Handover Artefacts
  - Training agenda, attendance, assessments; O&M index; legalisation dossier index and evidence checklist.
- Evidence Pack Structure
  - Standard folder/naming convention for photos, OTDR traces (bi‑di), IL tables; index sheet linking ITRs to evidence.

## Documentation & Handover Plan
 We implement disciplined document control with a dedicated coordinator and a structured register (drawings, RFIs, NCRs, ITPs, test records, vendor data). Submittals follow a standard numbering convention and revision policy; reviews are completed within a 10-working-day SLA unless accelerated by agreement. Only approved IFC/IFU drawings are used for site works; redlines are captured daily and rolled into as-builts prior to energization.

Test packs are organized by system and location, linking ITP checkpoints to evidence (photos, OTDR traces, IL reports). O&M manuals compile datasheets, warranties, recommended maintenance, and spare parts. The handover dossier includes: as-built DWG/PDF sets, ITP/test records, certificates of conformity and type tests, training agendas and attendance, asset register (tags/serials/locations), and the legalisation dossier required by Appendix 1 V3.1. Digital deliverables are provided in both native (DWG, XLSX) and PDF formats with an index for traceability. A formal handover meeting reviews punch list status and acceptance certificates.

## Programme (Gantt Milestones)
| Phase                        | Duration (wks) | Notes                                           |
{{ ... }}
|-----------------------------|----------------|-------------------------------------------------|
| Surveys & Data Collection   | 2              | Duct CTP6↔Cargo Building; rack audit            |
| Detailed Design & Approvals | 4              | IFC package and ITPs                            |
| Procurement & Logistics     | 6              | Overlaps design tail; long-leads                |
| Installation (FO)           | 6              | Method statements executed; RAMS                |
| Testing & Commissioning     | 2              | FO acceptance                                   |
| Legalisation & Closeout     | 2              | Docs, O&M, training, handover                   |

### Programme Timeline (ASCII)
```text
[Survey 2w]--[Design 4w]--[Procure 6w]
                          \--overlap-->[Install 6w]--[T&C 2w]--[Closeout 2w]
Milestones: IFC Approved -> Materials on Site -> Substantial Completion -> Handover
Critical: ducts access, closures delivery, test gear availability
```

## RACI
| Role        | Design | Procure | Install | Test/Comm | Docs/Handover |
|-------------|--------|---------|---------|-----------|---------------|
| Contractor  | R      | R       | R       | R         | R             |
| TiN PM/Tech | A/C    | C       | C       | C         | A/C           |
| TiN IT/ICT  | C      | C       | C       | A/C       | C             |
| HSE         | A      | C       | A       | A         | C             |

## Organization & Roles — Communications
- PM (Contractor): planning, reporting, change control, stakeholder coordination.
- Site Supervisor: daily works control, RAMS briefings, quality checkpoints.
- FO Lead Technician: splicing/testing lead; evidence collection; as-built redlines.
- Document Controller: submittals, ITP/test pack collation, handover dossier.
- HSE Officer: PTW, toolbox talks, inspections, incident management.

### Organization Chart
```text
Client (TiN PM/Tech Authority)
          ^
          |
      Project Manager
      /      |      \
Site Sup  FO Lead  Doc Control
    |        |          |
 Install   Splicing   ITP/Test Packs
 Crew      & Testing   & Handover
```

### Reporting & Meeting Cadence
- Weekly site coordination (look-ahead, constraints, permits).
- Monthly steering with KPIs (HSE, schedule, quality, risks, commercials).
- ITP hold/witness notifications ≥48h prior; minutes issued within 24h.

---

 

## Engineering & Design Approach — Fibre Optics (FO)
The FO design adopts OS2 G.652.D single-mode throughout, with LC/UPC connectors unless TiN mandates APC for specific links. We define a star topology from the Cargo Building to field closures, allocate tray maps to preserve spares and growth, and specify service loop policies. An optical budget is computed per path with allowances for fiber loss, connector and splice losses, and a 3 dB design margin; acceptance thresholds are tied to this budget. Splicing is planned as fusion with tray allocation and polarity verified end-to-end; connector cleanliness and inspection are mandated. Mechanical considerations include maintaining minimum bend radius, controlling pull tension/sidewall pressure, and sealing all entries. The design package comprises rack elevations, splice plans, labeling schedules, and test acceptance criteria aligned to the ITP.

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

## Procurement & Logistics Plan
We operate a structured source-to-site process governed by a procurement plan and a live materials tracker. RFQs are issued to approved vendors with technical datasheets, standards compliance (IEC/EN), and environmental requirements. Bids undergo a technical evaluation against mandatory criteria (type-test reports, CoCs, warranty terms, lead times) before commercial adjudication. Purchase Orders embed quality clauses and define hold/witness points.

Expediting begins at award: vendors submit manufacturing schedules, inspection & test plans, and submittals (drawings, labels) for approval. Logistics is aligned to the installation sequence; packaging specifies moisture barriers and handling indicators. Site receiving uses an RFI process; sensitive FO components are stored in controlled conditions; kitting aligns to ITP steps.

## Installation Approach (General)
Site works commence after mobilisation, safety induction, and permit acceptance. Each activity is governed by an approved Method Statement and RAMS. Supervisors brief the team daily (TBT). Barriers, signage, and exclusion zones are established before work; confined-space and lifting plans are enforced where applicable. Quality is built-in: checkpoints are recorded with photos and test logs; redlines captured contemporaneously.

## Value Engineering & Alternatives
We evaluate alternatives that reduce lifecycle cost and risk without compromising compliance. Examples include optimizing closures/panel counts, selecting APC on long spans to improve return loss where TiN standards allow, and alternative fiber routes to avoid congested ducts. Each option is documented with cost/schedule/maintenance impact and submitted for approval.

## Sustainability & Environmental Management
Our Environmental Management Plan addresses waste minimization, segregation, and responsible disposal; control of dewatering discharges; spill prevention and response; and noise/light management for adjacent operations. Preference for low-VOC consumables and local sourcing to reduce transport emissions.

## Interface & Stakeholder Management
Interfaces span Operations, ICT/OT, HSE, and external authorities. We maintain an interface register identifying owners, data dependencies (e.g., rack allocations), and approval gates. Weekly coordination meetings track look-ahead constraints and access windows; changes are channelled through change control with impact assessments.

## Asset Registration & Tagging
All new assets are tagged per TiN’s schema and registered into the asset register/CMMS. Tagging covers closures, panels, terminations, and cabling. Serial numbers, test certificates, and location references are linked to each asset. Optional QR-coded labels can be provided.

## Detailed Scope of Work — Communications
- FO: Cargo Building ↔ CTP6 star links; closures; rack panels; labeling; OTDR/IL tests.
- Documentation: IFC/IFU drawings, ITPs, test packs, O&M, training, legalisation dossier.
- Project Mgmt: programme, RACI, risk, meetings, change control, HSE.

## Project Deliverables (Communications)
- Drawings: splice maps, rack elevations, labeling schedules.
- Calculations: optical budget.
- QA/ITP: inspection/test records, factory certificates, OTDR/IL reports.
- Handover: as-built DWG/PDF, O&M manuals, training records, legalisation dossier.

## Hardware & Software Requirements
### Hardware (examples or equivalent)
- OS2 24F cable, IP68 closures with trays, LC/UPC panels/pigtails, labels per TIA-606.

### Software/Tools
- AutoCAD, EXFO TestSuite (or equivalent) for OTDR/IL reports; SharePoint/Confluence for document control.

## Step-by-Step Implementation Plan
1) Pre-Mobilisation (Week 0–2)
   - Kick-off; duct and chamber surveys; safety file submission; permit planning.
   - Preliminary designs; risk workshop; procurement of long-leads.
2) Detailed Design & Approvals (Week 2–6)
   - IFC drawings; splice plans; ITPs; method statements; TiN approvals.
3) Procurement & FAT (Week 4–10)
   - Order FO hardware; receive certificates; pre-assembly checks.
4) Installation (Week 8–14)
   - FO: Pull Cargo→CTP6; closures; rack terminations; labeling.
5) Testing & Commissioning (Week 14–16)
   - FO: OTDR (1310/1550), IL, polarity; documentation of traces.
6) Handover & Legalisation (Week 16–18)
   - As-builts, test packs, training, legalisation dossier; punch list close-out.

## Quality Plan & ITP (Summary — Communications)
| Stage                     | Checkpoint                              | Hold/Witness | Record |
|---------------------------|-----------------------------------------|--------------|--------|
| Material Receiving        | CoC, visual, type tests                 | W            | RFI-01 |
| Closure/Panel Installation| Level/fixings, seals, grounding, labels | H            | ITR-10 |
| FO Cable Pulling          | Rollers, lubricant batch, tension log, bend/sidewall  | W            | ITR-20 |
| FO Splicing/Terminations  | Tray map, splice loss, polarity         | W            | ITR-30 |
| Testing (FO)              | OTDR/IL                                 | H            | ITR-40 |
| Pre-energization Review   | Docs complete, permits                  | H            | ITR-50 |

## HSE & RAMS Summary
- PTW process per TiN; confined space/duct entry controls; lifting plans for reels.
- Environmental: dewatering controls, spill kits, waste disposal; corrosion mitigation.

 
## Job Delivery Requirements (Prerequisites) — Communications
- Approvals: IFC drawings, ITPs, RAMS, permit to work.
- Access: confirmed duct/manhole access windows; escort arrangements.
- Materials & Instruments: FO cable, closures, panels on site; OTDR/OLTS calibrated; cleaning kits available.
- Team: competent splicer, supervisor, HSE officer.
- Gate Acceptance Checklist:
  - PTW approved; TBT conducted; risk controls in place.
  - Materials verified against CoC; inspection done.
  - Drawings latest IFC issued to site; redline template ready.


---

## Engineering Calculations & Acceptance Criteria (Communications)
### Fibre Optical Budget (worked form)
- Loss_total = α·L + N_c·L_c + N_s·L_s + margin.
- Example: α=0.35 dB/km @1310 nm, L=0.8 km, N_c=2, L_c=0.25 dB, N_s=4, L_s=0.1 dB, margin=3 dB → ≈ 4.18 dB.
- Branch lengths assumed: CTP6 ≈ 0.8 km; CTP5 ≈ 0.8 km.
- Acceptance: IL ≤ 2.0 dB typical for single splice/patch path; OTDR traces clean, no macro-bends; polarity verified.

## Hardware Bill of Materials (Communications — representative)
- OS2 24F cable (e.g., Corning/Commscope), IP68 closures with trays (e.g., 3M/Corning).
- LC/UPC panels, pigtails, patch cords; labeling consumables (engraved plates, sleeves).
- Test equipment: OTDR (e.g., EXFO MaxTester), IL meter, inspection scopes.

## Software & Tooling
- EXFO TestSuite (or equivalent) for OTDR/IL reports; AutoCAD; SharePoint/Confluence for document control.

## Work Breakdown Structure (WBS)
1. Project Initiation
   1.1 Kick-off, 1.2 Safety file, 1.3 Survey & data collection, 1.4 Risk workshop
2. Design
   2.1 Rack elevations, 2.2 Splice plans, 2.3 Labeling schedule, 2.4 ITPs/MoMs
3. Procurement
   3.1 RFQs, 3.2 Tech eval, 3.3 POs, 3.4 Certificates, 3.5 Logistics
4. Installation
   4.1 Pull Cargo→CTP6, 4.2 Closure install, 4.3 Rack terminations, 4.4 Labeling
5. Testing & Commissioning
   5.1 OTDR bi-directional, 5.2 IL, 5.3 Polarity
6. Handover & Legalisation
   6.1 As-builts, 6.2 O&M/training, 6.3 Dossier, 6.4 Punch list close

## Acceptance Test Procedures (ATP) – Checklists
### Flow Overview
```text
[Visual/Label Audit] -> [Polarity/Continuity] -> [OTDR Bi-di] -> [IL (OLTS)] -> [Docs Pack]
```
### FO
- Visual/Label audit: closures sealed, bend radius respected; labels match TIA-606/TiN schedule.
- Polarity/Continuity: VFL/light-source check A↔B; correct cross-overs prior to measurement.
- OTDR: bi-directional @1310/1550 nm with launch/tail; event table reviewed; anomalies investigated.
- Insertion Loss: end-to-end IL within budget (≤2.0 dB typical; ≤3.0 dB if extra panels); reflectance where available.
- Evidence: save traces (both directions), IL tables, endface photos where applicable.
### Documentation
- ITP checklists signed at hold/witness points; updated splice maps and rack elevations.
- Test pack compiled and indexed; asset register updated with tag IDs/port maps; training attendance recorded.

## Spares & O&M (Communications)
- Spares (recommended): LC/UPC pigtails (x12), patch cords (x12), splice trays (x2), closure seal kits (x2), labels/plates, cleaning kits, spare adapters.
- Tools/Consumables: one-click cleaners, lint-free wipes, isopropyl alcohol, protection sleeves, gloves.
- Preventive Maintenance:
  - Quarterly: visual inspection of panels/closures; clean connectors; verify labels; check grounding.
  - Semi-annual: sample OTDR/IL on representative links; update documentation if deviations observed.
  - Annual: full documentation audit; refresh training.
- Documentation: maintain test pack revisions; record maintenance actions; update asset register on any changes.

## Training Plan
- Modules:
  - Operator (3h): labeling, basic cleaning; change request flow. Outcome: operator can patch correctly and raise CR.
  - Maintenance (4h): inspection, cleaning, basic OTDR/IL interpretation. Outcome: tech can validate link health and escalate.
  - Documentation & HSE (2h): records, permits, PPE, incident reporting. Outcome: compliant documentation and safe practices.
- Assessments: short quiz + practical connector clean/inspect.
- Artefacts: slide deck, quick-reference sheets, sign-in sheets, recorded demo (optional).

## Warranty & SLA
### Coverage
- 12 months workmanship/materials on FO passive components supplied/installed (option to extend to 24 months).
- Includes re-termination/re-splicing where required, replacement of defective pigtails/patch cords as needed, endface clean/inspect evidence, and documentation updates.

| Event | Remote Response | On-site | Resolution Target |
|---|---|---|---|
| Critical link down | ≤4h | 24–48h | 5 working days typical |
| Non-critical degradation | ≤8h | 3–5 days | Planned remedial |

### Exclusions
- Civil beyond duct access, active switches (unless included), misuse/third‑party damage, and force majeure.

### Step-by-Step Warranty Claim Process
1) Log ticket with description, photos, and traces (OTDR/IL).
2) Remote triage; schedule site if required.
3) Rectify and re-test (OTDR/IL); update documentation and close ticket.
4) Closeout report and sign-off.

## Risk Matrix (Likelihood × Consequence)
| Risk | L | C | Rating | Owner | Trigger/Monitor | Mitigation |
|------|---|---|--------|-------|-----------------|------------|
| Duct blockage | M | M | M | Contractor | Pre-rod/CCTV shows obstruction | Alternate route; micro-trenching option |
| Weather delays | M | L | M | PM | Weather forecast; wind alerts | Float; re-sequence indoor works |
| Material lead time | H | M | H | Procurement | Vendor schedule slips | Early PO; expediting; alternates |
| Labeling errors | M | L | M | Doc Control | Spot checks | Dual-review; on-panel checklists |
| High splice loss | L | M | M | FO Lead | OTDR events >0.3 dB | Re-splice; retrain; QC sampling |
| Damage during pull | L | H | H | Site Sup | Tension logs; alarms | Dynamometer; rollers; trained crew |

## Templates
- RFI form, NCR form, Change Request, ITP checklist sheets, Daily Site Report, Toolbox Talk form.
 
## Document References & Traceability (Communications)
 - Communication duct layout (Sheet 4 of 9) — basis for Cargo Building ↔ CTP6 routing and chamber access. [open](Appendices%20copy/3%29%20Communication%20duct%20layout%20%28sheet%204%20of%209%29.pdf)
 - Communication duct layout (Sheet 5 of 9) — basis for Cargo Building ↔ CTP5 routing and chamber access. [open](Appendices%20copy/4%29%20Communication%20duct%20layout%20%28sheet%205%20of%209%29.pdf)
 - Terminal Layout — cross-check of building/CTP locations and constraints. [open](Appendices%20copy/5%29%20TERMINAL%20LAYOUT.pdf)
 - Prysmian Protolon (SMK) LWL — optical cable datasheet underpinning attenuation and handling limits. [open](Appendices%20copy/7%29%20Prysmian-%C2%A0Protolon%28SMK%29-LWL.pdf)

### Route length basis (from drawings)
| Segment | Basis drawing(s) | Estimated length |
|---|---|---|
| Cargo Building ↔ CTP6 | Communication duct layout (Sheet 4 of 9); TERMINAL LAYOUT | ≈ 0.8 km |
| Cargo Building ↔ CTP5 | Communication duct layout (Sheet 5 of 9); TERMINAL LAYOUT | ≈ 0.8 km |

### Requirements & Decision Traceability Matrix (Communications)
| Item / Decision | Source document(s) | Proposal section(s) | Notes |
|---|---|---|---|
| Fibre routing, chambers, and path feasibility | Communication duct layout (Sheet 4 of 9) [open](Appendices%20copy/3%29%20Communication%20duct%20layout%20%28sheet%204%20of%209%29.pdf); Communication duct layout (Sheet 5 of 9) [open](Appendices%20copy/4%29%20Communication%20duct%20layout%20%28sheet%205%20of%209%29.pdf); Terminal Layout [open](Appendices%20copy/5%29%20TERMINAL%20LAYOUT.pdf) | Fibre Optic Star Topology; Method Statement; Route length basis; Assumptions & Clarifications (Communications) | Drawings inform star topology routes and access points; field verification still required |
| Optical attenuation and handling parameters | Prysmian Protolon (SMK) LWL [open](Appendices%20copy/7%29%20Prysmian-%C2%A0Protolon%28SMK%29-LWL.pdf) | Optical Budget & Acceptance Thresholds; Method Statement (Cable pulling); Technical Materials Specification | Basis for α (dB/km), bend radius, pull tension, and handling constraints |
| Branch length assumptions used in design budget | Communication duct layout Sheets 4–5 [open](Appendices%20copy/3%29%20Communication%20duct%20layout%20%28sheet%204%20of%209%29.pdf) / [open](Appendices%20copy/4%29%20Communication%20duct%20layout%20%28sheet%205%20of%209%29.pdf); Terminal Layout [open](Appendices%20copy/5%29%20TERMINAL%20LAYOUT.pdf) | Optical Budget (worked form); Route length basis; Assumptions & Clarifications (Communications) | Assumed ≈0.8 km per branch pending survey/as-built confirmation |

---

### Assumptions & Clarifications (Communications)
- Optical budget inputs (route length, splice/connector counts) will be verified against duct survey/as-built data; thresholds will be updated if required.
- Quantities/Unit Prices are indicative pending vendor confirmation; BoQ will be updated post-confirmation.
 - Branch lengths are based on Communication duct layout drawings (Sheets 4–5 of 9) and Terminal Layout; final lengths to be field-verified against as-built survey.

## Part B – Communications Bill of Quantities (BoQ)
| Item                   | Description / Spec                                         | Qty  | Unit | Unit Price (USD) | Amount (USD) |
|------------------------|------------------------------------------------------------|------|------|------------------|--------------|
| Preliminaries (PM/HSE/QA/Doc Control) | Governance, HSE, QA, document control                 | 1    | Lot  | $4,500.00        | $4,500.00    |
| Detailed Design & IFC  | Detailed design package and IFC approvals                  | 1    | Lot  | $2,500.00        | $2,500.00    |
| OS2 FO Cable           | 9/125 μm single-mode (G.652.D), duct-grade dielectric (non-metallic), 24F | 1600 | Lm   | $1.50            | $2,400.00    |
| FO Closures            | IP68 splice closures with trays (CTP6)                     | 2    | EA   | $350.00          | $700.00      |
| Patch Panels           | 19" LC/UPC 24F/48F panels (Cargo Building)                 | 2    | EA   | $280.00          | $560.00      |
| Pigtails & Patch Cords | LC/UPC G.652.D                                            | 36   | EA   | $12.00           | $432.00      |
| Rack Accessories       | Cable mgmt, blanks, grounding                              | 1    | Lot  | $350.00          | $350.00      |
| Labels/Tags            | TIA-606 compliant                                         | 1    | Lot  | $200.00          | $200.00      |
| Splicing & Testing     | Fusion splice, OTDR/IL with reports                        | 1    | Lot  | $2,200.00        | $2,200.00    |
| Installation & Commissioning   | FO works labor                                     | 1    | Lot  | $6,000.00        | $6,000.00    |
  
- Total (Communications): $19,842.00
  
## Detailed BoQ (Expanded — Communications)
| Item                          | Qty   | Unit | Unit Price (USD) | Amount (USD) |
|-------------------------------|-------|------|------------------|--------------|
| Preliminaries (PM, HSE, QA, Doc Control) | 1     | Lot  | 4,500.00         | 4,500.00     |
| Detailed Design & IFC         | 1     | Lot  | 2,500.00         | 2,500.00     |
| OS2 FO Cable                  | 1,600 | Lm   | 1.50             | 2,400.00     |
| IP68 FO Closures              | 2     | EA   | 350.00           | 700.00       |
| LC/UPC Rack Panels            | 2     | EA   | 280.00           | 560.00       |
| Pigtails & Patch Cords        | 36    | EA   | 12.00            | 432.00       |
| Rack Accessories              | 1     | Lot  | 350.00           | 350.00       |
| Labels/Tags (TIA-606)         | 1     | Lot  | 200.00           | 200.00       |
| Splicing & Testing            | 1     | Lot  | 2,200.00         | 2,200.00     |
| Installation & Commissioning  | 1     | Lot  | 6,000.00         | 6,000.00     |
| Subtotal (Communications, direct) |   |      |                  | 19,842.00    |

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
