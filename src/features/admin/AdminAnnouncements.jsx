import { useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminAnnouncements() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const URGENCY_TONE = { High: "red", Normal: "brand", Low: "slate" };

  function submit() {
    if (!title.trim() || !message.trim()) return;
    dispatch({ type: "POST_ANNOUNCEMENT", title, message, urgency, postedBy: me.name });
    setTitle(""); setMessage(""); setUrgency("Normal"); setShowAdd(false);
  }

  return (
    <div>
      <SectionTitle sub="Post notices, service alerts, and updates that appear instantly in every customer's portal.">Announcements</SectionTitle>
      <Btn className="mb-4" icon={Plus} onClick={() => setShowAdd(true)}>Post Announcement</Btn>
      <div className="space-y-3">
        {state.announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="font-medium">{a.title}</div>
              <div className="flex items-center gap-2">
                <Badge tone={URGENCY_TONE[a.urgency] || "slate"}>{a.urgency}</Badge>
                <button onClick={() => dispatch({ type: "DELETE_ANNOUNCEMENT", id: a.id })}><Trash2 size={15} color={C.red} /></button>
              </div>
            </div>
            <p className="text-sm" style={{ color: C.inkSoft }}>{a.message}</p>
            <div className="text-xs mt-2" style={{ color: C.slate }}>Posted by {a.postedBy} · {a.postedAt}</div>
          </Card>
        ))}
        {!state.announcements.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No announcements posted yet.</Card>}
      </div>

      {showAdd && (
        <Modal title="Post Announcement" onClose={() => setShowAdd(false)}>
          <Field label="Title"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Message"><TextArea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          <Field label="Urgency">
            <Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option>Normal</option><option>High</option><option>Low</option>
            </Select>
          </Field>
          <Btn className="mt-2" icon={Megaphone} disabled={!title.trim() || !message.trim()} onClick={submit}>Post to All Customers</Btn>
        </Modal>
      )}
    </div>
  );
}

