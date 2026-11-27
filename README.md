# Bản đồ Cứu trợ & Kết nối Cộng đồng (Community Rescue Map)

Ứng dụng web hỗ trợ trực quan hóa điểm nóng cần cứu trợ khẩn cấp và kết nối trực tiếp giữa người dân đang gặp khó khăn với các đội nhóm tình nguyện viên tại khu vực tỉnh **Đồng Nai**.

**Live Demo (GitHub Pages):** [https://nnbl021107.github.io/community-rescue-map/](https://nnbl021107.github.io/community-rescue-map/)

---

## Danh sách thành viên & Vai trò

| STT | Họ và Tên | Vai trò | Trách nhiệm chính |
| :---: | :--- | :--- | :--- |
| 1 | **Nguyễn Như Ý** | **Nhóm trưởng (Team Leader)** | Quản lý tiến độ dự án, thiết kế kiến trúc hệ thống, phát triển trang Bản đồ tương tác (`index.html`, `js/map.js`) và Design System (`css/style.css`). |
| 2 | **Nguyễn Ngọc Bảo Linh** | **Thành viên (Member)** | Xây dựng Data layer (`js/data.js`), phát triển trang Danh sách yêu cầu & Form gửi cứu trợ kèm Validation (`requests.html`, `js/requests.js`), cấu hình GitHub Pages. |
| 3 | **Nguyễn Nhật Tân** | **Thành viên (Member)** | Phát triển module Tình nguyện viên (`volunteer.html`, `js/volunteer.js`), xử lý Validation Regex, Toast thông báo và kiểm thử Responsive trên thiết bị di động. |

---

## Bài toán giải quyết & Tính năng chính

### 1. Bài toán thực tế
Khi xảy ra thiên tai, lũ lụt hoặc sự cố khẩn cấp, việc tiếp nhận và phân phối nguồn lực cứu trợ thường gặp tình trạng:
- Thông tin bị trôi, phân tán trên mạng xã hội, thiếu vị trí và thông tin liên lạc rõ ràng.
- Người cứu trợ không nắm được khu vực nào đã được giúp và nơi nào còn đang chờ.
- Thiếu kênh kết nối tập trung giữa tình nguyện viên có chuyên môn/phương tiện với các điểm cần cứu trợ.

**Community Rescue Map** ra đời để giải quyết các vấn đề trên bằng giải pháp web nhẹ, thuần HTML5/CSS3/JavaScript, chạy mượt mà ngay trên điện thoại di động mà không cần cài đặt ứng dụng.

### 2. Các tính năng nổi bật
* **Bản đồ tương tác trực quan (`index.html`):**
  * Hiển thị vị trí các điểm cứu trợ thông qua tọa độ phần trăm (%) linh hoạt.
  * Phân loại màu sắc theo nhu cầu: 🔴 **Y tế** (có hiệu ứng nhấp nháy pulse khẩn cấp), 🟠 **Thực phẩm**, 🔵 **Nơi ở**, 🟢 **Đã giúp**.
  * Bộ lọc trạng thái thông minh (*Tất cả / Đang chờ / Đã được giúp*).
  * Hộp thoại Popup xem chi tiết người cần hỗ trợ, số điện thoại bấm gọi ngay (`tel:`).
  * Bảng thống kê nhanh số lượng yêu cầu theo thời gian thực.
* **Danh sách & Gửi yêu cầu cứu trợ (`requests.html`):**
  * Trình bày dạng CSS Grid responsive (3 cột trên máy tính, 1 cột trên điện thoại).
  * Bộ lọc thẻ theo trạng thái cứu trợ.
  * Form tiếp nhận cứu trợ mới với bộ kiểm tra dữ liệu nghiêm ngặt (Validation): không để trống, kiểm tra định dạng SĐT 10 chữ số (Regex) và thông báo lỗi đỏ trực tiếp dưới ô nhập liệu.
  * Tự động sinh tọa độ ngẫu nhiên an toàn (20% – 80%) và đồng bộ tức thời với `localStorage`.
* **Cổng Đăng ký Tình nguyện viên (`volunteer.html`):**
  * Tiếp nhận tình nguyện viên / tổ chức cứu trợ với các trường thông tin: Họ tên, SĐT, Email, Khu vực hỗ trợ và Kỹ năng/Nguồn lực (Vận chuyển, Y tế, Nhu yếu phẩm, Chỗ ở).
  * Kiểm tra tính hợp lệ của Email và SĐT bằng Regular Expressions.
  * Hiệu ứng Toast thông báo đăng ký thành công tự động ẩn sau 3 giây.
  * Hiển thị danh sách các tình nguyện viên đã đăng ký ngay bên dưới.
* **Đồng bộ dữ liệu thời gian thực:** Toàn bộ dữ liệu được lưu trữ và đồng bộ xuyên suốt qua `localStorage`, hoạt động độc lập không cần backend phức tạp.

---

## 3–5 Câu Prompt nổi bật nhất của nhóm

Dưới đây là các câu Prompt tiêu biểu thể hiện phương pháp làm việc có cấu trúc của nhóm cùng Trợ lý AI trong quá trình thiết kế và phát triển dự án:

1. **Prompt khởi tạo nền tảng & Design System:**
   > *"Bạn là chuyên gia Front-end. Tôi đang bắt đầu dự án nhóm 'Bản đồ Cứu trợ & Kết nối Cộng đồng (Community Rescue Map)' bằng HTML5, CSS3 và JavaScript thuần. Hãy giúp tôi tạo 2 file nền tảng dùng chung cho cả 3 trang (index.html, requests.html, volunteer.html): File js/data.js tạo mảng DEFAULT_REQUESTS (6 yêu cầu mẫu tại Đồng Nai, coords top/left %, localStorage helpers getRequests/saveRequests) và File css/style.css khai báo Design System bằng biến CSS :root, reset CSS, khung navbar flexbox responsive <600px."*

2. **Prompt xây dựng Bản đồ & Xử lý tương tác Marker:**
   > *"Hãy viết code cho index.html (chuẩn Semantic HTML5) và js/map.js (kèm CSS bổ sung cho bản đồ): Thanh Navbar 3 liên kết, Bộ lọc trạng thái ('Tất cả', 'Đang chờ', 'Đã được giúp') cùng chú thích 3 màu Marker (Đỏ: Y tế có pulse, Cam: Thực phẩm, Xanh dương: Nơi ở). Khung bản đồ dùng hàm .map() để vẽ Marker từ getRequests(), lọc bằng .filter(), bấm vào Marker mở Popup chi tiết với thẻ tel: gọi điện thoại được. Đảm bảo responsive tốt trên màn hình 375px."*

3. **Prompt xây dựng Danh sách Grid & Form Validation cứu trợ:**
   > *"Hãy viết code cho requests.html và js/requests.js gồm 2 phần: Danh sách yêu cầu dùng CSS Grid hiển thị 3 cột trên PC và 1 cột trên điện thoại (<768px), đổ dữ liệu bằng .map() có lọc trạng thái. Form gửi yêu cầu cứu trợ kiểm tra validation bằng event.preventDefault(): không bỏ trống, SĐT đúng 10 số bắt đầu bằng số 0 (Regex), hiển thị lỗi đỏ dưới input (không dùng alert). Hợp lệ thì random tọa độ (20%–80%), lưu localStorage và cập nhật danh sách ngay lập tức."*

4. **Prompt module Đăng ký Tình nguyện viên:**
   > *"Thiết kế Form đăng ký tình nguyện viên tại volunteer.html và js/volunteer.js: Các ô nhập Họ tên, SĐT, Email, Khu vực hỗ trợ và Checkbox kỹ năng (chọn ít nhất 1). Kiểm tra validation bằng Regex cho SĐT và Email, báo lỗi đỏ dưới từng ô nhập. Khi thành công lưu vào localStorage (key volunteers), hiện toast thông báo tự ẩn sau 3 giây bằng setTimeout và hiển thị danh sách tình nguyện viên vừa đăng ký ở bên dưới."*

---

## Công nghệ sử dụng
- **HTML5:** Semantic Elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **CSS3:** CSS Custom Properties (`:root`), Flexbox, CSS Grid, Media Queries, CSS Keyframe Animations (`@keyframes pulse`).
- **JavaScript (ES6+):** Xử lý mảng nâng cao (`.map()`, `.filter()`), DOM Manipulation, Event Handling (`event.preventDefault()`), Regular Expressions (`RegExp`), `localStorage` API, IIFE Pattern.
- **Hosting:** GitHub Pages.
