# Theme 4 Content Draft - Khu vườn của bé

**Draft date:** 2026-08-12

**Status:** Mốc 3 pilot implemented cho `plant-a-seed`; bảy lesson còn lại vẫn là content blueprint
và chưa phải content freeze.

**Proposed scope:** Theme `khu-vuon-cua-be` / “Khu vườn của bé” / “My Little Garden”.

Tài liệu này định nghĩa hành trình nội dung, lesson/scene/vocabulary keys dự thảo, chuỗi hành động,
trạng thái hình ảnh, review focus và ranh giới an toàn cho Theme 4. Scene State v1 đã được
implement ở Mốc 2 với object variants, show/hide và success-only state changes; theme/lesson trong
tài liệu này đã được dùng để author và đăng ký pilot `plant-a-seed`; các lesson khác vẫn chưa có
runtime implementation.

## 1. Draft summary

- Theme dự kiến có 8 lesson packs và 24 mini-scenes; runtime hiện đăng ký 1 lesson pilot với 3
  mini-scenes.
- Độ tuổi dự kiến: 3-5 tuổi; `learningMode` tiếp tục điều chỉnh độ sâu thay vì tạo ba lesson riêng.
- Mỗi scene có 7 vocabulary targets:
  - 3 `core` targets;
  - 2 target bổ sung ở `expanded`;
  - 2 action/logic phrases bổ sung ở `challenge`.
- Toàn theme có 168 target strings dự thảo: 72 core, 48 expanded và 48 challenge.
- 168 English target strings là duy nhất bên trong Theme 4.
- 23 target strings trùng chính xác với catalog hiện tại và được chủ ý dùng như ôn lại; 145 target
  strings còn lại chưa trùng chính xác với các `VocabularyItem.word` hiện có.
- Mỗi lesson có một review game cấu hình `random` và bốn anchor vocabulary IDs có hình rõ ràng.
- Free tier hiện vẫn chỉ gồm `morning-routine` và `at-school`; nếu Theme 4 được đăng ký mà policy
  không đổi, toàn bộ theme mới sẽ là Premium.
- Theme dùng một vòng kể chuyện khép kín: chuẩn bị -> gieo -> chăm -> ứng phó thời tiết -> quan sát
  sinh vật -> thu hoạch -> dùng thành quả -> giữ hạt cho lần sau.
- Pilot runtime hiện chỉ bao phủ đoạn `chuẩn bị chậu -> gieo hạt -> tưới lần đầu`. Ba scene dùng
  21 vocabulary targets, review `random`, năm bundled map icons và 38 lesson image references đã
  audit/build/verify local. Audio production chưa generate/publish.

Theme này không thay thế scene `grandparents-visit/garden-help`. Scene cũ là một lần bé phụ giúp
ông bà và dạy các vật quen thuộc trong vườn. Theme mới tập trung vào quan hệ nhân-quả xuyên suốt
một chu kỳ chăm cây, với object state thay đổi sau hành động của bé.

## 2. Product and learning goals

### Theme metadata dự thảo

- Theme ID: `khu-vuon-cua-be`.
- `titleVi`: `Khu vườn của bé`.
- `titleEn`: `My Little Garden`.
- `descriptionVi`: `Bé chuẩn bị, gieo hạt, chăm cây, thu hoạch và bắt đầu một mùa trồng mới.`
- `descriptionEn`: `Get ready, plant seeds, care for growing plants, harvest, and begin again.`
- `thumbnailEmoji`: `🌱`.
- Bundled theme icon key dự kiến: `themeLittleGarden`.

### Learning outcomes

Sau theme, bé được làm quen với ba lớp kiến thức:

1. **English in action:** gọi tên vật, trạng thái và cụm hành động ngay lúc dùng chúng.
2. **Sequence and cause:** hiểu một bước chuẩn bị cho bước sau, ví dụ chậu phải có đất trước khi
   gieo hạt và đất cần ẩm nhưng không ngập nước.
3. **Care and safety:** biết quan sát nhẹ nhàng, không tự xử lý vật sắc/nhánh cây lớn, không nếm
   cây lạ và nhờ người lớn khi cần.

### Experience contract

- Mỗi core scene phải có một mục tiêu cụ thể và một end state nhìn thấy được.
- Core path dùng 3-5 hành động có ý nghĩa; không quá hai listen steps liên tiếp trước một action.
- Expanded steps làm chuỗi giàu hơn nhưng không thay đổi điều kiện hoàn thành cốt lõi.
- Challenge kiểm tra cụm hành động hoặc “bước nào tiếp theo?”, không chỉ thêm một thẻ từ rời rạc.
- Cả ba mode phải kết thúc ở cùng một trạng thái hợp lý.
- Success mới thay đổi scene state. Incorrect interaction chỉ phản hồi/hint và không làm mất,
  hiện, di chuyển hoặc đổi variant của object.
- Primary instruction chỉ nói hành động cần làm. Vị trí tuyệt đối dành cho retry hint và không
  được dựa vào object có thể đã di chuyển ở bước trước.
- Growth/flower/fruit transition phải có dấu hiệu thời gian trôi qua; không mô tả cây mọc ngay lập
  tức sau khi vừa tưới.

## 3. Draft identifier contract

Lesson IDs, scene IDs và vocabulary keys ngoài `plant-a-seed` là stable draft candidates. Các ID
đã author trong `plant-a-seed` được coi là frozen sau pilot Scene State v1; đổi chúng cần một task
rename/migration và asset/audio plan riêng.

- Vocabulary ID khi author dự kiến dùng dạng
  `vocab-<lesson-id>-<scene-id>-<vocabulary-key>`.
- Object ID dự kiến dùng dạng `<scene-id>-<object-key>`.
- Step ID dự kiến dùng dạng `<scene-id>-<action>-<target-key>`.
- Variant/state labels trong mục scene blueprint phải được map vào contract Scene State v1 đã
  implement; các label cụ thể vẫn là draft cho tới content freeze.
- Không đổi key sau content freeze nếu không có migration/asset rename task riêng.

## 4. Learning journey

| Order | Lesson ID | Lesson title | Ordered scenes | Lesson outcome |
| --- | --- | --- | --- | --- |
| 1 | `garden-ready` | Sẵn sàng làm vườn / Garden Ready | `garden-weather-check`, `garden-clothes`, `garden-tools` | Bé kiểm tra điều kiện, mặc phù hợp và gom dụng cụ. |
| 2 | `plant-a-seed` | Bé gieo hạt / Plant a Seed | `prepare-the-pot`, `plant-the-seed`, `first-watering` | Bé chuẩn bị chậu, gieo hạt và tạo độ ẩm vừa đủ. |
| 3 | `help-it-grow` | Giúp cây lớn lên / Help It Grow | `sun-and-water`, `remove-the-weeds`, `support-the-plant` | Bé chọn nắng/nước phù hợp và giúp cây đứng vững. |
| 4 | `garden-weather` | Thời tiết trong vườn / Garden Weather | `hot-sunny-day`, `rainy-garden-day`, `windy-garden-day` | Bé chọn cách chăm cây khác nhau theo thời tiết. |
| 5 | `garden-friends` | Bạn nhỏ trong vườn / Garden Friends | `helpers-in-the-soil`, `garden-pollinators`, `watch-gently` | Bé quan sát sinh vật mà không làm xáo trộn nơi sống. |
| 6 | `harvest-day` | Ngày thu hoạch / Harvest Day | `ready-to-pick`, `pick-carefully`, `sort-the-harvest` | Bé nhận biết đồ chín, hái nhẹ và phân loại. |
| 7 | `garden-to-table` | Từ vườn tới bàn ăn / Garden to Table | `wash-the-harvest`, `make-a-garden-snack`, `set-and-share` | Bé rửa, chuẩn bị món nguội cùng người lớn và chia sẻ. |
| 8 | `garden-cycle` | Vòng đời tiếp tục / The Garden Cycle | `sort-the-scraps`, `clean-the-tools`, `save-the-seeds` | Bé dọn sau hoạt động và giữ hạt cho mùa tiếp theo. |

