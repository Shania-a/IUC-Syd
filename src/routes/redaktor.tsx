import { createFileRoute } from "@/lib/router-bridge";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { EventItem, News } from "@/lib/strapi/types";
import { AppShell } from "@/components/portal/AppShell";
import { Eyebrow, PageHeader, Panel, Tag } from "@/components/portal/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/redaktor")({
  head: () => ({
    meta: [
      { title: "Redaktör · IUC Syd Medlemsportal" },
      { name: "description", content: "Skapa, redigera och publicera nyheter och event för medlemsportalen." },
      { property: "og:title", content: "Redaktör · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Redaktörsvy för IUC Syd." },
    ],
  }),
  component: () => <AppShell roles={["editor", "admin"]}><Editor /></AppShell>,
});

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Editor() {
  const { db, me } = useStore();
  return (
    <>
      <PageHeader title="Redaktör" lead="Nyheter och event har fasta fält. Utkast syns bara för redaktörer tills du publicerar." />
      <Tabs defaultValue="news">
        <TabsList><TabsTrigger value="news">Nyheter ({db.news.length})</TabsTrigger><TabsTrigger value="events">Event ({db.events.length})</TabsTrigger></TabsList>
        <TabsContent value="news" className="mt-6"><NewsEditor /></TabsContent>
        <TabsContent value="events" className="mt-6"><EventEditor /></TabsContent>
      </Tabs>
      <Panel className="mt-8 max-w-xl bg-muted">
        <p className="font-semibold">Inloggad som {me?.name}</p>
        <p className="text-sm text-muted-foreground">Roll: {me?.role === "admin" ? "Administratör" : "Redaktör"}. {me?.role === "editor" ? "Du kan skapa, redigera och publicera innehåll, men inte ändra användare." : "Du har full behörighet."}</p>
      </Panel>
    </>
  );
}

function ListItem({ title, sub, state, pinned, active, onClick }: { title: string; sub: string; state: string; pinned: boolean; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full rounded-lg border p-3 text-left", active ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted")}>
      <p className="line-clamp-1 font-medium">{title}</p>
      <div className="mt-1 flex gap-1.5"><span className="text-xs text-muted-foreground">{sub}</span><span className="ml-auto" />{pinned && <Tag variant="solid">Fäst</Tag>}<Tag variant={state === "draft" ? "warn" : "soft"}>{state === "draft" ? "Utkast" : "Publicerad"}</Tag></div>
    </button>
  );
}

