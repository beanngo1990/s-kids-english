# Theme 4 Content Architecture v2 - Khu vườn của bé

**Freeze date:** 2026-08-13

**Status:** Content architecture và cả bốn storyboard sau pilot đã khóa. Runtime hiện đăng ký đủ
năm lesson `plant-a-seed`, `help-it-grow`, `garden-friends`, `harvest-day` và
`garden-to-table`. Storyboard cuối nằm tại `docs/theme-4-garden-to-table-storyboard.md`.

**Scope:** Theme `khu-vuon-cua-be` / “Khu vườn của bé” / “My Little Garden”.

Tài liệu này thay thế blueprint tám lesson trước đây. Mốc 4A khóa hành trình năm lesson, vai trò
từ vựng, ngân sách nội dung, nhịp tương tác, cách phân bổ lại nội dung cũ và ranh giới an toàn.
Tài liệu cấp theme này là kiến trúc tổng; exact English targets, copy, object/step/variant ID và
asset inventory của từng vertical slice nằm trong storyboard riêng tương ứng.

## 1. Current state và phạm vi freeze

### Runtime hiện tại

- Theme runtime hiện có đủ năm lesson theo thứ tự đã khóa.
- Pilot có ba scene `prepare-the-pot` -> `plant-the-seed` -> `first-watering` và dùng Scene State
  v1 cho object variants, show/hide và success-only state changes.
- `help-it-grow` đã có lesson data, production PNG masters, bundled icons và 39 ảnh runtime đang
  được tham chiếu; WebP `stake` cũ được giữ lại như một orphan local để không xóa asset ngoài phạm
  vi audit.
  Vocabulary-first revision ngày 2026-08-25 nâng vocabulary/pronunciation lên 8/12/16, khóa nhịp
  meaningful turn 21/27/34 và giữ review 4/5/6. Google TTS tạo đúng 58 audio delta; lesson/full
  corpus audit đạt 439/16.012 target với missing 0, invalid 0. R2 upload 59 object gồm audio và
  một WebP rebuild, verify đủ 401/401, post-upload delta bằng 0; CDN smoke audio mới khớp local.
- `garden-friends` đã có lesson data, storyboard, production PNG masters, bundled icons và 35
  WebP. Vocabulary-first revision ngày 2026-08-25 nâng vocabulary/pronunciation lên 8/12/16,
  khóa nhịp meaningful turn 19/25/34 và giữ review 4/5/6. Google TTS tạo đúng 78 audio delta;
  lesson/full-corpus audit đạt 432/16.090 target với missing 0, invalid 0. R2 verify đủ 455/455,
  post-upload delta bằng 0; CDN smoke audio mới khớp local.
- `harvest-day` đã có lesson data, storyboard, production PNG masters, bundled icons, 34 WebP và
  413 audio production. Vocabulary-first revision ngày 2026-08-25 giữ nhịp 18/27/36 meaningful
  turns nhưng nâng vocabulary và pronunciation encounter lên 8/12/16; review vẫn là 4/5/6.
  Google TTS tạo đúng 46 audio delta; R2 upload 46 object, verify đủ 447/447 và post-upload dry-run
  còn `Changed/new: 0`.
- `garden-to-table` đã có lesson data, storyboard, 38 production PNG masters (35 cutout và ba
  background), 37 WebP được runtime tham chiếu, bốn bundled icons và review 4/5/6.
  Vocabulary-first revision nâng vocabulary/pronunciation lên 8/12/16 và nhịp meaningful turn lên
  21/28/35. Visual QA correction retire pointer-hand sai ngữ nghĩa, dùng hình phong bì trên kệ cho
  `store it for next season` và cho safety action chạm phong bì đã đóng. Google TTS tạo 69 audio ở
  revision đầu và thêm đúng 12 audio correction; lesson/full-corpus audit đạt 443/15.969 target với
  missing 0, invalid 0. R2 upload thêm 14 object correction, verify đủ 404/404 asset và post-upload
  dry-run còn `Changed/new: 0` ngày 2026-08-25. Follow-up audit cho xà lách sạch một lượt
  vào rổ riêng trước dưa leo đã được publish trong full-corpus delta cuối ngày.
- Follow-up correctness audit hiện đã publish: `help-it-grow` dạy cọc/dây trên trạng thái đã lắp,
  `garden-friends` gom cây/ong/bướm thành
  một cụm nghĩa trực tiếp, `harvest-day` bổ sung representative cho năm anchor, và
  `garden-to-table` thêm lượt xà lách riêng. Full-corpus audio audit đạt 16.156 target, thiếu 0 và
  lỗi 0; R2 upload chung 285 object, verify đủ 21.296/21.296 với 0 lỗi và post-upload delta bằng 0.
  Cả bốn correction vẫn chờ device smoke test.
- Free tier hiện vẫn chỉ gồm `morning-routine` và `at-school`; Mốc 4A không đổi access policy.

