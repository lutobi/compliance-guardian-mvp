/*
 Generates a single DOCX: STS Connections Tender – Appendix 1 V3.1
 Parts:
  - Part A: Electrical (Technical + BoQ + Commercial)
  - Part B: Communications (Technical + BoQ + Commercial)
  - Scope coverage, Programme, RACI, Risks
*/

const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  TableOfContents,
  BorderStyle,
} = require("docx");

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text: String(text || ""), size: opts.size || 24 })],
    spacing: opts.spacing,
    heading: opts.heading,
    pageBreakBefore: opts.pageBreakBefore || false,
  });
}

function heading(text, level = 1, opts = {}) {
  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
  };
  return para(text, { heading: headingMap[level] || HeadingLevel.HEADING_1, ...opts });
}

function bulletList(items = []) {
  return items.map((t) =>
    new Paragraph({
      text: String(t),
      bullet: { level: 0 },
      spacing: { before: 60, after: 60 },
    })
  );
}

function paragraphs(items = []) {
  return items.map((t) =>
    para(String(t), {
      spacing: { after: 120 },
    })
  );
}

function monoBlock(lines = []) {
  const paras = [];
  lines.forEach((line, idx) => {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({ text: String(line), font: "Courier New", size: 22 }),
        ],
        spacing: { before: idx === 0 ? 120 : 0, after: 0 },
      })
    );
  });
  paras.push(new Paragraph({ spacing: { after: 120 } }));
  return paras;
}

function tableFromMatrix(matrix = [], opts = {}) {
  if (!Array.isArray(matrix) || matrix.length === 0) return new Paragraph("");
  const [header, ...rows] = matrix;
  const tableRows = [];

  // Header
  tableRows.push(
    new TableRow({
      children: header.map(
        (h) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(h), bold: true })],
              }),
            ],
          })
      ),
    })
  );

  // Body rows
  rows.forEach((row) => {
    tableRows.push(
      new TableRow({
        children: row.map((cell) =>
          new TableCell({ children: [new Paragraph(String(cell ?? ""))] })
        ),
      })
    );
  });

  // Optional total row if Amount column present
  if (opts.totalize) {
    const amountIdx = header.findIndex((h) => String(h).toLowerCase().includes("amount"));
    if (amountIdx >= 0) {
      let sum = 0;
      rows.forEach((row) => {
        const val = parseFloat(String(row[amountIdx]).replace(/[^0-9.-]/g, ""));
        if (!isNaN(val)) sum += val;
      });
      const totalRow = header.map((_, idx) => {
        if (idx === 0) return new TableCell({ children: [new Paragraph("TOTAL")] });
        if (idx === amountIdx) return new TableCell({ children: [new Paragraph(sum.toFixed(2))] });
        return new TableCell({ children: [new Paragraph("")] });
      });
      tableRows.push(new TableRow({ children: totalRow }));
    }
  }

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: opts.borders || {
      top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
    },
  });
}

function addSectionTitle(docChildren, title) {
  docChildren.push(heading(title, 1, { pageBreakBefore: true }));
}

