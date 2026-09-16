import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { FolderKanban, Plus, TerminalSquare } from "lucide-react";

export default function Workspace() {
  const projects = trpc.projects.list.useQuery();
  return <DashboardLayout>
    <div className="space-y-8 p-5 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-cyan-600">P/AI WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Your projects</h1><p className="mt-2 text-sm text-muted-foreground">Persistent spaces for files, conversations, agents, and generated assets.</p></div><Button className="bg-slate-950 text-white hover:bg-slate-800"><Plus className="mr-2 size-4" /> New project</Button></div>
      {projects.isLoading ? <div className="rounded-xl border border-border p-8 text-sm text-muted-foreground">Loading projects…</div> : projects.data?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.data.map(project => <Card key={project.id}><CardHeader><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-cyan-100 text-cyan-800"><FolderKanban className="size-4" /></div><CardTitle className="text-lg">{project.name}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{project.description ?? "No description yet."}</p><p className="mt-4 text-xs text-muted-foreground">/{project.slug}</p></CardContent></Card>)}</div> : <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-20 text-center"><TerminalSquare className="mb-4 size-8 text-cyan-700" /><h2 className="text-lg font-semibold">No projects yet</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Create your first persistent workspace to start layering files, models, and agent workflows on top of the P/AI foundation.</p></CardContent></Card>}
    </div>
  </DashboardLayout>;
}
