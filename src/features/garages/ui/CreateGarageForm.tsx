import { useState } from "react";
import { createGarage } from "../api/garagesApi";

export function CreateGarageForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createGarage(name, city);
    setName("");
    setCity("");
  }

  return (
    <form onSubmit={submit}>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder="City"
        value={city}
        onChange={e => setCity(e.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  );
}
