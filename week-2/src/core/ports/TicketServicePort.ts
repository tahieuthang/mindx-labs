import type { Ticket, TicketStatus, TicketPriority } from "../entites/Ticket";

export type CreateTicketInput = {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
};

export type UpdateTicketInput = {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string[]
}

export interface TicketServicePort {
  createTicket(data: CreateTicketInput): Promise<void>
  getTicket(id: string): Promise<Ticket | null>
  listTickets(filters: any): Promise<Ticket[]>
  updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket>
}