Basic (hiểu khái niệm)

### Q1: Hexagonal Architecture là gì?
A: Tách lõi nghiệp vụ khỏi chi tiết hạ tầng bằng Ports (interface) do core định nghĩa và Adapters (implement) của hạ tầng; dependency luôn hướng vào core.

### Q2: Port khác gì so với API kỹ thuật (ví dụ: file system API)?
Port là business contract (capability + guarantees + failure model) ở mức domain;
API kỹ thuật chỉ là interface thao tác hạ tầng và chứa chi tiết công nghệ.

### Q3: Adapter nên và không nên chứa gì?
A: Adapter chứa mapping/protocol/hạ tầng; không chứa business rule/logic nghiệp vụ.

### Q4: Runtime flow và chiều phụ thuộc (dependency direction) khác nhau thế nào?
A: Runtime flow: Outside → Inside → Outside; dependency: adapter phụ thuộc vào port/core (hướng vào core).

Intermediate (chứng minh áp dụng và trade‑offs)

### Q5: Nêu 3 lợi ích chính của Hexagonal trong doc.
A: Tách business và infra; testable (isolate core); dễ thay đổi/đa adapter.

### Q6: Nêu 2 trường hợp không nên dùng Hexagonal.
A: Ứng dụng CRUD nhỏ/simple prototype; khi team không sẵn sàng với abstraction overhead.

### Q7: Giải thích “Behavioral Non‑Equivalence” bằng ví dụ ngắn.
A: Khi port chỉ mô tả signature “save” nhưng không yêu cầu durability, adapter InMemory sẽ pass signature nhưng vi phạm yêu cầu persistence so với FileSystem.

### Q8: Port được viết đúng mức abstraction thế nào? Cho ví dụ ngắn.
A: Port phải được thiết kế ở mức capability của domain (business intent), không phải ở mức API kỹ thuật hay chi tiết hạ tầng.

Advanced (kiểm chứng / contract)

### Q9: Theo doc, mục “Enforcing Behavioral Equivalence” cần những artifact nào tối thiểu?
A: Spec semantic cho port, shared contract test suite, standardized error types, CI gating, versioned contract.

### Q10: Viết ngắn cấu trúc thư mục cho shared contract tests.
A: contracts/{PortName}/README.md, contracts/{PortName}/suite.spec.ts, contracts/{PortName}/factories.ts.

### Q11: Nêu tối thiểu 4 test case bắt buộc trong contract suite.
A: Functional (save/get), Durability (surviveRestart), Failure semantics (disk full → mapped error/rollback), Idempotency/ordering (nếu yêu cầu).

### Q12: Làm sao CI phải xử lý khi adapter thất bại contract tests?
A: Block merge/release; báo lỗi cho owner adapter; phải tăng phiên bản contract nếu semantics thay đổi.

Practical / Hands‑on (đánh giá kỹ năng thực thi)

### Q13: Mô tả cách viết một contract-suite runner (ngắn).
A: Export hàm runContractSuite(createAdapter) chạy các test dùng factory tạo adapter; adapter implementor import và gọi runContractSuite(factory) trong test job.

### Q14: Nếu demo live, các bước ngắn để chứng minh Research→Summary→Example→Confirmation?
A: 1) Tóm tắt khái niệm 1 slide (Research). 2) Nêu trade‑offs (Summary). 3) Chạy demo Node/TS: FileService + InMemory + NodeFS (Example). 4) Chạy contract suite trên cả 2 adapter và show pass/fail (Confirmation).

### Q15: Cho ví dụ ngắn cách sửa port khi发现 adapter không thể thỏa semantic (durability).
A: Tăng abstraction port (ví dụ DocumentPersistencePort with explicit durability contract) hoặc thêm method confirmPersist()/flush() và error model.

Assessment / verification questions (dùng để đánh dấu “đã hiểu sâu”)

### Q16: Làm sao bạn chứng minh adapter “compliant” trong repo? (chỉ 1 cách)
A: Có contracts/{Port}/suite.spec.ts chạy trên CI và adapter pass toàn bộ tests.

### Q17: Nếu thay đổi semantic contract, quy trình release nên là gì?
A: Version contract (major/minor), cập nhật docs + changelog, thông báo adapter owners, chạy migration tests, CI đảm bảo adapter updated trước release.

### Q18: Một câu hỏi tình huống: core cần transactional write across DB + file system — port nên trông như thế nào?
A: Port nên biểu diễn operation atomic (ví dụ persistDocumentAtomic(doc) với rollback semantics và rõ ràng về failure guarantees), không expose thấp-level writeToFile/writeToDB.

Bonus: câu hỏi phỏng vấn nhanh để demo

### Q19: Nêu 3 câu hỏi bạn sẽ hỏi team khi họ đề xuất port mới.
A: 1) Semantic guarantees? 2) Failure model/expected errors? 3) Required durability/ordering/idempotency?

### Q20: Làm sao bạn đo “chi phí” khi áp dụng Hexagonal cho feature mới? (ngắn)
A: Ước lượng effort tạo port + 1 adapter + thêm tests + CI; so sánh với lợi ích tái sử dụng và bảo trì.