package com.eventhub.tickets.services;

import com.eventhub.tickets.domain.entities.QrCode;
import com.eventhub.tickets.domain.entities.Ticket;
import java.util.UUID;

public interface QrCodeService {

  QrCode generateQrCode(Ticket ticket);

  byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId);
}

