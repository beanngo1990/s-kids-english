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

Theme 5 là `nhung-nguoi-ban-dong-vat` / “Những người bạn động vật”. Mốc 5A tại
`docs/theme-5-content-draft.md` đã khóa hành trình sáu lesson và chọn `feed-the-puppy` làm pilot,
Mốc 5B tại `docs/theme-5-feed-the-puppy-storyboard.md` đã khóa storyboard pilot. Mốc 5C đã đăng
ký theme cùng vertical slice `feed-the-puppy`; bản v2 hiện reauthor lesson theo blueprint Theme 1
với vocabulary 9/18/27, 18/36/54 meaningful actions, 9/18/27 pronunciation encounter và
9/12/15 lượt auto-micro. Story vocabulary ưu tiên dùng chính cún/bát/thảm; cue còn lại neo sát
vùng hành động và runtime reference hiện là 36 trên 43 lesson masters; các cue sau bữa ăn dùng
bát trống, còn cue `feed` trước bữa vẫn dùng bát đầy. Google TTS đã tạo 480
clip còn thiếu; audio audit v2 có 626 target, thiếu 0 và lỗi 0. R2 đã upload delta 490 object,
verify đủ 801/801 object. Bản tối ưu cue-anchor tiếp theo upload thêm 6 WebP; tập authoring hiện
hành verify đủ 798/798 object, lỗi 0 và post-upload dry-run còn `Changed/new: 0`. Publish này
không xóa các key cũ khỏi bucket. Revision local mới sửa scene dùng bữa để chỉ kéo bát một lần,
không mang thức ăn trở lại sau khi cún ăn. Google TTS đã tạo thêm 36 clip; audio audit có 629
target, thiếu 0 và lỗi 0. R2 đã upload delta 36 audio, verify đủ 834/834 object với lỗi 0 và
post-upload dry-run còn `Changed/new: 0`. Revision hình bát trống đã publish thêm năm WebP; R2
verify đủ 835/835 object với lỗi 0 và post-upload dry-run còn `Changed/new: 0`.

Lesson Foundation thứ hai `play-with-the-puppy` đã được triển khai local theo storyboard
`docs/theme-5-play-with-the-puppy-storyboard.md`: ba scene chọn bóng -> lăn/bắt -> mang về, nhịp
9/18/27 từ, 18/36/54 meaningful actions, 9/18/27 pronunciation encounter và 9/12/15 auto-micro.
Chỉ có một drag lăn bóng, không kéo cún. Local pipeline có 33 PNG master, 33 WebP và bốn bundled
icon. Google TTS đã tạo 508 clip còn thiếu; audio audit có 613 target, missing 0 và invalid 0. R2
đã upload/verify 541/541 object, lỗi 0; post-upload dry-run còn `Changed/new: 0`.

Lesson Foundation thứ ba `find-the-kitten` đã được triển khai local theo storyboard
`docs/theme-5-find-the-kitten-storyboard.md`: ba scene nghe tiếng mèo -> kiểm tra chỗ trốn -> gọi
mèo bước ra, nhịp 9/18/27 từ, 18/36/54 meaningful actions, 9/18/27 pronunciation encounter và
9/12/15 auto-micro. Lesson không dùng drag; hai cue kiểm tra hộp/giỏ minh họa chỗ trống và kết
thúc bằng cách chờ mèo tự đến rồi vuốt nhẹ. Local pipeline có 40 PNG master, 40 WebP cùng bốn
bundled icon. Google TTS đã tạo 520 clip; full-corpus audit có 14.279 target, missing 0 và invalid
0. R2 upload/verify đủ 560/560 object, lỗi 0; post-upload dry-run còn `Changed/new: 0`. Device QA
chưa chạy.

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
asset. Trước khi nhân rộng sáu theme phải triển khai và child-test `feed-the-puppy`, kết hợp câu
chữ đơn giản của Theme 1-3 với visible scene payoff của Scene State.

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

1. Advanced Theme 4 đã hoàn thiện đủ năm lesson theo blueprint đã khóa.
2. Ba lesson đầu Theme 5 đã triển khai và publish; `find-the-kitten` đã verify đủ 560/560 object
   trên R2 với lỗi 0.
3. Device/child-test lesson 3 trước khi author lesson 4–6 của Theme 5 cùng sáu Foundation theme
   trong roadmap.
4. Chỉ thêm schema/persisted preference cho content track khi Parent Mode cần filter/lock tự động;
   hiện tại parent chọn bằng catalog và nhãn lesson, không tạo setting ngầm chưa có runtime.
