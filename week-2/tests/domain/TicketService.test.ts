import { describe, it, beforeEach, mock } from "node:test";
import * as assert from "node:assert/strict";

import { TicketService } from "../../src/core/services/TicketService";
import type { TicketRepositoryPort } from "../../src/core/ports/TicketRepositoryPort";
import type { CreateTicketInput } from "../../src/core/ports/TicketServicePort";
import { Ticket } from "../../src/core/entites/Ticket";
import { InvalidDataError } from "../../src/core/errors/InvalidDataError";
import type { TicketFilters } from "../../src/core/ports/TicketServicePort";

describe("TicketService Unit Tests", () => {
  let repositoryMock: TicketRepositoryPort;
  let service: TicketService;

  beforeEach(() => {
    repositoryMock = {
      create: mock.fn(async (ticket: Ticket) => ticket),
      findById: mock.fn(),
      findAll: mock.fn(),
      update: mock.fn(),
    };
    service = new TicketService(repositoryMock);
  });

  describe("createTicket", () => {
    it("nên tạo ticket thành công khi dữ liệu hợp lệ", async () => {
      const input: CreateTicketInput = {
        title: "Test ticket",
        description: "Mô tả hợp lệ",
        status: "open",
        priority: "low",
        tags: ["bug"],
      };

      const result = await service.createTicket(input)

      assert.ok(result instanceof Ticket);
      assert.equal(result.title, input.title.trim())
      assert.equal(result.status, input.status)
      
      const createCalls = (repositoryMock.create as any).mock.calls
      assert.equal(createCalls.length, 1);
      assert.equal(createCalls[0].arguments[0].title, input.title.trim())
    });

    it("nên ném lỗi InvalidDataError và không gọi repository khi tiêu đề rỗng", async () => {
      const invalidInput: CreateTicketInput = {
        title: "   ",
        description: "Mô tả",
        status: "open",
        priority: "low",
        tags: [],
      };

      await assert.rejects(
        () => service.createTicket(invalidInput),
        InvalidDataError
      );

      const createCalls = (repositoryMock.create as any).mock.calls
      assert.equal(createCalls.length, 0);
    });
  });

  describe("listTickets", () => {
    it("nên trả về danh sách ticket từ repository hoặc mảng rỗng", async () => {
      const mockData = [
        new Ticket("T1", "D1", "open", "low", new Date()),
        new Ticket("T2", "D2", "done", "high", new Date())
      ];

      (repositoryMock.findAll as any).mock.mockImplementation(async () => mockData);
      const result = await service.listTickets({})
      assert.deepEqual(result, mockData);

      (repositoryMock.findAll as any).mock.mockImplementation(async () => []);
      const emptyResult = await service.listTickets({})
      assert.deepEqual(emptyResult, [])
    });

    it("nên chuyển tiếp bộ lọc xuống repository chính xác", async () => {
      const filters: TicketFilters = { status: "open", priority: "high" }
      const expectedTickets = [new Ticket("T1", "D1", "open", "high", new Date())];

      (repositoryMock.findAll as any).mock.mockImplementation(async (f: TicketFilters) => {
        if (f.status === "open" && f.priority === "high") return expectedTickets
        return []
      });

      const result = await service.listTickets(filters)

      assert.equal(result.length, 1)
      assert.deepEqual(result, expectedTickets)

      const calls = (repositoryMock.findAll as any).mock.calls
      assert.deepEqual(calls[0].arguments[0], filters)
    });
  });
});