### Đã khóa ở Mốc 4A

- Theme có năm lesson và giữ `plant-a-seed` ở vị trí mở đầu.
- Lesson ID, thứ tự và outcome cấp lesson trong mục 6.
- Ba vai trò `New Anchor`, `Quick Recall`, `Action Enabler` và cách map vào lesson schema hiện có.
- Ngân sách từ mới, luyện nói, nhịp nhanh/chậm và review cho các lesson sau pilot.
- `garden-ready`, `garden-weather`, `garden-cycle` không còn là lesson độc lập.
- Cách phân bổ hoặc loại bỏ nội dung từ ba blueprint đã nghỉ trong mục 9.
- Visual, safety, pre-reader và factual contracts áp dụng cho toàn Theme 4.

### Ownership sau khi các vertical slice đã khóa

- Mốc 4A vẫn sở hữu thứ tự, outcome, vai trò từ vựng, nhịp và safety guard cấp theme.
- Storyboard của từng lesson sở hữu exact targets, copy, ID, state map, review và asset inventory.
- Code, validator và generated manifest là nguồn của hành vi/runtime asset hiện đang chạy.

Các ID đã author trong `plant-a-seed` vẫn frozen. Đổi chúng cần task rename/migration cùng asset
và audio plan riêng.

## 2. Product and learning goals

### Target theme metadata

Mốc 4A khóa copy mục tiêu dưới đây nhưng không sửa runtime catalog; metadata hiện hành chỉ được
đổi cùng task đăng ký lesson tiếp theo để tránh mô tả planned content như đã phát hành.

- Theme ID: `khu-vuon-cua-be`.
- `titleVi`: `Khu vườn của bé`.
- `titleEn`: `My Little Garden`.
- `descriptionVi`: `Bé gieo hạt, chăm cây, khám phá khu vườn, thu hoạch và bắt đầu một mùa mới.`
- `descriptionEn`: `Plant a seed, care for it, explore the garden, harvest, and begin again.`
- `thumbnailEmoji`: `🌱`.
- Bundled theme icon key: `themeLittleGarden`.

### Learning outcomes

Sau theme, bé được làm quen với ba lớp kiến thức:

1. **English in action:** từ mới xuất hiện đúng lúc bé cần dùng hoặc vừa khám phá đối tượng.
2. **Sequence and cause:** hành động của bé tạo ra kết quả nhìn thấy được, nhưng tăng trưởng vẫn có
   cue thời gian hợp lý.
3. **Care and safety:** bé quan sát nhẹ nhàng, dùng công cụ an toàn và nhờ người lớn với việc vượt
   quá khả năng.

### Child-first principles

- Bài mở đầu phải cho kết quả hấp dẫn sớm. `plant-a-seed` được giữ ở vị trí 1 vì chuỗi đất -> hạt
  -> nước -> mầm có hành động và phần thưởng trực quan mạnh hơn một bài chuẩn bị quần áo/dụng cụ.
- Theme không tối ưu cho số lượng English strings duy nhất. Gặp lại một từ trong vai trò mới có
  giá trị hơn liên tục thêm từ mới.
- Từ cũ không mặc định chạy lại luồng giải nghĩa, model word và ghi âm.
- Trẻ được giữ một ngữ pháp tương tác ổn định, nhưng nhịp nội dung phải thay đổi giữa học sâu,
  hành động nhanh, khám phá, suy luận thứ tự và ăn mừng.
- `core` phải tự đủ cho trẻ nhỏ nhất. Runtime hiện chưa truyền child age vào lesson filtering nên
  không được dựa vào `minAge` để cứu một core path quá khó.
- Onboarding đang preselect `expanded`, nên expanded là một primary pre-reader path thực tế chứ
  không chỉ là enrichment cho trẻ lớn. Cả core và expanded phải được child-path QA riêng trên
  Android; concept trừu tượng chỉ vào expanded khi hình/lời Việt chứng minh được nghĩa rõ.

## 3. Vocabulary-role contract

Ba vai trò dưới đây là authoring semantics, không phải field mới trong `src/types/lesson.ts`.

| Role | Mục đích | Mapping vào schema hiện tại | Speech và review |
| --- | --- | --- | --- |
| **New Anchor** | Dạy một từ/cụm mới có vai trò quan trọng trong scene. | Có `VocabularyItem`, object/step có `vocabId`; có một encounter giải nghĩa rõ. | Core dùng `auto`; expanded thường `optional`; chỉ New Anchor được đưa vào lesson review pool. |
| **Quick Recall** | Gọi lại một khái niệm/từ đã gặp qua lựa chọn hoặc hành động ngắn. | Object/step không tạo `VocabularyItem` trùng trong lesson mới; cue Việt và hình dẫn thao tác. `promptText` chỉ thêm context cho English teacher prompt, không tự phát model word độc lập ở Vietnamese mode. | Không mở speech practice, không tính như learned word mới, không vào review pool. |
| **Action Enabler** | Là công cụ/đạo cụ giúp câu chuyện tiến lên và tạo kết quả tức thì. | Scene object tương tác thường, không cần `vocabId`; có thể chỉ được gọi bằng lời Việt và dấu hiệu hình ảnh. | Không model word bắt buộc, không ghi âm, không review. |

