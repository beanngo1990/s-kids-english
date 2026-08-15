# Theme 5 Content Architecture v2 — Những người bạn động vật

**Freeze date:** 2026-08-14
**Status:** Content architecture v2 frozen; bốn lesson đầu đã đăng ký runtime; ba lesson đầu đã
publish audio/ảnh lên R2, lesson 4 đã có vertical slice local
**Content track:** `3-8 tuổi · Làm quen` / Foundation
**Scope:** Theme dự kiến `nhung-nguoi-ban-dong-vat` / “Những người bạn động vật” /
“My Animal Friends”.

Tài liệu này khóa phạm vi, hành trình, nhịp tương tác và phát âm của Theme 5. Pilot đầu tiên hiện
đã được author và đăng ký runtime; exact step copy, object/variant ID, geometry, audio target và
asset inventory của mỗi lesson thuộc storyboard riêng. Không thêm lesson tiếp theo vào runtime
catalog chỉ dựa trên tài liệu này.

## 1. Product role

Theme 5 là Foundation template đầu tiên sau Theme 4. Nó kiểm chứng cách kết hợp:

- từ và câu Việt đơn giản như Theme 1–3;
- visible payoff của Scene State v1;
- câu chuyện ngắn gồm 2–4 hành động liên tiếp;
- mật độ luyện nói đủ cao để phát âm vẫn là hoạt động trung tâm của Sungy.

“Khám phá” ở đây là nhịp học, không phải yêu cầu suy luận nâng cao. Bé chỉ nhận một yêu cầu tại
một thời điểm. Thành công ở hành động trước mới làm hiện hoặc nhấn mạnh mục tiêu tiếp theo; bé
không phải nhớ cả chuỗi từ đầu scene.

Theme này không lặp lại `animal-trip`. Lesson cũ tập trung vào vé, biển chỉ dẫn, động vật nông
trại và vườn thú. Theme 5 tập trung vào thú cưng quen thuộc, hành động chăm sóc trực tiếp và một
nhóm nhân vật xuyên suốt gồm cún, mèo con và thỏ.

## 2. Theme metadata

- Theme ID: `nhung-nguoi-ban-dong-vat`.
- `titleVi`: `Những người bạn động vật`.
- `titleEn`: `My Animal Friends`.
- `descriptionVi`: `Bé cho thú cưng ăn, chơi cùng các bạn, chăm sóc nhẹ nhàng và giúp các bạn đi ngủ.`
- `descriptionEn`: `Feed, play with, gently care for, and help familiar animal friends get ready for bed.`
- `thumbnailEmoji`: `🐾`.
- Bundled theme icon key dự kiến: `themeAnimalFriends`.
- Parent-facing age label dự kiến: `3-8 tuổi · Làm quen`.

Metadata trên hiện đã đăng ký cùng pilot. Lesson tiếp theo chỉ được thêm khi có data, review và
asset tối thiểu để không tạo lesson card không mở được.

## 3. Foundation learning contract

### Meaning before speech

Mỗi New Anchor phải đi qua chuỗi sau, nhưng không nhất thiết bằng một panel riêng cho từng nấc:

```text
hình và lời Việt làm rõ nghĩa
  -> tương tác làm nghĩa hiện rõ
  -> nghe mẫu English
  -> bé nói
  -> payoff sau guided turn hoặc hành động tiếp theo
```

- Không yêu cầu bé đọc English word, `meaningVi`, title hoặc nhãn trên raster.
- Instruction Việt thường 4–7 từ, có đúng một động từ thao tác: `Chạm`, `Kéo` hoặc `Tìm`.
- Một hình chỉ dạy một nghĩa nổi bật tại thời điểm đó.
- Action Enabler có thể được gọi hoàn toàn bằng tiếng Việt; không tạo vocabulary chỉ để tăng số
  từ.
- Từ gặp ở theme khác vẫn phải hiểu được bằng hình và lời Việt vì `journeyMode: free` không đảm
  bảo bé đã học lesson trước.

### Short-story sequence

Mỗi lesson có ba mini-scene. Mỗi core scene có:

