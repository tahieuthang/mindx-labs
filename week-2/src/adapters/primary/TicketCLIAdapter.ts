import type * as Readline from "node:readline/promises";
import type { TicketServicePort, CreateTicketInput } from "../../core/ports/TicketServicePort"
import type { TicketStatus, TicketPriority, TicketTag } from "../../core/entites/Ticket";
import { Ticket } from "../../core/entites/Ticket"
import { TicketService } from "../../core/services/TicketService";
import { log } from "node:console";

async function askWithRetry<T>(
  rl: any, 
  question: string, 
  map: Record<string, T>, 
  optionsDisplay: string
): Promise<T> {
  while (true) {
    console.log(optionsDisplay);
    const choice = await rl.question(question);
    
    if (map[choice]) {
      return map[choice];
    }
    console.log(`❌ Lựa chọn "${choice}" không hợp lệ. Vui lòng chọn lại!`);
  }
}

async function askTagsWithRetry(
  rl: any,
  question: string,
  map: Record<string, TicketTag>,
  optionsDisplay: string
): Promise<TicketTag[]> {
  while (true) {
    console.log(optionsDisplay);
    const raw = await rl.question(question);
    const input = raw.trim();

    // Cho phép bỏ qua tag
    if (input === "") {
      return [];
    }

    const parts = input
      .split(",")
      .map((p: string) => p.trim())
      .filter((p: string) => p !== "");

    if (parts.length === 0) {
      console.log('❌ Bạn chưa chọn tag nào. Vui lòng nhập lại (ví dụ: 1,2,4) hoặc bấm Enter để bỏ qua.');
      continue;
    }

    // Kiểm tra trùng lặp
    const unique = new Set(parts);
    if (unique.size !== parts.length) {
      console.log('❌ Có số tag bị trùng lặp. Vui lòng nhập lại (ví dụ: 1,2,4).');
      continue;
    }

    // Kiểm tra ngoài phạm vi
    const invalid = parts.filter((p: string) => !map[p]);
    if (invalid.length > 0) {
      console.log(`❌ Các lựa chọn sau không hợp lệ: ${invalid.join(", ")}. Vui lòng nhập lại.`);
      continue;
    }

    return parts.map((p: string) => map[p]);
  }
}

async function enterWithRetry<T> (
  rl: any,
  question: string,
  validOptions: string[],
): Promise<TicketStatus> {
  while (true) {
    const choice = await rl.question(question)
    const clearChoice = choice.trim()
    if(validOptions.includes(clearChoice)) {
      return clearChoice
    }
    console.log(`❌ Lựa chọn "${choice}" không hợp lệ. Vui lòng nhập lại!`);
  }
}

export async function handleListTickets(ticketService: TicketServicePort, rl: Readline.Interface) {
  try {
    console.log("\n--- 📝 CHẾ ĐỘ XEM ---")
    console.log("1. Xem tất cả")
    console.log("2. Lọc theo Status")
    console.log("3. Lọc theo Priority")
    console.log("4. Lọc theo Tag")
    console.log("5. Xem chi tiết ticket")
    console.log("6. Thoát")

    const mode = await rl.question("Chọn chế độ xem: ")
    let tickets: Ticket[] = []
    let searchTicket: Ticket | null
    if (mode === '2') {
      const status = await enterWithRetry(
        rl,
        "Nhập status (open/in-progress/done): ",
        ['open', 'in-progress', 'done'],
      )
      tickets = await ticketService.listTickets({ status });
      console.log(tickets);
      
    } else if (mode === '3') {
      const priority = await enterWithRetry(
        rl,
        "Nhập status (low/medium/high): ",
        ['low', 'medium', 'high'],
      )
      tickets = await ticketService.listTickets({ priority });
    } else if (mode === '4') {
      const tags = await askTagsWithRetry(
        rl,
        "Nhập danh sách tag (ví dụ: 1,2,4) hoặc bấm Enter để bỏ qua: ",
        { "1": "bug", "2": "feature", "3": "task", "4": "fix" },
        "\nTag ticket:\n1. Bug\n2. Feature\n3. Task\n4. Fix"
      )
      tickets = await ticketService.listTickets({ tags })
    } else if (mode === '5') {
      const ticketId = await rl.question("Nhập ID Ticket: ")
      searchTicket = await ticketService.getTicket(ticketId)

      if(searchTicket) tickets.push(searchTicket)
      console.table(tickets)

      const confirm = await rl.question("Bạn có muốn cập nhật Ticket? (y/n): ")
      if(confirm.toLowerCase() == 'y') {
        if(searchTicket) await handleUpdateTicket(ticketService, searchTicket, rl)
      }
    } else if (mode === '6') {
      return
    } else {
      tickets = await ticketService.listTickets()
    }
    if(mode !== '5') console.table(tickets);
  } catch(error: any) {
    const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống"
    console.error(`\n--- ❌ THẤT BẠI ---`)
    console.error(`Lý do: ${errorMessage}`)
    console.error(`------------------\n`)
  }
}

export async function handleCreateTicket(ticketService: TicketServicePort, rl: Readline.Interface) {
  try {
    console.log("-- CHƯƠNG TRÌNH QUẢN LÝ TICKET --")

    const title = await rl.question("Nhập tiêu đề ticket: ")

    const description = await rl.question("Nhập mô tả ticket: ")

    const status = await askWithRetry<TicketStatus>(
      rl,
      "Lựa chọn status (1-3): ",
      { "1": "open", "2": "in-progress", "3": "done" },
      "\nTrạng thái ticket:\n1. Open\n2. In progress\n3. Done"
    );

    const priority = await askWithRetry<TicketPriority>(
      rl,
      "Lựa chọn priority (1-3): ",
      { "1": "low", "2": "medium", "3": "high" },
      "\nĐộ ưu tiên:\n1. Low\n2. Medium\n3. High"
    );

    const tags = await askTagsWithRetry(
      rl,
      "Nhập danh sách tag (ví dụ: 1,2,4) hoặc bấm Enter để bỏ qua: ",
      { "1": "bug", "2": "feature", "3": "task", "4": "fix" },
      "\nTag ticket:\n1. Bug\n2. Feature\n3. Task\n4. Fix"
    );

    const data: CreateTicketInput = {
      title,
      description,
      status,
      priority,
      tags
    }
    const createdTicket = await ticketService.createTicket(data)
    console.log(`✅ Tạo ticket "${createdTicket.title}" thành công!`);
  } catch(error: any) {
    const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống"
    console.error(`\n--- ❌ THẤT BẠI ---`)
    console.error(`Lý do: ${errorMessage}`)
    console.error(`------------------\n`)
  }
}

async function handleUpdateTicket(ticketService: TicketServicePort, ticket: Ticket, rl: Readline.Interface) {
  try {
    const status = await askWithRetry<TicketStatus>(
      rl,
      "Cập nhật status (1-3): ",
      { "1": "open", "2": "in-progress", "3": "done" },
      "\nTrạng thái ticket:\n1. Open\n2. In progress\n3. Done"
    );
    const updatedTicket = await ticketService.updateTicket(ticket, status)
    console.log(`✅ Update status ticket "${updatedTicket.title}" thành công!`); 
  } catch(error: any) {
    const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống"
    console.error(`\n--- ❌ THẤT BẠI ---`)
    console.error(`Lý do: ${errorMessage}`)
    console.error(`------------------\n`)
  }
}