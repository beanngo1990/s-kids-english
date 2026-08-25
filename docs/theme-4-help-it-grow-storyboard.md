# Help It Grow - Mốc 4B Storyboard Freeze

**Freeze date:** 2026-08-13

**Status:** Vocabulary-first revision 8/12/16 was published on 2026-08-25. Follow-up visual audit
teaches `stake` and `soft tie` on their installed states and keeps the flower state as the
Reward/review representative. This correction uses 39 active WebP references and retains the old
`stake.webp` only as an unused local orphan. Its audio/image delta was published and R2-verified on
2026-08-25; device smoke testing remains. Mốc 4B/4C cũ
được giữ làm lịch sử và các delta trong mục 13 có ưu tiên khi mô tả runtime.

**Lesson ID:** `help-it-grow`

Tài liệu này khóa vertical slice thứ hai của Theme 4 theo content architecture v2 trong
`docs/theme-4-content-draft.md`. Mốc 4B cố định hero plant, lesson/scene/vocabulary IDs, thứ tự
step, vai trò encounter, exact VI/EN copy, speech policy, state map, production-sheet inventory,
review anchors và acceptance tests. Vị trí phần trăm cuối cùng của object chỉ được khóa khi cắt
asset và kiểm tra trên Android ở mốc implementation.

## 1. Mốc 4B implementation boundary

Mốc 4B chỉ thay tài liệu. Mốc 4C sau đó đã author/register lesson, tạo PNG masters và map icons;
các giới hạn dưới đây được giữ lại như lịch sử của mốc freeze:

- không thêm `help-it-grow` vào `src/data/lessons.ts` hoặc `src/data/themes.ts`;
- không thêm reward, icon registry hoặc Premium/free-tier policy;
- không tạo PNG/WebP, manifest hoặc generated asset release;
- không generate audio hoặc sửa audio manifests/provenance;
- không đổi `src/types/lesson.ts`, Scene State v1 hoặc speech runtime.

Các ID/copy trong tài liệu này được coi là frozen trước authoring. Nếu implementation phát hiện
một constraint làm storyboard không executable, phải cập nhật freeze có lý do trước khi đổi asset
hoặc audio key; không âm thầm đổi ID/copy trong code.

## 2. Lesson contract

- `id`: `help-it-grow`
- `themeId`: `khu-vuon-cua-be`
- `titleVi`: `Giúp cây lớn lên`
- `titleEn`: `Help It Grow`
- `descriptionVi`: `Bé giúp cây đón nắng, trú mưa và đứng vững khi có gió.`
- `descriptionEn`: `Help the plant find sunlight, stay safe in rain, and stand tall in the wind.`
- `thumbnailEmoji`: `🌿`
- `ageRange`: `{ min: 3, max: 5, label: '3-5 tuổi' }`
- `reviewGame.id`: `help-it-grow-review`
- `reviewGame.type`: `random`
- `reviewGame.titleVi`: `Cây lớn khỏe`
- `metadata.parentTipVi`: `Ba mẹ cùng bé nhìn đất và lá trước khi tưới; chỉ di chuyển chậu nhỏ và chuẩn bị cọc đầu tròn cùng dây mềm.`

### Ordered scenes

1. `new-leaf-and-sunlight` — Lá mới và ánh nắng / New Leaf and Sunlight — `🍃`
2. `rainy-day-care` — Chăm cây ngày mưa / Rainy Day Care — `🌧️`
3. `wind-and-support` — Gió và cây đứng vững / Wind and Support — `🌬️`

Core/expanded/challenge đều đi qua cùng ba scene và kết thúc bằng cùng hero plant đứng thẳng, có
nhiều lá và một bông hoa vàng sau cue ngày-đêm. Expanded/challenge chỉ thêm encounter; không thay đổi
core prerequisite hoặc end state.

## 3. Hero plant continuity

- Hero plant lineage được khóa là **cây cà chua**.
- `plant-a-seed` vẫn dùng hình hạt/mầm chung; `help-it-grow` tiếp nối bằng một cây cà chua non chưa
  có hoa/quả. Teacher copy chỉ gọi là `cây nhỏ` hoặc `the little plant`, không dạy `tomato` sớm.
- `wind-and-support` kết thúc bằng một bông hoa vàng sau cue thời gian. `garden-friends` có thể tiếp
  nối với hoa; `harvest-day` mới giới thiệu từ `tomato` khi quả hiện rõ.
- Cây cà chua giữ một silhouette, chậu đất nung và hướng sáng nhất quán. Mỗi scene tự author initial
  state vì Scene State v1 reset khi chuyển scene.
- `setObjectVariant` thay toàn bộ asset của object, nên các plant variants phải tích lũy kết quả
  sinh học: `sunlit` vẫn có chiếc lá mới; `flower-bud` vẫn giữ dáng `supported`. Cọc và dây đã là
  decoration objects riêng nên không được bake lặp vào plant variants.
- Rau/quả khác ở các lesson sau phải nằm trên luống/cây khác, không ngụ ý cùng một hạt biến thành
  nhiều loài.

## 4. Frozen vocabulary and encounter roles

### New Anchors

| Scene | Key | Word | Nghĩa Việt | Type | Level / scope | Speech | Review visual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `new-leaf-and-sunlight` | `watering-can` | `watering can` | bình tưới cây | noun | easy / core | `auto` | Bình tưới cây xanh có vòi sen rõ. |
| `new-leaf-and-sunlight` | `leaf` | `leaf` | chiếc lá | noun | easy / core | `auto` | Một lá cà chua xanh tách nền. |
| `new-leaf-and-sunlight` | `sunlight` | `sunlight` | ánh nắng | noun | easy / core | `auto` | Một vùng tia nắng vàng, không có chậu cây. |
| `new-leaf-and-sunlight` | `shade` | `shade` | bóng râm | noun | medium / expanded | `optional` | Vùng râm xanh mát có silhouette lá. |
| `new-leaf-and-sunlight` | `move-into-sunlight` | `move into sunlight` | đưa vào vùng nắng | phrase | hard / challenge | `auto` | Chậu cây, mũi tên và tia nắng cùng một hình. |
| `rainy-day-care` | `rain` | `rain` | mưa | noun | easy / core | `auto` | Mây và các giọt mưa rõ silhouette. |
| `rainy-day-care` | `soil` | `soil` | đất trồng cây | noun | easy / core | `auto` | Mảng đất nâu sẫm còn ướt trong chậu. |
| `rainy-day-care` | `roots` | `roots` | rễ cây | noun | medium / expanded | `optional` | Cụm rễ cà chua nhìn qua ô đất cắt lớp. |
| `rainy-day-care` | `check-soil` | `check the soil` | kiểm tra đất | phrase | hard / challenge | `auto` | Một ngón tay chạm nhẹ mặt đất trong chậu. |
| `rainy-day-care` | `wait-for-rain-to-stop` | `wait for the rain to stop` | chờ mưa tạnh | phrase | hard / challenge | `auto` | Các giọt mưa xanh trước khi mưa biến mất. |
| `wind-and-support` | `flower` | `flower` | bông hoa | noun | easy / core | `auto` | Cây đứng vững có bông hoa vàng đã nở. |
| `wind-and-support` | `wind` | `wind` | gió | noun | easy / core | `auto` | Luồng gió xoáy cùng hai chiếc lá bay. |
| `wind-and-support` | `stem` | `stem` | thân cây | noun | easy / core | `auto` | Phần thân xanh giữa rễ và lá, crop đủ ngữ cảnh. |
| `wind-and-support` | `stake` | `stake` | cọc đỡ cây | noun | medium / expanded | `optional` | Cọc đầu tròn đã được đặt cạnh thân cây. |
| `wind-and-support` | `soft-tie` | `soft tie` | dây buộc mềm | noun | medium / expanded | `optional` | Vòng dây xanh đã buộc mềm quanh thân cây và cọc. |
| `wind-and-support` | `support-stem` | `support the stem` | đỡ thân cây | phrase | hard / challenge | `auto` | Cây nghiêng được cọc và dây mềm đỡ thẳng. |