- một mục tiêu cụ thể và dễ nhìn;
- một chuỗi story actions ngắn, mỗi lần chỉ đưa một yêu cầu;
- 6 meaningful actions ngoài intro, xen kẽ nghe–nói và áp dụng nghĩa;
- một end state nhìn thấy được;
- không quá hai listen-only beat trước khi bé được thao tác.

Expanded/challenge được thêm scoped beats khi cần cho anchor riêng, nhưng không đổi core outcome
hoặc tạo hai pronunciation panel liền nhau.

Ngân sách toàn lesson:

| Mode | Vocabulary | Meaningful actions ngoài intro | Review |
| --- | ---: | ---: | ---: |
| Core | 9 | 18 | 4 item |
| Expanded | 18 | 36 | 5 item |
| Challenge | 27 | 54 | 6 item |

Vocabulary pool và review pool là hai contract khác nhau. `learningScope.minMode` cùng
`VocabularyItem.level` phải mở đúng 9/18/27 vocabulary, còn `getReviewGameItems()` chỉ chọn
4/5/6 executable items. Sáu review visual phải phân biệt được bằng silhouette/hành động.

## 4. Speech-production contract

Theme 5 không dùng giới hạn “tối đa 1–2 lượt phát âm mỗi scene”. Mật độ được khóa theo toàn
lesson:

| Mode | Pronunciation encounter | Story action sau lượt nói | Auto micro |
| --- | ---: | ---: | ---: |
| Core | 9 vocabulary x 1 | 9 | 9 |
| Expanded | 18 vocabulary x 1 | 18 | 12 |
| Challenge | 27 vocabulary x 1 | 27 | 15 |

Quy tắc authoring:

1. Mỗi vocabulary target có đúng một first-production encounter. Core anchor dùng
   `speechPractice: 'auto'`; mỗi tier cao hơn thêm một auto anchor mỗi scene, còn từ phụ dùng
   `optional` để giữ cơ hội nói mà không ép mở micro.
2. Ngay sau mỗi lượt nói phải có một hành động áp dụng nghĩa và làm state/payoff tiến lên; không
   thêm reprise hoặc tap lặp chỉ để đạt số.
3. Không có hai recording panel liên tiếp. Giữa hai lượt nói phải có thao tác hoặc visible
   payoff có ý nghĩa.
4. Mỗi scene đóng góp 3/6/9 pronunciation encounter và 3/4/5 lượt auto-micro theo
   Core/Expanded/Challenge, luôn xen kẽ với hành động tương ứng.
5. Guided speech là lời mời tự động, không phải pronunciation exam. Native recognition chỉ là
   early-stop hint; không chấm điểm phát âm hoặc khóa tiến trình theo transcript.
6. Khi quyền micro bị từ chối, thu âm lỗi hoặc bé chọn đi tiếp sau một lần thử, story vẫn phải
   hoàn thành được.
7. Review game không được tính vào speech budget vì runtime review hiện không phải pronunciation
   game.

Mục tiêu chất lượng là “bé hiểu, thử nói và thấy guided turn nối liền với câu chuyện”, không phải
tối đa số lần micro xuất hiện hoặc ngụ ý engine đã chấm đúng phát âm.

## 5. Frozen six-lesson journey

| Order | Lesson ID | Title | Three-scene story | Visible outcome |
| --- | --- | --- | --- | --- |
| 1 | `feed-the-puppy` | Cho cún ăn / Feed the Puppy | Gặp cún đói -> chuẩn bị bát -> cún ăn | Cún ăn xong và vẫy đuôi |
| 2 | `play-with-the-puppy` | Chơi cùng cún / Play with the Puppy | Chọn bóng -> lăn bóng -> cún mang về | Bóng trở lại bên bé |
| 3 | `find-the-kitten` | Tìm mèo con / Find the Kitten | Nghe tiếng mèo -> tìm chỗ trốn -> gọi mèo ra | Mèo bước ra và dụi đầu vui vẻ |
| 4 | `clean-muddy-paws` | Rửa chân bẩn / Clean Muddy Paws | Nhìn chân bẩn -> rửa nhẹ -> lau khô | Dấu bùn biến mất, chân sạch và khô |
| 5 | `care-for-the-rabbit` | Chăm thỏ con / Care for the Rabbit | Chuẩn bị cỏ khô -> thêm nước -> cho món nhỏ đã chuẩn bị | Thỏ ăn, uống và nhảy vui |
| 6 | `pet-bedtime` | Giờ đi ngủ / Pet Bedtime | Tìm giường -> đắp chăn -> tắt đèn | Các bạn nằm yên dưới ánh đèn ngủ |

