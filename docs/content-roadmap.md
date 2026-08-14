# Sungy Content Roadmap - Foundation và Advanced

**Freeze date:** 2026-08-14

Tài liệu này tách độ khó của **nội dung bài học** khỏi `learningMode`. Đây là quyết định nội dung,
chưa thêm một persisted setting hoặc navigation flow mới.

## 1. Hai trục độc lập

### Content track

- **Foundation / Làm quen:** đồ vật và hành động quen thuộc; mỗi yêu cầu có thể giải bằng một
  dấu hiệu hình ảnh trực tiếp; câu chuyện ngắn và không bắt bé giữ nhiều state trong trí nhớ.
- **Advanced / Nâng cao:** có chuỗi nguyên nhân-kết quả, quan sát state, suy luận thứ tự hoặc kiến
  thức chủ đề; phụ huynh chủ động chọn cho bé đã sẵn sàng.

### Learning mode

- `core`, `expanded`, `challenge` tiếp tục điều chỉnh số lượng New Anchor và độ sâu bên trong
  cùng một lesson.
- `core` của lesson Advanced vẫn là đường ngắn nhất của lesson nâng cao; nó không biến lesson đó
  thành Foundation.
- Không suy tuổi hoặc khả năng của bé chỉ từ `learningMode`.

## 2. Phân nhóm catalog và roadmap

### Foundation hiện có

1. `mot-ngay-cua-be`
2. `be-ra-ngoai-kham-pha`
3. `co-the-cam-xuc-va-tu-cham-soc`

Các theme này giữ vai trò thư viện nền tảng. Bài mới cùng track ưu tiên từ quen thuộc, câu Việt
ngắn, thao tác trực tiếp và visible payoff mà không cần giải mã icon hành động trừu tượng.

### Foundation dự kiến

1. Màu sắc và hình dạng.
2. Động vật và thú cưng.
3. Phương tiện quanh bé.
4. Ngôi nhà của bé.
5. Quần áo của bé.
6. Đồ ăn và căn bếp.
7. Thiên nhiên quanh bé.

Danh sách này khóa phạm vi nội dung, chưa khóa theme ID, lesson ID, catalog order hoặc asset.
Trước khi nhân rộng cả bảy theme phải triển khai và child-test một Foundation template mới kết
hợp câu chữ đơn giản của Theme 1-3 với visible scene payoff của Scene State.

### Advanced hiện có

- `khu-vuon-cua-be` là track Advanced.
- Journey giữ thứ tự `plant-a-seed` -> `help-it-grow` -> `garden-friends` -> `harvest-day` ->
  `garden-to-table`.
- Nội dung Theme 4 tiếp tục theo blueprint tại `docs/theme-4-content-draft.md`; không retrofit
  thành Foundation.
- Lesson card của Theme 4 dùng age label có chữ `Nâng cao` để phụ huynh nhận biết trước khi mở.

## 3. Authoring guardrails

### Foundation

- 3-5 core anchors mỗi lesson hoặc một nhóm nhỏ tương đương theo scene.
- Instruction Việt thường 4-7 từ, một ý và một thao tác.
- Một grammar tương tác mới tại một thời điểm.
- Tối đa 1-2 lượt ghi âm bắt buộc mỗi scene.
- Không cần suy luận từ icon hoặc state không được demo trước.

### Advanced

- Giữ New Anchor/Quick Recall/Action Enabler và ngân sách 5-6 / 7-9 / 8-11 đã khóa cho Theme 4.
- Cho phép chuỗi state, logic thứ tự và kiến thức chủ đề nhưng mọi prerequisite vẫn phải giải
  được bằng audio và hình.
- Parent-facing label không thay thế safety, pre-reader copy, learning-mode filtering hoặc review
  4/5/6 executable items.
- Không cho tuổi lớn hơn trở thành lý do để giữ hình mơ hồ, prompt sai nghĩa hoặc interaction bị
  kẹt.

## 4. Rollout order

1. Hoàn thiện Advanced Theme 4 theo blueprint đã khóa. `garden-friends` là vertical slice thứ ba;
   lesson runtime tiếp theo là `harvest-day`.
2. Song song chuẩn bị Foundation template mới và child-test trước khi author sáu theme còn lại.
3. Chỉ thêm schema/persisted preference cho content track khi Parent Mode cần filter/lock tự động;
   hiện tại parent chọn bằng catalog và nhãn lesson, không tạo setting ngầm chưa có runtime.
