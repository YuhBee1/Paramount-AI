import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Copy, KeyRound, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Developer() {
  const [label, setLabel] = useState(""); const [created, setCreated] = useState<string | null>(null);
  const keys = trpc.developer.keys.useQuery(); const utils = trpc.useUtils();
  const create = trpc.developer.createKey.useMutation({ onSuccess: result => { setCreated(result.secret); setLabel(""); utils.developer.keys.invalidate(); } });
  const revoke = trpc.developer.revokeKey.useMutation({ onSuccess: () => utils.developer.keys.invalidate() });
  return <DashboardLayout><div className="space-y-8 p-5 lg:p-8"><div><p className="text-sm text-cyan-600">DEVELOPER CONSOLE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">API access</h1><p className="mt-2 text-sm text-muted-foreground">Create scoped keys for the versioned P/AI API. Secrets are shown once.</p></div>{created && <Card className="border-emerald-300 bg-emerald-50"><CardContent className="flex items-center justify-between gap-3 p-4"><code className="break-all text-sm">{created}</code><Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(created)}><Copy className="mr-2 size-4" /> Copy</Button></CardContent></Card>}<Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="size-5 text-cyan-700" /> Create API key</CardTitle></CardHeader><CardContent><div className="flex max-w-xl gap-3"><Input value={label} onChange={event => setLabel(event.target.value)} placeholder="Key label, e.g. Local development" /><Button disabled={!label.trim() || create.isPending} onClick={() => create.mutate({ label, scopes: ["chat:write", "models:read"] })}><Plus className="mr-2 size-4" /> Create</Button></div></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-cyan-700" /> Your keys</CardTitle></CardHeader><CardContent className="space-y-3">{keys.data?.length ? keys.data.map(key => <div key={key.id} className="flex items-center justify-between rounded-lg border p-4"><div><div className="font-medium">{key.label}</div><div className="mt-1 text-xs text-muted-foreground">{key.keyPrefix}•••• · {key.revokedAt ? "Revoked" : "Active"}</div></div>{!key.revokedAt && <Button variant="outline" size="sm" onClick={() => revoke.mutate({ id: key.id })}>Revoke</Button>}</div>) : <p className="text-sm text-muted-foreground">No API keys yet.</p>}</CardContent></Card></div></DashboardLayout>;
}
