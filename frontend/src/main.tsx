import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AttendeeLandingPage from "./pages/attendee-landing-page.tsx";
import { AuthProvider } from "react-oidc-context";
import { createBrowserRouter, RouterProvider } from "react-router";
import OrganizersLandingPage from "./pages/organizers-landing-page.tsx";
import DashboardManageEventPage from "./pages/dashboard-manage-event-page.tsx";
import LoginPage from "./pages/login-page.tsx";
import ProtectedRoute from "./components/protected-route.tsx";
import CallbackPage from "./pages/callback-page.tsx";
import DashboardListEventsPage from "./pages/dashboard-list-events-page.tsx";
import PublishedEventsPage from "./pages/published-events-page.tsx";
import PurchaseTicketPage from "./pages/purchase-ticket-page.tsx";
import DashboardListTickets from "./pages/dashboard-list-tickets.tsx";
import DashboardPage from "./pages/dashboard-page.tsx";
import DashboardViewTicketPage from "./pages/dashboard-view-ticket-page.tsx";
import DashboardValidateQrPage from "./pages/dashboard-validate-qr-page.tsx";
import RecruiterDemoPage from "./pages/recruiter-demo-page.tsx";
import DashboardAdminPage from "./pages/dashboard-admin-page.tsx";
import { DemoAuthProvider } from "./context/demo-auth-context.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AttendeeLandingPage,
  },
  {
    path: "/demo",
    Component: RecruiterDemoPage,
  },
  {
    path: "/callback",
    Component: CallbackPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/events/:id",
    Component: PublishedEventsPage,
  },
  {
    path: "/events/:eventId/purchase/:ticketTypeId",
    element: (
      <ProtectedRoute allowedRoles={["ATTENDEE"]}>
        <PurchaseTicketPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/organizers",
    Component: OrganizersLandingPage,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <DashboardAdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/events",
    element: (
      <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
        <DashboardListEventsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/tickets",
    element: (
      <ProtectedRoute allowedRoles={["ATTENDEE"]}>
        <DashboardListTickets />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/tickets/:id",
    element: (
      <ProtectedRoute allowedRoles={["ATTENDEE"]}>
        <DashboardViewTicketPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/validate-qr",
    element: (
      <ProtectedRoute allowedRoles={["ORGANIZER", "STAFF", "ADMIN"]}>
        <DashboardValidateQrPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/events/create",
    element: (
      <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
        <DashboardManageEventPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/events/update/:id",
    element: (
      <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
        <DashboardManageEventPage />
      </ProtectedRoute>
    ),
  },
]);

const oidcConfig = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY ||
    "http://localhost:9090/realms/event-ticket-platform",
  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID || "event-ticket-platform-app",
  redirect_uri:
    import.meta.env.VITE_OIDC_REDIRECT_URI ||
    `${window.location.origin}/callback`,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <DemoAuthProvider>
        <RouterProvider router={router} />
      </DemoAuthProvider>
    </AuthProvider>
  </StrictMode>,
);
