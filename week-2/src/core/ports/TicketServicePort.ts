import type { Ticket, TicketStatus, TicketPriority, TicketTag } from "../entites/Ticket";

export type CreateTicketInput = {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: TicketTag[];
};

export type UpdateTicketInput = {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: TicketTag[]
}

export type TicketFilters = {
  status?: string;
  priority?: string;
  tags?: string[];
}

export interface TicketServicePort {
  createTicket(data: CreateTicketInput): Promise<Ticket>
  getTicket(id: string): Promise<Ticket | null>
  listTickets(filters?: TicketFilters): Promise<Ticket[] | []>
  updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket>
}