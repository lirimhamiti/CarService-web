import { useState } from "react";
import { loginGarage } from "../api/authApi";
import { saveSession } from "../model/session";

export function GarageLoginPage() {
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
      const result = await loginGarage({ username, password });
      saveSession(result);
      setDone(`Logged in as ${result.name}`);
    } catch (e: any) {
      setError(e?.message ?? "Login failed (maybe not approved yet).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Garage Login</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
        <button type="submit" disabled={saving}>{saving ? "Logging in..." : "Login"}</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {done && <p style={{ color: "green" }}>{done}</p>}
      </form>
    </div>
  );
}
