const DEFAULT_BASE_URL = "http://127.0.0.1:1234";
const DEFAULT_MODEL = "phi-3.1-mini-4k-instruct";

function normalizeBaseUrl(value) {
  return String(value || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function classifyNetworkError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  if (message.includes("fetch failed") || message.includes("econnrefused") || message.includes("connection refused")) {
    return "LM_STUDIO_UNREACHABLE";
  }
  return "LM_STUDIO_NETWORK_ERROR";
}

export function createLmStudioClient({
  baseUrl = process.env.NOURAN_LM_STUDIO_URL || DEFAULT_BASE_URL,
  model = process.env.NOURAN_LM_STUDIO_MODEL || DEFAULT_MODEL,
  fetchImpl = globalThis.fetch
} = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("FETCH_UNAVAILABLE");
  const root = normalizeBaseUrl(baseUrl);

  return Object.freeze({
    async chat(messages, options = {}) {
      if (!Array.isArray(messages) || messages.length === 0) {
        throw Object.assign(new Error("LM_INVALID_MESSAGES"), { code: "LM_INVALID_MESSAGES", status: 400 });
      }

      const payload = {
        model: String(options.model || model),
        messages,
        temperature: Number.isFinite(options.temperature) ? options.temperature : 0.2,
        stream: false
      };

      let response;
      try {
        response = await fetchImpl(`${root}/v1/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        const code = classifyNetworkError(error);
        throw Object.assign(new Error(code), { code, cause: error });
      }

      let body = null;
      try { body = await response.json(); } catch {}

      if (!response.ok) {
        const code = `LM_HTTP_${response.status}`;
        throw Object.assign(new Error(code), { code, status: response.status, body });
      }

      const content = body?.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        const code = "LM_INVALID_RESPONSE";
        throw Object.assign(new Error(code), { code, status: 502, body });
      }

      return {
        model: body?.model || payload.model,
        content,
        usage: body?.usage || null,
        raw: body
      };
    }
  });
}

export const LM_DEFAULTS = Object.freeze({ baseUrl: DEFAULT_BASE_URL, model: DEFAULT_MODEL });
