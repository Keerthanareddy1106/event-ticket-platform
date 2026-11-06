package com.eventhub.tickets.repositories;

import com.eventhub.tickets.domain.entities.Ticket;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

  int countByTicketTypeId(UUID ticketTypeId);

  Page<Ticket> findByPurchaserId(UUID purchaserId, Pageable pageable);

  Optional<Ticket> findByIdAndPurchaserId(UUID id, UUID purchaserId);

  @Query("SELECT t FROM Ticket t WHERE t.id = :id")
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<Ticket> findByIdWithLock(@Param("id") UUID id);
}
