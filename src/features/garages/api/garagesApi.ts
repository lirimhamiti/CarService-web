import { http } from "../../../shared/http/http";
import type { GarageDto, RegisterGarageRequest } from "../model/types";

export async function registerGarage(body: RegisterGarageRequest) {
  const res = await http.post<GarageDto>("/garages/register", body);
  return res.data;
}