### Quy tắc dùng lại từ

- “Từ cũ” trong Theme 4 ưu tiên nghĩa là từ đã được giới thiệu ở lesson trước trong cùng hành
  trình, không chỉ là exact string tồn tại ở một theme khác.
- Một từ ở mode cao hơn chỉ được Quick Recall trong cùng hoặc mode cao hơn. Ví dụ từ expanded của
  pilot không trở thành prerequisite của core lesson sau.
- `journeyMode: free` có thể cho bé vào lesson mà chưa học lesson trước. Vì vậy mọi Quick Recall
  vẫn phải giải được bằng hình và lời Việt; nhớ English giúp bé nhanh hơn nhưng không được là điều
  kiện ẩn để hoàn thành.
- Nếu một từ app-wide đã tồn tại nhưng Theme 4 cần dạy nó để scene đứng độc lập, từ đó vẫn có thể
  là New Anchor trong lesson hiện tại. Uniqueness toàn catalog không phải KPI.
- Với engine hiện tại, Quick Recall không phải một lượt kiểm tra khả năng nghe English độc lập.
  Muốn audio English bắt buộc mà không tạo learned-word/review semantics cần một capability
  non-progress model-word riêng trong task tương lai; Mốc 4A không giả lập bằng cách trộn English
  vào `instructionVi`.
- Không áp quota 30-40% từ cũ cho từng lesson. Ở cấp toàn theme, content review chỉ kiểm tra từ
  trụ cột có tái xuất trong ngữ cảnh có ý nghĩa, không ép mọi từ lặp lại ở mọi bài.
- Một New Anchor đã học chỉ chạy lại deep-teach flow khi có product decision tường minh; mặc định
  lần gặp sau là Quick Recall hoặc Action Enabler.

### Ví dụ chuẩn cho lesson sau pilot

```text
Cây đang rũ
  -> bé kéo bình tưới tới cây (New Anchor `watering can`, phát âm sau hành động có nghĩa)
  -> cây tươi hơn ngay; cue ngày-đêm cho thấy thời gian trôi qua
  -> cây xòe leaf mới (New Anchor, học sâu và nói)
  -> bé đưa cây tới sunlight (New Anchor, học sâu và nói)
  -> lá mở rộng và scene ăn mừng
```

Revision `help-it-grow` chọn dạy `watering can` thay vì lặp lại `water`: hình bình tưới và thao tác
kéo làm nghĩa cụ thể, đồng thời tạo thêm một pronunciation target mới có giá trị.

## 4. Learning-mode và content budgets

Các ngân sách này áp dụng khi một lesson được vocabulary-first revise; không hồi tố thay cấu trúc
3/5/7 target mỗi scene của `plant-a-seed` hoặc tự làm các lesson chưa revision sai contract.

### New Anchor budget cho mỗi lesson ba scene được vocabulary-first revise

- `core`: 8 New Anchors tổng cộng.
- `expanded`: thêm 4 New Anchors, tổng 12.
- `challenge`: thêm 4 New Anchors/action phrases, tổng 16.
- Sau khi lọc `learningScope`, `VocabularyItem.level` và image availability, mỗi lesson phải còn
  ít nhất 4/5/6 New Anchors có hình phân biệt rõ cho `core`/`expanded`/`challenge`. Không dùng hai
  state variants gần giống của cùng object để giả lập hai review items.
- Đây là authoring target cho `harvest-day` và các lesson được revision tiếp theo, không phải
  validator toàn theme và không làm lesson chưa revision sai contract chỉ vì còn ngân sách cũ.

### Recall và action budget

- Mỗi lesson nên có khoảng 3-5 nhóm concept Quick Recall/Action Enabler ở core; một concept có thể
  tái xuất hiện khi câu chuyện cần nhưng không mở lại deep-teach. Các discovery control chỉ có ở
  expanded không được tính thành từ mới.
- Mọi deep-learn/speech-practice panels, kể cả `optional`, phải được ngăn bởi một hành động hoặc
  visual payoff có ý nghĩa; không đặt hai pronunciation panels liền nhau.
- Secondary expanded targets mặc định `optional`; chỉ dùng `auto` khi từ đó thực sự là production
  anchor của scene.
- Challenge phrase phải được dạy nghĩa bằng hình/lời Việt trước review; không chỉ hiện một phrase
  card cho trẻ chưa biết đọc.
