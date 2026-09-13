import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { CATEGORIES } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { ProductFormFields } from "./ProductFormFields.jsx";

export function AddProductModal({ onClose, initial, onSaved, aiPriceApplied }) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({ sku: "", category: CATEGORIES[0].key, name: "", brand: "", unit: "unit", price: "", corpPrice: "", bulkQty: "", bulkPrice: "", moq: 1, initialStock: 50, reorderLevel: 25, ...initial });
  function submit() {
    if (!form.name.trim() || !form.price) return;
    dispatch({ type: "ADD_PRODUCT", payload: form });
    if (onSaved) onSaved();
    onClose();
  }
  return (
    <Modal title="Add New Catalogue Item" onClose={onClose} wide>
      {aiPriceApplied && (
        <Card className="mb-3 flex items-center gap-2" style={{ backgroundColor: C.brandTint }}>
          <Target size={15} color={C.brand} /> <span className="text-sm">Price pre-filled from the Super Administrator's approved AI Market Price suggestion.</span>
        </Card>
      )}
      <ProductFormFields form={form} setForm={setForm} />
      <div className="mt-3">
        <Field label="Initial stock per warehouse"><TextInput type="number" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} /></Field>
      </div>
      <Btn className="mt-4" icon={Plus} onClick={submit}>Add Item to Catalogue</Btn>
    </Modal>
  );
}

