package com.eventhub.tickets.services;

import com.eventhub.tickets.domain.entities.TicketValidation;
import java.util.UUID;

public interface TicketValidationService {
  TicketValidation validateTicketByQrCode(UUID qrCodeId);
  TicketValidation validateTicketManually(UUID ticketId);
}