Hành trình đi từ nhu cầu dễ hiểu nhất đến routine khép lại một ngày. `feed-the-puppy` mở đầu vì
đói -> bát -> thức ăn -> ăn là quan hệ nhìn thấy ngay và phù hợp nhất để child-test template.

## 6. Anchor families and role boundaries

Danh sách dưới đây khóa semantic seed và tính khả thi của review, không phải toàn bộ ngân sách
9/18/27. Riêng pilot đã có full vocabulary set. Storyboard lesson 2–6 phải mở rộng seed thành
đúng ba cụm 3/6/9 từ theo từng scene mà không đổi outcome hoặc thêm từ mơ hồ chỉ để đủ số.

| Lesson | Core semantic seed | Expanded seed | Challenge seed |
| --- | --- | --- | --- |
| `feed-the-puppy` | puppy, hello, hungry; bowl, food, scoop; wait, eat, happy | sit, tummy, look; mat, empty, full; carry, feed, finished | tail, collar, wag; one scoop, meal, ready; ask an adult, put it down, step back |
| `play-with-the-puppy` | ball, run, catch, play | fetch | roll the ball |
| `find-the-kitten` | kitten, box, basket, hide | under | find the kitten |
| `clean-muddy-paws` | paws, mud, water, towel | basin | dry the paws |
| `care-for-the-rabbit` | rabbit, hay, water bowl, hop | carrot | feed the rabbit |
| `pet-bedtime` | bed, blanket, lamp, sleep | quiet | turn off the light |

- Exact review anchors phải có visual dương, rõ và không phụ thuộc chữ.
- `hungry`, `hide`, `clean`, `quiet` chỉ được giữ nếu storyboard chứng minh meaning bằng trạng
  thái/hành động không mơ hồ; nếu không phải thay bằng noun/action cụ thể hơn.
- `water`, `towel`, `bed` có thể đã xuất hiện ở catalog cũ nhưng Theme 5 được phép dạy lại khi
  lesson cần đứng độc lập. Không tối ưu uniqueness toàn app.
- Từ cũ xuất hiện lại trong lesson sau mặc định là Quick Recall hoặc Action Enabler, không mở lại
  first-production flow. Story reprise chỉ dành cho hai anchor trọng tâm của chính lesson hiện
  tại.

## 7. Pilot contract — `feed-the-puppy`

Mốc 5B đã khóa exact storyboard theo ba scene sau:

1. **`meet-the-puppy`:** làm quen, chào cún và nhận ra cún đang đói.
2. **`fill-the-bowl`:** đặt bát lên thảm, thêm phần thức ăn người lớn chuẩn bị và kiểm tra bữa ăn.
3. **`puppy-eats`:** đặt bát xuống, để cún ăn và thực hành lùi lại an toàn.

Pilot khóa vocabulary 9/18/27, 18/36/54 meaningful actions, 9/18/27 pronunciation encounter và
9/12/15 lượt auto-micro. Mỗi từ chỉ mở một pronunciation encounter; practice ngay sau đó phải
trực tiếp áp dụng nghĩa.

Exact copy, state timing, review và asset inventory đã khóa tại
`docs/theme-5-feed-the-puppy-storyboard.md`. Payoff sau lượt nói dùng
`afterSuccessStateChanges`, được áp dụng khi bé rời speech panel; không mô tả payoff như bằng
chứng engine đã nhận diện bé phát âm đúng.

Pilot phải dùng một hero puppy nhất quán về màu lông, vòng cổ và silhouette ở cả ba scene. Scene
State v1 không truyền state qua scene, nên mỗi scene tự author initial picture nối logic từ end
state trước.

### Lesson 2 contract — `play-with-the-puppy`

