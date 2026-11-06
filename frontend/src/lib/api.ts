import {
  CreateEventRequest,
  EventDetails,
  EventSummary,
  isErrorResponse,
  PublishedEventDetails,
  PublishedEventSummary,
  SpringBootPagination,
  TicketDetails,
  TicketSummary,
  TicketValidationRequest,
  TicketValidationResponse,
  UpdateEventRequest,
} from "@/domain/domain";
import { demoApi } from "@/lib/demo-store";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export interface AdminOverviewStats {
  totalEvents: number;
  publishedEvents: number;
  totalUsers: number;
  totalTicketsIssued: number;
  totalQrValidations: number;
}

export interface AdminPlatformUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  organizedEventsCount: number;
}

function isIsolatedDemoJwt(accessToken?: string): boolean {
  return Boolean(accessToken && accessToken.endsWith(".demo_signature"));
}

function shouldUseStandalonePublicFallback(): boolean {
  if (
    !import.meta.env.VITE_API_BASE_URL &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return true;
  }
  return false;
}

async function handleNonOkResponse(response: Response): Promise<never> {
  if (response.status === 401) {
    throw new Error("HTTP 401 Unauthorized: Authentication required");
  }
  if (response.status === 403) {
    throw new Error(
      "HTTP 403 Forbidden: Your role is not authorized for this operation",
    );
  }
  const responseBody = await response.json().catch(() => null);
  if (isErrorResponse(responseBody)) {
    throw new Error(responseBody.error);
  }
  throw new Error(`Request failed with status ${response.status}`);
}

export const getAdminOverview = async (
  accessToken: string,
): Promise<AdminOverviewStats> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.getAdminOverview(accessToken);
  }
  const response = await fetch(`${API_BASE}/api/v1/admin/overview`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return handleNonOkResponse(response);
  }
  return (await response.json()) as AdminOverviewStats;
};

export const listAdminUsers = async (
  accessToken: string,
): Promise<AdminPlatformUser[]> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.listAdminUsers(accessToken);
  }
  const response = await fetch(`${API_BASE}/api/v1/admin/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return handleNonOkResponse(response);
  }
  return (await response.json()) as AdminPlatformUser[];
};

export const listAdminEvents = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<EventSummary>> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.listEvents(accessToken, page, 6);
  }
  const response = await fetch(
    `${API_BASE}/api/v1/admin/events?page=${page}&size=6`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    return handleNonOkResponse(response);
  }
  return (await response.json()) as SpringBootPagination<EventSummary>;
};

export const createEvent = async (
  accessToken: string,
  request: CreateEventRequest,
): Promise<void> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.createEvent(accessToken, request);
  }
  const response = await fetch(`${API_BASE}/api/v1/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }
};

export const updateEvent = async (
  accessToken: string,
  id: string,
  request: UpdateEventRequest,
): Promise<void> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.updateEvent(accessToken, id, request);
  }
  const response = await fetch(`${API_BASE}/api/v1/events/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }
};

export const listEvents = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<EventSummary>> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.listEvents(accessToken, page, 4);
  }
  const response = await fetch(
    `${API_BASE}/api/v1/events?page=${page}&size=4`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return handleNonOkResponse(response);
  }

  return (await response.json()) as SpringBootPagination<EventSummary>;
};

export const getEvent = async (
  accessToken: string,
  id: string,
): Promise<EventDetails> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.getEvent(accessToken, id);
  }
  const response = await fetch(`${API_BASE}/api/v1/events/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }

  return (await response.json()) as EventDetails;
};

export const deleteEvent = async (
  accessToken: string,
  id: string,
): Promise<void> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.deleteEvent(accessToken, id);
  }
  const response = await fetch(`${API_BASE}/api/v1/events/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }
};

export const listPublishedEvents = async (
  page: number,
): Promise<SpringBootPagination<PublishedEventSummary>> => {
  if (shouldUseStandalonePublicFallback()) {
    return demoApi.listPublishedEvents(page, 4);
  }
  try {
    const response = await fetch(
      `${API_BASE}/api/v1/published-events?page=${page}&size=4`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return handleNonOkResponse(response);
    }

    return (await response.json()) as SpringBootPagination<PublishedEventSummary>;
  } catch {
    return demoApi.listPublishedEvents(page, 4);
  }
};

export const searchPublishedEvents = async (
  query: string,
  page: number,
): Promise<SpringBootPagination<PublishedEventSummary>> => {
  if (shouldUseStandalonePublicFallback()) {
    return demoApi.searchPublishedEvents(query, page, 4);
  }
  try {
    const response = await fetch(
      `${API_BASE}/api/v1/published-events?q=${encodeURIComponent(query)}&page=${page}&size=4`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return handleNonOkResponse(response);
    }

    return (await response.json()) as SpringBootPagination<PublishedEventSummary>;
  } catch {
    return demoApi.searchPublishedEvents(query, page, 4);
  }
};

export const getPublishedEvent = async (
  id: string,
): Promise<PublishedEventDetails> => {
  if (shouldUseStandalonePublicFallback()) {
    return demoApi.getPublishedEvent(id);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/published-events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return handleNonOkResponse(response);
    }

    return (await response.json()) as PublishedEventDetails;
  } catch {
    return demoApi.getPublishedEvent(id);
  }
};

export const purchaseTicket = async (
  accessToken: string,
  eventId: string,
  ticketTypeId: string,
): Promise<void> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    await demoApi.purchaseTicket(accessToken, eventId, ticketTypeId);
    return;
  }
  const response = await fetch(
    `${API_BASE}/api/v1/events/${eventId}/ticket-types/${ticketTypeId}/tickets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return handleNonOkResponse(response);
  }
};

export const listTickets = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<TicketSummary>> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.listTickets(accessToken, page, 8);
  }
  const response = await fetch(
    `${API_BASE}/api/v1/tickets?page=${page}&size=8`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return handleNonOkResponse(response);
  }

  return (await response.json()) as SpringBootPagination<TicketSummary>;
};

export const getTicket = async (
  accessToken: string,
  id: string,
): Promise<TicketDetails> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.getTicket(accessToken, id);
  }
  const response = await fetch(`${API_BASE}/api/v1/tickets/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }

  return (await response.json()) as TicketDetails;
};

export const getTicketQr = async (
  accessToken: string,
  id: string,
): Promise<Blob> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.getTicketQr(accessToken, id);
  }
  const response = await fetch(`${API_BASE}/api/v1/tickets/${id}/qr-codes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }
  return await response.blob();
};

export const validateTicket = async (
  accessToken: string,
  request: TicketValidationRequest,
): Promise<TicketValidationResponse> => {
  if (isIsolatedDemoJwt(accessToken) || shouldUseStandalonePublicFallback()) {
    return demoApi.validateTicket(accessToken, request);
  }
  const response = await fetch(`${API_BASE}/api/v1/ticket-validations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return handleNonOkResponse(response);
  }

  return (await response.json()) as TicketValidationResponse;
};
