import { JsonFileTicketAdapter } from "./adapters/secondary/JsonFileTicketAdapter";
import { InMemoryTicketAdapter } from "./adapters/secondary/InMemoryTicketAdapter";
import { TicketService } from "./core/services/TicketService";
import { handleListTickets as list, handleCreateTicket as create } from "./adapters/primary/TicketCLIAdapter";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const ticketRepository = new JsonFileTicketAdapter();
  const ticketService = new TicketService(ticketRepository);

  const rl = readline.createInterface({ input, output });

  try {
    await mainMenu(ticketService, rl);
  } catch (error) {
    console.error("❌ Ứng dụng Ticket CLI gặp lỗi:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function mainMenu(ticketService: TicketService, rl: readline.Interface) {
  let shouldExit = false;

  while (!shouldExit) {
    console.log("\n--- 🎫 QUẢN LÝ TICKET ---");
    console.log("1. Xem danh sách ticket");
    console.log("2. Tạo ticket mới");
    console.log("3. Thoát");

    const choice = await rl.question("👉 Chọn chức năng: ");

    switch (choice) {
      case "1":
        await list(ticketService, rl)
        break;
      case "2":
        await create(ticketService, rl)
        break;
      case "3":
        console.log("👋 Tạm biệt!");
        shouldExit = true;
        break;
      default:
        console.log("⚠️ Lựa chọn không hợp lệ, vui lòng thử lại.");
    }
  }
}

main();