import type { Ticket } from "../entites/Ticket";
import { TicketFilters } from "./TicketServicePort";
import { TicketStatus } from "../entites/Ticket";

export interface TicketRepositoryPort {
  create(ticket: Ticket): Promise<Ticket>
  findById(id: string): Promise<Ticket | null>
  findAll(filters?: TicketFilters): Promise<Ticket[] | []>
  update(ticket: Ticket): Promise<Ticket>
}