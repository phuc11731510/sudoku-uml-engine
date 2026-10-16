# UML Engine Sudoku

Sơ đồ lớp UML tương tác của engine giải Sudoku bằng tô màu đồ thị (đồ án cuối kỳ môn Lý thuyết đồ thị). Trang chỉ có **một sơ đồ lớp**. Thiết kế trung lập ngôn ngữ (dùng được cho C++ và Python).

**Xem trực tuyến:** https://phuc11731510.github.io/sudoku-uml-engine/

## Cách mở trên máy

Trình duyệt không cho trang mở bằng cách bấm đúp (địa chỉ `file://`) đọc các file JSON đi kèm, nên cần một máy chủ cục bộ. Mở PowerShell, đi tới thư mục của kho này và chạy:

```powershell
py -m http.server 8000
```

Rồi mở `http://localhost:8000` trong trình duyệt. Dừng máy chủ bằng Ctrl + C. Thêm `#Board` vào địa chỉ để mở thẳng lớp `Board`.

Nếu sau khi các file được sửa mà trang vẫn hiện bản cũ, nhấn Ctrl + F5 để tải lại không dùng bộ nhớ đệm của trình duyệt.

## Cách xem

- Cuộn chuột để phóng to hoặc thu nhỏ, kéo để di chuyển. Có bốn mức chi tiết (tự đổi theo độ phóng, hoặc chọn tay ở thanh bên): mức 0 tên và mục đích; mức 1 thuộc tính và phương thức dạng ngắn; mức 2 chữ ký đầy đủ, chưa có mô tả; mức 3 chữ ký đầy đủ cùng mô tả từng thành viên.
- Trên điện thoại và máy tính bảng: kéo một ngón tay để di chuyển, **hai ngón tay để phóng to hoặc thu nhỏ**, chạm vào một lớp hoặc thành viên để xem chi tiết, nút ☰ mở danh sách và bộ lọc. Chú thích khi rê chuột chỉ có trên máy tính; trên cảm ứng hãy chạm vào tên kiểu để nhảy tới định nghĩa.
- Số trên mỗi thẻ là **thứ tự đọc**. Thanh bên có danh sách theo thứ tự đó và nút «Bắt đầu từ bước 1»; khi một lớp đang được chọn, phím mũi tên trái và phải đi sang lớp trước hoặc sau.
- Rê chuột lên một lớp, một thành viên, một đường nối hoặc một tên kiểu để xem chú thích; bấm để mở khung chi tiết bên phải. Bấm «Đóng» hoặc bấm vào chỗ trống để đóng khung.
- **Mọi tên lớp và tên kiểu trong chữ ký đều bấm được** (kể cả trong khung chi tiết): bấm `Color` hoặc `Board` để nhảy tới nơi nó được định nghĩa. Nút «← Quay lại» ở đầu khung đưa về lựa chọn trước.
- Mặc định chỉ vẽ các quan hệ cấu trúc cho gọn; các quan hệ phụ thuộc của một lớp hiện khi chọn lớp đó, hoặc bật «Hiện mọi quan hệ phụ thuộc» ở thanh bên.
- Nút «Tải SVG» và «Tải PNG» xuất sơ đồ lớp thành ảnh tĩnh để dán vào báo cáo.

## Các file

| File | Nội dung |
| --- | --- |
| `index.html`, `style.css` | Khung trang và giao diện |
| `common.js`, `diagram.js`, `export.js`, `main.js` | Mã trang (không dùng thư viện ngoài) |
| `data/meta.json` | Tên, phiên bản, các gói (màu), các chặng đọc và kích thước chuẩn để co giãn bố cục |
| `data/classes_*.json` | Từng lớp: thuộc tính, phương thức, tiền điều kiện, hậu điều kiện, ví dụ, cài đặt C++ và Python, bước đọc (`read`), vị trí ban đầu (`pos`) |
| `data/classes_types.json` | Thẻ «Kiểu cơ bản» (`BasicTypes`): định nghĩa `Vertex`, `Color`, `CliqueId`, `Edge`, `Nanos` và các kiểu chứa |
| `data/relations.json` | Các quan hệ giữa lớp |

Muốn sửa nội dung thì sửa các file JSON; sơ đồ được vẽ lại từ dữ liệu, nên không phải sửa mã trang. Khi thêm hoặc xóa lớp, cần cập nhật `read` (thứ tự đọc) và `pos` (vị trí ban đầu) cho lớp đó.
