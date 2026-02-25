import type { TicketRepositoryPort } from "../../core/ports/TicketRepositoryPort"
import { Ticket } from "../../core/entites/Ticket"

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

  async findAll(): Promise<Ticket[]> {
    const array = new Array()
    return array
  }

  async update(ticket: Ticket): Promise<void> {}

}