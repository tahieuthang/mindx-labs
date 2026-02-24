# Nghiên cứu Hexagonal Architecture

Tài liệu này là một bản nghiên cứu về Hexagonal Architecture (Ports & Adapters). Nội dung được chia thành các phần: nguyên tắc cốt lõi, các thành phần, cách hoạt động, ví dụ minh họa, kiểm chứng/contract, ưu/nhược điểm, khi nào nên áp dụng, so sánh với các mẫu kiến trúc khác và kết luận.

<a id="bang-chung-quy-trinh"></a>
## Bằng chứng quy trình & cách xác thực (Research → Summary → Example → Confirmation)

- Research: xem "Giới thiệu" và "I. Nguyên tắc cốt lõi" — thu thập khái niệm, nguyên tắc và semantic của Ports/Adapters.
- Summary: xem "II. Ưu điểm và nhược điểm" và "III. Khi nào nên áp dụng" — tóm tắt quyết định áp dụng và trade‑offs.
- Example: xem "Ví dụ thực tế: thao tác hệ thống tập tin" — code minh họa ports, core và adapters (Node FS + InMemory).
- Confirmation: xem "Kiểm chứng Hexagonal Architecture" và "Enforcing Behavioral Equivalence" — bao gồm ví dụ test và đề xuất shared contract test suite để kiểm tra tính compliant của các adapter.



## Mục lục

