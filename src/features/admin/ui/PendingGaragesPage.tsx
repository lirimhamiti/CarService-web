import { useEffect, useState } from "react";
import type { GarageDto } from "../../garages/model/types";
import { approveGarage, getPendingGarages, rejectGarage } from "../api/adminApi";

export function PendingGaragesPage() {
  const [items, setItems] = useState<GarageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getPendingGarages());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: string) => {
    await approveGarage(id);
    await load();
  };

  const reject = async (id: string) => {
    await rejectGarage(id);
    await load();
  };

  return (
    <div>
      <h1>Admin – Pending Garages</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No pending garages.</p>
      ) : (
        <ul>
          {items.map(g => (
            <li key={g.id} style={{ marginBottom: 10 }}>
              <div>
                <b>{g.name}</b> – {g.city} ({g.email}) [{g.username}]
              </div>
              <button onClick={() => approve(g.id)}>Approve</button>{" "}
              <button onClick={() => reject(g.id)}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
