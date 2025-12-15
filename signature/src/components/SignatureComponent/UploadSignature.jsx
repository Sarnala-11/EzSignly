import { useState } from "react";

const MAX_SIGNATURE_WIDTH = 300; 

export default function UploadSignature({ onApply }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setPreview(src);

      const img = new Image();
      img.onload = () => {

        let width = img.width;
        let height = img.height;

        if (width > MAX_SIGNATURE_WIDTH) {
          const scale = MAX_SIGNATURE_WIDTH / width;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const threshold = 250;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r >= threshold && g >= threshold && b >= threshold) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          console.warn("Background removal skipped");
        }

        const dataUrl = canvas.toDataURL("image/png");
        onApply(dataUrl, { width: canvas.width, height: canvas.height });
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="signature-wrapper upload-signature">
      <h3 className="section-title">Upload Signature</h3>

      <label className="upload-btn">
        Click to Upload Signature
        <input
          type="file"
          accept="image/*,image/svg+xml"
          hidden
          onChange={handleFile}
        />
      </label>

      <div className="hint" style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
        Note: PNG with transparent background is best.  
        White backgrounds are auto-removed.
      </div>

      {preview && (
        <div className="upload-preview">
          <img src={preview} alt="Uploaded Signature Preview" />
        </div>
      )}
    </div>
  );
}