- Expanded candidates như `moisture`, `pollen`, `nectar` hoặc `seed envelope` không được giữ chỉ
  vì có trong candidate list; vertical slice phải chứng minh hình ảnh cụ thể và pre-reader value.

## 5. Interaction rhythm contract

### Ngữ pháp ổn định

- Một instruction chỉ có một ý và một hành động.
- Tap/find/drag tiếp tục dùng cùng affordance, feedback và Auto-Hint của engine.
- Practice/review bắt đầu trung tính; đáp án nhiễu không nhấp nháy. Auto-Hint hoặc replay cue chỉ
  làm chuyển động `correctObjectIds`/`targetObjectId`.
- Success mới đổi scene state; incorrect interaction không làm mất/hiện/move/đổi variant object.
- Bé luôn có thể hiểu target bằng audio và hình, không phải đọc title, English word hoặc
  `meaningVi`.
- Scene State v1 reset khi đổi scene. Mỗi scene tự author initial continuity state hợp lý từ scene
  trước bằng asset/copy, không dựa vào state runtime được mang qua. Weather/soil beat là tình
  huống có đáp án được author trước, không phải mô phỏng branching hoặc arbitrary variables mà
  engine hiện chưa có.

### Năm micro-flow archetypes

1. **Deep Learn:** nhìn/hiểu nghĩa -> nghe English -> hành động -> nói -> thấy kết quả.
2. **Quick Action:** một cue ngắn -> tap/drag -> SFX/state response trong vài giây.
3. **Discovery:** bé hành động trước -> vật mới xuất hiện -> lúc đó mới gọi tên và học sâu.
4. **Sequence Check:** chọn hoặc làm bước tiếp theo trong chuỗi nhân-quả.
5. **Celebration:** animation/SFX/completion beat không đặt thêm yêu cầu học hay ghi âm.

Deep Learn là default cho New Anchor, không phải template cho 100% step. Một nhịp tham khảo là:

```text
Quick Action -> Deep Learn -> Discovery -> Quick Action -> Deep Learn -> Celebration
```

Author được thay đổi thứ tự khi câu chuyện cần, nhưng mỗi core scene phải có:

- một mục tiêu cụ thể;
- thường 5-8 meaningful turns; lesson ba scene hướng tới floor 18/27/36 cho
  core/expanded/challenge sau khi storyboard riêng được pacing-revise;
- ít nhất một end state nhìn thấy được;
- ít nhất một fast beat hoặc delight beat không mở micro;
- không quá hai listen steps liên tiếp trước khi bé được hành động.

Meaningful turn phải làm state/câu chuyện tiến triển, kiểm tra quan sát/thứ tự, gọi lại concept
trong ngữ cảnh mới hoặc tạo payoff do bé chủ động kích hoạt. Intro, transition thụ động,
celebration tự chạy và tap chỉ để tiếp tục không được dùng để đạt floor. Floor 18/27/36 là hướng
pacing theo từng storyboard, không tự động làm các lesson chưa revision sai validation; pilot
`harvest-day` khóa scene rhythm 6/6/6, 9/9/9 và 12/12/12 trước khi áp dụng cho lesson tiếp theo.

## 6. Frozen five-lesson journey

| Order | Lesson ID | Lesson title | Story beats | Lesson outcome |
| --- | --- | --- | --- | --- |
| 1 | `plant-a-seed` | Bé gieo hạt / Plant a Seed | Chuẩn bị chậu -> gieo hạt -> tưới lần đầu | Bé tạo độ ẩm vừa đủ và thấy mầm xuất hiện sau cue thời gian. |
| 2 | `help-it-grow` | Giúp cây lớn lên / Help It Grow | Lá và ánh nắng -> chăm cây ngày mưa -> đỡ cây ngày gió | Bé dùng dấu hiệu của cây/thời tiết để giúp cây có thêm lá và đứng vững. |
| 3 | `garden-friends` | Bạn nhỏ trong vườn / Garden Friends | Bạn dưới đất -> ong và bướm -> quan sát nhẹ nhàng | Bé khám phá sinh vật trong vườn mà không kéo/chạm trực tiếp vào chúng. |
| 4 | `harvest-day` | Ngày thu hoạch / Harvest Day | Nhận biết đồ chín -> hái nhẹ -> phân loại | Bé để đồ chưa chín lại trên cây và thu hoạch an toàn bằng tay. |
| 5 | `garden-to-table` | Từ vườn tới bàn ăn / Garden to Table | Rửa -> làm/chia sẻ món nguội -> giữ hạt | Bé thưởng thức thành quả cùng người lớn và nối lại vòng đời bằng một hạt cho mùa mới. |

