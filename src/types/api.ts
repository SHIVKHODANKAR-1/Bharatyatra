/**
 * Bharat Yatra Standard API Envelope (Section 8)
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  error: ApiError | null;
  meta: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | string[];
}

export interface ApiMeta {
  requestId?: string;
  timestamp: string;
  serverTimeMs?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
