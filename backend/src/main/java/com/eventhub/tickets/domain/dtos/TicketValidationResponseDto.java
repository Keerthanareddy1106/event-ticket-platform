package com.eventhub.tickets.domain.dtos;

import com.eventhub.tickets.domain.entities.TicketValidationStatusEnum;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketValidationResponseDto {
  private UUID ticketId;
  private TicketValidationStatusEnum status;
}