Vocabulary IDs dùng đúng dạng:

```text
vocab-help-it-grow-new-leaf-and-sunlight-watering-can
vocab-help-it-grow-new-leaf-and-sunlight-leaf
vocab-help-it-grow-new-leaf-and-sunlight-sunlight
vocab-help-it-grow-new-leaf-and-sunlight-shade
vocab-help-it-grow-new-leaf-and-sunlight-move-into-sunlight
vocab-help-it-grow-rainy-day-care-rain
vocab-help-it-grow-rainy-day-care-soil
vocab-help-it-grow-rainy-day-care-roots
vocab-help-it-grow-rainy-day-care-check-soil
vocab-help-it-grow-rainy-day-care-wait-for-rain-to-stop
vocab-help-it-grow-wind-and-support-flower
vocab-help-it-grow-wind-and-support-wind
vocab-help-it-grow-wind-and-support-stem
vocab-help-it-grow-wind-and-support-stake
vocab-help-it-grow-wind-and-support-soft-tie
vocab-help-it-grow-wind-and-support-support-stem
```

`learningScope.minMode` và `VocabularyItem.level` phải đồng bộ: core/easy,
expanded/medium, challenge/hard. Không dùng `minAge` vì runtime chưa truyền child age vào lesson.

### Quick Recall và Action Enabler

| Concept/object | Role | Scene use | Runtime mapping |
| --- | --- | --- | --- |
| Chậu cây và đích trực quan | Action Enabler | Kéo cây vào vùng nắng hoặc dưới mái che. | Regular draggable hero-plant object/drop zones; cue Việt/visual đủ cho free journey. |
| Vòng ngày-đêm | Action Enabler | Thể hiện thời gian trước lá mới và hoa. | Regular tap object; success đổi state sau cue. |
| Mái che, mây và đích trú mưa | Action Enabler | Di chuyển chậu và cho cơn mưa đi qua. | Regular visual/drag/tap controls; phrase challenge dùng learning duplicate riêng. |
| Que đỡ | Action Enabler ở core | Giúp mọi mode đạt cùng end state. | Que và dây rời là regular object; `stake` và `soft tie` chỉ được dạy sau khi đã lắp vào cây, đồng thời giữ representative object ẩn cho Reward/review. |

Vocabulary-first revision nâng `watering can` và `soil` từ Quick Recall thành core anchors vì hình
và hành động đã đủ rõ; `soft tie` thành expanded anchor. Chậu/đích kéo, vòng thời gian, mái che,
mây và que đỡ vẫn là Action Enablers không mở pronunciation panel riêng. Hai control khám phá
`shade`/`roots` chỉ có ở expanded, không mang vocabulary riêng.

## 5. Scene 1 - `new-leaf-and-sunlight`

### Goal and rhythm

- Goal: làm cây tươi hơn, chờ lá mới xuất hiện và đặt chậu vào ánh nắng.
- Core rhythm: Narrative -> Quick Action -> Time Discovery -> Deep Learn -> Drag Action ->
  Deep Learn/Delight.
- Expanded thêm một reveal action và `shade` trước thao tác kéo chậu vào vùng nắng.
- Challenge thêm phrase `move into sunlight`, rồi mới chạy Sequence Check bằng đúng hình hành động.
- Initial state: cây non hơi rũ trong chậu, bình tưới, vòng thời gian và vùng nắng hiện; leaf
  close-up và expanded shade ẩn; action choices neutral theo scope.
- End state: cây ở vùng nắng, tươi và có thêm lá; không mọc lá tức thì ngay sau khi tưới.

### Objects and state map

| Object ID | Scope/role | Base/variants or visibility | Purpose |
| --- | --- | --- | --- |
| `new-leaf-and-sunlight-plant` | core / interactive hero | base `drooping`; variants `perked`, `new-leaf`, `sunlit` | Kéo tới sunlight zone; giữ continuity. |
| `new-leaf-and-sunlight-watering-can` | core / learning + draggable | visible -> hidden | New Anchor `watering can`, được dạy qua chính thao tác tưới. |
| `new-leaf-and-sunlight-pot-zone` | core / drop zone | tại chậu cây | Snap target cho bình tưới. |
| `new-leaf-and-sunlight-first-time-cue` | core / Action Enabler | visible | Cue ngày-đêm trước khi lá mới xuất hiện. |
| `new-leaf-and-sunlight-leaf` | core / learning | hidden -> visible | New Anchor `leaf` và review visual. |
| `new-leaf-and-sunlight-sunlight` | core / learning/drop target visual | visible | New Anchor `sunlight`; gắn với drop zone riêng. |
| `new-leaf-and-sunlight-shade-control` | expanded / Action Enabler | visible in expanded | Một fast beat mở shade trước expanded panel. |
| `new-leaf-and-sunlight-shade` | expanded / learning | hidden -> visible | New Anchor `shade`; không chặn core. |
| `new-leaf-and-sunlight-move-sunlight-action` | challenge / learning + choice | visible in challenge | New Anchor `move into sunlight`; text-free teach/review illustration. |
| `new-leaf-and-sunlight-stay-shade-action` | challenge / choice | visible in challenge | Text-free distractor; luôn neutral trước hint. |
| `new-leaf-and-sunlight-sunlight-zone` | core / drop zone | visible/available | Snap target cho hero plant. |

State transaction order:

```text
water plant       -> plant/perked + watering-can/hidden
wait              -> plant/new-leaf + leaf/visible
reveal shade      -> expanded shade/visible
move plant        -> snap plant to sunlight-zone
learn sunlight    -> plant/sunlit
```

### Frozen steps and copy

1. `new-leaf-and-sunlight-intro` — core, `intro/listen`, Narrative.
   - Target: `new-leaf-and-sunlight-plant`.
   - `instructionVi`: `Vài ngày trôi qua. Mầm đã thành cây nhỏ.`
   - `instructionEn`: `A few days pass. The sprout is now a little plant.`
   - `successFeedbackVi`: `Mình cùng giúp cây lớn khỏe nhé.`
   - `successFeedbackEn`: `Let’s help the little plant grow strong.`
   - Speech/state: none.

