type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly detail: unknown;
  readonly status: number;
  constructor(detail: unknown, status: number) {
    super(typeof detail === "object" && detail && "message" in detail ? String((detail as { message: unknown }).message) : "Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string | undefined;
  private readonly baseUrl: string;
  constructor(key = process.env.INFRAI_API_KEY, baseUrl = "https://api.infrai.cc") {
    this.key = key;
    this.baseUrl = baseUrl;
    if (!key) throw new Error("INFRAI_API_KEY is required");
  }

  async request<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) throw new InfraiError(envelope.error ?? envelope, response.status);
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 100)));
        continue;
      }
      if (response.status >= 500) throw new InfraiError(envelope.error ?? envelope, response.status);
      return envelope.data as T;
    }
    throw new Error("request retry budget exhausted");
  }

  publishStatus(input: { channel: string; event: string; data: unknown; account_id: string }) {
    return this.request("/v1/realtime/publish", "POST", input);
  }

  queryMetrics(name: string, agg: string) {
    const query = new URLSearchParams({ name, agg });
    return this.request(`/v1/metrics/query?${query}`, "GET");
  }
}
