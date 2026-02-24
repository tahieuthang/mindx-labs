# Nghiên cứu Hexagonal Architecture (Ports & Adapters)

Tài liệu này là một bản nghiên cứu về Hexagonal Architecture (Ports & Adapters). Nội dung được chia thành các phần: nguyên tắc cốt lõi, các thành phần, cách hoạt động, ví dụ minh họa, kiểm chứng/contract, ưu/nhược điểm, khi nào nên áp dụng, so sánh với các mẫu kiến trúc khác và kết luận.

## Bằng chứng quy trình & cách xác thực (Research → Summary → Example → Confirmation)

- Research: xem "Giới thiệu" và "I. Nguyên tắc cốt lõi" — thu thập khái niệm, nguyên tắc và semantic của Ports/Adapters.
- Summary: xem "II. Ưu điểm và nhược điểm" và "III. Khi nào nên áp dụng" — tóm tắt quyết định áp dụng và trade‑offs.
- Example: xem "Ví dụ thực tế: thao tác hệ thống tập tin" — code minh họa ports, core và adapters (Node FS + InMemory).
- Confirmation: xem "Kiểm chứng Hexagonal Architecture" và "Enforcing Behavioral Equivalence" — bao gồm ví dụ test và đề xuất shared contract test suite để kiểm tra tính compliant của các adapter.

## Mục lục

