import assert from "node:assert/strict";
import http from "node:http";
import { authorize } from "./policy.mjs";
import { createLmStudioClient } from "./lm-studio.mjs";

assert.deepEqual(authorize("health"), { ok: true, risk: "read" });
assert.deepEqual(authorize("lm_infer"), { ok: true, risk: "local_model" });
assert.equal(authorize("shell").ok, false);
assert.equal(authorize("credentials").ok, false);
assert.equal(authorize("delete").ok, false);
assert.equal(authorize("unknown").ok, false);

const mock = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/v1/chat/completions") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const input = JSON.parse(raw);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      model: input.model,
      choices: [{ message: { role: "assistant", content: "deterministic mock response" } }],
      usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 }
    }));
    return;
  }
  res.writeHead(404);
  res.end();
});

await new Promise(resolve => mock.listen(18788, "127.0.0.1", resolve));

try {
  const direct = createLmStudioClient({ baseUrl: "http://127.0.0.1:18788", model: "mock-model" });
  const result = await direct.chat([{ role: "user", content: "hello" }]);
  assert.equal(result.model, "mock-model");
  assert.equal(result.content, "deterministic mock response");
  assert.equal(result.usage.total_tokens, 7);

  const child = (await import("node:child_process")).spawn(process.execPath, ["server.mjs"], {
    cwd: new URL(".", import.meta.url),
    env: { ...process.env, NOURAN_PORT: "18787", NOURAN_LM_STUDIO_URL: "http://127.0.0.1:18788", NOURAN_LM_STUDIO_MODEL: "mock-model" },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let output = "";
  child.stdout.on("data", b => { output += b.toString(); });
  try {
    let healthy = false;
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch("http://127.0.0.1:18787/health");
        if (r.ok) { healthy = true; break; }
      } catch {}
      await new Promise(r => setTimeout(r, 100));
    }
    assert.equal(healthy, true, output);

    const health = await (await fetch("http://127.0.0.1:18787/health")).json();
    assert.equal(health.ok, true);
    assert.equal(health.service, "nouran-windows-gateway");

    const preview = await (await fetch("http://127.0.0.1:18787/task", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "task_preview", instruction: "read-only smoke test" })
    })).json();
    assert.equal(preview.ok, true);
    assert.equal(preview.task.mode, "preview");

    const inference = await (await fetch("http://127.0.0.1:18787/task", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "lm_infer", messages: [{ role: "user", content: "hello" }] })
    })).json();
    assert.equal(inference.ok, true);
    assert.equal(inference.model, "mock-model");
    assert.equal(inference.content, "deterministic mock response");

    const rejected = await (await fetch("http://127.0.0.1:18787/task", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "shell", instruction: "should never execute" })
    })).json();
    assert.equal(rejected.ok, false);
    assert.equal(rejected.authorization.code, "ACTION_DISABLED");

    const events = await (await fetch("http://127.0.0.1:18787/events")).json();
    assert.ok(events.events.some(e => e.type === "task_previewed"));
    assert.ok(events.events.some(e => e.type === "lm_inference_completed"));
    assert.ok(events.events.some(e => e.type === "task_rejected"));

    console.log("gateway tests: ok");
  } finally {
    child.kill("SIGTERM");
  }
} finally {
  await new Promise(resolve => mock.close(resolve));
}
