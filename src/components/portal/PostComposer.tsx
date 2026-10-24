import { useNavigate } from "@/lib/router-bridge";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { POST_TYPES, useStore } from "@/lib/store";
import type { PostType } from "@/lib/strapi/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eyebrow, Initials } from "./bits";
import { cn } from "@/lib/utils";

export function PostComposer({ id }: { id?: string }) {
  const { me, db, actions } = useStore();
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [type, setType] = useState<PostType>("fraga");
  const [topicId, setTopicId] = useState("t-aut");
  const [audience, setAudience] = useState<"all" | "iuc">("all");

  if (!me || me.role !== "member") return null;

  const submit = () => {
    if (audience === "iuc") {
      navigate({ to: "/kontakt", search: { amne: topicId, text: body } });
      return;
    }
    actions.createPost({ type, topicId, body: body.trim() });
    setBody("");
    toast.success("Inlägget är publicerat i communityt.");
  };

  return (
    <div id={id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex gap-3">
        <Initials text={me.initials} />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Ställ en fråga, beskriv en utmaning, dela en erfarenhet eller sök samarbete..." className="bg-muted/50" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Eyebrow className="mb-1.5">Typ av inlägg</Eyebrow>
          <Select value={type} onValueChange={(v) => setType(v as PostType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{POST_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Eyebrow className="mb-1.5">Ämne</Eyebrow>
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{db.topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Eyebrow className="mb-1.5 mt-4">Vem ska se inlägget?</Eyebrow>
      <div className="inline-flex rounded-lg border border-border p-0.5">
        {(["all", "iuc"] as const).map((a) => (
          <button key={a} onClick={() => setAudience(a)} className={cn("inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium", audience === a ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
            {a === "iuc" && <Lock className="h-3 w-3" />}{a === "all" ? "Alla godkända medlemmar" : "Endast IUC Syd"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {audience === "all" ? "Öppet: alla godkända medlemsföretag kan läsa och kommentera. IUC Syd kan moderera." : "Privat: skickas som privat meddelande. Endast IUC Syd ser det."}
      </p>
      <div className="mt-4 flex justify-end">
        <Button size="lg" disabled={!body.trim()} onClick={submit}>{audience === "all" ? "Publicera i communityt" : "Fortsätt till privat meddelande"}</Button>
      </div>
    </div>
  );
}
