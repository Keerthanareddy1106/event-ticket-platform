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

function shouldUseDemoApi(accessToken?: string): boolean {
  if (accessToken && accessToken.endsWith(".demo_signature")) {
    return true;
  }
  const demoEnabled = localStorage.getItem("etp_demo_mode_enabled");
  if (demoEnabled === "true") {
    return true;
  }
  // If no explicit backend URL is provided and not running on localhost, use demo store
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

export const createEvent = async (
  accessToken: string,
  request: CreateEventRequest,
): Promise<void> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.createEvent(request);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }
  } catch {
    return demoApi.createEvent(request);
  }
};

export const updateEvent = async (
  accessToken: string,
  id: string,
  request: UpdateEventRequest,
): Promise<void> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.updateEvent(id, request);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/events/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }
  } catch {
    return demoApi.updateEvent(id, request);
  }
};

export const listEvents = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<EventSummary>> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.listEvents(page, 4);
  }
  try {
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

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as SpringBootPagination<EventSummary>;
  } catch {
    return demoApi.listEvents(page, 4);
  }
};

export const getEvent = async (
  accessToken: string,
  id: string,
): Promise<EventDetails> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.getEvent(id);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/events/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as EventDetails;
  } catch {
    return demoApi.getEvent(id);
  }
};

export const deleteEvent = async (
  accessToken: string,
  id: string,
): Promise<void> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.deleteEvent(id);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const responseBody = await response.json();
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }
  } catch {
    return demoApi.deleteEvent(id);
  }
};

export const listPublishedEvents = async (
  page: number,
): Promise<SpringBootPagination<PublishedEventSummary>> => {
  if (shouldUseDemoApi()) {
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

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as SpringBootPagination<PublishedEventSummary>;
  } catch {
    return demoApi.listPublishedEvents(page, 4);
  }
};

export const searchPublishedEvents = async (
  query: string,
  page: number,
): Promise<SpringBootPagination<PublishedEventSummary>> => {
  if (shouldUseDemoApi()) {
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

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as SpringBootPagination<PublishedEventSummary>;
  } catch {
    return demoApi.searchPublishedEvents(query, page, 4);
  }
};

export const getPublishedEvent = async (
  id: string,
): Promise<PublishedEventDetails> => {
  if (shouldUseDemoApi()) {
    return demoApi.getPublishedEvent(id);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/published-events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as PublishedEventDetails;
  } catch {
    return demoApi.getPublishedEvent(id);
  }
};

export const purchaseTicket = async (
  accessToken: string,
  eventId: string,
  ticketTypeId: string,
): Promise<void> => {
  if (shouldUseDemoApi(accessToken)) {
    await demoApi.purchaseTicket(eventId, ticketTypeId);
    return;
  }
  try {
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
      const responseBody = await response.json();
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }
  } catch {
    await demoApi.purchaseTicket(eventId, ticketTypeId);
  }
};

export const listTickets = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<TicketSummary>> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.listTickets(page, 8);
  }
  try {
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

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as SpringBootPagination<TicketSummary>;
  } catch {
    return demoApi.listTickets(page, 8);
  }
};

export const getTicket = async (
  accessToken: string,
  id: string,
): Promise<TicketDetails> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.getTicket(id);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/tickets/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as TicketDetails;
  } catch {
    return demoApi.getTicket(id);
  }
};

export const getTicketQr = async (
  accessToken: string,
  id: string,
): Promise<Blob> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.getTicketQr(id);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/tickets/${id}/qr-codes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return await response.blob();
    } else {
      return demoApi.getTicketQr(id);
    }
  } catch {
    return demoApi.getTicketQr(id);
  }
};

export const validateTicket = async (
  accessToken: string,
  request: TicketValidationRequest,
): Promise<TicketValidationResponse> => {
  if (shouldUseDemoApi(accessToken)) {
    return demoApi.validateTicket(request);
  }
  try {
    const response = await fetch(`${API_BASE}/api/v1/ticket-validations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      if (isErrorResponse(responseBody)) {
        throw new Error(responseBody.error);
      } else {
        console.error(JSON.stringify(responseBody));
        throw new Error("An unknown error occurred");
      }
    }

    return responseBody as TicketValidationResponse;
  } catch {
    return demoApi.validateTicket(request);
  }
};
