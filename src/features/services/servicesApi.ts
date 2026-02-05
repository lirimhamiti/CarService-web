import type { AxiosError } from "axios";
import { http } from "../../shared/http/http";

export type CreateServiceRequest = {
  serviceDate: string;
  mileage: number;
  notes?: string;
};

export type ServiceDto = {
  id: string;
  carId: string;
  garageId: string;
  serviceDate: string;
  mileage: number;
  notes?: string | null;
  createdAt?: string | null;
};

function toServiceError(err: unknown): Error {
  const e = err as AxiosError<any>;
  const data = e.response?.data;

  if (typeof data === "string") return new Error(data);

  if (data?.detail) return new Error(String(data.detail));
  if (data?.message) return new Error(String(data.message));

  return new Error(e.message || "Failed to add service record.");
}

export async function createService(
  garageId: string,
  carId: string,
  body: CreateServiceRequest
): Promise<ServiceDto> {
  try {
    const { data } = await http.post<ServiceDto>(
      `/garages/${garageId}/cars/${carId}/services`,
      body
    );
    return data;
  } catch (err) {
    throw toServiceError(err);
  }
}

export async function getCarServices(
  garageId: string,
  carId: string
): Promise<ServiceDto[]> {
  const { data } = await http.get<ServiceDto[]>(
    `/garages/${garageId}/cars/${carId}/services`
  );
  return data;
}
