import type { TicketRepositoryPort } from "../../core/ports/TicketRepositoryPort"
import { Ticket, TicketStatus } from "../../core/entites/Ticket"
import { TicketFilters } from "../../core/ports/TicketServicePort";
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
    const rawData = await fs.readFile(this.filePath, 'utf-8')
    let plainObjects = JSON.parse(rawData || '[]') as any[]
    let tickets: Ticket[] = plainObjects.map(item => Ticket.formRaw(item))
    const searchTicket = tickets.find((t: Ticket) => t.id === id)
    if(!searchTicket) return null
    return searchTicket
  }

  async findAll(filters?: TicketFilters): Promise<Ticket[] | []> {
    try {
      const rawData = await fs.readFile(this.filePath, 'utf-8')
      let plainObjects = JSON.parse(rawData || '[]') as any[]
      let tickets: Ticket[] = plainObjects.map(item => Ticket.formRaw(item))
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
    } catch (error) {
      throw new Error(`Display Error ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const rawData = await fs.readFile(this.filePath, 'utf-8')
    const allTicket: Ticket[] = JSON.parse(rawData || '[]')
    let searchTicket = allTicket.find(t => t.id === ticket.id)
    if(searchTicket) {
      searchTicket.status = ticket.status
      searchTicket.updatedAt = ticket.updatedAt
      await fs.writeFile(this.filePath, JSON.stringify(allTicket, null, 2), 'utf-8')
      return searchTicket
    } else {
      throw new Error(`Ticket với ID ${ticket.id} không tồn tại trong hệ thống.`)
    }
    
  }

}