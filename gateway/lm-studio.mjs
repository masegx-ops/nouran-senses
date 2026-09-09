const DEFAULT_URL = "http://127.0.0.1:1234/v1/chat/completions";
const MAX_PROMPT = 12000;
const MAX_OUTPUT = 4000;

export function lmConfig(env = process.env) {
  return {
    url: String(env.NOURAN_LM_URL || DEFAULT_URL),
    model: String(env.NOURAN_LM_MODEL || "local-model"),
    timeoutMs: Math.max(1000, Number(env.NOURAN_LM_TIMEOUT_MS || 30000))
  };
}

export async function infer(prompt, options = {}, env = process.env) {
  const text = String(prompt || "").trim();
  if (!text) throw Object.assign(new Error("PROMPT_REQUIRED"), { status: 400 });
  if (text.length > MAX_PROMPT) throw Object.assign(new Error("PROMPT_TOO_LARGE"), { status: 413 });

  const cfg = lmConfig(env);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const response = await fetch(cfg.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: String(options.model || cfg.model),
        messages: [{ role: "user", content: text }],
        temperature: Number.isFinite(Number(options.temperature)) ? Number(options.temperature) : 0.2,
        max_tokens: Math.min(MAX_OUTPUT, Math.max(1, Number(options.max_tokens || 800)))
      }),
      signal: controller.signal
    });
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = null; }
    if (!response.ok) {
      const detail = data?.error?.message || raw.slice(0, 500) || `HTTP_${response.status}`;
      throw Object.assign(new Error(`LM_HTTP_${response.status}: ${detail}`), { status: 502 });
    }
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw Object.assign(new Error("LM_RESPONSE_SHAPE_INVALID"), { status: 502 });
    return {
      text: content,
      model: data.model || cfg.model,
      usage: data.usage || null
    };
  } catch (error) {
    if (error?.name === "AbortError") throw Object.assign(new Error("LM_TIMEOUT"), { status: 504 });
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