function addSubsection(docChildren, title, contentParas = []) {
  docChildren.push(heading(title, 2));
  docChildren.push(...contentParas);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function main() {
  const rootDir = path.resolve(__dirname, "..");
  const contentPath = path.join(__dirname, "sts_tender_content.json");
  const outDir = path.join(rootDir, "deliverables");
  ensureDir(outDir);
  const outFile = path.join(outDir, "STS_Tender_V3_1.docx");

  if (!fs.existsSync(contentPath)) {
    console.error(`Content spec not found: ${contentPath}`);
    process.exit(1);
  }

  const spec = JSON.parse(fs.readFileSync(contentPath, "utf-8"));

  const children = [];

  // Cover
  children.push(
    heading(spec.title || "STS Connections Tender", 1, { pageBreakBefore: true })
  );
  children.push(para(spec.client || "Client", { spacing: { after: 200 } }));
  children.push(
    para(`Version: ${spec.documentVersion || "V1.0"}`, {
      spacing: { after: 200 },
    })
  );
  children.push(
    para(`Date: ${new Date().toISOString().slice(0, 10)}`, {
      spacing: { after: 400 },
    })
  );

  if (Array.isArray(spec.notes) && spec.notes.length) {
    children.push(heading("Notes", 3));
    children.push(...bulletList(spec.notes));
  }

  // TOC
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-4",
    })
  );

  // Compliance statement
  children.push(heading("Compliance Statement", 1, { pageBreakBefore: true }));
  children.push(
    para(
      "This offer is prepared in accordance with Appendix 1 - RFP connection of STSs V3.1. Where requirements are clarified or assumed, these are explicitly noted, and final alignment will be completed upon receipt of any addenda.",
      { spacing: { after: 200 } }
    )
  );

  // Scope Coverage Matrix
  addSectionTitle(children, "Scope Coverage (Crosswalk to Appendix 1 V3.1)");
  if (spec.scopeCoverage) {
    Object.entries(spec.scopeCoverage).forEach(([cat, items]) => {
      addSubsection(children, cat, bulletList(items));
    });
  }

  // Part A – Electrical Offer
  addSectionTitle(children, "Part A – Electrical Offer (Technical)");
  const A = spec.partA_electrical || {};
  const Atech = A.technical || {};

  if (Array.isArray(Atech.designBasis)) {
    addSubsection(children, "Design Basis & Standards", bulletList(Atech.designBasis));
  }
  if (Array.isArray(Atech.architectureDiagram)) {
    addSubsection(children, "System Architecture (SLD overview)", monoBlock(Atech.architectureDiagram));
  }
  if (Array.isArray(Atech.junctionBoxDesign)) {
    addSubsection(children, "CTP6/CTP5 Junction Box & Drum Design", bulletList(Atech.junctionBoxDesign));
  }
  if (Array.isArray(Atech.methodStatementNarrative)) {
    addSubsection(children, "Method Statement", paragraphs(Atech.methodStatementNarrative));
  } else if (Array.isArray(Atech.methodStatement)) {
    addSubsection(children, "Method Statement", bulletList(Atech.methodStatement));
  }
  if (Array.isArray(Atech.testingNarrative)) {
    addSubsection(children, "Testing & Commissioning", paragraphs(Atech.testingNarrative));
  } else if (Array.isArray(Atech.testing)) {
    addSubsection(children, "Testing & Commissioning", bulletList(Atech.testing));
  }
  if (Array.isArray(Atech.acceptance)) {
    addSubsection(children, "Acceptance Criteria", bulletList(Atech.acceptance));
  }

  // Part A – Extended Narratives
  if (Array.isArray(A.executiveSummary)) {
    addSubsection(children, "Executive Summary", paragraphs(A.executiveSummary));
  }
  if (Array.isArray(A.engineeringDesignApproach)) {
    addSubsection(children, "Engineering Design Approach", paragraphs(A.engineeringDesignApproach));
  }
  if (Array.isArray(A.procurementPlan)) {
    addSubsection(children, "Procurement Plan", paragraphs(A.procurementPlan));
  }
  if (Array.isArray(A.installationApproach)) {
    addSubsection(children, "Installation Approach", paragraphs(A.installationApproach));
  }
  if (Array.isArray(A.valueEngineering)) {
    addSubsection(children, "Value Engineering", paragraphs(A.valueEngineering));
  }
  if (Array.isArray(A.sustainability)) {
    addSubsection(children, "Sustainability", paragraphs(A.sustainability));
  }
  if (Array.isArray(A.interfaceManagement)) {
    addSubsection(children, "Interface Management", paragraphs(A.interfaceManagement));
  }
  if (Array.isArray(A.assetRegistration)) {
    addSubsection(children, "Asset Registration", paragraphs(A.assetRegistration));
  }
  if (Array.isArray(A.detailedScope)) {
    addSubsection(children, "Detailed Scope", bulletList(A.detailedScope));
  }
  if (Array.isArray(A.projectDeliverables)) {
    addSubsection(children, "Project Deliverables", bulletList(A.projectDeliverables));
  }
  if (Array.isArray(A.stepByStepPlan)) {
    addSubsection(children, "Step-by-Step Plan", bulletList(A.stepByStepPlan));
  }
  if (Array.isArray(A.qualityPlanITP)) {
    addSubsection(children, "Quality Plan & ITP", [tableFromMatrix(A.qualityPlanITP)]);
  }
  if (Array.isArray(A.hseRAMS)) {
    addSubsection(children, "HSE RAMS", bulletList(A.hseRAMS));
  }
  if (Array.isArray(A.detailedBoq)) {
    children.push(heading("Part A – Electrical Detailed BoQ", 2));
    children.push(tableFromMatrix(A.detailedBoq, { totalize: true }));
  }

  // Electrical BoQ
  if (Array.isArray(A.boq)) {
    children.push(heading("Part A – Electrical Bill of Quantities (BoQ)", 2));
    children.push(tableFromMatrix(A.boq, { totalize: true }));
  }

  // Electrical Commercial
  children.push(heading("Part A – Electrical Commercial Offer", 2));
  if (A.commercial) {
    if (Array.isArray(A.commercial.payment)) {
      children.push(heading("Payment Schedule", 3));
      children.push(tableFromMatrix([["Milestone"], ...A.commercial.payment.map((p) => [p])]));
    }
    if (A.commercial.warranty) {
      children.push(heading("Warranty", 3));
      children.push(para(String(A.commercial.warranty)));
    }
    if (Array.isArray(A.commercial.exclusions)) {
      children.push(heading("Exclusions", 3));
      children.push(...bulletList(A.commercial.exclusions));
    }
    if (Array.isArray(A.commercial.employerSupplied)) {
      children.push(heading("Employer-Supplied Items", 3));
      children.push(...bulletList(A.commercial.employerSupplied));
    }
  }

  // Part B – Communications Offer
  addSectionTitle(children, "Part B – Communications Offer (Technical)");
  const B = spec.partB_communications || {};
  const Btech = B.technical || {};

  if (Array.isArray(Btech.designBasis)) {
    addSubsection(children, "Design Basis & Standards", bulletList(Btech.designBasis));
  }
  if (Array.isArray(Btech.foDiagram)) {
    addSubsection(children, "Fibre Optic Star Topology", monoBlock(Btech.foDiagram));
  }
  if (Array.isArray(Btech.splicePlan)) {
    addSubsection(children, "CTP6 Splice Plan (Tray Allocation)", bulletList(Btech.splicePlan));
  }
  if (Array.isArray(Btech.rackElevation)) {
    addSubsection(children, "Cargo Building Rack Elevation (OT Edge)", bulletList(Btech.rackElevation));
  }
  if (Array.isArray(Btech.opticalBudget)) {
    addSubsection(children, "Optical Budget & Acceptance Thresholds", bulletList(Btech.opticalBudget));
  }
  if (Array.isArray(Btech.methodStatementNarrative)) {
    addSubsection(children, "Method Statement", paragraphs(Btech.methodStatementNarrative));
  } else if (Array.isArray(Btech.methodStatement)) {
    addSubsection(children, "Method Statement", bulletList(Btech.methodStatement));
  }
  if (Array.isArray(Btech.testingNarrative)) {
    addSubsection(children, "Testing & Commissioning", paragraphs(Btech.testingNarrative));
  }
  if (Array.isArray(Btech.acceptance)) {
    addSubsection(children, "Acceptance Criteria", bulletList(Btech.acceptance));
  }

  // Communications – FO Close-Up and ATP Micro-Checklists
  if (Array.isArray(Btech.foCloseUpChecklist)) {
    addSubsection(children, "FO Close-Up Checklist (Closure/Panel)", bulletList(Btech.foCloseUpChecklist));
  }
  if (Array.isArray(B.atpMicroChecklistsFO)) {
    addSubsection(children, "ATP Micro-Checklists (FO) — ITR Mapping", bulletList(B.atpMicroChecklistsFO));
  }
  if (Array.isArray(B.closureHandoverStepsFO)) {
    addSubsection(children, "CTP6/CTP5 Closure & Handover Steps — FO", bulletList(B.closureHandoverStepsFO));
  }

  // Part B – Extended Narratives
  if (Array.isArray(B.executiveSummary)) {
    addSubsection(children, "Executive Summary", paragraphs(B.executiveSummary));
  }
  if (Array.isArray(B.engineeringDesignApproach)) {
    addSubsection(children, "Engineering Design Approach", paragraphs(B.engineeringDesignApproach));
  }
  if (Array.isArray(B.procurementPlan)) {
    addSubsection(children, "Procurement Plan", paragraphs(B.procurementPlan));
  }
  if (Array.isArray(B.installationApproach)) {
    addSubsection(children, "Installation Approach", paragraphs(B.installationApproach));
  }
  if (Array.isArray(B.valueEngineering)) {
    addSubsection(children, "Value Engineering", paragraphs(B.valueEngineering));
  }
  if (Array.isArray(B.sustainability)) {
    addSubsection(children, "Sustainability", paragraphs(B.sustainability));
  }
  if (Array.isArray(B.interfaceManagement)) {
    addSubsection(children, "Interface Management", paragraphs(B.interfaceManagement));
  }
  if (Array.isArray(B.assetRegistration)) {
    addSubsection(children, "Asset Registration", paragraphs(B.assetRegistration));
  }
  if (Array.isArray(B.detailedScope)) {
    addSubsection(children, "Detailed Scope", bulletList(B.detailedScope));
  }
  if (Array.isArray(B.projectDeliverables)) {
    addSubsection(children, "Project Deliverables", bulletList(B.projectDeliverables));
  }
  if (Array.isArray(B.stepByStepPlan)) {
    addSubsection(children, "Step-by-Step Plan", bulletList(B.stepByStepPlan));
  }
  if (Array.isArray(B.qualityPlanITP)) {
    addSubsection(children, "Quality Plan & ITP", [tableFromMatrix(B.qualityPlanITP)]);
  }
  if (Array.isArray(B.hseRAMS)) {
    addSubsection(children, "HSE RAMS", bulletList(B.hseRAMS));
  }
  if (Array.isArray(B.detailedBoq)) {
    children.push(heading("Part B – Communications Detailed BoQ", 2));
    children.push(tableFromMatrix(B.detailedBoq, { totalize: true }));
  }

  // Communications BoQ
  if (Array.isArray(B.boq)) {
    children.push(heading("Part B – Communications Bill of Quantities (BoQ)", 2));
    children.push(tableFromMatrix(B.boq, { totalize: true }));
  }

  // Communications Commercial
  children.push(heading("Part B – Communications Commercial Offer", 2));
  if (B.commercial) {
    if (Array.isArray(B.commercial.payment)) {
      children.push(heading("Payment Schedule", 3));
      children.push(tableFromMatrix([["Milestone"], ...B.commercial.payment.map((p) => [p])]));
    }
    if (B.commercial.warranty) {
      children.push(heading("Warranty", 3));
      children.push(para(String(B.commercial.warranty)));
    }
    if (Array.isArray(B.commercial.exclusions)) {
      children.push(heading("Exclusions", 3));
      children.push(...bulletList(B.commercial.exclusions));
    }
    if (Array.isArray(B.commercial.employerSupplied)) {
      children.push(heading("Employer-Supplied Items", 3));
      children.push(...bulletList(B.commercial.employerSupplied));
    }
  }

  // Additional Technical & Management Sections
  // Engineering Calculations & Acceptance Criteria
  if (spec.engineeringCalculations) {
    addSectionTitle(children, "Engineering Calculations & Acceptance Criteria");
    const ec = spec.engineeringCalculations;
    if (Array.isArray(ec.mvCableSizingVoltDrop)) {
      addSubsection(children, "MV Cable Sizing & Volt Drop (example criteria)", bulletList(ec.mvCableSizingVoltDrop));
    }
    if (Array.isArray(ec.earthingBonding)) {
      addSubsection(children, "Earthing & Bonding", bulletList(ec.earthingBonding));
    }
    if (Array.isArray(ec.fibreOpticalBudget)) {
      addSubsection(children, "Fibre Optical Budget (worked form)", bulletList(ec.fibreOpticalBudget));
    }
  }

  // Network & Cybersecurity Design
  if (spec.networkCybersecurity) {
    addSectionTitle(children, "Network & Cybersecurity Design");
    const net = spec.networkCybersecurity;
    if (Array.isArray(net.logicalTopology)) {
      addSubsection(children, "Logical Topology", bulletList(net.logicalTopology));
    }
    if (Array.isArray(net.aclExample)) {
      addSubsection(children, "ACL Example (illustrative)", monoBlock(net.aclExample));
    }
    if (Array.isArray(net.services)) {
      addSubsection(children, "Services", bulletList(net.services));
    }
  }

  // Hardware BOM and Software Tools
  if (Array.isArray(spec.hardwareBOM)) {
    addSectionTitle(children, "Hardware Bill of Materials (representative or equivalent)");
    children.push(...bulletList(spec.hardwareBOM));
  }
  if (Array.isArray(spec.softwareTools)) {
    addSectionTitle(children, "Software & Tooling");
    children.push(...bulletList(spec.softwareTools));
  }

  // WBS
  if (Array.isArray(spec.wbs)) {
    addSectionTitle(children, "Work Breakdown Structure (WBS)");
    children.push(...bulletList(spec.wbs));
  }

  // Acceptance Test Procedures (ATP)
  if (spec.atp) {
    addSectionTitle(children, "Acceptance Test Procedures (ATP) – Checklists");
    if (Array.isArray(spec.atp.mv)) {
      addSubsection(children, "MV", bulletList(spec.atp.mv));
    }
    if (Array.isArray(spec.atp.fo)) {
      addSubsection(children, "FO", bulletList(spec.atp.fo));
    }
    if (Array.isArray(spec.atp.documentation)) {
      addSubsection(children, "Documentation", bulletList(spec.atp.documentation));
    }
  }

  // Spares & O&M
  if (spec.sparesOandM) {
    addSectionTitle(children, "Spares & O&M");
    if (Array.isArray(spec.sparesOandM.mv)) {
      addSubsection(children, "MV", bulletList(spec.sparesOandM.mv));
    }
    if (Array.isArray(spec.sparesOandM.fo)) {
      addSubsection(children, "FO", bulletList(spec.sparesOandM.fo));
    }
    if (Array.isArray(spec.sparesOandM.oam)) {
      addSubsection(children, "O&M", bulletList(spec.sparesOandM.oam));
    }
  }

  // Training Plan
  if (Array.isArray(spec.trainingPlan)) {
    addSectionTitle(children, "Training Plan");
    children.push(...bulletList(spec.trainingPlan));
  }

  // Warranty & SLA
  if (Array.isArray(spec.warrantySLA)) {
    addSectionTitle(children, "Warranty & SLA");
    children.push(...bulletList(spec.warrantySLA));
  }

  // Risk Matrix (L x C)
  if (Array.isArray(spec.riskMatrix)) {
    addSectionTitle(children, "Risk Matrix (Likelihood × Consequence)");
    children.push(tableFromMatrix(spec.riskMatrix));
  }

  // Templates
  if (Array.isArray(spec.templates)) {
    addSectionTitle(children, "Templates");
    children.push(...bulletList(spec.templates));
  }

  // Project Management & Admin
  addSectionTitle(children, "Project Management & Administration");
  if (Array.isArray(spec.programme)) {
    children.push(heading("Programme (Gantt Milestones)", 2));
    children.push(tableFromMatrix(spec.programme));
  }
  if (Array.isArray(spec.raci)) {
    children.push(heading("RACI", 2));
    children.push(tableFromMatrix(spec.raci));
  }
  if (Array.isArray(spec.risks)) {
    children.push(heading("Risk Register (Initial)", 2));
    children.push(tableFromMatrix(spec.risks));
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outFile, buffer);
  console.log(`DOCX generated: ${outFile}`);

  // Generate separate DOCX for Part A – Electrical
  const outFileA = path.join(outDir, "STS_Tender_V3_1_Electrical.docx");
  const childrenA = [];
  childrenA.push(heading(`${spec.title || "STS Connections Tender"} – Part A – Electrical`, 1, { pageBreakBefore: true }));
  childrenA.push(para(spec.client || "Client", { spacing: { after: 200 } }));
  childrenA.push(para(`Version: ${spec.documentVersion || "V1.0"}`, { spacing: { after: 200 } }));
  childrenA.push(para(`Date: ${new Date().toISOString().slice(0, 10)}`, { spacing: { after: 400 } }));
  childrenA.push(new Paragraph({ pageBreakBefore: true }));
  childrenA.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-4" }));
  childrenA.push(heading("Compliance Statement", 1, { pageBreakBefore: true }));
  childrenA.push(para("This offer is prepared in accordance with Appendix 1 - RFP connection of STSs V3.1. Where requirements are clarified or assumed, these are explicitly noted, and final alignment will be completed upon receipt of any addenda.", { spacing: { after: 200 } }));
  addSectionTitle(childrenA, "Scope Coverage (Crosswalk to Appendix 1 V3.1)");
  if (spec.scopeCoverage) {
    Object.entries(spec.scopeCoverage).forEach(([cat, items]) => {
      addSubsection(childrenA, cat, bulletList(items));
    });
  }

  // Part A sections
  addSectionTitle(childrenA, "Part A – Electrical Offer (Technical)");
  if (Array.isArray(Atech.designBasis)) addSubsection(childrenA, "Design Basis & Standards", bulletList(Atech.designBasis));
  if (Array.isArray(Atech.architectureDiagram)) addSubsection(childrenA, "System Architecture (SLD overview)", monoBlock(Atech.architectureDiagram));
  if (Array.isArray(Atech.junctionBoxDesign)) addSubsection(childrenA, "CTP6/CTP5 Junction Box & Drum Design", bulletList(Atech.junctionBoxDesign));
  if (Array.isArray(Atech.methodStatementNarrative)) addSubsection(childrenA, "Method Statement", paragraphs(Atech.methodStatementNarrative));
  else if (Array.isArray(Atech.methodStatement)) addSubsection(childrenA, "Method Statement", bulletList(Atech.methodStatement));
  if (Array.isArray(Atech.testingNarrative)) addSubsection(childrenA, "Testing & Commissioning", paragraphs(Atech.testingNarrative));
  else if (Array.isArray(Atech.testing)) addSubsection(childrenA, "Testing & Commissioning", bulletList(Atech.testing));
  if (Array.isArray(Atech.acceptance)) addSubsection(childrenA, "Acceptance Criteria", bulletList(Atech.acceptance));

  // Part A extended
  if (Array.isArray(A.executiveSummary)) addSubsection(childrenA, "Executive Summary", paragraphs(A.executiveSummary));
  if (Array.isArray(A.engineeringDesignApproach)) addSubsection(childrenA, "Engineering Design Approach", paragraphs(A.engineeringDesignApproach));
  if (Array.isArray(A.procurementPlan)) addSubsection(childrenA, "Procurement Plan", paragraphs(A.procurementPlan));
  if (Array.isArray(A.installationApproach)) addSubsection(childrenA, "Installation Approach", paragraphs(A.installationApproach));
  if (Array.isArray(A.valueEngineering)) addSubsection(childrenA, "Value Engineering", paragraphs(A.valueEngineering));
  if (Array.isArray(A.sustainability)) addSubsection(childrenA, "Sustainability", paragraphs(A.sustainability));
  if (Array.isArray(A.interfaceManagement)) addSubsection(childrenA, "Interface Management", paragraphs(A.interfaceManagement));
  if (Array.isArray(A.assetRegistration)) addSubsection(childrenA, "Asset Registration", paragraphs(A.assetRegistration));
  if (Array.isArray(A.detailedScope)) addSubsection(childrenA, "Detailed Scope", bulletList(A.detailedScope));
  if (Array.isArray(A.projectDeliverables)) addSubsection(childrenA, "Project Deliverables", bulletList(A.projectDeliverables));
  if (Array.isArray(A.stepByStepPlan)) addSubsection(childrenA, "Step-by-Step Plan", bulletList(A.stepByStepPlan));
  if (Array.isArray(A.qualityPlanITP)) addSubsection(childrenA, "Quality Plan & ITP", [tableFromMatrix(A.qualityPlanITP)]);
  if (Array.isArray(A.hseRAMS)) addSubsection(childrenA, "HSE RAMS", bulletList(A.hseRAMS));
  if (Array.isArray(A.detailedBoq)) { childrenA.push(heading("Part A – Electrical Detailed BoQ", 2)); childrenA.push(tableFromMatrix(A.detailedBoq, { totalize: true })); }
  if (Array.isArray(A.boq)) { childrenA.push(heading("Part A – Electrical Bill of Quantities (BoQ)", 2)); childrenA.push(tableFromMatrix(A.boq, { totalize: true })); }
  childrenA.push(heading("Part A – Electrical Commercial Offer", 2));
  if (A.commercial) {
    if (Array.isArray(A.commercial.payment)) { childrenA.push(heading("Payment Schedule", 3)); childrenA.push(tableFromMatrix([["Milestone"], ...A.commercial.payment.map((p) => [p])])); }
    if (A.commercial.warranty) { childrenA.push(heading("Warranty", 3)); childrenA.push(para(String(A.commercial.warranty))); }
    if (Array.isArray(A.commercial.exclusions)) { childrenA.push(heading("Exclusions", 3)); childrenA.push(...bulletList(A.commercial.exclusions)); }
    if (Array.isArray(A.commercial.employerSupplied)) { childrenA.push(heading("Employer-Supplied Items", 3)); childrenA.push(...bulletList(A.commercial.employerSupplied)); }
  }

  // Additional Technical & Management Sections (generic)
  if (spec.engineeringCalculations) {
    addSectionTitle(childrenA, "Engineering Calculations & Acceptance Criteria");
    const ecA = spec.engineeringCalculations;
    if (Array.isArray(ecA.mvCableSizingVoltDrop)) addSubsection(childrenA, "MV Cable Sizing & Volt Drop (example criteria)", bulletList(ecA.mvCableSizingVoltDrop));
    if (Array.isArray(ecA.earthingBonding)) addSubsection(childrenA, "Earthing & Bonding", bulletList(ecA.earthingBonding));
    if (Array.isArray(ecA.fibreOpticalBudget)) addSubsection(childrenA, "Fibre Optical Budget (worked form)", bulletList(ecA.fibreOpticalBudget));
  }
  if (spec.networkCybersecurity) {
    addSectionTitle(childrenA, "Network & Cybersecurity Design");
    const netA = spec.networkCybersecurity;
    if (Array.isArray(netA.logicalTopology)) addSubsection(childrenA, "Logical Topology", bulletList(netA.logicalTopology));
    if (Array.isArray(netA.aclExample)) addSubsection(childrenA, "ACL Example (illustrative)", monoBlock(netA.aclExample));
    if (Array.isArray(netA.services)) addSubsection(childrenA, "Services", bulletList(netA.services));
  }
  if (Array.isArray(spec.hardwareBOM)) { addSectionTitle(childrenA, "Hardware Bill of Materials (representative or equivalent)"); childrenA.push(...bulletList(spec.hardwareBOM)); }
  if (Array.isArray(spec.softwareTools)) { addSectionTitle(childrenA, "Software & Tooling"); childrenA.push(...bulletList(spec.softwareTools)); }
  if (Array.isArray(spec.wbs)) { addSectionTitle(childrenA, "Work Breakdown Structure (WBS)"); childrenA.push(...bulletList(spec.wbs)); }
  if (spec.atp) {
    addSectionTitle(childrenA, "Acceptance Test Procedures (ATP) – Checklists");
    if (Array.isArray(spec.atp.mv)) addSubsection(childrenA, "MV", bulletList(spec.atp.mv));
    if (Array.isArray(spec.atp.fo)) addSubsection(childrenA, "FO", bulletList(spec.atp.fo));
    if (Array.isArray(spec.atp.documentation)) addSubsection(childrenA, "Documentation", bulletList(spec.atp.documentation));
  }
  if (spec.sparesOandM) {
    addSectionTitle(childrenA, "Spares & O&M");
    if (Array.isArray(spec.sparesOandM.mv)) addSubsection(childrenA, "MV", bulletList(spec.sparesOandM.mv));
    if (Array.isArray(spec.sparesOandM.fo)) addSubsection(childrenA, "FO", bulletList(spec.sparesOandM.fo));
    if (Array.isArray(spec.sparesOandM.oam)) addSubsection(childrenA, "O&M", bulletList(spec.sparesOandM.oam));
  }
  if (Array.isArray(spec.trainingPlan)) { addSectionTitle(childrenA, "Training Plan"); childrenA.push(...bulletList(spec.trainingPlan)); }
  if (Array.isArray(spec.warrantySLA)) { addSectionTitle(childrenA, "Warranty & SLA"); childrenA.push(...bulletList(spec.warrantySLA)); }
  if (Array.isArray(spec.riskMatrix)) { addSectionTitle(childrenA, "Risk Matrix (Likelihood × Consequence)"); childrenA.push(tableFromMatrix(spec.riskMatrix)); }
  if (Array.isArray(spec.templates)) { addSectionTitle(childrenA, "Templates"); childrenA.push(...bulletList(spec.templates)); }
  addSectionTitle(childrenA, "Project Management & Administration");
  if (Array.isArray(spec.programme)) { childrenA.push(heading("Programme (Gantt Milestones)", 2)); childrenA.push(tableFromMatrix(spec.programme)); }
  if (Array.isArray(spec.raci)) { childrenA.push(heading("RACI", 2)); childrenA.push(tableFromMatrix(spec.raci)); }
  if (Array.isArray(spec.risks)) { childrenA.push(heading("Risk Register (Initial)", 2)); childrenA.push(tableFromMatrix(spec.risks)); }

  const docA = new Document({ sections: [{ properties: {}, children: childrenA }] });
  const bufferA = await Packer.toBuffer(docA);
  fs.writeFileSync(outFileA, bufferA);
  console.log(`DOCX generated: ${outFileA}`);

  // Generate separate DOCX for Part B – Communications
  const outFileB = path.join(outDir, "STS_Tender_V3_1_Communications.docx");
  const childrenBOnly = [];
  childrenBOnly.push(heading(`${spec.title || "STS Connections Tender"} – Part B – Communications`, 1, { pageBreakBefore: true }));
  childrenBOnly.push(para(spec.client || "Client", { spacing: { after: 200 } }));
  childrenBOnly.push(para(`Version: ${spec.documentVersion || "V1.0"}`, { spacing: { after: 200 } }));
  childrenBOnly.push(para(`Date: ${new Date().toISOString().slice(0, 10)}`, { spacing: { after: 400 } }));
  childrenBOnly.push(new Paragraph({ pageBreakBefore: true }));
  childrenBOnly.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-4" }));
  childrenBOnly.push(heading("Compliance Statement", 1, { pageBreakBefore: true }));
  childrenBOnly.push(para("This offer is prepared in accordance with Appendix 1 - RFP connection of STSs V3.1. Where requirements are clarified or assumed, these are explicitly noted, and final alignment will be completed upon receipt of any addenda.", { spacing: { after: 200 } }));
  addSectionTitle(childrenBOnly, "Scope Coverage (Crosswalk to Appendix 1 V3.1)");
  if (spec.scopeCoverage) {
    Object.entries(spec.scopeCoverage).forEach(([cat, items]) => {
      addSubsection(childrenBOnly, cat, bulletList(items));
    });
  }

  // Part B sections
  addSectionTitle(childrenBOnly, "Part B – Communications Offer (Technical)");
  if (Array.isArray(Btech.designBasis)) addSubsection(childrenBOnly, "Design Basis & Standards", bulletList(Btech.designBasis));
  if (Array.isArray(Btech.foDiagram)) addSubsection(childrenBOnly, "Fibre Optic Star Topology", monoBlock(Btech.foDiagram));
  if (Array.isArray(Btech.splicePlan)) addSubsection(childrenBOnly, "CTP6 Splice Plan (Tray Allocation)", bulletList(Btech.splicePlan));
  if (Array.isArray(Btech.rackElevation)) addSubsection(childrenBOnly, "Cargo Building Rack Elevation (OT Edge)", bulletList(Btech.rackElevation));
  if (Array.isArray(Btech.opticalBudget)) addSubsection(childrenBOnly, "Optical Budget & Acceptance Thresholds", bulletList(Btech.opticalBudget));
  if (Array.isArray(Btech.methodStatementNarrative)) addSubsection(childrenBOnly, "Method Statement", paragraphs(Btech.methodStatementNarrative));
  else if (Array.isArray(Btech.methodStatement)) addSubsection(childrenBOnly, "Method Statement", bulletList(Btech.methodStatement));
  if (Array.isArray(Btech.testingNarrative)) addSubsection(childrenBOnly, "Testing & Commissioning", paragraphs(Btech.testingNarrative));
  if (Array.isArray(Btech.acceptance)) addSubsection(childrenBOnly, "Acceptance Criteria", bulletList(Btech.acceptance));

  // Communications – FO Close-Up and ATP Micro-Checklists (Comms-only doc)
  if (Array.isArray(Btech.foCloseUpChecklist)) addSubsection(childrenBOnly, "FO Close-Up Checklist (Closure/Panel)", bulletList(Btech.foCloseUpChecklist));
  if (Array.isArray(B.atpMicroChecklistsFO)) addSubsection(childrenBOnly, "ATP Micro-Checklists (FO) — ITR Mapping", bulletList(B.atpMicroChecklistsFO));
  if (Array.isArray(B.closureHandoverStepsFO)) addSubsection(childrenBOnly, "CTP6/CTP5 Closure & Handover Steps — FO", bulletList(B.closureHandoverStepsFO));

  // Part B extended
  if (Array.isArray(B.executiveSummary)) addSubsection(childrenBOnly, "Executive Summary", paragraphs(B.executiveSummary));
  if (Array.isArray(B.engineeringDesignApproach)) addSubsection(childrenBOnly, "Engineering Design Approach", paragraphs(B.engineeringDesignApproach));
  if (Array.isArray(B.procurementPlan)) addSubsection(childrenBOnly, "Procurement Plan", paragraphs(B.procurementPlan));
  if (Array.isArray(B.installationApproach)) addSubsection(childrenBOnly, "Installation Approach", paragraphs(B.installationApproach));
  if (Array.isArray(B.valueEngineering)) addSubsection(childrenBOnly, "Value Engineering", paragraphs(B.valueEngineering));
  if (Array.isArray(B.sustainability)) addSubsection(childrenBOnly, "Sustainability", paragraphs(B.sustainability));
  if (Array.isArray(B.interfaceManagement)) addSubsection(childrenBOnly, "Interface Management", paragraphs(B.interfaceManagement));
  if (Array.isArray(B.assetRegistration)) addSubsection(childrenBOnly, "Asset Registration", paragraphs(B.assetRegistration));
  if (Array.isArray(B.detailedScope)) addSubsection(childrenBOnly, "Detailed Scope", bulletList(B.detailedScope));
  if (Array.isArray(B.projectDeliverables)) addSubsection(childrenBOnly, "Project Deliverables", bulletList(B.projectDeliverables));
  if (Array.isArray(B.stepByStepPlan)) addSubsection(childrenBOnly, "Step-by-Step Plan", bulletList(B.stepByStepPlan));
  if (Array.isArray(B.qualityPlanITP)) addSubsection(childrenBOnly, "Quality Plan & ITP", [tableFromMatrix(B.qualityPlanITP)]);
  if (Array.isArray(B.hseRAMS)) addSubsection(childrenBOnly, "HSE RAMS", bulletList(B.hseRAMS));
  if (Array.isArray(B.detailedBoq)) { childrenBOnly.push(heading("Part B – Communications Detailed BoQ", 2)); childrenBOnly.push(tableFromMatrix(B.detailedBoq, { totalize: true })); }
  if (Array.isArray(B.boq)) { childrenBOnly.push(heading("Part B – Communications Bill of Quantities (BoQ)", 2)); childrenBOnly.push(tableFromMatrix(B.boq, { totalize: true })); }
  childrenBOnly.push(heading("Part B – Communications Commercial Offer", 2));
  if (B.commercial) {
    if (Array.isArray(B.commercial.payment)) { childrenBOnly.push(heading("Payment Schedule", 3)); childrenBOnly.push(tableFromMatrix([["Milestone"], ...B.commercial.payment.map((p) => [p])])); }
    if (B.commercial.warranty) { childrenBOnly.push(heading("Warranty", 3)); childrenBOnly.push(para(String(B.commercial.warranty))); }
    if (Array.isArray(B.commercial.exclusions)) { childrenBOnly.push(heading("Exclusions", 3)); childrenBOnly.push(...bulletList(B.commercial.exclusions)); }
    if (Array.isArray(B.commercial.employerSupplied)) { childrenBOnly.push(heading("Employer-Supplied Items", 3)); childrenBOnly.push(...bulletList(B.commercial.employerSupplied)); }
  }

  // Additional Technical & Management Sections (generic)
  if (spec.engineeringCalculations) {
    addSectionTitle(childrenBOnly, "Engineering Calculations & Acceptance Criteria");
    const ecB = spec.engineeringCalculations;
    if (Array.isArray(ecB.mvCableSizingVoltDrop)) addSubsection(childrenBOnly, "MV Cable Sizing & Volt Drop (example criteria)", bulletList(ecB.mvCableSizingVoltDrop));
    if (Array.isArray(ecB.earthingBonding)) addSubsection(childrenBOnly, "Earthing & Bonding", bulletList(ecB.earthingBonding));
    if (Array.isArray(ecB.fibreOpticalBudget)) addSubsection(childrenBOnly, "Fibre Optical Budget (worked form)", bulletList(ecB.fibreOpticalBudget));
  }
  if (spec.networkCybersecurity) {
    addSectionTitle(childrenBOnly, "Network & Cybersecurity Design");
    const netB = spec.networkCybersecurity;
    if (Array.isArray(netB.logicalTopology)) addSubsection(childrenBOnly, "Logical Topology", bulletList(netB.logicalTopology));
    if (Array.isArray(netB.aclExample)) addSubsection(childrenBOnly, "ACL Example (illustrative)", monoBlock(netB.aclExample));
    if (Array.isArray(netB.services)) addSubsection(childrenBOnly, "Services", bulletList(netB.services));
  }
  if (Array.isArray(spec.hardwareBOM)) { addSectionTitle(childrenBOnly, "Hardware Bill of Materials (representative or equivalent)"); childrenBOnly.push(...bulletList(spec.hardwareBOM)); }
  if (Array.isArray(spec.softwareTools)) { addSectionTitle(childrenBOnly, "Software & Tooling"); childrenBOnly.push(...bulletList(spec.softwareTools)); }
  if (Array.isArray(spec.wbs)) { addSectionTitle(childrenBOnly, "Work Breakdown Structure (WBS)"); childrenBOnly.push(...bulletList(spec.wbs)); }
  if (spec.atp) {
    addSectionTitle(childrenBOnly, "Acceptance Test Procedures (ATP) – Checklists");
    if (Array.isArray(spec.atp.mv)) addSubsection(childrenBOnly, "MV", bulletList(spec.atp.mv));
    if (Array.isArray(spec.atp.fo)) addSubsection(childrenBOnly, "FO", bulletList(spec.atp.fo));
    if (Array.isArray(spec.atp.documentation)) addSubsection(childrenBOnly, "Documentation", bulletList(spec.atp.documentation));
  }
  if (spec.sparesOandM) {
    addSectionTitle(childrenBOnly, "Spares & O&M");
    if (Array.isArray(spec.sparesOandM.mv)) addSubsection(childrenBOnly, "MV", bulletList(spec.sparesOandM.mv));
    if (Array.isArray(spec.sparesOandM.fo)) addSubsection(childrenBOnly, "FO", bulletList(spec.sparesOandM.fo));
    if (Array.isArray(spec.sparesOandM.oam)) addSubsection(childrenBOnly, "O&M", bulletList(spec.sparesOandM.oam));
  }
  if (Array.isArray(spec.trainingPlan)) { addSectionTitle(childrenBOnly, "Training Plan"); childrenBOnly.push(...bulletList(spec.trainingPlan)); }
  if (Array.isArray(spec.warrantySLA)) { addSectionTitle(childrenBOnly, "Warranty & SLA"); childrenBOnly.push(...bulletList(spec.warrantySLA)); }
  if (Array.isArray(spec.riskMatrix)) { addSectionTitle(childrenBOnly, "Risk Matrix (Likelihood × Consequence)"); childrenBOnly.push(tableFromMatrix(spec.riskMatrix)); }
  if (Array.isArray(spec.templates)) { addSectionTitle(childrenBOnly, "Templates"); childrenBOnly.push(...bulletList(spec.templates)); }
  addSectionTitle(childrenBOnly, "Project Management & Administration");
  if (Array.isArray(spec.programme)) { childrenBOnly.push(heading("Programme (Gantt Milestones)", 2)); childrenBOnly.push(tableFromMatrix(spec.programme)); }
  if (Array.isArray(spec.raci)) { childrenBOnly.push(heading("RACI", 2)); childrenBOnly.push(tableFromMatrix(spec.raci)); }
  if (Array.isArray(spec.risks)) { childrenBOnly.push(heading("Risk Register (Initial)", 2)); childrenBOnly.push(tableFromMatrix(spec.risks)); }

  const docBOnly = new Document({ sections: [{ properties: {}, children: childrenBOnly }] });
  const bufferB = await Packer.toBuffer(docBOnly);
  fs.writeFileSync(outFileB, bufferB);
  console.log(`DOCX generated: ${outFileB}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
