/**
 * Centralized Security, Input Sanitization, and Rate Limiting Service
 * Protects Bharat Yatra from XSS, injection vectors, malicious redirect schemes, and API flooding.
 */

export class SecurityService {
  private static actionTimestamps: Map<string, number[]> = new Map();

  /**
   * Sanitizes plain text input by stripping script tags, malicious HTML, and encoded event handlers.
   */
  public static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/data\s*:[^;]+;base64/gi, '')
      .trim();
  }

  /**
   * Validates if a URL is safe to navigate or embed (HTTP/HTTPS only).
   */
  public static isSafeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
      return false;
    }
    return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/') || trimmed.startsWith('#');
  }

  /**
   * Enforces client-side rate limiting on high-frequency or sensitive user actions.
   * @param actionKey Identifier for the action (e.g., 'search_query', 'booking_submit')
   * @param maxRequests Maximum allowed invocations within windowMs
   * @param windowMs Time window in milliseconds (default 5000ms)
   * @returns true if allowed, false if rate limited
   */
  public static checkRateLimit(actionKey: string, maxRequests: number = 10, windowMs: number = 5000): boolean {
    const now = Date.now();
    const timestamps = this.actionTimestamps.get(actionKey) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return false;
    }

    recent.push(now);
    this.actionTimestamps.set(actionKey, recent);
    return true;
  }

  /**
   * Masks sensitive information like emails, phone numbers, or card numbers for logs or previews.
   */
  public static maskSensitive(val: string, type: 'email' | 'phone' | 'card'): string {
    if (!val) return '';
    if (type === 'email') {
      const parts = val.split('@');
      if (parts.length !== 2) return '***@***.com';
      const name = parts[0];
      const masked = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
      return `${masked}@${parts[1]}`;
    }
    if (type === 'phone') {
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length < 4) return '******';
      return `******${cleaned.slice(-4)}`;
    }
    if (type === 'card') {
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length < 4) return '****';
      return `**** **** **** ${cleaned.slice(-4)}`;
    }
    return val;
  }
}
