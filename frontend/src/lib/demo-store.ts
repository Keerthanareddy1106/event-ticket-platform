import {
  CreateEventRequest,
  EventDetails,
  EventStatusEnum,
  EventSummary,
  PublishedEventDetails,
  PublishedEventSummary,
  SpringBootPagination,
  TicketDetails,
  TicketStatus,
  TicketSummary,
  TicketValidationRequest,
  TicketValidationResponse,
  TicketValidationStatus,
  UpdateEventRequest,
} from "@/domain/domain";
import { jwtDecode } from "jwt-decode";

const EVENTS_STORAGE_KEY = "etp_demo_events_v2";
const TICKETS_STORAGE_KEY = "etp_demo_tickets_v2";

const PROTECTED_SEED_EVENT_IDS = new Set([
  "evt-neon-pulse-2026",
  "evt-ai-cloud-summit-2026",
  "evt-symphony-stars",
  "evt-indie-game-expo",
]);

export interface StoredTicket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  status: TicketStatus;
  price: number;
  description: string;
  eventName: string;
  eventVenue: string;
  eventStart: Date;
  eventEnd: Date;
  purchasedAt: Date;
  redeemed?: boolean;
  redeemedAt?: Date;
}

interface JwtClaimPayload {
  realm_access?: {
    roles?: string[];
  };
}

