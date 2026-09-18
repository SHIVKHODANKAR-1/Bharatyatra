export type PlatformEventType =
  | 'app_opened'
  | 'page_viewed'
  | 'tab_changed'
  | 'search_submitted'
  | 'filter_applied'
  | 'destination_viewed'
  | 'experience_viewed'
  | 'trip_created'
  | 'trip_exported'
  | 'map_interaction'
  | 'weather_checked'
  | 'booking_initiated'
  | 'booking_completed'
  | 'review_submitted'
  | 'notification_action'
  | 'ai_assistant_query'
  | 'location_permission_action'
  | 'error_displayed';

export interface AnalyticsRecord {
  id: string;
  type: PlatformEventType | string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsAggregateSummary {
  totalEvents: number;
  topEvents: { type: string; count: number }[];
  recentEvents: AnalyticsRecord[];
  activeSessionDurationMinutes: number;
}

const STORAGE_KEY = 'bharat_yatra_analytics_events_v1';
const SESSION_START_KEY = 'bharat_yatra_analytics_session_start';
const OPT_OUT_KEY = 'bharat_yatra_analytics_opt_out';

export class AnalyticsService {
  private static sessionStart: number = (() => {
    const existing = sessionStorage.getItem(SESSION_START_KEY);
    if (existing) return parseInt(existing, 10);
    const now = Date.now();
    sessionStorage.setItem(SESSION_START_KEY, now.toString());
    return now;
  })();

  public static isOptedOut(): boolean {
    return localStorage.getItem(OPT_OUT_KEY) === 'true';
  }

  public static setOptOut(optOut: boolean): void {
    localStorage.setItem(OPT_OUT_KEY, optOut ? 'true' : 'false');
  }

  private static getStored(): AnalyticsRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  }

  private static saveStored(records: AnalyticsRecord[]): void {
    try {
      // Keep up to 200 events
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 200)));
    } catch {
      // ignore
    }
  }

  /**
   * Sanitizes the payload to ensure zero personally identifiable information (PII) is recorded.
   */
  private static sanitizePayload(payload?: Record<string, unknown>): Record<string, unknown> {
    if (!payload) return {};
    const sanitized: Record<string, unknown> = {};
    const piiFields = ['password', 'token', 'email', 'phone', 'mobile', 'card', 'cvv', 'name', 'address'];

    for (const [key, val] of Object.entries(payload)) {
      if (piiFields.some((f) => key.toLowerCase().includes(f))) {
        sanitized[key] = '[ANONYMIZED]';
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  public static track(type: PlatformEventType | string, payload?: Record<string, unknown>): AnalyticsRecord | null {
    if (this.isOptedOut()) return null;

    const record: AnalyticsRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload: this.sanitizePayload(payload),
      timestamp: new Date().toISOString(),
    };

    const list = this.getStored();
    const updated = [record, ...list];
    this.saveStored(updated);
    return record;
  }

  public static getEvents(): AnalyticsRecord[] {
    return this.getStored();
  }

  public static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  public static getSummary(): AnalyticsAggregateSummary {
    const events = this.getStored();
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }

    const topEvents = Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const sessionDurationMinutes = Math.max(1, Math.round((Date.now() - this.sessionStart) / 60000));

    return {
      totalEvents: events.length,
      topEvents,
      recentEvents: events.slice(0, 30),
      activeSessionDurationMinutes: sessionDurationMinutes,
    };
  }

  public static exportJSON(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        summary: this.getSummary(),
        events: this.getEvents(),
      },
      null,
      2
    );
  }
}
