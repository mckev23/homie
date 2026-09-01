/*
Parses the parameters Supabase appends to an auth redirect deep link.

Supabase returns these in different places depending on the flow:
  - implicit flow (our current config): tokens in the URL *fragment*
    homeapp://reset-password#access_token=...&refresh_token=...&type=recovery
  - PKCE flow:                          code in the *query*
    homeapp://reset-password?code=...
  - failures (expired/used link):       error in either
    homeapp://reset-password#error=access_denied&error_code=otp_expired

Supabase's own docs use expo-auth-session's QueryParams helper for this,
but that would mean adding an auth library for one URL parse. Reading both
segments ourselves is a few lines and has no dependency cost.
*/

export type AuthLinkParams = {
  access_token?: string;
  refresh_token?: string;
  type?: string;
  code?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
};

export function parseAuthParams(url: string): AuthLinkParams {
  const out: Record<string, string> = {};

  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');

  const segments: string[] = [];
  if (hashIndex !== -1) {
    segments.push(url.slice(hashIndex + 1));
  }
  if (queryIndex !== -1) {
    // A fragment after the query ends it; otherwise the query runs to the end.
    const queryEnd = hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : url.length;
    segments.push(url.slice(queryIndex + 1, queryEnd));
  }

  for (const segment of segments) {
    for (const pair of segment.split('&')) {
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      try {
        const key = decodeURIComponent(pair.slice(0, eq));
        const value = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '));
        if (value) out[key] = value;
      } catch {
        // A malformed pair shouldn't discard the rest of the link.
      }
    }
  }

  return out as AuthLinkParams;
}

/** True when the link carries a usable recovery session. */
export function hasRecoveryTokens(params: AuthLinkParams): boolean {
  return Boolean(params.access_token && params.refresh_token);
}

/** A human-readable reason a recovery link failed, or null if it didn't. */
export function recoveryLinkError(params: AuthLinkParams): string | null {
  if (!params.error && !params.error_code) return null;
  if (params.error_code === 'otp_expired') {
    return 'This reset link has expired. Please request a new one.';
  }
  return 'This reset link is no longer valid. Please request a new one.';
}