Theme hoàn chỉnh dự kiến có 15 mini-scenes, 15 scene icons và 5 milestone icons. Một hero plant
lineage được Mốc 4B khóa là cây cà chua và phải giữ silhouette/tiến trình xuyên theme;
rau quả khác ở bài thu hoạch phải xuất hiện rõ là từ luống/cây khác, không ngụ ý một hạt duy nhất
biến thành nhiều loài. Các con vật trong `garden-friends` là “bạn/hàng xóm trong vườn”; copy không
khẳng định mọi loài đều trực tiếp giúp cây. Con số scene/icon là planning target; chỉ asset thực
sự được author mới được thêm vào catalogs/manifests.

## 7. `plant-a-seed` - implemented opening lesson

`plant-a-seed` giữ nguyên vị trí đầu và contract runtime hiện có:

- `prepare-the-pot`: chậu `empty -> soil-low -> soil-ready`.
- `plant-the-seed`: đất `flat -> hole-open -> seed-visible -> covered`.
- `first-watering`: đất `dry -> damp`; mầm chỉ hiện sau cue ngày-đêm; success path giữ puddle ẩn.
- Review `random` dùng bốn anchor hình rõ.
- Pilot có 21 vocabulary items và cho mỗi item một auto speech-practice encounter. Đây là ngoại
  lệ lịch sử đã được kiểm thử, không phải production template cho các lesson tiếp theo.

Scene IDs, asset, audio và speech behavior của pilot không đổi; metadata tuổi hiện hiển thị
`6-8 tuổi · Nâng cao` để phụ huynh nhận biết content track của toàn Theme 4.

## 8. Content contracts cho các lesson tiếp theo

Cả bốn lesson sau pilot đã có storyboard riêng với exact contract. Mục này giữ bản tóm tắt cấp
theme; storyboard tương ứng có ưu tiên khi mô tả chi tiết vertical slice.

### 8.1 `help-it-grow`

**Purpose:** nối trực tiếp từ mầm của pilot, gộp chăm cây với nắng/mưa/gió và tạo payoff là cây có
thêm lá, đứng thẳng và nở một bông hoa vàng sau cue thời gian.

**Required beats:**

1. Dùng `watering can`, khám phá `leaf`, `sunlight` và cách `move into sunlight`.
2. Quan sát `rain`, `soil`, `roots`, rồi học `check the soil` và
   `wait for the rain to stop` trước khi can thiệp.
3. `wind` làm cây nghiêng; bé nhận biết `stem`, `stake`, `soft tie`, giúp cây đứng vững và tìm
   `flower` đã nở.

**Frozen New Anchors:**

- Core (8): `watering can`, `leaf`, `sunlight`, `rain`, `soil`, `flower`, `wind`, `stem`.
- Expanded (thêm 4): `shade`, `roots`, `stake`, `soft tie`.
- Challenge (thêm 4): `move into sunlight`, `check the soil`, `wait for the rain to stop`,
  `support the stem`.

**Frozen Quick Recall/Action Enablers còn lại:** chậu cùng các đích kéo, vòng thời gian, mái che,
mây, que đỡ rời và dây buộc rời ở core. Hai object rời không mở deep-teach/recording flow; bản đã
lắp cạnh thân cây mới là target cho `stake` và `soft tie` ở expanded. Nếu bé vào lesson theo free
journey, cue Việt và hình vẫn phải đủ để thao tác.

**Frozen scene IDs:** `new-leaf-and-sunlight` -> `rainy-day-care` -> `wind-and-support`.

**State direction:** cây rũ -> được tưới -> tươi hơn ngay -> cue thời gian -> lá mở; cây gặp gió
-> nghiêng -> được đỡ -> đứng thẳng -> cue thời gian -> bông hoa vàng nở. Rain, sunlight hoặc water không
làm cây lớn tức thì. Mỗi weather scene dùng một tình huống được author sẵn; không yêu cầu runtime
mô phỏng độ ẩm hoặc rẽ nhánh theo lịch sử tưới.

Exact lesson metadata, IDs, VI/EN copy, speech policy, state map, review 4/5/6 và asset inventory
nằm trong `docs/theme-4-help-it-grow-storyboard.md`; tài liệu đó có ưu tiên cho vertical slice này.

### 8.2 `garden-friends`

**Purpose:** chuyển từ chăm cây sang khám phá hệ sinh thái, ưu tiên bất ngờ thị giác và quan sát
không xâm lấn.

**Required beats:**

1. Nâng mép lá/quan sát lớp đất để khám phá sinh vật dưới đất, sau đó đặt lại nhẹ nhàng.
2. Theo dõi ong và bướm ghé hoa từ khoảng cách an toàn.
3. Tìm các bạn nhỏ khác bằng giọng nhỏ và đôi tay đứng yên.

**Frozen New Anchors:**

- Core (8): `leaf`, `earthworm`, `snail`, `flower`, `bee`, `butterfly`, `fruit`, `caterpillar`.
- Expanded (thêm 4): `tunnel`, `wings`, `water drop`, `birdbath`.
- Challenge (thêm 4): `shell`, `look under the leaf`, `visit the flower`, `watch gently`.

