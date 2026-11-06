package com.eventhub.tickets.services.impl;

import com.eventhub.tickets.domain.entities.QrCode;
import com.eventhub.tickets.domain.entities.QrCodeStatusEnum;
import com.eventhub.tickets.domain.entities.Ticket;
import com.eventhub.tickets.domain.entities.TicketValidation;
import com.eventhub.tickets.domain.entities.TicketValidationMethod;
import com.eventhub.tickets.domain.entities.TicketValidationStatusEnum;
import com.eventhub.tickets.exceptions.QrCodeNotFoundException;
import com.eventhub.tickets.exceptions.TicketNotFoundException;
import com.eventhub.tickets.repositories.QrCodeRepository;
import com.eventhub.tickets.repositories.TicketRepository;
import com.eventhub.tickets.repositories.TicketValidationRepository;
import com.eventhub.tickets.services.TicketValidationService;
import jakarta.transaction.Transactional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketValidationServiceImpl implements TicketValidationService {

  private final QrCodeRepository qrCodeRepository;
  private final TicketValidationRepository ticketValidationRepository;
  private final TicketRepository ticketRepository;

  @Override
  public TicketValidation validateTicketByQrCode(UUID qrCodeId) {
    QrCode qrCode = qrCodeRepository.findByIdAndStatus(qrCodeId, QrCodeStatusEnum.ACTIVE)
        .orElseThrow(() -> new QrCodeNotFoundException(
            String.format(
                "QR Code with ID %s was not found", qrCodeId
            )
        ));

    Ticket ticket = ticketRepository.findByIdWithLock(qrCode.getTicket().getId())
        .orElseThrow(TicketNotFoundException::new);

    return validateTicket(ticket, TicketValidationMethod.QR_SCAN);
  }

  private TicketValidation validateTicket(Ticket ticket,
      TicketValidationMethod ticketValidationMethod) {
    TicketValidation ticketValidation = new TicketValidation();
    ticketValidation.setTicket(ticket);
    ticketValidation.setValidationMethod(ticketValidationMethod);

    boolean alreadyRedeemed = ticketValidationRepository.existsByTicketIdAndStatus(
        ticket.getId(), TicketValidationStatusEnum.VALID
    ) || (ticket.getValidations() != null && ticket.getValidations().stream()
        .anyMatch(v -> TicketValidationStatusEnum.VALID.equals(v.getStatus())));

    TicketValidationStatusEnum ticketValidationStatus = alreadyRedeemed
        ? TicketValidationStatusEnum.INVALID
        : TicketValidationStatusEnum.VALID;

    ticketValidation.setStatus(ticketValidationStatus);

    TicketValidation saved = ticketValidationRepository.saveAndFlush(ticketValidation);
    if (ticket.getValidations() != null) {
      ticket.getValidations().add(saved);
    }
    return saved;
  }

  @Override
  public TicketValidation validateTicketManually(UUID ticketId) {
    Ticket ticket = ticketRepository.findByIdWithLock(ticketId)
        .orElseThrow(TicketNotFoundException::new);
    return validateTicket(ticket, TicketValidationMethod.MANUAL);
  }
}
