/**
 * API client for the SPORE monetisation API.
 *
 * All requests flow through ``apiFetch`` which injects the Bearer JWT
 * (when present) and normalises error handling. Errors are raised as
 * ``ApiError`` with status + payload so UI code can branch on 402
 * (payment required) etc.
 */
import { getToken } from './auth-storage';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8042';

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // default true: attach Bearer if token present
  signal?: AbortSignal;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOpts = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    throw new ApiError(0, null, `network error: ${(err as Error).message}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '');

  if (!res.ok) {
    const msg =
      typeof payload === 'object' && payload && 'detail' in payload
        ? typeof (payload as { detail: unknown }).detail === 'string'
          ? ((payload as { detail: string }).detail)
          : JSON.stringify((payload as { detail: unknown }).detail)
        : typeof payload === 'string'
          ? payload
          : `HTTP ${res.status}`;
    throw new ApiError(res.status, payload, msg);
  }

  return payload as T;
}

// ── Typed endpoints ───────────────────────────────────────────────

export interface MeResponse {
  email: string;
  credits: number;
  free_brief_used: boolean;
}

export interface VerifyResponse {
  token: string;
  user: MeResponse;
}

export interface FullBriefResponse {
  id: string;
  hypothesis_id: string;
  status: string;
  created_at: string | null;
  novelty_score: number | null;
  novelty_verdict: string | null;
  panel_consensus_score: number | null;
  panel_verdict: string | null;
  formal_statement: string | null;
  markdown: string | null;
  grounding_data: Record<string, unknown> | null;
  sharpened_data: Record<string, unknown> | null;
  protocol_data: Record<string, unknown> | null;
  panel_data: Record<string, unknown> | null;
  vulgarization_data: Record<string, unknown> | null;
  delivery_reason: 'owned' | 'free' | 'credit';
}

export interface CheckoutResponse {
  checkout_url: string;
  purchase_id: string;
}

export interface CustomFreeResponse {
  custom_request_id: string;
  status: string;
  message: string;
}

export interface CustomStatusResponse {
  id: string;
  status:
    | 'pending'
    | 'paid'
    | 'running'
    | 'complete'
    | 'failed'
    | string;
  domain_a: string;
  domain_b: string;
  hypothesis_id: string | null;
  brief_id: string | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface AccountBrief {
  brief_id: string;
  purchase_type: string;
  amount_cents: number;
  paid_at: string | null;
  panel_consensus_score: number | null;
  panel_verdict: string | null;
  novelty_verdict: string | null;
  brief_created_at: string | null;
  brief_status: string | null;
}

export interface AccountCustomRequest {
  id: string;
  domain_a: string;
  domain_b: string;
  status: string;
  hypothesis_id: string | null;
  brief_id: string | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface AccountPurchase {
  id: string;
  type: string;
  amount_cents: number;
  brief_id: string | null;
  stripe_session_id: string | null;
  paid_at: string | null;
}

export const api = {
  requestMagicLink: (email: string) =>
    apiFetch<{ ok: boolean; message: string }>('/api/auth/magic-link', {
      method: 'POST',
      body: { email },
      auth: false,
    }),
  verifyMagicLink: (token: string) =>
    apiFetch<VerifyResponse>(
      `/api/auth/verify?token=${encodeURIComponent(token)}`,
      { auth: false },
    ),
  me: () => apiFetch<MeResponse>('/api/auth/me'),
  getFullBrief: (briefId: string) =>
    apiFetch<FullBriefResponse>(
      `/api/briefs/${encodeURIComponent(briefId)}/full`,
    ),
  createCheckout: (payload: {
    type: 'single' | 'pack_5' | 'custom';
    brief_id?: string;
    domain_a?: string;
    domain_b?: string;
  }) =>
    apiFetch<CheckoutResponse>('/api/stripe/checkout', {
      method: 'POST',
      body: payload,
    }),
  customStatus: (id: string) =>
    apiFetch<CustomStatusResponse>(
      `/api/custom/${encodeURIComponent(id)}/status`,
    ),
  customFree: (payload: {
    domain_a: string;
    domain_b?: string;
    mode?: 'surprise' | 'targeted';
  }) =>
    apiFetch<CustomFreeResponse>('/api/custom/free', {
      method: 'POST',
      body: payload,
    }),
  accountBriefs: () =>
    apiFetch<AccountBrief[]>('/api/account/briefs'),
  accountCustomRequests: () =>
    apiFetch<AccountCustomRequest[]>('/api/account/custom-requests'),
  accountPurchases: () =>
    apiFetch<AccountPurchase[]>('/api/account/purchases'),
};
