import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowUp, Bot, Plus, UserRound } from "lucide-react";
import { useState } from "react";

export default function Chat() {
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const send = trpc.chat.send.useMutation({ onSuccess: result => { setConversationId(result.conversationId); setMessages(current => [...current, { role: "assistant", content: result.message?.content ?? "" }]); } });
  const submit = () => { const content = input.trim(); if (!content || send.isPending) return; setMessages(current => [...current, { role: "user", content }]); setInput(""); send.mutate({ conversationId, content }); };
  return <DashboardLayout><div className="flex min-h-[calc(100vh-1rem)] flex-col p-5 lg:p-8"><div className="flex items-center justify-between"><div><p className="text-sm text-cyan-600">P/AI CHAT</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Conversation workspace</h1></div><Button variant="outline" onClick={() => { setConversationId(undefined); setMessages([]); }}><Plus className="mr-2 size-4" /> New chat</Button></div><Card className="mt-8 flex flex-1 flex-col overflow-hidden"><div className="flex-1 space-y-5 overflow-y-auto p-5">{messages.length === 0 && <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center text-muted-foreground"><Bot className="mb-4 size-9 text-cyan-700" /><p className="font-medium text-foreground">Ask P/AI anything</p><p className="mt-2 max-w-md text-sm">This is a real server-side model call. Responses are saved to your conversation workspace.</p></div>}{messages.map((message, index) => <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`flex max-w-3xl gap-3 rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-slate-950 text-white" : "bg-muted"}`}>{message.role === "user" ? <UserRound className="mt-1 size-4 shrink-0" /> : <Bot className="mt-1 size-4 shrink-0 text-cyan-700" />}<div className="whitespace-pre-wrap">{message.content}</div></div></div>)}{send.isPending && <div className="text-sm text-muted-foreground">P/AI is thinking…</div>}</div><div className="border-t p-4"><div className="flex gap-3"><Textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Message P/AI…" className="min-h-12 resize-none" /><Button aria-label="Send message" onClick={submit} disabled={!input.trim() || send.isPending} className="self-end bg-slate-950 text-white"><ArrowUp className="size-4" /></Button></div><p className="mt-2 text-xs text-muted-foreground">Enter to send · Shift+Enter for a new line</p></div></Card></div></DashboardLayout>;
}
