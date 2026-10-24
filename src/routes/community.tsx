import { createFileRoute, Link } from "@/lib/router-bridge";
import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { PostCard } from "@/components/portal/PostCard";
import { PostComposer } from "@/components/portal/PostComposer";
import { Eyebrow, Panel, Tag } from "@/components/portal/bits";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community · IUC Syd Medlemsportal" },
      { name: "description", content: "Frågor, utmaningar och samarbeten mellan IUC Syds medlemsföretag." },
      { property: "og:title", content: "Community · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Sök, filtrera och delta i samtalet mellan medlemsföretagen." },
    ],
  }),
  component: () => <AppShell><Community /></AppShell>,
});

type View = "all" | "iuc" | "samarbete" | "mine";

function Community() {
  const { db, me, lookup } = useStore();
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("all");
  const [topics, setTopics] = useState<string[]>([]);

  const posts = useMemo(() => db.posts
    .filter((p) => p.status === "published")
    .filter((p) => view === "all" || (view === "iuc" && p.type === "fraga-iuc") || (view === "samarbete" && p.type === "samarbete") || (view === "mine" && p.authorId === me?.id))
    .filter((p) => topics.length === 0 || topics.includes(p.topicId))
    .filter((p) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return p.body.toLowerCase().includes(s) || lookup.member(p.authorId)?.name.toLowerCase().includes(s) || lookup.company(p.companyId)?.name.toLowerCase().includes(s);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [db.posts, view, topics, q, me, lookup]);

  const pinnedEvent = db.events.find((e) => e.pinned && e.state === "published");
  const pinnedNews = db.news.find((n) => !n.pinned && n.state === "published");
  const nextEvent = db.events.filter((e) => !e.pinned && e.state === "published").sort((a, b) => a.date.localeCompare(b.date))[0];
  const offer = db.offers.find((o) => o.kind === "erbjudande");

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr_300px]">
      <aside className="space-y-6">
        <div><Eyebrow className="mb-2">Sök</Eyebrow><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök i inlägg..." className="bg-card" /></div>
        <div>
          <Eyebrow className="mb-2">Visa</Eyebrow>
          <RadioGroup value={view} onValueChange={(v) => setView(v as View)} className="gap-2">
            {([["all", "Alla inlägg"], ["iuc", "Frågor till IUC Syd"], ["samarbete", "Söker samarbete"], ["mine", "Mina inlägg"]] as const).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><RadioGroupItem value={v} />{l}</label>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Eyebrow className="mb-2">Ämnen</Eyebrow>
          <div className="space-y-2">
            {db.topics.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={topics.includes(t.id)} onCheckedChange={(c) => setTopics((s) => c ? [...s, t.id] : s.filter((x) => x !== t.id))} />{t.name}
              </label>
            ))}
          </div>
          {topics.length > 0 && <button onClick={() => setTopics([])} className="mt-3 text-sm text-primary underline">Rensa ämnen</button>}
        </div>
      </aside>

      <section className="space-y-5">
        <h1 className="text-3xl font-bold">Community</h1>
        <PostComposer />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Visar {posts.length} inlägg</span><Eyebrow>Senaste först</Eyebrow>
        </div>
        {posts.map((p) => <PostCard key={p.id} post={p} defaultOpen={p.id === "p1"} />)}
        {posts.length === 0 && <Panel><p className="text-muted-foreground">Inga inlägg matchar filtret.</p></Panel>}
      </section>

      <aside className="space-y-5">
        <Panel>
          <h3 className="font-semibold">Fäst av IUC Syd</h3><Eyebrow>Visas alltid överst</Eyebrow>
          <div className="mt-4 space-y-4">
            {pinnedEvent && <div><Tag>Event</Tag><p className="mt-1 font-semibold">{pinnedEvent.title}</p><a href={pinnedEvent.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">{pinnedEvent.registrationLabel} <ExternalLink className="h-3 w-3" /></a></div>}
            {pinnedNews && <div><Tag>Medlemsnyhet</Tag><p className="mt-1 font-semibold">{pinnedNews.title}</p></div>}
          </div>
        </Panel>
        <Panel>
          <h3 className="font-semibold">Från IUC Syd</h3>
          {nextEvent && <div className="mt-3"><Tag>Event</Tag><p className="mt-1 font-semibold">{nextEvent.title}</p><p className="text-sm text-muted-foreground">{nextEvent.location}</p></div>}
          {offer && <div className="mt-3"><Tag variant="warn">Stöd och erbjudanden</Tag><p className="mt-1 font-semibold">{offer.title}</p></div>}
        </Panel>
        {me?.role === "member" && (
          <Panel>
            <h3 className="font-semibold">Privat kontakt</h3>
            <p className="mt-1 text-sm text-muted-foreground">Behov eller frågor som bara ska till IUC Syd. Andra medlemmar ser inte meddelandet.</p>
            <Button asChild className="mt-3 w-full" variant="outline"><Link to="/kontakt">Skicka privat meddelande</Link></Button>
          </Panel>
        )}
        <Panel>
          <h3 className="font-semibold">Företag att möta</h3>
          <ul className="mt-3 space-y-3">
            {db.companies.filter((c) => c.id !== me?.companyId).slice(0, 2).map((c) => (
              <li key={c.id}><Link to="/foretag/$slug" params={{ slug: c.slug }} className="font-semibold hover:underline">{c.name}</Link><p className="text-sm text-muted-foreground">{c.municipality} · {c.industry}</p></li>
            ))}
          </ul>
          <Link to="/foretag" className="mt-3 inline-block text-sm text-primary underline">Se alla medlemsföretag</Link>
        </Panel>
      </aside>
    </div>
  );
}
