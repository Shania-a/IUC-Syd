import { createFileRoute, Link } from "@/lib/router-bridge";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, timeAgo, useStore } from "@/lib/store";
import { AppShell } from "@/components/portal/AppShell";
import { Initials, PageHeader, Panel, Tag } from "@/components/portal/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration · IUC Syd Medlemsportal" },
      { name: "description", content: "Godkänn användare, moderera communityt och besvara privata meddelanden." },
      { property: "og:title", content: "Administration · IUC Syd Medlemsportal" },
      { property: "og:description", content: "IUC Syds administrationsvy." },
    ],
  }),
  component: () => <AppShell roles={["admin"]}><Admin /></AppShell>,
});

function Admin() {
  const { db, lookup, actions } = useStore();
  const [q, setQ] = useState("");
  const pending = db.members.filter((m) => m.status === "pending" || m.status === "blocked" || (m.companyId && m.registeredAt > new Date(Date.now() - 4 * 86400_000).toISOString()));
  const sugg = db.suggestions.filter((s) => s.status === "pending");
  const reports = db.reports.filter((r) => !r.resolved);
  const pendingComments = db.comments.filter((c) => c.status === "pending");
  const unanswered = db.messages.filter((m) => m.status !== "answered");
  const newNeeds = db.needs.filter((n) => n.createdAt > new Date(Date.now() - 14 * 86400_000).toISOString());
  const iucQuestions = db.posts.filter((p) => p.type === "fraga-iuc" && !p.iucAnswer && p.status === "published");
  const [openMsg, setOpenMsg] = useState<string | null>(unanswered[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const msg = db.messages.find((m) => m.id === openMsg);

  const stats = [
    ["Användare att godkänna", db.members.filter((m) => m.status === "pending").length + sugg.length],
    ["Inlägg att granska", reports.length + pendingComments.length],
    ["Obesvarade privata meddelanden", unanswered.length],
    ["Nya identifierade behov", newNeeds.length],
  ] as const;

  const s = q.toLowerCase();
  const hits = q ? [
    ...db.members.filter((m) => m.name.toLowerCase().includes(s)).map((m) => `Användare: ${m.name}`),
    ...db.companies.filter((c) => c.name.toLowerCase().includes(s)).map((c) => `Företag: ${c.name}`),
    ...db.posts.filter((p) => p.body.toLowerCase().includes(s)).map((p) => `Inlägg: ${p.body.slice(0, 60)}…`),
  ] : [];

  return (
    <>
      <PageHeader title="Översikt" lead="Det som väntar på IUC Syd just nu">
        <div className="relative w-80">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök användare, företag, inlägg..." className="bg-card" />
          {hits.length > 0 && <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover p-1 text-sm shadow">{hits.slice(0, 8).map((h) => <li key={h} className="truncate px-2 py-1">{h}</li>)}</ul>}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <Panel key={l}><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-4xl font-bold">{v}</p></Panel>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold">Användare att godkänna</h2>
          <p className="text-sm text-muted-foreground">Nya konton har ingen åtkomst förrän IUC Syd godkänner</p>
          <Table className="mt-3">
            <TableHeader><TableRow><TableHead>Namn och roll</TableHead><TableHead>Företag</TableHead><TableHead>Registrerad</TableHead><TableHead className="text-right">Åtgärd</TableHead></TableRow></TableHeader>
            <TableBody>
              {pending.map((m) => (
                <TableRow key={m.id}>
                  <TableCell><div className="flex items-center gap-2"><Initials text={m.initials} size="sm" /><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.title}</p></div></div></TableCell>
                  <TableCell>{lookup.company(m.companyId)?.name}</TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(m.registeredAt)}</TableCell>
                  <TableCell className="text-right">
                    {m.status === "pending" ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" onClick={() => { actions.setUserStatus(m.id, "approved"); toast.success(`${m.name} är godkänd. E-post skickas.`); }}>Godkänn</Button>
                        <Button size="sm" variant="outline" onClick={() => actions.setUserStatus(m.id, "blocked")}>Blockera</Button>
                      </div>
                    ) : <Tag variant={m.status === "blocked" ? "danger" : "soft"}>{m.status === "blocked" ? "Blockerad" : "Godkänd"}</Tag>}
                  </TableCell>
                </TableRow>
              ))}
              {sugg.map((sg) => (
                <TableRow key={sg.id}>
                  <TableCell><p className="font-medium">{sg.name}</p><p className="text-xs text-muted-foreground">{sg.title} · förslag från {lookup.member(sg.suggestedById)?.name}</p></TableCell>
                  <TableCell>{lookup.company(sg.companyId)?.name}</TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(sg.createdAt)}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1">
                    <Button size="sm" onClick={() => { actions.approveSuggestion(sg.id); toast.success("Konto skapat."); }}>Skapa konto</Button>
                    <Button size="sm" variant="outline" onClick={() => actions.rejectSuggestion(sg.id)}>Avslå</Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel>
          <div className="flex items-center gap-2"><h2 className="flex-1 text-lg font-semibold">Privata meddelanden</h2><Tag variant="warn">Endast IUC Syd ser dessa</Tag></div>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1.2fr]">
            <ul className="space-y-2">
              {db.messages.map((m) => {
                const sender = lookup.member(m.senderId);
                return (
                  <li key={m.id}>
                    <button onClick={() => { setOpenMsg(m.id); actions.markMessageRead(m.id); }} className={cn("w-full rounded-lg border p-3 text-left", openMsg === m.id ? "border-primary bg-accent" : "border-border hover:bg-muted")}>
                      <p className="font-medium underline-offset-2">{m.subject}</p>
                      <p className="text-xs text-muted-foreground">{sender?.name} · {lookup.company(m.companyId)?.name} · {timeAgo(m.createdAt)}</p>
                      <div className="mt-1 flex gap-1"><Tag variant={m.status === "new" ? "warn" : m.status === "answered" ? "soft" : "outline"}>{m.status === "new" ? "Ny" : m.status === "answered" ? "Besvarad" : "Öppnad"}</Tag><Tag>{lookup.topic(m.topicId)?.name}</Tag></div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {msg && (
              <div className="rounded-lg bg-muted p-4">
                <p className="font-semibold">{msg.subject}</p>
                <p className="mt-2 text-sm">{msg.body}</p>
                {msg.replies.map((r, i) => <div key={i} className="mt-3 rounded-md bg-card p-3 text-sm"><p className="text-xs font-semibold">{lookup.member(r.authorId)?.name} · {formatDate(r.createdAt)}</p>{r.body}</div>)}
                <Textarea className="mt-3 bg-card" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Skriv ett svar..." />
                <Button className="mt-2" disabled={!reply.trim()} onClick={() => { actions.replyMessage(msg.id, reply.trim()); setReply(""); toast.success("Svaret är skickat."); }}>Skicka svar</Button>
                <p className="mt-2 text-xs text-muted-foreground">Medlemmen får svaret i portalen och via e-post.</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Moderering av community</h2>
          <p className="text-sm text-muted-foreground">Inlägg som anmäls eller väntar på granskning</p>
          <ul className="mt-3 space-y-3">
            {reports.map((r) => {
              const target = r.targetType === "post" ? db.posts.find((p) => p.id === r.targetId) : db.comments.find((c) => c.id === r.targetId);
              const author = target && lookup.member(target.authorId);
              return (
                <li key={r.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm"><Tag variant="danger">Anmäld av medlem</Tag>{r.targetType === "post" ? "Inlägg" : "Kommentar"} av {author?.name} · {lookup.company(author?.companyId)?.name}</div>
                  <p className="mt-2 line-clamp-2 text-sm">{target?.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Anledning: {r.reason}</p>
                  <div className="mt-2 flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => actions.resolveReport(r.id, "keep")}>Behåll</Button>
                    <Button size="sm" variant="outline" onClick={() => actions.resolveReport(r.id, "unpublish")}>Avpublicera</Button>
                    <Button size="sm" variant="destructive" onClick={() => actions.resolveReport(r.id, "delete")}>Ta bort</Button>
                  </div>
                </li>
              );
            })}
            {pendingComments.map((c) => {
              const a = lookup.member(c.authorId);
              return (
                <li key={c.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm"><Tag variant="warn">Väntar på granskning</Tag>Kommentar av {a?.name} · {lookup.company(a?.companyId)?.name}</div>
                  <p className="mt-2 text-sm">{c.body}</p>
                  <div className="mt-2 flex gap-1">
                    <Button size="sm" onClick={() => actions.moderateComment(c.id, "approve")}>Godkänn</Button>
                    <Button size="sm" variant="outline" onClick={() => actions.moderateComment(c.id, "unpublish")}>Avpublicera</Button>
                    <Button size="sm" variant="destructive" onClick={() => actions.moderateComment(c.id, "delete")}>Ta bort</Button>
                  </div>
                </li>
              );
            })}
            {db.posts.filter((p) => p.status === "unpublished").map((p) => (
              <li key={p.id} className="rounded-lg border border-dashed border-border p-3 text-sm">
                <Tag variant="outline">Avpublicerat</Tag><p className="mt-2 line-clamp-1">{p.body}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => actions.setPostStatus(p.id, "published")}>Återpublicera</Button>
              </li>
            ))}
            {reports.length + pendingComments.length === 0 && <p className="text-sm text-muted-foreground">Inget att granska just nu.</p>}
          </ul>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Frågor till IUC Syd i communityt</h2>
          <p className="text-sm text-muted-foreground">Svara öppet så att alla medlemmar ser svaret (K6).</p>
          <ul className="mt-3 space-y-3">
            {iucQuestions.map((p) => <IucAnswer key={p.id} postId={p.id} body={p.body} author={lookup.member(p.authorId)?.name ?? ""} />)}
            {iucQuestions.length === 0 && <p className="text-sm text-muted-foreground">Alla frågor är besvarade.</p>}
          </ul>
        </Panel>

        <Panel>
          <div className="flex items-center"><h2 className="flex-1 text-lg font-semibold">Företag och huvudkontakt</h2><Button size="sm" variant="outline" onClick={() => toast("Nya företag läggs in i Strapi tills kopplingen till IUC VS är klar.")}>Nytt företag</Button></div>
          <Table className="mt-3">
            <TableHeader><TableRow><TableHead>Företag</TableHead><TableHead>Huvudkontakt</TableHead><TableHead>Användare</TableHead></TableRow></TableHeader>
            <TableBody>
              {db.companies.map((c) => {
                const ms = db.members.filter((m) => m.companyId === c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell><Link to="/foretag/$slug" params={{ slug: c.slug }} className="font-medium hover:underline">{c.name}</Link></TableCell>
                    <TableCell>{ms.find((m) => m.isMainContact)?.name ?? "–"}</TableCell>
                    <TableCell className="text-muted-foreground">{ms.filter((m) => m.status === "approved").length} av {ms.length} godkända</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="mt-2 text-xs text-muted-foreground">Företag och kontaktpersoner läggs in manuellt tills kopplingen till IUC VS är utredd.</p>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Samtycken (GDPR)</h2>
          <p className="text-sm text-muted-foreground">Personuppgifter visas först efter samtycke</p>
          <ul className="mt-3 divide-y divide-border">
            {db.members.filter((m) => m.companyId).map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="flex-1"><span className="font-medium">{m.name}</span> · {lookup.company(m.companyId)?.name}<br /><span className="text-xs text-muted-foreground">{m.consent ? `Samtycke givet ${m.consentDate}` : "Samtycke saknas, visas inte för andra"}</span></span>
                {m.consent ? <Tag>Visas för medlemmar</Tag> : <Button size="sm" variant="outline" onClick={() => toast.success(`Påminnelse skickad till ${m.name}.`)}>Skicka påminnelse</Button>}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Roller och behörighet</h2>
          <dl className="mt-3 divide-y divide-border text-sm">
            {[["Administratör", "Allt, inklusive användare och roller"], ["Redaktör", "Skapa, redigera och publicera nyheter, event och landningssidor"], ["Moderator", "Granska, avpublicera och ta bort community-inlägg och kommentarer"], ["Handläggare", "Läsa och besvara privata meddelanden"]].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] py-2"><dt className="font-semibold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
            ))}
          </dl>
          <h2 className="mt-6 text-lg font-semibold">Integrationer</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {[["Ungapped (event)", "API-koppling utreds. Anmälningslänk används under tiden.", "Utreds"], ["IUC VS (verksamhetssystem)", "Företag och kontaktpersoner. Manuell inmatning tills vidare.", "Utreds"], ["E-postutskick", "Bekräftelse, godkännande, svar och notiser.", "Att konfigurera"]].map(([t, d, s]) => (
              <li key={t} className="flex items-center gap-2"><div className="flex-1"><p className="font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div><Tag variant="warn">{s}</Tag></li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2"><Button asChild variant="outline"><Link to="/redaktor">Öppna redaktörsvy</Link></Button><Button asChild variant="outline"><Link to="/">Öppna portalen</Link></Button></div>
        </Panel>
      </div>
    </>
  );
}

function IucAnswer({ postId, body, author }: { postId: string; body: string; author: string }) {
  const { actions } = useStore();
  const [a, setA] = useState("");
  return (
    <li className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{author}</p>
      <p className="text-sm">{body}</p>
      <Textarea rows={2} className="mt-2" value={a} onChange={(e) => setA(e.target.value)} placeholder="Öppet svar från IUC Syd..." />
      <Button size="sm" className="mt-2" disabled={!a.trim()} onClick={() => { actions.answerPostAsIuc(postId, a.trim()); toast.success("Svaret är publicerat."); }}>Publicera svar</Button>
    </li>
  );
}