2. `new-leaf-and-sunlight-water-plant` — core, `teach/drag`, New Anchor.
   - Drag `new-leaf-and-sunlight-watering-can` to `new-leaf-and-sunlight-pot-zone`.
   - `instructionVi`: `Kéo bình tưới cây tới chậu cây đang hơi rũ nhé.`
   - `instructionEn`: `Drag the watering can to the pot with the drooping plant.`
   - `promptText`: `watering can`.
   - `successFeedbackVi`: `Cây tươi hơn rồi. Đây là bình tưới cây.`
   - `successFeedbackEn`: `The plant looks fresher. This is a watering can.`
   - `failFeedbackVi`: `Kéo bình tưới cây tới chậu nhé.`
   - `failFeedbackEn`: `Drag the green watering can to the plant pot.`
   - State: plant -> `perked`; hide watering can. Speech: `auto`.

3. `new-leaf-and-sunlight-wait-new-leaf` — core, `practice/tap`, Time Discovery.
   - Target: `new-leaf-and-sunlight-first-time-cue`.
   - `instructionVi`: `Chạm vòng ngày đêm để thời gian trôi qua nhé.`
   - `instructionEn`: `Tap the day-and-night circle to let time pass.`
   - `successFeedbackVi`: `Vài ngày sau, một chiếc lá mới mở ra.`
   - `successFeedbackEn`: `A few days later, a new leaf opens.`
   - `failFeedbackVi`: `Chạm vòng có mặt trời và mặt trăng nhé.`
   - `failFeedbackEn`: `Tap the circle with the sun and moon.`
   - State: plant -> `new-leaf`; show leaf. Speech: none.

4. `new-leaf-and-sunlight-learn-leaf` — core, `teach/tap`, New Anchor.
   - Target/vocab: `new-leaf-and-sunlight-leaf` / `leaf`.
   - `instructionVi`: `Lá mới màu xanh. Chạm vào chiếc lá nhé.`
   - `instructionEn`: `Tap the leaf. The new leaf is green.`
   - `promptText`: `leaf`.
   - `successFeedbackVi`: `Đúng rồi, đây là chiếc lá.`
   - `successFeedbackEn`: `Yes, this is a leaf.`
   - `failFeedbackVi`: `Chạm chiếc lá xanh cạnh cây nhé.`
   - `failFeedbackEn`: `Tap the green leaf beside the plant.`
   - Speech: `auto`. State: none.

5. `new-leaf-and-sunlight-reveal-shade` — expanded, `practice/tap`, Quick Reveal.
   - Target: `new-leaf-and-sunlight-shade-control`.
   - `instructionVi`: `Chạm mặt trời để xem chỗ nắng và chỗ râm nhé.`
   - `instructionEn`: `Tap the sun to compare the sunny place and the shady place.`
   - `successFeedbackVi`: `Mình đã thấy một vùng có bóng râm.`
   - `successFeedbackEn`: `Now we can see a shady area.`
   - `failFeedbackVi`: `Chạm hình mặt trời màu vàng nhé.`
   - `failFeedbackEn`: `Tap the yellow sun.`
   - State: show expanded shade. Speech: none.

6. `new-leaf-and-sunlight-learn-shade` — expanded, `teach/tap`, New Anchor.
   - Target/vocab: `new-leaf-and-sunlight-shade` / `shade`.
   - `instructionVi`: `Vùng tối mát là bóng râm. Chạm vào đó nhé.`
   - `instructionEn`: `Tap the cool dark area. It is shade.`
   - `promptText`: `shade`.
   - `successFeedbackVi`: `Đúng rồi, đây là bóng râm.`
   - `successFeedbackEn`: `Yes, this is shade.`
   - `failFeedbackVi`: `Chạm vùng mát có bóng lá nhé.`
   - `failFeedbackEn`: `Tap the cool area with the leaf shadow.`
   - Speech: `optional`. State: none.

7. `new-leaf-and-sunlight-move-plant` — core, `practice/drag`, Quick Action.
   - Drag `new-leaf-and-sunlight-plant` to `new-leaf-and-sunlight-sunlight-zone`.
   - `instructionVi`: `Kéo chậu cây vào vùng nắng sáng nhé.`
   - `instructionEn`: `Drag the plant pot into the sunlight.`
   - `successFeedbackVi`: `Chậu cây đã ở chỗ có nắng.`
   - `successFeedbackEn`: `The plant pot is now in the sunlight.`
   - `failFeedbackVi`: `Đưa chậu tới vùng có tia nắng vàng nhé.`
   - `failFeedbackEn`: `Move the pot to the area with yellow sunbeams.`
   - State: snap plant to sunlight zone. Speech: none.

8. `new-leaf-and-sunlight-learn-sunlight` — core, `teach/tap`, New Anchor/Delight.
   - Target/vocab: `new-leaf-and-sunlight-sunlight` / `sunlight`.
   - `instructionVi`: `Vùng sáng ấm là ánh nắng. Chạm vào đó nhé.`
   - `instructionEn`: `Tap the warm bright area. It is sunlight.`
   - `promptText`: `sunlight`.
   - `successFeedbackVi`: `Đúng rồi, cây đang đón ánh nắng.`
   - `successFeedbackEn`: `Yes, the plant is enjoying the sunlight.`
   - `failFeedbackVi`: `Chạm vùng có các tia nắng vàng nhé.`
   - `failFeedbackEn`: `Tap the area with the yellow sunbeams.`
   - State: plant -> `sunlit`; sparkle plant. Speech: `auto`.

9. `new-leaf-and-sunlight-follow-the-light` — core, `practice/tap`, Observation.
   - Bé chạm leaf close-up để thấy lá hướng về phía sáng; sparkle chỉ áp dụng cho leaf.
   - `instructionVi` / `instructionEn`: `Lá đang hướng về phía sáng. Chạm chiếc lá nhé.` /
     `The leaf is turning toward the light. Tap the leaf.`
   - Success: `Chiếc lá đang đón ánh nắng.` / `The leaf is reaching toward the sunlight.`
   - Fail: `Chạm chiếc lá xanh cạnh chậu nhé.` / `Tap the green leaf beside the pot.`
   - Không có `vocabId` hoặc pronunciation panel mới.

10. `new-leaf-and-sunlight-see-healthy-plant` — core, `practice/tap`, Payoff.
    - Bé chạm hero plant đã tươi hơn và có lá mới.
    - `instructionVi` / `instructionEn`: `Chạm cây nhỏ đang tươi hơn trong nắng nhé.` /
      `Tap the little plant that looks healthier in the sunlight.`
    - Success: `Cây tươi hơn và có thêm một chiếc lá.` /
      `The plant looks healthier and has a new leaf.`
    - Fail: `Chạm chậu cây ở giữa nhé.` / `The plant pot is in the middle.`
    - Challenge action choices chỉ được mở sau payoff này để không gây nhiễu các nhịp trước.

