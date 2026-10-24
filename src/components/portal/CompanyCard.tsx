import { Link } from "@/lib/router-bridge";
import { Mail, Phone } from "lucide-react";
import { useStore, visibleContacts } from "@/lib/store";
import type { Company } from "@/lib/strapi/types";
import { Button } from "@/components/ui/button";
import { Eyebrow, Initials, Panel, Tag } from "./bits";

/** Företagskortet som andra medlemmar ser (K35–K44). Endast samtyckta kontakter och publika behov. */
export function CompanyCard({ company }: { company: Company }) {
  const { db, lookup } = useStore();
  const contacts = visibleContacts(db.members, company.id);
  const main = contacts.find((c) => c.isMainContact) ?? contacts[0];
  const needs = db.needs.filter((n) => n.companyId === company.id && n.visibility === "all");
  const parts = db.participations.filter((p) => p.companyId === company.id);
  const posts = db.posts.filter((p) => p.companyId === company.id && p.status === "published");
  const commentedPostIds = new Set(
    db.comments.filter((c) => lookup.member(c.authorId)?.companyId === company.id).map((c) => c.postId),
  );
  const commented = db.posts.filter((p) => commentedPostIds.has(p.id) && p.companyId !== company.id);

  return (
    <div className="space-y-5">
      <Panel className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">{company.initials}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <p className="text-muted-foreground">{company.municipality} · {company.industry}</p>
          </div>
          {main && (
            <Button asChild><a href={`mailto:${main.email}`}><Mail className="h-4 w-4" /> Kontakta {main.name.split(" ")[0]}</a></Button>
          )}
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed">{company.description}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{company.email}</span>
          <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{company.phone}</span>
        </div>
      </Panel>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel>
          <h3 className="font-semibold">Kontaktperson</h3>
          {main ? (
            <div className="mt-3 flex items-center gap-3">
              <Initials text={main.initials} />
              <div>
                <p className="font-medium">{main.name}</p>
                <p className="text-sm text-muted-foreground">{main.title} · <a className="underline" href={`mailto:${main.email}`}>{main.email}</a></p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Ingen kontaktperson har gett samtycke att visas ännu.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Personuppgifter visas bara efter samtycke (GDPR).</p>
        </Panel>

        <Panel>
          <h3 className="font-semibold">Deltar i och anmäld till</h3>
          <ul className="mt-3 space-y-3">
            {parts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <div><p className="font-medium">{p.title}</p><p className="text-sm text-muted-foreground">{p.detail}</p></div>
                <Tag>{p.status}</Tag>
              </li>
            ))}
            {parts.length === 0 && <p className="text-sm text-muted-foreground">Inget registrerat deltagande.</p>}
          </ul>
        </Panel>

        <Panel>
          <h3 className="font-semibold">Behov och utmaningar</h3>
          <ul className="mt-3 space-y-3">
            {needs.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-2">
                <span>{n.title}</span><Tag>{lookup.topic(n.topicId)?.name}</Tag>
              </li>
            ))}
            {needs.length === 0 && <p className="text-sm text-muted-foreground">Inga publika behov.</p>}
          </ul>
        </Panel>

        <Panel>
          <h3 className="font-semibold">Engagemang i communityt</h3>
          <ul className="mt-3 space-y-3">
            {posts.map((p) => (
              <li key={p.id}>
                <p className="line-clamp-1 font-medium">{p.body}</p>
                <p className="text-sm text-muted-foreground">Eget inlägg · {db.comments.filter((c) => c.postId === p.id && c.status === "published").length} kommentarer · <Link to="/community" hash={`post-${p.id}`} className="text-primary underline">Öppna inlägget</Link></p>
              </li>
            ))}
            {commented.map((p) => (
              <li key={p.id}>
                <p className="line-clamp-1 font-medium">{p.body}</p>
                <p className="text-sm text-muted-foreground">Kommentar på {lookup.company(p.companyId)?.name}s inlägg · <Link to="/community" hash={`post-${p.id}`} className="text-primary underline">Öppna inlägget</Link></p>
              </li>
            ))}
            {posts.length + commented.length === 0 && <Eyebrow>Inget engagemang ännu</Eyebrow>}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
