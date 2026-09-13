import { useState } from "react";
import { CheckCircle2, Plus, Trash2, RefreshCcw, ShieldCheck, History, Pencil } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminCompanyContent() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [textForm, setTextForm] = useState({
    aboutIntro: state.companyContent.aboutIntro, historyText: state.companyContent.historyText,
    missionText: state.companyContent.missionText, visionText: state.companyContent.visionText,
    careersText: state.companyContent.careersText, contact: { ...state.companyContent.contact },
  });
  const [savedMsg, setSavedMsg] = useState(false);
  const [teamEditing, setTeamEditing] = useState(null); // member being added/edited, or null
  const [teamForm, setTeamForm] = useState(null);
  const [docEditing, setDocEditing] = useState(null); // doc key being edited, or null
  const [docForm, setDocForm] = useState(null);

  if (!me.isSuperAdmin) {
    return (
      <div>
        <SectionTitle sub="Edit the text shown across the Company dropdown's pages.">Company Content</SectionTitle>
        <Card className="flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} /> <span className="text-sm">Only the Super Administrator can edit Company page content.</span>
        </Card>
      </div>
    );
  }

  function saveText() {
    dispatch({ type: "UPDATE_COMPANY_CONTENT", patch: textForm });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  function openAddTeam() {
    setTeamForm({ name: "", title: "", initials: "" });
    setTeamEditing("new");
  }
  function openEditTeam(m) {
    setTeamForm({ ...m });
    setTeamEditing(m.id);
  }
  function saveTeam() {
    if (!teamForm.name.trim() || !teamForm.title.trim()) return;
    const initials = teamForm.initials.trim() || teamForm.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    if (teamEditing === "new") {
      dispatch({ type: "ADD_TEAM_MEMBER", payload: { ...teamForm, initials } });
    } else {
      dispatch({ type: "UPDATE_TEAM_MEMBER", id: teamEditing, patch: { ...teamForm, initials } });
    }
    setTeamEditing(null);
    setTeamForm(null);
  }

  function openEditDoc(key) {
    setDocForm({ ...state.companyContent.documents[key] });
    setDocEditing(key);
  }
  function saveDoc() {
    if (!docForm.title.trim()) return;
    dispatch({ type: "UPDATE_COMPANY_DOCUMENT", key: docEditing, patch: docForm });
    setDocEditing(null);
    setDocForm(null);
  }

  return (
    <div>
      <SectionTitle sub="Edit the text, team roster, contact details, and policy documents shown across the Company dropdown's pages.">Company Content</SectionTitle>
      <Btn variant="ghost" icon={RefreshCcw} className="mb-4" onClick={() => dispatch({ type: "RESTORE_DEFAULT_COMPANY_CONTENT" })}>Restore All Defaults</Btn>

      <div className="text-sm font-medium mb-2">About, History, Mission & Vision</div>
      <Card className="mb-6">
        <Field label="About AJ-PROXIS — intro (use a blank line to start a new paragraph)">
          <TextArea rows={5} value={textForm.aboutIntro} onChange={(e) => setTextForm({ ...textForm, aboutIntro: e.target.value })} />
        </Field>
        <Field label="Our History"><TextArea rows={3} value={textForm.historyText} onChange={(e) => setTextForm({ ...textForm, historyText: e.target.value })} /></Field>
        <Field label="Our Mission"><TextArea rows={2} value={textForm.missionText} onChange={(e) => setTextForm({ ...textForm, missionText: e.target.value })} /></Field>
        <Field label="Our Vision"><TextArea rows={2} value={textForm.visionText} onChange={(e) => setTextForm({ ...textForm, visionText: e.target.value })} /></Field>
        <Field label="Careers page text (use a blank line to start a new paragraph)">
          <TextArea rows={3} value={textForm.careersText} onChange={(e) => setTextForm({ ...textForm, careersText: e.target.value })} />
        </Field>
        <div className="text-sm font-medium mt-4 mb-2">Contact Details</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Website"><TextInput value={textForm.contact.web} onChange={(e) => setTextForm({ ...textForm, contact: { ...textForm.contact, web: e.target.value } })} /></Field>
          <Field label="Email"><TextInput value={textForm.contact.email} onChange={(e) => setTextForm({ ...textForm, contact: { ...textForm.contact, email: e.target.value } })} /></Field>
          <Field label="Phone"><TextInput value={textForm.contact.phone} onChange={(e) => setTextForm({ ...textForm, contact: { ...textForm.contact, phone: e.target.value } })} /></Field>
          <Field label="Address"><TextInput value={textForm.contact.address} onChange={(e) => setTextForm({ ...textForm, contact: { ...textForm.contact, address: e.target.value } })} /></Field>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Btn icon={CheckCircle2} onClick={saveText}>Save Changes</Btn>
          {savedMsg && <span className="text-xs flex items-center gap-1" style={{ color: C.green }}><CheckCircle2 size={13} /> Saved</span>}
        </div>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Management Team</div>
        <Btn size="sm" icon={Plus} onClick={openAddTeam}>Add Team Member</Btn>
      </div>
      <Card pad={false} className="mb-6">
        <Table columns={[
          { key: "name", label: "Name" }, { key: "title", label: "Title" }, { key: "initials", label: "Initials" },
          { key: "a", label: "", render: (m) => (
            <div className="flex gap-1.5">
              <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => openEditTeam(m)}>Edit</Btn>
              <Btn size="sm" variant="danger" icon={Trash2} onClick={() => dispatch({ type: "DELETE_TEAM_MEMBER", id: m.id })}>Delete</Btn>
            </div>
          ) },
        ]} rows={state.companyContent.team} empty="No team members yet." />
      </Card>

      <div className="text-sm font-medium mb-2">Documents & Policies</div>
      <div className="space-y-3">
        {Object.entries(state.companyContent.documents).map(([key, doc]) => (
          <Card key={key} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{doc.title}</span>
            <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => openEditDoc(key)}>Edit</Btn>
          </Card>
        ))}
      </div>

      {teamEditing && (
        <Modal title={teamEditing === "new" ? "Add Team Member" : "Edit Team Member"} onClose={() => { setTeamEditing(null); setTeamForm(null); }}>
          <Field label="Name"><TextInput value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Field>
          <Field label="Title"><TextInput value={teamForm.title} onChange={(e) => setTeamForm({ ...teamForm, title: e.target.value })} /></Field>
          <Field label="Initials (optional — auto-generated if left blank)"><TextInput value={teamForm.initials} onChange={(e) => setTeamForm({ ...teamForm, initials: e.target.value })} /></Field>
          <Btn icon={CheckCircle2} onClick={saveTeam}>Save</Btn>
        </Modal>
      )}

      {docEditing && (
        <Modal title={`Edit ${docForm.title}`} onClose={() => { setDocEditing(null); setDocForm(null); }} wide>
          <Field label="Title"><TextInput value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} /></Field>
          <Field label="Body (HTML)"><TextArea rows={14} value={docForm.body} onChange={(e) => setDocForm({ ...docForm, body: e.target.value })} /></Field>
          <p className="text-xs mb-3" style={{ color: C.slate }}>Basic HTML tags supported: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;b&gt;.</p>
          <Btn icon={CheckCircle2} onClick={saveDoc}>Save Document</Btn>
        </Modal>
      )}
    </div>
  );
}