`leaf` và `flower` được dạy lại có chủ đích trong lesson này vì `journeyMode: free` cho phép mở
lesson độc lập, còn hai từ là tiền đề trực tiếp cho `look under the leaf` và `visit the flower`.
Đây là ngoại lệ prerequisite đã ghi rõ, không phải quy tắc lặp lại mọi anchor giữa hai lesson.

**Recall/enabler còn lại:** `soil`, kính lúp, time cue và các control môi trường. Animal objects
không draggable; bé chạm vùng quan sát hoặc môi trường, không chạm/kéo trực tiếp con vật.

**State direction:** vật che `closed -> lifted -> replaced`; animal `hidden -> visible`; flower
visit chỉ tạo pollination/growth payoff sau cue thời gian.

**Frozen scene IDs:** `under-the-leaf` -> `flower-visitors` -> `quiet-garden-watch`. Exact lesson
metadata, VI/EN copy, speech policy, review 4/5/6, safety interaction targets và asset inventory
nằm trong `docs/theme-4-garden-friends-storyboard.md`; tài liệu đó có ưu tiên cho vertical slice.

### 8.3 `harvest-day`

**Purpose:** tạo payoff lớn sau quá trình chăm cây, giúp bé nhận biết đồ sẵn sàng thu hoạch và giữ
đồ chưa chín trên cây.

**Required beats:**

1. So sánh nhiều dấu hiệu để tìm đồ chín, không chỉ dựa vào màu.
2. Hái nhẹ bằng tay và đặt vào giỏ; không dùng kéo hoặc dao.
3. Phân loại thành quả và để món bị dập sang vùng người lớn kiểm tra.

**Vocabulary-first New Anchors:**

- Core: `tomato`, `ripe`, `unripe`, `pick`, `basket`, `vegetable`, `herb`, `carrot`.
- Expanded: thêm `red`, `fruit stem`, `gentle`, `bruised`.
- Challenge: thêm `leave it on the plant`, `branch`, `sort by type`, `separate`.

**Recall/enabler candidates:** `leaf`, `stem`, `garden gloves`. Các mục này chỉ làm visual/action
enabler; không được đưa vào vocabulary nếu không có pronunciation encounter và hình nghĩa rõ.

**State direction:** hai ripe produce `on-plant -> picked`; basket `empty -> one tomato -> two
tomatoes`; unripe produce và cây chính giữ nguyên, không rung mạnh hoặc mất cành. Pacing revision
khóa rhythm 6/6/6, 9/9/9 và 12/12/12 theo ba scene; vocabulary/pronunciation là 8/12/16 trong khi
review pool vẫn giữ 4/5/6 để game ngắn và executable.

**Frozen scene IDs:** `find-the-ripe-ones` -> `pick-gently` -> `sort-the-harvest`. Exact lesson
metadata, VI/EN copy, speech policy, review 4/5/6, safety state changes và asset inventory nằm
trong `docs/theme-4-harvest-day-storyboard.md`; tài liệu đó có ưu tiên cho vertical slice.

### 8.4 `garden-to-table`

**Purpose:** rửa, dùng thành quả trong món nguội cùng người lớn, chia sẻ và kết thúc bằng một hạt
được giữ lại để nối về đầu theme.

**Required beats:**

1. Rửa rau quả bằng nước sạch và để ráo.
2. Làm/chia sẻ món nguội với nguyên liệu người lớn đã chuẩn bị an toàn.
3. Giữ một hạt khô vào phong bì; completion art nối lại chậu/hạt ở đầu theme.

**Vocabulary-first New Anchors:**

- Core: `cucumber`, `rinse`, `lettuce`, `bowl`, `salad`, `share`, `spoon`, `seed`.
- Expanded: thêm `colander`, `kitchen towel`, `cucumber slices`, `envelope`.
- Challenge: thêm `rinse it well`, `mix the salad`, `save the seeds`,
  `store it for next season`.

**Recall/enabler candidates:** `water`, `basket`, `soil`. `seed` ở final beat được nâng thành core
anchor có pronunciation vì nó là payoff vòng đời; hạt vẫn do người lớn cầm và cất.

**State direction:** cucumber/lettuce `dirty -> clean`; expanded colander `empty -> lettuce
visible -> filled`; bowl `empty -> with-lettuce -> prepared -> mixed -> shared`; seed envelope
`empty -> filled -> closed -> stored`. Completion visual trở lại hình hạt/chậu nhưng không reset
runtime progress.

**Frozen scene IDs:** `rinse-and-drain` -> `make-and-share` -> `save-for-next-season`. Exact
metadata, VI/EN copy, speech policy, review 4/5/6, safety rules, state changes và asset inventory
nằm trong `docs/theme-4-garden-to-table-storyboard.md`.

## 9. Retired blueprint redistribution

