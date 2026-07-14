/**
 * Shared typed fetch wrapper with auth headers and error handling.
 * Used across all client pages for API calls.
 */

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "UNKNOWN", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number };
  error?: { code: string; message: string };
}

/**
 * Fetch wrapper that:
 * - Adds JSON content-type header
 * - Parses the standardized API response format
 * - Throws ApiError on non-success responses
 * - Throws on network/parse errors
 */
export async function fetchApi<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const json: ApiResponse<T> = await res.json().catch(() => {
    throw new ApiError("Invalid JSON response", "PARSE_ERROR", res.status);
  });

  if (!json.success) {
    throw new ApiError(
      json.error?.message ?? "เกิดข้อผิดพลาด",
      json.error?.code ?? "UNKNOWN",
      res.status
    );
  }

  return json.data;
}

/**
 * Fetch wrapper that also returns meta (pagination info).
 */
export async function fetchApiWithMeta<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T; meta?: { total: number; page: number; limit: number } }> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const json: ApiResponse<T> = await res.json().catch(() => {
    throw new ApiError("Invalid JSON response", "PARSE_ERROR", res.status);
  });

  if (!json.success) {
    throw new ApiError(
      json.error?.message ?? "เกิดข้อผิดพลาด",
      json.error?.code ?? "UNKNOWN",
      res.status
    );
  }

  return { data: json.data, meta: json.meta };
}

/**
 * Simple SWR fetcher function compatible with useSWR.
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
  return fetchApi<T>(url);
};