11. `new-leaf-and-sunlight-choose-sunlight-action` — challenge, `review/tap`, Sequence Check.
    - Choices: `new-leaf-and-sunlight-move-sunlight-action` (correct) and
      `new-leaf-and-sunlight-stay-shade-action` (distractor).
    - `instructionVi`: `Đâu là hình chuyển chậu vào vùng nắng?`
    - `instructionEn`: `Which picture moves the pot into the sunlight?`
    - `successFeedbackVi`: `Đúng rồi, mình đưa cây vào chỗ có nắng.`
    - `successFeedbackEn`: `Right, we move the plant into the sunlight.`
    - `failFeedbackVi`: `Tìm hình chậu đi về phía tia nắng nhé.`
    - `failFeedbackEn`: `Find the picture of the pot moving toward the sunbeams.`
    - `correctObjectIds`: only the move-sunlight action. Đáp án đúng sparkle, distractor mờ trong
      lúc phát feedback; `afterSuccessStateChanges` ẩn cả hai choice illustrations khi chuyển bước.
      Speech: none.

### Scene completion reward

- `stars`: `3`
- `messageVi`: `Bé đã giúp cây có lá mới và đón ánh nắng.`
- `messageEn`: `You helped the plant grow a new leaf and find sunlight.`

## 6. Scene 2 - `rainy-day-care`

### Goal and rhythm

- Goal: nhận biết mưa, đưa chậu nhỏ vào mái che và kiểm tra đất trước khi tưới.
- Core rhythm: Weather Discovery -> Deep Learn -> Drag Action -> Cause Check/Delight.
- Expanded dùng một reveal action trước pronunciation panel `roots`.
- Challenge dạy `check the soil` sau khi bé đã thực hiện đúng hành động, rồi kiểm tra bằng hai
  action illustrations.
- Initial state: cây nhiều lá đang ướt ngoài mái che, mây xám/rain hiện; roots hidden.
- End state: cây ở dưới mái che, đất vẫn ướt nên không tưới thêm; sau khi bé hoàn tất quyết định,
  mây và mưa đi qua để đóng tình huống. Đây là kịch bản được author sẵn, không phải simulation độ
  ẩm/branching.

### Objects and state map

| Object ID | Scope/role | Base/variants or visibility | Purpose |
| --- | --- | --- | --- |
| `rainy-day-care-plant` | core / interactive hero | base `rain-wet`; variant `sheltered` | Kéo chậu nhỏ vào mái che. |
| `rainy-day-care-cloud` | core / Action Enabler | visible -> hidden | Bé chạm để kết thúc cơn mưa sau cause check. |
| `rainy-day-care-rain` | core / learning | visible -> hidden | New Anchor `rain`, rồi ẩn cùng cloud khi mưa qua. |
| `rainy-day-care-shelter-zone` | core / drop zone | visible | Đích kéo trực quan dưới mái che. |
| `rainy-day-care-soil` | core / Quick Recall | base `wet`; variant `checked-wet` | Kiểm tra tình huống đất còn ướt. |
| `rainy-day-care-root-window-control` | expanded / Action Enabler | visible in expanded | Mở cutaway roots. |
| `rainy-day-care-roots` | expanded / learning | hidden -> visible | New Anchor `roots`. |
| `rainy-day-care-check-soil-action` | challenge / phrase learning choice | visible in challenge | Text-free action visual và phrase representative. |
| `rainy-day-care-pour-water-action` | challenge / distractor | visible in challenge | Không có dấu X/text; neutral trước hint. |

State transaction order:

```text
move plant         -> snap under shelter + plant/sheltered
open root window   -> expanded roots/visible
check soil         -> soil/checked-wet
let rain pass      -> cloud/hidden + rain/hidden
```

### Frozen steps and copy

1. `rainy-day-care-intro` — core, `intro/listen`, Narrative.
   - Target: `rainy-day-care-rain`.
   - `instructionVi`: `Mây xám kéo tới. Mưa bắt đầu rơi.`
   - `instructionEn`: `Gray clouds arrive. Rain begins to fall.`
   - `successFeedbackVi`: `Mình cùng chăm chậu cây nhỏ nhé.`
   - `successFeedbackEn`: `Let’s care for the little plant pot.`
   - Speech/state: none.

2. `rainy-day-care-learn-rain` — core, `teach/tap`, New Anchor/Weather Discovery.
   - Target/vocab: `rainy-day-care-rain` / `rain`.
   - `instructionVi`: `Nước rơi từ mây gọi là mưa. Chạm giọt mưa nhé.`
   - `instructionEn`: `Tap the raindrops. Water falling from clouds is rain.`
   - `promptText`: `rain`.
   - `successFeedbackVi`: `Đúng rồi, đây là mưa.`
   - `successFeedbackEn`: `Yes, this is rain.`
   - `failFeedbackVi`: `Chạm các giọt nước dưới đám mây nhé.`
   - `failFeedbackEn`: `Tap the water drops below the cloud.`
   - Speech: `auto`. State: none.

3. `rainy-day-care-move-under-shelter` — core, `practice/drag`, Quick Action.
   - Drag `rainy-day-care-plant` to `rainy-day-care-shelter-zone`.
   - `instructionVi`: `Mưa nhiều rồi. Kéo chậu nhỏ vào mái che nhé.`
   - `instructionEn`: `There is plenty of rain. Drag the small pot under the shelter.`
   - `successFeedbackVi`: `Chậu nhỏ đã ở dưới mái che.`
   - `successFeedbackEn`: `The small pot is under the shelter.`
   - `failFeedbackVi`: `Kéo chậu nhỏ tới chỗ có mái che nhé.`
   - `failFeedbackEn`: `Drag the small pot to the covered area.`
   - State: snap plant under shelter; plant -> `sheltered`. Speech: none.

4. `rainy-day-care-check-sheltered-plant` — core, `practice/tap`, Immediate Payoff.
   - Bé chạm cây dưới mái che để xác nhận mưa không còn tạt vào cây.
   - `instructionVi` / `instructionEn`: `Cây đã dưới mái che. Chạm chậu cây nhé.` /
     `The plant is under the shelter. Tap the plant pot.`
   - Success: `Mưa không còn tạt vào cây nhỏ.` /
     `The rain is no longer hitting the little plant.`
   - Fail: `Chạm chậu cây dưới mái che nhé.` / `The plant pot is under the shelter.`
   - State: none; sparkle hero plant. Speech: none.

5. `rainy-day-care-reveal-roots` — expanded, `practice/tap`, Discovery.
   - Target: `rainy-day-care-root-window-control`.
   - `instructionVi`: `Chạm kính tròn để nhìn dưới lớp đất nhé.`
   - `instructionEn`: `Tap the round window to look under the soil.`
   - `successFeedbackVi`: `Mình đã nhìn thấy phần cây dưới đất.`
   - `successFeedbackEn`: `Now we can see the part of the plant under the soil.`
   - `failFeedbackVi`: `Chạm chiếc kính tròn cạnh chậu nhé.`
   - `failFeedbackEn`: `Tap the round window beside the pot.`
   - State: show roots. Speech: none.

