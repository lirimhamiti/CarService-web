import { http } from "../../../http/http";
import type { GarageDto } from "../model/types";

export async function getGarages(): Promise<GarageDto[]> {
  const res = await http.get<GarageDto[]>("/garages");
  return res.data;
}

export async function createGarage(
  name: string,
  city: string
): Promise<GarageDto> {
  const res = await http.post<GarageDto>("/garages", { name, city });
  return res.data;
}
