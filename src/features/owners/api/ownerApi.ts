import { http } from "../../../shared/http/http";

export type OwnerCarDto = {
  carId: string;
  plateNumber: string;
  vin: string;
  currentGarageId: string;
};

export type OwnerServiceRecordDto = {
  id: string;
  serviceDate: string;
  mileage: number;
  notes?: string | null;
  createdAt: string;
};

export async function ownerGetCarByVin(vin: string) {
  const { data } = await http.get<OwnerCarDto>(`/owner/cars/by-vin/${encodeURIComponent(vin)}`);
  return data;
}

export async function ownerGetServicesByVin(vin: string) {
  const { data } = await http.get<OwnerServiceRecordDto[]>(
    `/owner/cars/by-vin/${encodeURIComponent(vin)}/services`
  );
  return data;
}

export async function ownerGetCarByToken(token: string) {
  const { data } = await http.get<OwnerCarDto>(`/owner/cars/by-token/${encodeURIComponent(token)}`);
  return data;
}

export async function ownerGetServicesByToken(token: string) {
  const { data } = await http.get<OwnerServiceRecordDto[]>(
    `/owner/cars/by-token/${encodeURIComponent(token)}/services`
  );
  return data;
}
