import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createProject, listProjects } from "./db";
import { appendMessage, createConversation, getConversationMessages, listConversations } from "./services/chat";
import { availableModels, generateText } from "./services/aiGateway";
import { createApiKey, listApiKeys, revokeApiKey } from "./services/apiKeys";
import { getCreditBalance, recordCreditEntry } from "./services/credits";
import { cancelJob, enqueueJob, listJobs } from "./services/jobs";
import { listProjectFiles, uploadProjectFile } from "./services/files";
import { listFeatureFlags, listModels, listProviders } from "./services/admin";
import { createImage, imageModels } from "./services/media";
import { createDataset, listDatasets, setDatasetConsent } from "./services/datasets";

const projectInput = z.object({ name: z.string().trim().min(1).max(160), slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(2000).optional() });
const messageInput = z.object({ conversationId: z.number().int().positive().optional(), title: z.string().trim().min(1).max(200).default("New conversation"), model: z.string().max(160).optional(), content: z.string().trim().min(1).max(50000) });
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access required" });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  projects: router({
    list: protectedProcedure.query(({ ctx }) => listProjects(ctx.user.id)),
    create: protectedProcedure.input(projectInput).mutation(({ ctx, input }) => createProject({ ownerId: ctx.user.id, ...input })),
  }),
  files: router({
    list: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).query(({ ctx, input }) => listProjectFiles(ctx.user.id, input.projectId)),
    upload: protectedProcedure.input(z.object({ projectId: z.number().int().positive(), name: z.string().trim().min(1).max(255), mimeType: z.string().trim().min(1).max(160), base64: z.string().min(1).max(15_000_000) })).mutation(({ ctx, input }) => uploadProjectFile({ ownerId: ctx.user.id, ...input })),
  }),
  models: router({ list: publicProcedure.query(() => availableModels()) }),
  media: router({
    imageModels: publicProcedure.query(() => imageModels()),
    image: protectedProcedure.input(z.object({ prompt: z.string().trim().min(3).max(2000), model: z.string().max(120).optional() })).mutation(({ input }) => createImage(input.prompt, input.model)),
  }),
  datasets: router({
    list: protectedProcedure.query(({ ctx }) => listDatasets(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(1).max(160), purpose: z.string().trim().min(1).max(80) })).mutation(({ ctx, input }) => createDataset(ctx.user.id, input)),
    consent: protectedProcedure.input(z.object({ id: z.number().int().positive(), consentStatus: z.enum(["approved", "rejected", "withdrawn"]) })).mutation(({ ctx, input }) => setDatasetConsent(ctx.user.id, input.id, input.consentStatus)),
  }),
  chat: router({
    list: protectedProcedure.query(({ ctx }) => listConversations(ctx.user.id)),
    messages: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(({ ctx, input }) => getConversationMessages(ctx.user.id, input.conversationId)),
    send: protectedProcedure.input(messageInput).mutation(async ({ ctx, input }) => {
      const conversation = input.conversationId ? { id: input.conversationId } : await createConversation(ctx.user.id, { title: input.title, model: input.model });
      if (!conversation) throw new Error("Unable to create conversation");
      await appendMessage({ conversationId: conversation.id, role: "user", content: input.content });
      const history = await getConversationMessages(ctx.user.id, conversation.id);
      const response = await generateText({ model: input.model, messages: history.map(message => ({ role: message.role === "tool" ? "assistant" : message.role, content: message.content })) });
      const assistant = await appendMessage({ conversationId: conversation.id, role: "assistant", content: response.text, model: response.model, outputTokens: response.usage?.completion_tokens });
      return { conversationId: conversation.id, message: assistant, model: response.model, usage: response.usage };
    }),
  }),
  credits: router({
    balance: protectedProcedure.query(({ ctx }) => getCreditBalance(ctx.user.id)),
    grant: adminProcedure.input(z.object({ userId: z.number().int().positive(), amount: z.number().int().positive().max(100000), reason: z.string().trim().min(1).max(200) })).mutation(({ input }) => recordCreditEntry(input.userId, { type: "grant", amount: input.amount, idempotencyKey: `grant:${input.userId}:${input.reason}:${input.amount}`, metadata: { reason: input.reason } })),
  }),
  jobs: router({
    list: protectedProcedure.query(({ ctx }) => listJobs(ctx.user.id)),
    enqueue: protectedProcedure.input(z.object({ projectId: z.number().int().positive().optional(), operationType: z.string().trim().min(1).max(80), creditCost: z.number().int().nonnegative().optional() })).mutation(({ ctx, input }) => enqueueJob({ userId: ctx.user.id, ...input })),
    cancel: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => cancelJob(ctx.user.id, input.id).then(() => ({ success: true }))),
  }),
  developer: router({
    keys: protectedProcedure.query(({ ctx }) => listApiKeys(ctx.user.id)),
    createKey: protectedProcedure.input(z.object({ label: z.string().trim().min(1).max(120), scopes: z.array(z.string()).min(1).max(20) })).mutation(({ ctx, input }) => createApiKey(ctx.user.id, input.label, input.scopes)),
    revokeKey: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => revokeApiKey(ctx.user.id, input.id).then(() => ({ success: true }))),
  }),
  admin: router({
    providers: adminProcedure.query(() => listProviders()),
    models: adminProcedure.query(() => listModels()),
    flags: adminProcedure.query(() => listFeatureFlags()),
  }),
});
export type AppRouter = typeof appRouter;
