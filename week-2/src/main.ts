import { InMemoryTicketAdapter } from "./adapters/secondary/InMemoryTicketAdapter";
import { TicketService } from "./core/services/TicketService";
import { run as runTicketCLI } from "./adapters/primary/TicketCLIAdapter";

async function main() {
  const ticketRepository = new InMemoryTicketAdapter();
  const ticketService = new TicketService(ticketRepository);

  await runTicketCLI(ticketService);
}

main().catch((error) => {
  console.error("Ứng dụng Ticket CLI gặp lỗi:", error);
  process.exit(1);
});

