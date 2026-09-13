import { useMemo } from "react";
import { qrGenerate } from "../shared/qr.js";

export function QRCodeSVG({ value, size = 220 }) {
  const qr = useMemo(() => qrGenerate(value), [value]);
  if (!qr) return null;
  const modules = qr.size;
  const quiet = 4; // QR spec's minimum quiet zone — too thin a border is a common real-world scan-failure cause
  const total = modules + quiet * 2;

  // Merge horizontally-adjacent "on" modules into single rects (instead of one <rect> per
  // module). This avoids the faint anti-aliased seams that can appear between many tiny
  // touching SVG shapes at small render sizes — a common reason on-screen QR codes fail
  // to scan even though the underlying data is correctly encoded.
  const runs = [];
  for (let r = 0; r < modules; r++) {
    let c = 0;
    while (c < modules) {
      if (qr.matrix[r][c]) {
        let start = c;
        while (c < modules && qr.matrix[r][c]) c++;
        runs.push([r, start, c - start]);
      } else {
        c++;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${total} ${total}`} shapeRendering="crispEdges" style={{ display: "block" }}>
      <rect x="0" y="0" width={total} height={total} fill="#fff" />
      {runs.map(([r, c, w], i) => <rect key={i} x={c + quiet} y={r + quiet} width={w} height="1" fill="#16191C" />)}
    </svg>
  );
}