export function assertJwtAuthorized(
  accessToken: string | undefined,
  allowedRoles: ("ADMIN" | "ORGANIZER" | "ATTENDEE" | "STAFF")[],
): void {
  if (!accessToken) {
    throw new Error("HTTP 401 Unauthorized: Missing authentication token");
  }
  try {
    const decoded = jwtDecode<JwtClaimPayload>(accessToken);
    const rawRoles = decoded.realm_access?.roles || [];
    const normalized = rawRoles.map((r) =>
      r.startsWith("ROLE_") ? r.replace(/^ROLE_/, "").toUpperCase() : r.toUpperCase(),
    );
    const permitted = allowedRoles.some((req) => normalized.includes(req));
    if (!permitted) {
      throw new Error(
        `HTTP 403 Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(" or ")}`,
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("HTTP ")) {
      throw err;
    }
    throw new Error("HTTP 401 Unauthorized: Invalid JWT token");
  }
}

const INITIAL_EVENTS: EventDetails[] = [
  {
    id: "evt-neon-pulse-2026",
    name: "Neon Pulse Synthwave & Cyber Arts Festival",
    start: new Date("2026-12-12T18:00:00.000Z"),
    end: new Date("2026-12-13T02:00:00.000Z"),
    venue: "Aurora Dome Arena, San Francisco, CA",
    salesStart: new Date("2026-10-01T00:00:00.000Z"),
    salesEnd: new Date("2026-12-12T16:00:00.000Z"),
    status: EventStatusEnum.PUBLISHED,
    createdAt: new Date("2026-09-15T10:00:00.000Z"),
    updatedAt: new Date("2026-10-20T14:30:00.000Z"),
    ticketTypes: [
      {
        id: "tt-neon-ga",
        name: "General Admission",
        price: 59,
        totalAvailable: 450,
        description:
          "Full access to the main stage, immersive laser projection dome, and night market.",
      },
      {
        id: "tt-neon-vip",
        name: "VIP Cyber Lounge Pass",
        price: 149,
        totalAvailable: 80,
        description:
          "Priority fast-track entry, elevated VIP viewing deck, complimentary drinks, and exclusive festival merch pack.",
      },
      {
        id: "tt-neon-backstage",
        name: "All-Access Backstage Pass",
        price: 299,
        totalAvailable: 15,
        description:
          "Meet & greet with headlining artists, backstage lounge access, and front-row pit entry.",
      },
    ],
  },
  {
    id: "evt-ai-cloud-summit-2026",
    name: "Global AI & Cloud Architecture Summit",
    start: new Date("2026-11-20T09:00:00.000Z"),
    end: new Date("2026-11-21T18:00:00.000Z"),
    venue: "Moscone West Convention Center, Hall B",
    salesStart: new Date("2026-09-01T09:00:00.000Z"),
    salesEnd: new Date("2026-11-19T23:59:00.000Z"),
    status: EventStatusEnum.PUBLISHED,
    createdAt: new Date("2026-08-20T12:00:00.000Z"),
    updatedAt: new Date("2026-10-10T09:15:00.000Z"),
    ticketTypes: [
      {
        id: "tt-ai-standard",
        name: "Conference Pass",
        price: 199,
        totalAvailable: 300,
        description:
          "Access to all keynotes, technical breakout tracks, expo hall, and networking reception.",
      },
      {
        id: "tt-ai-workshop",
        name: "Conference + Hands-On Workshop Pass",
        price: 349,
        totalAvailable: 60,
        description:
          "Includes full conference access plus deep-dive LLM & Distributed Systems engineering labs.",
      },
    ],
  },
  {
    id: "evt-symphony-stars",
    name: "Symphony Under the Stars: Film Scores Live",
    start: new Date("2026-12-05T19:30:00.000Z"),
    end: new Date("2026-12-05T22:30:00.000Z"),
    venue: "Hollywood Bowl Amphitheatre, Los Angeles",
    salesStart: new Date("2026-10-05T10:00:00.000Z"),
    salesEnd: new Date("2026-12-05T18:00:00.000Z"),
    status: EventStatusEnum.PUBLISHED,
    createdAt: new Date("2026-09-25T16:00:00.000Z"),
    updatedAt: new Date("2026-10-18T11:20:00.000Z"),
    ticketTypes: [
      {
        id: "tt-symphony-lawn",
        name: "Terrace & Lawn Seating",
        price: 45,
        totalAvailable: 250,
        description:
          "Open-air amphitheatre seating with panoramic views and picnic access.",
      },
      {
        id: "tt-symphony-box",
        name: "Orchestra Box Seat",
        price: 135,
        totalAvailable: 40,
        description:
          "Reserved front-section cushioned box seating with table service.",
      },
    ],
  },
  {
    id: "evt-indie-game-expo",
    name: "PixelForge Indie Game & VR Showcase",
    start: new Date("2027-01-16T10:00:00.000Z"),
    end: new Date("2027-01-17T20:00:00.000Z"),
    venue: "Seattle Center Exhibition Hall, WA",
    salesStart: new Date("2026-10-15T08:00:00.000Z"),
    salesEnd: new Date("2027-01-15T22:00:00.000Z"),
    status: EventStatusEnum.PUBLISHED,
    createdAt: new Date("2026-10-01T08:30:00.000Z"),
    updatedAt: new Date("2026-10-28T17:00:00.000Z"),
    ticketTypes: [
      {
        id: "tt-indie-day",
        name: "Weekend Gamer Pass",
        price: 35,
        totalAvailable: 500,
        description:
          "Play 80+ unreleased indie titles, VR arenas, and live speedrun tournaments.",
      },
      {
        id: "tt-indie-creator",
        name: "Creator & Publisher Pro Pass",
        price: 120,
        totalAvailable: 75,
        description:
          "Includes B2B pitch lounge access, developer panels, and after-party invite.",
      },
    ],
  },
];

const INITIAL_TICKETS: StoredTicket[] = [
  {
    id: "TKT-8842-NEON-VIP",
    eventId: "evt-neon-pulse-2026",
    ticketTypeId: "tt-neon-vip",
    ticketTypeName: "VIP Cyber Lounge Pass — Neon Pulse Festival",
    status: TicketStatus.PURCHASED,
    price: 149,
    description:
      "VIP Cyber Lounge Pass: Priority fast-track entry, elevated VIP viewing deck, complimentary drinks.",
    eventName: "Neon Pulse Synthwave & Cyber Arts Festival",
    eventVenue: "Aurora Dome Arena, San Francisco, CA",
    eventStart: new Date("2026-12-12T18:00:00.000Z"),
    eventEnd: new Date("2026-12-13T02:00:00.000Z"),
    purchasedAt: new Date("2026-11-01T14:20:00.000Z"),
    redeemed: false,
  },
  {
    id: "TKT-3190-AICLOUD-PRO",
    eventId: "evt-ai-cloud-summit-2026",
    ticketTypeId: "tt-ai-workshop",
    ticketTypeName: "Conference + Hands-On Workshop Pass — AI Summit",
    status: TicketStatus.PURCHASED,
    price: 349,
    description:
      "Includes full conference access plus deep-dive LLM & Distributed Systems engineering labs.",
    eventName: "Global AI & Cloud Architecture Summit",
    eventVenue: "Moscone West Convention Center, Hall B",
    eventStart: new Date("2026-11-20T09:00:00.000Z"),
    eventEnd: new Date("2026-11-21T18:00:00.000Z"),
    purchasedAt: new Date("2026-11-02T09:45:00.000Z"),
    redeemed: false,
  },
];

function loadEvents(): EventDetails[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      saveEvents(INITIAL_EVENTS);
      return INITIAL_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EVENTS;
  }
}

