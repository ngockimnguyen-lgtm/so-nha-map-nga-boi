# Sổ Nhà Mập Nga Boi

Sổ nhật ký online cho 3 người (Mập, Nga, Boi). Giao diện sổ tay pastel, doodle vẽ tay kiểu bút sáp.

## Có gì trong sổ

- **Hôm nay:** ngày này năm xưa, chuyến đi và sinh nhật sắp tới, thư sắp mở, các trang mới viết.
- **Lịch:** chọn năm nào cũng được, xem theo tháng hoặc cả năm. Chấm màu cho biết ai đã viết nhật ký ngày đó. Có sinh nhật và kỷ niệm lặp lại hằng năm, cùng các ngày lễ dương lịch.
- **Nhật ký Mập / Nga / Boi:** mỗi trang có tâm trạng, thời tiết, ảnh polaroid và sticker doodle. Người khác thả tim và dán lời bên lề.
- **Chuyến đi:** album ảnh, ghi chú, chia tiền (tự tính ai chuyển cho ai bao nhiêu), bucket list làm trong chuyến.
- **Bucket list chung:** tick khi làm xong, gắn với chuyến đi.
- **Thư hẹn giờ:** gửi xong là khoá. Server không trả nội dung về cho tới ngày mở, nên người viết cũng phải đợi.
- **Cài đặt:** chọn máy này là của ai, đồng bộ lại, tải bản sao lưu .json.

## Cấu trúc

| File | Vai trò |
|---|---|
| `index.html`, `style.css`, `app.js` | Giao diện, đăng trên GitHub Pages |
| `Code.gs` | Phần lưu trữ, chạy trên Google Apps Script của chị |
| `config.js` | Link Web App, dùng chung cho `app.js` và `sw.js` |
| `sw.js`, `manifest.webmanifest`, `icon*` | Thêm sổ vào màn hình chính như một app, nhận thông báo |

Dữ liệu chữ nằm trong Google Sheet **"Sổ Nhà Mập Nga Boi - dữ liệu"**. Ảnh nằm trong thư mục Drive **"Sổ Nhà Mập Nga Boi - ảnh"**. Cả hai do `setup()` tự tạo trong Drive của chị. Mỗi bản ghi là một dòng JSON, xoá thì chỉ đánh dấu `deleted` nên vẫn lấy lại được trong Sheet.

## Cài phần lưu trữ (làm một lần, khoảng 3 phút)

1. Mở https://script.google.com, chọn **Dự án mới**, đặt tên "Sổ Nhà Mập Nga Boi".
2. Xoá code mẫu, dán toàn bộ `Code.gs` vào.
3. Sửa dòng `const MA_CHUNG = 'doi-ma-nay';` thành mã của nhà mình.
4. Chọn hàm `setup` trên thanh công cụ, bấm **Chạy**, rồi cấp quyền (Google sẽ báo "ứng dụng chưa xác minh": chọn Nâng cao, đi tới dự án).
5. Chọn **Triển khai > Tùy chọn triển khai mới > Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
6. Bấm **Triển khai** và chép URL kết thúc bằng `/exec`.
7. Dán URL đó vào `config.js` (dòng `self.SO_API_URL`), rồi upload lại `config.js` lên repo.

**Đổi mã:** sửa `MA_CHUNG` rồi chạy lại `setup`. Không cần triển khai lại. Ba người nhập mã mới một lần.

**Sửa `Code.gs` sau này:** vào Triển khai > Quản lý triển khai > sửa > **Phiên bản mới**. Làm vậy thì link `/exec` giữ nguyên.

## Thông báo đẩy

- Gửi lúc **9h sáng** (thư hẹn giờ tới ngày mở, sinh nhật và kỷ niệm hôm nay, chuyến đi còn 7 ngày và 1 ngày) và **21h tối** (ai hôm đó chưa viết nhật ký thì nhận một lời nhắc).
- Cài một lần: trong Apps Script chạy hàm `setupPush`, cấp quyền, rồi Triển khai > Quản lý triển khai > sửa > **Phiên bản mới**. Hàm này tạo khóa VAPID (lưu trong Script Properties), tab `push` trong Sheet, và 2 lịch chạy.
- Trên iPhone (iOS 16.4 trở lên): thêm sổ vào màn hình chính, mở sổ từ biểu tượng đó, vào Cài đặt, bấm **Bật thông báo**, rồi bấm **Gửi thử**.
- Cách chạy: server gửi push không kèm nội dung, service worker nhận được thì gọi action `inbox` (xác thực bằng chính endpoint của máy) để lấy tin đang chờ rồi hiện lên. Phần ký ES256 viết tay trong `EC_` vì Apps Script không có sẵn.

## Sửa giao diện

- Sửa file rồi upload đè lên repo.
- Mỗi lần sửa, tăng `CACHE` trong `sw.js` và số `?v=` sau `style.css`, `app.js` trong `index.html` để điện thoại tự nhận bản mới.
- Xem thử trên máy: preview `so-nha` (cổng 8771). Khi `API_URL` để trống, sổ chạy chế độ thử và dữ liệu chỉ lưu trong trình duyệt đó.
- Doodle nằm trong `DOODLES` của `app.js`, mỗi doodle là một đoạn SVG viewBox 100x100. Muốn thêm thì thêm một dòng.
- Hiệu ứng bút sáp là filter `#crayon` trong `injectDefs()`.

## Lưu ý

- Ảnh được đặt quyền "ai có link thì xem được" để hiện trên web. Người ngoài chỉ xem được nếu có đúng link từng ảnh.
- Mã chung được lưu trên từng máy sau lần nhập đầu. Máy lạ thì vào Cài đặt, bấm "Thoát mã trên máy này".
