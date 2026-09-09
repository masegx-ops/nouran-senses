import assert from "node:assert/strict";
import { createLmStudioClient } from "./lm-studio.mjs";

const baseUrl = process.env.NOURAN_LM_STUDIO_URL;
const model = process.env.NOURAN_LM_STUDIO_MODEL;

if (!baseUrl) {
  console.error("NOURAN_LM_STUDIO_URL is required for the real connectivity test");
  process.exit(2);
}

const client = createLmStudioClient({ baseUrl, model });
try {
  const result = await client.chat([
    { role: "system", content: "Reply with exactly: LM_CONNECTIVITY_OK" },
    { role: "user", content: "connectivity probe" }
  ], { temperature: 0 });
  assert.match(result.content, /LM_CONNECTIVITY_OK/);
  console.log(JSON.stringify({
    ok: true,
    endpoint: baseUrl,
    model: result.model,
    content: result.content
  }));
} catch (error) {
  console.error(JSON.stringify({ ok: false, code: error.code || "LM_INFERENCE_ERROR", endpoint: baseUrl }));
  process.exit(1);
}
