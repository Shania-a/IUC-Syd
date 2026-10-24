import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Tag({ children, variant = "soft", className }: { children: ReactNode; variant?: "soft" | "solid" | "warn" | "outline" | "danger"; className?: string }) {
  const styles = {
    soft: "bg-accent text-accent-foreground",
    solid: "bg-panel text-panel-foreground",
    warn: "bg-warning text-warning-foreground",
    outline: "border border-border text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
  }[variant];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider", styles, className)}>
      {children}
    </span>
  );
}

export function Initials({ text, size = "md", tone = "soft" }: { text: string; size?: "sm" | "md" | "lg"; tone?: "soft" | "solid" }) {
  const s = { sm: "h-7 w-7 text-[11px]", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" }[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold", s, tone === "solid" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground")}>
      {text}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground", className)}>{children}</p>;
}

export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
        {lead && <p className="mt-2 text-muted-foreground">{lead}</p>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>{children}</div>;
}
