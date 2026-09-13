import { useState } from "react";
import { Warehouse, Plus, Trash2, Navigation } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { guessCoords } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function SavedLocationsPage() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const locations = customer.savedLocations || [];

  function submit() {
    if (!label.trim() || !address.trim()) return;
    const c = guessCoords(address);
    dispatch({ type: "ADD_SAVED_LOCATION", customerId: customer.id, label, address, lat: c.lat, lon: c.lon });
    setLabel(""); setAddress(""); setShowAdd(false);
  }

  return (
    <div>
      <SectionTitle sub="Save frequently-used delivery addresses — branches, warehouses, or campuses — for faster checkout and requests.">Delivery Locations</SectionTitle>
      <Btn className="mb-4" icon={Plus} onClick={() => setShowAdd(true)}>Add Delivery Location</Btn>
      <div className="grid sm:grid-cols-2 gap-3">
        {locations.map((l) => (
          <Card key={l.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium flex items-center gap-1.5"><Navigation size={14} color={C.brand} /> {l.label}</div>
                <p className="text-xs mt-1" style={{ color: C.slate }}>{l.address}</p>
              </div>
              <button onClick={() => dispatch({ type: "DELETE_SAVED_LOCATION", customerId: customer.id, locId: l.id })}><Trash2 size={15} color={C.red} /></button>
            </div>
          </Card>
        ))}
        {!locations.length && <Card className="sm:col-span-2 text-center py-10 text-sm" style={{ color: C.slate }}>No saved locations yet.</Card>}
      </div>

      {showAdd && (
        <Modal title="Add Delivery Location" onClose={() => setShowAdd(false)}>
          <Field label="Label"><TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Main Campus, Warehouse Annex" /></Field>
          <Field label="Address"><TextArea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          <Btn className="mt-3" icon={Plus} disabled={!label.trim() || !address.trim()} onClick={submit}>Save Location</Btn>
        </Modal>
      )}
    </div>
  );
}

