import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seed } from "./strapi/mock-data";
import { isStrapiConfigured, strapi } from "./strapi/client";
import type { Comment, Database, EventItem, Member, Need, News, Post, PrivateMessage, Role } from "./strapi/types";

const STORAGE_KEY = "iuc-portal-db-v1";
const SESSION_KEY = "iuc-portal-session-v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();
export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

/** Skickar ändringen till Strapi när en instans är konfigurerad; annars bara lokalt. */
function sync(fn: () => Promise<unknown>) {
  if (isStrapiConfigured) fn().catch((e) => console.warn("[strapi]", e));
}

const ROLE_USER: Record<Role, string> = { member: "u-anna", editor: "u-elin", admin: "u-admin" };

function useStoreValue() {
  const [db, setDb] = useState<Database>(seed);
  const [meId, setMeId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDb(JSON.parse(raw));
      setMeId(localStorage.getItem(SESSION_KEY));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (meId) localStorage.setItem(SESSION_KEY, meId);
    else localStorage.removeItem(SESSION_KEY);
  }, [meId, hydrated]);

  const me = db.members.find((m) => m.id === meId) ?? null;
  const update = useCallback((fn: (d: Database) => Database) => setDb((d) => fn(d)), []);

  const actions = useMemo(() => ({
    loadCompaniesFromStrapi(rows: Array<Record<string, any>>) {
      update(d => {
        const companies = rows.map(row => {
          const x = row.attributes || row;
          const name = String(x.name || "Okänt företag");
          return { id: `strapi-${row.documentId || row.id}`, slug: String(x.slug || ""), name,
            initials: initialsOf(name), municipality: String(x.municipality || ""),
            industry: String(x.industry || ""), description: String(x.description || ""),
            email: String(x.email || ""), phone: String(x.phone || "") };
        });
        // Demo-medlemmar är knutna till demo-företag. Behåll dem för att
        // 'Mitt företag' ska gå att demonstrera tills autentisering finns.
        const existing = d.companies.filter(c => !companies.some(real => real.slug === c.slug));
        return { ...d, companies: [...companies, ...existing] };
      });
    },
    login(email: string): { ok: boolean; error?: string } {
      const m = db.members.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
      if (!m) return { ok: false, error: "Ingen användare med den e-postadressen." };
      if (m.status === "pending") return { ok: false, error: "Kontot väntar på godkännande av IUC Syd." };
      if (m.status === "blocked") return { ok: false, error: "Kontot är blockerat. Kontakta IUC Syd." };
      setMeId(m.id);
      return { ok: true };
    },
    logout: () => setMeId(null),
    switchRole: (role: Role) => setMeId(ROLE_USER[role]),
    resetDemo() { setDb(seed); },

    apply(data: { name: string; phone: string; email: string; companyId: string; title: string; consent: boolean }) {
      const m: Member = { id: uid(), initials: initialsOf(data.name), role: "member", status: "pending", isMainContact: false, registeredAt: nowIso(), consentDate: data.consent ? nowIso().slice(0, 10) : undefined, ...data };
      update((d) => ({ ...d, members: [...d.members, m] }));
      sync(() => strapi.auth.register({ username: data.email, email: data.email, password: uid(), name: data.name, phone: data.phone, title: data.title, company: data.companyId, consent: data.consent }));
    },

    createPost(p: Pick<Post, "type" | "topicId" | "body">) {
      if (!me?.companyId) return;
      const post: Post = { id: uid(), authorId: me.id, companyId: me.companyId, createdAt: nowIso(), status: "published", ...p };
      update((d) => ({ ...d, posts: [post, ...d.posts] }));
      sync(() => strapi.posts.create(post));
    },
    addComment(postId: string, parentId: string | null, body: string) {
      if (!me) return;
      const c: Comment = { id: uid(), postId, parentId, authorId: me.id, body, createdAt: nowIso(), status: "published" };
      update((d) => ({ ...d, comments: [...d.comments, c] }));
      sync(() => strapi.comments.create(c));
    },
    report(targetType: "post" | "comment", targetId: string, reason: string) {
      if (!me) return;
      const r = { id: uid(), targetType, targetId, reporterId: me.id, reason, createdAt: nowIso(), resolved: false };
      update((d) => ({ ...d, reports: [...d.reports, r] }));
      sync(() => strapi.reports.create(r));
    },
    sendMessage(m: Pick<PrivateMessage, "subject" | "topicId" | "body" | "shareWithColleagues">, alsoNeed: boolean) {
      if (!me?.companyId) return;
      const msg: PrivateMessage = { id: uid(), senderId: me.id, companyId: me.companyId, createdAt: nowIso(), status: "new", replies: [], ...m };
      update((d) => ({
        ...d,
        messages: [msg, ...d.messages],
        needs: alsoNeed ? [...d.needs, { id: uid(), companyId: me.companyId!, title: m.subject, topicId: m.topicId, visibility: "iuc", createdAt: nowIso() }] : d.needs,
      }));
      sync(() => strapi.messages.create(msg));
    },
    replyMessage(id: string, body: string) {
      if (!me) return;
      update((d) => ({ ...d, messages: d.messages.map((m) => m.id === id ? { ...m, status: "answered", replies: [...m.replies, { authorId: me.id, body, createdAt: nowIso() }] } : m) }));
    },
    markMessageRead(id: string) {
      update((d) => ({ ...d, messages: d.messages.map((m) => m.id === id && m.status === "new" ? { ...m, status: "read" } : m) }));
    },
    answerPostAsIuc(postId: string, answer: string) {
      update((d) => ({ ...d, posts: d.posts.map((p) => p.id === postId ? { ...p, iucAnswer: answer } : p) }));
    },

    addNeed(n: Pick<Need, "title" | "topicId" | "visibility">) {
      if (!me?.companyId) return;
      const need: Need = { id: uid(), companyId: me.companyId, createdAt: nowIso(), ...n };
      update((d) => ({ ...d, needs: [...d.needs, need] }));
      sync(() => strapi.needs.create(need));
    },
    removeNeed: (id: string) => update((d) => ({ ...d, needs: d.needs.filter((n) => n.id !== id) })),
    setNeedVisibility: (id: string, visibility: Need["visibility"]) =>
      update((d) => ({ ...d, needs: d.needs.map((n) => n.id === id ? { ...n, visibility } : n) })),
    suggestContact(s: { name: string; title: string; phone: string; email: string }) {
      if (!me?.companyId) return;
      const sug = { id: uid(), companyId: me.companyId, suggestedById: me.id, status: "pending" as const, createdAt: nowIso(), ...s };
      update((d) => ({ ...d, suggestions: [...d.suggestions, sug] }));
      sync(() => strapi.suggestions.create(sug));
    },
    setConsent(memberId: string, consent: boolean) {
      update((d) => ({ ...d, members: d.members.map((m) => m.id === memberId ? { ...m, consent, consentDate: consent ? nowIso().slice(0, 10) : undefined } : m) }));
    },

    // Admin
    setUserStatus(id: string, status: Member["status"]) {
      update((d) => ({ ...d, members: d.members.map((m) => m.id === id ? { ...m, status } : m) }));
      sync(() => strapi.users.update(id, { status }));
    },
    approveSuggestion(id: string) {
      update((d) => {
        const s = d.suggestions.find((x) => x.id === id);
        if (!s) return d;
        const m: Member = { id: uid(), name: s.name, initials: initialsOf(s.name), title: s.title, email: s.email, phone: s.phone, companyId: s.companyId, role: "member", status: "approved", isMainContact: false, consent: false, registeredAt: nowIso() };
        return { ...d, suggestions: d.suggestions.map((x) => x.id === id ? { ...x, status: "approved" } : x), members: [...d.members, m] };
      });
    },
    rejectSuggestion: (id: string) => update((d) => ({ ...d, suggestions: d.suggestions.map((x) => x.id === id ? { ...x, status: "rejected" } : x) })),
    resolveReport(reportId: string, action: "keep" | "unpublish" | "delete") {
      update((d) => {
        const r = d.reports.find((x) => x.id === reportId);
        if (!r) return d;
        const reports = d.reports.map((x) => x.id === reportId ? { ...x, resolved: true } : x);
        if (action === "keep") return { ...d, reports };
        if (r.targetType === "post") {
          return action === "delete"
            ? { ...d, reports, posts: d.posts.filter((p) => p.id !== r.targetId), comments: d.comments.filter((c) => c.postId !== r.targetId) }
            : { ...d, reports, posts: d.posts.map((p) => p.id === r.targetId ? { ...p, status: "unpublished" } : p) };
        }
        return action === "delete"
          ? { ...d, reports, comments: d.comments.filter((c) => c.id !== r.targetId) }
          : { ...d, reports, comments: d.comments.map((c) => c.id === r.targetId ? { ...c, status: "unpublished" } : c) };
      });
    },
    moderateComment(id: string, action: "approve" | "unpublish" | "delete") {
      update((d) => ({
        ...d,
        comments: action === "delete" ? d.comments.filter((c) => c.id !== id)
          : d.comments.map((c) => c.id === id ? { ...c, status: action === "approve" ? "published" : "unpublished" } : c),
      }));
    },
    setPostStatus: (id: string, status: Post["status"]) => update((d) => ({ ...d, posts: d.posts.map((p) => p.id === id ? { ...p, status } : p) })),

    // Redaktör
    saveNews(n: News) {
      const item = { ...n, updatedBy: me?.name, updatedAt: nowIso() };
      update((d) => ({ ...d, news: d.news.some((x) => x.id === n.id) ? d.news.map((x) => x.id === n.id ? item : x) : [item, ...d.news] }));
      sync(() => strapi.news.update(n.id, item));
    },
    deleteNews: (id: string) => update((d) => ({ ...d, news: d.news.filter((x) => x.id !== id) })),
    saveEvent(e: EventItem) {
      update((d) => ({ ...d, events: d.events.some((x) => x.id === e.id) ? d.events.map((x) => x.id === e.id ? e : x) : [...d.events, e] }));
      sync(() => strapi.events.update(e.id, e));
    },
    deleteEvent: (id: string) => update((d) => ({ ...d, events: d.events.filter((x) => x.id !== id) })),
    newId: uid,
  }), [db.members, me, update]);

  const lookup = useMemo(() => ({
    member: (id: string) => db.members.find((m) => m.id === id),
    company: (id: string | null | undefined) => db.companies.find((c) => c.id === id),
    topic: (id: string) => db.topics.find((t) => t.id === id),
  }), [db]);

  return { db, me, hydrated, actions, lookup };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore utanför StoreProvider");
  return v;
}