function NewsEditor() {
  const { db, actions, lookup } = useStore();
  const [selId, setSelId] = useState(db.news[0]?.id);
  const [draft, setDraft] = useState<News | null>(db.news[0] ?? null);
  const [preview, setPreview] = useState(false);
  const select = (n: News) => { setSelId(n.id); setDraft(n); };
  const create = () => {
    const n: News = { id: actions.newId(), slug: "", title: "Ny nyhet", summary: "", body: "", date: new Date().toISOString().slice(0, 10), pinned: false, state: "draft", topicIds: [] };
    actions.saveNews(n); select(n);
  };
  const save = (state?: News["state"]) => {
    if (!draft) return;
    const n = { ...draft, slug: slugify(draft.title), state: state ?? draft.state };
    actions.saveNews(n); setDraft(n);
    toast.success(state === "published" ? "Publicerad i portalen." : "Sparat.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2">
        <Button onClick={create} className="w-full"><Plus className="h-4 w-4" /> Ny nyhet</Button>
        {db.news.map((n) => <ListItem key={n.id} title={n.title} sub={n.date} state={n.state} pinned={n.pinned} active={n.id === selId} onClick={() => select(n)} />)}
      </div>
      {draft && (
        <Panel className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="flex-1 text-xl font-semibold">{draft.title}</h2>
            <Tag variant={draft.state === "draft" ? "warn" : "soft"}>{draft.state === "draft" ? "Utkast" : "Publicerad"}</Tag>
            <Button variant="outline" onClick={() => save()}>Spara</Button>
            <Button variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" /> Förhandsgranska</Button>
            {draft.state === "draft" ? <Button onClick={() => save("published")}>Publicera</Button> : <Button variant="secondary" onClick={() => save("draft")}>Avpublicera</Button>}
            <Button size="icon" variant="ghost" aria-label="Ta bort" onClick={() => { actions.deleteNews(draft.id); setDraft(null); }}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="mt-6 space-y-4">
            <Field label="Titel" kind="Text"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <Field label="Adress (slug)" kind="Skapas automatiskt"><Input readOnly value={slugify(draft.title)} className="bg-muted font-mono text-sm" /></Field>
            <Field label="Sammanfattning" kind="Lång text"><Textarea rows={2} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></Field>
            <Field label="Brödtext" kind="Blocks, rik text"><Textarea rows={6} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Datum" kind="Datum"><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
              <Field label="Ämne" kind="Relation">
                <Select value={draft.topicIds[0] ?? "none"} onValueChange={(v) => setDraft({ ...draft, topicIds: v === "none" ? [] : [v] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Inget</SelectItem>{db.topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Fäst överst" kind="Ja/nej"><div className="flex h-9 items-center"><Switch checked={draft.pinned} onCheckedChange={(v) => setDraft({ ...draft, pinned: v })} /></div></Field>
            </div>
            {draft.updatedBy && <p className="text-xs text-muted-foreground">Senast ändrad av {draft.updatedBy}{draft.updatedAt ? `, ${new Date(draft.updatedAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}` : ""}</p>}
          </div>
          <Dialog open={preview} onOpenChange={setPreview}>
            <DialogContent>
              <DialogHeader><DialogTitle>{draft.title}</DialogTitle></DialogHeader>
              {draft.pinned && <Tag variant="solid">Fäst överst</Tag>}
              <p className="text-muted-foreground">{draft.summary}</p>
              <p className="whitespace-pre-line">{draft.body}</p>
              <p className="text-xs text-muted-foreground">{draft.topicIds.map((t) => lookup.topic(t)?.name).join(", ")}</p>
            </DialogContent>
          </Dialog>
        </Panel>
      )}
    </div>
  );
}

function EventEditor() {
  const { db, actions } = useStore();
  const [draft, setDraft] = useState<EventItem | null>(db.events[0] ?? null);
  const create = () => {
    const e: EventItem = { id: actions.newId(), slug: "", title: "Nytt event", summary: "", date: new Date().toISOString().slice(0, 10), location: "", topicId: "t-aut", registrationUrl: "https://ungapped.example/", registrationLabel: "Anmäl via Ungapped", pinned: false, state: "draft" };
    actions.saveEvent(e); setDraft(e);
  };
  const save = (state?: EventItem["state"]) => {
    if (!draft) return;
    const e = { ...draft, slug: slugify(draft.title), state: state ?? draft.state };
    actions.saveEvent(e); setDraft(e); toast.success(state === "published" ? "Eventet är publicerat." : "Sparat.");
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2">
        <Button onClick={create} className="w-full"><Plus className="h-4 w-4" /> Nytt event</Button>
        {db.events.map((e) => <ListItem key={e.id} title={e.title} sub={e.date} state={e.state} pinned={e.pinned} active={e.id === draft?.id} onClick={() => setDraft(e)} />)}
      </div>
      {draft && (
        <Panel className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="flex-1 text-xl font-semibold">{draft.title}</h2>
            <Button variant="outline" onClick={() => save()}>Spara</Button>
            {draft.state === "draft" ? <Button onClick={() => save("published")}>Publicera</Button> : <Button variant="secondary" onClick={() => save("draft")}>Avpublicera</Button>}
            <Button size="icon" variant="ghost" aria-label="Ta bort" onClick={() => { actions.deleteEvent(draft.id); setDraft(null); }}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Titel" kind="Text"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <Field label="Plats" kind="Text"><Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Sammanfattning" kind="Lång text"><Textarea rows={2} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></Field></div>
            <Field label="Datum" kind="Datum"><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
            <Field label="Anmälan stänger" kind="Datum"><Input type="date" value={draft.closesAt ?? ""} onChange={(e) => setDraft({ ...draft, closesAt: e.target.value || undefined })} /></Field>
            <Field label="Ämne" kind="Relation">
              <Select value={draft.topicId} onValueChange={(v) => setDraft({ ...draft, topicId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{db.topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Knapptext" kind="Text"><Input value={draft.registrationLabel} onChange={(e) => setDraft({ ...draft, registrationLabel: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Länk (Ungapped eller annan)" kind="URL"><Input value={draft.registrationUrl} onChange={(e) => setDraft({ ...draft, registrationUrl: e.target.value })} /></Field></div>
            <Field label="Fäst överst" kind="Ja/nej"><div className="flex h-9 items-center"><Switch checked={draft.pinned} onCheckedChange={(v) => setDraft({ ...draft, pinned: v })} /></div></Field>
          </div>
        </Panel>
      )}
    </div>
  );
}

function Field({ label, kind, children }: { label: string; kind: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><Label>{label}</Label><Eyebrow className="text-[10px]">{kind}</Eyebrow></div>
      {children}
    </div>
  );
}
