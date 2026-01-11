import { useEffect, useState } from "react";
import { getGarages } from "../api/garagesApi";
import type { GarageDto } from "../model/types";
import { CreateGarageForm } from "./CreateGarageForm";

export function GaragesPage() {
  const [items, setItems] = useState<GarageDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getGarages());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <h1>Garages</h1>
      <CreateGarageForm onCreated={load} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {items.map(g => (
            <li key={g.id}>
              {g.name} – {g.city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
