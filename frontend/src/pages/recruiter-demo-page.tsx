import React, { useState } from "react";
import NavBar from "@/components/nav-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoIdentityKey, useAppAuth } from "@/context/demo-auth-context";
import { useRoles } from "@/hooks/use-roles";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Shield,
  Ticket,
} from "lucide-react";
import { useNavigate } from "react-router";

interface DemoRoleCardConfig {
  identityKey: DemoIdentityKey;
  title: string;
  roleLabel: "ADMIN" | "ORGANIZER" | "ATTENDEE";
  description: string;
  buttonText: string;
  permissions: string[];
  icon: React.ReactNode;
}

const DEMO_ROLE_CARDS: DemoRoleCardConfig[] = [
  {
    identityKey: "demo_admin",
    title: "Administrator",
    roleLabel: "ADMIN",
    description:
      "Explore administrative capabilities, manage platform users, oversee events, and access platform-level operations.",
    buttonText: "Explore as Admin",
    permissions: [
      "Platform-wide metrics & user directory (/api/v1/admin/**)",
      "Oversee all organizer events across the platform",
      "Protected demo dataset safeguards enabled",
    ],
    icon: <Shield className="w-6 h-6 text-purple-400" />,
  },
  {
    identityKey: "demo_organizer",
    title: "Event Organizer",
    roleLabel: "ORGANIZER",
    description:
      "Create and manage events, monitor registrations, manage bookings, and validate attendee tickets.",
    buttonText: "Explore as Organizer",
    permissions: [
      "Create, update, and publish events (/api/v1/events/**)",
      "Scan and validate attendee QR tickets (/api/v1/ticket-validations)",
      "Cannot access Admin-only platform user endpoints (HTTP 403)",
    ],
    icon: <Calendar className="w-6 h-6 text-purple-400" />,
  },
  {
    identityKey: "demo_attendee",
    title: "Attendee",
    roleLabel: "ATTENDEE",
    description:
      "Browse available events, book tickets, view bookings, and access QR-enabled event tickets.",
    buttonText: "Explore as Attendee",
    permissions: [
      "Browse published events & book tickets",
      "View personal tickets & generated QR codes (/api/v1/tickets/**)",
      "Restricted from Organizer & Admin endpoints (HTTP 403)",
    ],
    icon: <Ticket className="w-6 h-6 text-purple-400" />,
  },
];

const RecruiterDemoPage: React.FC = () => {
  const {
    isAuthenticated,
    activeIdentityUsername,
    isAuthenticatingIdentity,
    authError,
    authenticateDemoIdentity,
    signoutRedirect,
  } = useAppAuth();
  const { primaryRole } = useRoles();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSelectIdentity = async (identityKey: DemoIdentityKey) => {
    setLocalError(null);
    try {
      const targetDashboard = await authenticateDemoIdentity(identityKey);
      navigate(targetDashboard);
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
    }
  };

  const displayError = localError || authError;

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-medium">
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            Keycloak Role-Based Access Control (RBAC)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore the Event Ticket Platform
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Experience the platform through three different user roles.
          </p>
        </div>

        {/* Active Identity Status Banner */}
        {isAuthenticated && activeIdentityUsername && (
          <div className="mb-8 bg-gray-900/90 border border-gray-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <div className="text-sm">
                <span className="text-gray-400">
                  Currently authenticated identity:{" "}
                </span>
                <span className="font-mono font-semibold text-white">
                  {activeIdentityUsername}
                </span>
                {primaryRole && (
                  <Badge className="ml-2 bg-purple-600/30 text-purple-200 border border-purple-500/40">
                    Role: {primaryRole}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">
                Selecting a different role below will terminate this session and
                authenticate the new identity.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signoutRedirect("/demo")}
                className="border-gray-700 bg-gray-950 hover:bg-gray-800 text-gray-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                End Session
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {displayError && (
          <div className="mb-8">
            <Alert variant="destructive" className="bg-gray-900 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Three Independent Demo Identity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_ROLE_CARDS.map((card) => {
            const isCurrentIdentity =
              isAuthenticated && activeIdentityUsername === card.identityKey;
            const isLoadingThisCard =
              isAuthenticatingIdentity === card.identityKey;

            return (
              <Card
                key={card.identityKey}
                className={`bg-gray-900 text-white flex flex-col justify-between transition border ${
                  isCurrentIdentity
                    ? "border-purple-500 shadow-lg shadow-purple-950/30"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                <div>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800">
                        {card.icon}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-500/40 bg-purple-950/40 text-purple-200 font-mono text-xs"
                      >
                        Role: {card.roleLabel}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        {card.title}
                      </CardTitle>
                      <p className="text-xs font-mono text-gray-400 mt-1">
                        Keycloak identity: {card.identityKey}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {card.description}
                    </p>

                    <div className="border-t border-gray-800 pt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Enforced Permissions
                      </p>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        {card.permissions.map((perm) => (
                          <li key={perm} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-4 border-t border-gray-800/80">
                  <Button
                    type="button"
                    disabled={isAuthenticatingIdentity !== null}
                    onClick={() => handleSelectIdentity(card.identityKey)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white h-11 font-semibold cursor-pointer"
                  >
                    {isLoadingThisCard ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating {card.identityKey}...
                      </>
                    ) : (
                      card.buttonText
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default RecruiterDemoPage;
