import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import logoStartDz from '@/assets/start-dz-logo.png';
import logoUdl from '@/assets/udl-logo.png';
import logoNccfiue from '@/assets/nccfiue-logo.png';
import type { ParsedBP } from './bp-types';
import type { PlanInputs } from './plan-types';
import { dzd, pct, isNum } from './bp-format';

// ===== Brand palette (RGB, kept consistent with the in-app sage/cream theme) =====
const BRAND = {
  primary: [50, 90, 70] as const,      // sage green
  primarySoft: [220, 230, 222] as const,
  ink: [30, 35, 40] as const,
  muted: [110, 115, 120] as const,
  border: [220, 220, 215] as const,
  cream: [250, 247, 240] as const,
  white: [255, 255, 255] as const,
};

const PAGE = { w: 210, h: 297, margin: 15 } as const; // A4 mm
const HEADER_H = 14;
const FOOTER_H = 12;
const CONTENT_TOP = HEADER_H + 6;
const CONTENT_BOTTOM = PAGE.h - FOOTER_H - 4;
const CONTENT_W = PAGE.w - PAGE.margin * 2;

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

interface BrandAssets {
  startDz: string;
  udl: string;
  nccfiue: string;
}

async function loadBrandAssets(): Promise<BrandAssets> {
  const [startDz, udl, nccfiue] = await Promise.all([
    urlToDataUrl(logoStartDz),
    urlToDataUrl(logoUdl),
    urlToDataUrl(logoNccfiue),
  ]);
  return { startDz, udl, nccfiue };
}

function setColor(pdf: jsPDF, kind: 'fill' | 'text' | 'draw', rgb: readonly [number, number, number]) {
  const [r, g, b] = rgb;
  if (kind === 'fill') pdf.setFillColor(r, g, b);
  else if (kind === 'text') pdf.setTextColor(r, g, b);
  else pdf.setDrawColor(r, g, b);
}

