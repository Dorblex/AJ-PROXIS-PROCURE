import { C } from "../../shared/tokens.js";

export function Info({ l, v }) { return <div><div className="text-[11px] uppercase" style={{ color: C.slate }}>{l}</div><div className="font-medium">{v}</div></div>; }
