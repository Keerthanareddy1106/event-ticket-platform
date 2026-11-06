import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/context/demo-auth-context";
import { BarChart3, CalendarPlus, QrCode, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";

const OrganizersLandingPage: React.FC = () => {
  const { isLoading, setDemoPreset } = useAppAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Organizer Control Center
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Create, Manage, and Sell Event Tickets with Ease
            </h1>
            <p className="text-lg text-gray-300">
              A complete platform for event organizers to publish multi-tier
              events, track ticket inventory, and validate attendees at the
              venue with QR codes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-purple-600 hover:bg-purple-500 h-11 px-6 cursor-pointer"
                onClick={() => {
                  setDemoPreset("ORGANIZER");
                  navigate("/dashboard/events");
                }}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Open Organizer Dashboard
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white h-11 px-6 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Browse Published Events
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Multi-Tier Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Instant QR Validation</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Live Capacity Tracking</span>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl aspect-square w-full max-w-md mx-auto overflow-hidden shadow-2xl">
            <img
              src="/organizers-landing-hero.png"
              alt="A busy concert"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizersLandingPage;
