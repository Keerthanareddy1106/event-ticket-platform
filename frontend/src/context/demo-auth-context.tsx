import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

export type DemoRolePreset = "ALL" | "ATTENDEE" | "ORGANIZER" | "STAFF";

interface DemoUserProfile {
  preferred_username: string;
  email: string;
  name: string;
}

interface AppUser {
  access_token: string;
  profile: DemoUserProfile;
}

interface DemoAuthContextValue {
  isDemoMode: boolean;
  demoPreset: DemoRolePreset;
  setDemoPreset: (preset: DemoRolePreset) => void;
  enableDemoMode: (preset?: DemoRolePreset) => void;
  disableDemoMode: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: AppUser;
  roles: string[];
  isOrganizer: boolean;
  isAttendee: boolean;
  isStaff: boolean;
  signinRedirect: () => Promise<void>;
  signoutRedirect: () => Promise<void>;
}

const DEMO_MODE_STORAGE_KEY = "etp_demo_mode_enabled";
const DEMO_PRESET_STORAGE_KEY = "etp_demo_role_preset";

const PRESET_PROFILES: Record<
  DemoRolePreset,
  { username: string; email: string; name: string; roles: string[] }
> = {
  ALL: {
    username: "recruiter_demo",
    email: "recruiter@eventhub.demo",
    name: "Recruiter Demo (All Roles)",
    roles: ["ROLE_ORGANIZER", "ROLE_ATTENDEE", "ROLE_STAFF"],
  },
  ORGANIZER: {
    username: "alex_organizer",
    email: "organizer@eventhub.demo",
    name: "Alex Rivera (Organizer)",
    roles: ["ROLE_ORGANIZER"],
  },
  ATTENDEE: {
    username: "jamie_attendee",
    email: "attendee@eventhub.demo",
    name: "Jamie Chen (Attendee)",
    roles: ["ROLE_ATTENDEE"],
  },
  STAFF: {
    username: "taylor_staff",
    email: "staff@eventhub.demo",
    name: "Taylor Morgan (Gate Staff)",
    roles: ["ROLE_STAFF"],
  },
};

function createDemoJwt(roles: string[], profile: DemoUserProfile): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: "demo-user-001",
      preferred_username: profile.preferred_username,
      email: profile.email,
      name: profile.name,
      realm_access: { roles },
      exp: Math.floor(Date.now() / 1000) + 86400 * 30,
    }),
  );
  return `${header}.${payload}.demo_signature`;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(
  undefined,
);

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const oidc = useOidcAuth();

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (saved !== null) {
      return saved === "true";
    }
    // Default to true when running on Vercel or non-localhost, or whenVITE_DEMO_MODE is not explicitly false
    const envDemo = import.meta.env.VITE_DEMO_MODE;
    if (envDemo === "false") return false;
    return true;
  });

  const [demoPreset, setDemoPresetState] = useState<DemoRolePreset>(() => {
    const saved = localStorage.getItem(DEMO_PRESET_STORAGE_KEY) as DemoRolePreset;
    if (saved && saved in PRESET_PROFILES) {
      return saved;
    }
    return "ALL";
  });

  useEffect(() => {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(isDemoMode));
  }, [isDemoMode]);

  const setDemoPreset = (preset: DemoRolePreset) => {
    setDemoPresetState(preset);
    localStorage.setItem(DEMO_PRESET_STORAGE_KEY, preset);
    if (!isDemoMode) {
      setIsDemoMode(true);
    }
  };

  const enableDemoMode = (preset?: DemoRolePreset) => {
    if (preset) {
      setDemoPresetState(preset);
      localStorage.setItem(DEMO_PRESET_STORAGE_KEY, preset);
    }
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
  };

  const activePreset = PRESET_PROFILES[demoPreset];
  const demoProfile: DemoUserProfile = {
    preferred_username: activePreset.username,
    email: activePreset.email,
    name: activePreset.name,
  };
  const demoToken = createDemoJwt(activePreset.roles, demoProfile);

  const effectiveAuthenticated = isDemoMode ? true : oidc.isAuthenticated;
  const effectiveLoading = isDemoMode ? false : oidc.isLoading;

  const effectiveUser: AppUser | undefined = isDemoMode
    ? {
        access_token: demoToken,
        profile: demoProfile,
      }
    : oidc.user
      ? {
          access_token: oidc.user.access_token,
          profile: {
            preferred_username:
              oidc.user.profile?.preferred_username || "user",
            email: oidc.user.profile?.email || "",
            name: oidc.user.profile?.name || "Authenticated User",
          },
        }
      : undefined;

  const signinRedirect = async () => {
    const hasCustomOidc = Boolean(import.meta.env.VITE_OIDC_AUTHORITY);
    if (!hasCustomOidc && window.location.hostname !== "localhost") {
      // On Vercel without an external Keycloak server, enable Demo Mode directly
      enableDemoMode("ALL");
      return;
    }
    try {
      await oidc.signinRedirect();
    } catch {
      enableDemoMode("ALL");
    }
  };

  const signoutRedirect = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      return;
    }
    try {
      await oidc.signoutRedirect();
    } catch {
      setIsDemoMode(false);
    }
  };

  return (
    <DemoAuthContext.Provider
      value={{
        isDemoMode,
        demoPreset,
        setDemoPreset,
        enableDemoMode,
        disableDemoMode,
        isAuthenticated: effectiveAuthenticated,
        isLoading: effectiveLoading,
        user: effectiveUser,
        roles: isDemoMode ? activePreset.roles : [],
        isOrganizer: isDemoMode
          ? activePreset.roles.includes("ROLE_ORGANIZER")
          : false,
        isAttendee: isDemoMode
          ? activePreset.roles.includes("ROLE_ATTENDEE")
          : false,
        isStaff: isDemoMode
          ? activePreset.roles.includes("ROLE_STAFF")
          : false,
        signinRedirect,
        signoutRedirect,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useAppAuth = (): DemoAuthContextValue => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error("useAppAuth must be used within a DemoAuthProvider");
  }
  return context;
};
