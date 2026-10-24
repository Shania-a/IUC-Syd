import { Link } from "@/lib/router-bridge";
import { Flag, MessageSquare, Reply } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { postTypeLabel, timeAgo, useStore } from "@/lib/store";
import type { Comment, Post } from "@/lib/strapi/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Initials, Tag } from "./bits";

export function ReportDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anmäl till IUC Syd</DialogTitle>
          <DialogDescription>IUC Syd granskar anmälan. Den som skrev får inte veta vem som anmälde.</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Beskriv kort varför..." rows={3} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button disabled={!reason.trim()} onClick={() => { onSubmit(reason.trim()); setReason(""); onOpenChange(false); toast.success("Tack! IUC Syd har fått din anmälan."); }}>Skicka anmälan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommentForm({ onSubmit, placeholder = "Skriv en kommentar...", autoFocus }: { onSubmit: (b: string) => void; placeholder?: string; autoFocus?: boolean }) {
  const { me } = useStore();
  const [body, setBody] = useState("");
  return (
    <form
      className="flex items-start gap-2"
      onSubmit={(e) => { e.preventDefault(); if (body.trim()) { onSubmit(body.trim()); setBody(""); } }}
    >
      <Initials text={me?.initials ?? ""} size="sm" />
      <Textarea autoFocus={autoFocus} value={body} onChange={(e) => setBody(e.target.value)} placeholder={placeholder} rows={1} className="min-h-9 flex-1 resize-none" />
      <Button type="submit" size="sm" disabled={!body.trim()}>Skicka</Button>
    </form>
  );
}

function CommentNode({ c, all, depth }: { c: Comment; all: Comment[]; depth: number }) {
  const { lookup, actions } = useStore();
  const [replying, setReplying] = useState(false);
  const [reporting, setReporting] = useState(false);
  const author = lookup.member(c.authorId);
  const company = lookup.company(author?.companyId);
  const isIuc = author && author.role !== "member";
  const children = all.filter((x) => x.parentId === c.id);
  return (
    <div className={depth > 0 ? "ml-4 border-l-2 border-border pl-4" : ""}>
      <div className={`rounded-lg p-3 ${isIuc ? "bg-accent" : "bg-muted"}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">{isIuc ? "IUC Syd" : author?.name}</span>
          {isIuc ? <Tag variant="solid">IUC Syd</Tag> : <span className="text-muted-foreground">· {company?.name}</span>}
          <span className="ml-auto text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm">{c.body}</p>
        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
          {depth < 3 && <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setReplying((r) => !r)}><Reply className="h-3 w-3" /> Svara</button>}
          <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setReporting(true)}><Flag className="h-3 w-3" /> Anmäl</button>
        </div>
      </div>
      {replying && (
        <div className="mt-2">
          <CommentForm autoFocus placeholder={`Svara ${author?.name.split(" ")[0]}...`} onSubmit={(b) => { actions.addComment(c.postId, c.id, b); setReplying(false); }} />
        </div>
      )}
      {children.length > 0 && <div className="mt-2 space-y-2">{children.map((ch) => <CommentNode key={ch.id} c={ch} all={all} depth={depth + 1} />)}</div>}
      <ReportDialog open={reporting} onOpenChange={setReporting} onSubmit={(r) => actions.report("comment", c.id, r)} />
    </div>
  );
}

export function PostCard({ post, defaultOpen = false }: { post: Post; defaultOpen?: boolean }) {
  const { db, lookup, actions } = useStore();
  const [open, setOpen] = useState(defaultOpen);
  const [reporting, setReporting] = useState(false);
  const author = lookup.member(post.authorId);
  const company = lookup.company(post.companyId);
  const topic = lookup.topic(post.topicId);
  const comments = db.comments.filter((c) => c.postId === post.id && c.status === "published");
  const roots = comments.filter((c) => !c.parentId);

  return (
    <article id={`post-${post.id}`} className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <Initials text={author?.initials ?? "?"} />
        <div className="flex-1">
          <p className="font-semibold leading-tight">{author?.name}</p>
          {company && (
            <Link to="/foretag/$slug" params={{ slug: company.slug }} className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">{company.name}</Link>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{timeAgo(post.createdAt)}</span>
      </header>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag variant={post.type === "fraga-iuc" ? "solid" : "soft"}>{postTypeLabel(post.type)}</Tag>
        {topic && <Tag>{topic.name}</Tag>}
      </div>
      <p className="mt-3 leading-relaxed">{post.body}</p>
      {post.iucAnswer && (
        <div className="mt-3 rounded-lg bg-accent p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent-foreground">Svar från IUC Syd</p>
          <p className="mt-1 text-sm">{post.iucAnswer}</p>
        </div>
      )}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <button className="inline-flex items-center gap-1 font-semibold text-primary hover:underline" onClick={() => setOpen((o) => !o)}>
          <MessageSquare className="h-4 w-4" />
          {open ? "Dölj kommentarer" : comments.length === 0 ? "Skriv den första kommentaren" : `Visa ${comments.length} ${comments.length === 1 ? "kommentar" : "kommentarer"}`}
        </button>
        <button className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => setReporting(true)}>
          <Flag className="h-3.5 w-3.5" /> Anmäl inlägg
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {roots.map((c) => <CommentNode key={c.id} c={c} all={comments} depth={0} />)}
          <div className="pt-2"><CommentForm onSubmit={(b) => actions.addComment(post.id, null, b)} /></div>
        </div>
      )}
      <ReportDialog open={reporting} onOpenChange={setReporting} onSubmit={(r) => actions.report("post", post.id, r)} />
    </article>
  );
}
