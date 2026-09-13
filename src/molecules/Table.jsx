import { C } from "../shared/tokens.js";

export function Table({ columns, rows, empty = "Nothing here yet.", onRowClick }) {
  if (!rows.length) return <div className="text-sm text-center py-10" style={{ color: C.slate }}>{empty}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: C.border }}>
            {columns.map((c) => (
              <th key={c.key} className="text-left py-2 pr-4 font-medium text-xs uppercase tracking-wide" style={{ color: C.slate }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b last:border-0${onRowClick ? " cursor-pointer hover:bg-black/[0.02]" : ""}`} style={{ borderColor: C.border }} onClick={onRowClick ? () => onRowClick(r) : undefined}>
              {columns.map((c) => (
                <td key={c.key} className="py-2.5 pr-4 align-top">{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
