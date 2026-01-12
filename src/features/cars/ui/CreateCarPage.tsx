import { useState } from "react";
import { createCar } from "../api/carsApi";
import { getSession } from "../../auth/model/session";

export function CreateCarPage() {
  const session = getSession();
  const garageId = session?.garageId;

  const [plateNumber, setPlateNumber] = useState("");
  const [vin, setVin] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    if (!garageId) {
      setError("You must login first.");
      return;
    }

    setSaving(true);
    try {
      const dto = await createCar(garageId, {
        plateNumber,
        vin: vin || undefined,
      });
      setDone(`Car created: ${dto.plateNumber} (id: ${dto.id})`);
      setPlateNumber("");
      setVin("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to create car");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Create Car</h1>
      {session ? <p>Logged in as: {session.name}</p> : <p>Please login first.</p>}

      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 340 }}>
        <input
          value={plateNumber}
          onChange={e => setPlateNumber(e.target.value)}
          placeholder="Plate number"
          required
        />
        <input
          value={vin}
          onChange={e => setVin(e.target.value)}
          placeholder="VIN (optional)"
        />
        <button disabled={saving} type="submit">
          {saving ? "Creating..." : "Create"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {done && <p style={{ color: "green" }}>{done}</p>}
    </div>
  );
}
