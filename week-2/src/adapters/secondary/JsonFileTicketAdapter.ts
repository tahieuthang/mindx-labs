import type { TicketRepositoryPort } from "../../core/ports/TicketRepositoryPort"
import { Ticket } from "../../core/entites/Ticket"
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export class JsonFileTicketAdapter implements TicketRepositoryPort {
  private readonly filePath = path.resolve(process.cwd(), 'data', 'tickets.json');

  async create(ticket: Ticket): Promise<Ticket> {
    try {
      const rawData = await fs.readFile(this.filePath, 'utf-8');
      const tickets = JSON.parse(rawData || '[]')
      tickets.push({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      })
      await fs.writeFile(this.filePath, JSON.stringify(tickets, null, 2), 'utf-8')
      return ticket
    } catch(error) {
      throw new Error(`Persistence Error ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }

  async findById(id: string): Promise<Ticket | null> {
    throw new Error("Method findById chưa được triển khai.");
  }

  async findAll(): Promise<Ticket[]> {
    console.warn("Lưu ý: findAll đang trả về mảng rỗng tạm thời.");
    return [];
  }

  async update(ticket: Ticket): Promise<void> {
    throw new Error("Method update chưa được triển khai.");
  }

}