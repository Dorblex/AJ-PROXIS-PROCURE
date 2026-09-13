import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { C } from "../../shared/tokens.js";
import { useStore } from "../../store/StoreContext.js";

export function AnnouncementsPage() {
  const { state } = useStore();
  const URGENCY_TONE = { High: "red", Normal: "brand", Low: "slate" };
  return (
    <div>
      <SectionTitle sub="Notices, updates and service alerts posted by AJ-PROXIS Control Centre.">Announcements</SectionTitle>
      <div className="space-y-3">
        {state.announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="font-medium">{a.title}</div>
              <Badge tone={URGENCY_TONE[a.urgency] || "slate"}>{a.urgency}</Badge>
            </div>
            <p className="text-sm" style={{ color: C.inkSoft }}>{a.message}</p>
            <div className="text-xs mt-2" style={{ color: C.slate }}>Posted by {a.postedBy} · {a.postedAt}</div>
          </Card>
        ))}
        {!state.announcements.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No announcements yet.</Card>}
      </div>
    </div>
  );
}