- [Giới thiệu](#gioi-thieu)
- [I. Nguyên tắc cốt lõi](#i-nguyen-tac-cot-loi)
  - [Hexagonal Architecture là gì?](#hexagonal-architecture-la-gi)
  - [Tách biệt lõi nghiệp vụ và công nghệ bên ngoài](#tach-biet-loi-nghiep-vu)
  - [Ports (Cổng kết nối)](#ports)
  - [Adapters (Bộ chuyển đổi)](#adapters)
  - [Ứng dụng có thể được điều khiển bởi bất kỳ actor nào](#ung-dung-actor)
  - [Không ưu tiên chiều phụ thuộc kiểu "tầng"](#khong-uu-tien-tang)
- [II. Ưu điểm và nhược điểm](#ii-uu-diem-nhuoc-diem)
- [III. Khi nào nên áp dụng](#iii-khi-nao)
- [IV. So sánh với các kiến trúc khác](#iv-so-sanh)
- [V. Kết luận](#v-ket-luan)
- [Tài liệu tham khảo / Ghi chú](#tai-lieu-tham-khao)

<a id="gioi-thieu"></a>
## Giới thiệu

Hexagonal Architecture (Ports & Adapters) là một mẫu kiến trúc giúp tách lõi nghiệp vụ (business/application core) khỏi chi tiết công nghệ bên ngoài (UI, DB, framework, network, v.v.). Mục tiêu là làm cho core ổn định, dễ kiểm thử và dễ thay đổi công nghệ bên ngoài mà không ảnh hưởng đến business logic.

---

<a id="i-nguyen-tac-cot-loi"></a>
## I. Nguyên tắc cốt lõi

<a id="hexagonal-architecture-la-gi"></a>
### 1. Hexagonal Architecture là gì?

Hexagonal Architecture (Ports & Adapters) là mẫu thiết kế nhằm tổ chức hệ thống sao cho logic nghiệp vụ đứng độc lập hoàn toàn với công nghệ bên ngoài. Điểm cốt lõi:

- Không phụ thuộc trực tiếp vào UI, DB hay framework.
- Tương tác giữa lõi và bên ngoài chỉ qua các giao diện trừu tượng (ports).
- Mỗi port có thể có nhiều adapter theo công nghệ khác nhau.

<a id="tach-biet-loi-nghiep-vu"></a>
### 2. Các nguyên tắc cốt lõi

### Tách biệt lõi nghiệp vụ và công nghệ bên ngoài

- Core phải tồn tại hoàn toàn độc lập với UI, database, network, framework hoặc bất kỳ chi tiết kỹ thuật nào. Mọi dependency phải hướng vào Core (Dependency Inversion ở cấp kiến trúc).

<a id="ports"></a>
### Mọi tương tác với lõi đều qua "Ports"

- Port là Architectural Boundary giữa Inside (Core) và Outside (UI, DB, Framework, …).

<a id="adapters"></a>
### "Adapters" là các triển khai cụ thể của các port

- Adapter triển khai port theo công nghệ cụ thể và không chứa business logic.

<a id="ung-dung-actor"></a>
### Ứng dụng phải độc lập với nguồn kích hoạt (actor)

- Lõi ứng dụng không được phụ thuộc vào cách nó được kích hoạt. Ứng dụng có thể được điều khiển bởi: giao diện người dùng, kiểm thử tự động, hệ thống bên ngoài, API,...

---

## 3. Các thành phần chính của Hexagonal Architecture

### Core Application (Bên trong ứng dụng)
- Chứa domain logic và use cases.
- Core định nghĩa các ports và không phụ thuộc vào UI, database hay framework.
- Mọi dependency đều phải hướng vào Core.
  
### Ports (Cổng kết nối)
- Là abstraction (thường ở dạng interface) do Core định nghĩa
- Không chứa logic kỹ thuật hay chi tiết implementation
- Không chứa logic kỹ thuật hay chi tiết implementation
  • Inbound ports: được Core triển khai (implement) để nhận yêu cầu từ bên ngoài và thực thi logic nghiệp vụ.
  • Outbound ports: được Core sử dụng để gọi ra bên ngoài (ví dụ: persistence, external service), nhưng implementation cụ thể nằm ở adapter.

### Adapters (Bộ chuyển đổi)
- Là implementation của Port theo một công nghệ, thư viện hoặc hệ thống cụ thể (SQL, REST, Redis, AWS S3...).
- Adapters không chứa business logic.
- Adapters phụ thuộc vào port (abstraction) do Core định nghĩa
- Chuyển đổi dữ liệu và protocol giữa môi trường bên ngoài sang ngôn ngữ của Core.

---

## 4. Cách thức hoạt động

Quy trình điển hình khi có sự kiện bên ngoài gọi vào:

1. Adapter nhận input từ UI/CLI/API…
2. Adapter dịch dữ liệu và gọi inbound port.
3. Core (triển khai inbound port) xử lý logic nghiệp vụ.
4. Core dùng outbound ports nếu cần gọi DB hoặc service bên ngoài.
5. Adapter tương ứng thực thi outbound port và trả kết quả.
6. Output quay lại adapter rồi trả ra thế giới ngoài.

Dependency Direction (Rất quan trọng): mặc dù runtime flow là Outside → Inside → Outside, chiều dependency luôn hướng vào Core: Adapter phụ thuộc port; port thuộc Core; Core không phụ thuộc adapter.

---

## Ví dụ thực tế: thao tác hệ thống tập tin (File System)

Ứng dụng: Lưu và đọc nội dung note.

### 5.1 Port — định nghĩa contract với hệ thống tập tin

Port do core định nghĩa, không có code kỹ thuật. Port chỉ biết interface, không import fs, không biết ổ đĩa là gì

Ví dụ (minh họa):

```ts
// ports/DocumentPersistencePort.ts
interface DocumentPersistencePort {
  write(document: Document): Promise<void>
  read(title: string): Promise<Document>
}
```

### 5.2 Core / Application Service (Use Case)

DocumentService không biết dữ liệu được lưu ở đâu, dễ test, dễ thay thế adapter

```ts
// domain/Document.ts
export class Document {
  constructor(
    public readonly title: string,
    public readonly content: string
  ) {}
}
```

```ts
// application/DocumentService.ts
import { DocumentPersistencePort } from '../ports/DocumentPersistencePort'
import { Document } from '../domain/Document'

export class DocumentService {
  constructor(private readonly persistence: DocumentPersistencePort) {}

  async saveNote(title: string, content: string): Promise<void> {
    await this.persistence.write(
      new Document(title, content)
    )
  }

  async readNote(title: string): Promise<string> {
    const document = await this.persistence.read(title)
    return document.content
  }
}
```

### 5.3 Adapter — File System thật (Node.js)

Adapter biết fs, path, chịu toàn bộ chi tiết kỹ thuật và có thể bị thay thế mà core không đổi

```ts
// adapters/NodeFileSystemAdapter.ts
import { promises as fs } from 'fs'
import path from 'path'
import { DocumentPersistencePort } from '../ports/DocumentPersistencePort'
import { Document } from '../domain/Document'

export class NodeFileSystemAdapter implements DocumentPersistencePort {

  private baseDir = 'notes'

  async write(document: Document): Promise<void> {
    const fullPath = this.resolvePath(document.title)

    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, document.content, 'utf-8')
  }

  async read(title: string): Promise<Document> {
    const fullPath = this.resolvePath(title)
    const content = await fs.readFile(fullPath, 'utf-8')

    return new Document(title, content)
  }

  private resolvePath(title: string): string {
    return path.resolve(`${this.baseDir}/${title}.txt`)
  }
}
```

### 5.4 Inbound Adapter — Controller (ví dụ CLI / API)

Controller có nhiệm vụ nhận input, gọi use case và không chứa business logic

```ts
// adapters/FileController.ts
import { DocumentService } from '../application/DocumentService'

export async function run(documentService: DocumentService) {
  await documentService.saveNote('hexagonal', 'Ports and Adapters are awesome!')
  const content = await documentService.readNote('hexagonal')
  console.log(content)
}
```

---

<a id="kiem-chung"></a>
## Kiểm chứng Hexagonal Architecture

Hexagonal cho phép test core mà không cần file system thật bằng cách dùng adapters in-memory hoặc mock. Tạo 1 adapter hợp lệ khác giúp ta test mà không cần disk, chạy cực nhanh bằng cách lưu file vào RAM

Ví dụ adapter in-memory để test:

```ts
// adapters/InMemoryDocumentPersistenceAdapter.ts
import { DocumentPersistencePort } from '../ports/DocumentPersistencePort'
import { Document } from '../domain/Document'

export class InMemoryDocumentPersistenceAdapter
  implements DocumentPersistencePort {

  private storage = new Map<string, Document>()

  async write(document: Document): Promise<void> {
    this.storage.set(document.title, document)
  }

  async read(title: string): Promise<Document> {
    const document = this.storage.get(title)
    if (!document) {
      throw new Error('Document not found')
    }
    return document
  }
}
```

Test core mà không dùng file system: giúp ta test core không phụ thuộc vào IO, không mock fs và không cần setup hay phụ thuộc vào framework

Ví dụ test đơn giản:

```ts
import { DocumentService } from '../application/DocumentService'
import { InMemoryDocumentPersistenceAdapter } from '../adapters/InMemoryDocumentPersistenceAdapter'

test('DocumentService', () => {
  it('should save and read note', async () => {
    const storage = new InMemoryDocumentPersistenceAdapter()
    const service = new DocumentService(storage)

    await service.saveNote('hexagonal', 'awesome')

    const content = await service.readNote('hexagonal')

    expect(content).toBe('awesome')
  })
})
```

### Trường hợp ngoại lệ: Behavioral Non-Equivalence

Giả sử Business Logic đưa ra yêu cầu: 
> *"Sau khi lưu file, hệ thống phải đảm bảo dữ liệu tồn tại vĩnh viễn (persist after restart)."*

Khi đó, hai Adapter khác nhau sẽ cho ra kết quả khác nhau:

* **Adapter 1 (File System):**
    * **Hành vi:** Ghi dữ liệu trực tiếp xuống ổ cứng.
    * **Kết quả:** Dữ liệu tồn tại sau khi restart process $\rightarrow$ **ĐẠT** yêu cầu.
* **Adapter 2 (RAM Adapter):**
    * **Hành vi:** Lưu dữ liệu vào bộ nhớ đệm (In-memory).
    * **Kết quả:** Dữ liệu bị xóa sạch ngay khi restart process $\rightarrow$ **VI PHẠM** tính bền vững.

Nguyên nhân của vấn đề: Vấn đề nảy sinh khi Port chỉ được định nghĩa dựa trên các tham số kỹ thuật mà bỏ qua các ràng buộc về mặt nghiệp vụ.

```ts
interface FileStoragePort {
  save(path: string, data: Buffer): void
}
```

Port trên chỉ mô tả hành động kỹ thuật “save”, nhưng không mô tả:

-	Tính bền vững (Persistence): Dữ liệu có tồn tại sau khi hệ thống restart không?
-	Tính nhất quán (Consistency): Có đảm bảo dữ liệu được ghi thành công toàn bộ hay không?
-	Độ tin cậy: Cơ chế xử lý khi ổ đĩa đầy hoặc lỗi bộ nhớ là gì?

Khi constact không đúng về mặt ngữ nghĩa thì mọi adapter đều trông có vẻ hợp lệ nhưng không phải adapter nào cũng đúng về mặt business

### Làm sao để tránh các ngoại lệ trong Hexagonal Architecture?

- Thiết kế port ở cùng abstraction level với domain model (business capability), không mô tả infrastructure.
- Port phải định nghĩa rõ semantic guarantees (durability, atomicity, failure model, types of errors, idempotency, v.v.).
- Adapter phải bảo toàn Semantic Contract của Port, các adapter implement cùng port thì đều phải tương đương về hành vi theo đúng semantic contract của port (behavioral equivalence), không chỉ tương đường về signature method.
- Behavioral equivalence phải được xác thực bằng Shared Contract Test Suite do core sở hữu, không để từng adapter tự định nghĩa đúng/sai.

Ví dụ tốt (semantic port):

```ts
interface DocumentPersistencePort {

  /**
   * Persists document durably.
   *
   * Guarantees:
   * - Must survive process restart.
   * - Must be atomic.
   * - Must not partially commit.
   * - Idempotent if called multiple times with same document id.
   *
   * Failure model:
   * - Throws DocumentAlreadyExistsError if duplicate.
   * - Throws PersistenceUnavailableError if storage is unreachable.
   */
  save(document: Document): Promise<void>

  /**
   * Retrieves a document by title.
   *
   * Guarantees:
   * - Returns consistent data previously committed.
   *
   * Failure model:
   * - Throws DocumentNotFoundError if not exists.
   * - Throws PersistenceUnavailableError if storage is unreachable.
   */
  get(title: string): Promise<Document>
}
```

Ở đây Port không chỉ định nghĩa method signature, mà định nghĩa semantic contract đầy đủ: durability, atomicity, error model, idempotency.

Ví dụ Shared Contract Test Suite (Enforcing Behavioral Equivalence)

```ts
export function documentPersistenceContractTest(
  createAdapter: () => DocumentPersistencePort
) {
  describe('DocumentPersistencePort contract', () => {

    it('must persist durably', async () => {
      const adapter = createAdapter()

      const doc = new Document('a', 'content')
      await adapter.save(doc)

      const loaded = await adapter.get(doc.id)

      expect(loaded.content).toEqual('content')
    })
  })
}
```

Sau đó mỗi adapter reuse:

```ts
documentPersistenceContractTest(() => new PostgresAdapter())
documentPersistenceContractTest(() => new FileSystemAdapter())
```

→ Nếu một adapter fail test
→ Adapter đó không compliant với semantic contract của Port
→ Vi phạm behavioral equivalence

---

<a id="ii-uu-diem-nhuoc-diem"></a>
## II. Ưu điểm và nhược điểm của Hexagonal Architecture 

### 1. Ưu điểm

- Tách biệt rõ business và infrastructure.
- Khả năng testability cao: core test độc lập bằng mock/fake adapter.
- Dễ thay đổi công nghệ bên ngoài mà không ảnh hưởng core.
- Dễ bảo trì và mở rộng (nhiều adapter cho cùng port).
- Hệ thống cho phép mọi Actor (UI, CLI, Test, Batch Jobs) dùng chung một Logic nghiệp vụ duy nhất thông qua các Port.
- Phù hợp cho hệ thống lớn hoặc microservices.

Ví dụ: đổi DB từ MySQL sang MongoDB chỉ cần thay adapter, không thay core.

### 2. Nhược điểm

- Độ phức tạp ban đầu cao: nhiều abstraction, interface.
- Có thể là over-engineering cho ứng dụng nhỏ hoặc prototype.
- Quản lý nhiều adapter có thể khá nặng, cần quản lý tốt.
- Thay đổi port contract có thể khiến nhiều adapter phải cập nhật.
- Nhiều abstraction khiến codebase rộng hơn (nhiều file/interface), có thể gây khó khăn khi trace lỗi

Ví dụ: ứng dụng CRUD nhỏ có thể bị thừa abstraction và tăng chi phí phát triển.

---

<a id="iii-khi-nao"></a>
## III. Khi nào nên áp dụng Hexagonal Architecture

### 1. Hệ thống có business phức tạp và thay đổi thường xuyên
 
Khi hệ thống yêu cầu nhiều nghiệp vụ, nhiều use case, dễ biến động theo thời gian, lúc này Hexagonal giúp:

-	Tách rõ ràng logic nghiệp vụ khỏi công nghệ
-	Giúp core ổn định lâu dài
-	Giảm rủi ro khi thay đổi yêu cầu nghiệp vụ

Ví dụ kịch bản thực tế: Hệ thống thanh toán

* **Hệ thống ban đầu:**
    * REST API
    * MySQL
    * Business logic nằm trong controller/service

* **Sau một thời gian vận hành, phát sinh yêu cầu:**
    * Thêm message consumer để xử lý bất đồng bộ
    * Migrating từ MySQL sang PostgreSQL
    * Bổ sung CLI tool cho internal team
  
Nếu business logic nằm trong controller/repository, mỗi thay đổi sẽ lan rộng và gây rủi ro.

Với Hexagonal, core được cô lập và ổn định. Việc thay đổi công nghệ hoặc thêm actor chỉ ảnh hưởng đến adapter.

### 2. Yêu cầu test automation và isolate test
 
Hexagonal cho phép test core độc lập với Framework/UI/DB bằng mock/fake adapter

- Test business logic không cần DB thật.
- Không cần HTTP server để test các use case.

### 3. Có nhiều external interfaces / multiple actors (REST, CLI, message, batch…)

Một hệ thống cần phục vụ nhiều đường vào:

-	REST API
-	CLI tool
-	Message consumer
-	Batch jobs

Hexagonal cho phép nhiều adapter cùng kết nối đến 1 inbound port, giúp nhiều actor sử dụng chung 1 business logic mà không làm thay đổi core.

### 4. Cần thay đổi hoặc mở rộng công nghệ bên ngoài thường xuyên.

### 5. Muốn di chuyển hoặc áp dụng Domain-Driven Design (DDD).

- Nếu hệ thống có domain phức tạp, nhiều quy tắc nghiệp vụ, nhiều khái niệm cần mô hình hóa rõ ràng và có nhiều team cùng phát triển → Hexagonal giúp tạo nền tảng phù hợp để áp dụng DDD.
- Trong những hệ thống mà business logic là trung tâm và cần được thiết kế cẩn thận (entity, value object, domain service, bounded context…), việc tách domain khỏi framework và hạ tầng là điều bắt buộc

Không nên dùng khi:

- Ứng dụng nhỏ, đơn giản, chỉ CRUD.
- Prototype ngắn hạn, cần time-to-market nhanh, không maintain lâu dài.
- Team chưa sẵn sàng với mức độ abstraction cao.
- Hệ thống cực kỳ nhạy cảm với latency/overhead của abstraction.

---

<a id="iv-so-sanh"></a>
## IV. So sánh Hexagonal Architecture với các mẫu kiến trúc khác

### 1. Layered Architecture (N-Tier)

- Cấu trúc: Presentation → Application → Domain → infraconstructure
- Điểm mạnh: Đơn giản, dễ triển khai, phù hợp CRUD, dễ tiếp cận
- Hạn chế: Domain dễ phụ thuộc infraconstructure, Khó test isolate, business logic dễ bị rò rỉ sang layer khác
- Phù hợp: Hệ thống CRUD đơn giản, business logic không phức tạp
- So sánh: Layered tổ chức theo tầng, domain có thể phụ thuộc infra; Hexagonal tổ chức theo boundary, domain không phụ thuộc trực tiếp infraconstructure.

### 2. Clean Architecture

- Cấu trúc: Entities → Use Cases → Interface Adapters → Frameworks.
- Điểm mạnh: Dependency rule rõ ràng, phù hợp DDD, tách domain khỏi framework.
- Hạn chế: Nhiều layer, phức tạp hơn, Có thể over-engineering với hệ thống nhỏ.
- Phù hợp: Hệ thống lớn, domain phức tạp, nhiều use case.
- So sánh: Clean ≈ Hexagonal về mục tiêu; Clean có cấu trúc layer chi tiết hơn; Hexagonal đơn giản hơn, tập trung vào khái niệm Port & Adapter.

### 3. Onion Architecture

- Cấu trúc: Domain Core ở trung tâm → Application → infraconstructure ở ngoài.
- Điểm mạnh: Nhấn mạnh domain purity và vòng đồng tâm.
- Hạn chế: Không mô tả explicit inbound/outbound port.
- So sánh: Onion và Hexagonal gần như cùng triết lý; Onion nhấn mạnh “layer đồng tâm”; Hexagonal nhấn mạnh Ports & Adapters.

### 4. Monolithic MVC

- Cấu trúc phổ biến: Controller → Service → Repository
- Điểm mạnh: Rất dễ tiếp cận, framework hỗ trợ mạnh (Spring, Rails, Laravel…), tốc độ phát triển cao
- Hạn chế: domain dễ bị rò rỉ vào controller/service/repository, khó thay đổi hạ tầng lớn
- Phù hợp: Ứng dụng CRUD, startup cần time-to-market nhanh và hệ thống không có domain phức tạp
- So sánh: MVC phù hợp hệ thống nhỏ; Hexagonal phù hợp domain phức tạp, nhiều actor và cần isolate business logic, 

---

<a id="v-ket-luan"></a>
## V. Kết luận

Hexagonal Architecture không phải là kiến trúc duy nhất hoặc "tốt nhất" cho mọi tình huống. Đây là lựa chọn phù hợp khi hệ thống có domain phức tạp, cần bảo vệ business logic khỏi hạ tầng, cần test isolate và phải phục vụ nhiều actor hoặc thay đổi công nghệ thường xuyên. Lựa chọn kiến trúc nên dựa trên độ phức tạp domain, khả năng thay đổi công nghệ và năng lực đội ngũ.

<a id="tai-lieu-tham-khao"></a>
## Tài liệu tham khảo / Ghi chú

- Thuật ngữ: Hexagonal Architecture ≡ Ports & Adapters.
- Các ví dụ code trên là minh họa bằng TypeScript; có thể chuyển thể sang ngôn ngữ khác.

