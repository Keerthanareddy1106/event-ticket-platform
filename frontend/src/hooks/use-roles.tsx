import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAppAuth } from "@/context/demo-auth-context";

export type AppRoleName = "ADMIN" | "ORGANIZER" | "ATTENDEE" | "STAFF";

interface UseRolesReturn {
  isLoading: boolean;
  roles: string[];
  primaryRole: AppRoleName | null;
  isAdmin: boolean;
  isOrganizer: boolean;
  isAttendee: boolean;
  isStaff: boolean;
}

interface JwtPayload {
  realm_access?: {
    roles?: string[];
  };
}

const KNOWN_ROLES = new Set(["ADMIN", "ORGANIZER", "ATTENDEE", "STAFF"]);

export const useRoles = (): UseRolesReturn => {
  const { isLoading: isAuthLoading, user } = useAppAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isAttendee, setIsAttendee] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    if (isAuthLoading || !user?.access_token) {
      setRoles([]);
      setIsAdmin(false);
      setIsOrganizer(false);
      setIsAttendee(false);
      setIsStaff(false);
      setIsLoading(isAuthLoading);
      return;
    }

    try {
      const payload = jwtDecode<JwtPayload>(user.access_token);
      const rawRoles = payload.realm_access?.roles || [];
      const normalizedRoles = Array.from(
        new Set(
          rawRoles
            .filter(
              (r) =>
                r &&
                (r.startsWith("ROLE_") || KNOWN_ROLES.has(r.toUpperCase())),
            )
            .map((r) =>
              r.startsWith("ROLE_") ? r.toUpperCase() : `ROLE_${r.toUpperCase()}`,
            ),
        ),
      );

      setRoles(normalizedRoles);
      setIsAdmin(normalizedRoles.includes("ROLE_ADMIN"));
      setIsOrganizer(normalizedRoles.includes("ROLE_ORGANIZER"));
      setIsAttendee(normalizedRoles.includes("ROLE_ATTENDEE"));
      setIsStaff(
        normalizedRoles.includes("ROLE_STAFF") ||
          normalizedRoles.includes("ROLE_ORGANIZER"),
      );
    } catch (error) {
      console.error("Error parsing JWT: " + error);
      setRoles([]);
      setIsAdmin(false);
      setIsOrganizer(false);
      setIsAttendee(false);
      setIsStaff(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, user?.access_token]);

  const primaryRole: AppRoleName | null = isAdmin
    ? "ADMIN"
    : isOrganizer
      ? "ORGANIZER"
      : isAttendee
        ? "ATTENDEE"
        : isStaff
          ? "STAFF"
          : null;

  return {
    isLoading,
    roles,
    primaryRole,
    isAdmin,
    isOrganizer,
    isAttendee,
    isStaff,
  };
};
