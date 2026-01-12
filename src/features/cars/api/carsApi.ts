import { http } from "../../../shared/http/http";

export type CreateCarRequest = {
  plateNumber: string;
  vin?: string;
};

export type CarDto = {
  id: string;
  plateNumber: string;
  vin: string;
  garageId: string;
};

export async function createCar(garageId: string, body: CreateCarRequest) {
  const res = await http.post<CarDto>(`/garages/${garageId}/cars`, body);
  return res.data;
}
