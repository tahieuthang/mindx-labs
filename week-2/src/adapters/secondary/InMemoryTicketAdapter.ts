import type { TicketRepositoryPort } from "../../core/ports/TicketRepositoryPort"
import { Ticket } from "../../core/entites/Ticket"
import { TicketFilters } from "../../core/ports/TicketServicePort";

export class InMemoryTicketAdapter implements TicketRepositoryPort {
  private tickets: Ticket[] = []

  async create(ticket: Ticket): Promise<Ticket> {
    this.tickets.push(ticket)
    return ticket
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = this.tickets.find(t => t.id === id);
    return ticket || null;
  }

  async findAll(filters?: TicketFilters): Promise<Ticket[] | []> {
    let tickets = this.tickets
    if(filters?.status) {
      tickets = tickets.filter(t => t.status === filters.status)
    }
    if(filters?.priority) {
      tickets = tickets.filter(t => t.priority === filters.priority)
    }
    if(filters?.tags && filters?.tags?.length > 0) {
      tickets = tickets.filter(t => t.tags?.some((tag: string) => filters?.tags?.includes(tag)))
    }
    return tickets || []
  }

  async update(ticket: Ticket): Promise<void> {}

}