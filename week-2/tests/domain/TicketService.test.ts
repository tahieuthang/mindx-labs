import { describe, it, mock } from "node:test";
import * as assert from "node:assert/strict";

import { TicketService } from "../../src/core/services/TicketService";
import type { TicketRepositoryPort } from "../../src/core/ports/TicketRepositoryPort";
import type { CreateTicketInput } from "../../src/core/ports/TicketServicePort";
import { Ticket } from "../../src/core/entites/Ticket";
import { InvalidDataError } from "../../src/core/errors/InvalidDataError";

describe("TicketService.createTicket", () => {
  it("Case 1: Tạo Ticket thành công với dữ liệu hợp lệ", async () => {
    // Mock Outbound Port (Repository)
    const repositoryMock: TicketRepositoryPort = {
      create: mock.fn(async (ticket: Ticket) => ticket),
      findById: mock.fn(),
      findAll: mock.fn(),
      update: mock.fn(),
    };

    const service = new TicketService(repositoryMock);

    const input: CreateTicketInput = {
      title: "Test ticket",
      description: "Mô tả hợp lệ",
      status: "open",
      priority: "low",
      tags: ["bug"],
    };

    // Act
    const createdTicket = await service.createTicket(input);

    // Assert: Service trả về ticket mới tạo
    assert.ok(createdTicket);
    assert.equal(createdTicket.title, input.title.trim());
    assert.equal(createdTicket.description, input.description);
    assert.equal(createdTicket.status, input.status);
    assert.equal(createdTicket.priority, input.priority);
    assert.deepEqual(createdTicket.tags, input.tags);

    // repository.create được gọi đúng 1 lần với Ticket vừa tạo
    const createMock = (repositoryMock.create as any).mock;
    assert.equal(createMock.callCount(), 1);
    const [calledTicket] = createMock.calls[0].arguments;
    assert.ok(calledTicket instanceof Ticket);
    assert.equal(calledTicket.title, input.title.trim());
  });

  it("Case 2: Nếu dữ liệu không hợp lệ, phải ném lỗi và không gọi Repository.create", async () => {
    // Mock Repository
    const repositoryMock: TicketRepositoryPort = {
      create: mock.fn(async (ticket: Ticket) => ticket),
      findById: mock.fn(),
      findAll: mock.fn(),
      update: mock.fn(),
    };

    const service = new TicketService(repositoryMock);

    const invalidInput: CreateTicketInput = {
      title: "   ", // tiêu đề không hợp lệ -> Ticket constructor sẽ ném InvalidDataError
      description: "Mô tả bất kỳ",
      status: "open",
      priority: "low",
      tags: ["bug"],
    };

    // Act + Assert: createTicket phải ném InvalidDataError
    await assert.rejects(
      () => service.createTicket(invalidInput),
      (err: any) => {
        assert.ok(err instanceof InvalidDataError);
        return true;
      }
    );

    // Và KHÔNG được gọi xuống Repository.create
    const createMock = (repositoryMock.create as any).mock;
    assert.equal(createMock.callCount(), 0);
  });
});