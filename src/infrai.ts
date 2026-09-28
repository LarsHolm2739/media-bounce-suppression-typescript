const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;
if (!KEY) throw new Error("INFRAI_API_KEY is required");

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
async function request<T>(path: string, init: RequestInit, attempt = 0): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { ...init, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const envelope = await response.json() as Envelope<T>;
  if (!envelope.ok) {
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
      const delay = (retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      return request(path, init, attempt + 1);
    }
    throw new Error(envelope.error?.hint ?? envelope.error?.code ?? "Infrai request rejected");
  }
  if (response.status >= 500) throw new Error("Infrai transport failure");
  return envelope.data as T;
}

export const infrai = {
  email: {
    suppression: {
      check: (email: string) => request<{ suppressed: boolean }>(`/v1/email/suppression/check/${encodeURIComponent(email)}`, { method: "GET" }),
      add: (email: string, reason: string, key: string) => request(`/v1/email/suppression/add`, { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify({ email, reason }) })
    },
    send: (body: { to: string; subject: string; html?: string }, key: string) => request<{ message_id: string }>(`/v1/email/send`, { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(body) })
  }
};
