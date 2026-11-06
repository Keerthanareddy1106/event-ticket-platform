package com.eventhub.tickets.repositories;

import com.eventhub.tickets.domain.entities.TicketValidation;
import com.eventhub.tickets.domain.entities.TicketValidationStatusEnum;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketValidationRepository extends JpaRepository<TicketValidation, UUID> {

  boolean existsByTicketIdAndStatus(UUID ticketId, TicketValidationStatusEnum status);

}