6. `rainy-day-care-learn-roots` — expanded, `teach/tap`, New Anchor.
   - Target/vocab: `rainy-day-care-roots` / `roots`.
   - `instructionVi`: `Các nhánh dưới đất là rễ cây. Chạm vào rễ nhé.`
   - `instructionEn`: `Tap the branching parts under the soil. They are roots.`
   - `promptText`: `roots`.
   - `successFeedbackVi`: `Đúng rồi, rễ nằm dưới đất.`
   - `successFeedbackEn`: `Yes, roots grow under the soil.`
   - `failFeedbackVi`: `Chạm các nhánh nhỏ dưới lớp đất nhé.`
   - `failFeedbackEn`: `Tap the small branches under the soil.`
   - Speech: `optional`. State: none.

7. `rainy-day-care-check-wet-soil` — core, `practice/tap`, Cause Check.
   - Target: `rainy-day-care-soil`.
   - `instructionVi`: `Chạm vào đất để xem còn ướt không nhé.`
   - `instructionEn`: `Tap the soil to see whether it is still wet.`
   - `successFeedbackVi`: `Đất còn ướt. Mình chưa tưới thêm.`
   - `successFeedbackEn`: `The soil is still wet. We do not add more water.`
   - `failFeedbackVi`: `Chạm phần đất sẫm màu trong chậu nhé.`
   - `failFeedbackEn`: `Tap the dark soil in the pot.`
   - State: soil -> `checked-wet`; sparkle sheltered plant. Speech: none.

8. `rainy-day-care-learn-check-soil` — challenge, `teach/tap`, New Anchor.
   - Target/vocab: `rainy-day-care-check-soil-action` / `check the soil`.
   - `instructionVi`: `Kiểm tra đất trước khi tưới. Chạm hình ngón tay nhé.`
   - `instructionEn`: `Check the soil before watering. Tap the picture with the finger.`
   - `promptText`: `check the soil`.
   - `successFeedbackVi`: `Đúng rồi, mình kiểm tra đất trước.`
   - `successFeedbackEn`: `Yes, check the soil first.`
   - `failFeedbackVi`: `Chạm hình ngón tay chạm vào đất nhé.`
   - `failFeedbackEn`: `Tap the picture of the finger touching the soil.`
   - Speech: `auto`. State: none.

9. `rainy-day-care-choose-check-soil` — challenge, `review/tap`, Sequence Check.
    - Choices: check-soil action (correct), pour-water action (distractor).
    - `instructionVi`: `Đâu là hình kiểm tra đất trước khi tưới?`
    - `instructionEn`: `Which picture shows checking the soil before watering?`
    - `promptText`: `check the soil`.
    - `successFeedbackVi`: `Đúng rồi, hãy kiểm tra đất trước.`
    - `successFeedbackEn`: `Right, check the soil first.`
    - `failFeedbackVi`: `Tìm hình ngón tay chạm vào đất nhé.`
    - `failFeedbackEn`: `Find the picture of the finger touching the soil.`
    - `correctObjectIds`: only check-soil action. Đáp án đúng sparkle, distractor mờ trong lúc phát
      feedback; `afterSuccessStateChanges` ẩn cả hai trước các nhịp mưa qua/cây an toàn. Speech:
      none.

10. `rainy-day-care-let-rain-pass` — core, `practice/tap`, Weather Payoff.
    - Bé chạm cloud sau cause check; state ẩn cloud và rain.
    - `instructionVi` / `instructionEn`: `Chạm đám mây để cơn mưa đi qua nhé.` /
      `Tap the cloud to let the rain pass.`
    - Success: `Mưa đã ngớt. Cây vẫn an toàn dưới mái che.` /
      `The rain has stopped. The plant is safe under the shelter.`
    - Fail: `Chạm đám mây xám phía trên nhé.` / `The gray cloud is above the plant.`
    - Cơn mưa kết thúc sau khi cây đã được che, không làm đất khô tức thì.

11. `rainy-day-care-see-safe-plant` — core, `practice/tap`, Closure.
    - Bé chạm hero plant và nghe xác nhận cây an toàn, đất vẫn còn ướt.
    - `instructionVi` / `instructionEn`: `Trời sáng lại rồi. Chạm cây nhỏ nhé.` /
      `The sky is bright again. Tap the little plant.`
    - Success: `Cây an toàn, đất vẫn còn ướt.` /
      `The plant is safe, and the soil is still wet.`
    - Fail: `Chạm chậu cây dưới mái che nhé.` / `The plant pot is under the shelter.`
    - State: none; sparkle hero plant. Speech: none.

### Scene completion reward

- `stars`: `3`
- `messageVi`: `Bé đã giúp cây trú mưa và kiểm tra đất trước khi tưới.`
- `messageEn`: `You sheltered the plant and checked the soil before watering.`

## 7. Scene 3 - `wind-and-support`

### Goal and rhythm

- Goal: nhận biết gió/thân cây, dùng que và dây mềm để giúp cây đứng vững.
- Core rhythm: Deep Learn -> Drag -> Drag -> Deep Learn -> Time Celebration.
- Expanded dạy `stake` sau khi bé đã dùng que đỡ như Action Enabler.
- Challenge dạy/review `support the stem` sau visible supported state.
- Initial state: cây nhiều lá lay động, wind visible, support objects tách rời.
- End state: hero plant được cọc và dây mềm đỡ thẳng; cue ngày-đêm cho thấy bông hoa vàng đã nở.

### Objects and state map

| Object ID | Scope/role | Base/variants or visibility | Purpose |
| --- | --- | --- | --- |
| `wind-and-support-plant` | core / hero + learning | representative base `flower-bud`; initial variant `swaying`, rồi `leaning`, `staked`, `supported`, `flower-bud` | Main state chain; Reward/review lấy đúng hình có hoa nhưng gameplay vẫn bắt đầu ở cây lay động. |
| `wind-and-support-wind` | core / learning | visible -> hidden | New Anchor `wind` và review visual. |
| `wind-and-support-stem` | core / learning close-up | visible | New Anchor `stem`, giữ đủ ngữ cảnh lá/thân. |
| `wind-and-support-stick` | core / Action Enabler | visible -> hidden | Que đỡ dùng ở mọi mode. |
| `wind-and-support-installed-stake` | core / interactive installed state | hidden -> visible | End-state support asset, được scale sát thân cây nhưng giữ touch rect rộng, và là target dạy `stake` sau hành động đặt cọc. |
| `wind-and-support-stake` | expanded / hidden representative | hidden | Giữ mapping hình cọc đã lắp cho Reward/review, không tạo thêm cue rời trên scene. |
| `wind-and-support-soft-tie` | core / Action Enabler | visible -> hidden | Dây mềm, không target word. |
| `wind-and-support-soft-tie-vocabulary` | expanded / hidden representative | hidden | Giữ mapping hình dây đã lắp cho Reward/review, không tạo cue rời trên scene. |
| `wind-and-support-installed-tie` | core / interactive installed state | hidden -> visible | End state, được scale quanh thân/cọc nhưng giữ touch rect rộng, và là target dạy `soft tie`. |
| `wind-and-support-support-stem-action` | challenge / phrase learning choice | visible in challenge | Text-free correct action visual. |
| `wind-and-support-leave-leaning-action` | challenge / distractor | visible in challenge | Neutral distractor, không dấu X. |
| `wind-and-support-time-cue` | core / Action Enabler | visible | Cue ngày-đêm trước bông hoa. |
| `wind-and-support-stick-zone` | core / drop zone | cạnh cây | Snap target cho support stick. |
| `wind-and-support-tie-zone` | core / drop zone | quanh stake/stem | Snap target cho soft tie. |

