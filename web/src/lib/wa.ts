interface FonnteResponse {
  status: boolean;
  detail?: string;
  id?: string;
}

interface FonnteOptions {
  url?: string;
  filename?: string;
  schedule?: number;
  typing?: boolean;
  delay?: number;
  countryCode?: string;
  file?: File | null;
  location?: string;
  followup?: number;
  inboxid?: number;
  duration?: number;
}

interface NotificationResult {
  success: boolean;
  error?: string;
  errorType?: 'CONFIG_MISSING' | 'NETWORK_ERROR' | 'API_ERROR' | 'UNKNOWN';
}

/**
 * Send WhatsApp notification with proper error handling
 */
export async function sendWANotification(
  phone: string,
  message: string,
  options?: FonnteOptions
): Promise<FonnteResponse> {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

  if (!FONNTE_TOKEN) {
    console.warn("[WA] FONNTE_TOKEN not configured, skipping WA notification");
    return { status: false, detail: "Fonnte token not configured" };
  }

  // Format phone: 08xx -> 628xx, keep 62xx as is
  let formattedPhone = phone.replace(/^0/, "62");

  const formData = new FormData();
  formData.append("target", formattedPhone);
  formData.append("message", message);

  if (options?.schedule) formData.append("schedule", String(options.schedule));
  if (options?.typing !== undefined) formData.append("typing", String(options.typing));
  if (options?.delay) formData.append("delay", String(options.delay));
  if (options?.countryCode) formData.append("countryCode", options.countryCode);
  if (options?.url) formData.append("url", options.url);
  if (options?.filename) formData.append("filename", options.filename);
  if (options?.location) formData.append("location", options.location);
  if (options?.followup) formData.append("followup", String(options.followup));
  if (options?.inboxid) formData.append("inboxid", String(options.inboxid));
  if (options?.duration) formData.append("duration", String(options.duration));
  if (options?.file) formData.append("file", options.file);

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[WA] Network error sending notification:", error);
    return { status: false, detail: String(error) };
  }
}

/**
 * Send WhatsApp notification with result object (better for error tracking)
 */
export async function sendWANotificationWithResult(
  phone: string,
  message: string,
  options?: FonnteOptions
): Promise<NotificationResult> {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

  if (!FONNTE_TOKEN) {
    console.warn("[WA] FONNTE_TOKEN not configured, skipping WA notification");
    return {
      success: false,
      error: "FONNTE_TOKEN not configured",
      errorType: 'CONFIG_MISSING'
    };
  }

  // Format phone: 08xx -> 628xx, keep 62xx as is
  let formattedPhone = phone.replace(/^0/, "62");

  const formData = new FormData();
  formData.append("target", formattedPhone);
  formData.append("message", message);

  if (options?.schedule) formData.append("schedule", String(options.schedule));
  if (options?.typing !== undefined) formData.append("typing", String(options.typing));
  if (options?.delay) formData.append("delay", String(options.delay));
  if (options?.countryCode) formData.append("countryCode", options.countryCode);
  if (options?.url) formData.append("url", options.url);
  if (options?.filename) formData.append("filename", options.filename);
  if (options?.location) formData.append("location", options.location);
  if (options?.followup) formData.append("followup", String(options.followup));
  if (options?.inboxid) formData.append("inboxid", String(options.inboxid));
  if (options?.duration) formData.append("duration", String(options.duration));
  if (options?.file) formData.append("file", options.file);

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return {
        success: false,
        error: data.detail || "API returned error",
        errorType: 'API_ERROR'
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[WA] Network error:", error);
    return {
      success: false,
      error: String(error),
      errorType: 'NETWORK_ERROR'
    };
  }
}
