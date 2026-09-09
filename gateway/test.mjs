import assert from "node:assert/strict";
import { authorize } from "./policy.mjs";

assert.deepEqual(authorize("health"), { ok: true, risk: "read" });
assert.equal(authorize("shell").ok, false);
assert.equal(authorize("credentials").ok, false);
assert.equal(authorize("delete").ok, false);
assert.equal(authorize("unknown").ok, false);

const child = (await import("node:child_process")).spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, NOURAN_PORT: "18787" },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", b => { output += b.toString(); });
try {
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch("http://127.0.0.1:18787/health");
      if (r.ok) break;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  const health = await (await fetch("http://127.0.0.1:18787/health")).json();
  assert.equal(health.ok, true);
  assert.equal(health.service, "nouran-windows-gateway");

  const preview = await (await fetch("http://127.0.0.1:18787/task", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "task_preview", instruction: "read-only smoke test" })
  })).json();
  assert.equal(preview.ok, true);
  assert.equal(preview.task.mode, "preview");

  const rejected = await (await fetch("http://127.0.0.1:18787/task", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "shell", instruction: "should never execute" })
  })).json();
  assert.equal(rejected.ok, false);
  assert.equal(rejected.authorization.code, "ACTION_DISABLED");

  const events = await (await fetch("http://127.0.0.1:18787/events")).json();
  assert.ok(events.events.some(e => e.type === "task_previewed"));
  assert.ok(events.events.some(e => e.type === "task_rejected"));

  console.log("gateway tests: ok");
} finally {
  child.kill("SIGTERM");
}
