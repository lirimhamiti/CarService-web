import { http } from "../../../shared/http/http";

export type GarageLoginRequest = { username: string; password: string };

export type GarageLoginResult = {
  garageId: string;
  name: string;
  city: string;
  username: string;
};

export async function loginGarage(body: GarageLoginRequest) {
  const res = await http.post<GarageLoginResult>("/garages/login", body);
  return res.data;
}