function saveEvents(events: EventDetails[]): void {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

function loadTickets(): StoredTicket[] {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      saveTickets(INITIAL_TICKETS);
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TICKETS;
  }
}

function saveTickets(tickets: StoredTicket[]): void {
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
}

export function resetDemoData(): void {
  saveEvents(INITIAL_EVENTS);
  saveTickets(INITIAL_TICKETS);
}

export function getDemoTicketsRaw(): StoredTicket[] {
  return loadTickets();
}

export function getDemoEventsRaw(): EventDetails[] {
  return loadEvents();
}

function paginate<T>(
  items: T[],
  page: number,
  size: number,
): SpringBootPagination<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const start = safePage * size;
  const content = items.slice(start, start + size);

  return {
    content,
    pageable: {
      sort: { empty: true, sorted: false, unsorted: true },
      offset: start,
      pageNumber: safePage,
      pageSize: size,
      paged: true,
      unpaged: false,
    },
    last: safePage >= totalPages - 1,
    totalElements,
    totalPages,
    size,
    number: safePage,
    sort: { empty: true, sorted: false, unsorted: true },
    first: safePage === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

export const demoApi = {
  getAdminOverview: async (accessToken: string) => {
    assertJwtAuthorized(accessToken, ["ADMIN"]);
    const events = loadEvents();
    const tickets = loadTickets();
    return {
      totalEvents: events.length,
      publishedEvents: events.filter(
        (e) => e.status === EventStatusEnum.PUBLISHED,
      ).length,
      totalUsers: 3,
      totalTicketsIssued: tickets.length,
      totalQrValidations: tickets.filter((t) => t.redeemed).length,
    };
  },

  listAdminUsers: async (accessToken: string) => {
    assertJwtAuthorized(accessToken, ["ADMIN"]);
    const events = loadEvents();
    return [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "demo_admin",
        email: "demo_admin@eventhub.local",
        role: "ADMIN",
        organizedEventsCount: 0,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "demo_organizer",
        email: "demo_organizer@eventhub.local",
        role: "ORGANIZER",
        organizedEventsCount: events.length,
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "demo_attendee",
        email: "demo_attendee@eventhub.local",
        role: "ATTENDEE",
        organizedEventsCount: 0,
      },
    ];
  },

  createEvent: async (
    accessToken: string,
    request: CreateEventRequest,
  ): Promise<void> => {
    assertJwtAuthorized(accessToken, ["ORGANIZER", "ADMIN"]);
    const events = loadEvents();
    const now = new Date();
    const newEvent: EventDetails = {
      id: `evt-${crypto.randomUUID().slice(0, 8)}`,
      name: request.name,
      start: request.start,
      end: request.end,
      venue: request.venue,
      salesStart: request.salesStart,
      salesEnd: request.salesEnd,
      status: request.status,
      createdAt: now,
      updatedAt: now,
      ticketTypes: request.ticketTypes.map((tt) => ({
        id: `tt-${crypto.randomUUID().slice(0, 8)}`,
        name: tt.name,
        price: tt.price,
        description: tt.description,
        totalAvailable: tt.totalAvailable,
      })),
    };
    saveEvents([newEvent, ...events]);
  },

  updateEvent: async (
    accessToken: string,
    id: string,
    request: UpdateEventRequest,
  ): Promise<void> => {
    assertJwtAuthorized(accessToken, ["ORGANIZER", "ADMIN"]);
    const events = loadEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new Error(`Event with ID '${id}' not found`);
    }
    const existing = events[idx];
    const updated: EventDetails = {
      ...existing,
      name: request.name,
      start: request.start,
      end: request.end,
      venue: request.venue,
      salesStart: request.salesStart,
      salesEnd: request.salesEnd,
      status: request.status,
      updatedAt: new Date(),
      ticketTypes: request.ticketTypes.map((tt) => ({
        id: tt.id || `tt-${crypto.randomUUID().slice(0, 8)}`,
        name: tt.name,
        price: tt.price,
        description: tt.description,
        totalAvailable: tt.totalAvailable,
      })),
    };
    events[idx] = updated;
    saveEvents(events);
  },

  listEvents: async (
    accessToken: string,
    page: number,
    size = 4,
  ): Promise<SpringBootPagination<EventSummary>> => {
    assertJwtAuthorized(accessToken, ["ORGANIZER", "ADMIN"]);
    const events = loadEvents();
    return paginate(events, page, size);
  },

  getEvent: async (accessToken: string, id: string): Promise<EventDetails> => {
    assertJwtAuthorized(accessToken, ["ORGANIZER", "ADMIN"]);
    const events = loadEvents();
    const found = events.find((e) => e.id === id);
    if (!found) {
      throw new Error(`Event with ID '${id}' not found`);
    }
    return found;
  },

  deleteEvent: async (accessToken: string, id: string): Promise<void> => {
    assertJwtAuthorized(accessToken, ["ORGANIZER", "ADMIN"]);
    if (PROTECTED_SEED_EVENT_IDS.has(id)) {
      throw new Error(
        "Protected demo event cannot be deleted in the public demo environment. Create a custom event to test deletion.",
      );
    }
    const events = loadEvents();
    saveEvents(events.filter((e) => e.id !== id));
  },

  listPublishedEvents: async (
    page: number,
    size = 4,
  ): Promise<SpringBootPagination<PublishedEventSummary>> => {
    const published = loadEvents().filter(
      (e) => e.status === EventStatusEnum.PUBLISHED,
    );
    return paginate(published, page, size);
  },

  searchPublishedEvents: async (
    query: string,
    page: number,
    size = 4,
  ): Promise<SpringBootPagination<PublishedEventSummary>> => {
    const q = query.trim().toLowerCase();
    const published = loadEvents().filter(
      (e) =>
        e.status === EventStatusEnum.PUBLISHED &&
        (e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.ticketTypes.some(
            (t) =>
              t.name.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q),
          )),
    );
    return paginate(published, page, size);
  },

  getPublishedEvent: async (id: string): Promise<PublishedEventDetails> => {
    const events = loadEvents();
    const found = events.find((e) => e.id === id);
    if (!found) {
      throw new Error(`Published event '${id}' not found`);
    }
    return {
      id: found.id,
      name: found.name,
      start: found.start,
      end: found.end,
      venue: found.venue,
      ticketTypes: found.ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        price: tt.price,
        description: tt.description,
      })),
    };
  },

  purchaseTicket: async (
    accessToken: string,
    eventId: string,
    ticketTypeId: string,
  ): Promise<string> => {
    assertJwtAuthorized(accessToken, ["ATTENDEE"]);
    const events = loadEvents();
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const ticketType =
      event.ticketTypes.find((t) => t.id === ticketTypeId) ||
      event.ticketTypes[0];
    if (!ticketType) {
      throw new Error("Ticket type not found");
    }

    if (
      typeof ticketType.totalAvailable === "number" &&
      ticketType.totalAvailable <= 0
    ) {
      throw new Error("Tickets are sold out for this ticket type");
    }

    if (
      typeof ticketType.totalAvailable === "number" &&
      ticketType.totalAvailable > 0
    ) {
      ticketType.totalAvailable -= 1;
      saveEvents(events);
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newTicketId = `TKT-${randomCode}-${event.name
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase()}`;

    const newTicket: StoredTicket = {
      id: newTicketId,
      eventId: event.id,
      ticketTypeId: ticketType.id,
      ticketTypeName: `${ticketType.name} — ${event.name}`,
      status: TicketStatus.PURCHASED,
      price: ticketType.price,
      description: `${ticketType.name}: ${ticketType.description}`,
      eventName: event.name,
      eventVenue: event.venue,
      eventStart: event.start || new Date(),
      eventEnd: event.end || new Date(),
      purchasedAt: new Date(),
      redeemed: false,
    };

    const tickets = loadTickets();
    saveTickets([newTicket, ...tickets]);
    return newTicketId;
  },

  listTickets: async (
    accessToken: string,
    page: number,
    size = 8,
  ): Promise<SpringBootPagination<TicketSummary>> => {
    assertJwtAuthorized(accessToken, ["ATTENDEE"]);
    const tickets = loadTickets();
    const summaries: TicketSummary[] = tickets.map((t) => ({
      id: t.id,
      status: t.status,
      ticketType: {
        id: t.ticketTypeId,
        name: t.ticketTypeName,
        price: t.price,
      },
    }));
    return paginate(summaries, page, size);
  },

  getTicket: async (accessToken: string, id: string): Promise<TicketDetails> => {
    assertJwtAuthorized(accessToken, ["ATTENDEE"]);
    const tickets = loadTickets();
    const found = tickets.find((t) => t.id === id);
    if (!found) {
      throw new Error(`Ticket '${id}' not found`);
    }
    return {
      id: found.id,
      status: found.status,
      price: found.price,
      description: found.description,
      eventName: found.eventName,
      eventVenue: found.eventVenue,
      eventStart: found.eventStart,
      eventEnd: found.eventEnd,
    };
  },

  getTicketQr: async (accessToken: string, id: string): Promise<Blob> => {
    assertJwtAuthorized(accessToken, ["ATTENDEE"]);
    const size = 29;
    const cellSize = 8;
    const margin = 16;
    const totalPx = size * cellSize + margin * 2;

    let hash = 2166136261;
    for (let i = 0; i < id.length; i++) {
      hash ^= id.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const isFinderModule = (r: number, c: number): boolean | null => {
      const checkFinder = (fr: number, fc: number) => {
        const dr = r - fr;
        const dc = c - fc;
        if (dr >= -1 && dr <= 7 && dc >= -1 && dc <= 7) {
          if (dr === -1 || dr === 7 || dc === -1 || dc === 7) return false;
          if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
          if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
          return false;
        }
        return null;
      };
      return (
        checkFinder(0, 0) ??
        checkFinder(0, size - 7) ??
        checkFinder(size - 7, 0)
      );
    };

    let rects = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const finder = isFinderModule(r, c);
        let dark = false;
        if (finder !== null) {
          dark = finder;
        } else if (r === 6 || c === 6) {
          dark = (r + c) % 2 === 0;
        } else {
          const seed =
            ((r * 31 + c * 17 + hash) ^
              id.charCodeAt((r * size + c) % id.length)) &
            0xff;
          dark = seed % 2 === 0;
        }
        if (dark) {
          const x = margin + c * cellSize;
          const y = margin + r * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="1.2" fill="#111827"/>`;
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalPx} ${totalPx}" width="${totalPx}" height="${totalPx}">
      <rect width="100%" height="100%" fill="#ffffff" rx="12"/>
      ${rects}
    </svg>`;

    return new Blob([svg], { type: "image/svg+xml" });
  },

  validateTicket: async (
    accessToken: string,
    request: TicketValidationRequest,
  ): Promise<TicketValidationResponse> => {
    assertJwtAuthorized(accessToken, ["ORGANIZER", "STAFF", "ADMIN"]);
    const cleanId = request.id.trim();
    const tickets = loadTickets();
    const idx = tickets.findIndex(
      (t) => t.id.toLowerCase() === cleanId.toLowerCase(),
    );

    if (idx === -1) {
      return {
        ticketId: cleanId,
        status: TicketValidationStatus.INVALID,
      };
    }

    const found = tickets[idx];

    if (found.status === TicketStatus.CANCELLED) {
      return {
        ticketId: found.id,
        status: TicketValidationStatus.EXPIRED,
      };
    }

    // Prevent duplicate ticket redemption: mirrors TicketValidationServiceImpl on the backend
    if (found.redeemed) {
      return {
        ticketId: found.id,
        status: TicketValidationStatus.INVALID,
      };
    }

    tickets[idx] = {
      ...found,
      redeemed: true,
      redeemedAt: new Date(),
    };
    saveTickets(tickets);

    return {
      ticketId: found.id,
      status: TicketValidationStatus.VALID,
    };
  },
};