State transaction order:

```text
learn wind         -> plant/leaning
place stick        -> stick/hidden + installed-stake/visible + plant/staked
place soft tie     -> tie/hidden + installed-tie/visible + plant/supported
wait               -> plant/flower-bud
test support       -> wind/hidden
```

### Frozen steps and copy

1. `wind-and-support-intro` — core, `intro/listen`, Narrative.
   - Target: `wind-and-support-plant`.
   - `instructionVi`: `Gió mạnh lên. Cây nhỏ đang lay động.`
   - `instructionEn`: `The wind is stronger. The little plant is moving.`
   - `successFeedbackVi`: `Mình cùng giúp cây đứng vững nhé.`
   - `successFeedbackEn`: `Let’s help the plant stand tall.`
   - Speech/state: none.

2. `wind-and-support-learn-wind` — core, `teach/tap`, New Anchor.
   - Target/vocab: `wind-and-support-wind` / `wind`.
   - `instructionVi`: `Không khí thổi làm lá rung. Chạm luồng gió nhé.`
   - `instructionEn`: `Tap the wind. Moving air makes the leaves shake.`
   - `promptText`: `wind`.
   - `successFeedbackVi`: `Đúng rồi, đây là gió.`
   - `successFeedbackEn`: `Yes, this is wind.`
   - `failFeedbackVi`: `Chạm luồng xoáy có những chiếc lá bay nhé.`
   - `failFeedbackEn`: `Tap the swirl with the flying leaves.`
   - State: plant -> `leaning`. Speech: `auto`.

3. `wind-and-support-place-stick` — core, `practice/drag`, Quick Action.
   - Drag `wind-and-support-stick` to `wind-and-support-stick-zone`.
   - `instructionVi`: `Kéo que đỡ vào chỗ cạnh cây nhé.`
   - `instructionEn`: `Drag the support stick to the spot beside the plant.`
   - `successFeedbackVi`: `Que đỡ đã đứng cạnh cây.`
   - `successFeedbackEn`: `The support stick is standing beside the plant.`
   - `failFeedbackVi`: `Kéo que dài tới vòng đất cạnh cây nhé.`
   - `failFeedbackEn`: `Drag the long stick to the soil circle beside the plant.`
   - State: hide loose stick; show installed stake; plant -> `staked`. Speech: none.

4. `wind-and-support-learn-stake` — expanded, `teach/tap`, New Anchor.
   - Target/vocab: `wind-and-support-installed-stake` / `stake`.
   - `instructionVi`: `Que dài đỡ cây là cọc đỡ. Chạm vào cọc nhé.`
   - `instructionEn`: `Tap the long plant support. It is a stake.`
   - `promptText`: `stake`.
   - `successFeedbackVi`: `Đúng rồi, cọc giúp đỡ cây.`
   - `successFeedbackEn`: `Yes, the stake helps support the plant.`
   - `failFeedbackVi`: `Chạm chiếc cọc dài đầu tròn cạnh cây nhé.`
   - `failFeedbackEn`: `Tap the long rounded stake beside the plant.`
   - Speech: `optional`. State: none.

5. `wind-and-support-place-soft-tie` — core, `practice/drag`, Quick Action.
   - Drag `wind-and-support-soft-tie` to `wind-and-support-tie-zone`.
   - `instructionVi`: `Kéo dây mềm tới cọc để giữ cây nhé.`
   - `instructionEn`: `Drag the soft tie to the stake to hold the plant.`
   - `successFeedbackVi`: `Dây buộc lỏng giúp cây đứng thẳng.`
   - `successFeedbackEn`: `The loose tie helps the plant stand tall.`
   - `failFeedbackVi`: `Kéo dây mềm tới chỗ cọc cạnh thân nhé.`
   - `failFeedbackEn`: `Drag the soft tie to the stake beside the stem.`
   - State: hide loose tie; show installed tie; plant -> `supported`. Speech: none.

6. `wind-and-support-learn-stem` — core, `teach/tap`, New Anchor.
   - Target/vocab: `wind-and-support-stem` / `stem`.
   - `instructionVi`: `Phần xanh nâng lá là thân cây. Chạm vào thân nhé.`
   - `instructionEn`: `Tap the green part holding the leaves. It is the stem.`
   - `promptText`: `stem`.
   - `successFeedbackVi`: `Đúng rồi, cọc đang đỡ thân cây.`
   - `successFeedbackEn`: `Yes, the stake is supporting the stem.`
   - `failFeedbackVi`: `Chạm phần xanh dài dưới các lá nhé.`
   - `failFeedbackEn`: `Tap the long green part below the leaves.`
   - Speech: `auto`. State: none.

7. `wind-and-support-wait-for-flower-bud` — core, `practice/tap`, Time Celebration.
   - Target: `wind-and-support-time-cue`.
   - `instructionVi`: `Chạm vòng ngày đêm để xem cây lớn thêm nhé.`
   - `instructionEn`: `Tap the day-and-night circle and watch the plant grow.`
   - `successFeedbackVi`: `Vài ngày sau, cây đứng thẳng và có một bông hoa.`
   - `successFeedbackEn`: `A few days later, the plant stands tall with a flower.`
   - `failFeedbackVi`: `Chạm vòng có mặt trời và mặt trăng nhé.`
   - `failFeedbackEn`: `Tap the circle with the sun and moon.`
   - State: plant -> `flower-bud`; sparkle plant. Speech: none.

8. `wind-and-support-learn-soft-tie` — expanded, `teach/tap`, New Anchor.
   - Target/vocab: `wind-and-support-installed-tie` / `soft tie`.
   - `instructionVi`: `Chạm dây buộc mềm đang giữ thân cây cạnh cọc nhé.`
   - `instructionEn`: `Tap the soft tie holding the stem beside the stake.`
   - `promptText`: `soft tie`.
   - `successFeedbackVi`: `Đúng rồi, đây là dây buộc mềm.`
   - `successFeedbackEn`: `Yes, this is a soft tie.`
   - `failFeedbackVi`: `Chạm vòng dây xanh quanh thân cây và cọc nhé.`
   - `failFeedbackEn`: `Tap the green tie around the stem and stake.`
   - Speech: `optional`. State: none.

