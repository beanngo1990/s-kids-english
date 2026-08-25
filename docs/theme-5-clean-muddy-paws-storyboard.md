# Theme 5 — Storyboard: Clean Muddy Paws

## 1. Vai trò trong hành trình

- Lesson ID: `clean-muddy-paws`
- Tên hiển thị: **Rửa chân bẩn / Clean Muddy Paws**
- Thứ tự: bài Foundation thứ tư của `nhung-nguoi-ban-dong-vat`, sau
  `find-the-kitten`.
- Độ tuổi hiển thị: `3-8 tuổi · Làm quen`.
- Trạng thái: production baseline cùng audit revision 2026-08-25 assets/audio đã publish và
  R2-verify; còn chờ device QA.
- Câu chuyện: thấy chân cún dính bùn -> chờ người lớn -> rửa sạch -> lau khô -> rửa tay.
- Payoff nhìn thấy được: bùn biến mất, nước trong chậu đổi màu, chân cún sạch và khô.

Lesson không dạy bé tự tắm hoặc giữ cún. Người lớn là người chuẩn bị nước, rửa chân và mang
chậu nước bẩn đi; bé chỉ quan sát, chọn đúng cue và gọi trợ giúp.

## 2. Ngân sách đã khóa

| Mode | Từ/cụm từ | Hành động ngoài intro | Lượt phát âm | Auto micro | Optional |
| --- | ---: | ---: | ---: | ---: | ---: |
| Core | 9 | 18 | 9 | 9 | 0 |
| Expanded | 18 | 36 | 18 | 12 | 6 |
| Challenge | 27 | 54 | 27 | 15 | 12 |

Mỗi scene có 3/6/9 từ, 6/12/18 hành động và 3/4/5 lượt auto tương ứng. Mỗi panel phát âm luôn
được ngăn bởi một thao tác làm câu chuyện tiến lên hoặc xác nhận payoff; không có hai panel phát
âm liền nhau.

## 3. Chuỗi cảnh

### Scene 1 — `notice-the-muddy-paws`

Mục tiêu câu chuyện: nhận ra vấn đề, giữ cún đứng trên thảm và nhờ người lớn.

| Tier | Từ/cụm từ theo thứ tự | Hành động/payoff |
| --- | --- | --- |
| Core | `paws`, `mud`, `dirty` | nhìn chân -> tìm nguồn bùn -> cún đứng chờ |
| Expanded | `pawprints`, `doormat`, `wait` | theo dấu chân -> giữ bùn trên thảm -> chờ bình tĩnh |
| Challenge | `muddy paws`, `stop here`, `ask an adult` | gọi tên tình trạng -> dừng đúng chỗ -> người lớn tới giúp |

Cue được neo ở chân cún, vũng bùn, dấu chân hoặc tấm thảm. Không có cue hành động nổi giữa một
khoảng trống không liên quan.

### Scene 2 — `wash-the-paws`

Mục tiêu câu chuyện: người lớn dùng nước sạch rửa chân, sau đó xử lý nước đã có bùn.

| Tier | Từ/cụm từ theo thứ tự | Hành động/payoff |
| --- | --- | --- |
| Core | `water`, `wash`, `clean` | cho nước vào chậu -> rửa từng chân -> bùn biến mất |
| Expanded | `basin`, `muddy water`, `finished washing` | kiểm tra chậu -> nhận ra nước đổi màu -> chuyển sang lau khô |
| Challenge | `check the paws`, `clean paws`, `empty the tub` | kiểm tra lại -> xác nhận sạch -> người lớn mang chậu đi |

Core kết thúc trọn vẹn ở trạng thái hai chân sạch nhưng còn ướt. Expanded và Challenge chỉ nối
thêm khâu kiểm tra/dọn nước, không quay ngược lại trạng thái chân bẩn và không lặp thao tác rửa.

### Scene 3 — `dry-the-paws`

Mục tiêu câu chuyện: lau chân khô, xác nhận hoàn thành và rửa tay.

| Tier | Từ/cụm từ theo thứ tự | Hành động/payoff |
| --- | --- | --- |
| Core | `towel`, `wipe`, `dry` | lấy khăn -> lau nước -> hai chân khô |
| Expanded | `fluffy towel`, `pat`, `stand` | dùng khăn bông xốp -> thấm giọt cuối -> cún đứng trên bốn chân sạch, khô |
| Challenge | `dry the paws`, `all done`, `wash hands` | kiểm tra lại -> cún rời thảm -> bé nhớ rửa tay |

## 4. Nhịp phát âm

- Ba từ Core mỗi scene dùng `speechPractice: 'auto'`.
- Từ Expanded đầu tiên và từ Challenge đầu tiên của mỗi scene dùng `auto` để giữ tổng
  3/4/5 auto mỗi scene.
- Các từ phụ còn lại dùng `optional`; panel vẫn xuất hiện nhưng không tự mở micro.
- Từ cũ chỉ làm hành động đệm khi có thể. Bốn anchor dùng cho review là `paws`, `mud`, `water`,
  `towel`; Expanded thêm `basin`, Challenge thêm `dry the paws`.

## 5. Contract hình ảnh

- Background dùng cùng phòng chăm thú cưng với ba bài trước để giữ continuity.
- Toàn bộ cutout là PNG master 1024x1024 có alpha, không chữ, không checkerboard/nền đen.
- Hero state phải thay thế nhau: `muddy` -> `waiting`; `washing` -> `clean-wet`; `drying` ->
  `dry` -> `finished`.
- Cue close-up nằm bên trái, hero nằm bên phải và đồ dùng nằm sát sàn; không chồng hai phiên bản
  cún trong cùng một nhịp.
- Sheet ImageGen chỉ là nguồn tạo component. Bộ cắt tách theo cell/component, chuẩn hóa về canvas
  1024x1024 và audit alpha trước khi build WebP.

## 6. An toàn và giới hạn

- Luôn mô tả người lớn chuẩn bị nước và trực tiếp giúp rửa chân.
- Không dùng nước nóng, hóa chất hoặc bắt cún đứng yên khi cún khó chịu.
- Không mô tả đây là hướng dẫn tắm thú cưng đầy đủ.
- Kết thúc bằng rửa tay sau khi chăm cún.

## 7. Gate triển khai

- `getReviewGameItems()` trả đúng 4/5/6 item khác hình theo Core/Expanded/Challenge.
- Validator xác nhận mọi target/cue/state variant tồn tại và hiển thị đúng trước khi chạm.
- Test xác nhận 9/18/27 vocabulary, 18/36/54 action và 9/12/15 auto micro.
- `assets:audit`, `assets:build`, `assets:verify`, cutout audit và `check:images` đều pass trước khi
  upload.
- Current audit thay `soft`/`comfortable` bằng `fluffy towel` và `stand`, đồng thời thêm standing
  payoff; audio/image delta đã publish và R2-verify. Device QA vẫn còn trước khi freeze revision.
