package com.eventhub.tickets.mappers;

import com.eventhub.tickets.domain.CreateEventRequest;
import com.eventhub.tickets.domain.CreateTicketTypeRequest;
import com.eventhub.tickets.domain.UpdateEventRequest;
import com.eventhub.tickets.domain.UpdateTicketTypeRequest;
import com.eventhub.tickets.domain.dtos.CreateEventRequestDto;
import com.eventhub.tickets.domain.dtos.CreateEventResponseDto;
import com.eventhub.tickets.domain.dtos.CreateTicketTypeRequestDto;
import com.eventhub.tickets.domain.dtos.GetEventDetailsResponseDto;
import com.eventhub.tickets.domain.dtos.GetEventDetailsTicketTypesResponseDto;
import com.eventhub.tickets.domain.dtos.GetPublishedEventDetailsResponseDto;
import com.eventhub.tickets.domain.dtos.GetPublishedEventDetailsTicketTypesResponseDto;
import com.eventhub.tickets.domain.dtos.ListEventResponseDto;
import com.eventhub.tickets.domain.dtos.ListEventTicketTypeResponseDto;
import com.eventhub.tickets.domain.dtos.ListPublishedEventResponseDto;
import com.eventhub.tickets.domain.dtos.UpdateEventRequestDto;
import com.eventhub.tickets.domain.dtos.UpdateEventResponseDto;
import com.eventhub.tickets.domain.dtos.UpdateTicketTypeRequestDto;
import com.eventhub.tickets.domain.dtos.UpdateTicketTypeResponseDto;
import com.eventhub.tickets.domain.entities.Event;
import com.eventhub.tickets.domain.entities.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EventMapper {

  CreateTicketTypeRequest fromDto(CreateTicketTypeRequestDto dto);

  CreateEventRequest fromDto(CreateEventRequestDto dto);

  CreateEventResponseDto toDto(Event event);

  ListEventTicketTypeResponseDto toDto(TicketType ticketType);

  ListEventResponseDto toListEventResponseDto(Event event);

  GetEventDetailsTicketTypesResponseDto toGetEventDetailsTicketTypesResponseDto(
      TicketType ticketType);

  GetEventDetailsResponseDto toGetEventDetailsResponseDto(Event event);

  UpdateTicketTypeRequest fromDto(UpdateTicketTypeRequestDto dto);

  UpdateEventRequest fromDto(UpdateEventRequestDto dto);

  UpdateTicketTypeResponseDto toUpdateTicketTypeResponseDto(TicketType ticketType);

  UpdateEventResponseDto toUpdateEventResponseDto(Event event);

  ListPublishedEventResponseDto toListPublishedEventResponseDto(Event event);

  GetPublishedEventDetailsTicketTypesResponseDto toGetPublishedEventDetailsTicketTypesResponseDto(
      TicketType ticketType);

  GetPublishedEventDetailsResponseDto toGetPublishedEventDetailsResponseDto(Event event);
}

