import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FolderKanban, Plus, TerminalSquare } from "lucide-react";
import { useState } from "react";

export default function Workspace() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const projects = trpc.projects.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.projects.create.useMutation({
    onSuccess: () => {
      setName("");
      setDescription("");
      setShowCreate(false);
      utils.projects.list.invalidate();
    },
  });
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <DashboardLayout>
      <div className="space-y-8 p-5 lg:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-cyan-600">P/AI WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your projects</h1>
            <p className="mt-2 text-sm text-muted-foreground">Persistent spaces for files, conversations, agents, and generated assets.</p>
          </div>
          <Button className="bg-slate-950 text-white hover:bg-slate-800" onClick={() => setShowCreate(current => !current)}>
            <Plus className="mr-2 size-4" /> New project
          </Button>
        </div>

        {showCreate && (
          <Card>
            <CardHeader><CardTitle>Create a persistent project</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={name} onChange={event => setName(event.target.value)} placeholder="Project name" autoFocus />
              <Textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="What are you building?" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button disabled={!slug || create.isPending} onClick={() => create.mutate({ name: name.trim(), slug, description: description.trim() || undefined })}>{create.isPending ? "Creating…" : "Create project"}</Button>
              </div>
              {create.error && <p className="text-sm text-destructive">{create.error.message}</p>}
            </CardContent>
          </Card>
        )}

        {projects.isLoading ? (
          <div className="rounded-xl border border-border p-8 text-sm text-muted-foreground">Loading projects…</div>
        ) : projects.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.data.map(project => (
              <Card key={project.id} className="transition hover:-translate-y-0.5">
                <CardHeader><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-cyan-100 text-cyan-800"><FolderKanban className="size-4" /></div><CardTitle className="text-lg">{project.name}</CardTitle></div></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.description ?? "No description yet."}</p>
                  <p className="mt-4 text-xs text-muted-foreground">/{project.slug}</p>
                  <div className="mt-5 flex gap-2"><Button size="sm" variant="outline" onClick={() => window.location.href = "/app/files"}>Files</Button><Button size="sm" onClick={() => window.location.href = "/app/chat"}>Chat</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center"><TerminalSquare className="mb-4 size-8 text-cyan-700" /><h2 className="text-lg font-semibold">No projects yet</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Create your first persistent workspace to start layering files, models, and agent workflows on top of the P/AI foundation.</p><Button className="mt-6" onClick={() => setShowCreate(true)}>Create your first project</Button></CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
