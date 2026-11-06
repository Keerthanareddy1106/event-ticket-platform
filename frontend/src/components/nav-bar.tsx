import { useAppAuth } from "@/context/demo-auth-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Calendar,
  Compass,
  KeyRound,
  LogIn,
  LogOut,
  QrCode,
  Shield,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useRoles } from "@/hooks/use-roles";
import { Link, useLocation, useNavigate } from "react-router";
import DemoRoleSwitcher from "./demo-role-switcher";
import { Button } from "./ui/button";

const NavBar: React.FC = () => {
  const { user, isAuthenticated, signinRedirect, signoutRedirect } =
    useAppAuth();
  const { isAdmin, isOrganizer, isAttendee, isStaff, primaryRole } = useRoles();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive(path)
        ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
        : "text-gray-300 hover:text-white hover:bg-gray-900"
    }`;

  return (
    <>
      <DemoRoleSwitcher />
      <header className="bg-gray-950/90 border-b border-gray-800 text-white backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 md:gap-10 items-center">
              <Link
                to="/"
                className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent flex items-center gap-2"
              >
                <Ticket className="w-6 h-6 text-purple-400" />
                Event Ticket Platform
              </Link>

              <nav className="flex flex-wrap items-center gap-1.5">
                <Link to="/" className={navLinkClass("/")}>
                  <Compass className="w-4 h-4" />
                  <span>Explore Events</span>
                </Link>

                <Link to="/demo" className={navLinkClass("/demo")}>
                  <KeyRound className="w-4 h-4" />
                  <span>Demo Roles</span>
                </Link>

                {isAuthenticated && isAdmin && (
                  <Link
                    to="/dashboard/admin"
                    className={navLinkClass("/dashboard/admin")}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Console</span>
                  </Link>
                )}

                {isAuthenticated && (isOrganizer || isAdmin) && (
                  <Link
                    to="/dashboard/events"
                    className={navLinkClass("/dashboard/events")}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Organizer Events</span>
                  </Link>
                )}

                {isAuthenticated && isAttendee && (
                  <Link
                    to="/dashboard/tickets"
                    className={navLinkClass("/dashboard/tickets")}
                  >
                    <Ticket className="w-4 h-4" />
                    <span>My Tickets</span>
                  </Link>
                )}

                {isAuthenticated && isStaff && (
                  <Link
                    to="/dashboard/validate-qr"
                    className={navLinkClass("/dashboard/validate-qr")}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Validate QR</span>
                  </Link>
                )}

                <Link to="/organizers" className={navLinkClass("/organizers")}>
                  <Sparkles className="w-4 h-4" />
                  <span>For Organizers</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer outline-none">
                    <div className="flex items-center gap-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-full pl-3 pr-1.5 py-1 transition">
                      <span className="text-xs font-mono font-medium text-gray-200 hidden sm:inline">
                        {user.profile?.preferred_username}
                        {primaryRole ? ` (${primaryRole})` : ""}
                      </span>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-purple-700 text-white text-xs font-bold">
                          {user.profile?.preferred_username
                            ?.slice(0, 2)
                            .toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-60 bg-gray-900 border-gray-700 text-white"
                    align="end"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-semibold font-mono">
                        {user.profile?.preferred_username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user.profile?.email}
                      </p>
                      {primaryRole && (
                        <p className="text-xs text-purple-300 font-mono mt-1">
                          Role: {primaryRole}
                        </p>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate("/demo")}
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      <span>Switch Demo Identity</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        className="hover:bg-gray-800 cursor-pointer"
                        onClick={() => navigate("/dashboard/admin")}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        <span>Admin Console</span>
                      </DropdownMenuItem>
                    )}
                    {(isOrganizer || isAdmin) && (
                      <DropdownMenuItem
                        className="hover:bg-gray-800 cursor-pointer"
                        onClick={() => navigate("/dashboard/events")}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Organizer Events</span>
                      </DropdownMenuItem>
                    )}
                    {isAttendee && (
                      <DropdownMenuItem
                        className="hover:bg-gray-800 cursor-pointer"
                        onClick={() => navigate("/dashboard/tickets")}
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        <span>My Tickets</span>
                      </DropdownMenuItem>
                    )}
                    {isStaff && (
                      <DropdownMenuItem
                        className="hover:bg-gray-800 cursor-pointer"
                        onClick={() => navigate("/dashboard/validate-qr")}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        <span>QR Gate Scanner</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="hover:bg-gray-800 text-red-400 cursor-pointer"
                      onClick={() => signoutRedirect("/demo")}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/demo">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 mr-1" />
                      Demo Login
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 cursor-pointer"
                    onClick={() => signinRedirect()}
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Keycloak Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
