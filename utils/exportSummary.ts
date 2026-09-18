import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';

export interface SummarySlideData {
  title: string;
  subtitle?: string;
  bullets: string[];
  callout?: string;
  speakerNotes?: string;
  badge?: string;
}

export interface SummaryExportOptions {
  title: string;
  subtitle?: string;
  courseCode?: string;
  summary: string;
  solution?: string;
  firstPrinciplesSteps?: Array<{
    stepNumber: number;
    stepTitle: string;
    underlyingAxiomOrLaw?: string;
    mathematicalOrLogicalTransition?: string;
    conceptualWhy?: string;
    potentialExamTrap?: string;
  }>;
  citations?: Array<{
    documentTitle: string;
    relevantTopic?: string;
    citationQuote?: string;
    groundingNotes?: string;
  }>;
  keyTakeaways?: string[];
  examTraps?: string[];
  practiceProblems?: Array<{
    problem: string;
    hint?: string;
    fullSolution?: string;
  }>;
  slides?: SummarySlideData[];
  date?: string;
}

/**
 * Generate and download a PowerPoint presentation (.pptx)
 */
export async function exportSummaryAsPptx(options: SummaryExportOptions): Promise<string> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Study Sanctuary AI';
  pptx.company = 'University Academic Workspace';
  pptx.title = options.title;

  // Theme Palette: Warm Academic Luxury
  const COLOR_BG = 'FAF7F2';
  const COLOR_DARK = '2C1D11';
  const COLOR_COFFEE = '5A3E2D';
  const COLOR_ACCENT = '7B583E';
  const COLOR_GOLD = 'D4AF37';
  const COLOR_EMERALD = '065F46';
  const COLOR_CARD_BG = 'FFFFFF';

  // 1. TITLE SLIDE
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_BG };

  // Decorative header bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.4,
    fill: { color: COLOR_DARK }
  });

  // Course & Mode Tag
  slide1.addText(`${options.courseCode || 'ACADEMIC COURSE'} • EXECUTIVE STUDY SUMMARY & DERIVATION`, {
    x: 1.0,
    y: 1.8,
    w: 11.33,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: 'Georgia'
  });

  // Main Title
  slide1.addText(options.title || 'Course Synthesis & Master Solution', {
    x: 1.0,
    y: 2.3,
    w: 11.33,
    h: 1.8,
    fontSize: 28,
    bold: true,
    color: COLOR_DARK,
    fontFace: 'Georgia',
    valign: 'top'
  });

  // Subtitle / Executive Overview
  if (options.subtitle || options.summary) {
    slide1.addText(options.subtitle || (options.summary.slice(0, 200) + '...'), {
      x: 1.0,
      y: 4.2,
      w: 11.33,
      h: 1.2,
      fontSize: 14,
      color: COLOR_COFFEE,
      fontFace: 'Calibri',
      valign: 'top'
    });
  }

  // Footer metadata
  slide1.addText(`Grounded with Course Documents • Academic Integrity Certified • ${options.date || new Date().toLocaleDateString()}`, {
    x: 1.0,
    y: 6.5,
    w: 11.33,
    h: 0.4,
    fontSize: 10,
    italic: true,
    color: '8C7A6B',
    fontFace: 'Calibri'
  });

  // 2. EXECUTIVE SUMMARY & INVARIANTS SLIDE
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLOR_BG };
  slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.3, fill: { color: COLOR_ACCENT } });

  slide2.addText('Executive Summary & Foundational Invariants', {
    x: 0.8,
    y: 0.6,
    w: 11.7,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: COLOR_DARK,
    fontFace: 'Georgia'
  });

  // Summary box
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.4,
    w: 7.2,
    h: 5.2,
    rectRadius: 0.15,
    fill: { color: COLOR_CARD_BG },
    line: { color: 'D8C7B5', width: 1 }
  });

  slide2.addText('Core Academic Synopsis', {
    x: 1.1,
    y: 1.6,
    w: 6.6,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLOR_DARK,
    fontFace: 'Georgia'
  });

  slide2.addText(options.summary || 'Exhaustive academic resolution grounded in university course notes.', {
    x: 1.1,
    y: 2.1,
    w: 6.6,
    h: 4.2,
    fontSize: 12,
    color: COLOR_COFFEE,
    fontFace: 'Calibri',
    valign: 'top'
  });

  // Right Side: Key Takeaways Card
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 8.3,
    y: 1.4,
    w: 4.2,
    h: 5.2,
    rectRadius: 0.15,
    fill: { color: 'F4EFE6' },
    line: { color: 'D8C7B5', width: 1 }
  });

  slide2.addText('Key Takeaways & Axioms', {
    x: 8.6,
    y: 1.6,
    w: 3.6,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLOR_DARK,
    fontFace: 'Georgia'
  });

  const takeawaysBullets = (options.keyTakeaways && options.keyTakeaways.length > 0)
    ? options.keyTakeaways
    : [
        'Fundamental invariant conservation under boundary constraints.',
        'Monotonic operator transformation preserves state equilibrium.',
        'Asymptotic limit checks guarantee convergence and prevent exam traps.'
      ];

  slide2.addText(
    takeawaysBullets.map(t => `• ${t}`).join('\n\n'),
    {
      x: 8.6,
      y: 2.2,
      w: 3.6,
      h: 4.1,
      fontSize: 11,
      color: COLOR_COFFEE,
      fontFace: 'Calibri',
      valign: 'top'
    }
  );

  // 3. FIRST-PRINCIPLES DERIVATION SLIDE
  if (options.firstPrinciplesSteps && options.firstPrinciplesSteps.length > 0) {
    const slide3 = pptx.addSlide();
    slide3.background = { color: COLOR_BG };
    slide3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.3, fill: { color: COLOR_EMERALD } });

    slide3.addText('First-Principles Step-by-Step Derivation', {
      x: 0.8,
      y: 0.6,
      w: 11.7,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_DARK,
      fontFace: 'Georgia'
    });

    const stepWidth = 3.6;
    const gap = 0.4;
    const startX = 0.8;

    options.firstPrinciplesSteps.slice(0, 3).forEach((step, idx) => {
      const currentX = startX + idx * (stepWidth + gap);

      slide3.addShape(pptx.ShapeType.roundRect, {
        x: currentX,
        y: 1.4,
        w: stepWidth,
        h: 5.2,
        rectRadius: 0.15,
        fill: { color: COLOR_CARD_BG },
        line: { color: 'CBD5E1', width: 1 }
      });

      slide3.addText(`STEP ${step.stepNumber || idx + 1}`, {
        x: currentX + 0.2,
        y: 1.6,
        w: stepWidth - 0.4,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: COLOR_EMERALD,
        fontFace: 'Calibri'
      });

      slide3.addText(step.stepTitle || `Derivation Phase ${idx + 1}`, {
        x: currentX + 0.2,
        y: 1.9,
        w: stepWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        bold: true,
        color: COLOR_DARK,
        fontFace: 'Georgia',
        valign: 'top'
      });

      if (step.mathematicalOrLogicalTransition) {
        slide3.addShape(pptx.ShapeType.rect, {
          x: currentX + 0.2,
          y: 2.6,
          w: stepWidth - 0.4,
          h: 0.9,
          fill: { color: 'F8FAFC' },
          line: { color: 'E2E8F0', width: 0.5 }
        });

        slide3.addText(step.mathematicalOrLogicalTransition, {
          x: currentX + 0.3,
          y: 2.7,
          w: stepWidth - 0.6,
          h: 0.7,
          fontSize: 10,
          fontFace: 'Courier New',
          color: COLOR_DARK
        });
      }

      slide3.addText(`Why It Works:\n${step.conceptualWhy || 'Derived from governing curriculum axioms.'}`, {
        x: currentX + 0.2,
        y: 3.6,
        w: stepWidth - 0.4,
        h: 1.7,
        fontSize: 10,
        color: COLOR_COFFEE,
        fontFace: 'Calibri',
        valign: 'top'
      });

      if (step.potentialExamTrap) {
        slide3.addText(`⚠️ Exam Trap: ${step.potentialExamTrap}`, {
          x: currentX + 0.2,
          y: 5.4,
          w: stepWidth - 0.4,
          h: 1.0,
          fontSize: 9,
          bold: true,
          color: '9A3412',
          fontFace: 'Calibri',
          valign: 'top'
        });
      }
    });
  }

  // 4. COURSE DOCUMENT GROUNDING & CITATIONS SLIDE
  if (options.citations && options.citations.length > 0) {
    const slide4 = pptx.addSlide();
    slide4.background = { color: COLOR_BG };
    slide4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.3, fill: { color: '4338CA' } });

    slide4.addText('Course Grounding & Syllabus Citations', {
      x: 0.8,
      y: 0.6,
      w: 11.7,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_DARK,
      fontFace: 'Georgia'
    });

    options.citations.slice(0, 3).forEach((cite, idx) => {
      const cardY = 1.4 + idx * 1.7;

      slide4.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: cardY,
        w: 11.7,
        h: 1.5,
        rectRadius: 0.1,
        fill: { color: COLOR_CARD_BG },
        line: { color: 'C7D2FE', width: 1 }
      });

      slide4.addText(`[Source ${idx + 1}] ${cite.documentTitle}`, {
        x: 1.1,
        y: cardY + 0.15,
        w: 11.1,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: '3730A3',
        fontFace: 'Georgia'
      });

      if (cite.citationQuote) {
        slide4.addText(`"${cite.citationQuote}"`, {
          x: 1.1,
          y: cardY + 0.45,
          w: 11.1,
          h: 0.45,
          fontSize: 11,
          italic: true,
          color: COLOR_COFFEE,
          fontFace: 'Calibri'
        });
      }

      slide4.addText(`Relevance: ${cite.groundingNotes || cite.relevantTopic || 'Direct syllabus theorem applied in derivation.'}`, {
        x: 1.1,
        y: cardY + 0.95,
        w: 11.1,
        h: 0.4,
        fontSize: 10,
        color: '4B5563',
        fontFace: 'Calibri'
      });
    });
  }

  // 5. TWIN PRACTICE PROBLEMS / EXAM DRILLS
  if (options.practiceProblems && options.practiceProblems.length > 0) {
    const slide5 = pptx.addSlide();
    slide5.background = { color: COLOR_BG };
    slide5.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.3, fill: { color: COLOR_GOLD } });

    slide5.addText('Twin Practice Problems & Exam Prep Variations', {
      x: 0.8,
      y: 0.6,
      w: 11.7,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_DARK,
      fontFace: 'Georgia'
    });

    options.practiceProblems.slice(0, 2).forEach((prob, pIdx) => {
      const probX = 0.8 + pIdx * 5.9;

      slide5.addShape(pptx.ShapeType.roundRect, {
        x: probX,
        y: 1.4,
        w: 5.6,
        h: 5.2,
        rectRadius: 0.15,
        fill: { color: COLOR_CARD_BG },
        line: { color: 'E2E8F0', width: 1 }
      });

      slide5.addText(`Exam Variation #${pIdx + 1}`, {
        x: probX + 0.3,
        y: 1.6,
        w: 5.0,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: COLOR_ACCENT,
        fontFace: 'Georgia'
      });

      slide5.addText(prob.problem, {
        x: probX + 0.3,
        y: 2.0,
        w: 5.0,
        h: 1.4,
        fontSize: 11,
        color: COLOR_DARK,
        fontFace: 'Calibri',
        valign: 'top'
      });

      if (prob.hint) {
        slide5.addText(`💡 Hint: ${prob.hint}`, {
          x: probX + 0.3,
          y: 3.5,
          w: 5.0,
          h: 0.7,
          fontSize: 10,
          italic: true,
          color: '92400E',
          fontFace: 'Calibri'
        });
      }

      if (prob.fullSolution) {
        slide5.addShape(pptx.ShapeType.rect, {
          x: probX + 0.3,
          y: 4.3,
          w: 5.0,
          h: 2.0,
          fill: { color: 'F8FAFC' },
          line: { color: 'E2E8F0', width: 0.5 }
        });

        slide5.addText(`Master Solution:\n${prob.fullSolution}`, {
          x: probX + 0.4,
          y: 4.4,
          w: 4.8,
          h: 1.8,
          fontSize: 9.5,
          fontFace: 'Calibri',
          color: COLOR_COFFEE
        });
      }
    });
  }

  // 6. CUSTOM DYNAMIC SLIDES (if provided)
  if (options.slides && options.slides.length > 0) {
    options.slides.forEach((sl) => {
      const customSlide = pptx.addSlide();
      customSlide.background = { color: COLOR_BG };
      customSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.3, fill: { color: COLOR_DARK } });

      customSlide.addText(sl.title, {
        x: 0.8,
        y: 0.6,
        w: 11.7,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: COLOR_DARK,
        fontFace: 'Georgia'
      });

      if (sl.subtitle) {
        customSlide.addText(sl.subtitle, {
          x: 0.8,
          y: 1.2,
          w: 11.7,
          h: 0.4,
          fontSize: 12,
          italic: true,
          color: COLOR_COFFEE,
          fontFace: 'Calibri'
        });
      }

      customSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.7,
        w: 11.7,
        h: 4.9,
        rectRadius: 0.15,
        fill: { color: COLOR_CARD_BG },
        line: { color: 'D8C7B5', width: 1 }
      });

      customSlide.addText(
        sl.bullets.map(b => `• ${b}`).join('\n\n'),
        {
          x: 1.2,
          y: 2.0,
          w: 10.9,
          h: 4.3,
          fontSize: 13,
          color: COLOR_DARK,
          fontFace: 'Calibri',
          valign: 'top'
        }
      );
    });
  }

  // Generate file name
  const safeFilename = `${(options.title || 'Course_Study_Summary').replace(/[^a-zA-Z0-9_-]/g, '_')}_Deck.pptx`;
  await pptx.writeFile({ fileName: safeFilename });
  return safeFilename;
}

