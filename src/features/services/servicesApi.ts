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


export async function createService(
  garageId: string,
  carId: string,
  body: CreateServiceRequest
): Promise<ServiceDto> {
  const { data } = await http.post<ServiceDto>(
    `/garages/${garageId}/cars/${carId}/services`,
    body
  );
  return data;
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

