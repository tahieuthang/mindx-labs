export class TicketNotFoundError extends Error {
  constructor(id: string) {
    super(`Ticket với ID "${id}" không tồn tại.`);
    this.name = 'TicketNotFoundError';
    Object.setPrototypeOf(this, TicketNotFoundError.prototype);
  }
}