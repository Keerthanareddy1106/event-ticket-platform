import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { jwtDecode } from "jwt-decode";

export type DemoIdentityKey = "demo_admin" | "demo_organizer" | "demo_attendee";

interface UserProfile {
  preferred_username: string;
  email: string;
  name: string;
}

interface AppUser {
  access_token: string;
  profile: UserProfile;
}

interface JwtRolePayload {
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  exp?: number;
  realm_access?: {
    roles?: string[];
  };
}

interface DemoIdentitySpec {
  username: DemoIdentityKey;
  sub: string;
  email: string;
  name: string;
  roles: string[];
  defaultDashboard: string;
}

export const DEMO_IDENTITIES: Record<DemoIdentityKey, DemoIdentitySpec> = {
  demo_admin: {
    username: "demo_admin",
    sub: "11111111-1111-1111-1111-111111111111",
    email: "demo_admin@eventhub.local",
    name: "Demo Administrator",
    roles: ["ADMIN", "ROLE_ADMIN"],
    defaultDashboard: "/dashboard/admin",
  },
  demo_organizer: {
    username: "demo_organizer",
    sub: "22222222-2222-2222-2222-222222222222",
    email: "demo_organizer@eventhub.local",
    name: "Demo Event Organizer",
    roles: ["ORGANIZER", "ROLE_ORGANIZER"],
    defaultDashboard: "/dashboard/events",
  },
  demo_attendee: {
    username: "demo_attendee",
    sub: "33333333-3333-3333-3333-333333333333",
    email: "demo_attendee@eventhub.local",
    name: "Demo Attendee",
    roles: ["ATTENDEE", "ROLE_ATTENDEE"],
    defaultDashboard: "/dashboard/tickets",
  },
};

const ACTIVE_DEMO_TOKEN_KEY = "etp_isolated_demo_jwt";

function buildIsolatedDemoJwt(spec: DemoIdentitySpec): string {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: spec.sub,
      iss:
        import.meta.env.VITE_OIDC_AUTHORITY ||
        "http://localhost:9090/realms/event-ticket-platform",
      preferred_username: spec.username,
      email: spec.email,
      name: spec.name,
      realm_access: {
        roles: spec.roles,
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 * 4,
    }),
  );
  return `${header}.${payload}.demo_signature`;
}

