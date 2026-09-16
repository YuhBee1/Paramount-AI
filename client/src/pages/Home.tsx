import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Boxes, Code2, Database, Gauge, LockKeyhole, Network, Sparkles } from "lucide-react";

const modules = [
  { icon: Network, title: "AI Gateway", status: "Contracted", copy: "Provider-independent routing with capability-aware fallbacks." },
  { icon: Database, title: "Persistent Workspaces", status: "Foundation", copy: "Projects, content-addressed objects, snapshots, and version history." },
  { icon: Gauge, title: "P/AI Credits", status: "Ledger ready", copy: "Quotes and immutable usage accounting kept separate from provider tokens." },
  { icon: Code2, title: "Code Agent", status: "Next phase", copy: "Sandboxed tools, checkpoints, diffs, and approval modes." },
];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0a0d12] text-slate-100">
      <header className="border-b border-white/10 bg-[#0a0d12]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-cyan-300 text-slate-950 font-black">P/</div><div><div className="font-semibold tracking-tight">P/AI</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Paramounts AI</div></div></div>
          <div className="flex items-center gap-3 text-sm text-slate-400">{isAuthenticated && <span className="hidden sm:inline">{user?.name ?? user?.email}</span>}{isAuthenticated ? <Button variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10" onClick={() => logout()}>Sign out</Button> : <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" onClick={() => window.location.href = "/signin"}>Sign in <ArrowUpRight className="ml-2 size-4" /></Button>}</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
        <section className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div><Badge className="mb-6 border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">FOUNDATION / PHASE 01</Badge><h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-7xl">An AI operating environment, built to evolve.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">P/AI unifies conversation, code, media, projects, and model routing behind an architecture designed for persistence, provider independence, and future Paramounts-owned inference.</p><div className="mt-9 flex flex-wrap gap-3"><Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" onClick={() => window.location.href = isAuthenticated ? "/app" : "/signin"}>{loading ? "Loading…" : isAuthenticated ? "Open workspace" : "Enter P/AI"}<ArrowUpRight className="ml-2 size-4" /></Button><Button variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10" onClick={() => document.getElementById("foundation")?.scrollIntoView({ behavior: "smooth" })}>View foundation</Button></div></div>
          <Card className="border-white/10 bg-white/[0.04] text-slate-100 shadow-2xl shadow-cyan-950/20"><CardHeader><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.2em] text-slate-500">System posture</span><span className="flex items-center gap-2 text-xs text-emerald-300"><span className="size-2 rounded-full bg-emerald-300" /> Foundation online</span></div><CardTitle className="mt-5 text-2xl">Modular by default.</CardTitle></CardHeader><CardContent><div className="space-y-4 text-sm text-slate-400"><div className="flex justify-between border-b border-white/10 pb-3"><span>Persistence boundary</span><span className="text-slate-200">P/AI repositories</span></div><div className="flex justify-between border-b border-white/10 pb-3"><span>Provider boundary</span><span className="text-slate-200">Adapter contract</span></div><div className="flex justify-between"><span>Safety boundary</span><span className="text-slate-200">Project-scoped</span></div></div></CardContent></Card>
        </section>
        <section id="foundation" className="mt-24"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-cyan-200">WHAT IS IN PLACE</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">The platform spine</h2></div><div className="hidden items-center gap-2 text-sm text-slate-500 md:flex"><LockKeyhole className="size-4" /> Auth, policy, and secrets stay server-side.</div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{modules.map(({ icon: Icon, title, status, copy }) => <Card key={title} className="border-white/10 bg-white/[0.035] text-slate-100 transition hover:-translate-y-1 hover:bg-white/[0.06]"><CardHeader><Icon className="mb-4 size-5 text-cyan-200" /><div className="flex items-center justify-between gap-3"><CardTitle className="text-lg">{title}</CardTitle><span className="text-[10px] uppercase tracking-wider text-slate-500">{status}</span></div></CardHeader><CardContent><p className="text-sm leading-6 text-slate-400">{copy}</p></CardContent></Card>)}</div></section>
        <section className="mt-24 border-t border-white/10 pt-8"><div className="flex flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row"><span>© 2026 Paramounts AI. Architecture first.</span><span className="flex items-center gap-2"><Boxes className="size-4" /> Built for replaceable models and durable workspaces.</span></div></section>
      </main>
    </div>
  );
}