Storyboard `docs/theme-5-play-with-the-puppy-storyboard.md` khóa ba scene `choose-the-ball` ->
`roll-and-catch` -> `bring-it-back`. Lesson giữ vocabulary/action/pronunciation budget 9/18/27,
18/36/54 và 9/18/27; auto-micro 9/12/15; review executable 4/5/6. Chỉ `roll` dùng drag một lần,
cún không bao giờ là drag target, và state tiến theo chọn bóng -> lăn -> bắt -> mang về -> trao
bóng. Vertical slice có 33 PNG/WebP runtime asset cùng bốn bundled icon. Google TTS đã tạo 508
clip còn thiếu; audio audit 613 target có missing 0, invalid 0. R2 upload và verify 541/541 object,
lỗi 0; post-upload dry-run còn `Changed/new: 0`.

### Lesson 3 contract — `find-the-kitten`

Storyboard `docs/theme-5-find-the-kitten-storyboard.md` khóa ba scene `hear-the-kitten` ->
`check-the-hiding-spots` -> `welcome-the-kitten`. Lesson giữ vocabulary/action/pronunciation
budget 9/18/27, 18/36/54 và 9/18/27; auto-micro 9/12/15; review executable 4/5/6. Bé nghe tiếng
`meow`, theo dấu chân, kiểm tra hộp/giỏ không có mèo, nhận ra mèo đang trốn rồi gọi bạn bước ra.
Các cue Challenge `look under the box` và `look behind the basket` luôn minh họa chỗ trống để
không tự mâu thuẫn với feedback; scene cuối giữ hành vi an toàn `hold out your hand` -> chờ mèo
tự đến -> `pet gently`. Vertical slice có 40 PNG/WebP runtime asset cùng bốn bundled icon; cutout
được tách theo component để không dính hình ở ô bên cạnh. Google TTS đã tạo 520 clip production;
full-corpus audit có 14.279 target với missing 0, invalid 0. R2 upload/verify đủ 560/560 object,
lỗi 0; post-upload dry-run còn `Changed/new: 0`.

### Lesson 4 contract — `clean-muddy-paws`

Storyboard `docs/theme-5-clean-muddy-paws-storyboard.md` khóa ba scene
`notice-the-muddy-paws` -> `wash-the-paws` -> `dry-the-paws`. Lesson giữ
vocabulary/action/pronunciation budget 9/18/27, 18/36/54 và 9/18/27; auto-micro 9/12/15;
review executable 4/5/6. Core tự khép kín chuỗi nhìn chân dính bùn -> rửa sạch -> lau khô;
Expanded/Challenge nối thêm chờ người lớn, kiểm tra nước có bùn, dọn chậu và rửa tay mà không
đưa state về bẩn hoặc lặp thao tác rửa. Vertical slice có 37 PNG master, 37 WebP runtime cùng
bốn bundled icon. Google TTS đã tạo 512 clip production; full-corpus audit có 14.791 target,
missing 0 và invalid 0. R2 upload/verify đủ 549/549 object, lỗi 0; post-upload dry-run còn
`Changed/new: 0`.

## 8. Interaction and visual guardrails

- Target đang được yêu cầu là affordance nổi bật duy nhất. Distractor không nhấp nháy cùng đáp
  án; Auto-Hint chỉ pulse đúng target sau khi hết thời gian chờ.
- Hành động đúng mới đổi state. Hành động sai không làm mất object hoặc phát trước payoff.
- Sau khi một lựa chọn hoàn thành vai trò, chỉ ẩn những object thực sự đã được dùng; không làm
  biến mất cả nhóm nếu cảnh tiếp theo còn cần continuity.
- Cutout text-free, alpha thật, không nền đen/chroma/card/caption và có padding đủ để animation
  không cắt mép.
- Background giữ phong cách mềm, sáng nhưng vùng gameplay phải ít chi tiết và đủ tương phản với
  cún, bát, thức ăn cùng controls.
- Không dùng icon hành động trừu tượng trước khi hành động đó đã được demo bằng hình.
- Completion art là payoff, không cài thêm từ mới hoặc yêu cầu ghi âm.

## 9. Animal-care safety

