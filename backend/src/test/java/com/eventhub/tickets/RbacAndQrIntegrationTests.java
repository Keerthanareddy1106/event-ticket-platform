package com.eventhub.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eventhub.tickets.config.JwtAuthenticationConverter;
import com.eventhub.tickets.domain.entities.Event;
import com.eventhub.tickets.domain.entities.EventStatusEnum;
import com.eventhub.tickets.domain.entities.QrCode;
import com.eventhub.tickets.domain.entities.Ticket;
import com.eventhub.tickets.domain.entities.TicketType;
import com.eventhub.tickets.domain.entities.User;
import com.eventhub.tickets.repositories.EventRepository;
import com.eventhub.tickets.repositories.QrCodeRepository;
import com.eventhub.tickets.repositories.TicketRepository;
import com.eventhub.tickets.repositories.TicketTypeRepository;
import com.eventhub.tickets.repositories.UserRepository;
import com.eventhub.tickets.services.TicketTypeService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RbacAndQrIntegrationTests {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private JwtAuthenticationConverter jwtAuthenticationConverter;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private EventRepository eventRepository;

  @Autowired
  private TicketTypeRepository ticketTypeRepository;

  @Autowired
  private TicketRepository ticketRepository;

  @Autowired
  private QrCodeRepository qrCodeRepository;

  @Autowired
  private TicketTypeService ticketTypeService;

  @MockBean
  private JwtDecoder jwtDecoder;

  private static final UUID ADMIN_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
  private static final UUID ORGANIZER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
  private static final UUID ATTENDEE_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

  private TicketType sampleTicketType;

  @BeforeEach
  void setUp() {
    User organizer = new User();
    organizer.setId(ORGANIZER_ID);
    organizer.setName("demo_organizer");
    organizer.setEmail("demo_organizer@eventhub.local");
    userRepository.saveAndFlush(organizer);

    User attendee = new User();
    attendee.setId(ATTENDEE_ID);
    attendee.setName("demo_attendee");
    attendee.setEmail("demo_attendee@eventhub.local");
    userRepository.saveAndFlush(attendee);

    Event event = new Event();
    event.setName("RBAC Verification Concert");
    event.setVenue("Test Arena");
    event.setStatus(EventStatusEnum.PUBLISHED);
    event.setOrganizer(organizer);

    TicketType tt = new TicketType();
    tt.setName("General Admission");
    tt.setPrice(50.0);
    tt.setDescription("Standard entry");
    tt.setTotalAvailable(10);
    tt.setEvent(event);
    event.setTicketTypes(List.of(tt));

    Event savedEvent = eventRepository.saveAndFlush(event);
    sampleTicketType = savedEvent.getTicketTypes().get(0);
  }

  private Jwt buildKeycloakJwt(UUID userId, String username, String role) {
    return Jwt.withTokenValue("mock-token-" + username)
        .header("alg", "RS256")
        .subject(userId.toString())
        .claim("preferred_username", username)
        .claim("email", username + "@eventhub.local")
        .claim("realm_access", Map.of("roles", List.of(role)))
        .build();
  }

  @Test
  void unauthenticatedUserCannotAccessProtectedEndpoints() throws Exception {
    mockMvc.perform(get("/api/v1/admin/overview"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(get("/api/v1/events"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(get("/api/v1/tickets"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(post("/api/v1/ticket-validations")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":\"" + UUID.randomUUID() + "\",\"method\":\"QR_SCAN\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void publicPublishedEventsEndpointIsAccessibleWithoutAuth() throws Exception {
    mockMvc.perform(get("/api/v1/published-events"))
        .andExpect(status().isOk());
  }

  @Test
  void adminCanAccessAdminApiWhileOrganizerAndAttendeeReceive403() throws Exception {
    Jwt adminJwt = buildKeycloakJwt(ADMIN_ID, "demo_admin", "ADMIN");
    Jwt organizerJwt = buildKeycloakJwt(ORGANIZER_ID, "demo_organizer", "ORGANIZER");
    Jwt attendeeJwt = buildKeycloakJwt(ATTENDEE_ID, "demo_attendee", "ATTENDEE");

    mockMvc.perform(get("/api/v1/admin/overview")
            .with(jwt().jwt(adminJwt).authorities(jwtAuthenticationConverter.convert(adminJwt).getAuthorities())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalEvents").exists());

    mockMvc.perform(get("/api/v1/admin/overview")
            .with(jwt().jwt(organizerJwt).authorities(jwtAuthenticationConverter.convert(organizerJwt).getAuthorities())))
        .andExpect(status().isForbidden());

    mockMvc.perform(get("/api/v1/admin/overview")
            .with(jwt().jwt(attendeeJwt).authorities(jwtAuthenticationConverter.convert(attendeeJwt).getAuthorities())))
        .andExpect(status().isForbidden());
  }

  @Test
  void attendeeCannotAccessOrganizerEventsOrTicketValidationEndpoints() throws Exception {
    Jwt attendeeJwt = buildKeycloakJwt(ATTENDEE_ID, "demo_attendee", "ATTENDEE");

    mockMvc.perform(get("/api/v1/events")
            .with(jwt().jwt(attendeeJwt).authorities(jwtAuthenticationConverter.convert(attendeeJwt).getAuthorities())))
        .andExpect(status().isForbidden());

    mockMvc.perform(post("/api/v1/ticket-validations")
            .with(jwt().jwt(attendeeJwt).authorities(jwtAuthenticationConverter.convert(attendeeJwt).getAuthorities()))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":\"" + UUID.randomUUID() + "\",\"method\":\"QR_SCAN\"}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void completeQrTicketPurchaseAndValidationWorkflowPreventsDuplicateRedemption() throws Exception {
    Jwt attendeeJwt = buildKeycloakJwt(ATTENDEE_ID, "demo_attendee", "ATTENDEE");
    Jwt organizerJwt = buildKeycloakJwt(ORGANIZER_ID, "demo_organizer", "ORGANIZER");

    // 1. Attendee purchases a ticket
    Ticket purchasedTicket = ticketTypeService.purchaseTicket(ATTENDEE_ID, sampleTicketType.getId());
    assertThat(purchasedTicket.getId()).isNotNull();

    // 2. Verify QR Code was generated for the ticket
    QrCode qrCode = qrCodeRepository
        .findByTicketIdAndTicketPurchaserId(purchasedTicket.getId(), ATTENDEE_ID)
        .orElseThrow();

    // 3. Attendee can download QR code PNG image
    mockMvc.perform(get("/api/v1/tickets/" + purchasedTicket.getId() + "/qr-codes")
            .with(jwt().jwt(attendeeJwt).authorities(jwtAuthenticationConverter.convert(attendeeJwt).getAuthorities())))
        .andExpect(status().isOk());

    // 4. Organizer validates the QR code for the first time -> VALID
    mockMvc.perform(post("/api/v1/ticket-validations")
            .with(jwt().jwt(organizerJwt).authorities(jwtAuthenticationConverter.convert(organizerJwt).getAuthorities()))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":\"" + qrCode.getId() + "\",\"method\":\"QR_SCAN\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("VALID"));

    // 5. Organizer scans the SAME QR code a second time -> INVALID (duplicate redemption prevented!)
    mockMvc.perform(post("/api/v1/ticket-validations")
            .with(jwt().jwt(organizerJwt).authorities(jwtAuthenticationConverter.convert(organizerJwt).getAuthorities()))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":\"" + qrCode.getId() + "\",\"method\":\"QR_SCAN\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("INVALID"));
  }
}
