import "./App.css";
import React, { useState, useRef } from "react";

import PageCanvas from "./components/DocumentSignatureComponent/PageCanvas";
import TypedSignature from "./components/SignatureComponent/TypedSignature";
import DrawSignature from "./components/SignatureComponent/DrawSignature";
import UploadSignature from "./components/SignatureComponent/UploadSignature";
import SignaturePreview from "./components/SignatureComponent/SignaturePreview";
import PdfViewer from "./components/DocumentSignatureComponent/PdfViewer";

function App() {
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [signatureMeta, setSignatureMeta] = useState(null);

  const [docPages, setDocPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [signaturesOnPages, setSignaturesOnPages] = useState({});

  const [activeTab, setActiveTab] = useState("typed");
  const [uploadedPdf, setUploadedPdf] = useState(null);

  const pdfExportBytesRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const pdfArrayBufferRef = useRef(null);

  function handlePagesLoaded({ pages, originalPdfBytes }) {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    setDocPages(pages);
    pdfExportBytesRef.current = originalPdfBytes;
    setCurrentPageIndex(0);
    setSignaturesOnPages({});
  }

  function handleUseSignature(dataUrl, meta = {}) {
    setSignatureDataUrl(dataUrl);
    setSignatureMeta(meta);
  }

  function addSignatureToPage(pageIndex) {
    if (!signatureDataUrl || !docPages[pageIndex]) return;

    setSignaturesOnPages((prev) => {
      const arr = prev[pageIndex] ? [...prev[pageIndex]] : [];
      const page = docPages[pageIndex];

      const defaultWidth = page.width / 3;
      const defaultHeight = signatureMeta?.height
        ? (signatureMeta.height / signatureMeta.width) * defaultWidth
        : defaultWidth / 3;

      arr.push({
        id: Date.now().toString(),
        src: signatureDataUrl,
        x: (page.width - defaultWidth) / 2,
        y: (page.height - defaultHeight) / 2,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
      });

      return { ...prev, [pageIndex]: arr };
    });
  }

  function updateSignature(pageIndex, id, patch) {
    setSignaturesOnPages((prev) => ({
      ...prev,
      [pageIndex]: prev[pageIndex].map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));
  }

  function removeSignature(pageIndex, id) {
    setSignaturesOnPages((prev) => ({
      ...prev,
      [pageIndex]: prev[pageIndex].filter((s) => s.id !== id),
    }));
  }

  return (
    <div className="App">
      <header className="app-header">
        EZSIGNLY — Custom Signature Creator & Document Signer
      </header>

      <div className="app-body">
        <div className="top-panels">

          <aside className="left-panel">
            <div className="creator-card">
              <h3 className="card-title">Create Signature</h3>

              <div className="signature-tabs">
                <button
                  className={`signature-tab ${
                    activeTab === "typed" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("typed")}
                >
                  Type
                </button>
                <button
                  className={`signature-tab ${
                    activeTab === "draw" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("draw")}
                >
                  Draw
                </button>
                <button
                  className={`signature-tab ${
                    activeTab === "upload" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("upload")}
                >
                  Upload
                </button>
              </div>

              <div className="signature-tool-content">
                {activeTab === "typed" && (
                  <TypedSignature onApply={handleUseSignature} />
                )}
                {activeTab === "draw" && (
                  <DrawSignature onApply={handleUseSignature} />
                )}
                {activeTab === "upload" && (
                  <UploadSignature onApply={handleUseSignature} />
                )}
              </div>
            </div>

            <div className="creator-card">
              {/* <h4>Signature Preview</h4> */}
              <SignaturePreview dataUrl={signatureDataUrl} />

              <button
                className="btn"
                onClick={() => addSignatureToPage(currentPageIndex)}
                disabled={!signatureDataUrl || docPages.length === 0}
              >
                Add to Page
              </button>
            </div>
          </aside>

          <aside className="right-panel">

            <div className="creator-card upload-card">
              <h3 className="card-title">Upload Document</h3>
              <input
                type="file"
                accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const buffer = await file.arrayBuffer();

                  pdfArrayBufferRef.current = buffer;

                  setUploadedPdf(file);
                  setDocPages([]);
                  setSignaturesOnPages({});
                }}
              />
            </div>

            <div className="pdf-view-section">
              <PdfViewer file={uploadedPdf} onPagesLoaded={handlePagesLoaded} />

              {docPages.length > 0 && (
                <>
                  <div className="page-controls">
                    <button
                      onClick={() =>
                        setCurrentPageIndex((p) => Math.max(0, p - 1))
                      }
                      disabled={currentPageIndex === 0}
                    >
                      Prev
                    </button>

                    <span>
                      Page {currentPageIndex + 1} / {docPages.length}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPageIndex((p) =>
                          Math.min(docPages.length - 1, p + 1)
                        )
                      }
                      disabled={currentPageIndex === docPages.length - 1}
                    >
                      Next
                    </button>
                  </div>

                  <PageCanvas
                    key={currentPageIndex}
                    page={docPages[currentPageIndex]}
                    pageIndex={currentPageIndex}
                    signatures={signaturesOnPages[currentPageIndex] || []}
                    onChangeSignature={(id, patch) =>
                      updateSignature(currentPageIndex, id, patch)
                    }
                    onRemoveSignature={(id) =>
                      removeSignature(currentPageIndex, id)
                    }
                  />
                </>
              )}
            </div>
          </aside>
        </div>

        <div className="export-bar">
          <button
            className="btn"
            onClick={() => {
              const stage = window.__CURRENT_KONVA_STAGE__;
              const transformer = window.__CURRENT_KONVA_TRANSFORMER__;
              if (!stage) return alert("Canvas not ready.");

              if (transformer) transformer.visible(false);
              stage.draw();

              const dataUrl = stage.toDataURL({ pixelRatio: 2 });

              if( transformer) transformer.visible(true);
              stage.draw();

              const a = document.createElement("a");
              a.href = dataUrl;
              a.download = `signed-page-${currentPageIndex + 1}.png`;
              a.click();
            }}
            disabled={docPages.length === 0}
          >
            Export Page as Image
          </button>

          <button
            className="btn"
            onClick={async () => {
              if (!pdfArrayBufferRef.current) {
                alert("Upload a PDF first");
                return;
              }

              const pageSignatures = [];

              for (const [pIdxStr, arr] of Object.entries(signaturesOnPages)) {
                const pIdx = Number(pIdxStr);
                const pageMeta = docPages[pIdx];
                if (!pageMeta) continue;

                for (const s of arr) {
                  pageSignatures.push({
                    pageIndex: pIdx,
                    sigDataUrl: s.src,
                    x: s.x,
                    y: s.y,
                    width: s.width,
                    height: s.height,
                    renderedPageWidth: pageMeta.width,
                    renderedPageHeight: pageMeta.height,
                  });
                }
              }

              if (!pageSignatures.length) {
                alert("No signatures to embed!");
                return;
              }

              const freshPdfBytes = new Uint8Array(
                pdfArrayBufferRef.current.slice(0)
              );

              const { embedSignaturesPdf } = await import(
                "./components/DocumentSignatureComponent/SignatureLayer"
              );

              const exportedPdf = await embedSignaturesPdf(
                freshPdfBytes,
                pageSignatures
              );

              const blob = new Blob([exportedPdf], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = "signed_document.pdf";
              a.click();

              URL.revokeObjectURL(url);
            }}
          >
            Export Signed PDF
          </button>
        </div>
      </div>

      <footer className="app-footer">EZSIGNLY — Assignment</footer>
    </div>
  );
}

export default App;