9. `wind-and-support-test-support` — core, `practice/tap`, Cause/Effect Check.
   - Bé chạm wind thêm một lần để thử cọc và dây đã lắp.
   - `instructionVi` / `instructionEn`: `Gió lại thổi. Chạm luồng gió để thử cọc đỡ nhé.` /
     `The wind blows again. Tap the wind to test the support.`
   - Success: `Cọc và dây giữ cây đứng vững.` /
     `The stake and tie keep the plant standing tall.`
   - Fail: `Chạm luồng gió có lá bay nhé.` / `Tap the wind swirl with the flying leaves.`
   - State: hide wind; bounce installed stake/tie; sparkle hero plant. Speech: none.

10. `wind-and-support-learn-support-stem` — challenge, `teach/tap`, New Anchor.
   - Target/vocab: `wind-and-support-support-stem-action` / `support the stem`.
   - `instructionVi`: `Đỡ thân cây cho cây đứng vững. Chạm hình có cọc nhé.`
   - `instructionEn`: `Support the stem so the plant stands tall. Tap the picture with the stake.`
   - `promptText`: `support the stem`.
   - `successFeedbackVi`: `Đúng rồi, cọc đang đỡ thân cây.`
   - `successFeedbackEn`: `Yes, the stake supports the stem.`
   - `failFeedbackVi`: `Chạm hình cây được cọc đỡ thẳng nhé.`
   - `failFeedbackEn`: `Tap the picture of the plant standing with the stake.`
   - Speech: `auto`. State: none.

11. `wind-and-support-choose-support-stem` — challenge, `review/tap`, Sequence Check.
    - Choices: support-stem action (correct), leave-leaning action (distractor).
    - `instructionVi`: `Đâu là hình đỡ thân cây đứng vững?`
    - `instructionEn`: `Which picture shows supporting the stem?`
    - `promptText`: `support the stem`.
    - `successFeedbackVi`: `Đúng rồi, mình đỡ thân cây.`
    - `successFeedbackEn`: `Right, support the stem.`
    - `failFeedbackVi`: `Tìm hình cây đứng thẳng cạnh cọc nhé.`
    - `failFeedbackEn`: `Find the plant standing tall beside the stake.`
    - `correctObjectIds`: only support-stem action. Đáp án đúng sparkle, distractor mờ trong lúc
      phát feedback; `afterSuccessStateChanges` ẩn cả hai choice illustrations khi chuyển bước.
      Speech: none.

12. `wind-and-support-find-flower-bud` — core, `teach/tap`, New Anchor + payoff.
   - Bé chạm hero plant để tìm bông hoa vàng sau cue thời gian.
   - `instructionVi` / `instructionEn`: `Chạm cây đứng vững để tìm bông hoa màu vàng nhé.` /
     `Tap the standing plant to find the yellow flower.`
   - `promptText`: `flower`.
   - Success: `Đúng rồi, cây đã có một bông hoa.` / `Yes, the plant now has a flower.`
   - Fail: `Chạm chậu cây có bông hoa vàng ở giữa nhé.` /
     `The plant with the yellow flower is in the middle.`
   - Speech: `auto`. Vocabulary-first runtime đặt payoff này sau challenge teach/review để luôn
     kết thúc mini-scene bằng target `flower`.

### Scene completion reward

- `stars`: `3`
- `messageVi`: `Bé đã giúp cây có lá mới và đứng vững.`
- `messageEn`: `You helped the plant grow new leaves and stand tall.`

## 8. Speech and pacing audit

| Mode | Pronunciation panels in authored order | Separation evidence |
| --- | --- | --- |
| core | `watering can`, `leaf`, `sunlight`, `rain`, `soil`, `wind`, `stem`, `flower` (`auto`) | Mỗi cặp được ngăn bởi reveal/drag/protection/time beat; không có hai panel liền nhau. |
| expanded | Core + `shade`, `roots`, `stake`, `soft tie` (`optional`) | Mỗi optional panel đứng sau một action và trước một action khác. |
| challenge | 12 mục trên + `move into sunlight`, `check the soil`, `wait for the rain to stop`, `support the stem` (`auto`) | Phrase teach đứng trước phrase review; các panel vẫn được ngăn bằng action/time/review beat. |

- Mỗi New Anchor có đúng một speech-practice encounter.
- Các Quick Recall/Action Enabler còn lại không có `vocabId`, `speechPractice` hoặc model-word
  audio riêng; `watering can`, `soil` và `soft tie` không còn thuộc nhóm này.
- `optional` vẫn là interruption và đã được tính trong pacing audit.
- Challenge phrase có text-free teach image trước review; review instruction nhắc nghĩa Việt.
- Core có nhịp 7-7-7, expanded là 9-9-9 và challenge là 11-12-11. Đây là số
  tương tác của từng mini-scene ngoài intro, không phải tổng bước của cả lesson hiển thị một lần.

## 9. Review freeze

`reviewGame.config.vocabularyIds` khóa bốn core anchors và hai mục bổ sung xác định theo thứ tự:

```text
vocab-help-it-grow-new-leaf-and-sunlight-leaf
vocab-help-it-grow-new-leaf-and-sunlight-sunlight
vocab-help-it-grow-rainy-day-care-rain
vocab-help-it-grow-wind-and-support-wind
vocab-help-it-grow-new-leaf-and-sunlight-shade
vocab-help-it-grow-rainy-day-care-check-soil
```

Với vocabulary/scene order đã khóa, `getReviewGameItems()` phải trả:

- core (4): `leaf`, `sunlight`, `rain`, `wind`;
- expanded (5): bốn core items + `shade`;
- challenge (6): năm expanded items + `check the soil`.

Các New Anchor còn lại vẫn được học và luyện phát âm nhưng không nằm trong default 4/5/6
selection. Runtime không được đưa Quick Recall/Action Enabler vào review pool.
Review art của `sunlight`/`shade`, `wind`/`rain` và phrase/action phải có silhouette khác nhau,
không chỉ khác màu hoặc state của cùng một object.

Để phép bổ sung medium/hard có tính xác định, implementation phải giữ thứ tự `vocabulary` theo
từng scene đúng bảng ở mục 4 và giữ thứ tự scene ở mục 2. Test phải assert kết quả executable từ
`getReviewGameItems()`; không suy ra kết quả chỉ từ số lượng New Anchor thô.

## 10. Production-sheet and asset inventory

Mỗi scene dùng một production sheet chung để khóa style, ánh sáng và tỷ lệ; sau đó cắt thành một
background và các transparent PNG masters. Raster không chứa chữ, caption, dấu X hoặc baked card
background. Source masters sẽ nằm tại:

```text
src/assets/source/master/lessons/help-it-grow/<scene-id>/images/*.png
```

### Sheet 1: `new-leaf-and-sunlight`

```text
background.png
plant-drooping.png
plant-perked.png
plant-new-leaf.png
plant-sunlit.png
watering-can.png
time-cue.png
leaf.png
shade-control.png
sunlight.png
shade.png
move-sunlight-action.png
stay-shade-action.png
```

