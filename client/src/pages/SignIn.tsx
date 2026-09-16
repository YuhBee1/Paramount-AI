import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "wouter";

export default function SignIn() {
  return (
    <main className="min-h-screen bg-[#0a0d12] px-5 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/20">
          <div className="mb-8 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-cyan-300 font-black text-slate-950">P/</div><div><div className="font-semibold">P/AI</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Paramounts AI</div></div></div>
          <div className="mb-8"><div className="mb-4 grid size-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><LockKeyhole className="size-5" /></div><h1 className="text-3xl font-semibold tracking-tight">Sign in to P/AI</h1><p className="mt-3 text-sm leading-6 text-slate-400">Use your Paramounts account to open your projects, conversations, files, and AI tools.</p></div>
          <a href="/api/oauth/login" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-6 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d12]">Continue with Paramounts <ArrowRight className="size-4" /></a>
          <p className="mt-6 text-center text-xs text-slate-500">Your sign-in is handled by the configured OAuth provider. P/AI does not ask you to paste a password here.</p>
          <div className="mt-8 border-t border-white/10 pt-5 text-center text-sm"><Link href="/" className="text-slate-400 transition hover:text-cyan-200">Back to home</Link></div>
        </section>
      </div>
    </main>
  );
}
