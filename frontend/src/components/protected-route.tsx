import { ReactNode } from "react";
import { useAppAuth } from "@/context/demo-auth-context";
import { AppRoleName, useRoles } from "@/hooks/use-roles";
import { Link, Navigate, useLocation } from "react-router";
import NavBar from "./nav-bar";
import { Button } from "./ui/button";
import { ShieldAlert, Users } from "lucide-react";

interface ProtectedRouteProperties {
  children: ReactNode;
  allowedRoles?: AppRoleName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProperties> = ({
  children,
  allowedRoles,
}) => {
  const { isLoading: isAuthLoading, isAuthenticated, activeIdentityUsername } =
    useAppAuth();
  const {
    isLoading: isRolesLoading,
    primaryRole,
    isAdmin,
    isOrganizer,
    isAttendee,
    isStaff,
  } = useRoles();
  const location = useLocation();

  if (isAuthLoading || isRolesLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    localStorage.setItem(
      "redirectPath",
      globalThis.location.pathname + globalThis.location.search,
    );
    return <Navigate to="/demo" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => {
      if (role === "ADMIN") return isAdmin;
      if (role === "ORGANIZER") return isOrganizer;
      if (role === "ATTENDEE") return isAttendee;
      if (role === "STAFF") return isStaff;
      return false;
    });

    if (!hasPermission) {
      const authorizedDashboard = isAdmin
        ? "/dashboard/admin"
        : isOrganizer
          ? "/dashboard/events"
          : "/dashboard/tickets";

      return (
        <div className="min-h-screen bg-black text-white">
          <NavBar />
          <div className="container mx-auto px-4 py-16 max-w-lg text-center">
            <div className="bg-gray-900 border border-red-500/40 rounded-2xl p-8 space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7 text-red-400" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold">
                  HTTP 403 Forbidden — RBAC Policy Enforced
                </span>
                <h1 className="text-2xl font-bold text-white">
                  Access Denied for Current Role
                </h1>
                <p className="text-sm text-gray-300">
                  Your currently authenticated Keycloak identity{" "}
                  <span className="font-mono font-semibold text-white">
                    {activeIdentityUsername || "user"}
                  </span>{" "}
                  carries role{" "}
                  <span className="font-mono font-semibold text-purple-300">
                    {primaryRole || "NONE"}
                  </span>
                  , which is not authorized to access this route.
                </p>
                <p className="text-xs font-mono text-gray-400">
                  Required role: {allowedRoles.join(" or ")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link to={authorizedDashboard}>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-white cursor-pointer"
                  >
                    Go to My Dashboard
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white cursor-pointer">
                    <Users className="w-4 h-4 mr-1.5" />
                    Switch Demo Identity
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