## 5. Lesson and scene blueprints

### 5.1 `garden-ready` - Sẵn sàng làm vườn / Garden Ready

- Description VI: `Bé xem thời tiết, chọn đồ mặc và chuẩn bị dụng cụ trước khi ra vườn.`
- Description EN: `Check the weather, get dressed, and gather tools before going outside.`
- Parent tip VI: `Ba mẹ có thể cùng bé gọi tên thời tiết và chọn một dụng cụ an toàn để quan sát.`
- Review title VI: `Chuẩn bị ra vườn`.
- Review anchors: `garden-weather-check/sunny`, `garden-clothes/garden-gloves`,
  `garden-tools/trowel`, `garden-tools/tool-basket`.

#### `garden-weather-check` - Xem thời tiết / Check the Weather

- Goal: đọc dấu hiệu ngoài cửa sổ rồi hoàn thành bảng thời tiết trước khi chọn đồ.
- Core flow: nghe ba trạng thái -> tìm dấu hiệu đúng ngoài cửa sổ -> đặt card tương ứng lên bảng.
- Expanded insertion: tìm `raindrop` và đưa nó vào đúng vùng trên `weather chart`.
- Challenge check: chọn phrase mô tả việc cần làm trước khi lấy quần áo.
- Visible state: `weather-board/empty -> sunny -> cloudy -> rainy -> checked`; trạng thái cuối mở
  CTA sang scene chọn quần áo.
- Core vocabulary:
  - `sunny` -> `sunny` -> trời nắng (`adjective`).
  - `cloudy` -> `cloudy` -> trời nhiều mây (`adjective`).
  - `rainy` -> `rainy` -> trời mưa (`adjective`).
- Expanded vocabulary:
  - `weather-chart` -> `weather chart` -> bảng thời tiết (`noun`).
  - `raindrop` -> `raindrop` -> giọt mưa (`noun`).
- Challenge vocabulary:
  - `check-weather` -> `check the weather` -> kiểm tra thời tiết (`phrase`).
  - `choose-clothes-weather` -> `choose clothes for the weather` -> chọn quần áo theo thời tiết
    (`phrase`).

#### `garden-clothes` - Mặc đồ làm vườn / Garden Clothes

- Goal: mặc những món phù hợp với ngày nắng đã xác định ở scene trước.
- Core flow: kéo ủng -> kéo găng tay -> chọn mũ che nắng.
- Expanded insertion: thêm tạp dề và nhận biết tay áo dài.
- Challenge check: chọn đúng thứ tự `put on your gloves` rồi `protect your skin`.
- Visible state: `child/everyday -> boots-on -> gloves-on -> sun-ready`; expanded có variant
  `apron-on` nhưng không thay đổi core completion.
- Core vocabulary:
  - `garden-boots` -> `garden boots` -> ủng làm vườn (`noun`).
  - `garden-gloves` -> `garden gloves` -> găng tay làm vườn (`noun`).
  - `sun-hat` -> `sun hat` -> mũ che nắng (`noun`).
- Expanded vocabulary:
  - `apron` -> `apron` -> tạp dề (`noun`).
  - `long-sleeves` -> `long sleeves` -> tay áo dài (`noun`).
- Challenge vocabulary:
  - `put-on-gloves` -> `put on your gloves` -> đeo găng tay (`phrase`).
  - `protect-skin` -> `protect your skin` -> bảo vệ làn da (`phrase`).

#### `garden-tools` - Gom dụng cụ / Gather the Tools

- Goal: chọn đúng dụng cụ làm vườn và cất chúng vào giỏ trước khi di chuyển.
- Core flow: tìm xẻng nhỏ -> kéo cào -> kéo bình tưới vào giỏ.
- Expanded insertion: thêm bình xịt nước; loại vật không phải dụng cụ khỏi lựa chọn.
- Challenge check: gom đủ dụng cụ rồi chọn cách mang giỏ an toàn bằng hai tay.
- Visible state: `tool-basket/empty -> trowel-added -> rake-added -> watering-can-added -> ready`;
  object trên kệ ẩn sau khi đã được đặt vào giỏ.
- Core vocabulary:
  - `trowel` -> `trowel` -> xẻng làm vườn nhỏ (`noun`).
  - `garden-rake` -> `garden rake` -> cào làm vườn (`noun`).
  - `watering-can` -> `watering can` -> bình tưới cây (`noun`).
- Expanded vocabulary:
  - `spray-bottle` -> `spray bottle` -> bình xịt nước (`noun`).
  - `tool-basket` -> `tool basket` -> giỏ dụng cụ (`noun`).
- Challenge vocabulary:
  - `gather-tools` -> `gather the tools` -> gom dụng cụ (`phrase`).
  - `carry-tools-safely` -> `carry tools safely` -> mang dụng cụ an toàn (`phrase`).

### 5.2 `plant-a-seed` - Bé gieo hạt / Plant a Seed

- Description VI: `Bé cho đất vào chậu, gieo hạt và tưới vừa đủ để chờ mầm cây.`
- Description EN: `Fill a pot, plant a seed, and add just enough water for a sprout.`
- Parent tip VI: `Ba mẹ có thể cho bé gieo một hạt lớn, nhưng luôn rửa tay sau khi chạm đất.`
- Review title VI: `Từ hạt tới mầm`.
- Review anchors: `prepare-the-pot/soil`, `plant-the-seed/seed`, `first-watering/sprout`,
  `prepare-the-pot/plant-pot`.

#### `prepare-the-pot` - Chuẩn bị chậu / Prepare the Pot

- Goal: tạo một chậu đất có khoảng trống phù hợp để gieo hạt.
- Core flow: tìm chậu -> xúc đất -> kéo đất vào chậu đến vạch vừa đủ.
- Expanded insertion: kiểm tra lỗ thoát nước và chọn đúng loại đất trồng trong chậu.
- Challenge check: chọn `fill the pot with soil` trước `leave some space`.
- Visible state: `plant-pot/empty -> soil-low -> soil-ready`; fill vượt vạch chỉ tạo fail feedback,
  không đổi variant.
