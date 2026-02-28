# CLI Ticket Manager - Hexagonal Architecture

Công cụ CLI quản lý ticket được xây dựng theo chuẩn **Hexagonal Architecture (Ports & Adapters)**, đảm bảo Domain logic hoàn toàn độc lập với công nghệ lưu trữ và giao diện người dùng.

## 📋 Mục lục

- [Kiến trúc](#kiến-trúc)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Sử dụng](#sử-dụng)
- [Testing](#testing)
- [Cấu trúc dự án](#cấu-trúc-dự-án)

## 🏗️ Kiến trúc

Dự án tuân thủ **Hexagonal Architecture** với các lớp:

### Domain Layer (Core)
- **Entities**: `Ticket` - Entity chứa business rules và validation
- **Services**: `TicketService` - Orchestrator cho các use case (create, list, show, update)
- **Errors**: Domain-specific errors (`InvalidDataError`, `TicketNotFoundError`)

### Ports (Interfaces)
- **`TicketRepositoryPort`**: Interface định nghĩa hành vi lưu trữ (create, findById, findAll, update)
- **`TicketServicePort`**: Interface định nghĩa các use case của service

### Adapters

**Primary Adapters** (Input):
- `TicketCLIAdapter`: Xử lý tương tác CLI, parse input từ người dùng

**Secondary Adapters** (Output):
- `JsonFileTicketAdapter`: Triển khai `TicketRepositoryPort` bằng JSON file storage
- `InMemoryTicketAdapter`: Triển khai in-memory cho testing

### Dependency Rule
- ✅ Domain **không phụ thuộc** vào Adapters
- ✅ Domain chỉ phụ thuộc vào **Ports** (interfaces)
- ✅ Adapters phụ thuộc vào Domain + Ports

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 14.x
- npm hoặc yarn

### Các bước

1. **Clone repository và di chuyển vào thư mục dự án:**
   ```bash
   cd week-2
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Build project:**
   ```bash
   npm run build
   ```

## ⚙️ Cấu hình

Dự án sử dụng JSON file để lưu trữ dữ liệu. File sẽ được tự động tạo tại:
```
data/tickets.json
```

Không cần cấu hình thêm. Dự án sử dụng TypeScript với cấu hình trong `tsconfig.json`.

## 📖 Sử dụng

### Chạy ứng dụng

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

### Các chức năng CLI

#### 1. Tạo ticket mới (`create`)
- Nhập tiêu đề và mô tả ticket
- Chọn status: `open`, `in-progress`, `done`
- Chọn priority: `low`, `medium`, `high`
- Chọn tags: `bug`, `feature`, `task`, `fix` (có thể chọn nhiều)

#### 2. Xem danh sách ticket (`list`)
- **Xem tất cả**: Hiển thị toàn bộ tickets
- **Lọc ticket**: Lọc theo status, priority, tags
- **Xem chi tiết**: Xem chi tiết một ticket theo ID

#### 3. Cập nhật ticket (`update`)
- Từ menu "Xem chi tiết ticket", chọn cập nhật
- Cập nhật status của ticket

### Ví dụ sử dụng

```
--- 🎫 QUẢN LÝ TICKET ---
1. Xem danh sách ticket
2. Tạo ticket mới
3. Thoát
👉 Chọn chức năng: 2

--- CHƯƠNG TRÌNH QUẢN LÝ TICKET ---
Nhập tiêu đề ticket: Fix bug login
Nhập mô tả ticket: Không thể đăng nhập với email không hợp lệ

Trạng thái ticket:
1. Open
2. In progress
3. Done
Lựa chọn status (1-3): 1

Độ ưu tiên:
1. Low
2. Medium
3. High
Lựa chọn priority (1-3): 3

Tag ticket:
1. Bug
2. Feature
3. Task
4. Fix
Nhập danh sách tag (ví dụ: 1,2,4) hoặc bấm Enter để bỏ qua: 1,4

✅ Tạo ticket "Fix bug login" thành công!
```

## 🎥 Demo sản phẩm

📺 Video demo:  
https://www.youtube.com/watch?v=Q5dS1OPMU9M&feature=youtu.be

Nội dung video bao gồm:
- Tạo ticket mới
- Xem danh sách ticket
- Cập nhật trạng thái
- Thoát chương trình

## 🧪 Testing

### Chạy tests

**Test Domain Entities:**
```bash
npm run test:entities
```

**Test Domain Service:**
```bash
npm run test:service
```

### Chiến lược Testing

- ✅ **Domain tests độc lập**: Sử dụng **mocks** cho `TicketRepositoryPort`
- ✅ **Không phụ thuộc vào file system**: Domain tests không cần file JSON thật
- ✅ **Test business logic**: Validate rules, error handling, use cases

### Ví dụ Test Structure

```typescript
// Mock repository
const repositoryMock: TicketRepositoryPort = {
  create: mock.fn(async (ticket: Ticket) => ticket),
  findById: mock.fn(),
  findAll: mock.fn(),
  update: mock.fn(),
};

// Test service với mock
const service = new TicketService(repositoryMock);
```

## 📁 Cấu trúc dự án

```
week-2/
├── src/
│   ├── core/                    # Domain Layer
│   │   ├── entites/
│   │   │   └── Ticket.ts        # Ticket entity với business rules
│   │   ├── services/
│   │   │   └── TicketService.ts # Use case orchestrator
│   │   ├── ports/
│   │   │   ├── TicketRepositoryPort.ts    # Secondary Port
│   │   │   └── TicketServicePort.ts       # Primary Port
│   │   └── errors/              # Domain errors
│   ├── adapters/
│   │   ├── primary/
│   │   │   └── TicketCLIAdapter.ts        # CLI input adapter
│   │   └── secondary/
│   │       ├── JsonFileTicketAdapter.ts   # JSON storage adapter
│   │       └── InMemoryTicketAdapter.ts   # In-memory adapter
│   └── main.ts                   # Entry point
├── tests/
│   └── domain/
│       ├── TicketEntities.test.ts
│       └── TicketService.test.ts
├── data/
│   └── tickets.json              # JSON storage (auto-generated)
├── dist/                         # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Hexagonal Architecture - Tóm tắt

### Khái niệm
Hexagonal Architecture (còn gọi là Ports & Adapters) tách biệt **business logic** (Domain) khỏi **công nghệ bên ngoài** (Adapters) thông qua **Ports** (interfaces).

### Lợi ích trong dự án này

1. **Testability**: Domain có thể test độc lập bằng mocks, không cần file system thật
2. **Flexibility**: Dễ dàng thay đổi storage (từ JSON sang Database) mà không ảnh hưởng Domain
3. **Independence**: Domain logic không phụ thuộc vào CLI framework hay file system APIs
4. **Maintainability**: Mỗi layer có trách nhiệm rõ ràng, dễ bảo trì

### Dependency Flow

```
CLI Adapter (Primary) 
    ↓ depends on
TicketService (Domain)
    ↓ depends on
TicketRepositoryPort (Port/Interface)
    ↑ implemented by
JsonFileTicketAdapter (Secondary)
```

**Quy tắc**: Dependencies chỉ đi vào trong (vào Domain), không đi ra ngoài.

## 📝 Notes

- Domain validation được thực hiện trong `Ticket` entity
- Filter logic được xử lý trong `JsonFileTicketAdapter` (có thể di chuyển lên Domain nếu cần)
- CLI sử dụng interactive mode với `readline` interface
- Tất cả business rules được test trong domain tests với mocks

## 📚 Tài liệu tham khảo

- [Prompt Engineering Template](./PromptEngineering.md) - Template hướng dẫn xây dựng dự án
- Hexagonal Architecture: https://alistair.cockburn.us/hexagonal-architecture/

---

**Tác giả**: Week 2 - Nền tảng & Kiến trúc Hexagonal (Ports & Adapters)  
**Tech Stack**: TypeScript, Node.js, Jest (Node Test Runner)
