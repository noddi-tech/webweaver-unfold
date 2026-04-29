const SANDBOX_DEV_ACCESS_KEY = "navio:sandbox-dev-access";

export function isSandboxPreviewHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovableproject.com") ||
    host.includes("id-preview--")
  );
}

export function isSandboxDevAccessEnabled() {
  if (!isSandboxPreviewHost()) return false;
  return window.localStorage.getItem(SANDBOX_DEV_ACCESS_KEY) === "1";
}

export function enableSandboxDevAccess() {
  if (!isSandboxPreviewHost()) return false;
  window.localStorage.setItem(SANDBOX_DEV_ACCESS_KEY, "1");
  return true;
}

export function disableSandboxDevAccess() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SANDBOX_DEV_ACCESS_KEY);
}
