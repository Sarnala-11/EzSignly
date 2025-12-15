import React, { useEffect, useState } from "react";

const FONTS = [
  "Pacifico",
  "Great Vibes",
  "Dancing Script",
  "Satisfy",
  "Yellowtail",
  "Allura",
  "Kaushan Script",
  "Tangerine",
];

export default function TypedSignature({ onApply }) {
  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[0]);
  const [size, setSize] = useState(10);
  const [weight, setWeight] = useState("400");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    FONTS.forEach((f) => {
      const id = `font-${f}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${f.replace(
          / /g,
          "+"
        )}:wght@300;400;700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, []);

  const renderToDataUrl = () => {
    const padding = 20;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.font = `${weight} ${size}px ${font}`;

    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    );

    const width = textWidth + padding * 2;
    const height = textHeight + padding * 2;

    canvas.width = width;
    canvas.height = height;

    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, width / 2, height / 2);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      meta: { width, height },
    };
  };

  return (
    <div className="signature-wrapper typed-signature">
      <h3 className="section-title">Typed Signature</h3>

      <div className="form-row name-row">
        <label>Name</label>
        <input value={text} placeholder="Your Name" onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="form-row font-selector">
        <label>Font</label>
        <select value={font} onChange={(e) => setFont(e.target.value)}>
          {FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="form-row size-selector">
        <label>Size</label>
        <input
          type="range"
          min="10"
          max="100"
          value={size}
          onChange={(e) => {
            const value = e.target.value;
            setSize(value);

            const percent = ((value - 10) / (100 - 10)) * 100;
            e.target.style.setProperty("--range-progress", `${percent}%`);
          }}
        />

        <span>{size}px</span>
      </div>

      <div className="form-row">
        <label>Weight</label>
        <select value={weight} onChange={(e) => setWeight(e.target.value)}>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="700">700</option>
        </select>
      </div>

      <div className="form-row color-picker">
        <label>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div
        className="typed-preview"
        style={{ fontFamily: font, fontSize: size, color }}
      >
        {text}
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            const { dataUrl, meta } = renderToDataUrl();
            onApply(dataUrl, meta);
          }}
        >
          Use Typed Signature
        </button>
      </div>
    </div>
  );
}
