import { http } from "../../../shared/http/http";
import axios, { type AxiosError } from "axios";

export type GarageLoginRequest = { username: string; password: string };

export type GarageLoginResult = {
  garageId: string;
  name: string;
  city: string;
  username: string;
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
};

function toFriendlyLoginError(err: unknown): Error {
  if (!axios.isAxiosError(err)) {
    const msg = (err as any)?.message;
    return new Error(msg || "Login failed. Please try again.");
  }

  const e = err as AxiosError<ProblemDetails>;
  const status = e.response?.status;
  const title = (e.response?.data?.title ?? "").toLowerCase();
  const detail = e.response?.data?.detail ?? "";

  if (status === 403) {
    if (title.includes("pending")) return new Error(detail || "Your account is pending admin approval.");
    if (title.includes("rejected")) return new Error(detail || "Your account was rejected. Please contact support.");
    return new Error(detail || "Login is not allowed for this account.");
  }

  if (status === 401) {
    return new Error(detail || "Invalid username or password.");
  }

  return new Error(detail || "Login failed. Please try again.");
}

export async function loginGarage(body: GarageLoginRequest) {
  try {
    const res = await http.post<GarageLoginResult>("/garages/login", body);
    return res.data;
  } catch (err) {
    throw toFriendlyLoginError(err);
  }
}