- Core vocabulary:
  - `plant-pot` -> `plant pot` -> chậu cây (`noun`).
  - `soil` -> `soil` -> đất trồng (`noun`).
  - `scoop` -> `scoop` -> xẻng xúc đất nhỏ (`noun`).
- Expanded vocabulary:
  - `drainage-hole` -> `drainage hole` -> lỗ thoát nước (`noun`).
  - `potting-mix` -> `potting mix` -> đất trồng trong chậu (`noun`).
- Challenge vocabulary:
  - `fill-pot-soil` -> `fill the pot with soil` -> cho đất vào chậu (`phrase`).
  - `leave-space` -> `leave some space` -> chừa lại một khoảng trống (`phrase`).

#### `plant-the-seed` - Gieo hạt / Plant the Seed

- Goal: tạo lỗ, đặt hạt, phủ đất và gắn nhãn theo đúng thứ tự.
- Core flow: chạm tạo lỗ -> kéo hạt vào lỗ -> phủ đất.
- Expanded insertion: mở gói hạt, gắn thẻ tên cây sau khi phủ đất.
- Challenge check: sắp `plant a seed` trước `cover the seed`.
- Visible state: `pot-soil/flat -> hole-open -> seed-visible -> covered`; expanded thêm
  `plant-label/hidden -> visible`.
- Core vocabulary:
  - `seed` -> `seed` -> hạt giống (`noun`).
  - `hole` -> `hole` -> lỗ nhỏ (`noun`).
  - `seed-packet` -> `seed packet` -> gói hạt giống (`noun`).
- Expanded vocabulary:
  - `plant-label` -> `plant label` -> thẻ tên cây (`noun`).
  - `finger` -> `finger` -> ngón tay (`noun`).
- Challenge vocabulary:
  - `plant-seed` -> `plant a seed` -> gieo hạt (`phrase`).
  - `cover-seed` -> `cover the seed` -> phủ đất lên hạt (`phrase`).

#### `first-watering` - Tưới lần đầu / First Watering

- Goal: làm đất ẩm vừa đủ, tránh vũng nước và chờ mầm xuất hiện.
- Core flow: tìm nước -> kéo vòi bình tưới tới chậu -> dừng khi đất chuyển sang ẩm.
- Expanded insertion: phân biệt vòi bình tưới và vũng nước báo hiệu tưới quá nhiều.
- Challenge check: chọn `water it gently`, sau đó `wait for the sprout`.
- Visible state: `pot-soil/dry -> damp`; `puddle/hidden` phải giữ ẩn ở success path; sau cue
  ngày-đêm, `sprout/hidden -> visible`.
- Core vocabulary:
  - `water` -> `water` -> nước (`noun`).
  - `sprout` -> `sprout` -> mầm cây (`noun`).
  - `damp` -> `damp` -> ẩm (`adjective`).
- Expanded vocabulary:
  - `spout` -> `spout` -> vòi bình tưới (`noun`).
  - `puddle` -> `puddle` -> vũng nước (`noun`).
- Challenge vocabulary:
  - `water-gently` -> `water it gently` -> tưới nhẹ nhàng (`phrase`).
  - `wait-sprout` -> `wait for the sprout` -> chờ mầm cây (`phrase`).

### 5.3 `help-it-grow` - Giúp cây lớn lên / Help It Grow

- Description VI: `Bé quan sát cây, chọn nắng và nước phù hợp rồi giúp cây đứng vững.`
- Description EN: `Watch the plant, choose sunlight and water, and help the stem stand tall.`
- Parent tip VI: `Ba mẹ có thể cùng bé chạm đất bằng một ngón tay để kiểm tra, không tưới theo lịch cứng.`
- Review title VI: `Chăm cây lớn lên`.
- Review anchors: `sun-and-water/sunlight`, `remove-the-weeds/weed`,
  `support-the-plant/stem`, `support-the-plant/stake`.

#### `sun-and-water` - Nắng và nước / Sun and Water

- Goal: quan sát dấu hiệu cây rũ, kiểm tra đất rồi chọn nắng/nước phù hợp.
- Core flow: tìm vùng có nắng -> chuyển chậu -> kiểm tra đất ở vùng rễ.
- Expanded insertion: nhận biết độ ẩm và hình cây đang rũ trước khi quyết định tưới.
- Challenge check: `check the soil` phải xảy ra trước khi chọn có tưới hay không.
- Visible state: `plant/drooping -> sunlit -> checked -> upright`; water variant chỉ xuất hiện
  khi scene biểu diễn đất khô.
- Core vocabulary:
  - `sunlight` -> `sunlight` -> ánh nắng (`noun`).
  - `shade` -> `shade` -> bóng râm (`noun`).
  - `roots` -> `roots` -> rễ cây (`noun`).
- Expanded vocabulary:
  - `moisture` -> `moisture` -> độ ẩm (`noun`).
  - `drooping` -> `drooping` -> đang rũ xuống (`adjective`).
- Challenge vocabulary:
  - `move-sunlight` -> `move it into the sunlight` -> chuyển cây ra chỗ có nắng (`phrase`).
  - `check-soil` -> `check the soil` -> kiểm tra đất (`phrase`).

#### `remove-the-weeds` - Nhổ cỏ dại / Remove the Weeds

- Goal: phân biệt cây đang trồng với cỏ dại rồi làm sạch luống mà không kéo nhầm cây.
- Core flow: tìm cỏ dại -> kéo đúng cỏ cùng phần rễ -> phủ lớp mỏng quanh cây.
- Expanded insertion: dùng cào tay để làm tơi vùng cỏ và quan sát rễ cỏ.
- Challenge check: chọn `pull out the weed`, giữ `leave the plant in place`.
- Visible state: `garden-bed/weedy -> one-weed-left -> clear -> mulched`; cây chính giữ nguyên vị trí.
- Core vocabulary:
  - `weed` -> `weed` -> cỏ dại (`noun`).
  - `garden-bed` -> `garden bed` -> luống vườn (`noun`).
  - `mulch` -> `mulch` -> lớp phủ gốc (`noun`).
- Expanded vocabulary:
  - `weed-root` -> `weed root` -> rễ cỏ dại (`noun`).
  - `hand-fork` -> `hand fork` -> cào tay nhỏ (`noun`).
- Challenge vocabulary:
  - `pull-weed` -> `pull out the weed` -> nhổ cỏ dại (`phrase`).
  - `leave-plant` -> `leave the plant in place` -> để cây trồng ở nguyên chỗ (`phrase`).

#### `support-the-plant` - Đỡ thân cây / Support the Plant

- Goal: đặt cọc và buộc lỏng để thân cây không đổ nhưng vẫn có chỗ lớn lên.
- Core flow: đặt cọc cạnh cây -> đưa dây quanh cọc/thân -> chọn độ buộc lỏng.
- Expanded insertion: ghép dây leo với giàn leo thay vì cọc đơn.
- Challenge check: `tie it loosely` trước khi xác nhận `support the stem`.
- Visible state: `plant/leaning -> stake-added -> string-loose -> upright`; tight-string choice chỉ
  phát fail feedback.
