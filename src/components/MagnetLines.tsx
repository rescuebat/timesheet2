import React, { useRef, CSSProperties } from "react";
import "./MagnetLines.css";

interface MagnetLinesProps {
  rows?: number;
  columns?: number;
  containerSize?: string;
  lineColor?: string;
  lineWidth?: string;
  lineHeight?: string;
  baseAngle?: number;
  className?: string;
  style?: CSSProperties;
}

const MagnetLines: React.FC<MagnetLinesProps> = ({
  rows = 9,
  columns = 9,
  containerSize = "80vmin",
  lineColor = "#efefef",
  lineWidth = "1vmin",
  lineHeight = "6vmin",
  baseAngle = 0,
  className = "",
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate center
  const centerRow = (rows - 1) / 2;
  const centerCol = (columns - 1) / 2;
  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => {
    const row = Math.floor(i / columns);
    const col = i % columns;
    // Angle from center to this cell
    const dx = col - centerCol;
    const dy = row - centerRow;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + baseAngle;
    return (
      <span
        key={i}
        style={{
          "--rotate": `${angle}deg`,
          backgroundColor: lineColor,
          width: lineWidth,
          height: lineHeight,
        } as CSSProperties}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      className={`magnetLines-container ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style,
      }}
    >
      {spans}
    </div>
  );
};

export default MagnetLines; 