### Sheet 2: `rainy-day-care`

```text
background.png
plant-rain-wet.png
plant-sheltered.png
cloud-gray.png
rain.png
soil-wet.png
soil-checked-wet.png
root-window-control.png
roots.png
check-soil-action.png
pour-water-action.png
```

### Sheet 3: `wind-and-support`

```text
background.png
plant-swaying.png
plant-leaning.png
plant-staked.png
plant-supported.png
plant-flower-bud.png
wind.png
stem.png
support-stick.png
installed-stake.png
stake.png
soft-tie.png
installed-tie.png
support-stem-action.png
leave-leaning-action.png
time-cue.png
```

Bundled map icons được tạo ở Mốc 4C với keys:

- scene icons: `newLeafSunlight`, `rainyDayCare`, `windAndSupport`;
- lesson milestone: `milestoneHelpItGrow`;
- lesson map icon mặc định: `newLeafSunlight`.

Các PNG đã tồn tại trước khi keys được thêm vào `SKidsIconName` và icon tests đã được cập nhật.

## 11. Acceptance tests for implementation

### Data and mode filtering

1. Lesson ID/theme ID/order và ba scene IDs đúng freeze.
2. Mode vocabulary counts là 8 core, 12 expanded và 16 challenge.
3. `learningScope.minMode`/`level` đồng bộ easy/medium/hard.
4. Mọi object/step/drop zone/state target còn tồn tại sau filtering ở từng mode.
5. Cả ba mode kết thúc ở hero plant variant kỹ thuật `flower-bud`, nhưng user-facing target và
   hình hiện hành là bông hoa vàng đã nở; expanded/challenge không đổi core end state.

### Role and speech policy

6. New Anchors có đúng một encounter với speech mode đã khóa.
7. Các Quick Recall/Action Enablers còn lại không tạo `VocabularyItem`, learned-word ID hoặc
   speech panel.
8. Không có hai pronunciation panels liền nhau trong core/expanded/challenge sau filtering.
9. Phrase teach xảy ra trước phrase review và dùng visual không chữ.
10. Số tương tác ngoài intro theo thứ tự scene là core 7/7/7, expanded 9/9/9 và challenge
    11/12/11; test phải đếm kết quả sau `getSceneForLearningMode()` thay vì raw authoring steps.

### Scene State and interaction

11. Chỉ correct interaction áp dụng state changes; fail/ignored giữ nguyên state.
12. Time cue xảy ra trước `new-leaf` và `flower-bud` state.
13. Rain scenario luôn author đất còn ướt; không có branching/tưới tự động giả lập.
14. Core dùng regular support stick/tie để hoàn thành; `stake` expanded không là prerequisite.
15. Multi-choice `correctObjectIds` có đúng một ID; distractor không pulse/bounce khi replay/hint.
16. Success effect mặc định chỉ áp dụng object bé chọn, trừ explicit plant sparkle.
17. Plant variants không làm mất kết quả trước đó; installed stake/tie không bị bake lặp vào plant.

### Review and assets

18. `getReviewGameItems()` trả exact 4/5/6 words đã khóa và sáu `visualId` khác nhau.
19. Mọi base/variant/hidden asset nằm trong lesson manifest và qua audit/build/verify.
20. Cutout có alpha, không chữ/nền card; touch target đạt tối thiểu 48dp và không overlap.
21. Core và expanded child path được chạy riêng trên Android, không cần đọc text.
22. Audio dry-run hết missing/invalid trước generate; VI/EN production copy khớp freeze.

## 12. Mốc 4C implementation status

Mốc 4C đã author `src/data/lessons/helpItGrow.ts`, đăng ký lesson ngay sau `plant-a-seed`, thêm
validator/tests, tạo ba production sheets và cắt thành masters theo inventory này. Corpus ban
đầu có 246 audio và 40 ảnh. Bản nhịp mở rộng dùng lại toàn bộ assets/state, thêm 57 audio Google
TTS; R2 đã upload và dry-run verify đủ 343/343 object (`Changed/new: 0`) ngày 2026-08-13.

## 13. Vocabulary-first revision - 2026-08-25

Mục này thay thế các chi tiết 5/8/10 và copy `flower bud` còn được giữ trong storyboard lịch sử ở
trên. Runtime mới ưu tiên số encounter có ý nghĩa cho việc học từ và phát âm, không thêm bước chỉ
để kéo dài bài.

### Contract thực thi

- Vocabulary: core 8, expanded 12, challenge 16, đúng thứ tự bảng New Anchors ở mục 4.
- Pronunciation: core 8 `auto`; expanded giữ 8 `auto` và thêm 4 `optional`; challenge có 12
  encounter trước đó và thêm 4 phrase `auto`.
- Meaningful turns ngoài intro: core `7/7/7` (21), expanded `9/9/9` (27), challenge
  `11/12/11` (34).
- Không có hai pronunciation panel liền nhau sau mode filtering.
- Review vẫn là 4/5/6: `leaf`, `sunlight`, `rain`, `wind`; thêm `shade`; rồi thêm
  `check the soil`.

### Các encounter mới hoặc được nâng cấp

1. `watering can` dùng chính bình tưới kéo tới chậu; hành động dạy từ và phát âm `auto`.
2. `move into sunlight` dùng illustration chậu + mũi tên + tia nắng; challenge teach xảy ra trước
   câu chọn hình review.
3. `soil` dùng mảng đất ướt trong chậu sau khi bé quan sát mưa; core teach và phát âm `auto`.
4. `wait for the rain to stop` dùng duplicate giọt mưa chỉ hiện đúng beat challenge; phrase teach
   xảy ra sau `check the soil` và trước khi cơn mưa đi qua.
5. `soft tie` dùng vòng dây xanh đã lắp quanh thân cây và cọc; expanded teach `optional` sau cue
   thời gian.
6. `flower` dùng cây đứng vững có bông hoa vàng đã nở; core teach `auto` là payoff cuối scene.

Asset filename/variant `plant-flower-bud.png` và ID `find-flower-bud` được giữ ổn định để tránh
đổi technical key, nhưng tuyệt đối không đọc thành `flower bud` trong copy/audio. Revision dùng
lại toàn bộ 40 image assets. Google TTS tạo đúng 58 audio delta; lesson audit đạt 439 target và
full-corpus audit đạt 16.012 target, đều missing 0/invalid 0. Image build chỉ rebuild
`rain.webp` từ master hiện hành, nên R2 upload tổng cộng 59 object delta và verify đủ 401/401;
post-upload dry-run còn `Changed/new: 0`. Audio en-US `move_into_sunlight.mp3` tải qua production
CDN khớp local theo size 18.477 byte và SHA-256 ngày 2026-08-25.

Follow-up installed-state audit đã được generate/publish trong full-corpus delta ngày 2026-08-25.
Remote verify đạt 21.296/21.296 object, lỗi 0 và post-upload `Changed/new: 0`; device smoke test
chưa chạy.