- [Bằng chứng quy trình & cách xác thực](#bang-chung-quy-trinh)
- [I. Nguyên tắc cốt lõi của Hexagonal Architecture](#i-nguyen-tac-cot-loi)
  - [1.1 Hexagonal Architecture là gì?](#hexagonal-architecture-la-gi)
  - [1.2 Các nguyên tắc cốt lõi](#tach-biet-loi-nghiep-vu)
  - [1.3 Các thành phần chính](#cac-thanh-phan-chinh)
  - [1.4 Cách thức hoạt động](#cach-thuc-hoat-dong)
- [II. Minh họa và kiểm chứng Hexagonal Architecture](#ii-minh-hoa)
  - [2.1 Ví dụ thực tế: thao tác hệ thống tập tin (File System)](#vi-du-thuc-te)
  - [2.2 Kiểm chứng Hexagonal Architecture](#kiem-chung)
- [III. Trường hợp ngoại lệ và cách tránh](#iii-truong-hop)
  - [3.1 Trường hợp ngoại lệ: Behavioral Non-Equivalence](#truong-hop-ngoai-le)
  - [3.2 Làm sao để tránh các ngoại lệ](#lam-sao-de-tranh)
- [IV. Ưu điểm và nhược điểm](#iv-uu-diem-nhuoc-diem)
- [V. Khi nào nên áp dụng](#v-khi-nao)
- [VI. So sánh với các mẫu kiến trúc khác](#vi-so-sanh)
- [VII. Kết luận](#vii-ket-luan)

---

<a id="i-nguyen-tac-cot-loi"></a>
## I. Nguyên tắc cốt lõi của Hexagonal Architecture

<a id="hexagonal-architecture-la-gi"></a>
### 1.1. Hexagonal Architecture là gì?

Hexagonal Architecture (Ports & Adapters) là một mẫu kiến trúc giúp tách lõi nghiệp vụ (business/application core) khỏi chi tiết công nghệ bên ngoài (UI, DB, framework, network, v.v.). Mục tiêu là làm cho core ổn định, dễ kiểm thử và dễ thay đổi công nghệ bên ngoài mà không ảnh hưởng đến business logic.

<a id="tach-biet-loi-nghiep-vu"></a>
### 1.2. Các nguyên tắc cốt lõi

### Tách biệt lõi nghiệp vụ và công nghệ bên ngoài

- Core không phụ thuộc UI, DB, framework hay bất kỳ chi tiết kỹ thuật nào. Mọi dependency phải hướng vào Core (Dependency Inversion ở cấp kiến trúc).

### Mọi tương tác với lõi đều qua "Ports"

- Port là Architectural Boundary giữa Inside (Core) và Outside (UI, DB, Framework, …).

### "Adapters" là các triển khai cụ thể của các port

- Adapter triển khai port theo công nghệ cụ thể và không chứa business logic.

### Ứng dụng phải độc lập với nguồn kích hoạt

- Lõi ứng dụng không được phụ thuộc vào cách nó được kích hoạt. Ứng dụng có thể được điều khiển bởi: giao diện người dùng, kiểm thử tự động, hệ thống bên ngoài, API,...

---

<a id="cac-thanh-phan-chinh"></a>
## 1.3. Các thành phần chính

### Core Application

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

<a id="cach-thuc-hoat-dong"></a>
## 1.4. Cách thức hoạt động

Quy trình điển hình khi có sự kiện bên ngoài gọi vào:

1. Adapter nhận input từ UI/CLI/API…
2. Adapter dịch dữ liệu và gọi inbound port.
3. Core (triển khai inbound port) xử lý logic nghiệp vụ.
4. Core dùng outbound ports nếu cần gọi DB hoặc service bên ngoài.
5. Adapter tương ứng thực thi outbound port và trả kết quả.
6. Output quay lại adapter rồi trả ra thế giới ngoài.

Dependency Direction (Rất quan trọng): mặc dù runtime flow là Outside → Inside → Outside, chiều dependency luôn hướng vào Core: Adapter phụ thuộc port; port thuộc Core; Core không phụ thuộc adapter.

---

<a id="ii-minh-hoa"></a>
## II. Minh họa và kiểm chứng Hexagonal Architecture

<a id="vi-du-thuc-te"></a>
## 2.1. Ví dụ thực tế: thao tác hệ thống tập tin (File System)

Ứng dụng: Lưu và đọc nội dung note.

### Port — định nghĩa contract với hệ thống tập tin

Port do core định nghĩa, không có code kỹ thuật. Port chỉ biết interface, không import fs, không biết ổ đĩa là gì

```ts
// ports/DocumentPersistencePort.ts
interface DocumentPersistencePort {
  write(document: Document): Promise<void>
  read(title: string): Promise<Document>
}
```

### Core / Application Service (Use Case)

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

### Adapter — File System thật (Node.js)

Adapter biết fs, path, chịu toàn bộ chi tiết kỹ thuật và có thể bị thay thế mà core không đổi

```ts
// adapters/NodeFileSystemAdapter.ts
import { promises as fs } from 'fs'
import { DocumentPersistencePort } from '../ports/DocumentPersistencePort'
import { Document } from '../domain/Document'

export class NodeFileSystemAdapter implements DocumentPersistencePort {

  async write(document: Document): Promise<void> {
    await fs.writeFile(`notes/${document.title}.txt`, document.content)
  }

  async read(title: string): Promise<Document> {
    const content = await fs.readFile(`notes/${title}.txt`, 'utf-8')
    return new Document(title, content)
  }
}
```

### Inbound Adapter — Controller (ví dụ CLI / API)

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
## 2.2. Kiểm chứng Hexagonal Architecture

Hexagonal cho phép test Core mà không cần file system thật bằng cách dùng adapter in-memory. Nhờ đó test:

- Không phụ thuộc IO
- Không cần mock fs
- Không cần setup framework
- Chạy rất nhanh (RAM)

In-memory adapter (dùng cho test)

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

Test core không cần file system

```ts
test('DocumentService should save and read note', async () => {
  const service = new DocumentService(new InMemoryDocumentPersistenceAdapter());

  await service.saveNote('hexagonal', 'awesome');
  
  expect(await service.readNote('hexagonal')).toBe('awesome');
});
```

<a id="iii-truong-hop"></a>
## III. Trường hợp ngoại lệ và cách tránh

<a id="truong-hop-ngoai-le"></a>
### 3.1. Trường hợp ngoại lệ: Behavioral Non-Equivalence

Giả sử Business Logic đưa ra yêu cầu: 
> *"Sau khi lưu file, hệ thống phải đảm bảo dữ liệu tồn tại vĩnh viễn (persist after restart)."*

Khi đó, hai Adapter khác nhau sẽ cho ra kết quả khác nhau:

* **Adapter 1 (File System):**
    * **Hành vi:** Ghi dữ liệu trực tiếp xuống ổ cứng.
    * **Kết quả:** Dữ liệu tồn tại sau khi restart process $\rightarrow$ **ĐẠT** yêu cầu.
* **Adapter 2 (RAM Adapter):**
    * **Hành vi:** Lưu dữ liệu vào bộ nhớ đệm (In-memory).
    * **Kết quả:** Dữ liệu bị xóa sạch ngay khi restart process $\rightarrow$ **VI PHẠM** tính bền vững.

Vấn đề xuất hiện khi Port chỉ mô tả hành động kỹ thuật mà không mô tả ràng buộc nghiệp vụ (semantic guarantees).

```ts
interface FileStoragePort {
  save(path: string, data: Buffer): void
}
```

Port trên chỉ mô tả hành động kỹ thuật “save”, nhưng không mô tả:

-	Tính bền vững (Persistence): Dữ liệu có tồn tại sau khi hệ thống restart không?
-	Tính nhất quán (Consistency): Có đảm bảo dữ liệu được ghi thành công toàn bộ hay không?
-	Độ tin cậy: Cơ chế xử lý khi ổ đĩa đầy hoặc lỗi bộ nhớ là gì?

Khi constract không đúng về mặt ngữ nghĩa thì mọi adapter đều trông có vẻ hợp lệ nhưng không phải adapter nào cũng đúng về mặt business


<a id="lam-sao-de-tranh"></a>
### 3.2. Làm sao để tránh các ngoại lệ trong Hexagonal Architecture?

- Thiết kế port ở cùng abstraction level với domain model (business capability)
- Port phải định nghĩa rõ semantic guarantees (durability, atomicity, failure model, types of errors, idempotency, v.v.)
- Adapter phải bảo toàn Semantic Contract của Port, các adapter implement cùng port thì đều phải tương đương về hành vi theo đúng semantic contract của port (behavioral equivalence), không chỉ tương đường về signature method
- Behavioral equivalence phải được xác thực bằng Shared Contract Test Suite do core sở hữu

Ví dụ Semantic Port:

Port không chỉ định nghĩa method signature, mà định nghĩa đầy đủ semantic contract.

```ts
interface DocumentPersistencePort {

  /**
   * Persists document durably.
   *
   * Guarantees:
   * - Durable (survive restart)
   * - Atomic
   * - Idempotent
   *
   * Failure model:
   * - Throws DocumentAlreadyExistsError
   * - Throws PersistenceUnavailableError
   */
  save(document: Document): Promise<void>

  /**
   * Guarantees:
   * - Returns consistent data previously committed
   *
   * Failure model:
   * - Throws DocumentNotFoundError
   * - Throws PersistenceUnavailableError
   */
  get(title: string): Promise<Document>
}
```

Shared Contract Test Suite

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

<a id="iv-uu-diem-nhuoc-diem"></a>
## IV. Ưu điểm và nhược điểm của Hexagonal Architecture 

### Ưu điểm

- Tách biệt rõ business và infrastructure.
- Khả năng testability cao: core test độc lập bằng mock/fake adapter.
- Dễ thay đổi công nghệ bên ngoài mà không ảnh hưởng core.
- Hệ thống cho phép mọi Actor (UI, CLI, Test, Batch Jobs) dùng chung một Logic nghiệp vụ duy nhất thông qua các Port.
- Phù hợp cho hệ thống lớn hoặc microservices.

Ví dụ: đổi DB từ MySQL sang MongoDB chỉ cần thay adapter, không thay core.

### Nhược điểm

- Độ phức tạp ban đầu cao: nhiều abstraction, interface.
- Có thể là over-engineering cho ứng dụng nhỏ hoặc prototype.
- Thay đổi port contract có thể khiến nhiều adapter phải cập nhật.
- Nhiều abstraction khiến codebase rộng hơn (nhiều file/interface), có thể gây khó khăn khi trace lỗi.

---

<a id="v-khi-nao"></a>
## V. Khi nào nên áp dụng Hexagonal Architecture

### 5.1. Hệ thống có business phức tạp và thay đổi thường xuyên

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

### 5.2. Yêu cầu test automation và isolate test
### 5.3. Có nhiều external interfaces / multiple actors (REST, CLI, message, batch…)
### 5.4. Cần thay đổi hoặc mở rộng công nghệ bên ngoài thường xuyên.
### 5.5. Muốn di chuyển hoặc áp dụng Domain-Driven Design (DDD).

- DDD là cách thiết kế tập trung vào domain model (entity, value object, domain service, bounded context).
- Khi business logic là trung tâm và cần được mô hình hóa rõ ràng, việc tách domain khỏi framework và hạ tầng là bắt buộc.

### Khi nào không nên áp dụng Hexagonal Architecture:

- Ứng dụng nhỏ, đơn giản, chỉ CRUD.
- Prototype ngắn hạn, cần time-to-market nhanh, không maintain lâu dài.
- Team chưa sẵn sàng với mức độ abstraction cao.
- Hệ thống cực kỳ nhạy cảm với latency/overhead của abstraction.

---

<a id="vi-so-sanh"></a>
## VI. So sánh Hexagonal Architecture với các mẫu kiến trúc khác

| Kiến trúc   | Đặc điểm chính                                   | Domain có phụ thuộc infra? | Phù hợp                         |
|------------|--------------------------------------------------|----------------------------|----------------------------------|
| Layered    | Tổ chức theo tầng (UI → Service → DB)           | Có thể có                  | CRUD đơn giản                   |
| Clean      | Layer rõ ràng, dependency rule nghiêm ngặt      | Không                     | Domain phức tạp                 |
| Onion      | Vòng đồng tâm, domain ở trung tâm               | Không                     | DDD                             |
| MVC        | Controller → Service → Repository               | Thường có                 | Startup / CRUD                  |
| Hexagonal  | Boundary Inside ↔ Outside, Port & Adapter       | Không                     | Domain phức tạp, nhiều actor    |

---

<a id="vii-ket-luan"></a>
## VII. Kết luận

Hexagonal Architecture không phải là kiến trúc duy nhất hoặc "tốt nhất" cho mọi tình huống. Đây là lựa chọn phù hợp khi hệ thống có domain phức tạp, cần bảo vệ business logic khỏi hạ tầng, cần test isolate và phải phục vụ nhiều actor hoặc thay đổi công nghệ thường xuyên. Lựa chọn kiến trúc nên dựa trên độ phức tạp domain, khả năng thay đổi công nghệ và năng lực đội ngũ.
