import { createFileRoute, useNavigate } from "@/lib/router-bridge";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logo } from "@/components/portal/AppShell";
import { Eyebrow } from "@/components/portal/bits";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Logga in · IUC Syd Medlemsportal" },
      { name: "description", content: "Logga in eller ansök om konto i IUC Syds medlemsportal." },
      { property: "og:title", content: "Logga in · IUC Syd Medlemsportal" },
      { property: "og:description", content: "Personlig inloggning för medarbetare på IUC Syds medlemsföretag." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { db, actions } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("anna.lindqvist@hoglunds-verkstad.example");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", phone: "", email: "", title: "", companyId: "", consent: false });
  const [companyOpen, setCompanyOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const company = db.companies.find((c) => c.id === form.companyId);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-panel p-8 text-panel-foreground md:p-14">
        <div className="[&_span]:!text-panel-foreground"><Logo /></div>
        <div className="max-w-lg py-12">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Möt andra medlemmar och få information direkt från IUC Syd</h1>
          <p className="mt-5 text-lg opacity-80">Ställ frågor, beskriv era utmaningar, hitta samarbeten och se vad IUC Syd erbjuder er som medlem.</p>
          <ul className="mt-8 space-y-3">
            {["Personlig inloggning för varje medarbetare", "IUC Syd godkänner alla nya användare", "Personuppgifter visas för andra först efter samtycke"].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-accent"><Check className="h-3.5 w-3.5" /></span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest opacity-60">Ingår i medlemskapet hos IUC Syd</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-14">
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="login">Logga in</TabsTrigger>
            <TabsTrigger value="apply">Ansök om konto</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <h2 className="text-2xl font-bold">Logga in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Använd din arbetsadress.</p>
            <form className="mt-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const r = actions.login(email);
              if (!r.ok) setError(r.error!); else navigate({ to: "/" });
            }}>
              <div className="space-y-1.5"><Label htmlFor="em">E-postadress</Label><Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="pw">Lösenord</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full">Logga in</Button>
            </form>
            <div className="mt-8 rounded-lg border border-dashed border-border p-4">
              <Eyebrow>Prototyp · snabbinloggning</Eyebrow>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { actions.switchRole("member"); navigate({ to: "/" }); }}>Medlem</Button>
                <Button variant="outline" size="sm" onClick={() => { actions.switchRole("editor"); navigate({ to: "/redaktor" }); }}>Redaktör</Button>
                <Button variant="outline" size="sm" onClick={() => { actions.switchRole("admin"); navigate({ to: "/admin" }); }}>Administratör</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apply">
            {sent ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-2xl font-bold">Tack, ansökan är skickad</h2>
                <p className="mt-2 text-muted-foreground">IUC Syd granskar ansökan. Du får ett e-postmeddelande när kontot är aktiverat.</p>
                <p className="mt-4 text-sm text-muted-foreground">Tips: växla till administratör och godkänn kontot under Admin.</p>
                <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>Skicka en till</Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Ansök om konto</h2>
                <p className="mt-1 text-sm text-muted-foreground">IUC Syd granskar ansökan. Du får ett e-postmeddelande när kontot är aktiverat.</p>
                <form className="mt-6 space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.companyId) { toast.error("Välj ditt företag."); return; }
                  if (db.members.some((m) => m.email.toLowerCase() === form.email.toLowerCase())) { toast.error("E-postadressen finns redan."); return; }
                  actions.apply(form);
                  setSent(true);
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Namn</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-postadress</Label>
                    <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Använd din arbetsadress. Den blir ditt användarnamn.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Företag</Label>
                      <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" className="w-full justify-start truncate font-normal">{company?.name ?? <span className="text-muted-foreground">Börja skriva...</span>}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Sök medlemsföretag..." />
                            <CommandList>
                              <CommandEmpty>Hittar inget medlemsföretag.</CommandEmpty>
                              <CommandGroup>
                                {db.companies.map((c) => (
                                  <CommandItem key={c.id} value={c.name} onSelect={() => { setForm({ ...form, companyId: c.id }); setCompanyOpen(false); }}>
                                    {c.name}<span className="ml-auto text-xs text-muted-foreground">{c.municipality}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5"><Label>Yrkestitel eller roll</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  </div>
                  <label className="flex items-start gap-3 rounded-lg bg-accent p-4 text-sm">
                    <Checkbox checked={form.consent} onCheckedChange={(v) => setForm({ ...form, consent: v === true })} className="mt-0.5" />
                    Jag samtycker till att mitt namn, min roll och min e-postadress visas för andra medlemmar på företagets företagskort. Jag kan ändra detta senare.
                  </label>
                  <Button type="submit" size="lg" className="w-full">Skicka ansökan</Button>
                </form>
              </>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
