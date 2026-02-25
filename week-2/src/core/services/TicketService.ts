import type { TicketRepositoryPort } from "../ports/TicketRepositoryPort"
import type { CreateTicketInput, UpdateTicketInput, TicketServicePort } from "../ports/TicketServicePort"
import { Ticket } from "../entites/Ticket";

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
    await this.ticketRepository.create(ticket);
  }

  async getTicket(id: string): Promise<Ticket | null> {
    const ticket = await this.ticketRepository.findById(id);
    return ticket || null;
  }

  async listTickets(filters: any): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.findAll();

    if (filters?.status) {
      return tickets.filter((t) => t.status === filters.status);
    }

    if (filters?.priority) {
      return tickets.filter((t) => t.priority === filters.priority);
    }

    if (filters?.tags && filters.tags.length > 0) {
      return tickets.filter((t) => {
        t.tags?.some(tag => filters.tags.includes(tag))
      })
    }

    return tickets;
  }

  async updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new Error("Không có Ticket hợp lệ!");
    }

    const { title, description, status, priority, tags } = data;

    if (title !== undefined) (ticket as any).title = title;
    if (description !== undefined) (ticket as any).description = description;
    if (status !== undefined) (ticket as any).status = status;
    if (priority !== undefined) (ticket as any).priority = priority;
    if (tags !== undefined) (ticket as any).tags = tags;

    (ticket as any).updatedAt = new Date();

    await this.ticketRepository.update(ticket);
    return ticket;
  }
}