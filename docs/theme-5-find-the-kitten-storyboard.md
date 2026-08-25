# Theme 5 Storyboard — Find the Kitten

**Lesson ID:** `find-the-kitten`  
**Theme:** `nhung-nguoi-ban-dong-vat`  
**Freeze date:** 2026-08-15  
**Status:** Production baseline and audit revision 2026-08-25 assets/audio were published and
R2-verified. Device QA remains.

**Track:** `3-8 tuổi · Làm quen`

## 1. Learning promise

Bé nghe tiếng mèo con, kiểm tra lần lượt các chỗ trốn rồi mời mèo bước ra bằng bàn tay nhẹ
nhàng. Bài giữ blueprint Foundation của hai lesson đầu: mỗi từ có một lượt nghe–nói, ngay sau đó
là một thao tác làm câu chuyện tiến lên hoặc một phản hồi hình ảnh rõ ràng.

| Mode      | Vocabulary | Hành động ngoài intro | Cơ hội nói | Auto micro | Review |
| --------- | ---------: | --------------------: | ---------: | ---------: | -----: |
| Core      |          9 |                    18 |          9 |          9 |      4 |
| Expanded  |         18 |                    36 |         18 |         12 |      5 |
| Challenge |         27 |                    54 |         27 |         15 |      6 |

Mỗi scene có 3/6/9 từ, 6/12/18 hành động và 3/4/5 lượt auto-micro theo
Core/Expanded/Challenge. Mỗi scene thêm một intro, nên HUD hiển thị 7/13/19 step.

## 2. Story and vocabulary

### Scene 1 — `hear-the-kitten`

Story: mèo con chào bé rồi trốn sau rèm; bé nghe tiếng kêu và lần theo dấu chân.

| Tier      | Vocabulary                                         | Visible meaning/action                            |
| --------- | -------------------------------------------------- | ------------------------------------------------- |
| Core      | `kitten`, `meow`, `listen`                         | mèo con; tiếng kêu; tai đang lắng nghe            |
| Expanded  | `ears`, `sound`, `quiet`                           | tai mèo; làn âm thanh; ngón tay nhắc giữ yên lặng |
| Challenge | `listen carefully`, `where are you?`, `I hear you` | nghe kỹ; gọi hỏi; nhận ra dấu chân dẫn đường      |

State chính:

```text
kitten: sitting -> hiding-behind-curtain
clue: hidden -> meow -> pawprints
```

### Scene 2 — `check-the-hiding-spots`

Story: bé kiểm tra hộp và giỏ theo thứ tự, nhận ra mèo đang trốn rồi tìm thấy bạn.

| Tier      | Vocabulary                                                        | Visible meaning/action                                   |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| Core      | `box`, `basket`, `hide`                                           | hộp mở ra; giỏ dịch sang bên; mèo nép sau chăn           |
| Expanded  | `under`, `behind`, `inside`                                       | chuột đồ chơi dưới ghế; bóng sau gối; đồ chơi trong khối |
| Challenge | `look under the box`, `look behind the basket`, `find the kitten` | ba lượt tìm nối tiếp, kết thúc bằng mèo bước ra          |

Core đã đủ để bé thấy mèo ló đầu; Challenge chỉ mở rộng cách tìm và đưa mèo ra hẳn, không làm
mèo quay lại chỗ trốn.

State chính:

```text
box: closed -> open-empty
basket: covered -> open-empty
kitten: hiding -> peeking -> found
```

### Scene 3 — `welcome-the-kitten`

Story: bé gọi mèo bước ra, quan sát chân/đuôi/lông rồi để mèo tự đến gần trước khi vuốt nhẹ.

| Tier      | Vocabulary                                                | Visible meaning/action              |
| --------- | --------------------------------------------------------- | ----------------------------------- |
| Core      | `call`, `come out`, `friendly`                            | bàn tay gọi; mèo bước ra; mèo thân thiện dựng đuôi |
| Expanded  | `paw`, `tail up`, `soft fur`                              | bàn chân; đuôi dựng lên; vùng lông mềm |
| Challenge | `hold out your hand`, `let the kitten come`, `pet gently` | đưa tay thấp; chờ mèo tới; vuốt nhẹ |

