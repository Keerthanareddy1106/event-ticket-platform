import React from "react";
import { useAppAuth } from "@/context/demo-auth-context";
import { useRoles } from "@/hooks/use-roles";
import { KeyRound, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "react-router";

export const DemoRoleSwitcher: React.FC = () => {
  const { isAuthenticated, activeIdentityUsername } = useAppAuth();
  const { primaryRole } = useRoles();
  const location = useLocation();

  return (
    <div className="bg-gray-950 border-b border-gray-800 text-white text-xs sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Keycloak RBAC Demo
          </span>
          {isAuthenticated && activeIdentityUsername ? (
            <span className="text-gray-300">
              Authenticated as{" "}
              <strong className="font-mono text-white">
                {activeIdentityUsername}
              </strong>{" "}
              {primaryRole && (
                <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-500/40 text-purple-200 font-mono text-[11px] ml-1">
                  {primaryRole}
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-400">
              Unauthenticated Visitor — Select an independent Keycloak role
              identity to test RBAC
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {location.pathname !== "/demo" && (
            <Link
              to="/demo"
              className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium inline-flex items-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {isAuthenticated
                  ? "Switch Demo Identity"
                  : "Explore Demo Roles"}
              </span>
            </Link>
          )}
          {location.pathname === "/demo" && (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              3 Isolated Identities: demo_admin • demo_organizer • demo_attendee
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoRoleSwitcher;
