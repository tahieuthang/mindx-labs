import { InvalidDataError } from "../errors/InvalidDataError"
import { TicketNotFoundError } from "../errors/TicketNotFoundError";
export type TicketStatus = 'open' | 'in-progress' | 'done'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketTag = 'bug' | 'feature' | 'task' | 'fix';

export class Ticket {
  public readonly id: string
  public title: string
  public description: string
  public status: TicketStatus
  public priority: TicketPriority
  public createdAt: Date
  public updatedAt?: Date | undefined
  public tags: TicketTag[]
  constructor(
    title: string,
    description: string,
    status: TicketStatus,
    priority: TicketPriority,
    createdAt: Date,
    updatedAt?: Date | undefined,
    tags?: TicketTag[],
    id?: string,
  ) {
    this.id = id || Math.random().toString(36).substr(2, 9)
    this.title = title.trim()
    this.description = description.trim()
    this.status = status
    this.priority = priority
    this.createdAt = createdAt
    this.updatedAt = updatedAt || undefined
    this.tags = tags || []
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

  static formRaw(data: any): Ticket {
    return new Ticket(
      data.title,
      data.description,
      data.status || 'open',
      data.priority || 'low',
      new Date(data.createdAt),
      data.updatedAt ? new Date(data.updatedAt) : undefined,
      data.tags || [],
      data.id
    )
  }

  public update(status: TicketStatus): boolean {
    if(this.status === status) return false
    if(status !== undefined) this.status = status
    this.updatedAt = new Date()
    this.validate()
    return true
  }
}