Ba lesson ID dưới đây đã bị loại khỏi future catalog trước khi runtime registration; không cần
migration persisted data:

- `garden-ready`
- `garden-weather`
- `garden-cycle`

| Retired content | New home | Role/policy |
| --- | --- | --- |
| Weather check | Mở đầu các beat nắng/mưa/gió trong `help-it-grow` | Visual cue hoặc Quick Recall, không là lesson riêng. |
| `sun hat`, `garden boots` | Weather art trong `help-it-grow` khi phù hợp | Props/Action Enablers; chỉ thành New Anchor nếu vertical slice chứng minh cần thiết. |
| `garden gloves` | `harvest-day` hoặc safety art | Familiar visual enabler, không chặn core path. |
| `trowel`, `watering can`, tool basket | Cảnh cần công cụ | Action Enablers; không có bước gom dụng cụ bắt buộc. |
| Hot/rain/wind care | Ba story beats của `help-it-grow` | Chỉ giữ tình huống cây nhỏ, an toàn và có dấu hiệu rõ. |
| Fallen branch/extreme-weather hazards | Parent tip hoặc loại bỏ | Không biến thành child interaction target. |
| Save seeds | Scene cuối `garden-to-table` | Payoff vòng đời; `seed` là core anchor nhưng vẫn do người lớn xử lý. |
| Compost và clean-tools flows | Không bắt buộc trong Theme 4 v2 | Có thể xuất hiện như completion art nhanh; không giữ target budget nếu làm pacing dài. |
| Shelf/label/storage details | Expanded final scene nếu cần | Không làm core closure phụ thuộc khả năng đọc nhãn. |

Không cố giữ mọi từ của blueprint cũ. Một concept chỉ được chuyển sang lesson mới khi nó phục vụ
câu chuyện, state change hoặc safety; không chuyển chỉ để bảo toàn target count lịch sử.

## 10. Identifier contract

- Frozen lesson IDs theo thứ tự: `plant-a-seed`, `help-it-grow`, `garden-friends`, `harvest-day`,
  `garden-to-table`.
- Scene beat labels trong mục 6 và 8 chưa phải ID. Mỗi lesson vertical slice sẽ freeze scene IDs
  trước khi tạo asset/audio.
- Vocabulary ID khi author dùng dạng
  `vocab-<lesson-id>-<scene-id>-<vocabulary-key>`.
- Object ID dùng dạng `<scene-id>-<object-key>`.
- Step ID dùng dạng `<scene-id>-<action>-<target-key>`.
- Variant keys mô tả trạng thái, không dùng tên tuần tự chung như `image-2`.
- Không đổi key đã content-frozen sau khi asset/audio được tạo nếu chưa có rename plan.

## 11. Visual and asset direction

### Continuity và production sheets

- Cùng một cây được giữ art direction xuyên năm lesson để bé nhận ra hành trình tiếp nối.
- Scene đầu của lesson sau bắt đầu bằng kết quả hợp lý từ lesson trước ở cấp hình ảnh/copy;
  runtime không persist object state xuyên lesson.
- Mỗi scene được tạo từ một production sheet thống nhất rồi cắt thành background và transparent
  PNG masters để giữ style, ánh sáng và tỷ lệ nhất quán.
- Source of truth vẫn là
  `src/assets/source/master/lessons/<lesson>/<scene>/images/*.png`; WebP, manifest và generated
  release là output của pipeline, không sửa tay.
- Background và cutout không chứa English/Vietnamese text baked vào raster.

### State variants

- Variant của cùng object giữ canvas, anchor và silhouette tương thích để không nhảy vị trí.
- Object cần show/hide/variant phải là transparent cutout tách khỏi background.
- Incorrect choice không cần state asset riêng nếu shake/highlight hiện tại đã đủ.
- Growth, flower, fruit và seed-cycle payoff phải có cue ngày-đêm/lịch/thời tiết thể hiện thời gian.

### Child clarity and accessibility

- Đáp án không chỉ phân biệt bằng màu; dùng thêm silhouette, trạng thái, kích thước hoặc bố cục.
- Touch target hiệu dụng tối thiểu 48dp và không chồng hit area của lựa chọn khác.
- Primary target không bị character/sibling che hitbox.
- Reduce Motion vẫn giữ state cuối, icon và feedback; cue thời gian có bản tĩnh.
- Khi toàn theme được author, scene/milestone icons không lặp nhau và milestone icon không dùng
  lại scene icon.

## 12. Safety and factual boundaries

- Không có pesticide, fertilizer concentrate, unknown mushroom/berry hoặc hành vi nếm cây lạ.
- Không cho bé dùng knife, garden shears, lawn mower, stove, hot water hoặc electrical tool.
- Món ăn chỉ dùng nguyên liệu người lớn đã rửa/cắt khi cần; parent copy nhắc kiểm tra dị ứng và độ
  an toàn trước khi nếm.
