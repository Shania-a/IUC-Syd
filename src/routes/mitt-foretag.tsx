import { createFileRoute } from "@/lib/router-bridge";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { CompanyCard } from "@/components/portal/CompanyCard";
import { Initials, PageHeader, Panel, Tag } from "@/components/portal/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/mitt-foretag")({
  head: () => ({
    meta: [
      { title: "Mitt företag · IUC Syd Medlemsportal" },
      { name: "description", content: "Hantera ert företagskort, identifierade behov och kontaktpersoner." },
      { property: "og:title", content: "Mitt företag · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Se och förhandsgranska ert företagskort." },
    ],
  }),
  component: () => <AppShell roles={["member"]}><MyCompany /></AppShell>,
});

function MyCompany() {
  const { db, me, lookup, actions } = useStore();
  const company = lookup.company(me?.companyId);
  const [preview, setPreview] = useState(false);
  const [need, setNeed] = useState({ title: "", topicId: "t-aut", visibility: "iuc" as "iuc" | "all" });
  const [sug, setSug] = useState({ name: "", title: "", phone: "", email: "" });
  if (!company || !me) return null;

  const needs = db.needs.filter((n) => n.companyId === company.id);
  const people = db.members.filter((m) => m.companyId === company.id);
  const suggestions = db.suggestions.filter((s) => s.companyId === company.id && s.status === "pending");
  const parts = db.participations.filter((p) => p.companyId === company.id);

  return (
    <>
      <PageHeader title="Mitt företag" lead="Så ser ert företagskort ut, vilka som är kopplade till det och vilka behov ni har registrerat.">
        <Button variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" /> Se hur andra medlemmar ser kortet</Button>
      </PageHeader>

      <Panel className="p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">{company.initials}</span>
          <div><h2 className="text-2xl font-bold">{company.name}</h2><p className="text-muted-foreground">{company.municipality} · {company.industry}</p></div>
        </div>
        <p className="mt-4">{company.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">{company.email} · {company.phone}</p>
        <p className="mt-4 rounded-md bg-warning px-3 py-2 text-sm text-warning-foreground">Företagsuppgifter läggs in och uppdateras av IUC Syd. Hör av er om något är fel.</p>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="font-semibold">Identifierade behov</h3>
          <p className="text-sm text-muted-foreground">Underlag för dialog och framtida matchning</p>
          <ul className="mt-4 space-y-3">
            {needs.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">Syns för: {n.visibility === "all" ? "Alla medlemmar" : "Endast IUC Syd"}</p>
                </div>
                <Tag>{lookup.topic(n.topicId)?.name}</Tag>
                <Select value={n.visibility} onValueChange={(v) => actions.setNeedVisibility(n.id, v as "all" | "iuc")}>
                  <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="iuc">Endast IUC Syd</SelectItem><SelectItem value="all">Alla medlemmar</SelectItem></SelectContent>
                </Select>
                <Button size="icon" variant="ghost" onClick={() => actions.removeNeed(n.id)} aria-label="Ta bort"><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
          <form className="mt-5 space-y-3 rounded-lg bg-muted p-4" onSubmit={(e) => {
            e.preventDefault(); actions.addNeed(need); setNeed({ ...need, title: "" }); toast.success("Behovet är tillagt.");
          }}>
            <p className="font-semibold">Lägg till ett behov</p>
            <div className="space-y-1.5"><Label>Beskriv behovet</Label><Input required value={need.title} onChange={(e) => setNeed({ ...need, title: e.target.value })} placeholder="Till exempel: Hitta samarbetspartner inom elektronik" className="bg-card" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Ämne</Label><Select value={need.topicId} onValueChange={(v) => setNeed({ ...need, topicId: v })}><SelectTrigger className="bg-card"><SelectValue /></SelectTrigger><SelectContent>{db.topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Vem ser behovet?</Label><Select value={need.visibility} onValueChange={(v) => setNeed({ ...need, visibility: v as "iuc" | "all" })}><SelectTrigger className="bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="iuc">Endast IUC Syd</SelectItem><SelectItem value="all">Alla medlemmar</SelectItem></SelectContent></Select></div>
            </div>
            <Button type="submit">Lägg till</Button>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h3 className="font-semibold">Kontaktpersoner</h3>
            <p className="text-sm text-muted-foreground">Andra medlemmar ser bara huvudkontakten. Namn, roll och e-post visas först när både företaget och personen har gett samtycke.</p>
            <ul className="mt-4 space-y-3">
              {people.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <Initials text={p.initials} />
                  <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-sm text-muted-foreground">{p.title}</p></div>
                  {p.status === "pending" ? <Tag variant="warn">Väntar på godkännande</Tag> : p.isMainContact ? <Tag variant="solid">Huvudkontakt</Tag> : p.consent ? <Tag>Visas för medlemmar</Tag> : <Tag variant="outline">Visas inte</Tag>}
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={p.consent} disabled={p.id !== me.id} onCheckedChange={(v) => actions.setConsent(p.id, v)} />Samtycke
                  </label>
                </li>
              ))}
              {suggestions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 opacity-70">
                  <Initials text={s.name.split(" ").map((x) => x[0]).join("").slice(0, 2)} />
                  <div className="flex-1"><p className="font-medium">{s.name}</p><p className="text-sm text-muted-foreground">{s.title}</p></div>
                  <Tag variant="warn">Förslag skickat</Tag>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Du kan bara ändra ditt eget samtycke.</p>
          </Panel>

          <Panel>
            <h3 className="font-semibold">Föreslå ny kontaktperson</h3>
            <p className="text-sm text-muted-foreground">IUC Syd granskar förslaget och godkänner vem som får inloggning till portalen.</p>
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(e) => {
              e.preventDefault(); actions.suggestContact(sug); setSug({ name: "", title: "", phone: "", email: "" }); toast.success("Förslaget är skickat till IUC Syd.");
            }}>
              <div className="space-y-1.5"><Label>Namn</Label><Input required value={sug.name} onChange={(e) => setSug({ ...sug, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Yrkestitel eller roll</Label><Input required value={sug.title} onChange={(e) => setSug({ ...sug, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Telefon</Label><Input value={sug.phone} onChange={(e) => setSug({ ...sug, phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>E-post</Label><Input required type="email" value={sug.email} onChange={(e) => setSug({ ...sug, email: e.target.value })} /></div>
              <div className="sm:col-span-2"><Button type="submit">Skicka förslag</Button></div>
            </form>
          </Panel>

          <Panel>
            <h3 className="font-semibold">Deltar i och anmäld till</h3>
            <ul className="mt-3 space-y-3">
              {parts.map((p) => <li key={p.id} className="flex items-center justify-between"><div><p className="font-medium">{p.title}</p><p className="text-sm text-muted-foreground">{p.detail}</p></div><Tag>{p.status}</Tag></li>)}
            </ul>
            <Tag variant="warn" className="mt-4">Årssummering kommer senare</Tag>
          </Panel>
        </div>
      </div>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-background">
          <DialogHeader><DialogTitle>Förhandsgranskning</DialogTitle><DialogDescription>Så här ser andra medlemmar ert företagskort.</DialogDescription></DialogHeader>
          <CompanyCard company={company} />
        </DialogContent>
      </Dialog>
    </>
  );
}