- Core vocabulary:
  - `stem` -> `stem` -> thân cây (`noun`).
  - `stake` -> `stake` -> cọc đỡ cây (`noun`).
  - `string` -> `string` -> dây buộc (`noun`).
- Expanded vocabulary:
  - `vine` -> `vine` -> dây leo (`noun`).
  - `trellis` -> `trellis` -> giàn leo (`noun`).
- Challenge vocabulary:
  - `tie-loosely` -> `tie it loosely` -> buộc lỏng tay (`phrase`).
  - `support-stem` -> `support the stem` -> đỡ thân cây (`phrase`).

### 5.4 `garden-weather` - Thời tiết trong vườn / Garden Weather

- Description VI: `Bé chọn cách bảo vệ cây trong ngày nắng nóng, mưa lớn và nhiều gió.`
- Description EN: `Choose gentle plant care for hot sun, heavy rain, and windy weather.`
- Parent tip VI: `Ba mẹ nhắc bé không tự nhấc chậu nặng hoặc chạm cành cây lớn sau mưa gió.`
- Review title VI: `Giúp cây qua thời tiết`.
- Review anchors: `hot-sunny-day/shade-cloth`, `hot-sunny-day/thermometer`,
  `rainy-garden-day/rain-gauge`, `windy-garden-day/plant-cover`.

#### `hot-sunny-day` - Ngày nắng nóng / A Hot Sunny Day

- Goal: nhận biết cây/đất khô, tạo bóng che và chọn lúc tưới dịu hơn.
- Core flow: tìm dấu hiệu nóng -> kéo tấm che -> kiểm tra đất khô.
- Expanded insertion: xem nhiệt kế và chọn biểu tượng buổi sáng.
- Challenge check: `make some shade`, sau đó `water in the morning`.
- Visible state: `plant/drooping-hot -> shaded -> watered-morning -> upright`; không diễn hoạt tưới
  giữa nắng gắt.
- Core vocabulary:
  - `hot` -> `hot` -> nóng (`adjective`).
  - `dry-soil` -> `dry soil` -> đất khô (`noun`).
  - `shade-cloth` -> `shade cloth` -> tấm che nắng (`noun`).
- Expanded vocabulary:
  - `morning` -> `morning` -> buổi sáng (`noun`).
  - `thermometer` -> `thermometer` -> nhiệt kế (`noun`).
- Challenge vocabulary:
  - `make-shade` -> `make some shade` -> tạo bóng che (`phrase`).
  - `water-morning` -> `water in the morning` -> tưới vào buổi sáng (`phrase`).

#### `rainy-garden-day` - Ngày mưa lớn / A Rainy Garden Day

- Goal: đưa chậu nhỏ vào chỗ có mái che và đổ nước khỏi đĩa lót.
- Core flow: quan sát mưa lớn -> chuyển chậu nhỏ vào chỗ che -> tìm đĩa lót đầy nước.
- Expanded insertion: đọc ống đo mưa và nhận biết nước đang tràn.
- Challenge check: `move the pot under cover` trước `empty the saucer`.
- Visible state: `plant-pot/exposed -> under-cover`; `plant-saucer/full -> empty`;
  `overflow/visible -> hidden`.
- Core vocabulary:
  - `heavy-rain` -> `heavy rain` -> mưa lớn (`noun`).
  - `plant-saucer` -> `plant saucer` -> đĩa lót chậu (`noun`).
  - `shelter` -> `shelter` -> chỗ có mái che (`noun`).
- Expanded vocabulary:
  - `rain-gauge` -> `rain gauge` -> ống đo mưa (`noun`).
  - `overflow` -> `overflow` -> tràn nước (`noun`).
- Challenge vocabulary:
  - `move-under-cover` -> `move the pot under cover` -> chuyển chậu vào chỗ có mái che (`phrase`).
  - `empty-saucer` -> `empty the saucer` -> đổ nước khỏi đĩa lót (`phrase`).

#### `windy-garden-day` - Ngày nhiều gió / A Windy Garden Day

- Goal: chuyển cây nhỏ tới chỗ kín gió, cố định tấm phủ và nhờ người lớn xử lý cành rơi.
- Core flow: tìm cây nhỏ đang rung -> chuyển tới góc kín -> nhận biết cành cây là vùng không chạm.
- Expanded insertion: gắn kẹp cây vào tấm phủ và tìm chiếc lá rơi an toàn.
- Challenge check: `move it to shelter`; với cành lớn phải chọn `ask a grown-up for help`.
- Visible state: `plant-pot/windy -> sheltered`; `plant-cover/loose -> clipped`;
  `fallen-branch/hazard` không bao giờ trở thành draggable.
- Core vocabulary:
  - `windy` -> `windy` -> nhiều gió (`adjective`).
  - `plant-cover` -> `plant cover` -> tấm phủ cây (`noun`).
  - `fallen-branch` -> `fallen branch` -> cành cây rơi (`noun`).
- Expanded vocabulary:
  - `plant-clip` -> `plant clip` -> kẹp cây (`noun`).
  - `fallen-leaf` -> `fallen leaf` -> lá rụng (`noun`).
- Challenge vocabulary:
  - `move-shelter` -> `move it to shelter` -> chuyển cây vào chỗ kín (`phrase`).
  - `ask-grown-up` -> `ask a grown-up for help` -> nhờ người lớn giúp (`phrase`).

### 5.5 `garden-friends` - Bạn nhỏ trong vườn / Garden Friends

- Description VI: `Bé quan sát giun đất, ong, bướm và các vị khách nhỏ mà không làm phiền chúng.`
- Description EN: `Observe worms, bees, butterflies, and other garden visitors without disturbing them.`
- Parent tip VI: `Ba mẹ cùng bé nhìn từ xa; không cầm côn trùng, tổ chim hoặc động vật lạ.`
- Review title VI: `Quan sát bạn trong vườn`.
- Review anchors: `helpers-in-the-soil/earthworm`, `garden-pollinators/bee`,
  `garden-pollinators/butterfly`, `watch-gently/birdbath`.

#### `helpers-in-the-soil` - Bạn dưới lớp đất / Helpers in the Soil

- Goal: nhẹ nhàng nâng lá mục, quan sát giun và đặt lớp lá trở lại.
- Core flow: tìm chiếc lá che đất -> nâng mép lá -> quan sát giun/đường hầm.
- Expanded insertion: nhận biết đất tơi và lớp lá mục quanh lỗ nhỏ.
- Challenge check: `look under the leaf`, sau đó `put it back gently`.
- Visible state: `leaf-cover/closed -> lifted -> replaced`; `earthworm/hidden -> visible -> hidden`;
  không có thao tác kéo trực tiếp con vật.
- Core vocabulary:
  - `earthworm` -> `earthworm` -> giun đất (`noun`).
  - `tunnel` -> `tunnel` -> đường hầm nhỏ (`noun`).
  - `loose-soil` -> `loose soil` -> đất tơi xốp (`noun`).
- Expanded vocabulary:
  - `leaf-litter` -> `leaf litter` -> lớp lá mục (`noun`).
  - `tiny-hole` -> `tiny hole` -> lỗ nhỏ (`noun`).
