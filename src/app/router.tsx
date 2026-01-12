import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { GaragesPage } from "../features/garages/ui/GaragesPage";
import { PendingGaragesPage } from "../features/admin/ui/PendingGaragesPage";
import { GarageLoginPage } from "../features/auth/ui/GarageLoginPage";
import { CreateCarPage } from "../features/cars/ui/CreateCarPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <GaragesPage /> },            
      { path: "admin/pending", element: <PendingGaragesPage /> },
      { path: "garage/login", element: <GarageLoginPage /> },
      { path: "garage/cars/new", element: <CreateCarPage /> },

    ],
  },
]);
