import { http } from "../../../shared/http/http";

export type CreateCarRequest = {
  plateNumber: string;
  vin: string;
};

export type CarDto = {
  id: string;
  plateNumber: string;
  vin: string;
  createdAt: string;
};

export async function createCar(garageId: string, body: CreateCarRequest) {
  const res = await http.post<CarDto>(`/garages/${garageId}/cars`, body);
  return res.data;
}

export async function getGarageCars(garageId: string) {
  const res = await http.get<CarDto[]>(`/garages/${garageId}/cars`);
  return res.data;
}

export async function getCarQrPng(carId: string) {
  const res = await http.get(`/cars/${carId}/qr`, { responseType: "blob" });
  return res.data as Blob;
}
