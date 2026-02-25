import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { TicketServicePort, CreateTicketInput } from "../../core/ports/TicketServicePort"
import type { TicketStatus, TicketPriority, TicketTag } from "../../core/entites/Ticket";

export async function run(ticketService: TicketServicePort) {
  const rl = readline.createInterface({ input, output })

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
  await handleCreateTicket(ticketService, data)
}

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

async function handleCreateTicket(ticketService: TicketServicePort, data: CreateTicketInput) {
  try {
    const createdTicket = await ticketService.createTicket(data)
    console.log(`✅ Tạo ticket "${createdTicket.title}" thành công!`);
  } catch(error: any) {
    const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống";
    
    console.error(`\n--- ❌ THẤT BẠI ---`);
    console.error(`Lý do: ${errorMessage}`);
    console.error(`------------------\n`);
  }
}