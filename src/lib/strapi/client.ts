/**
 * API-klientlager för en extern Strapi v5-instans.
 *
 * Sätt VITE_STRAPI_URL (t.ex. https://cms.iucsyd.se) för att gå mot riktig Strapi.
 * Utan den körs prototypen helt på lokal testdata (se store.tsx).
 *
 * Endpoints följer Strapis REST-konvention: /api/<pluralName>
 * med filter, sortering och populate via query-parametrar.
 */
import type {
  Comment, Company, EventItem, Member, Need, News, Offer, Participation,
  Post, PrivateMessage, Report, Topic, UserSuggestion,
} from "./types";

export const STRAPI_URL: string | undefined = import.meta.env["VITE_STRAPI_URL"];
export const isStrapiConfigured = false; // Demoändringar får aldrig skickas till Strapi. Företag läses separat via api/companies.js.

/** Samlingarnas REST-sökvägar, kopplade till krav i K1–K61. */
export const ENDPOINTS = {
  topics: "/api/amnen", // K4–K5
  companies: "/api/companies", // K35–K41, K45–K49
  contacts: "/api/kontaktpersoner", // K35–K42
  users: "/api/users", // K29–K31, K33 (users-permissions)
  register: "/api/auth/local/register", // K29
  login: "/api/auth/local", // K30
  suggestions: "/api/anvandarforslag", // K32, K34
  posts: "/api/inlagg", // K1–K6
  comments: "/api/kommentarer", // K1–K3
  reports: "/api/anmalningar", // K24 (egen kod)
  messages: "/api/privata-meddelanden", // K7–K8 (egen kod för läsregler)
  news: "/api/nyheter", // K9–K15, K19–K21
  events: "/api/events", // K25–K28
  offers: "/api/erbjudanden", // K9–K14
  upcoming: "/api/kommande-tjanster", // K9–K14
  needs: "/api/behov", // K50
  participations: "/api/deltaganden", // K43
} as const;

let jwt: string | null = null;
export const setJwt = (token: string | null) => (jwt = token);

type Query = Record<string, string | number | boolean | undefined>;

async function request<T>(path: string, init: RequestInit = {}, query?: Query): Promise<T> {
  if (!STRAPI_URL) throw new Error("Strapi är inte konfigurerat (VITE_STRAPI_URL saknas)");
  const url = new URL(path, STRAPI_URL);
  Object.entries(query ?? {}).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

interface StrapiList<T> { data: T[]; meta: { pagination?: { total: number } } }
interface StrapiOne<T> { data: T }

function collection<T>(path: string) {
  return {
    list: (query?: Query) => request<StrapiList<T>>(path, {}, { populate: "*", ...query }).then((r) => r.data),
    get: (id: string) => request<StrapiOne<T>>(`${path}/${id}`, {}, { populate: "*" }).then((r) => r.data),
    create: (data: Partial<T>) => request<StrapiOne<T>>(path, { method: "POST", body: JSON.stringify({ data }) }).then((r) => r.data),
    update: (id: string, data: Partial<T>) => request<StrapiOne<T>>(`${path}/${id}`, { method: "PUT", body: JSON.stringify({ data }) }).then((r) => r.data),
    remove: (id: string) => request<void>(`${path}/${id}`, { method: "DELETE" }),
  };
}

export const strapi = {
  auth: {
    login: (identifier: string, password: string) =>
      request<{ jwt: string; user: Member }>(ENDPOINTS.login, { method: "POST", body: JSON.stringify({ identifier, password }) }),
    register: (payload: { username: string; email: string; password: string; name: string; phone: string; title: string; company: string; consent: boolean }) =>
      request<{ user: Member }>(ENDPOINTS.register, { method: "POST", body: JSON.stringify(payload) }),
  },
  topics: collection<Topic>(ENDPOINTS.topics),
  companies: collection<Company>(ENDPOINTS.companies),
  users: collection<Member>(ENDPOINTS.users),
  suggestions: collection<UserSuggestion>(ENDPOINTS.suggestions),
  /** K4–K5: filter[topic][slug][$eq]=automation&filters[body][$containsi]=erp */
  posts: collection<Post>(ENDPOINTS.posts),
  comments: collection<Comment>(ENDPOINTS.comments),
  reports: collection<Report>(ENDPOINTS.reports),
  messages: collection<PrivateMessage>(ENDPOINTS.messages),
  /** K15: sort=pinned:desc,date:desc · K19: status=draft|published */
  news: collection<News>(ENDPOINTS.news),
  events: collection<EventItem>(ENDPOINTS.events),
  offers: collection<Offer>(ENDPOINTS.offers),
  needs: collection<Need>(ENDPOINTS.needs),
  participations: collection<Participation>(ENDPOINTS.participations),
};

/** Hjälpare för Strapis filtersyntax. */
export const postFilters = (opts: { topicSlugs?: string[]; type?: string; q?: string; authorId?: string }): Query => {
  const q: Query = { sort: "createdAt:desc" };
  opts.topicSlugs?.forEach((s, i) => (q[`filters[topic][slug][$in][${i}]`] = s));
  if (opts.type) q["filters[type][$eq]"] = opts.type;
  if (opts.q) q["filters[body][$containsi]"] = opts.q;
  if (opts.authorId) q["filters[author][documentId][$eq]"] = opts.authorId;
  return q;
};
