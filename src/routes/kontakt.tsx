import { createFileRoute, Link } from "@/lib/router-bridge";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { canReadMessage, formatDate, useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { Initials, Panel, Tag } from "@/components/portal/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/kontakt")({
  validateSearch: (s: Record<string, unknown>): { amne?: string; text?: string } => ({
    ...(typeof s["amne"] === "string" ? { amne: s["amne"] } : {}),
    ...(typeof s["text"] === "string" ? { text: s["text"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Privat kontakt · IUC Syd Medlemsportal" },
      { name: "description", content: "Skicka ett privat meddelande som bara IUC Syd kan läsa." },
      { property: "og:title", content: "Privat kontakt · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Behov och frågor som bara ska till IUC Syd." },
    ],
  }),
  component: () => <AppShell roles={["member"]}><Contact /></AppShell>,
});

const STATUS = { new: { l: "Skickat", v: "outline" }, read: { l: "Läst", v: "warn" }, answered: { l: "Besvarat", v: "soft" } } as const;

function Contact() {
  const search = Route.useSearch();
  const { db, me, lookup, actions } = useStore();
  const company = lookup.company(me?.companyId);
  const [subject, setSubject] = useState("");
  const [topicId, setTopicId] = useState(search.amne ?? "t-aut");
  const [body, setBody] = useState(search.text ?? "");
  const [asNeed, setAsNeed] = useState(false);
  const [share, setShare] = useState(false);
  const mine = db.messages.filter((m) => me && canReadMessage(me, m)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Start › Privat kontakt med IUC Syd</Link>
      <h1 className="mt-2 text-4xl font-bold">Privat kontakt med IUC Syd</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-start gap-3 rounded-lg bg-accent p-4">
            <Lock className="mt-0.5 h-5 w-5 text-primary" />
            <div><p className="font-semibold">Endast IUC Syd ser det här meddelandet.</p><p className="text-sm text-muted-foreground">Andra medlemmar och dina kollegor ser det inte.</p></div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={(e) => {
            e.preventDefault();
            actions.sendMessage({ subject, topicId, body, shareWithColleagues: share }, asNeed);
            setSubject(""); setBody(""); setAsNeed(false); setShare(false);
            toast.success("Skickat till IUC Syd. Du får svar i portalen och via e-post.");
          }}>
            <div className="space-y-1.5"><Label>Rubrik</Label><Input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="T.ex. Vill automatisera lackeringen" /></div>
            <div className="space-y-1.5"><Label>Ämne</Label>
              <Select value={topicId} onValueChange={setTopicId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{db.topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Meddelande</Label><Textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Valfritt</p>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={asNeed} onCheckedChange={(v) => setAsNeed(v === true)} />Spara också som ett identifierat behov på vårt företagskort</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={share} onCheckedChange={(v) => setShare(v === true)} />Låt mina kollegor på {company?.name} se meddelandet</label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Skickas som {me?.name}, {company?.name}</span>
              <Button type="submit" size="lg">Skicka till IUC Syd</Button>
            </div>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="font-semibold">Vem kan se vad?</h2>
            <dl className="mt-3 divide-y divide-border text-sm">
              {[["Privat meddelande", "Du och IUC Syd. Kollegor bara om du väljer det."], ["Fråga i communityt", "Alla godkända medlemmar. IUC Syd kan svara öppet."], ["Identifierat behov", "Du väljer: bara IUC Syd eller alla medlemmar."]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-2 py-2"><dt className="font-semibold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
              ))}
            </dl>
          </Panel>
          <Panel>
            <h2 className="font-semibold">Mina privata meddelanden</h2>
            <ul className="mt-3 space-y-4">
              {mine.map((m) => {
                const st = STATUS[m.status];
                const sender = lookup.member(m.senderId);
                return (
                  <li key={m.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <p className="flex-1 font-semibold">{m.subject}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                      <Tag variant={st.v}>{st.l}</Tag>
                    </div>
                    {sender?.id !== me?.id && <p className="text-xs text-muted-foreground">Från kollega {sender?.name}</p>}
                    {m.replies.map((r, i) => {
                      const a = lookup.member(r.authorId);
                      return (
                        <div key={i} className="mt-2 flex gap-2 rounded-md bg-accent p-3 text-sm">
                          <Initials text="IS" size="sm" tone="solid" />
                          <div><p className="font-semibold">{a?.name} · IUC Syd</p><p>{r.body}</p></div>
                        </div>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
