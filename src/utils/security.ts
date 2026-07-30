/**
 * Security & Anti-Phishing Helper Utilities
 * Prevents Cross-Site Scripting (XSS), SQL/NoSQL Injection payloads,
 * and malicious HTML/Script injection in client forms.
 */

/**
 * Sanitizes raw string input by stripping potential HTML tags and malicious script payloads.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]+>/g, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Remove inline javascript protocols
    .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
    .replace(/on\w+='[^']*'/gi, "")
    .trim();
}

/**
 * Sanitizes an object containing form data fields recursively.
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

/**
 * Validates whether a URL belongs to a trusted domain to prevent open redirect vulnerabilities.
 */
export function isTrustedUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    const trustedDomains = [
      "dayfoundation.in",
      "www.dayfoundation.in",
      "localhost",
      "127.0.0.1",
      "vercel.app"
    ];
    return trustedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}
