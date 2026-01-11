import { http } from "../../../shared/http/http";
import type { GarageDto } from "../model/types";

export async function getGarages() {
  const res = await http.get<GarageDto[]>("/garages");
  return res.data;
}

export async function createGarage(body: { name: string; city: string }) {
  const res = await http.post<GarageDto>("/garages", body);
  return res.data;
}