/**
 * Generate and download a formatted PDF Summary Document using jsPDF
 */
export function exportSummaryAsPdf(options: SummaryExportOptions): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addNewPageIfNeeded = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      // Top header on subsequent pages
      doc.setFontSize(8);
      doc.setTextColor(140, 122, 107);
      doc.text(`${options.courseCode || 'STUDY SANCTUARY'} • ${options.title}`, margin, 10);
      doc.line(margin, 12, pageWidth - margin, 12);
      y = 18;
    }
  };

  // Header Banner
  doc.setFillColor(44, 29, 17); // #2C1D11
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(250, 247, 242);
  doc.text(options.title.slice(0, 55), margin + 4, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(221, 184, 146);
  doc.text(`${options.courseCode || 'UNIVERSITY STUDY'} • ACADEMIC INTEGRITY GROUNDED SUMMARY`, margin + 4, y + 16);
  doc.text(`Generated: ${options.date || new Date().toLocaleDateString()}`, margin + 4, y + 20);

  y += 30;

  // Executive Summary
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(44, 29, 17);
  doc.text('1. Executive Academic Synthesis & Invariants', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 50, 35);
  const summaryLines = doc.splitTextToSize(options.summary || 'Rigorous first-principles resolution.', contentWidth);
  addNewPageIfNeeded(summaryLines.length * 4.5 + 4);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 6;

  // Definitive Solution / Derivation
  if (options.solution) {
    addNewPageIfNeeded(20);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(44, 29, 17);
    doc.text('2. Definitive Solution & Proof Progression', margin, y);
    y += 6;

    doc.setFillColor(250, 248, 245);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(35, 25, 15);

    const solutionLines = doc.splitTextToSize(options.solution, contentWidth - 8);
    const boxHeight = solutionLines.length * 4 + 6;
    addNewPageIfNeeded(boxHeight + 6);

    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'F');
    doc.rect(margin, y, contentWidth, boxHeight, 'S');
    doc.text(solutionLines, margin + 4, y + 5);
    y += boxHeight + 8;
  }

  // First Principles Derivation Breakdown
  if (options.firstPrinciplesSteps && options.firstPrinciplesSteps.length > 0) {
    addNewPageIfNeeded(20);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(44, 29, 17);
    doc.text('3. First-Principles Breakdown: Why Every Step Works', margin, y);
    y += 6;

    options.firstPrinciplesSteps.forEach((step, idx) => {
      addNewPageIfNeeded(32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70); // emerald
      doc.text(`Step ${step.stepNumber || idx + 1}: ${step.stepTitle}`, margin, y);
      y += 5;

      if (step.underlyingAxiomOrLaw) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 62, 45);
        doc.text(`Governing Axiom: ${step.underlyingAxiomOrLaw}`, margin + 2, y);
        y += 4.5;
      }

      if (step.conceptualWhy) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(44, 29, 17);
        const whyLines = doc.splitTextToSize(`Rationale: ${step.conceptualWhy}`, contentWidth - 4);
        doc.text(whyLines, margin + 2, y);
        y += whyLines.length * 4 + 2;
      }

      if (step.potentialExamTrap) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(154, 52, 18); // amber-800
        const trapLines = doc.splitTextToSize(`⚠️ Exam Trap: ${step.potentialExamTrap}`, contentWidth - 4);
        doc.text(trapLines, margin + 2, y);
        y += trapLines.length * 4 + 4;
      }
    });
  }

  // Course Document Citations
  if (options.citations && options.citations.length > 0) {
    addNewPageIfNeeded(20);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(44, 29, 17);
    doc.text('4. Course Document Citations & Syllabus Grounding', margin, y);
    y += 6;

    options.citations.forEach((cite, idx) => {
      addNewPageIfNeeded(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(55, 48, 163);
      doc.text(`[Source ${idx + 1}] ${cite.documentTitle}`, margin, y);
      y += 4.5;

      if (cite.citationQuote) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(75, 85, 99);
        const quoteLines = doc.splitTextToSize(`"${cite.citationQuote}"`, contentWidth - 4);
        doc.text(quoteLines, margin + 2, y);
        y += quoteLines.length * 4 + 2;
      }
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 122, 107);
    doc.text(`Page ${i} of ${totalPages} • Study Sanctuary AI Grounded Document`, margin, pageHeight - 8);
  }

  const safeFilename = `${(options.title || 'Course_Study_Summary').replace(/[^a-zA-Z0-9_-]/g, '_')}_Summary.pdf`;
  doc.save(safeFilename);
  return safeFilename;
}