- Hạt nhỏ do người lớn chuẩn bị/cất giữ, tránh tầm với của em bé và không được đưa vào miệng.
- Ong, bướm, giun, tổ chim và các động vật khác không draggable. Bé tương tác với vùng quan sát
  hoặc môi trường.
- Chỉ chậu nhỏ được di chuyển. Art không khuyến khích bé tự nâng chậu nặng.
- Watering feedback dạy quan sát đất/cây và “ẩm vừa đủ”, không dạy lịch tưới tuyệt đối.
- Growth, pollination và harvest có cue thời gian; không dùng quan hệ nhân-quả tức thời sai lệch.
- Sau thao tác với đất/cây, completion hoặc parent copy nhắc rửa tay nhưng không lặp một lesson
  rửa tay bắt buộc ở mọi scene.

## 13. Copy, audio và speech-practice requirements

- `instructionVi`, `successFeedbackVi`, `failFeedbackVi` dùng tiếng Việt tự nhiên; English nằm ở
  vocabulary, `promptText` hoặc explicit English fields.
- Pre-reader target: tối đa 12 từ cho teach instruction và 10 từ cho review instruction; mỗi câu
  chỉ một ý và một hành động.
- New Anchor phải được giải nghĩa bằng lời Việt/hình trước hoặc ngay lúc model English phát.
- Quick Recall không được dùng copy kiểu “Bé nói theo cô” và không mở pronunciation panel.
- Action Enabler ưu tiên phản ứng nhanh; không chèn model word chỉ vì object có tên English.
- Core New Anchor có một `auto` speech encounter; expanded mặc định `optional`; challenge phrase
  chỉ `auto` khi đã có visual teach và không tạo chuỗi ghi âm dày.
- Không có pronunciation scoring hoặc lời khẳng định bé phát âm đúng. Speech practice chỉ ghi,
  phát lại và khích lệ.
- Khóa VI/EN copy trước Google TTS generation. Luôn chạy audio dry-run trước; Mốc 4A không generate
  hoặc publish audio.

## 14. Review design

- Mỗi lesson dùng review type `random`; runtime tiếp tục resolve Memory, Listen & Choose hoặc
  Matching.
- Review pool của lesson mới chỉ gồm New Anchors đã được dạy trong lesson đó.
- Quick Recall/Action Enabler không được thêm thành `VocabularyItem` chỉ để tăng review pool.
- Sau filtering, `getReviewGameItems()` phải trả 4/5/6 New Anchors executable theo learning mode
  với `learningScope.minMode`, `VocabularyItem.level` và image objects đồng bộ. Verbs/states hoặc
  hai variants của cùng object chỉ được dùng khi review art thể hiện chúng không mơ hồ.
- Phrase dài không làm anchor mặc định; visual đại diện các item phải khác nhau đủ rõ.
- Logic thứ tự được kiểm tra trong scene bằng action/state chain; Mốc 4A không thêm review-game
  type mới.

## 15. Content gates và bước kế tiếp

### Gates áp dụng cho từng vertical slice

1. Core path hoàn thành được chỉ bằng audio/hình và có visible end state.
2. New Anchor, Quick Recall và Action Enabler được phân loại tường minh trong storyboard.
3. Expanded/challenge filtering không làm mất prerequisite hoặc end state của core.
4. Không đặt hai deep-learn/pronunciation panels liền nhau, kể cả panel `optional`.
5. Distractors trung tính; hint/replay cue chỉ animate correct target.
6. Safety/factual review duyệt weather, animals, harvest và food boundaries liên quan.
7. VI/EN copy và exact English targets được duyệt trước Google TTS/asset naming freeze.
8. Production-sheet feasibility map được mọi visible state sang base/variant/show/hide assets.
9. Lesson data, validation, asset audit/build/verify và Android child-path QA riêng cho core lẫn
   expanded pass trước khi dùng lesson đó làm template tiếp theo.

### Mốc 4B - đã khóa storyboard `help-it-grow`

`docs/theme-4-help-it-grow-storyboard.md` đã khóa:

- ba scene IDs và exact storyboards;
- New Anchor/Quick Recall/Action Enabler cho từng step;
- exact VI/EN copy và speech policy;
- scene-state map, object list và production-sheet inventory;
- review anchors và acceptance tests.

Mốc 4C đã author runtime data, tạo/cắt production sheets và đăng ký `help-it-grow` vào catalog.
Vocabulary-first revision ngày 2026-08-25 giữ 40 ảnh, nâng vocabulary/pronunciation lên 8/12/16,
nhịp meaningful turn lên 21/27/34 và review vẫn 4/5/6. Trạng thái audio/R2 mới nhất được khóa tại
`docs/theme-4-help-it-grow-storyboard.md`. Follow-up installed-state audit hiện dùng 39 reference
runtime và không còn dùng WebP `stake` rời.
