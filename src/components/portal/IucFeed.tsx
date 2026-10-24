import { ExternalLink, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import type { EventItem } from "@/lib/strapi/types";
import { Button } from "@/components/ui/button";
import { Tag } from "./bits";

const day = (d: string) => new Date(d).getDate();
const mon = (d: string) => new Date(d).toLocaleDateString("sv-SE", { month: "short" }).replace(".", "").toUpperCase();
const short = (d: string) => new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }).replace(".", "");

export function EventRow({ e }: { e: EventItem }) {
  const { lookup } = useStore();
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3">
      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-accent">
        <span className="font-display text-xl font-bold leading-none">{day(e.date)}</span>
        <span className="font-mono text-[10px]">{mon(e.date)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{e.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Tag>{lookup.topic(e.topicId)?.name}</Tag>{e.location}
        </div>
      </div>
      <Button asChild variant="outline"><a href={e.registrationUrl} target="_blank" rel="noreferrer">{e.registrationLabel} <ExternalLink className="h-3.5 w-3.5" /></a></Button>
    </div>
  );
}

/** K9–K15 · IUC Syds officiella yta, separerad från communityt. */
export function IucFeed() {
  const { db } = useStore();
  const news = db.news.filter((n) => n.state === "published");
  const pinnedNews = news.filter((n) => n.pinned);
  const pinnedEvent = db.events.find((e) => e.pinned && e.state === "published");
  const pinned = pinnedNews[0];
  const otherNews = news.filter((n) => !n.pinned).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const events = db.events.filter((e) => e.state === "published" && !e.pinned).sort((a, b) => a.date.localeCompare(b.date));
  const offers = db.offers.filter((o) => o.state === "published");

  return (
    <section className="overflow-hidden rounded-2xl border border-panel bg-card shadow-sm">
      <div className="flex items-center justify-between bg-panel px-6 py-4 text-panel-foreground">
        <h2 className="text-xl font-semibold">Från IUC Syd</h2>
        <span className="font-mono text-[11px] uppercase tracking-widest opacity-80">Publiceras av IUC Syd</span>
      </div>
      <div className="space-y-8 p-6">
        {pinned && (
          <div className="rounded-xl border border-primary/40 bg-accent p-5">
            <span className="inline-flex items-center gap-1 rounded-full bg-panel px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-panel-foreground"><Star className="h-3 w-3" /> Fäst överst</span>
            <h3 className="mt-3 text-2xl font-semibold">{pinned.title}</h3>
            <p className="mt-2 text-muted-foreground">{pinned.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild><a href={pinnedEvent?.registrationUrl ?? "#"} target="_blank" rel="noreferrer">Läs mer och anmäl</a></Button>
              {pinnedEvent?.closesAt && <Tag variant="warn">Anmälan stänger {short(pinnedEvent.closesAt)}</Tag>}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">Medlemsnyheter</h3>
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {otherNews.map((n) => (
              <li key={n.id} className="grid grid-cols-[4.5rem_1fr] gap-3 py-4">
                <span className="font-mono text-sm text-muted-foreground">{short(n.date)}</span>
                <div><p className="font-semibold">{n.title}</p><p className="text-sm text-muted-foreground">{n.summary}</p></div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Event och aktiviteter</h3>
          <div className="mt-3 space-y-3">{events.map((e) => <EventRow key={e.id} e={e} />)}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((o) => (
            <div key={o.id} className="rounded-xl border border-border p-5">
              <Tag variant={o.kind === "kommande" ? "warn" : "soft"}>{o.kind === "kommande" ? "Kommande medlemstjänster" : "Stöd och erbjudanden"}</Tag>
              <h4 className="mt-3 text-lg font-semibold">{o.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
