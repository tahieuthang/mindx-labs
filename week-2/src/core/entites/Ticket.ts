import type { UpdateTicketInput } from "../ports/TicketServicePort";
export type TicketStatus = 'open' | 'in-progress' | 'done'
export type TicketPriority = 'low' | 'medium' | 'high'

export class Ticket {
  public readonly id: string
  constructor(
    public title: string,
    public description: string,
    public status: TicketStatus,
    public priority: TicketPriority,
    public createdAt: Date,
    public updatedAt?: Date,
    public tags?: string[],
    id?: string,
  ) {
    this.validate()
    this.id = id || Math.random().toString(36).substr(2, 9)
    this.tags = tags || []
    this.title = title.trim()
    this.status = status
  }

  private validate() {
    if(!this.title || this.title.trim() === '') {
      throw new Error('Tiêu đề ticket không được để trống hoặc chỉ chứa dấu cách')
    }
    if(!this.description || this.description.trim() === '') {
      throw new Error('Mô tả ticket không được để trống hoặc chỉ chứa dấu cách')
    }
    const validateStatus: TicketStatus[] = ['open', 'in-progress', 'done']
    if(!validateStatus.includes(this.status)) {
      throw new Error('Trạng thái status không hợp lệ')
    }
    const validatePriority: TicketPriority[] = ['low', 'medium', 'high']
    if(!validatePriority.includes(this.priority)) {
      throw new Error('Trạng thái priority không hợp lệ')
    }
  }

  public update(data: UpdateTicketInput) {
    const { title, description, status, priority, tags = [] } = data
    if(title !== undefined) this.title = title.trim()
    if(description !== undefined) this.description = description
    if(status !== undefined) this.status = status
    if(priority !== undefined) this.priority = priority
    if(tags !== undefined) this.tags = tags

    this.updatedAt = new Date()
    this.validate()
  }
}