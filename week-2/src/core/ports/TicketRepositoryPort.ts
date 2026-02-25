import type { Ticket } from "../entites/Ticket";

export interface TicketRepositoryPort {
  create(ticket: Ticket): Promise<Ticket>
  findById(id: string): Promise<Ticket | null>
  findAll(): Promise<Ticket[]>
  update(ticket: Ticket): Promise<void>
}