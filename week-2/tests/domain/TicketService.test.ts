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
      delete: mock.fn()
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

      mock.method(repositoryMock, 'create', async (ticket: Ticket) => ticket)

      const result = await service.createTicket(input)

      assert.ok(result instanceof Ticket);
      assert.strictEqual(result.title, input.title.trim())
      assert.strictEqual(result.status, input.status)
      assert.ok(result.id, "Phải có ID được sinh ra")

      const createCalls = (repositoryMock.create as any).mock.calls 
      assert.strictEqual(createCalls.length, 1, "Service làm sạch dữ liệu trước khi gửi xuống repo");

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
      assert.strictEqual(createCalls.length, 0);
    });
  });

  describe("listTickets", () => {
    it("Trả về danh sách ticket", async () => {
      const mockData = [
        new Ticket("T1", "D1", "open", "low", new Date()),
        new Ticket("T2", "D2", "done", "high", new Date())
      ];

      mock.method(repositoryMock, 'findAll', async () => mockData)

      const result = await service.listTickets({})

      assert.deepEqual(result, mockData);

      const listTicketsCall = (repositoryMock.findAll as any).mock.calls
      assert.deepEqual(listTicketsCall.length, 1)
    });

    it("Trả về mảng rỗng khi Repo không có dữ liệu", async () => {
      mock.method(repositoryMock, 'findAll', async () => []);
      
      const result = await service.listTickets({});
      
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 0);
    });

    it("Trả về danh sách ticket với bộ lọc", async () => {
      const filters: TicketFilters = { status: "open", priority: "high" }
      const expectedTickets = [new Ticket("T1", "D1", "open", "high", new Date())];

      mock.method(repositoryMock, 'findAll', async (filters?: TicketFilters) => {
        if(filters?.status === "open" && filters.priority === "high") return expectedTickets
        return []
      })

      const result = await service.listTickets(filters)
      assert.deepEqual(result, expectedTickets)

      const listFilterCalls = (repositoryMock.findAll as any).mock.calls
      assert.equal(listFilterCalls.length, 1)
      assert.deepEqual(listFilterCalls[0].arguments[0], filters)
    });
  });

  describe("showTickets", () => {
    it("Trả về ticket detail", async () => {
      const targetId = 'el46fpudo'
      const expectedTicket = new Ticket("T1", "D1", "open", "low", new Date(), undefined, ['bug'], targetId);

      mock.method(repositoryMock, 'findById', async (id: string) => expectedTicket)

      const result = await service.getTicket(targetId)
      
      assert.strictEqual(result?.id, expectedTicket.id)
      assert.strictEqual(result?.status, expectedTicket.status)
      assert.strictEqual(result?.priority, expectedTicket.priority)

      const calls = (repositoryMock.findById as any).mock.calls
      assert.strictEqual(calls.length, 1, "RepositoryMock.findById phải được gọi 1 lần")
      assert.strictEqual(calls[0].arguments[0], expectedTicket.id)
    });
    it("Ném lỗi TicketNotFoundError khi xem ticket", async () => {
      const targetId = 'el46fpudo'

      mock.method(repositoryMock, 'findById', async (id: string) => null)

      await assert.rejects(
        () => service.getTicket(targetId),
        TicketNotFoundError
      )

      const calls = (repositoryMock.findById as any).mock.calls
      assert.strictEqual(calls.length, 1)
      assert.strictEqual(calls[0].arguments[0], targetId)
    });
  });

  describe("updateTickets", () => {
    it("Update ticket với status hợp lệ", async () => {
      // --- 1. ARRANGE (Chuẩn bị) ---
      const createdAt = new Date("2026-02-25T16:10:59.699Z");
      const ticketMock = new Ticket("edit image feature", "image", "open", "medium", createdAt, new Date(), ['feature'], '8kea7o4jn');
      
      // Giả lập hành vi của Repository (Mocking dependencies)
      mock.method(repositoryMock, 'findById', async (id: string) => ticketMock)
      mock.method(repositoryMock, 'update', async (t: Ticket) => ticketMock)

      // --- 2. ACT (Thực thi) ---
      // Gọi hàm cần test từ Service
      const result = await service.updateTicket(ticketMock, "done")
      
      // --- 3. ASSERT (Kiểm chứng) ---
      // A. Kiểm tra Output của Service (Kết quả trả về cho người dùng)
      assert.ok(result instanceof Ticket)
      assert.strictEqual(result.id, ticketMock.id)
      assert.strictEqual(result.title, ticketMock.title)
      assert.strictEqual(result.description, ticketMock.description)
      assert.strictEqual(result.id, ticketMock.id)

      // B. Kiểm tra Interaction (Sự tương tác giữa Service và Repo)
      const updateCalls = (repositoryMock.update as any).mock.calls
      // Kiểm tra số lần gọi Repo
      assert.strictEqual(updateCalls.length, 1, "Repository.update phải được gọi đúng 1 lần")

      // Kiểm tra Input của Repo (Service có truyền đúng dữ liệu xuống cho Repo không?)
      assert.strictEqual(updateCalls[0].arguments[0].status, "done", "Service thay đổi status thành 'done' trước khi gửi xuống repo")
      assert.strictEqual(updateCalls[0].arguments[0].id, ticketMock.id, "Service phải gửi đúng Ticket ID xuống Repo")
    });
    it("Update ticket với status không hợp lệ", async () => {
      const createdAt = new Date("2026-02-25T16:10:59.699Z");
      const ticketMock = new Ticket("edit image feature", "image", "open", "medium", createdAt, new Date(), ['feature'], '8kea7o4jn')
      const statusMock: any = "wrong-status"

      mock.method(repositoryMock, 'findById', async (id: string) => ticketMock)
      mock.method(repositoryMock, 'update', async (t: Ticket) => null)

      await assert.rejects(
        () => service.updateTicket(ticketMock, statusMock),
        InvalidDataError
      )
      const createCalls = (repositoryMock.update as any).mock.calls
      assert.equal(createCalls.length, 0);
    })
  });
});