# Theme 5 Storyboard — Play with the Puppy

**Lesson ID:** `play-with-the-puppy`  
**Theme:** `nhung-nguoi-ban-dong-vat`  
**Freeze date:** 2026-08-15  
**Status:** Production assets published and verified on R2  
**Track:** `3-8 tuổi · Làm quen`

## 1. Learning promise

Bé chọn một quả bóng mềm, lăn bóng trên sàn rồi nhìn cún chạy theo, bắt bóng và mang bóng về.
Lesson tiếp tục blueprint Foundation đã kiểm chứng ở `feed-the-puppy`: mỗi từ có đúng một lượt
nghe–nói, sau đó là một thao tác áp dụng nghĩa hoặc một thay đổi trạng thái nhìn thấy được.

| Mode      | Vocabulary | Hành động ngoài intro | Cơ hội nói | Auto micro | Review |
| --------- | ---------: | --------------------: | ---------: | ---------: | -----: |
| Core      |          9 |                    18 |          9 |          9 |      4 |
| Expanded  |         18 |                    36 |         18 |         12 |      5 |
| Challenge |         27 |                    54 |         27 |         15 |      6 |

Mỗi scene có 3/6/9 từ, 6/12/18 hành động và 3/4/5 lượt auto-micro theo
Core/Expanded/Challenge. Mỗi scene còn một intro, nên HUD hiển thị 7/13/19 step.

## 2. Story and vocabulary

### Scene 1 — `choose-the-ball`

Story: cún muốn chơi; bé mở giỏ đồ chơi, nhận ra quả bóng và chọn bóng mềm cho cún.

| Tier      | Vocabulary                    | Visible meaning/action                                           |
| --------- | ----------------------------- | ---------------------------------------------------------------- |
| Core      | `play`, `ball`, `choose`      | cún cúi người mời chơi; quả bóng đỏ; bàn tay chọn bóng           |
| Expanded  | `toy`, `red`, `round`         | giỏ đồ chơi; bóng đỏ cạnh bóng xanh; bóng tròn lăn một đoạn      |
| Challenge | `soft`, `pick it up`, `ready` | tay bóp nhẹ bóng; tay nhấc bóng; cún và bóng vào vị trí sẵn sàng |

Core mở giỏ, tìm đúng bóng giữa bóng và đồ chơi dây, rồi chọn bóng. Expanded chỉ quan sát thêm
đặc điểm của chính quả bóng đã chọn. Challenge kiểm tra bóng mềm, nhấc bóng và đặt vào vị trí bắt
đầu; không yêu cầu bé đọc nhãn hoặc suy nghĩa từ icon trừu tượng.

State chính:

```text
basket: closed -> open
ball: hidden -> floor -> chosen -> rolled -> held -> start
puppy: play-bow -> ready
```

### Scene 2 — `roll-and-catch`

Story: bé lăn bóng đúng một lần; cún chạy theo, bắt bóng, giữ bóng rồi quay lại.

| Tier      | Vocabulary                                 | Visible meaning/action                               |
| --------- | ------------------------------------------ | ---------------------------------------------------- |
| Core      | `roll`, `run`, `catch`                     | tay lăn bóng; cún chạy; cún chặn và bắt bóng         |
| Expanded  | `mouth`, `hold`, `turn`                    | bóng ở miệng cún; cún giữ bóng; cún quay về phía bé  |
| Challenge | `catch the ball`, `hold it`, `turn around` | ba cụm hành động nối đúng trạng thái cún đã bắt bóng |

`roll` là drag duy nhất của toàn lesson. Các bước sau chỉ làm bóng/cún tiến tới state mới; không
kéo bóng lặp lại. Puppy hero luôn non-interactive khi không phải target rõ của bước hiện tại.

State chính:

```text
ball: start -> rolling -> near-puppy -> hidden
puppy: waiting -> running -> catching -> holding -> turned
```

### Scene 3 — `bring-it-back`

Story: cún mang bóng về, trao lại cho bé, rồi hai bạn chuẩn bị chơi lượt mới.

| Tier      | Vocabulary                                 | Visible meaning/action                                       |
| --------- | ------------------------------------------ | ------------------------------------------------------------ |
| Core      | `fetch`, `bring`, `give`                   | cún đi lấy bóng; mang bóng tới gần; trao bóng vào bàn tay mở |
| Expanded  | `hand`, `again`, `happy`                   | bàn tay nhận bóng; bóng trở lại điểm bắt đầu; cún vui vẻ     |
| Challenge | `your turn`, `roll the ball`, `let's play` | bóng ở lượt của bé; lăn lại; cún mời chơi tiếp               |

