// CareerForge API client — in-memory access token + refresh-on-401 retry.
// Designed to drop in against an Express API at API_BASE_URL.

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

let accessToken: string | null = typeof window !== "undefined" ? localStorage.getItem("cf_access_token") : null;
const listeners = new Set<(t: string | null) => void>();

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("cf_access_token", token);
    } else {
      localStorage.removeItem("cf_access_token");
    }
  }
  listeners.forEach((l) => l(token));
}
export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem("cf_access_token");
  }
  return accessToken;
}
export function subscribeToken(cb: (t: string | null) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  json?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  _retried?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  if (!query) return url;
  const usp = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) usp.append(k, String(v));
  });
  const q = usp.toString();
  return q ? `${url}${url.includes("?") ? "&" : "?"}${q}` : url;
}

let refreshPromise: Promise<string | null> | null = null;
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("cf_refresh_token") : null;
        
        const res = await fetch(buildUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: storedRefreshToken ? JSON.stringify({ refreshToken: storedRefreshToken }) : undefined
        });
        if (!res.ok) return null;
        const payload = (await res.json().catch(() => null)) as { success?: boolean; data?: { accessToken?: string; refreshToken?: string } } | null;
        const tokenData = payload?.data;
        if (tokenData?.accessToken) {
          setAccessToken(tokenData.accessToken);
          if (typeof window !== "undefined") {
            localStorage.setItem("cf_access_token", tokenData.accessToken);
            if (tokenData.refreshToken) {
              localStorage.setItem("cf_refresh_token", tokenData.refreshToken);
            }
          }
          return tokenData.accessToken;
        }
        return null;
      } finally {
        setTimeout(() => (refreshPromise = null), 0);
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, json, query, headers, skipAuth, _retried, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  let finalBody: BodyInit | undefined;
  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(json);
  } else if (body !== undefined) {
    finalBody = body as BodyInit;
  }
  const tokenToUse = getAccessToken();
  if (!skipAuth && tokenToUse) {
    finalHeaders["Authorization"] = `Bearer ${tokenToUse}`;
  }

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
    credentials: "include",
  });

  if (res.status === 401 && !skipAuth && !_retried && !path.includes("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, { ...opts, _retried: true });
    }
    setAccessToken(null);
  }

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (payload && typeof payload === "object" && "message" in payload && (payload as any).message) ||
      (payload && typeof payload === "object" && "error" in payload && (payload as any).error?.message) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(String(msg), res.status, payload);
  }
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as any).data as T;
  }
  return payload as T;
}

export const api = {
  get: <T = unknown>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, json?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "POST", json }),
  patch: <T = unknown>(path: string, json?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", json }),
  put: <T = unknown>(path: string, json?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PUT", json }),
  delete: <T = unknown>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
