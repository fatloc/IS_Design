import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/layout/Layout";
import SaleLayout from "./components/layout/SaleLayout";
import RoleSelect from "./pages/RoleSelect";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Workflows from "./pages/Workflows";
import Financials from "./pages/Financials";
import Showings from "./pages/Showings";
import SaleDashboard from "./pages/sale/SaleDashboard";
import SaleRequests from "./pages/sale/SaleRequests";
import SaleAppointments from "./pages/sale/SaleAppointments";
import SaleCustomers from "./pages/sale/SaleCustomers";
import SaleDeposits from "./pages/sale/SaleDeposits";
import Login from "./pages/Login";
import Register from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: RoleSelect,
  },
  {
    path: "/manager",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/manager/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "rooms", Component: Rooms },
      { path: "workflows", Component: Workflows },
      { path: "financials", Component: Financials },
      { path: "showings", Component: Showings },
    ],
  },
  {
    path: "/sale",
    Component: SaleLayout,
    children: [
      { index: true, element: <Navigate to="/sale/dashboard" replace /> },
      { path: "dashboard", Component: SaleDashboard },
      { path: "requests", Component: SaleRequests },
      { path: "appointments", Component: SaleAppointments },
      { path: "customers", Component: SaleCustomers },
      { path: "deposits", Component: SaleDeposits },
    ],
  },
  {
    path: "/accountant/dashboard",
    Component: Financials,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
