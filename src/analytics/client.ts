/**
 * OpenPanel event shipping client.
 *
 * Events are queued in the browser and flushed to the `analytics-ingest`
 * Supabase edge function, which signs them with the OpenPanel client secret
 * (never exposed to the bundle) and forwards them to https://analytics.noddi.co/api.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ouhfgazomdmirdazvjys.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const INGEST_URL = `${SUPABASE_URL}/functions/v1/analytics-ingest`;

const DEVICE_ID_KEY = "navio_analytics_device_id";
const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH = 100;

export type AnalyticsEvent = {
  type: "track" | "identify";
  name?: string;
  properties?: Record<string, unknown>;
  profileId?: string | null;
  deviceId?: string | null;
  timestamp?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    properties?: Record<string, unknown>;
  };
};

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getDeviceId(): string {
  const storage = safeStorage();
  const existing = storage?.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage?.setItem(DEVICE_ID_KEY, id);
  return id;
}

class AnalyticsClient {
  private queue: AnalyticsEvent[] = [];
  private profileId: string | null = null;
  private globalProperties: Record<string, unknown> = {};
  private timer: number | null = null;
  private started = false;

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;

    this.timer = window.setInterval(() => void this.flush(), FLUSH_INTERVAL_MS);
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("pagehide", this.handleUnload);
    window.addEventListener("beforeunload", this.handleUnload);
  }

  stop() {
    if (!this.started) return;
    this.started = false;
    if (this.timer) window.clearInterval(this.timer);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("pagehide", this.handleUnload);
    window.removeEventListener("beforeunload", this.handleUnload);
    this.flush(true);
  }

  private handleVisibility = () => {
    if (document.hidden) this.flush(true);
  };

  private handleUnload = () => {
    this.flush(true);
  };

  setGlobalProperties(properties: Record<string, unknown>) {
    this.globalProperties = { ...this.globalProperties, ...properties };
  }

  track(name: string, properties: Record<string, unknown> = {}) {
    this.queue.push({
      type: "track",
      name,
      timestamp: new Date().toISOString(),
      deviceId: getDeviceId(),
      profileId: this.profileId,
      properties: { ...this.globalProperties, ...properties },
    });
    if (this.queue.length >= MAX_BATCH) void this.flush();
  }

  identify(profileId: string, profile: AnalyticsEvent["profile"] = {}) {
    this.profileId = profileId;
    this.queue.push({
      type: "identify",
      profileId,
      deviceId: getDeviceId(),
      timestamp: new Date().toISOString(),
      profile: {
        ...profile,
        properties: { ...this.globalProperties, ...(profile.properties ?? {}) },
      },
    });
    void this.flush();
  }

  clearIdentity() {
    this.profileId = null;
  }

  async flush(keepalive = false): Promise<void> {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, MAX_BATCH);

    try {
      const response = await fetch(INGEST_URL, {
        method: "POST",
        keepalive,
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ events: batch }),
      });
      if (!response.ok) {
        console.warn("[analytics] flush failed", response.status);
      }
    } catch (error) {
      console.warn("[analytics] flush error", error);
    }
  }
}

export const analytics = new AnalyticsClient();
