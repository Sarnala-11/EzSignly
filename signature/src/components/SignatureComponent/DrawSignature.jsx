import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import trimCanvas from "trim-canvas";

export default function DrawSignature({ onApply }) {
  const sigRef = useRef(null);
  const [paths, setPaths] = useState([]);

  const handleEndStroke = () => {
    if (!sigRef.current) return;
    setPaths(sigRef.current.toData());
  };

  const clearSignature = () => {
    sigRef.current.clear();
    setPaths([]);
  };

  const undoLast = () => {
    if (!paths.length) return;
    const newPaths = [...paths];
    newPaths.pop();
    sigRef.current.clear();
    sigRef.current.fromData(newPaths);
    setPaths(newPaths);
  };

  const applySignature = () => {
    if (sigRef.current.isEmpty()) {
      alert("Please draw a signature first.");
      return;
    }

    const rawCanvas = sigRef.current.getCanvas();
    const trimmed = trimCanvas(rawCanvas);

    const dataUrl = trimmed.toDataURL("image/png");

    onApply(dataUrl, {
      width: trimmed.width,
      height: trimmed.height,
    });
  };

  return (
    <div className="signature-wrapper draw-signature">
      <h3 className="section-title">Draw Signature</h3>

      <div className="signature-box">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          onEnd={handleEndStroke}
          canvasProps={{
            className: "sig-canvas",
            width: 600,
            height: 180,
          }}
        />
      </div>

      <div className="signature-actions">
        <button className="btn btn-secondary" onClick={clearSignature}>
          Clear
        </button>

        <button
          className="btn btn-secondary"
          onClick={undoLast}
          disabled={!paths.length}
        >
          Undo
        </button>

        <button className="btn btn-primary" onClick={applySignature}>
          Use Signature
        </button>
      </div>
    </div>
  );
}
