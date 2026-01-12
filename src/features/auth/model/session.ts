import type { GarageLoginResult } from "../api/authApi";
// session set and clear for the app
const KEY = "garage_session";

export function saveSession(data: GarageLoginResult) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getSession(): GarageLoginResult | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as GarageLoginResult) : null;
}

export function getGarageId(): string | null {
  return getSession()?.garageId ?? null;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
