import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { GaragesPage } from "../features/garages/ui/GaragesPage";
import { PendingGaragesPage } from "../features/admin/ui/PendingGaragesPage";
import { GarageLoginPage } from "../features/auth/ui/GarageLoginPage";
import { MyCarsPage } from "../features/cars/ui/MyCarsPage";
import { CarServicesPageHistory } from "../features/services/ui/CarServicesPageHistory";
import { OwnerHomePage } from "../features/owners/ui/OwnerHomePage";
import { OwnerScanQrPage } from "../features/owners/ui/OwnerScanQrPage";
import { OwnerCarHistoryPage } from "../features/owners/ui/OwnerCarHistoryPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <GaragesPage /> },
      { path: "admin/pending", element: <PendingGaragesPage /> },
      { path: "garage/login", element: <GarageLoginPage /> },
      { path: "garage/cars", element: <MyCarsPage /> },
      { path: "garage/cars/:carId/history", element: <CarServicesPageHistory /> },
      { path: "owner", element: <OwnerHomePage /> },
      { path: "owner/scan", element: <OwnerScanQrPage /> },
      { path: "owner/history/:tokenOrCarId", element: <CarServicesPageHistory /> },
      { path: "owner/history/:kind/:value", element: <OwnerCarHistoryPage /> },

    ],
  },
]);