Core luôn kết thúc với bóng về bên bé. Expanded/Challenge chỉ nối thêm lượt chơi mới, không làm
bóng quay ngược về phía cún trước khi bé thực hiện hành động tương ứng.

State chính:

```text
puppy: far-with-ball -> returning -> near -> happy
ball: hidden-in-puppy -> in-hand -> start -> rolling
```

## 3. Speech rhythm

- Core: cả ba anchor mỗi scene dùng `speechPractice: 'auto'`.
- Expanded: anchor đầu mỗi scene dùng `auto`; hai anchor còn lại dùng `optional`.
- Challenge: anchor giữa hoặc anchor hành động chính dùng `auto`; hai anchor còn lại dùng
  `optional`.
- Không có hai pronunciation panel liền nhau; mỗi panel được nối với đúng một practice action.
- Không dùng recording result để chấm đúng/sai hoặc khóa câu chuyện.

## 4. Review contract

Review allow-list giữ thứ tự:

```text
vocab-play-with-the-puppy-choose-the-ball-play
vocab-play-with-the-puppy-choose-the-ball-ball
vocab-play-with-the-puppy-roll-and-catch-roll
vocab-play-with-the-puppy-roll-and-catch-catch
vocab-play-with-the-puppy-roll-and-catch-hold
vocab-play-with-the-puppy-bring-it-back-your-turn
```

Kết quả executable phải là:

- Core: `play`, `ball`, `roll`, `catch`;
- Expanded: thêm `hold`;
- Challenge: thêm `your turn`.

Sáu visual phải khác silhouette: cún mời chơi, bóng riêng, tay lăn bóng, cún bắt bóng, cún giữ
bóng và bàn tay nhận lượt.

## 5. Visual and safety guardrails

- Dùng đúng chú cún nâu, mõm/chân kem và vòng cổ xanh từ `feed-the-puppy`.
- Một background phòng sáng, sàn trống, ít chi tiết được dùng xuyên ba scene; Scene State v1 tự
  author initial state cho từng scene vì state không đi xuyên scene.
- Bóng là bóng mềm kích thước vừa, không có chữ/logo. Không dùng động tác ném mạnh, đá bóng trong
  nhà, kéo đuôi/tai hoặc giằng bóng khỏi miệng cún.
- Bé chỉ lăn bóng trên sàn. Cún tự chạy, bắt và mang về; bé không kéo cún trên màn hình.
- Target được yêu cầu là affordance nổi bật duy nhất. Distractor không pulse cùng đáp án.
- Mỗi nhịp chỉ render một story puppy và một trạng thái bóng. Cue hành động có chứa cún/bóng phải
  thay thế tạm story object liên quan hoặc dùng thẳng hero hiện tại; không xếp hai silhouette cùng
  nghĩa chồng lên nhau.
- Cutout alpha thật, text-free, không card, không nền đen/chroma/checkerboard và có gutter an toàn.

## 6. Delivery state

Lesson đã được author và đăng ký sau `feed-the-puppy` với đúng ba scene. Ba production sheet chung
được tách thành alpha thật, cắt thành 33 PNG master, build thành 33 WebP runtime asset và tạo bốn
bundled map/milestone icon. Cutout audit pass 33/33; image verify pass 33/33, lỗi 0 và tiết kiệm
94% so với master. Google TTS đã tạo 508 clip còn thiếu; audio audit hiện có 613 target, thiếu 0
và invalid 0. R2 đã upload đúng 541 object mới gồm 508 audio và 33 image, verify 541/541 với lỗi
0; post-upload dry-run còn `Changed/new: 0`. Revision chống chồng hình tái sử dụng happy-puppy
master đầy đủ từ lesson trước, rebuild một WebP runtime và bundled milestone icon; R2 upload delta
một WebP, verify lại đủ 541/541 object và post-upload dry-run còn `Changed/new: 0`.

## 7. Acceptance gates

1. Vocabulary/action/speech counts đúng 9/18/27, 18/36/54 và 9/18/27.
2. Auto-micro đúng 9/12/15 và phân bố 3/4/5 mỗi scene.
3. Core order là `play -> ball -> choose`, `roll -> run -> catch`,
   `fetch -> bring -> give`.
4. Chỉ `roll` là drag; không có thao tác kéo cún hoặc kéo bóng lặp lại.
5. Bóng/cún không quay lại state cũ trái trình tự trong cùng scene.
6. Review trả đúng 4/5/6 item với visual khác nhau.
7. Local image audit/build/verify/check và lesson validation pass.
8. Audio dry-run báo rõ số target còn thiếu; chưa gọi Google TTS hoặc R2 khi chưa được yêu cầu.
