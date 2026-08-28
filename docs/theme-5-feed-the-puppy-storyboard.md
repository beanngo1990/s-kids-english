# Theme 5 Storyboard v2 — Feed the Puppy

**Lesson ID:** `feed-the-puppy`
**Theme:** `nhung-nguoi-ban-dong-vat`
**Freeze date:** 2026-08-14
**Status:** v2 production baseline và audit revision 2026-08-25 đã publish audio/ảnh lên R2 và
verify remote; còn chờ device QA.
**Track:** `3-8 tuổi · Làm quen`

## 1. Learning promise

Bé làm quen với một chú cún, chuẩn bị bữa ăn và giúp cún dùng bữa an toàn. Bản v2 dùng lại nhịp
đã chứng minh ở Theme 1: mỗi từ có một lượt nghe–nói và ngay sau đó là một hành động làm câu
chuyện tiến lên. Review vẫn chỉ lấy 4/5/6 item phù hợp với từng mode; số item review không phải
giới hạn số từ bé được học trong lesson.

| Mode | Vocabulary | Hành động ngoài intro | Cơ hội nói | Auto micro | Review |
| --- | ---: | ---: | ---: | ---: | ---: |
| Core | 9 | 18 | 9 | 9 | 4 |
| Expanded | 18 | 36 | 18 | 12 | 5 |
| Challenge | 27 | 54 | 27 | 15 | 6 |

Lesson có ba scene. Mỗi scene đóng góp 3/6/9 từ, 6/12/18 hành động, 3/6/9 cơ hội nói và 3/4/5
lượt tự bật micro tương ứng Core/Expanded/Challenge. Mỗi scene còn có một intro listen-only, nên
HUD hiển thị tổng step trong scene là 7/13/19. HUD phải ghi cả số thứ tự scene để phụ huynh không
hiểu nhầm đây là tổng bài.

## 2. Content rhythm

Mỗi vocabulary beat có đúng hai step:

```text
thấy hình + nghe mẫu English + auto/optional speech
  -> chạm/tìm/kéo để áp dụng nghĩa và làm cảnh thay đổi
```

Các guard bắt buộc:

1. Không có hai pronunciation panel liền nhau sau mode filtering.
2. Practice không được thêm chỉ để đủ số. Nó phải đổi state, hiện/ẩn target tiếp theo, tạo payoff
   hoặc là thao tác trực tiếp như kéo bát, kéo thức ăn hay lùi khỏi bát.
3. Instruction tương tác bắt đầu bằng `Chạm`, `Tìm`, `Kéo` và bản English bắt đầu bằng
   `Tap`, `Find`, `Drag`.
4. Giáo viên tiếng Việt không đọc lẫn raw English word. English model word nằm trong
   `promptText`/vocabulary audio; nghĩa được nói bằng tiếng Việt thuần.
5. Bé vẫn đi tiếp được khi không có quyền micro hoặc không thu được recording. Speech là guided
   production, không phải bài thi hay pronunciation scoring.
6. Core anchor dùng `auto`; mỗi tier cao hơn chỉ thêm một auto anchor mỗi scene. Từ bộ phận,
   thuộc tính và vật phụ dùng `optional`, nên vẫn có cơ hội nói nhưng không tự bật micro.
7. Từ gắn với cún, bát hoặc thảm dùng chính story object. Cue minh họa còn lại phải neo sát nhân
   vật/vùng hành động; object được `showObject` xuất hiện bằng fade-scale nhẹ, không dùng sparkle
   vốn dành cho phản hồi đúng.

## 3. Scene order and vocabulary

### Scene 1 — `meet-the-puppy`

Story: nhận ra chú cún, chào bạn, hiểu bạn đang đói; mode cao khám phá thêm hành động và bộ phận
dễ nhìn của cún.

| Tier | Vocabulary | Visible meaning/action |
| --- | --- | --- |
| Core | `puppy`, `hello`, `hungry` | chú cún nâu; bàn tay vẫy; cún ôm bụng và bát trống |
| Expanded | `sit`, `tummy`, `look` | cún ngồi; cún ôm bụng; mắt cún hướng về bát |
| Challenge | `tail`, `collar`, `wag` | đuôi; vòng cổ xanh; cún vẫy đuôi |

