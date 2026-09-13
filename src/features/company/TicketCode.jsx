import { CheckCircle2 } from "lucide-react";
import { C } from "../../shared/tokens.js";
import { seededRandom } from "../../shared/helpers.js";
import { QRCodeSVG } from "../../molecules/QRCodeSVG.jsx";

export function TicketCode({ code, payload, onScan, scanned }) {
  const rand = seededRandom(code);
  const bars = Array.from({ length: 28 }, () => Math.round(1 + rand() * 3));

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onScan}
        className="text-center group"
        title="Scan with any real QR code reader, or click to simulate a scan"
      >
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: C.brand }}>Scan Me</div>
        <div className="rounded p-2 border group-hover:shadow-md transition-shadow inline-block" style={{ backgroundColor: "#fff", borderColor: C.border }}>
          <QRCodeSVG value={payload} size={220} />
        </div>
      </button>
      <div className="flex items-end gap-[1.5px] px-2 py-1 rounded border" style={{ backgroundColor: "#fff", borderColor: C.border }}>
        {bars.map((w, i) => (
          <div key={i} style={{ width: w, height: 22, backgroundColor: "#16191C" }} />
        ))}
      </div>
      <div className="text-[10px] font-mono tracking-widest" style={{ color: C.slate }}>{code}</div>
      <p className="text-[9px] text-center max-w-[160px]" style={{ color: C.slate }}>Genuine, scannable QR code — try it with your phone's camera.</p>
      {scanned && (
        <div className="text-[10px] flex items-center gap-1" style={{ color: C.green }}><CheckCircle2 size={11} /> Scanned</div>
      )}
    </div>
  );
}
