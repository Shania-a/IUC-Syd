import { Link, Navigate, useNavigate } from "@/lib/router-bridge";
import { Lock, LogOut, RotateCcw, ShieldCheck, PenSquare, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/strapi/types";
import { isStrapiConfigured } from "@/lib/strapi/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Initials } from "./bits";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; label: string; icon: typeof Users }[] = [
  { value: "member", label: "Medlem (Anna)", icon: Users },
  { value: "editor", label: "Redaktör (Elin)", icon: PenSquare },
  { value: "admin", label: "Administratör (Mats)", icon: ShieldCheck },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">IS</span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-foreground">IUC Syd</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Medlemsportal</span>
      </span>
    </Link>
  );
}

export function RoleSwitcherBar() {
  const { me, actions } = useStore();
  const navigate = useNavigate();
  return (
    <div className="border-b border-sidebar-border bg-panel text-panel-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-1.5 text-xs md:px-6">
        <span className="font-mono uppercase tracking-widest opacity-70">Prototyp · växla roll</span>
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => {
              actions.switchRole(r.value);
              navigate({ to: r.value === "admin" ? "/admin" : r.value === "editor" ? "/redaktor" : "/" });
            }}
            className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors", me?.role === r.value ? "bg-panel-foreground text-panel" : "hover:bg-sidebar-accent")}
          >
            <r.icon className="h-3 w-3" /> {r.label}
          </button>
        ))}
        <span className="ml-auto font-mono opacity-70">{isStrapiConfigured ? "Strapi: ansluten" : "Testdata (Strapi ej ansluten)"}</span>
        <button onClick={() => { actions.resetDemo(); }} className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-sidebar-accent" title="Återställ testdata">
          <RotateCcw className="h-3 w-3" /> Återställ
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { me, hydrated, actions, lookup } = useStore();
  const navigate = useNavigate();
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!me) return <Navigate to="/login" />;

  const company = lookup.company(me.companyId);
  const isIuc = me.role !== "member";
  const nav = [
    { to: "/", label: "Start" },
    { to: "/community", label: "Community" },
    { to: "/foretag", label: "Företag" },
    { to: "/event", label: "Event" },
    ...(isIuc ? [] : [{ to: "/mitt-foretag", label: "Mitt företag" }]),
    ...(isIuc ? [{ to: "/redaktor", label: "Redaktör" }] : []),
    ...(me.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <RoleSwitcherBar />
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-6">
          <Logo />
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:font-semibold data-[status=active]:text-foreground data-[status=active]:underline data-[status=active]:decoration-primary data-[status=active]:decoration-2 data-[status=active]:underline-offset-[10px]"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {!isIuc && (
              <Button asChild variant="outline" className="hidden md:inline-flex">
                <Link to="/kontakt"><Lock className="h-4 w-4" /> Kontakta IUC Syd privat</Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm hover:bg-muted">
                <Initials text={me.initials} size="sm" />
                <span className="hidden font-medium sm:inline">{me.name} · {company?.name ?? "IUC Syd"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>{me.title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {nav.map((n) => (
                  <DropdownMenuItem key={n.to} className="lg:hidden" onClick={() => navigate({ to: n.to })}>{n.label}</DropdownMenuItem>
                ))}
                {!isIuc && <DropdownMenuItem onClick={() => navigate({ to: "/kontakt" })}>Privat kontakt</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => { actions.logout(); navigate({ to: "/login" }); }}>
                  <LogOut className="h-4 w-4" /> Logga ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {roles && !roles.includes(me.role) ? (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <h1 className="mt-3 text-xl font-semibold">Ingen behörighet</h1>
            <p className="mt-2 text-sm text-muted-foreground">Den här vyn är bara för IUC Syd. Växla roll i fältet högst upp för att testa.</p>
          </div>
        ) : children}
      </main>
    </div>
  );
}
