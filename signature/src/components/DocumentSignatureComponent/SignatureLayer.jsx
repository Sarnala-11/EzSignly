import { PDFDocument } from "pdf-lib";

export async function embedSignaturesPdf(originalPdfBytes, pageSignatures = []) {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  const byPage = {};
  for (const s of pageSignatures) {
    (byPage[s.pageIndex] = byPage[s.pageIndex] || []).push(s);
  }

  for (const [pageIndexStr, signatures] of Object.entries(byPage)) {
    const pageIndex = Number(pageIndexStr);
    const page = pdfDoc.getPage(pageIndex);

    const { width: pdfW, height: pdfH } = page.getSize();

    for (const s of signatures) {
      const res = await fetch(s.sigDataUrl);
      const pngBytes = await res.arrayBuffer();
      const pngImage = await pdfDoc.embedPng(pngBytes);

      const scale = pdfW / s.renderedPageWidth;

      const pdfX = s.x * scale;
      const pdfY = pdfH - (s.y + s.height) * scale;
      const pdfWidth = s.width * scale;
      const pdfHeight = s.height * scale;

      page.drawImage(pngImage, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });
    }
  }

  return await pdfDoc.save();
}

export default function SignatureLayer() {
  return null;
}