import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/layout/Layout";
import SaleLayout from "./components/layout/SaleLayout";
import AccountantLayout from "./components/layout/AccountantLayout";
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Workflows from "./pages/Workflows";
import Financials from "./pages/Financials";
import Showings from "./pages/Showings";
import Settings from "./pages/Settings";
import ApprovalHub from "./pages/ApprovalHub";
import Operations from "./pages/Operations";
import SaleDashboard from "./pages/sale/SaleDashboard";
import SaleRequests from "./pages/sale/SaleRequests";
import SaleAppointments from "./pages/sale/SaleAppointments";
import SaleCustomers from "./pages/sale/SaleCustomers";
import SaleDeposits from "./pages/sale/SaleDeposits";
import SaleContracts from "./pages/sale/SaleContracts";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AccountantTransactions from "./pages/accountant/AccountantTransactions";
import AccountantInvoices from "./pages/accountant/AccountantInvoices";
import AccountantReconciliation from "./pages/accountant/AccountantReconciliation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/role-select",
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
      { path: "settings", Component: Settings },
      { path: "approvals", Component: ApprovalHub },
      { path: "operations", Component: Operations },
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
      { path: "contracts", Component: SaleContracts },
    ],
  },
  {
    path: "/accountant",
    Component: AccountantLayout,
    children: [
      { index: true, element: <Navigate to="/accountant/dashboard" replace /> },
      { path: "dashboard", Component: AccountantDashboard },
      { path: "transactions", Component: AccountantTransactions },
      { path: "invoices", Component: AccountantInvoices },
      { path: "reconciliation", Component: AccountantReconciliation },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);