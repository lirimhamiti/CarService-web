import { http } from "../../../shared/http/http";
import type { GarageDto } from "../../garages/model/types";

export async function getPendingGarages() {
  const res = await http.get<GarageDto[]>("/admin/garages/pending");
  return res.data;
}

export async function approveGarage(id: string) {
  const res = await http.post<GarageDto>(`/admin/garages/${id}/approve`, {});
  return res.data;
}

export async function rejectGarage(id: string) {
  const res = await http.post<GarageDto>(`/admin/garages/${id}/reject`, {});
  return res.data;
}
