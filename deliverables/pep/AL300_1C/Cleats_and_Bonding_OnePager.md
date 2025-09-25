# Cleats & Single‑Point Bonding — One Pager (3 × 1C 300 mm² Al, XLPE 6.35/11 kV)

## Purpose
Ensure mechanically safe restraint of 3 × 1C MV cables under fault forces and a compliant, low‑loss sheath earthing scheme for the 6.35/11 kV (Um 12 kV) system.

## Cleating (Trefoil Formation)
- Type: Non‑magnetic trefoil cleats (stainless/composite) rated for 11 kV single‑core and fault forces at the project’s prospective short‑circuit level (~13 kA at PCC; confirm clearing time).
- Spacing:
  - Straights: 0.6–1.0 m nominal (use 0.8 m for pricing unless noted).
  - Bends/risers: tighten to ~0.5 m and add extra restraints at direction changes.
  - Entries: first cleat ≤ 150 mm from JB/plate gland; second within ~300 mm.
- Installation:
  - Maintain trefoil lay‑up into gland entries; avoid twist/crossover.
  - Use C5M (coastal) resistant fixings; avoid ferromagnetic clips/straps.
- Evidence:
  - Cleat vendor datasheet (trefoil OD range, fault‑withstand, spacing chart).
  - Photos of first‑restraint positions, riser/bend cleat patterns.

## Sheath Bonding (Single‑Point)
- Method: Single‑point bonding per feeder, with sheath voltage limiter (SVL) at the open end via a link box (or SVL assembly).
- Hardware:
  - Link box/SVL set rated for 6.35/11 kV sheath voltage rise; bonding leads, lugs, labels.
  - Earth bar connection to TiN’s grid; measure and record bond continuity.
- Benefits: Minimizes circulating sheath currents and losses for moderate lengths.
- Tests: Screen/armor continuity; SVL installation checks; insulation checks per OEM; record earth resistance.

## BOM Lines To Update (AL Option)
Files: `deliverables/pep/electrical_bom_AL300.csv`, `deliverables/pep/electrical_bom_priced_AL300.csv`

- MV XLPE Cable:
  - “IEC 60502‑2; 3 × 1C 300 mm² Al; trefoil formation; single‑point bonding.”
- Double‑Compression Cable Glands (single‑core):
  - “Non‑magnetic; thread per per‑core OD (provisional M75–M90); 3 per termination point.”
- MV Termination Kits (single‑core, 12 kV):
  - “Heat‑shrink preferred; outdoor with extended creepage for coastal pollution.”
- Cable Cleats (trefoil):
  - “Non‑magnetic; spacing 0.8 m nominal (0.5 m bends/risers); first cleat ≤ 150 mm from gland; C5M fixings.”
  - Quantity: route length ÷ spacing × 3 cores, plus bends/risers extras.
- Sheath Bonding Components:
  - “Single‑point bonding kit incl. link box + SVL, bond tails, labels; 1 set per feeder open end.”
- Cable Lugs (Al/bimetal 300 mm²) & Cable Support Saddles:
  - Confirm quantities scaled for 3 cores per termination and first‑restraint near entries.

## Tender Document Sections Impacted
- Technical Spec (MV Cables & Accessories):
  - “3 × 1C 300 mm² Al, XLPE 6.35/11 kV (Um 12 kV), trefoil formation along route; single‑point bonding with SVL/link box; non‑magnetic single‑core glands; outdoor terminations with extended creepage for coastal pollution.”
- BoQ / Priced Schedule:
  - MV cable quantity basis: 3 × route length (unless TiN confirms otherwise).
  - Add/clarify line items: trefoil cleats with spacing; single‑point bonding kit per feeder open end; terminations/glands/lugs scaled for 3 cores per end.
- Drawings & GAs:
  - JB GA: three single‑core entries, edge distances/spacing, first‑cleat note.
  - Drum GA: multiple drums (one per core), dimension rules from per‑core OD (barrel ≥ 18×OD; flange ≥ barrel + 6×OD).
- ITP/ATP & Test Plans:
  - Add checks for cleat spacing, first‑restraint, bonding continuity, SVL checks.
  - VLF ≈ 2 × U0 ≈ 12.7 kV rms; IR at 5 kV for 6.35/11 kV class.
- Method Statements / HSE:
  - Handling three drums per route; cleating in risers; marine PPE; lifting/rigging for reels.
- Labels & Documentation:
  - KKS labels for MV; photos of glands/cleats; torque logs; bonding records; as‑built cleat schedule and bonding layout.

## Assumptions (Until Datasheet OD Arrives)
- Per‑core OD TBD → provisional glands M75–M90; bend radius per IEC (≥12–15 × OD).
- Cleat spacing for pricing: 0.8 m straights; 0.5 m at bends/risers.
- One bonding kit per feeder open end (adjust if TiN requires cross‑bonding).
