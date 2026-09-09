// Provider-neutral adapter for OpenAI-compatible inference APIs.
// Works with local LM Studio or compatible remote providers when an endpoint/key is supplied.
// Keys are read only from environment variables and never persisted.

export async function infer({ baseUrl, apiKey = undefined, model, messages, timeoutMs = 45000, extra = {} }) {
  if (!baseUrl || !model || !Array.isArray(messages)) throw new Error('baseUrl, model and messages are required');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { 'content-type': 'application/json' };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  const started = performance.now();
  try {
    const response = await fetch(`${String(baseUrl).replace(/\/$/, '')}/chat/completions`, {
      method: 'POST', headers, signal: controller.signal,
      body: JSON.stringify({ model, messages, ...extra })
    });
    const text = await response.text();
    let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
    const result = {
      ok: response.ok,
      status: response.status,
      latencyMs: Math.round(performance.now() - started),
      model,
      provider: baseUrl,
      body
    };
    if (!response.ok) throw Object.assign(new Error(`Inference request failed: HTTP ${response.status}`), { result });
    return result;
  } finally {
    clearTimeout(timer);
  }
}

export function fromEnvironment(env = process.env) {
  return {
    baseUrl: env.NOURAN_INFERENCE_BASE_URL || env.LM_STUDIO_BASE_URL || '',
    apiKey: env.NOURAN_INFERENCE_API_KEY || env.LM_STUDIO_API_KEY || undefined,
    model: env.NOURAN_MODEL || ''
  };
}
