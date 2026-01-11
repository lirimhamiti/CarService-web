import { useEffect, useState } from "react";
import { getGarages } from "../api/garagesApi";
import type { GarageDto } from "../model/types";

import { CreateGarageForm } from "./CreateGarageForm";

export function GaragesPage() {
  const [garages, setGarages] = useState<GarageDto[]>([]);

  useEffect(() => {
    getGarages().then(setGarages);
  }, []);

  return (
    <div>
      <h1>Garages</h1>
      <CreateGarageForm />

      <ul>
        {garages.map(g => (
          <li key={g.id}>
            {g.name} – {g.city}
          </li>
        ))}
      </ul>
    </div>
  );
}