function isTokenValid(token: string | null): JwtRolePayload | null {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtRolePayload>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

async function isKeycloakReachable(): Promise<boolean> {
  const authority =
    import.meta.env.VITE_OIDC_AUTHORITY ||
    "http://localhost:9090/realms/event-ticket-platform";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(
      `${authority.replace(/\/$/, "")}/.well-known/openid-configuration`,
      { signal: controller.signal },
    );
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

interface DemoAuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticatingIdentity: DemoIdentityKey | null;
  authError: string | null;
  user?: AppUser;
  activeIdentityUsername?: string;
  authenticateDemoIdentity: (identityKey: DemoIdentityKey) => Promise<string>;
  signinRedirect: () => Promise<void>;
  signoutRedirect: (postLogoutPath?: string) => Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(
  undefined,
);

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const oidc = useOidcAuth();

  // Clean up legacy all-roles keys if present
  useEffect(() => {
    localStorage.removeItem("etp_demo_mode_enabled");
    localStorage.removeItem("etp_demo_role_preset");
  }, []);

  const [fallbackToken, setFallbackToken] = useState<string | null>(() => {
    const stored = sessionStorage.getItem(ACTIVE_DEMO_TOKEN_KEY);
    return isTokenValid(stored) ? stored : null;
  });
  const [isAuthenticatingIdentity, setIsAuthenticatingIdentity] =
    useState<DemoIdentityKey | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const validFallbackPayload = isTokenValid(fallbackToken);

  const effectiveAuthenticated =
    oidc.isAuthenticated || Boolean(validFallbackPayload);
  const effectiveLoading = oidc.isLoading;

  const effectiveUser: AppUser | undefined = oidc.isAuthenticated && oidc.user
    ? {
        access_token: oidc.user.access_token,
        profile: {
          preferred_username:
            oidc.user.profile?.preferred_username || "authenticated_user",
          email: oidc.user.profile?.email || "",
          name:
            oidc.user.profile?.name ||
            oidc.user.profile?.preferred_username ||
            "Authenticated User",
        },
      }
    : validFallbackPayload && fallbackToken
      ? {
          access_token: fallbackToken,
          profile: {
            preferred_username:
              validFallbackPayload.preferred_username || "demo_user",
            email: validFallbackPayload.email || "",
            name: validFallbackPayload.name || "Demo User",
          },
        }
      : undefined;

  /**
   * Authenticates one of the three strictly separated demo identities:
   * - demo_admin (ADMIN)
   * - demo_organizer (ORGANIZER)
   * - demo_attendee (ATTENDEE)
   *
   * Enforces safe identity-switching:
   * 1. If the currently authenticated identity already matches, returns target dashboard.
   * 2. If another identity is currently logged in, terminates the active session first.
   * 3. Initiates Keycloak authentication with prompt="login" and login_hint=<username>
   *    so Keycloak never reuses an existing SSO session for a different role.
   */
  const authenticateDemoIdentity = async (
    identityKey: DemoIdentityKey,
  ): Promise<string> => {
    setAuthError(null);
    setIsAuthenticatingIdentity(identityKey);

    try {
      const targetSpec = DEMO_IDENTITIES[identityKey];
      const currentUsername = effectiveUser?.profile?.preferred_username;

      // 1. If already authenticated as the requested demo identity, return its dashboard
      if (effectiveAuthenticated && currentUsername === targetSpec.username) {
        return targetSpec.defaultDashboard;
      }

      // 2. If authenticated as a DIFFERENT identity, terminate the current session first
      if (oidc.isAuthenticated) {
        sessionStorage.removeItem(ACTIVE_DEMO_TOKEN_KEY);
        setFallbackToken(null);
        localStorage.setItem("redirectPath", targetSpec.defaultDashboard);
        await oidc.removeUser();
      } else if (fallbackToken) {
        sessionStorage.removeItem(ACTIVE_DEMO_TOKEN_KEY);
        setFallbackToken(null);
      }

      // 3. Check if Keycloak OIDC authority is reachable
      const keycloakAvailable = await isKeycloakReachable();
      if (keycloakAvailable) {
        localStorage.setItem("redirectPath", targetSpec.defaultDashboard);
        await oidc.signinRedirect({
          prompt: "login",
          login_hint: targetSpec.username,
        });
        return targetSpec.defaultDashboard;
      }

      // 4. Standalone cloud deployment fallback: issue single-role JWT for the selected identity only
      const isolatedToken = buildIsolatedDemoJwt(targetSpec);
      sessionStorage.setItem(ACTIVE_DEMO_TOKEN_KEY, isolatedToken);
      setFallbackToken(isolatedToken);
      return targetSpec.defaultDashboard;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to initiate authentication for the selected demo role.";
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthenticatingIdentity(null);
    }
  };

  const signinRedirect = async () => {
    setAuthError(null);
    const keycloakAvailable = await isKeycloakReachable();
    if (keycloakAvailable) {
      await oidc.signinRedirect();
      return;
    }
    // If Keycloak is not reachable in standalone cloud mode, direct user to the Demo Role Selection page
    window.location.href = "/demo";
  };

  const signoutRedirect = async (postLogoutPath = "/demo") => {
    sessionStorage.removeItem(ACTIVE_DEMO_TOKEN_KEY);
    setFallbackToken(null);

    if (oidc.isAuthenticated) {
      try {
        await oidc.signoutRedirect({
          post_logout_redirect_uri: `${window.location.origin}${postLogoutPath}`,
        });
        return;
      } catch {
        await oidc.removeUser();
      }
    }
    window.location.href = postLogoutPath;
  };

  return (
    <DemoAuthContext.Provider
      value={{
        isAuthenticated: effectiveAuthenticated,
        isLoading: effectiveLoading,
        isAuthenticatingIdentity,
        authError,
        user: effectiveUser,
        activeIdentityUsername: effectiveUser?.profile?.preferred_username,
        authenticateDemoIdentity,
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
