import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { FileCode2, FolderOpen, UploadCloud } from "lucide-react";
import { useState } from "react";

export default function Files() {
  const [projectId, setProjectId] = useState(0); const [message, setMessage] = useState("");
  const projects = trpc.projects.list.useQuery(); const [selectedProject] = projects.data ?? [];
  const activeProject = projectId || selectedProject?.id || 0; const files = trpc.files.list.useQuery({ projectId: activeProject }, { enabled: activeProject > 0 });
  const upload = trpc.files.upload.useMutation({ onSuccess: () => { setMessage("File uploaded and versioned."); files.refetch(); } });
  const onFile = async (file?: File) => { if (!file || !activeProject) return; const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.onerror = reject; reader.readAsDataURL(file); }); upload.mutate({ projectId: activeProject, name: file.name, mimeType: file.type || "application/octet-stream", base64 }); };
  return <DashboardLayout><div className="space-y-8 p-5 lg:p-8"><div><p className="text-sm text-cyan-600">PROJECT STORAGE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Files</h1><p className="mt-2 text-sm text-muted-foreground">Content-addressed uploads with versioned metadata.</p></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="size-5 text-cyan-700" /> Project workspace</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={activeProject || ""} onChange={event => setProjectId(Number(event.target.value))} placeholder="Project ID" type="number" /><label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground hover:bg-muted"><UploadCloud className="size-5" />{upload.isPending ? "Uploading…" : "Choose a file to upload"}<input type="file" className="sr-only" onChange={event => onFile(event.target.files?.[0])} /></label>{message && <p className="text-sm text-emerald-700">{message}</p>}</CardContent></Card><Card><CardHeader><CardTitle>Indexed files</CardTitle></CardHeader><CardContent className="space-y-3">{files.data?.length ? files.data.map(file => <div key={file.id} className="flex items-center justify-between rounded-lg border p-4"><div className="flex items-center gap-3"><FileCode2 className="size-4 text-cyan-700" /><div><div className="font-medium">{file.name}</div><div className="text-xs text-muted-foreground">v{file.currentVersion} · {file.sizeBytes} bytes · {file.mimeType}</div></div></div></div>) : <p className="text-sm text-muted-foreground">Select a project to view files.</p>}</CardContent></Card></div></DashboardLayout>;
}
