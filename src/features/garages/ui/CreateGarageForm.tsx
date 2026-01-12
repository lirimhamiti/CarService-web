import { useState } from "react";
import { registerGarage } from "../api/garagesApi";

export function CreateGarageForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    setSaving(true);

    try {
      const dto = await registerGarage({ name, city, email, username, password });
      setDone(`Registered. Status: ${dto.status}. Wait for admin approval.`);
      setName("");
      setCity("");
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to register garage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <h2>Garage Registration</h2>

      <input value={name} onChange={e => setName(e.target.value)} placeholder="Garage name" required />
      <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" required />

      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />

      <button type="submit" disabled={saving}>
        {saving ? "Registering..." : "Register"}
      </button>

      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {done && <div style={{ color: "green" }}>{done}</div>}
    </form>
  );
}
