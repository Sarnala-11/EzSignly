import { useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function PdfViewer({ file, onPagesLoaded }) {
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      const buffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      const pages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        pages.push({
          src: canvas.toDataURL("image/png"),
          width: viewport.width,
          height: viewport.height,
        });
      }

      onPagesLoaded({ pages, originalPdfBytes: buffer });
    };

    loadPdf();
  }, [file, onPagesLoaded]);

  return null;
}
