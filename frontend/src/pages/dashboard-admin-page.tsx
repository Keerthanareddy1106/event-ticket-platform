import React, { useEffect, useState } from "react";
import NavBar from "@/components/nav-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppAuth } from "@/context/demo-auth-context";
import { EventSummary } from "@/domain/domain";
import {
  AdminOverviewStats,
  AdminPlatformUser,
  getAdminOverview,
  listAdminEvents,
  listAdminUsers,
} from "@/lib/api";
import { resetDemoData } from "@/lib/demo-store";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  QrCode,
  RotateCcw,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "react-router";

const DashboardAdminPage: React.FC = () => {
  const { user, isLoading } = useAppAuth();
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [users, setUsers] = useState<AdminPlatformUser[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const loadAdminData = async (token: string) => {
    try {
      setError(null);
      const [overviewData, usersData, eventsPage] = await Promise.all([
        getAdminOverview(token),
        listAdminUsers(token),
        listAdminEvents(token, 0),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
      setEvents(eventsPage.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin data",
      );
    }
  };

  useEffect(() => {
    if (!isLoading && user?.access_token) {
      loadAdminData(user.access_token);
    }
  }, [isLoading, user?.access_token]);

  const handleResetDemoDataset = () => {
    resetDemoData();
    setResetMessage(
      "Demo dataset restored to clean initial state. Protected seed events and sample QR tickets have been reset.",
    );
    if (user?.access_token) {
      loadAdminData(user.access_token);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-300 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>ADMINISTRATION CONSOLE (ROLE: ADMIN)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Platform Operations & Governance
            </h1>
            <p className="text-gray-400 text-sm">
              Oversee platform users, published events, ticket issuance, and
              protected demo dataset integrity.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleResetDemoDataset}
            className="border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Demo Dataset
          </Button>
        </div>

        {resetMessage && (
          <Alert className="bg-green-950/60 border-green-500/40 text-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle>Demo Dataset Restored</AlertTitle>
            <AlertDescription>{resetMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="bg-gray-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authorization or Server Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 flex items-center justify-between">
                  <span>Platform Users</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{overview.totalUsers}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Keycloak-provisioned identities
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 flex items-center justify-between">
                  <span>Total Events</span>
                  <Calendar className="w-4 h-4 text-purple-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{overview.totalEvents}</p>
                <p className="text-xs text-green-400 mt-1">
                  {overview.publishedEvents} published live
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 flex items-center justify-between">
                  <span>Tickets Issued</span>
                  <Ticket className="w-4 h-4 text-purple-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {overview.totalTicketsIssued}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Active QR-enabled tickets
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 flex items-center justify-between">
                  <span>QR Scans Verified</span>
                  <QrCode className="w-4 h-4 text-purple-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {overview.totalQrValidations}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Single-use redemption enforced
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Two Column Layout: Platform Identities & All Platform Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Directory of Provisioned Identities */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Keycloak Platform Identities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-white">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.role && (
                      <Badge
                        variant="outline"
                        className="border-purple-500/40 text-purple-200 font-mono text-xs"
                      >
                        {u.role}
                      </Badge>
                    )}
                    <Badge className="bg-green-900/50 text-green-300 border border-green-600/30 text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Platform Events Oversight */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Platform Events Oversight
              </CardTitle>
              <Link to="/dashboard/events">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-xs cursor-pointer"
                >
                  Manage Events
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {ev.name}
                    </p>
                    <p className="text-xs text-gray-400">{ev.venue}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-gray-700 text-gray-300 text-xs"
                  >
                    {ev.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdminPage;
