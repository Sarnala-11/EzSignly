import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Transformer } from "react-konva";
import useImage from "use-image";

export default function PageCanvas({
  page,
  pageIndex,
  signatures = [],
  onChangeSignature,
  onRemoveSignature
}) {
  const [pageImg] = useImage(page?.src || null);

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (stageRef.current) {
      window.__CURRENT_KONVA_STAGE__ = stageRef.current;
    }
  }, [pageIndex, stageRef, signatures]);

  return (
    <div className="page-canvas-layer">
      <Stage
        id="konva-stage-canvas"
        ref={stageRef}
        width={page?.width || 800}
        height={page?.height || 1000}
        className="pdf-page"
      >
        <Layer ref={layerRef}>

          {pageImg && (
            <KImage
              image={pageImg}
              x={0}
              y={0}
              width={page.width}
              height={page.height}
            />
          )}

          {signatures.map((sig) => (
            <SigImage
              key={sig.id}
              sig={sig}
              isSelected={selectedId === sig.id}
              onSelect={() => setSelectedId(sig.id)}
              onChange={(patch) => onChangeSignature(sig.id, patch)}
              onDelete={() => onRemoveSignature(sig.id)}
            />
          ))}

        </Layer>
      </Stage>
    </div>
  );
}

function SigImage({ sig, isSelected, onSelect, onChange, onDelete }) {
  const [img] = useImage(sig.src, "anonymous");
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (!img) return null;

  return (
    <>
      <KImage
        image={img}
        x={sig.x}
        y={sig.y}
        width={sig.width}
        height={sig.height}
        rotation={sig.rotation}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
        onDblClick={() => {
          if (window.confirm("Delete this signature?")) {
            onDelete();
          }
        }}
      />

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      )}
    </>
  );
}
