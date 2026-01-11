import { useState } from "react";
import { createGarage } from "../api/garagesApi";

type Props = {
  onCreated: () => void | Promise<void>;
};

export function CreateGarageForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createGarage({ name, city });
      setName("");
      setCity("");
      await onCreated();
    } catch {
      setError("Failed to create garage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" required />
      <button type="submit" disabled={saving}>
        {saving ? "Creating..." : "Create"}
      </button>
      {error && <span>{error}</span>}
    </form>
  );
}