- Challenge vocabulary:
  - `look-under-leaf` -> `look under the leaf` -> nhìn dưới chiếc lá (`phrase`).
  - `put-back-gently` -> `put it back gently` -> đặt lại nhẹ nhàng (`phrase`).

#### `garden-pollinators` - Ong và bướm / Garden Pollinators

- Goal: theo dõi ong/bướm ghé hoa từ khoảng cách an toàn và quan sát phấn hoa.
- Core flow: tìm ong -> tìm bướm -> chạm vùng phấn hoa ở giữa bông hoa.
- Expanded insertion: nối đường từ nectar tới flower center mà không chạm con vật.
- Challenge check: chọn `watch from a safe distance` và `let the bee work`.
- Visible state: `flower/no-visitor -> bee-visit -> butterfly-visit -> pollinated`; fruit bud chỉ
  xuất hiện sau cue thời gian trôi qua.
- Core vocabulary:
  - `bee` -> `bee` -> con ong (`noun`).
  - `butterfly` -> `butterfly` -> con bướm (`noun`).
  - `pollen` -> `pollen` -> phấn hoa (`noun`).
- Expanded vocabulary:
  - `nectar` -> `nectar` -> mật hoa (`noun`).
  - `flower-center` -> `flower center` -> giữa bông hoa (`noun`).
- Challenge vocabulary:
  - `watch-safe-distance` -> `watch from a safe distance` -> quan sát từ khoảng cách an toàn
    (`phrase`).
  - `let-bee-work` -> `let the bee work` -> để ong làm việc (`phrase`).

#### `watch-gently` - Quan sát nhẹ nhàng / Watch Gently

- Goal: làm khu vườn yên, quan sát ba con vật và giữ nguyên tổ/nơi trú ẩn.
- Core flow: bật biểu tượng giọng nhỏ -> tìm ốc sên -> tìm sâu bướm -> tìm chim.
- Expanded insertion: cho nước sạch vào birdbath và tìm insect hotel mà không mở nó.
- Challenge check: chọn `use gentle hands`; với tổ chim chọn `do not touch the nest`.
- Visible state: `observation-sign/noisy -> quiet`; animal objects `hidden -> visible` theo từng
  lượt quan sát; nest giữ nguyên và không interactive.
- Core vocabulary:
  - `snail` -> `snail` -> ốc sên (`noun`).
  - `caterpillar` -> `caterpillar` -> sâu bướm (`noun`).
  - `bird` -> `bird` -> con chim (`noun`).
- Expanded vocabulary:
  - `birdbath` -> `birdbath` -> khay nước cho chim (`noun`).
  - `insect-hotel` -> `insect hotel` -> nhà trú cho côn trùng (`noun`).
- Challenge vocabulary:
  - `gentle-hands` -> `use gentle hands` -> dùng đôi tay nhẹ nhàng (`phrase`).
  - `do-not-touch-nest` -> `do not touch the nest` -> không chạm vào tổ chim (`phrase`).

### 5.6 `harvest-day` - Ngày thu hoạch / Harvest Day

- Description VI: `Bé nhận biết rau quả chín, hái nhẹ nhàng và phân loại thành quả.`
- Description EN: `Find ripe produce, pick it gently, and sort the harvest.`
- Parent tip VI: `Ba mẹ chỉ cho bé hái cây đã xác định an toàn; không ăn quả hoặc lá lạ.`
- Review title VI: `Thu hoạch trong vườn`.
- Review anchors: `ready-to-pick/ripe`, `ready-to-pick/tomato`,
  `pick-carefully/basket`, `sort-the-harvest/herb`.

#### `ready-to-pick` - Đã chín chưa? / Ready to Pick?

- Goal: phân biệt đồ chín/chưa chín bằng nhiều dấu hiệu, không chỉ màu sắc.
- Core flow: so sánh hai quả -> tìm quả chín -> để quả chưa chín trên cây.
- Expanded insertion: kiểm tra strawberry và pea pod bằng hình dạng/kích thước rõ ràng.
- Challenge check: `check the color` kết hợp kích thước; chọn `leave the unripe one`.
- Visible state: ripe targets có outline/icon sẵn sàng; unripe target giữ trung tính và không bị
  tháo khỏi cây. Color không phải tín hiệu đúng duy nhất.
- Core vocabulary:
  - `ripe` -> `ripe` -> đã chín (`adjective`).
  - `unripe` -> `unripe` -> chưa chín (`adjective`).
  - `tomato` -> `tomato` -> quả cà chua (`noun`).
- Expanded vocabulary:
  - `strawberry` -> `strawberry` -> quả dâu tây (`noun`).
  - `pea-pod` -> `pea pod` -> quả đậu (`noun`).
- Challenge vocabulary:
  - `check-color` -> `check the color` -> kiểm tra màu sắc (`phrase`).
  - `leave-unripe` -> `leave the unripe one` -> để quả chưa chín lại trên cây (`phrase`).

#### `pick-carefully` - Hái nhẹ nhàng / Pick Carefully

- Goal: giữ giỏ ổn định, hái đồ chín bằng thao tác nhẹ và đặt vào giỏ.
- Core flow: đặt giỏ -> giữ gần cuống -> thực hiện chuyển động hái -> đặt vào giỏ.
- Expanded insertion: chọn dùng hai tay và nhận biết gentle twist; không dùng kéo/dao.
- Challenge check: `hold the basket`, sau đó `pick it gently`.
- Visible state: `produce/on-plant -> picked`; `basket/empty -> one-item -> filled`; plant không
  rung mạnh hoặc bị mất cành.
- Core vocabulary:
  - `basket` -> `basket` -> cái giỏ (`noun`).
  - `fruit-stem` -> `fruit stem` -> cuống quả (`noun`).
  - `harvest` -> `harvest` -> vụ thu hoạch (`noun`).
- Expanded vocabulary:
  - `two-hands` -> `two hands` -> hai tay (`noun`).
  - `gentle-twist` -> `gentle twist` -> xoay nhẹ (`noun`).
- Challenge vocabulary:
  - `hold-basket` -> `hold the basket` -> giữ chiếc giỏ (`phrase`).
  - `pick-gently` -> `pick it gently` -> hái nhẹ nhàng (`phrase`).

#### `sort-the-harvest` - Phân loại thành quả / Sort the Harvest

- Goal: phân loại đồ thu hoạch theo nhóm và để riêng món bị dập cho người lớn kiểm tra.
- Core flow: kéo fruit -> vegetable -> herb vào ba vùng riêng.
- Expanded insertion: so sánh large/small trong cùng nhóm mà không biến kích thước thành đúng/sai
  cho loại thực phẩm.
- Challenge check: `sort by type`; món bị dập dùng `put the bruised one aside`.
- Visible state: `harvest-basket/mixed -> fruit-bin + vegetable-bin + herb-bin`; bruised item vào
  vùng người lớn kiểm tra, không đi thẳng tới món ăn.
- Core vocabulary:
  - `fruit` -> `fruit` -> trái cây (`noun`).
  - `vegetable` -> `vegetable` -> rau củ (`noun`).
  - `herb` -> `herb` -> rau thơm (`noun`).
