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

export interface TicketServicePort {
  createTicket(data: CreateTicketInput): Promise<Ticket>
  getTicket(id: string): Promise<Ticket | null>
  listTickets(filters: any): Promise<Ticket[]>
  updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket>
}