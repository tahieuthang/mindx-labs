import type { TicketRepositoryPort } from "../ports/TicketRepositoryPort"
import type { CreateTicketInput, UpdateTicketInput, TicketServicePort } from "../ports/TicketServicePort"
import { Ticket } from "../entites/Ticket"
import { TicketNotFoundError } from "../errors/TicketNotFoundError"
import { TicketFilters } from "../../core/ports/TicketServicePort";

export class TicketService implements TicketServicePort {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async createTicket(data: CreateTicketInput): Promise<Ticket> {
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
    const createdTicket = await this.ticketRepository.create(ticket)
    return createdTicket
  }

  async getTicket(id: string): Promise<Ticket | null> {
    const ticket = await this.ticketRepository.findById(id)
    if(!ticket) {
      throw new TicketNotFoundError(id)
    }
    return ticket
  }

  async listTickets(filters?: TicketFilters): Promise<Ticket[] | []> {
    const tickets = await this.ticketRepository.findAll(filters)
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