function drawHeader(pdf: jsPDF, assets: BrandAssets, projectName: string, pageNum: number, totalPages: number) {
  // Logo
  try {
    pdf.addImage(assets.startDz, 'PNG', PAGE.margin, 5, 16, 9, undefined, 'FAST');
  } catch {/* ignore */}

  // Brand text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  setColor(pdf, 'text', BRAND.ink);
  pdf.text('BPstartdz', PAGE.margin + 19, 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  setColor(pdf, 'text', BRAND.muted);
  pdf.text('University Djilali Liabes — Modèle Financier', PAGE.margin + 19, 12.5);

  // Project name (right side)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  setColor(pdf, 'text', BRAND.ink);
  const projectShort = projectName.length > 60 ? projectName.slice(0, 57) + '…' : projectName;
  pdf.text(projectShort, PAGE.w - PAGE.margin, 9, { align: 'right' });
  pdf.setFontSize(7.5);
  setColor(pdf, 'text', BRAND.muted);
  pdf.text(`Page ${pageNum} / ${totalPages}`, PAGE.w - PAGE.margin, 12.5, { align: 'right' });

  // Header rule
  setColor(pdf, 'draw', BRAND.primary);
  pdf.setLineWidth(0.6);
  pdf.line(PAGE.margin, HEADER_H, PAGE.w - PAGE.margin, HEADER_H);
}

function drawFooter(pdf: jsPDF, generatedAt: string) {
  setColor(pdf, 'draw', BRAND.border);
  pdf.setLineWidth(0.2);
  pdf.line(PAGE.margin, PAGE.h - FOOTER_H, PAGE.w - PAGE.margin, PAGE.h - FOOTER_H);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  setColor(pdf, 'text', BRAND.muted);
  pdf.text(`Généré le ${generatedAt}`, PAGE.margin, PAGE.h - FOOTER_H + 5);
  pdf.text('BPstartdz · Modèle Financier', PAGE.w - PAGE.margin, PAGE.h - FOOTER_H + 5, { align: 'right' });
}

function drawCoverPage(pdf: jsPDF, assets: BrandAssets, plan: PlanInputs, generatedAt: string) {
  // Top brand band
  setColor(pdf, 'fill', BRAND.primary);
  pdf.rect(0, 0, PAGE.w, 55, 'F');

  // Logo centered in band
  try {
    pdf.addImage(assets.startDz, 'PNG', PAGE.w / 2 - 18, 12, 36, 20, undefined, 'FAST');
  } catch {/* ignore */}

  // Subtitle
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  setColor(pdf, 'text', BRAND.white);
  pdf.text('BPstartdz', PAGE.w / 2, 42, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('University Djilali Liabes Sidi Bel Abbes — Modèle Financier', PAGE.w / 2, 48, { align: 'center' });

  // Document type label
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  setColor(pdf, 'text', BRAND.primary);
  pdf.text('RAPPORT FINANCIER', PAGE.w / 2, 80, { align: 'center', charSpace: 2 });

  // Project title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  setColor(pdf, 'text', BRAND.ink);
  const title = plan.identification.intituleProjet || 'Plan financier';
  const titleLines = pdf.splitTextToSize(title, PAGE.w - 50);
  pdf.text(titleLines, PAGE.w / 2, 98, { align: 'center' });

  // Identification block
  const blockY = 135;
  setColor(pdf, 'fill', BRAND.cream);
  pdf.roundedRect(PAGE.margin + 10, blockY, PAGE.w - PAGE.margin * 2 - 20, 70, 3, 3, 'F');
  setColor(pdf, 'draw', BRAND.border);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(PAGE.margin + 10, blockY, PAGE.w - PAGE.margin * 2 - 20, 70, 3, 3);

  const rows: [string, string][] = [
    ['Établissement', plan.identification.etablissement || '—'],
    ['Faculté', plan.identification.faculte || '—'],
    ['Département', plan.identification.departement || '—'],
    ['Année de référence', String(plan.identification.anneeReference)],
    ['Horizon', `${plan.hypotheses.anneeDebut} — ${plan.hypotheses.anneeDebut + 4} (5 ans)`],
    ['Devise', 'Dinar Algérien (DZD)'],
  ];

  pdf.setFontSize(9);
  rows.forEach(([k, v], i) => {
    const y = blockY + 12 + i * 9;
    setColor(pdf, 'text', BRAND.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.text(k, PAGE.margin + 18, y);
    setColor(pdf, 'text', BRAND.ink);
    pdf.setFont('helvetica', 'bold');
    const valueLines = pdf.splitTextToSize(v, 100);
    pdf.text(valueLines[0] ?? '', PAGE.margin + 70, y);
  });

  // Bottom: partner logos (3) + date
  const bottomY = PAGE.h - 45;
  setColor(pdf, 'draw', BRAND.primary);
  pdf.setLineWidth(0.4);
  pdf.line(PAGE.margin + 30, bottomY - 5, PAGE.w - PAGE.margin - 30, bottomY - 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  setColor(pdf, 'text', BRAND.muted);
  pdf.text('EN PARTENARIAT AVEC', PAGE.w / 2, bottomY, { align: 'center', charSpace: 1.5 });

  // Three logos centered: Start'Dz, UDL, NCCFIUE
  const logoY = bottomY + 4;
  const logoH = 14;
  const gap = 12;
  const widths = [16, 12, 14]; // approx widths
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * 2;
  let x = PAGE.w / 2 - totalW / 2;
  try {
    pdf.addImage(assets.startDz, 'PNG', x, logoY + 1, widths[0], logoH - 2, undefined, 'FAST');
    x += widths[0] + gap;
    pdf.addImage(assets.udl, 'PNG', x, logoY, widths[1], logoH + 2, undefined, 'FAST');
    x += widths[1] + gap;
    pdf.addImage(assets.nccfiue, 'PNG', x, logoY + 1, widths[2], logoH, undefined, 'FAST');
  } catch {/* ignore */}

  pdf.setFontSize(8);
  setColor(pdf, 'text', BRAND.muted);
  pdf.text(generatedAt, PAGE.w / 2, PAGE.h - 8, { align: 'center' });
}

function drawSummaryPage(pdf: jsPDF, bp: ParsedBP, plan: PlanInputs) {
  const startY = CONTENT_TOP;

  // Section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  setColor(pdf, 'text', BRAND.ink);
  pdf.text('Résumé exécutif', PAGE.margin, startY + 5);

  setColor(pdf, 'draw', BRAND.primary);
  pdf.setLineWidth(0.8);
  pdf.line(PAGE.margin, startY + 8, PAGE.margin + 30, startY + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  setColor(pdf, 'text', BRAND.muted);
  pdf.text(
    `Synthèse des indicateurs clés du plan financier sur 5 années (${plan.hypotheses.anneeDebut} – ${plan.hypotheses.anneeDebut + 4}).`,
    PAGE.margin,
    startY + 15,
  );

  // KPI cards
  const ca = bp.pnl?.ca ?? [];
  const ebitda = bp.pnl?.ebitda ?? [];
  const rn = bp.pnl?.resultatNet ?? [];
  const fcf = bp.tft?.freeCashFlow ?? [];

  const sumNum = (arr: (number | null | undefined)[]) =>
    arr.filter((v): v is number => isNum(v)).reduce((a, b) => a + b, 0);
  const avg = (arr: (number | null | undefined)[]) => {
    const filtered = arr.filter((v): v is number => isNum(v));
    return filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
  };

  const kpis: { label: string; value: string }[] = [
    { label: "Chiffre d'affaires cumulé", value: dzd(sumNum(ca), { millions: true }) },
    { label: 'EBITDA moyen', value: dzd(avg(ebitda), { millions: true }) },
    { label: 'Résultat net cumulé', value: dzd(sumNum(rn), { millions: true }) },
    { label: 'Free Cash Flow cumulé', value: dzd(sumNum(fcf), { millions: true }) },
  ];

  const kpiY = startY + 25;
  const kpiW = (CONTENT_W - 6) / 2;
  const kpiH = 22;
  kpis.forEach((kpi, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAGE.margin + col * (kpiW + 6);
    const y = kpiY + row * (kpiH + 6);

    setColor(pdf, 'fill', BRAND.cream);
    pdf.roundedRect(x, y, kpiW, kpiH, 2, 2, 'F');
    setColor(pdf, 'draw', BRAND.border);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x, y, kpiW, kpiH, 2, 2);
    // accent bar
    setColor(pdf, 'fill', BRAND.primary);
    pdf.rect(x, y, 2, kpiH, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    setColor(pdf, 'text', BRAND.muted);
    pdf.text(kpi.label.toUpperCase(), x + 5, y + 7, { charSpace: 0.5 });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    setColor(pdf, 'text', BRAND.ink);
    pdf.text(kpi.value, x + 5, y + 16);
  });

  // P&L summary table
  const tableY = kpiY + Math.ceil(kpis.length / 2) * (kpiH + 6) + 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  setColor(pdf, 'text', BRAND.ink);
  pdf.text("Synthèse P&L (M DZD)", PAGE.margin, tableY);

  const years = bp.fiscalYears.slice(0, 5);
  const colW = (CONTENT_W - 50) / years.length;
  const rowH = 7;
  const headerY = tableY + 4;

  // Header row
  setColor(pdf, 'fill', BRAND.primary);
  pdf.rect(PAGE.margin, headerY, CONTENT_W, rowH, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  setColor(pdf, 'text', BRAND.white);
  pdf.text('Indicateur', PAGE.margin + 2, headerY + 4.8);
  years.forEach((y, i) => {
    pdf.text(String(y), PAGE.margin + 50 + i * colW + colW / 2, headerY + 4.8, { align: 'center' });
  });

  const dataRows: { label: string; values: (number | null | undefined)[]; pct?: boolean }[] = [
    { label: "Chiffre d'affaires", values: ca },
    { label: 'EBITDA', values: ebitda },
    { label: 'Taux EBITDA', values: bp.pnl?.txEbitda ?? [], pct: true },
    { label: 'Résultat net', values: rn },
    { label: 'Free Cash Flow', values: fcf },
  ];

  dataRows.forEach((r, idx) => {
    const y = headerY + rowH + idx * rowH;
    if (idx % 2 === 0) {
      setColor(pdf, 'fill', BRAND.cream);
      pdf.rect(PAGE.margin, y, CONTENT_W, rowH, 'F');
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    setColor(pdf, 'text', BRAND.ink);
    pdf.text(r.label, PAGE.margin + 2, y + 4.8);
    years.forEach((_, i) => {
      const v = r.values[i];
      const text = r.pct
        ? (isNum(v) ? pct(v) : '—')
        : (isNum(v) ? dzd(v, { millions: true }).replace(' M DZD', '') : '—');
      pdf.text(text, PAGE.margin + 50 + i * colW + colW - 2, y + 4.8, { align: 'right' });
    });
  });

  // Border
  setColor(pdf, 'draw', BRAND.border);
  pdf.setLineWidth(0.2);
  pdf.rect(PAGE.margin, headerY, CONTENT_W, rowH + dataRows.length * rowH);
}

async function drawSectionContent(
  pdf: jsPDF,
  element: HTMLElement,
  sectionLabel: string,
  pagesUsed: { count: number },
  assets: BrandAssets,
  projectName: string,
  generatedAt: string,
  totalPages: number,
) {
  // Section title bar at top of content area
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  setColor(pdf, 'text', BRAND.ink);
  pdf.text(sectionLabel, PAGE.margin, CONTENT_TOP + 6);
  setColor(pdf, 'draw', BRAND.primary);
  pdf.setLineWidth(0.8);
  pdf.line(PAGE.margin, CONTENT_TOP + 9, PAGE.margin + 25, CONTENT_TOP + 9);

  const titleBlockH = 14;
  const availH = CONTENT_BOTTOM - CONTENT_TOP - titleBlockH;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const imgW = CONTENT_W;
  const pxPerMm = canvas.width / imgW;
  const pageHpx = availH * pxPerMm;
  const fullPageHpx = (CONTENT_BOTTOM - CONTENT_TOP) * pxPerMm;

  let sy = 0;
  let firstSlice = true;
  while (sy < canvas.height) {
    if (!firstSlice) {
      pdf.addPage();
      pagesUsed.count += 1;
      drawHeader(pdf, assets, projectName, pagesUsed.count, totalPages);
      drawFooter(pdf, generatedAt);
    }
    const slicePxH = firstSlice ? pageHpx : fullPageHpx;
    const sliceH = Math.min(slicePxH, canvas.height - sy);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(canvas, 0, -sy);
    const sliceUrl = sliceCanvas.toDataURL('image/jpeg', 0.92);
    const sliceMm = sliceH / pxPerMm;
    const yOffset = firstSlice ? CONTENT_TOP + titleBlockH : CONTENT_TOP;
    pdf.addImage(sliceUrl, 'JPEG', PAGE.margin, yOffset, imgW, sliceMm, undefined, 'FAST');

    sy += sliceH;
    firstSlice = false;
  }
}

export interface ProExportInput {
  bp: ParsedBP;
  plan: PlanInputs;
  fileName: string;
  /** Container holding sections marked with data-pdf-section + data-pdf-label */
  container: HTMLElement;
}

export async function exportProfessionalPDF({ bp, plan, fileName, container }: ProExportInput) {
  // Wait one tick for layout
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  await new Promise((r) => setTimeout(r, 500));

  const assets = await loadBrandAssets();
  const generatedAt = new Date().toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-pdf-section]'));
  if (sections.length === 0) throw new Error('Aucune section à exporter');

  const projectName = plan.identification.intituleProjet || fileName;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Pre-render to estimate pages: simpler approach — render in two passes is heavy.
  // Instead we compute placeholder totalPages then patch each header by re-walking.
  // For simplicity here we do a single pass and write "Page N / N" at the end via getNumberOfPages.

  // === Page 1 — Cover ===
  drawCoverPage(pdf, assets, plan, generatedAt);

  // === Page 2 — Summary ===
  pdf.addPage();
  drawHeader(pdf, assets, projectName, 2, 2); // total patched later
  drawFooter(pdf, generatedAt);
  drawSummaryPage(pdf, bp, plan);

  const pagesUsed = { count: 2 };

  // === Section pages ===
  for (const section of sections) {
    const label = section.getAttribute('data-pdf-label') || 'Section';
    pdf.addPage();
    pagesUsed.count += 1;
    drawHeader(pdf, assets, projectName, pagesUsed.count, pagesUsed.count);
    drawFooter(pdf, generatedAt);
    await drawSectionContent(
      pdf,
      section,
      label,
      pagesUsed,
      assets,
      projectName,
      generatedAt,
      pagesUsed.count,
    );
  }

  // Patch page numbers (Page N / total) — re-draw header on every page now that total is known
  const total = pdf.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    pdf.setPage(i);
    // Cover header band overlap — only redraw header rectangle area
    setColor(pdf, 'fill', BRAND.white);
    pdf.rect(0, 0, PAGE.w, HEADER_H + 0.5, 'F');
    drawHeader(pdf, assets, projectName, i, total);
  }

  pdf.save(`${fileName}.pdf`);
}
