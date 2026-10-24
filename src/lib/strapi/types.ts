/**
 * Datamodeller som speglar Strapi-samlingarna enligt kravlistan K1–K61.
 * Varje typ motsvarar en Collection Type i Strapis Content-Type Builder.
 * Fältnamn är camelCase; i Strapi v5 levereras de som `documentId` + attribut.
 */

export type ID = string;

export type Role = "member" | "editor" | "admin";

/** K4–K5 · Collection: amne (topic) */
export interface Topic {
  id: ID;
  slug: string;
  name: string;
}

/** K35–K41, K45–K49 · Collection: foretag (company) */
export interface Company {
  id: ID;
  slug: string;
  name: string;
  initials: string;
  municipality: string;
  industry: string;
  description: string;
  email: string;
  phone: string;
}

/** K29–K34, K42 · plugin users-permissions user + Collection: kontaktperson */
export interface Member {
  id: ID;
  name: string;
  initials: string;
  title: string;
  email: string;
  phone?: string | undefined;
  companyId: ID | null; // null = IUC Syd-personal
  role: Role;
  status: "pending" | "approved" | "blocked"; // Strapi: confirmed / blocked
  isMainContact: boolean;
  /** K42 · samtycke och datum */
  consent: boolean;
  consentDate?: string | undefined;
  registeredAt: string;
}

/** K32 · Collection: anvandarforslag */
export interface UserSuggestion {
  id: ID;
  companyId: ID;
  suggestedById: ID;
  name: string;
  title: string;
  phone: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export type PostType = "fraga" | "fraga-iuc" | "samarbete" | "erfarenhet" | "utmaning";

/** K1–K6 · Collection: inlagg (post) */
export interface Post {
  id: ID;
  authorId: ID;
  companyId: ID;
  type: PostType;
  topicId: ID;
  body: string;
  createdAt: string;
  status: "published" | "unpublished";
  /** K6 · öppet svar från IUC Syd */
  iucAnswer?: string | undefined;
}

/** K1–K3 · Collection: kommentar (flertrådad via parent) */
export interface Comment {
  id: ID;
  postId: ID;
  parentId: ID | null;
  authorId: ID;
  body: string;
  createdAt: string;
  status: "published" | "pending" | "unpublished";
}

/** K24 · Collection: anmalan (report) */
export interface Report {
  id: ID;
  targetType: "post" | "comment";
  targetId: ID;
  reporterId: ID;
  reason: string;
  createdAt: string;
  resolved: boolean;
}

/** K7–K8 · Collection: privat-meddelande */
export interface PrivateMessage {
  id: ID;
  senderId: ID;
  companyId: ID;
  subject: string;
  topicId: ID;
  body: string;
  createdAt: string;
  status: "new" | "read" | "answered";
  shareWithColleagues: boolean;
  replies: { authorId: ID; body: string; createdAt: string }[];
}

export type PublishState = "draft" | "published";

/** K9–K15, K19–K21 · Collection: nyhet */
export interface News {
  id: ID;
  slug: string;
  title: string;
  summary: string;
  body: string;
  date: string;
  pinned: boolean;
  state: PublishState;
  topicIds: ID[];
  updatedBy?: string | undefined;
  updatedAt?: string | undefined;
}

/** K25–K28 · Collection: event */
export interface EventItem {
  id: ID;
  slug: string;
  title: string;
  summary: string;
  date: string;
  location: string;
  topicId: ID;
  registrationUrl: string;
  registrationLabel: string;
  closesAt?: string | undefined;
  pinned: boolean;
  state: PublishState;
}

/** K9–K14 · Collection: erbjudande / kommande-tjanst */
export interface Offer {
  id: ID;
  kind: "erbjudande" | "kommande";
  title: string;
  body: string;
  state: PublishState;
}

/** K50 · Collection: behov (identifierat behov) */
export interface Need {
  id: ID;
  companyId: ID;
  title: string;
  topicId: ID;
  visibility: "all" | "iuc";
  createdAt: string;
}

/** K43 · Collection: deltagande (projekt/event) */
export interface Participation {
  id: ID;
  companyId: ID;
  title: string;
  detail: string;
  status: "DELTAR" | "ANMÄLD";
}

export interface Database {
  topics: Topic[];
  companies: Company[];
  members: Member[];
  suggestions: UserSuggestion[];
  posts: Post[];
  comments: Comment[];
  reports: Report[];
  messages: PrivateMessage[];
  news: News[];
  events: EventItem[];
  offers: Offer[];
  needs: Need[];
  participations: Participation[];
}
