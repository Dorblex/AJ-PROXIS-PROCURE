import { C } from "../../shared/tokens.js";

export function MiniList({ title, rows }) {
  return (
    <div>
      <div className="text-xs font-medium mb-1">{title}</div>
      <ul className="text-xs space-y-1" style={{ color: C.inkSoft }}>
        {rows.length ? rows.map((r, i) => <li key={i}>· {r}</li>) : <li style={{ color: C.slate }}>None yet.</li>}
      </ul>
    </div>
  );
}

