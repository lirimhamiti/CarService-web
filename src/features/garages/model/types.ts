export type GarageDto = {
  id: string;
  name: string;
  city: string;
  email: string;
  username: string;
  status: string; 
};

export type RegisterGarageRequest = {
  name: string;
  city: string;
  email: string;
  username: string;
  password: string;
};
