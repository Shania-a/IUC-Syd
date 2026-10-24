import { createFileRoute, Link } from "@/lib/router-bridge";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { IucFeed } from "@/components/portal/IucFeed";
import { PostCard } from "@/components/portal/PostCard";
import { PostComposer } from "@/components/portal/PostComposer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Start · IUC Syd Medlemsportal" },
      { name: "description", content: "Nyheter, event och erbjudanden från IUC Syd sida vid sida med medlemscommunityt." },
      { property: "og:title", content: "Start · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Det IUC Syd vill att medlemmarna ska veta, och samtalet mellan medlemmarna." },
    ],
  }),
  component: () => <AppShell><Home /></AppShell>,
});

const QUICK_TOPICS = ["t-aut", "t-ai", "t-cyber", "t-komp", "t-hall"];

function Home() {
  const { db, me, lookup } = useStore();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const posts = useMemo(() =>
    db.posts
      .filter((p) => p.status === "published")
      .filter((p) => !topic || p.topicId === topic)
      .filter((p) => !q || p.body.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4), [db.posts, q, topic]);
  const isMember = me?.role === "member";

  return (
    <>
      <h1 className="text-4xl font-bold">Välkommen tillbaka, {me?.name.split(" ")[0]}</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted-foreground">Till vänster ser du det IUC Syd vill att medlemmarna ska veta. Till höger pågår samtalet mellan medlemmarna.</p>
      {isMember && (
        <div className="mt-6 inline-flex flex-wrap items-center gap-4 rounded-xl border border-primary/40 bg-accent p-4">
          <div><p className="font-semibold">Beskriv en utmaning eller ett behov</p><p className="text-sm text-muted-foreground">Dela i communityt eller skicka privat till IUC Syd.</p></div>
          <Button asChild size="lg"><a href="#skriv">Skriv i communityt</a></Button>
          <Button asChild size="lg" variant="outline"><Link to="/kontakt">Skicka privat</Link></Button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <IucFeed />
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Community</h2>
            <Link to="/community" className="text-sm font-semibold text-primary hover:underline">Öppna hela communityt</Link>
          </div>
          <PostComposer id="skriv" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök i community..." className="h-11 bg-card" />
          <div className="flex flex-wrap gap-2">
            {[null, ...QUICK_TOPICS].map((t) => (
              <button key={t ?? "all"} onClick={() => setTopic(t)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", topic === t ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card")}>
                {t ? lookup.topic(t)?.name : "Alla ämnen"}
              </button>
            ))}
          </div>
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
          {posts.length === 0 && <p className="text-muted-foreground">Inga inlägg matchar.</p>}
          {isMember && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-primary/60 p-5">
              <Lock className="h-5 w-5 text-primary" />
              <div className="flex-1"><p className="font-semibold">Ett behov som bara ska till IUC Syd?</p><p className="text-sm text-muted-foreground">Privat kontakt. Endast IUC Syd ser meddelandet, inte andra medlemmar.</p></div>
              <Button asChild variant="outline"><Link to="/kontakt">Skicka privat meddelande</Link></Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