Hero puppy giữ cùng màu lông, mõm/ chân kem và vòng cổ xanh. Practice làm hero chuyển qua
`sitting`, `holding-tummy`, `looking-at-bowl`, `wagging`. Chiếc bát trống luôn là dấu hiệu trực
quan cho `hungry`; không yêu cầu bé suy nghĩa từ chữ.

### Scene 2 — `fill-the-bowl`

Story: đặt bát lên thảm, đưa phần thức ăn người lớn đã chuẩn bị vào bát và kiểm tra bữa ăn.

| Tier | Vocabulary | Visible meaning/action |
| --- | --- | --- |
| Core | `bowl`, `food`, `scoop` | bát xanh; viên thức ăn; xẻng xúc thức ăn |
| Expanded | `mat`, `empty`, `full` | thảm dưới bát; bát trống; bát có thức ăn |
| Challenge | `one scoop`, `meal`, `ready` | một khẩu phần; bữa ăn hoàn chỉnh; bát sẵn sàng |

Các drag chính:

- `bowl`: kéo bát vào `fill-the-bowl-mat-zone`;
- `scoop`: kéo xẻng thức ăn vào `fill-the-bowl-bowl-zone`.

Challenge so sánh `one-scoop` với `too-much-scoop`; copy nhắc người lớn chọn thức ăn/khẩu phần
phù hợp, không biến lesson thành hướng dẫn tự cho thú cưng ăn.

### Scene 3 — `puppy-eats`

Story: cún chờ, bé đặt đúng một bát thức ăn xuống, cún ăn xong rồi mới chuyển sang dọn bát trống
và nhờ người lớn hỗ trợ.

| Tier | Vocabulary | Visible meaning/action |
| --- | --- | --- |
| Core | `wait`, `feed`, `eat` | cún ngồi chờ; kéo bát đầy lên thảm đúng một lần; cún cúi ăn |
| Expanded | `finished`, `celebrate`, `carry` | hình cún đã ăn xong; cún reo vui rồi chạm trái tim chúc mừng; hai tay bưng bát trống |
| Challenge | `ask an adult`, `put it down`, `step back` | nhờ người lớn cất/rửa bát; đặt bát trống ở góc bàn; lùi lại |

Hero puppy trong scene này là decoration, `isInteractive: false`, và không bao giờ là target của
step tương tác. `feed` là drag bát duy nhất; `eat` chỉ chạm bát đã ở trên thảm. Sau `eat`, state
không được quay lại `waiting` hoặc bát đầy. Challenge dùng `step-forward-action` làm distractor
cho `step back` ở đoạn dọn bát.

`finished` và `celebrate` dùng cue cún riêng thay cho hero đang ăn; định nghĩa `wag` chỉ mô tả
chuyển động đuôi qua lại, không suy đoán cảm xúc chỉ từ một tín hiệu cơ thể.

## 4. Review contract

Review authored anchors giữ đúng thứ tự sau:

```text
vocab-feed-the-puppy-meet-the-puppy-puppy
vocab-feed-the-puppy-fill-the-bowl-bowl
vocab-feed-the-puppy-fill-the-bowl-food
vocab-feed-the-puppy-puppy-eats-eat
vocab-feed-the-puppy-fill-the-bowl-full
vocab-feed-the-puppy-puppy-eats-step-back
```

`getReviewGameItems()` phải trả:

- Core: `puppy`, `bowl`, `food`, `eat`;
- Expanded: thêm `full`;
- Challenge: thêm `step back`.

Sáu item có visual khác biệt về silhouette/hành động. `learningScope.minMode` và
`VocabularyItem.level` phải cùng khớp core/easy, expanded/medium, challenge/hard.

## 5. Asset contract

Source of truth nằm tại:

```text
src/assets/source/master/lessons/feed-the-puppy/<scene>/images/*.png
```

