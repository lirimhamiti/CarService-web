import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { GaragesPage } from "../features/garages/ui/GaragesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <GaragesPage /> },
      { path: "garages", element: <GaragesPage /> }
    ]
  }
]);
