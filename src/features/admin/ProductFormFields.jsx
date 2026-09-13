import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { GHS } from "../../shared/helpers.js";
import { CATEGORIES } from "../../data/seed.js";

export function ProductFormFields({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU (leave blank to auto-generate)"><TextInput value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Item name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand"><TextInput value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
        <Field label="Unit"><TextInput value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Standard price (GHS)"><TextInput type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
        <Field label="Corporate price (GHS)"><TextInput type="number" value={form.corpPrice} onChange={(e) => setForm({ ...form, corpPrice: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bulk quantity threshold"><TextInput type="number" value={form.bulkQty} onChange={(e) => setForm({ ...form, bulkQty: e.target.value })} /></Field>
        <Field label="Bulk price (GHS)"><TextInput type="number" value={form.bulkPrice} onChange={(e) => setForm({ ...form, bulkPrice: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Minimum order quantity"><TextInput type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} /></Field>
        <Field label="Reorder level"><TextInput type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></Field>
      </div>
    </div>
  );
}