- Expanded vocabulary:
  - `large` -> `large` -> lớn (`adjective`).
  - `small` -> `small` -> nhỏ (`adjective`).
- Challenge vocabulary:
  - `sort-type` -> `sort by type` -> phân loại theo nhóm (`phrase`).
  - `bruised-aside` -> `put the bruised one aside` -> để món bị dập sang một bên (`phrase`).

### 5.7 `garden-to-table` - Từ vườn tới bàn ăn / Garden to Table

- Description VI: `Bé rửa rau quả, làm món nguội cùng người lớn và bày bàn để chia sẻ.`
- Description EN: `Wash the harvest, make a cold snack with a grown-up, and share it at the table.`
- Parent tip VI: `Ba mẹ phụ trách mọi thao tác cắt, bếp nóng và kiểm tra dị ứng trước khi bé nếm.`
- Review title VI: `Chuẩn bị món từ vườn`.
- Review anchors: `wash-the-harvest/colander`, `make-a-garden-snack/cucumber`,
  `set-and-share/placemat`, `set-and-share/serving-bowl`.

#### `wash-the-harvest` - Rửa rau quả / Wash the Harvest

- Goal: cho rau quả vào rổ, rửa bằng nước sạch và để ráo.
- Core flow: đặt đồ vào colander -> bật dòng clean water -> tìm dirt còn sót.
- Expanded insertion: đặt kitchen towel dưới rổ và nhận biết nước đang drain.
- Challenge check: `rinse it well`, sau đó `let it drain`.
- Visible state: `produce/dirty -> rinsed -> draining -> clean`; nước dừng sau khi rửa, không chạy
  liên tục như phần thưởng.
- Core vocabulary:
  - `colander` -> `colander` -> rổ để ráo nước (`noun`).
  - `clean-water` -> `clean water` -> nước sạch (`noun`).
  - `dirt` -> `dirt` -> đất bẩn (`noun`).
- Expanded vocabulary:
  - `kitchen-towel` -> `kitchen towel` -> khăn bếp (`noun`).
  - `drain` -> `drain` -> để ráo nước (`verb`).
- Challenge vocabulary:
  - `rinse-well` -> `rinse it well` -> rửa kỹ (`phrase`).
  - `let-drain` -> `let it drain` -> để cho ráo nước (`phrase`).

#### `make-a-garden-snack` - Làm món nguội / Make a Garden Snack

- Goal: xé lettuce, thêm nguyên liệu đã được người lớn chuẩn bị và trộn món nguội.
- Core flow: đặt bowl -> xé lettuce bằng tay -> thêm cucumber đã cắt sẵn.
- Expanded insertion: thêm corn và chọn salad spoon.
- Challenge check: `tear the lettuce` trước `mix the salad`.
- Visible state: `ingredients/whole-safe -> prepared-by-grown-up -> bowl-layered -> mixed`;
  không có knife, stove hoặc hot surface trong scene.
- Core vocabulary:
  - `cucumber` -> `cucumber` -> dưa leo (`noun`).
  - `lettuce` -> `lettuce` -> xà lách (`noun`).
  - `bowl` -> `bowl` -> cái tô (`noun`).
- Expanded vocabulary:
  - `corn` -> `corn` -> bắp/ngô (`noun`).
  - `salad-spoon` -> `salad spoon` -> muỗng trộn rau (`noun`).
- Challenge vocabulary:
  - `tear-lettuce` -> `tear the lettuce` -> xé xà lách (`phrase`).
  - `mix-salad` -> `mix the salad` -> trộn món rau (`phrase`).

#### `set-and-share` - Bày và chia sẻ / Set and Share

- Goal: bày chỗ ăn, đặt tô dùng chung và chia phần cùng người lớn.
- Core flow: đặt placemat -> plate -> serving bowl.
- Expanded insertion: thêm napkin và cup vào touch zones ổn định.
- Challenge check: `set the table`, sau đó `share the salad`.
- Visible state: `table/empty -> one-place-set -> complete -> shared`; serving bowl không biến mất
  sau khi chia để bé thấy nguồn và phần ăn.
- Core vocabulary:
  - `placemat` -> `placemat` -> tấm lót bàn ăn (`noun`).
  - `plate` -> `plate` -> cái đĩa (`noun`).
  - `serving-bowl` -> `serving bowl` -> tô đựng món chung (`noun`).
- Expanded vocabulary:
  - `napkin` -> `napkin` -> khăn ăn (`noun`).
  - `cup` -> `cup` -> cái cốc (`noun`).
- Challenge vocabulary:
  - `set-table` -> `set the table` -> bày bàn ăn (`phrase`).
  - `share-salad` -> `share the salad` -> chia sẻ món rau (`phrase`).

### 5.8 `garden-cycle` - Vòng đời tiếp tục / The Garden Cycle

- Description VI: `Bé phân loại phần thừa, làm sạch dụng cụ và giữ hạt cho mùa trồng mới.`
- Description EN: `Sort suitable scraps, clean the tools, and save seeds for the next season.`
- Parent tip VI: `Ba mẹ quyết định vật nào vào compost và cất hạt ở nơi khô, ngoài tầm em bé nhỏ.`
- Review title VI: `Chuẩn bị cho mùa mới`.
- Review anchors: `sort-the-scraps/compost-bin`, `clean-the-tools/tool-rack`,
  `save-the-seeds/seed-pod`, `save-the-seeds/seed-envelope`.

#### `sort-the-scraps` - Phân loại phần thừa / Sort the Scraps

- Goal: chọn phần thực vật phù hợp cho compost và giữ nhựa ở ngoài.
- Core flow: kéo fruit peel -> dry leaves -> compost bin.
- Expanded insertion: phân biệt food scraps thực vật với plastic wrapper.
- Challenge check: `put scraps in the compost`; chọn `keep plastic out` cho bao nhựa.
- Visible state: `sorting-tray/mixed -> compost-items -> plastic-aside`; chỉ hiển thị vật liệu dễ
  hiểu, không dạy meat/dairy hoặc quy tắc compost phức tạp.
- Core vocabulary:
  - `fruit-peel` -> `fruit peel` -> vỏ trái cây (`noun`).
  - `dry-leaves` -> `dry leaves` -> lá khô (`noun`).
  - `compost-bin` -> `compost bin` -> thùng ủ phân hữu cơ (`noun`).
- Expanded vocabulary:
  - `food-scraps` -> `food scraps` -> phần thức ăn thừa (`noun`).
  - `plastic-wrapper` -> `plastic wrapper` -> bao nhựa (`noun`).
- Challenge vocabulary:
  - `put-scraps-compost` -> `put scraps in the compost` -> cho phần phù hợp vào compost (`phrase`).
  - `keep-plastic-out` -> `keep plastic out` -> không cho nhựa vào (`phrase`).

#### `clean-the-tools` - Làm sạch dụng cụ / Clean the Tools

