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

### Foundation template đang thử nghiệm

Theme 5 là `nhung-nguoi-ban-dong-vat` / “Những người bạn động vật”. Sáu lesson Foundation đã
được đăng ký theo hành trình khóa tại `docs/theme-5-content-draft.md`: `feed-the-puppy`,
`play-with-the-puppy`, `find-the-kitten`, `clean-muddy-paws`, `care-for-the-rabbit` và
`groom-the-kitten`. Mỗi lesson có storyboard riêng, vocabulary 9/18/27, 18/36/54 meaningful
actions, 9/18/27 pronunciation encounter và 9/12/15 lượt auto-micro; review thực thi chọn 4/5/6
item. Production audio và ảnh của revision audit 2026-08-25 đã được publish lên R2. Full-corpus
audio audit đạt 16.156 target với 0 file thiếu và 0 file lỗi; đợt publish upload 279 audio cùng sáu
WebP mới/đổi, verify đủ 21.296/21.296 remote object với 0 lỗi và post-upload delta bằng 0.
`feed-the-puppy` có device QA lịch sử trên revision trước; current audit của cả sáu lesson, gồm
`play-with-the-puppy`, vẫn cần device/child test.

Template dùng ba mini-scene mỗi lesson và chỉ đưa một yêu cầu tại một thời điểm. Mỗi lesson giữ
9/18/27 cơ hội nói nhưng chỉ tự bật micro 9/12/15 lần theo core/expanded/challenge. Mỗi vocabulary target được
nói một lần rồi nối ngay với một hành động áp dụng nghĩa; mọi action phải đẩy câu chuyện tiến lên,
không thêm tap/find hoặc reprise chỉ để đạt số lượng.

### Foundation dự kiến sau pilot

1. Màu sắc và hình dạng.
2. Phương tiện quanh bé.
3. Ngôi nhà của bé.
4. Quần áo của bé.
5. Đồ ăn và căn bếp.
6. Thiên nhiên quanh bé.

Danh sách này khóa phạm vi nội dung còn lại, chưa khóa theme ID, lesson ID, catalog order hoặc
asset. Trước khi nhân rộng sáu theme phải hoàn tất device/child test cho current audit Theme 5,
kết hợp câu chữ đơn giản của Theme 1-3 với visible scene payoff của Scene State.

### Advanced hiện có

- `khu-vuon-cua-be` là track Advanced.
- Journey giữ thứ tự `plant-a-seed` -> `help-it-grow` -> `garden-friends` -> `harvest-day` ->
  `garden-to-table`.
- Nội dung Theme 4 tiếp tục theo blueprint tại `docs/theme-4-content-draft.md`; không retrofit
  thành Foundation.
- Lesson card của Theme 4 dùng age label có chữ `Nâng cao` để phụ huynh nhận biết trước khi mở.

## 3. Authoring guardrails

### Foundation

- 4-5 core anchors mỗi lesson; executable review vẫn phải có đủ bốn core item khác hình.
- Instruction Việt thường 4-7 từ, một ý và một thao tác.
- Một grammar tương tác mới tại một thời điểm.
- Mỗi New Anchor có một guided speech turn; từ trụ cột có thể được nói lại sau một action/payoff.
  Không đặt hai recording panel liền nhau và không dùng giới hạn cứng 1-2 lượt cho mọi scene.
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

1. Advanced Theme 4 đã author đủ năm lesson theo blueprint đã khóa; follow-up correctness audit
   đã hoàn tất audio/R2 verification và còn chờ device QA.
2. Sáu lesson Theme 5 đã triển khai và publish production assets; revision nội dung tiếp tục được
   kiểm tra theo từng lesson.
3. Device/child-test current audit của cả sáu lesson Theme 5 trước khi nhân rộng sáu Foundation
   theme trong roadmap.
4. Chỉ thêm schema/persisted preference cho content track khi Parent Mode cần filter/lock tự động;
   hiện tại parent chọn bằng catalog và nhãn lesson, không tạo setting ngầm chưa có runtime.
