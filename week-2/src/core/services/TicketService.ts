import type { TicketRepositoryPort } from "../ports/TicketRepositoryPort"
import type { CreateTicketInput, UpdateTicketInput, TicketServicePort } from "../ports/TicketServicePort"
import { Ticket } from "../entites/Ticket"
import { TicketNotFoundError } from "../errors/TicketNotFoundError"

export class TicketService implements TicketServicePort {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async createTicket(data: CreateTicketInput): Promise<void> {
    const {
      title,
      description,
      status = "open",
      priority = "low",
      tags = [],
    } = data;
    const createdAt = new Date()
    const ticket = new Ticket(
      title,
      description,
      status,
      priority,
      createdAt,
      undefined,
      tags
    );
    await this.ticketRepository.create(ticket)
  }

  async getTicket(id: string): Promise<Ticket | null> {
    const ticket = await this.ticketRepository.findById(id)
    if(!ticket) {
      throw new TicketNotFoundError(id)
    }
    return ticket
  }

  async listTickets(filters: any): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.findAll();

    if (filters?.status) {
      return tickets.filter((t) => t.status === filters.status)
    }

    if (filters?.priority) {
      return tickets.filter((t) => t.priority === filters.priority)
    }

    if (filters?.tags && filters.tags.length > 0) {
      return tickets.filter((t) => {
        t.tags?.some(tag => filters.tags.includes(tag))
      })
    }

    return tickets
  }

  async updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id)
    if (!ticket) {
      throw new TicketNotFoundError(id)
    }

    ticket.update(data)

    await this.ticketRepository.update(ticket)
    return ticket;
  }
}