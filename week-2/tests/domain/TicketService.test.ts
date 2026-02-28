import { describe, it, beforeEach, mock } from "node:test";
import * as assert from "node:assert/strict";

import { TicketService } from "../../src/core/services/TicketService";
import type { TicketRepositoryPort } from "../../src/core/ports/TicketRepositoryPort";
import type { CreateTicketInput } from "../../src/core/ports/TicketServicePort";
import { Ticket } from "../../src/core/entites/Ticket";
import { InvalidDataError } from "../../src/core/errors/InvalidDataError";
import { TicketNotFoundError } from "../../src/core/errors/TicketNotFoundError";
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
    it("Tạo ticket thành công khi dữ liệu hợp lệ", async () => {
      // Chuẩn bị dữ liệu input
      const input: CreateTicketInput = {
        title: "Test ticket",
        description: "Mô tả hợp lệ",
        status: "open",
        priority: "low",
        tags: ["bug"],
      };

      (repositoryMock.create as any).mock.mockImplementation(async (ticket: Ticket) => ticket)

      const result = await service.createTicket(input)

      assert.ok(result instanceof Ticket);
      assert.strictEqual(result.title, input.title.trim())
      assert.strictEqual(result.status, input.status)
      assert.ok(result.id, "Phải có ID được sinh ra")

      const createCalls = (repositoryMock.create as any).mock.calls 
      assert.equal(createCalls.length, 1);

      const ticketSendToRepo = createCalls[0].arguments[0]
      assert.strictEqual(ticketSendToRepo.id, result.id, 'ID lưu xuống repo và trả về từ repo phải là một')
      assert.strictEqual(ticketSendToRepo.title, result.title, 'Title trả về từ repo và mock title ban đầu phải là một')
    });

    it("Ném lỗi InvalidDataError và không gọi repository khi dữ liệu (status) không hợp lệ", async () => {
      const invalidInput: CreateTicketInput = {
        title: "ticket 1",
        description: "Mô tả",
        status: "openn" as any,
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
    it("Trả về danh sách ticket hoặc mảng rỗng", async () => {
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

    it("Trả về danh sách ticket với bộ lọc", async () => {
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

  describe("showTickets", () => {
    it("Trả về ticket hoặc ném lỗi TicketNotFoundError", async () => {
      const targetId = 'el46fpudo'
      const expectedTicket = new Ticket("T1", "D1", "open", "low", new Date(), undefined, ['bug'], 'el46fpudo');

      (repositoryMock.findById as any).mock.mockImplementation(async (id: string) => {
        return id === targetId ? expectedTicket : null
      });

      const result = await service.getTicket(targetId)
      assert.strictEqual(result?.id, targetId)
      assert.deepEqual(result, expectedTicket)

      await assert.rejects(
        () => service.getTicket('wrong-id'),
        (err: any) => {
          assert.strictEqual(err.name, 'TicketNotFoundError');
          assert.match(err.message, /không tồn tại/);
          return true
        }
      )
    });
  });

  describe("updateTickets", () => {
    it("Update ticket với status hợp lệ", async () => {
      const createdAt = new Date("2026-02-25T16:10:59.699Z");
      const ticketMock = new Ticket("edit image feature", "image", "open", "medium", createdAt, new Date(), ['feature'], '8kea7o4jn');
      
      (repositoryMock.update as any).mock.mockImplementation(async (t: Ticket) => t)
      const result = await service.updateTicket(ticketMock, "done")
      
      assert.strictEqual(result.status, "done")
      assert.strictEqual(result.id, ticketMock.id)
      assert.strictEqual(result.title, ticketMock.title);
      assert.deepEqual(result.tags, ticketMock.tags);
      assert.strictEqual(result.createdAt.getTime(), createdAt.getTime());

      const updateCalls = (repositoryMock.update as any).mock.calls;
      assert.strictEqual(updateCalls.length, 1, "Repository.update phải được gọi đúng 1 lần");
      
      const ticketInCall = updateCalls[0].arguments[0];
      assert.strictEqual(ticketInCall.status, "done", "Ticket gửi xuống Repo phải có status là done");
      assert.strictEqual(ticketInCall.id, ticketMock.id, "Phải gửi đúng ID ticket xuống Repo");
    });
    it("Update ticket với status hợp lệ", async () => {
      const createdAt = new Date("2026-02-25T16:10:59.699Z");
      const ticketMock = new Ticket("edit image feature", "image", "open", "medium", createdAt, new Date(), ['feature'], '8kea7o4jn')
      const statusMock: any = "wrong-status"

      await assert.rejects(
        () => service.updateTicket(ticketMock, statusMock),
        InvalidDataError
      )
      const createCalls = (repositoryMock.update as any).mock.calls
      assert.equal(createCalls.length, 0);
    })
  });
});