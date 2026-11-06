import React, { useState } from "react";
import { DemoRolePreset, useAppAuth } from "@/context/demo-auth-context";
import { resetDemoData } from "@/lib/demo-store";
import {
  CalendarPlus,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const ROLE_BUTTONS: {
  preset: DemoRolePreset;
  label: string;
  targetPath: string;
  icon: React.ReactNode;
}[] = [
  {
    preset: "ALL",
    label: "All Roles (Recruiter)",
    targetPath: "/",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    preset: "ATTENDEE",
    label: "Attendee",
    targetPath: "/dashboard/tickets",
    icon: <Ticket className="w-3.5 h-3.5" />,
  },
  {
    preset: "ORGANIZER",
    label: "Organizer",
    targetPath: "/dashboard/events",
    icon: <CalendarPlus className="w-3.5 h-3.5" />,
  },
  {
    preset: "STAFF",
    label: "Gate Staff (QR)",
    targetPath: "/dashboard/validate-qr",
    icon: <QrCode className="w-3.5 h-3.5" />,
  },
];

export const DemoRoleSwitcher: React.FC = () => {
  const { isDemoMode, demoPreset, setDemoPreset, enableDemoMode } =
    useAppAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resetDone, setResetDone] = useState(false);

  const handleSelectRole = (preset: DemoRolePreset, targetPath: string) => {
    setDemoPreset(preset);
    if (preset !== "ALL" && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleResetDemo = () => {
    resetDemoData();
    setResetDone(true);
    setTimeout(() => {
      setResetDone(false);
      window.location.reload();
    }, 500);
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/95 via-indigo-950/95 to-gray-950 border-b border-purple-500/30 text-white text-xs sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Interactive Recruiter Demo
          </span>
          <span className="hidden md:inline text-gray-300">
            Instant role-switching without external Keycloak setup:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!isDemoMode ? (
            <button
              type="button"
              onClick={() => enableDemoMode("ALL")}
              className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1.5 cursor-pointer transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Enable Demo Mode
            </button>
          ) : (
            <>
              {ROLE_BUTTONS.map((btn) => {
                const isActive = demoPreset === btn.preset;
                return (
                  <button
                    key={btn.preset}
                    type="button"
                    onClick={() => handleSelectRole(btn.preset, btn.targetPath)}
                    className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition ${
                      isActive
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30 border border-purple-400"
                        : "bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700"
                    }`}
                  >
                    {btn.icon}
                    <span>{btn.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleResetDemo}
                title="Reset sample events and tickets to defaults"
                className="ml-1 px-2.5 py-1 rounded-md bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {resetDone ? "Resetting..." : "Reset Data"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoRoleSwitcher;
