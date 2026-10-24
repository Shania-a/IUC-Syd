import { createFileRoute } from "@/lib/router-bridge";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { EventRow } from "@/components/portal/IucFeed";
import { PageHeader, Panel } from "@/components/portal/bits";

export const Route = createFileRoute("/event")({
  head: () => ({
    meta: [
      { title: "Event · IUC Syd Medlemsportal" },
      { name: "description", content: "Kommande event, workshops och nätverksträffar från IUC Syd med anmälningslänkar." },
      { property: "og:title", content: "Event · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Anmäl er till IUC Syds event och aktiviteter." },
    ],
  }),
  component: () => <AppShell><Events /></AppShell>,
});

function Events() {
  const { db } = useStore();
  const events = db.events.filter((e) => e.state === "published").sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <PageHeader title="Event och aktiviteter" lead="Anmälan sker via Ungapped eller en länk från IUC Syd." />
      <div className="max-w-3xl space-y-3">{events.map((e) => <EventRow key={e.id} e={e} />)}</div>
      <Panel className="mt-8 max-w-3xl"><p className="text-sm text-muted-foreground">Koppling till Ungapped via API utreds (K27). Under tiden används anmälningslänkar.</p></Panel>
    </>
  );
}