State chính:

```text
kitten: peeking -> out -> friendly (`happy` là variant ID nội bộ) -> near -> rubbing
hand: hidden -> offered -> kitten-approaches -> gentle-pet
```

Copy chỉ mô tả hình nhìn thấy được (`tail up`, `soft fur`), không dùng việc vẫy/dựng đuôi như
bằng chứng tuyệt đối rằng mèo đang vui.

## 3. Speech rhythm

- Core: cả ba anchor mỗi scene dùng `speechPractice: 'auto'`.
- Expanded: anchor đầu mỗi scene dùng `auto`; hai anchor còn lại dùng `optional`.
- Challenge: anchor hành động đầu mỗi scene dùng `auto`; hai anchor còn lại dùng `optional`.
- Không có hai pronunciation panel liền nhau; mỗi panel có đúng một practice action kế tiếp.
- Recording là lời mời luyện nói, không chấm điểm và không khóa câu chuyện.

## 4. Review contract

Review allow-list giữ thứ tự:

```text
vocab-find-the-kitten-hear-the-kitten-kitten
vocab-find-the-kitten-hear-the-kitten-meow
vocab-find-the-kitten-check-the-hiding-spots-box
vocab-find-the-kitten-check-the-hiding-spots-basket
vocab-find-the-kitten-check-the-hiding-spots-under
vocab-find-the-kitten-check-the-hiding-spots-find-the-kitten
```

Kết quả executable phải là:

- Core: `kitten`, `meow`, `box`, `basket`;
- Expanded: thêm `under`;
- Challenge: thêm `find the kitten`.

Sáu visual phải khác silhouette: mèo ngồi, tiếng meow, hộp, giỏ, đồ chơi dưới ghế và kính lúp
tìm mèo.

## 5. Visual and safety guardrails

- Một mèo con lông vàng kem, ngực/chân trắng và vòng cổ xanh ngọc được giữ xuyên ba scene.
- Dùng phòng sáng quen thuộc của Theme 5 nhưng vùng chơi ít chi tiết, hộp/giỏ/rèm tương phản rõ.
- Mỗi nhịp chỉ có một story kitten. Cue có mèo phải thay thế tạm hero hoặc dùng trực tiếp hero;
  không đặt hai mèo chồng nhau.
- Box, basket, ball và action cue không được chia sẻ cùng một vị trí khi cùng visible.
- Cutout text-free, alpha thật, không card/caption/nền đen và có gutter an toàn.
- Không dạy bé kéo mèo ra, đuổi theo, bế ép hoặc chạm khi mèo đang trốn. Challenge cho mèo tự
  tới bàn tay trước khi vuốt nhẹ; Parent Tip nhắc hỏi người lớn và rửa tay sau khi chơi.

Production baseline đã có trên R2. Current audit thay anchor thành `tail up`/`soft fur`, giữ
`friendly` bằng hình trực tiếp và sửa copy mô tả body language; audio delta đã publish và
R2-verify, còn chờ device QA.

## 6. Acceptance gates

1. Vocabulary/action/speech đúng 9/18/27, 18/36/54 và 9/18/27.
2. Auto-micro đúng 9/12/15, phân bố 3/4/5 mỗi scene.
3. Core order là `kitten -> meow -> listen`, `box -> basket -> hide`,
   `call -> come out -> friendly`.
4. Không có drag; mọi bước dùng tap/find và không biến mèo thành draggable object.
5. Mọi instruction nói rõ `Chạm`/`Tìm`, target luôn visible, state không quay ngược.
6. Không có story kitten/cue kitten hoặc các hiding-state object chồng nhau.
7. Review trả đúng 4/5/6 item với sáu visual khác nhau.
8. Local cutout/image audit, lesson validation và audio dry-run pass trước khi bàn giao.
