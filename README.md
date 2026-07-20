# Repo Into Graph Report

## 1. Giới thiệu repository

Repository `repo_into_grpah_report` là nơi lưu trữ, quản lý và cập nhật toàn bộ các bảng báo cáo, tài liệu nghiên cứu khoa học và hồ sơ tiến độ thuộc dự án của nhóm. Repository này tổng hợp các kết quả nghiên cứu, tài liệu phân tích và báo cáo chuyên môn trong suốt quá trình thực hiện dự án.

## 2. Tổng quan dự án gốc (Repo_Into_Graph)

### 2.1. Nhiệm vụ và mục tiêu
Dự án gốc **Repo_Into_Graph** là hệ thống được phát triển nhằm hỗ trợ giảng viên trong quá trình chấm bài, vấn đáp và đánh giá đồ án/bài tập mã nguồn của sinh viên. Hệ thống giúp tự động hóa quá trình phân tích mã nguồn và kiểm tra mức độ thấu hiểu bài làm của sinh viên thông qua các câu hỏi nghiệp vụ thực tế.

### 2.2. Các chức năng chính
- **Đọc và phân tích mã nguồn (Repository Parsing):** Tiếp nhận kho mã nguồn từ dự án của sinh viên, quét và phân tích các thành phần cấu trúc, hàm, lớp và luồng dữ liệu.
- **Sinh biểu đồ luồng (Graph Generation):** Chuyển đổi mã nguồn thành dạng đồ thị (Graph) trực quan hóa cấu trúc phụ thuộc và luồng thực thi nghiệp vụ của dự án.
- **Tự động sinh câu hỏi nghiệp vụ (Business Question Generation):** Dựa trên đồ thị luồng nghiệp vụ đã trích xuất, hệ thống áp dụng các kỹ thuật xử lý và AI để tự động tạo các câu hỏi liên quan đến luồng xử lý của bài làm.
- **Hỗ trợ đánh giá và vấn đáp (Assessment Support):** Cung cấp công cụ cho giảng viên tham khảo danh sách câu hỏi và tiêu chí đánh giá, phục vụ công tác chấm điểm và hỏi thi sinh viên một cách hiệu quả, minh bạch và chính xác.
