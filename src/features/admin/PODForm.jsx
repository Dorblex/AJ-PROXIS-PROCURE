import { useState } from "react";
import { Btn } from "../../atoms/Btn.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";

export function PODForm({ order, onSubmit }) {
  const [qtys, setQtys] = useState(Object.fromEntries(order.items.map((it) => [it.name, it.qty])));
  return (
    <div>
      {order.items.map((it) => (
        <div key={it.name} className="flex items-center justify-between gap-2 py-1 text-sm">
          <span>{it.name} (ordered {it.qty})</span>
          <TextInput type="number" className="w-24" value={qtys[it.name]} onChange={(e) => setQtys({ ...qtys, [it.name]: Number(e.target.value) })} />
        </div>
      ))}
      <Btn className="mt-3" onClick={() => onSubmit(Object.entries(qtys).map(([name, qty]) => ({ name, qty })))}>Confirm Delivery</Btn>
    </div>
  );
}