Inventory source v2 hiện có 43 lesson masters. Runtime data tham chiếu 37 image sau khi dùng
`wag-action` làm representative trực tiếp; sáu asset không
còn được lesson tham chiếu được giữ lại dưới dạng orphan để tránh xóa asset ngoài phạm vi. Chín
cutout mở rộng ban đầu được cắt từ một sheet 3×3 duy nhất để giữ style và giảm thời gian tạo asset:

```text
meet-the-puppy: tail-closeup, collar-closeup, wag-action
fill-the-bowl: one-scoop, too-much-scoop, ready-meal
puppy-eats: carry-bowl-action, step-back-action, step-forward-action
```

Sheet source:

```text
src/assets/source/lessons/feed-the-puppy/production-sheets/feed-the-puppy-v2-extension-chroma.png
```

Revision sau child/parent QA thêm một sheet alpha 3×2 gồm năm cue chỉ dùng sau khi cún ăn xong:
`carry-bowl-action`, `adult-hand-helping`, `put-empty-bowl-action`, `step-back-action` và
`step-forward-action`. Cả năm đều phải dùng bát trống; `feed-action` vẫn dùng bát đầy và chỉ xuất
hiện trước khi cún ăn.

```text
src/assets/source/lessons/feed-the-puppy/production-sheets/feed-the-puppy-empty-bowl-actions-alpha.png
```

Cutout phải alpha thật, không chữ, không nền đen/chroma/card. Script
`scripts/assets/verifyFeedThePuppyCutouts.mjs` khóa đủ 43 master và kiểm tra transparency.

## 6. Audio and delivery status

Google TTS đã tạo 480 clip còn thiếu cho v2. Hậu kiểm audio hiện có 626 target,
`Missing files: 0`, `Invalid files: 0`. R2 đã upload delta 490 object (480 audio và 10 ảnh),
verify đủ 801/801 object với lỗi `0`. Sau tối ưu cue-anchor, R2 nhận thêm 6 WebP; tập authoring
hiện hành verify đủ 798/798 object với lỗi `0` và post-upload dry-run còn `Changed/new: 0`.
Không có key cũ nào bị xóa khỏi bucket trong lần publish này.

Revision meal/cleanup đã tạo thêm 36 clip Google TTS. Audio audit hiện có 629 target,
`Missing files: 0`, `Invalid files: 0`; R2 đã upload delta 36 audio, verify đủ 834/834 object với
lỗi `0` và post-upload dry-run còn `Changed/new: 0`.

Revision hình bát trống đã publish thêm năm WebP. R2 verify đủ 835/835 object với lỗi `0` và
post-upload dry-run còn `Changed/new: 0`.

Current audit đổi copy `wag`, cue `finished` và cue/copy `celebrate`; audio/image delta đã publish
trong full-corpus run, R2-verify thành công và chỉ còn chờ device QA.

Các lần publish tiếp theo vẫn phải:

1. chạy `npm run generate:audio:dry-run -- --lesson=feed-the-puppy`;
2. đọc cả `Missing files` và `Invalid files`;
3. khi được chủ động yêu cầu mới generate Google TTS;
4. audit, upload R2 và verify lại remote manifest sau upload.

Không sửa tay `src/data/audioManifest.ts` hoặc bundled lesson audio registry.

## 7. Acceptance gates

1. Vocabulary/action/pronunciation-opportunity counts là 9/18/27, 18/36/54 và 9/18/27.
2. Mỗi scene có action counts 6/12/18, pronunciation counts 3/6/9 và auto-micro counts 3/4/5.
3. Mỗi spoken beat được ngăn với spoken beat tiếp theo bằng một practice action.
4. Core/expanded/challenge review trả đúng 4/5/6 item và visual ID khác nhau.
5. Lesson validator không có lỗi reference, scope, teacher copy hoặc raw English trong audio Việt.
6. Eating hero không tương tác và không là answer target.
7. Asset audit/build/verify/check pass; 9 cutout mới không có nền đen.
8. Mọi mode chỉ có một drag bát ở `feed`; sau `eat` không được phục hồi cún chờ hoặc bát đầy.
9. Child test xác nhận bé hiểu chuỗi `gặp cún -> chuẩn bị bát -> cho ăn -> cún ăn -> dọn bát
   trống` mà không cần người lớn đọc chữ trên màn hình.
