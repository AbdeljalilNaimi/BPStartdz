import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export async function exportDashboardToPDF(container: HTMLElement, fileName: string) {
  // Wait for charts to settle
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  await new Promise((r) => setTimeout(r, 700));

  const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-pdf-section]'));
  if (sections.length === 0) throw new Error('Aucune section à exporter');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  let firstPage = true;

  for (const section of sections) {
    const canvas = await html2canvas(section, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: section.scrollWidth,
    });

    const imgW = contentW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const pxPerMm = canvas.width / imgW;
    const pageHpx = contentH * pxPerMm;

    let renderedH = 0;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (imgH <= contentH) {
      if (!firstPage) pdf.addPage();
      firstPage = false;
      pdf.addImage(dataUrl, 'JPEG', margin, margin, imgW, imgH);
    } else {
      // slice into pages
      let sy = 0;
      while (sy < canvas.height) {
        const sliceH = Math.min(pageHpx, canvas.height - sy);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, -sy);
        const sliceUrl = sliceCanvas.toDataURL('image/jpeg', 0.92);
        const sliceMm = sliceH / pxPerMm;

        if (!firstPage) pdf.addPage();
        firstPage = false;
        pdf.addImage(sliceUrl, 'JPEG', margin, margin, imgW, sliceMm);

        sy += sliceH;
        renderedH += sliceH;
      }
    }
  }

  pdf.save(`${fileName.replace(/\.xlsx$/i, '')}-dashboard.pdf`);
}