- Goal: phủi đất, rửa vừa đủ, lau khô và cất dụng cụ nhỏ lên giá.
- Core flow: dùng brush phủi mud -> đặt dụng cụ vào rinse bucket -> cất lên tool rack.
- Expanded insertion: lau bằng dry cloth trước khi cất.
- Challenge check: `brush off the soil`, sau đó `put the tools away`.
- Visible state: `tools/muddy -> brushed -> rinsed -> dry -> rack`; dòng nước không chạy liên tục.
- Core vocabulary:
  - `brush` -> `brush` -> bàn chải (`noun`).
  - `mud` -> `mud` -> bùn đất (`noun`).
  - `tool-rack` -> `tool rack` -> giá cất dụng cụ (`noun`).
- Expanded vocabulary:
  - `rinse-bucket` -> `rinse bucket` -> xô rửa dụng cụ (`noun`).
  - `dry-cloth` -> `dry cloth` -> khăn khô (`noun`).
- Challenge vocabulary:
  - `brush-soil` -> `brush off the soil` -> phủi đất khỏi dụng cụ (`phrase`).
  - `put-tools-away` -> `put the tools away` -> cất dụng cụ (`phrase`).

#### `save-the-seeds` - Giữ hạt giống / Save the Seeds

- Goal: lấy hạt khô, cho vào phong bì, gắn nhãn và cất ở nơi khô cho lần sau.
- Core flow: mở seed pod khô -> cho hạt vào seed envelope -> đặt phong bì lên shelf.
- Expanded insertion: gắn label và chọn dry place thay vì nơi ẩm.
- Challenge check: `save the seeds`, kết thúc bằng `plant again next season`.
- Visible state: `seed-pod/closed -> open`; `seed-envelope/empty -> filled -> labeled -> stored`;
  completion art nối lại hình chậu rỗng ở đầu theme.
- Core vocabulary:
  - `seed-pod` -> `seed pod` -> quả chứa hạt (`noun`).
  - `seed-envelope` -> `seed envelope` -> phong bì đựng hạt (`noun`).
  - `shelf` -> `shelf` -> cái kệ (`noun`).
- Expanded vocabulary:
  - `label` -> `label` -> nhãn ghi tên (`noun`).
  - `dry-place` -> `dry place` -> nơi khô ráo (`noun`).
- Challenge vocabulary:
  - `save-seeds` -> `save the seeds` -> giữ lại hạt giống (`phrase`).
  - `plant-next-season` -> `plant again next season` -> trồng lại vào mùa sau (`phrase`).

## 6. Vocabulary overlap audit

Audit được thực hiện trên các `VocabularyItem.word` khai báo trong `src/data/`, không chỉ các file
lesson factory. Theme 4 có 168 exact English strings duy nhất; 23 strings dưới đây đã tồn tại và
được coi là deliberate review:

| Existing target | Current source/context | Theme 4 purpose |
| --- | --- | --- |
| `check the weather` | `dress-myself` | Áp dụng lại trước khi ra vườn. |
| `sun hat` | `beach-day` | Chuyển kiến thức che nắng sang hoạt động làm vườn. |
| `apron` | Theme 1 shared vocabulary | Ôn đồ bảo vệ quần áo. |
| `watering can` | `grandparents-visit/garden-help` | Dụng cụ đã biết, dùng trong chuỗi chuẩn bị. |
| `spray bottle` | Theme 1 shared vocabulary | Nhận biết thêm dụng cụ; không thay thế bình tưới. |
| `plant pot` | `grandparents-visit/garden-help` | Dùng như container có state rỗng/đất/hạt. |
| `seed` | `grandparents-visit/garden-help` | Đưa từ đã biết vào chuỗi gieo thật sự. |
| `plant a seed` | `grandparents-visit/garden-help` | Ôn phrase nhưng gắn với hành động nhiều bước. |
| `water` | `doctor-visit` và Theme 1 shared vocabulary | Cùng từ nhưng ngữ cảnh mới là chăm cây. |
| `shade` | Theme 1 shared vocabulary | Áp dụng vào vị trí đặt cây. |
| `hot` | `speaking-up` | Chuyển từ trạng thái cơ thể sang mô tả thời tiết. |
| `thermometer` | `doctor-visit` | Dùng hình nhiệt kế môi trường, không phải đo cơ thể. |
| `tomato` | `supermarket-trip` | Nối thực phẩm trong siêu thị với nguồn trong vườn. |
| `basket` | `supermarket-trip` và Theme 1 shared vocabulary | Dùng cho thu hoạch thay vì mua sắm. |
| `fruit` | `supermarket-trip` và Theme 1 shared vocabulary | Dùng làm nhóm phân loại. |
| `bowl` | Theme 1 shared vocabulary | Dùng trong món nguội có logic chuẩn bị. |
| `placemat` | Theme 1 shared vocabulary | Ôn khi bày bàn. |
| `plate` | Theme 1 shared vocabulary | Ôn khi bày bàn. |
| `napkin` | `park-visit` và Theme 1 shared vocabulary | Ôn khi bày bàn. |
| `cup` | Theme 1 shared vocabulary | Ôn khi bày bàn. |
| `compost bin` | Theme 1 shared vocabulary | Mở rộng từ nhận biết sang phân loại phần thừa. |
| `shelf` | `library-visit` và Theme 1 shared vocabulary | Cùng vật, ngữ cảnh cất hạt/dụng cụ. |
| `label` | Theme 1 shared vocabulary | Dùng để ghi tên hạt/cây. |

Các overlap gần nghĩa nhưng không trùng exact string như `leaf`/`fallen leaf`/`dry leaves`,
`flower`/`flower center`, `pick vegetables`/`harvest` vẫn cần được đánh dấu trong content review.
Mốc 1 không thay progress schema. Runtime hiện đếm learned words theo vocabulary ID, nên các target
ôn lại vẫn có thể được tính như một ID mới. Theme 4 giảm overlap có thể tránh được nhưng không tự
đưa thêm khái niệm shared lexeme vào task này.

## 7. Visual and asset direction

### Continuity

- Lesson 2-4 tái sử dụng cùng một cây non về art direction để bé nhận ra hành trình tiếp nối.
- Scene đầu của lesson sau phải bắt đầu bằng kết quả hợp lý từ lesson trước ở cấp hình ảnh/copy;
  runtime không persist object state xuyên scene.
- Mọi chuyển đổi mọc mầm, ra hoa hoặc có quả dùng cue ngày-đêm/lịch/thời tiết để thể hiện thời gian.
- Background thay đổi theo tiến trình nhưng không chứa chữ English hoặc Vietnamese baked vào ảnh.

### State variants

- Các variant của cùng object phải giữ canvas, anchor và silhouette tương thích để không “nhảy”
  vị trí khi đổi asset.
- Variant keys phải mô tả trạng thái, ví dụ `plant-pot-empty`, `plant-pot-soil-ready`, không dùng
  tên như `image-2`.
- Transparent object PNG masters tách khỏi background khi object cần hiện/ẩn/đổi state.
- Asset audit/build scripts và runtime preload đã scan mọi variant source; Theme 4 không được dựa
  vào việc effect asset tình cờ kéo một state image vào pipeline.
