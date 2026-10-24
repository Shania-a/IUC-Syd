import { createFileRoute, Link } from "@/lib/router-bridge";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { PageHeader, Tag } from "@/components/portal/bits";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/foretag/")({
  head: () => ({
    meta: [
      { title: "Företag · IUC Syd Medlemsportal" },
      { name: "description", content: "Katalog över IUC Syds medlemsföretag med behov, deltagande och kontaktpersoner." },
      { property: "og:title", content: "Företag · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Hitta andra medlemsföretag och ta kontakt." },
    ],
  }),
  component: () => <AppShell><Directory /></AppShell>,
});

function Directory() {
  const { db, lookup } = useStore();
  const [q, setQ] = useState("");
  const [muni, setMuni] = useState("all");
  const [ind, setInd] = useState("all");
  const munis = [...new Set(db.companies.map((c) => c.municipality))];
  const inds = [...new Set(db.companies.map((c) => c.industry))];
  const list = db.companies.filter((c) => {
    const needs = db.needs.filter((n) => n.companyId === c.id && n.visibility === "all");
    const s = q.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(s) || c.industry.toLowerCase().includes(s) || needs.some((n) => n.title.toLowerCase().includes(s) || lookup.topic(n.topicId)?.name.toLowerCase().includes(s));
    return matchQ && (muni === "all" || c.municipality === muni) && (ind === "all" || c.industry === ind);
  });

  return (
    <>
      <PageHeader title="Medlemsföretag" lead="Hitta andra medlemsföretag, se vad de behöver och vad de är med i, och ta kontakt." />
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_200px_220px]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök företag eller ämne..." className="h-11 bg-card" />
        <Select value={muni} onValueChange={setMuni}><SelectTrigger className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alla kommuner</SelectItem>{munis.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
        <Select value={ind} onValueChange={setInd}><SelectTrigger className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alla branscher</SelectItem>{inds.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const needs = db.needs.filter((n) => n.companyId === c.id && n.visibility === "all");
          return (
            <Link key={c.id} to="/foretag/$slug" params={{ slug: c.slug }} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-display font-bold text-primary-foreground">{c.initials}</span>
                <div><p className="font-semibold group-hover:underline">{c.name}</p><p className="text-sm text-muted-foreground">{c.municipality} · {c.industry}</p></div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{needs.slice(0, 3).map((n) => <Tag key={n.id}>{lookup.topic(n.topicId)?.name}</Tag>)}</div>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-muted-foreground">Inga företag matchar.</p>}
    </>
  );
}