/** K42 · Visa personuppgifter för andra medlemmar endast med samtycke och godkänt konto. */
export function visibleContacts(members: Member[], companyId: string) {
  return members.filter((m) => m.companyId === companyId && m.status === "approved" && m.consent);
}

/** K7–K8 · Läsregel för privata meddelanden. */
export function canReadMessage(viewer: Member, msg: PrivateMessage) {
  if (viewer.role !== "member") return true;
  if (msg.senderId === viewer.id) return true;
  return msg.shareWithColleagues && msg.companyId === viewer.companyId;
}

export const POST_TYPES: { value: Post["type"]; label: string }[] = [
  { value: "fraga", label: "Fråga" },
  { value: "fraga-iuc", label: "Fråga till IUC Syd" },
  { value: "samarbete", label: "Söker samarbete" },
  { value: "erfarenhet", label: "Erfarenhet" },
  { value: "utmaning", label: "Utmaning" },
];
export const postTypeLabel = (t: Post["type"]) => POST_TYPES.find((p) => p.value === t)?.label ?? t;

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just nu";
  if (diff < 3600) return `${Math.floor(diff / 60)} min sedan`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} tim sedan`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "igår";
  if (days < 7) return `${days} dagar sedan`;
  if (days < 14) return "förra veckan";
  return formatDate(iso);
}
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }).replace(".", "");