- Incorrect choice không cần một asset state riêng nếu shake/highlight hiện tại đã đủ.

### Child clarity and accessibility

- Hình đúng/sai không chỉ phân biệt bằng màu. Dùng thêm độ lớn, hình dạng, icon trạng thái hoặc
  bố cục để hỗ trợ color-vision differences.
- Touch area hiệu dụng mục tiêu tối thiểu 48dp; vật nhỏ có touch area rộng hơn hình nhưng không
  chồng lên target khác.
- Primary target không bị character hoặc object sibling che hitbox.
- Reduce Motion giữ state cuối, màu, icon và feedback; cue thời gian có bản tĩnh nếu animation bị tắt.
- Mỗi scene cần một icon riêng, mỗi lesson cần một milestone icon riêng và theme cần một icon riêng.
  Theo invariant hiện tại, 24 scene icons không lặp nhau và 8 milestone icons không dùng lại scene icon.

## 8. Safety and factual boundaries

- Không có pesticide, fertilizer concentrate, unknown mushroom/berry hoặc hành vi nếm cây lạ.
- Không cho bé dùng knife, garden shears, lawn mower, stove, hot water hoặc electrical tool.
- Scene món ăn chỉ dùng nguyên liệu đã được người lớn rửa/cắt khi cần; copy nhắc người lớn kiểm tra
  dị ứng và độ an toàn trước khi nếm.
- Fallen branch lớn, tổ chim, ong/bướm và mọi động vật không draggable. Câu đúng là quan sát từ xa
  hoặc nhờ người lớn.
- Chỉ chậu nhỏ được di chuyển trong interaction. Art không khuyến khích bé tự nâng chậu nặng.
- Watering feedback dạy “ẩm vừa đủ”, không dạy một lịch tưới tuyệt đối cho mọi loại cây.
- Pollination/growth/harvest diễn ra sau cue thời gian; không dùng quan hệ nhân-quả tức thời sai lệch.
- Compost scene chỉ dùng fruit/vegetable scraps và dry leaves dễ hiểu; không dạy quy tắc về meat,
  dairy, pet waste hoặc compost system cụ thể của địa phương.
- Sau thao tác với đất/cây, completion/parent copy nhắc rửa tay nhưng không biến wash-hands thành
  một duplicate lesson flow bắt buộc trong mọi scene.

## 9. Copy and localization requirements

- `instructionVi`, `successFeedbackVi`, `failFeedbackVi` phải là tiếng Việt tự nhiên; English chỉ
  nằm trong vocabulary, `promptText` hoặc explicit English fields.
- Primary Vietnamese practice instruction mục tiêu tối đa 12 từ, giống Theme 2/3 draft contract.
- English vocabulary phải tự nhiên khi đọc thành tiếng, có article/possessive cần thiết.
- Scene intro, narrative transition và completion phải có explicit VI/EN copy; không dùng scene title
  thay cho bản dịch narrative.
- Teacher prompt `vi`, `en`, `bilingual` phải dẫn đến cùng interaction và cùng state change.
- `englishAccent` chỉ đổi en-US/en-GB audio, không tự đổi spelling/copy trong bảng trên.
- Challenge phrase phải gắn với action/state thật. Chỉ dùng phrase card khi hành động không thể thể
  hiện trực tiếp một cách an toàn hoặc rõ ràng.
- Không có pronunciation scoring hoặc câu khẳng định bé phát âm đúng; speech practice tiếp tục chỉ
  là ghi/phát lại và khích lệ.

## 10. Review design

- Mỗi lesson dùng review type `random`; runtime tiếp tục cho phép đổi giữa Memory, Listen & Choose
  và Matching.
- Bốn anchor IDs ưu tiên core/expanded nouns hoặc adjective có hình rõ; phrase dài không làm anchor
  mặc định.
- Runtime vẫn chọn 4/5/6 items theo `learningMode` và có thể bổ sung ngoài bốn anchor.
- Mốc 1 không thêm sequence-review game mới. Logic thứ tự được kiểm tra trong lesson scene bằng
  action/state chain; một review type chuyên sắp thứ tự chỉ được cân nhắc sau pilot.
- Visual đại diện một review item phải khác nhau đủ rõ; không dùng nhiều state variants của cùng
  object làm hai đáp án hình dễ nhầm trong cùng lượt.

## 11. Content review gates và kết quả pilot Mốc 3

Các gate dưới đây tiếp tục áp dụng cho toàn Theme 4. Với phạm vi `plant-a-seed`, Mốc 3 đã xác nhận
core chain/end state, filtering theo mode, safety/copy, mapping state visuals và review anchors bằng
validator cùng test pilot. Những gate liên quan cả 8 lesson vẫn phải được kiểm lại trước khi author
bảy lesson còn lại:

1. Product duyệt theme title, 8-lesson order và kết thúc vòng lặp ở `save-the-seeds`.
2. Mỗi core scene có một action chain hoàn chỉnh và end state nhìn thấy được.
3. Expanded/challenge filtering không làm mất prerequisite của core state.
4. Vocabulary review xác nhận 23 exact overlaps là deliberate reinforcement.
5. Safety review duyệt weather, insects, harvesting, food preparation và compost boundaries.
6. Visual feasibility review xác nhận từng state map được vào object variants, show/hide và drag
   snap của Scene State v1; scene cần capability khác phải được giảm scope hoặc tách mốc riêng.
7. VI/EN copy review duyệt natural English target strings trước Google TTS work.
8. Sau pilot, object/step/variant IDs mới được freeze cùng lesson/scene/vocabulary keys.

## 12. Ranh giới lịch sử của Mốc 1

- Không sửa `src/types/lesson.ts`, `StepController`, `ScenePlayer` hoặc renderer.
- Không thêm theme/lesson vào `src/data/themes.ts` hay `src/data/lessons.ts`.
- Không thêm reward, icon hoặc Premium/free-tier policy.
- Không tạo PNG/WebP, không sửa asset manifest/generated release.
- Không generate audio, không sửa audio manifest/provenance và không upload R2.
- Không thay progress schema, learned-word counting hoặc exact-step resume.
- Không cập nhật `docs/project_spec.md` vì chưa có runtime/catalog behavior mới.

## 13. Mốc 3 pilot implementation

- Đăng ký theme `khu-vuon-cua-be` với duy nhất `plant-a-seed`; chưa đưa bảy lesson draft còn lại
  vào catalog.
- Author ba scene `prepare-the-pot`, `plant-the-seed`, `first-watering` trong
  `src/data/lessons/plantASeed.ts` với core action chain và expanded/challenge insertions.
- Dùng Scene State v1 cho cùng-canvas pot variants, seed/hole/label/damp/sprout visibility và
  success-only state changes. Không thêm branching, inventory, arbitrary variables hoặc cross-scene
  persisted state.
- Tạo local master/WebP pilot, năm bundled map icons và sticker lesson `Little Gardener` bằng
  command/catalog chuyên biệt; không upload R2.
- Chỉ chạy audio dry-run. Production audio en-US/en-GB/vi và generated manifest/provenance chưa
  được tạo hoặc publish trong mốc này.
