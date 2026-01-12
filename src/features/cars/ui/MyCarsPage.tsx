import { useEffect, useState } from "react";
import { getGarageCars } from "../api/carsApi";
import type { CarDto } from "../../cars/api/carsApi";
import { getGarageId } from "../../auth/model/session";

export function MyCarsPage() {
  const [items, setItems] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);

    const garageId = getGarageId();
    if (!garageId) {
      setLoading(false);
      setItems([]);
      setError("No garage logged in (missing garageId).");
      return;
    }

    try {
      const cars = await getGarageCars(garageId);
      setItems(cars);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <h1>My Cars</h1>

      <button onClick={load} disabled={loading}>
        Refresh
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No cars yet.</p>
      ) : (
        <ul>
          {items.map(c => (
            <li key={c.id}>
              <b>{c.plateNumber}</b> — VIN: {c.vin || "-"} — Created:{" "}
              {new Date(c.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
