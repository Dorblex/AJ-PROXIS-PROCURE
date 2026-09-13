import { useState } from "react";
import { Trash2, Target } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { useStore } from "../../store/StoreContext.js";
import { ProductFormFields } from "./ProductFormFields.jsx";

export function EditProductModal({ product, onClose, onSaved, aiPriceApplied }) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({ ...product });
  function submit() {
    if (!form.name.trim()) return;
    dispatch({
      type: "UPDATE_PRODUCT", id: product.id, patch: {
        name: form.name, brand: form.brand, unit: form.unit, category: form.category,
        price: Number(form.price) || 0, corpPrice: Number(form.corpPrice) || 0,
        bulkQty: Number(form.bulkQty) || 10, bulkPrice: Number(form.bulkPrice) || 0,
        moq: Number(form.moq) || 1, reorderLevel: Number(form.reorderLevel) || 25,
      },
    });
    if (onSaved) onSaved();
    onClose();
  }
  return (
    <Modal title={`Edit ${product.sku}`} onClose={onClose} wide>
      {aiPriceApplied && (
        <Card className="mb-3 flex items-center gap-2" style={{ backgroundColor: C.brandTint }}>
          <Target size={15} color={C.brand} /> <span className="text-sm">Price pre-filled from the Super Administrator's approved AI Market Price suggestion.</span>
        </Card>
      )}
      <ProductFormFields form={form} setForm={setForm} />
      <div className="flex gap-2 mt-4">
        <Btn onClick={submit}>Save Changes</Btn>
        <Btn variant="danger" icon={Trash2} onClick={() => { dispatch({ type: "REMOVE_PRODUCT", id: product.id }); onClose(); }}>Remove Item</Btn>
      </div>
    </Modal>
  );
}

