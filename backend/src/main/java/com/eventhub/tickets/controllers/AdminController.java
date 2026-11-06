package com.eventhub.tickets.controllers;

import com.eventhub.tickets.domain.dtos.ListEventResponseDto;
import com.eventhub.tickets.domain.entities.EventStatusEnum;
import com.eventhub.tickets.mappers.EventMapper;
import com.eventhub.tickets.repositories.EventRepository;
import com.eventhub.tickets.repositories.TicketRepository;
import com.eventhub.tickets.repositories.TicketValidationRepository;
import com.eventhub.tickets.repositories.UserRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

  private final EventRepository eventRepository;
  private final UserRepository userRepository;
  private final TicketRepository ticketRepository;
  private final TicketValidationRepository ticketValidationRepository;
  private final EventMapper eventMapper;

  @GetMapping(path = "/overview")
  public ResponseEntity<Map<String, Object>> getPlatformOverview() {
    long totalEvents = eventRepository.count();
    long publishedEvents = eventRepository
        .findByStatus(EventStatusEnum.PUBLISHED, Pageable.unpaged())
        .getTotalElements();
    long totalUsers = userRepository.count();
    long totalTickets = ticketRepository.count();
    long totalValidations = ticketValidationRepository.count();

    return ResponseEntity.ok(Map.of(
        "totalEvents", totalEvents,
        "publishedEvents", publishedEvents,
        "totalUsers", totalUsers,
        "totalTicketsIssued", totalTickets,
        "totalQrValidations", totalValidations
    ));
  }

  @GetMapping(path = "/users")
  public ResponseEntity<List<Map<String, Object>>> listPlatformUsers() {
    List<Map<String, Object>> users = userRepository.findAll().stream()
        .map(u -> Map.<String, Object>of(
            "id", u.getId().toString(),
            "name", u.getName(),
            "email", u.getEmail(),
            "organizedEventsCount", u.getOrganizedEvents() != null ? u.getOrganizedEvents().size() : 0
        ))
        .toList();
    return ResponseEntity.ok(users);
  }

  @GetMapping(path = "/events")
  public ResponseEntity<Page<ListEventResponseDto>> listAllPlatformEvents(Pageable pageable) {
    return ResponseEntity.ok(
        eventRepository.findAll(pageable).map(eventMapper::toListEventResponseDto)
    );
  }
}
