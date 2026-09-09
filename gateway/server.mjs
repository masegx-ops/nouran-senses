import http from "node:http";
import crypto from "node:crypto";
import { authorize } from "./policy.mjs";
import { createLmStudioClient } from "./lm-studio.mjs";

const HOST = process.env.NOURAN_HOST || "127.0.0.1";
const PORT = Number(process.env.NOURAN_PORT || 8787);
const MAX_BODY = 64 * 1024;
const startedAt = new Date().toISOString();
const events = [];
const state = { status: "ready", revision: 0, lastTask: null };
const lm = createLmStudioClient();

function id() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function emit(type, payload = {}) {
  const event = { id: id(), at: now(), type, payload };
  events.push(event);
  if (events.length > 200) events.shift();
  state.revision += 1;
  return event;
}
function json(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(text);
}
async function readJson(req) {
  let size = 0; let raw = "";
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("BODY_TOO_LARGE"), { status: 413 });
    raw += chunk;
  }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("INVALID_JSON"), { status: 400 }); }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const method = req.method || "GET";
    if (method === "GET" && url.pathname === "/health") {
      return json(res, 200, { ok: true, service: "nouran-windows-gateway", version: "0.1.0", startedAt, uptimeSec: Math.round(process.uptime()), revision: state.revision });
    }
    if (method === "GET" && url.pathname === "/state") {
      return json(res, 200, { ok: true, state: { ...state }, eventCount: events.length });
    }
    if (method === "GET" && url.pathname === "/events") {
      return json(res, 200, { ok: true, events: events.slice(-50) });
    }
    if (method === "POST" && url.pathname === "/task") {
      const body = await readJson(req);
      const action = String(body.action || "task_preview");
      const auth = authorize(action);
      const taskId = id();
      if (!auth.ok) {
        const event = emit("task_rejected", { taskId, action, code: auth.code, risk: auth.risk || null });
        return json(res, 403, { ok: false, taskId, action, authorization: auth, eventId: event.id });
      }

      if (action === "lm_infer") {
        const messages = body.messages;
        try {
          const result = await lm.chat(messages, {
            model: body.model,
            temperature: body.temperature
          });
          const event = emit("lm_inference_completed", {
            taskId,
            model: result.model,
            contentLength: result.content.length,
            usage: result.usage
          });
          return json(res, 200, {
            ok: true,
            taskId,
            action,
            model: result.model,
            content: result.content,
            usage: result.usage,
            eventId: event.id
          });
        } catch (error) {
          const code = error.code || "LM_INFERENCE_ERROR";
          const event = emit("lm_inference_failed", { taskId, code });
          return json(res, 502, { ok: false, taskId, action, code, eventId: event.id });
        }
      }

      const task = { taskId, action, instruction: String(body.instruction || ""), mode: "preview", at: now() };
      state.lastTask = task;
      const event = emit("task_previewed", task);
      return json(res, 200, { ok: true, task, eventId: event.id, note: "Phase 1 is read-only. No desktop/browser action is executed." });
    }
    return json(res, 404, { ok: false, code: "NOT_FOUND" });
  } catch (error) {
    const status = Number(error.status || 500);
    return json(res, status, { ok: false, code: error.message || "INTERNAL_ERROR" });
  }
});

server.listen(PORT, HOST, () => {
  emit("gateway_started", { host: HOST, port: PORT });
  console.log(`Nouran Windows Gateway listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  emit("gateway_stopping", { signal });
  server.close(() => process.exit(0));
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
