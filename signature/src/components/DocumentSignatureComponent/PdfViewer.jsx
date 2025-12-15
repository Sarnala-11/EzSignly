import { useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ file, onPagesLoaded }) {
  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    const renderPdf = async () => {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

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

      if (!cancelled) {
        onPagesLoaded({
          pages,
          originalPdfBytes: arrayBuffer,
        });
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [file, onPagesLoaded]);

}
