import { Outlet } from "react-router-dom";

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <Outlet />
    </div>
  );
}