- Các con vật là thú cưng quen thuộc trong nhà hoặc khu chăm sóc có người lớn; không ngụ ý mọi
  động vật đều an toàn để chạm.
- Không kéo tai/đuôi, ôm ép, đuổi bắt hoặc chạm trực tiếp khi con vật đang ăn/ngủ.
- Thức ăn/nước đã được người lớn chuẩn bị. Rabbit scene dùng cỏ khô và nước làm thức ăn chính;
  cà rốt chỉ là phần nhỏ đã chuẩn bị, không mô tả là khẩu phần duy nhất.
- Rửa chân là thao tác chăm sóc nhẹ với người lớn, không có thuốc, hóa chất, nước nóng hoặc tắm
  toàn thân một mình.
- Parent tip nhắc trẻ hỏi người lớn trước khi cho vật nuôi ăn và rửa tay sau khi chăm sóc.

## 10. Child-test gate before scaling

Không author đồng loạt năm lesson còn lại trước khi pilot qua child test. Một lượt thử đạt khi:

1. Bé hoàn thành core story mà người lớn không cần chỉ tay hoặc diễn giải lại nhiệm vụ.
2. Phần lớn target được tìm trước Auto-Hint; chỗ cần hint phải xác định được là copy, visual hay
   hitbox issue.
3. Bé hiểu hành động kế tiếp từ audio và scene state, không dựa vào chữ English.
4. Bé thử ít nhất bốn trong sáu guided speech turns; nếu bỏ lượt, ghi nhận nguyên nhân là nhịp,
   micro UX hay từ chưa rõ nghĩa.
5. Không có recording panel liền nhau hoặc object thừa gây hiểu nhầm target.
6. Bé có thể kể lại bằng tiếng Việt chuỗi đơn giản “lấy bát -> cho thức ăn -> cún ăn”.

Child test đầu tiên phải có ít nhất một bé 3–5 tuổi; kết quả của riêng bé 6 tuổi không đủ chứng
minh pre-reader floor nhưng vẫn là tín hiệu quan trọng cho expanded path.

## 11. Delivery milestones

1. **5A — Content architecture:** tài liệu này; chưa đổi runtime catalog.
2. **5B — Pilot storyboard:** đã khóa exact copy, vocabulary, speech reprises, state map, review
   và asset inventory cho `feed-the-puppy` tại
   `docs/theme-5-feed-the-puppy-storyboard.md`.
3. **5C — Vertical slice:** v1 đã author lesson, tests, 33 production masters/WebP, bốn bundled
   map icons và một theme icon; v2 đã reauthor data/test và thêm chín cutout vào local pipeline.
4. **5D — Production delivery:** Google TTS đã tạo 480 clip còn thiếu; audio audit v2 có 626
   target, thiếu 0 và lỗi 0. R2 đã upload delta 490 object, verify đủ 801/801 object với lỗi 0;
   bản tối ưu cue-anchor sau đó upload thêm 6 WebP. Tập authoring hiện hành verify đủ 798/798
   object với lỗi 0 và post-upload dry-run còn `Changed/new: 0`; không xóa key cũ khỏi bucket.
   Revision meal/cleanup đã tạo thêm 36 clip Google TTS; audio audit có 629 target, thiếu 0 và lỗi
   0. R2 đã upload delta 36 audio, verify đủ 834/834 object với lỗi 0 và post-upload dry-run còn
   `Changed/new: 0`. Revision hình bát trống đã publish thêm năm WebP; R2 verify đủ 835/835 object
   với lỗi 0 và post-upload dry-run còn `Changed/new: 0`.
5. **5E — Child test/template freeze:** `feed-the-puppy` và `play-with-the-puppy` đã được xác
   nhận hoàn tất sau device QA; lesson 3 `find-the-kitten` đã author và publish theo template đã
   tinh chỉnh. Lesson 4 `clean-muddy-paws` đã author và publish production assets, đang chờ
   device QA. Lesson 5–6 vẫn chưa author.

Catalog order, free/premium access và theme map layout chỉ thay đổi trong task runtime tương ứng;
Mốc 5A không ngầm quyết định các contract đó.
