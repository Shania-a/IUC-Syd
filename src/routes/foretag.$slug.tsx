import { createFileRoute, Link } from "@/lib/router-bridge";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { CompanyCard } from "@/components/portal/CompanyCard";

export const Route = createFileRoute("/foretag/$slug")({
  head: () => ({
    meta: [
      { title: "Företagskort · IUC Syd Medlemsportal" },
      { name: "description", content: "Företagskort med kontaktperson, behov och deltagande i IUC Syds projekt och event." },
      { property: "og:title", content: "Företagskort · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Se vad medlemsföretaget behöver och vad de deltar i." },
    ],
  }),
  component: () => <AppShell><CompanyPage /></AppShell>,
});

function CompanyPage() {
  const { slug } = Route.useParams();
  const { db } = useStore();
  const company = db.companies.find((c) => c.slug === slug);
  return (
    <>
      <Link to="/foretag" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Alla företag</Link>
      {company ? <CompanyCard company={company} /> : <p>Företaget hittades inte.</p>}
    </>
  );
}
