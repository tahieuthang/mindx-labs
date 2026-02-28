import { describe, it, beforeEach, mock } from "node:test";
import * as assert from "node:assert/strict";

import { TicketService } from "../../src/core/services/TicketService";
import type { TicketRepositoryPort } from "../../src/core/ports/TicketRepositoryPort";
import type { CreateTicketInput } from "../../src/core/ports/TicketServicePort";
import { Ticket, TicketStatus, TicketTag } from "../../src/core/entites/Ticket";
import { InvalidDataError } from "../../src/core/errors/InvalidDataError";
import { TicketNotFoundError } from "../../src/core/errors/TicketNotFoundError";
import type { TicketFilters } from "../../src/core/ports/TicketServicePort";

describe("Test Entities Ticket", () => {
  describe("Validate Entites Ticket", () => {
    it("Ném lỗi validate khi dữ liệu không hợp lệ", () => {
      const createdAt = new Date
      const tags: TicketTag[] = ['bug']
      const status = 'urgent' as any
      assert.throws(
        () => new Ticket('title', 'description', status, 'low', createdAt, undefined, tags),
        InvalidDataError,
        "Ném lỗi validate khi status không hợp lệ"
      )
    })
    it("Nên khởi tạo entites Ticket khi dữ liệu hợp lệ", () => {
      const createdAt = new Date
      const tags: TicketTag[] = ['bug']
      const result = new Ticket('title', 'description', 'open', 'low', createdAt, undefined, tags)
  
      assert.ok(result instanceof Ticket)
      assert.strictEqual(result.title, 'title')
      assert.ok(result.id, "ID phải được khởi tạo")
    })
  })

  describe("Update Entites Ticket", () => {
    it("Update với status không hợp lệ", () => {
      const status = 'urgent' as any
      const tags: TicketTag[] = ['bug']
      const createdAt = new Date
      const ticket = new Ticket('title', 'description', 'open', 'low', createdAt, undefined, tags)

      assert.throws(
        () => ticket.update(status),
        InvalidDataError,
        "Status không hợp lệ"
      )
    })

    it("Update với status hợp lệ", () => {
      const status = "done"
      const tags: TicketTag[] = ['bug']
      const createdAt = new Date
      const ticket = new Ticket('title', 'description', 'open', 'low', createdAt, undefined, tags)

      const result = ticket.update(status)

      assert.strictEqual(result, true)
      assert.ok(ticket.updatedAt instanceof Date, "Update phải được gán value Date mới")
    })

    it("Update với status bị trùng", () => {
      const status = "open"
      const tags: TicketTag[] = ['bug']
      const createdAt = new Date
      const ticket = new Ticket('title', 'description', 'open', 'low', createdAt, undefined, tags)

      const result = ticket.update(status)

      assert.strictEqual(result, false, "Đây đã là status hiện tại của ticket!")
      assert.strictEqual(ticket.updatedAt, undefined, "Update sẽ không được gán value Date")
    })
  })
})