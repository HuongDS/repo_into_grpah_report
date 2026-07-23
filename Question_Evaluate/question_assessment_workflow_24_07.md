# Quy Trình Đánh Giá Câu Hỏi Tự Động (Question Assessment Workflow)

Tài liệu này mô tả chi tiết quy trình thẩm định chất lượng các câu hỏi (được sinh ra tự động hoặc do người dùng nhập) thông qua 3 tiêu chí cốt lõi: **Độ Chính xác (Accuracy)**, **Độ Khó (Difficulty)**, và **Độ Bao phủ (Coverage)**. 

Quy trình sử dụng kết hợp các thuật toán tìm kiếm Vector, nội suy từ khóa và đánh giá ngữ nghĩa bằng LLM (LLM-as-a-Judge).

---

## 1. Tiêu chí 1: Đánh giá Độ Chính Xác (Accuracy)

Độ chính xác xác định xem câu hỏi có vi phạm logic luồng (Control-flow) hoặc sử dụng sai thuật ngữ nghiệp vụ so với hệ thống thực tế hay không.

### 1.1. Ánh xạ Ngữ nghĩa (Semantic Mapping)
Mục tiêu là tìm ra các đoạn mã (Nodes) trong đồ thị có khả năng cao nhất dùng để trả lời câu hỏi.
1. **Kiểm tra TargetedEntryPoints (Bypass Bypass)**: Nếu câu hỏi cung cấp sẵn danh sách tên hàm mục tiêu (thường do quá trình sinh câu hỏi tự động truyền vào), hệ thống sẽ dùng kỹ thuật so khớp chuỗi linh hoạt (Lenient Matching - `String.Contains`) để tìm các Nodes khớp trong O(1).
2. **Tìm kiếm Vector (Vector Search / RAG)**: Nếu không có Target, câu hỏi được chia thành các cụm từ (Sliding Window Chunks) và nhúng (Embed) thành Vector bằng Cohere. Các vector này được so sánh Cosine Similarity với Vector của từng Node trong đồ thị để trích xuất ra lộ trình các Nodes (Extracted Path) sát nghĩa nhất.

> **Nền tảng Khoa học - RAG (Retrieval-Augmented Generation)**  
> **Nguồn trích dẫn**: *Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. (NeurIPS).*  
> **Nơi áp dụng**: Giai đoạn tìm kiếm Vector bằng Cohere để trích xuất `Extracted Path`.  
> **Điều bài báo chứng minh**: Việc kết hợp một mô hình truy xuất tài liệu phi tham số (như Vector Search) với một LLM sinh tham số giúp giảm thiểu triệt để hiện tượng "ảo giác" (hallucination) của AI. Bằng cách cung cấp ngữ cảnh chính xác (ở đây là mã nguồn của các Nodes), LLM đưa ra các phán đoán có cơ sở và độ tin cậy cao hơn hẳn.

### 1.2. LLM-as-a-Judge Đánh giá Logic
Hệ thống gửi Đồ thị luồng (Workflow Context) và Extracted Path cho Gemini LLM. LLM đóng vai trò giám khảo để kiểm tra 2 điều kiện:
- **Đứt gãy luồng (Broken Transitions)**: Câu hỏi bắt ép luồng chạy sai trình tự hoặc kết hợp các sự kiện không thể xảy ra cùng lúc.
- **Sai thuật ngữ (Domain Terminology)**: Câu hỏi sử dụng sai danh từ cốt lõi (VD: gọi "lịch hẹn" là "bài đấu giá").

> **Nền tảng Khoa học - LLM-as-a-Judge**  
> **Nguồn trích dẫn**: *Zheng, L., et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. (NeurIPS).*  
> **Nơi áp dụng**: Giai đoạn Validation bằng Gemini trong file `AccuracyAssessmentService.cs`.  
> **Điều bài báo chứng minh**: Các mô hình LLM lớn mạnh (như GPT-4, Gemini) có khả năng đóng vai trò giám khảo để đánh giá chất lượng văn bản của chính các LLM khác. Bài báo chứng minh rằng độ đồng thuận giữa "LLM Judge" và "Human Judge" (con người) đạt mức rất cao (trên 80%), biến nó thành một giải pháp đáng tin cậy và có khả năng mở rộng (scalable) cho các bài toán đánh giá định tính.

---

## 2. Tiêu chí 2: Đánh giá Độ Khó (Difficulty)

Việc đánh giá độ khó không dựa vào độ dài câu hỏi mà dựa vào **Độ phức tạp của thuật toán** (Cyclomatic Complexity) ẩn chứa bên trong câu trả lời cần thiết.

- Hệ thống cung cấp cho Gemini LLM toàn bộ Đồ thị luồng và yêu cầu LLM đếm số lượng các điểm rẽ nhánh (Conditions, If/Else), số lượng vòng lặp (Loops) và số lượng khái niệm nghiệp vụ (Domain Entities) cần phải hiểu để trả lời câu hỏi.
- Kết quả trả về là một nhãn độ khó (`Dễ`, `Trung bình`, `Khó`) kèm theo phân tích chi tiết. Cơ sở này hoàn toàn trùng khớp với việc ứng dụng LLM-as-a-Judge (Zheng et al., 2023).

---

## 3. Tiêu chí 3: Đánh giá Độ Bao Phủ (Coverage)

Độ bao phủ đo lường tỷ lệ các Nodes trong hệ thống thực tế được "đụng chạm" đến bởi bộ câu hỏi.

1. **Khởi tạo Tracking**: Lấy tổng số lượng Nodes thực tế (`GlobalNodeCount`) của cả dự án từ Database.
2. **Thu thập Nút Tích Cực (Active Nodes)**: 
   - Với mỗi câu hỏi, hệ thống chạy lại quy trình **Semantic Mapping** (bằng TargetedEntryPoints hoặc Vector Search) để lấy danh sách các Nodes tham gia vào câu hỏi đó.
   - Tập hợp các Nodes này được hợp nhất (Union) để tạo thành danh sách `Unique Active Nodes`.
3. **Tính Toán**:
   - `Coverage Score = Số lượng Unique Active Nodes / Tổng số Nodes của hệ thống`
   - Nhờ đó, người quản trị biết được bộ câu hỏi hiện tại đã phủ được bao nhiêu % luồng nghiệp vụ thực tế.

---

## 4. Tóm Tắt

Sự kết hợp giữa **Code Property Graphs** (để giữ nguyên cấu trúc code), **RAG** (để truy xuất code theo ngữ nghĩa câu hỏi), và **LLM-as-a-Judge** (để đánh giá tự động dựa trên prompt nghiêm ngặt) tạo nên một hệ thống khép kín, tự động hóa hoàn toàn quy trình sinh và thẩm định câu hỏi nghiệp vụ với độ tin cậy tương đương chuyên gia phân tích (Business Analyst).
