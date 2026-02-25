import type { UpdateTicketInput } from "../ports/TicketServicePort";
import { InvalidDataError } from "../errors/InvalidDataError"
export type TicketStatus = 'open' | 'in-progress' | 'done'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketTag = 'bug' | 'feature' | 'task' | 'fix';

export class Ticket {
  public readonly id: string
  public tags: TicketTag[]
  constructor(
    public title: string,
    public description: string,
    public status: TicketStatus,
    public priority: TicketPriority,
    public createdAt: Date,
    public updatedAt?: Date,
    tags?: TicketTag[],
    id?: string,
  ) {
    this.id = id || Math.random().toString(36).substr(2, 9)
    this.tags = tags || []
    this.title = title.trim()
    this.status = status
    this.validate()
  }

  private validate() {
    if(!this.title || this.title.trim() === '') {
      throw new InvalidDataError('Tiêu đề ticket không được để trống hoặc chỉ chứa dấu cách')
    }
    if(!this.description || this.description.trim() === '') {
      throw new InvalidDataError('Mô tả ticket không được để trống hoặc chỉ chứa dấu cách')
    }
    const validateStatus: TicketStatus[] = ['open', 'in-progress', 'done']
    if(!validateStatus.includes(this.status)) {
      throw new InvalidDataError('Trạng thái status không hợp lệ')
    }
    const validatePriority: TicketPriority[] = ['low', 'medium', 'high']
    if(!validatePriority.includes(this.priority)) {
      throw new InvalidDataError('Trạng thái priority không hợp lệ')
    }
    const validateTags: TicketTag[] = ['bug', 'feature', 'task', 'fix']
    if (this.tags.length > 0) {
      const hasInvalidTag = !this.tags.every(tag => validateTags.includes(tag))
      if (hasInvalidTag) {
        throw new InvalidDataError(`Tag không hợp lệ. Chỉ chấp nhận các tag ${validateTags.join(', ')}`)
      }
    }
  }

  public update(data: UpdateTicketInput) {
    const { title, description, status, priority, tags = [] } = data
    if(title !== undefined) this.title = title.trim()
    if(description !== undefined) this.description = description
    if(status !== undefined) this.status = status
    if(priority !== undefined) this.priority = priority
    if(tags !== undefined) this.tags = tags as TicketTag[]

    this.updatedAt = new Date()
    this.validate()
  }
}