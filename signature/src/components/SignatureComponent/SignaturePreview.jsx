export default function SignaturePreview({ dataUrl }) {
  return (
    <div className="signature-wrapper signature-preview-container">
      <h3 className="section-title">Signature Preview</h3>

      {!dataUrl ? (
        <div style={{ color: "#666", padding: 10 }}>
          No signature selected
        </div>
      ) : (
        <div className="signature-final-preview">
          <img
            src={dataUrl}
            alt="signature-preview"
          />
        </div>
      )}
    </div>
  );
}