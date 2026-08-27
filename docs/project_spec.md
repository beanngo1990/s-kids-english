# Đặc tả Dự án - Sungy

**Trạng thái tài liệu:** ảnh chụp implementation hiện tại

**Kiểm chứng gần nhất:** 2026-08-25

**Implementation baseline:** commit `f8dc0279b59c38cd6fadd97217c3ee7b46e6f7aa` cộng với thay đổi
localization foundation, Firebase parent auth, opt-in cloud learning data sync, dual-accent English
audio rollout, monetization Phase 1-3, app-update policy, parent-only app review, Scene State v1 và
năm lesson `plant-a-seed`/`help-it-grow`/`garden-friends`/`harvest-day`/`garden-to-table` của
Theme 4 cùng sáu vertical slice `feed-the-puppy`/`play-with-the-puppy`/`find-the-kitten`/
`clean-muddy-paws`/`care-for-the-rabbit`/`groom-the-kitten` của Theme 5 trong working tree hiện tại.

**Phạm vi:** product behavior, domain model, architecture, persistence, native modules và asset
delivery đang có trong repository.

## 1. Cách đọc tài liệu

Tài liệu này mô tả hệ thống đang được triển khai, không tự động biến ý tưởng chưa có code thành
roadmap. Các nhãn được dùng như sau:

- **Implemented:** có implementation trong runtime hiện tại.
- **Partial:** có type/helper/UI hoặc một phần platform, nhưng chưa hoàn chỉnh end-to-end.
- **Unsupported:** chưa có implementation runtime; không được suy diễn là đã lên roadmap.
- **Open decision:** code, test hoặc product intent đang mâu thuẫn và cần quyết định rõ trước khi
  thay đổi contract.

Nguồn chi tiết theo lĩnh vực:

- Runtime/current behavior: code, native implementation, types, tests và config.
- Lesson authoring: `src/data/README.md`.
- Image/R2 pipeline: `docs/asset-pipeline.md`.
- Dependency ranges/scripts: `package.json`; exact resolved versions: `package-lock.json`.
- AI working conventions và verification: `AGENTS.md`.

Khi implementation và tài liệu lệch nhau, phải báo drift và xác định intent; không tự động sửa
code theo spec hoặc sửa spec theo code một cách âm thầm.

## 2. Product snapshot

Sungy là ứng dụng React Native giúp trẻ học từ/cụm từ tiếng Anh qua các tình huống sinh
hoạt thường ngày. Sản phẩm dạy tiếng Anh cố định; localization chỉ áp dụng cho UI và hướng dẫn
của cô giáo. UI/hướng dẫn hiện vẫn Vietnamese-first, nhưng đã có foundation `vi`/`en` cho một số
cụm UI quan trọng và mode hướng dẫn `vi`/`en`/`bilingual`.

Đặc điểm hiện tại:

- **Implemented:** học theo theme -> lesson pack -> mini-scene -> review -> reward.
- **Implemented:** mỗi scene đã hoàn thành mở được `Góc chơi từ vựng`, một sandbox theo
  `learningMode`; một bản của từng từ có hình riêng được đặt sẵn trên background để bé chạm nghe
  English, tùy chọn nghe tiếp nghĩa tiếng Việt production và kéo tự do. Bố cục cùng lựa chọn phát
  nghĩa được lưu local, không thay đổi progress/reward và không thay thế review game cuối lesson.
- **Implemented:** tương tác nghe, chạm, tìm object, kéo thả và luyện nói bằng cách ghi/phát lại.
- **Implemented:** Scene State v1 cho object variants, trạng thái ẩn/hiện và thay đổi state chỉ sau
  tương tác đúng trong phạm vi lượt chạy scene hiện tại.
- **Implemented:** pilot `plant-a-seed` dùng Scene State v1 để nối ba scene chuẩn bị chậu, gieo hạt
  và tưới lần đầu thành một chuỗi nhân-quả; ảnh/audio hiện hành nằm trong corpus R2 đã verify.
- **Implemented:** vertical slice `help-it-grow` nối ba tình huống nắng, mưa và gió bằng cùng một
  lineage cây cà chua non. Vocabulary-first revision ngày 2026-08-25 dùng lại 40 ảnh, nâng
  vocabulary/pronunciation lên 8/12/16, khóa meaningful turn 21/27/34 và giữ review 4/5/6.
  User-facing payoff là bông hoa vàng đã nở; tên asset/variant `flower-bud` chỉ còn là technical
  identifier ổn định. Google TTS tạo đúng 58 audio delta; lesson/full-corpus audit đạt
  439/16.012 target với missing 0, invalid 0. R2 upload 59 object gồm audio và một WebP rebuild,
  verify đủ 401/401, post-upload delta bằng 0; CDN smoke audio mới khớp local.
- **Implemented:** `garden-friends` nối ba scene khám phá giun/ốc sên, ong/bướm và sâu bướm
  bằng observation controls thay vì cho bé kéo/chạm trực tiếp con vật. Lesson data, review 4/5/6,
  production PNG masters, bundled map icons, WebP và action-first audio đã có. Vocabulary-first
  revision ngày 2026-08-25 dùng lại 35 WebP, nâng vocabulary/pronunciation lên 8/12/16 và nhịp
  meaningful turn lên 19/25/34. Google TTS tạo đúng 78 audio delta; lesson/full-corpus audit đạt
  432/16.090 target với missing 0, invalid 0. R2 verify đủ 455/455, post-upload delta bằng 0;
  CDN smoke audio mới khớp local.
- **Implemented:** `harvest-day` nối ba scene tìm quả chín, hái bằng tay và phân loại thành
  quả. Pacing revision giữ quả xanh trên cây, cho bé hái lần lượt hai quả chín, kiểm tra cành sau
  lượt đầu và xác nhận giỏ có đủ hai quả; scene cuối xác nhận riêng khay người lớn và payoff ba
  giỏ đã phân loại. Vocabulary/pronunciation hiện là 8/12/16, review vẫn 4/5/6 và nhịp ngoài intro
  vẫn là 18/27/36 meaningful turns theo core/expanded/challenge. Google TTS đã tạo đúng 46 audio
  delta cho revision; lesson audit 459 target và full-corpus audit 15.903 target đều thiếu 0, lỗi 0. Production R2 hiện có 34 WebP + 413 audio, verify đủ 447/447 ngày 2026-08-25 và post-upload
  delta bằng 0; audio `separate.mp3` tải qua production CDN khớp local theo size và SHA-256. Local
  image build/verify pass 34/34. Sau khi sửa cutter làm mất alpha nội bộ, 30 cutout cũ đã được
  rebuild/upload với asset revision mới; device smoke test sau audio revision 8/12/16 chưa chạy.
- **Implemented:** `garden-to-table` nối ba scene rửa rau quả, làm/chia sẻ món nguội và nhờ người
  lớn giữ hạt khô cho mùa sau. Vocabulary/pronunciation hiện là 8/12/16, nhịp meaningful turn là
  21/28/35 và review vẫn 4/5/6. Rau quả đi `dirty -> clean`; expanded colander đi từ `empty` ->
  xà lách hiện riêng -> `filled`; tô đi `empty -> with-lettuce -> prepared -> mixed -> shared`;
  phong bì đi `empty -> filled -> closed -> stored`. 37 WebP runtime assets và bốn bundled icons
  được giữ nguyên. Visual QA correction retire
  pointer-hand sai ngữ nghĩa, dùng hình phong bì trên kệ cho `store it for next season` và cho
  safety action chạm phong bì đã đóng. Google TTS đã tạo 69 audio ở revision đầu và thêm đúng 12
  audio correction; lesson/full-corpus audit đạt 443/15.969 target với missing 0, invalid 0. R2
  upload thêm 14 object correction, verify đủ 404/404 asset và post-upload delta bằng 0 ngày
  2026-08-25; audio instruction mới trên production CDN khớp local theo size và SHA-256. Device
  smoke test chưa chạy. Follow-up audit thêm một hành động riêng để xà lách sạch hiện trong rổ
  trước khi dưa leo được đặt vào; thay đổi tái sử dụng 37 WebP và audio delta đã publish.
- **Published revision:** correctness audit Theme 4 giữ nguyên vocabulary budget nhưng làm meaning
  trực tiếp hơn: `help-it-grow` dạy cọc/dây trên trạng thái đã lắp đúng tỉ lệ và dùng cây có hoa
  làm representative; `garden-friends` giữ ong/bướm sát hoa và dùng composite ba đối tượng cho
  `visit the flower`; `harvest-day` bổ sung representative trực tiếp cho `red`, `branch`,
  `gentle`, `carrot`, `separate` và giữ payoff phân loại; `garden-to-table` cho xà lách vào rổ ở
  lượt riêng. Audio/image delta đã publish và R2-verify; device QA chưa chạy.
- **Implemented:** vertical slice Foundation `feed-the-puppy` v2 nối ba scene gặp cún,
  chuẩn bị bát và giúp cún dùng bữa an toàn. Vocabulary/action/pronunciation budgets là 9/18/27,
  18/36/54 và 9/18/27 theo core/expanded/challenge; auto-micro giảm còn 9/12/15, phân bố 3/4/5
  mỗi scene. Mỗi lượt nói vẫn xen kẽ với action, còn cún thật non-interactive trong scene ăn.
  Review vẫn chọn 4/5/6 visual
  distinct item. HUD lesson hiển thị tên cảnh và thanh tiến độ trực quan, bỏ dòng text mode/cảnh/bước để giao diện học gọn gàng. Asset pipeline v2 có 43 lesson
  master, 37 image được runtime tham chiếu sau khi `wag-action` trở thành representative trực
  tiếp; sáu image còn lại được giữ như orphan local. Revision hậu bữa ăn thêm một sheet alpha 3×2 để mọi
  cue `carry/ask/put down/step` đều dùng bát trống, còn cue `feed` trước bữa vẫn dùng bát đầy;
  bốn map icons và theme icon giữ nguyên. Google TTS đã tạo 480 clip còn thiếu; audio audit v2
  có 626 target, thiếu 0 và lỗi 0. R2 đã upload delta 490 object, verify đủ 801/801 object với
  lỗi 0. Bản tối ưu cue-anchor tiếp theo upload thêm 6 WebP; tập authoring hiện hành verify đủ
  798/798 object với lỗi 0 và post-upload dry-run còn `Changed/new: 0`. Publish không xóa key cũ
  khỏi bucket. Revision meal/cleanup tiếp theo sửa scene dùng bữa thành `wait -> feed -> eat -> finished ->
celebrate -> carry -> ask an adult -> put it down -> step back`, chỉ kéo bát một lần và không phục
  hồi bát đầy sau khi cún ăn. Google TTS đã tạo thêm 36 clip; audio audit revision có 629 target,
  thiếu 0 và lỗi 0. R2 đã upload delta 36 audio, verify đủ 834/834 object với lỗi 0 và post-upload
  dry-run còn `Changed/new: 0`. Revision hình bát trống đã publish thêm năm WebP; R2 verify đủ
  835/835 object với lỗi 0 và post-upload dry-run còn `Changed/new: 0`.
- **Implemented:** Foundation lesson `play-with-the-puppy` nối ba scene chọn bóng,
  lăn/bắt bóng và cún mang bóng về. Budget vocabulary/action/pronunciation là 9/18/27,
  18/36/54 và 9/18/27; auto-micro 9/12/15, review 4/5/6. Chỉ `roll` là drag, cún không phải drag
  target và state đi một chiều `choose -> roll -> catch -> bring -> give`. Ba sheet chung đã
  được tách alpha thật thành 33 PNG master, build 33 WebP và bốn bundled icon; local image verify
  pass 33/33, lỗi 0. Google TTS đã tạo 508 clip còn thiếu; audio audit có 613 target, missing 0
  và invalid 0. R2 upload/verify đúng 541/541 object gồm 508 audio + 33 image, lỗi 0;
  post-upload dry-run còn `Changed/new: 0`. Device QA chưa chạy cho lesson này.
- **Implemented:** Foundation lesson `find-the-kitten` nối ba scene nghe tiếng mèo, kiểm tra chỗ
  trốn và gọi mèo bước ra. Budget vocabulary/action/pronunciation là 9/18/27, 18/36/54 và
  9/18/27; auto-micro 9/12/15, review 4/5/6. State đi một chiều `sitting -> hiding`,
  `hiding -> peeking -> found`, rồi `peeking -> out -> happy -> near -> rubbing`; `happy` ở đây là
  technical variant ID, không phải vocabulary anchor, và lesson không có drag.
  Hai action cue kiểm tra hộp/giỏ đều hiển thị chỗ trống, còn tương tác cuối dạy đưa tay thấp,
  chờ mèo tự đến và vuốt nhẹ. Ba sheet chung được tách theo component thành 40 PNG master,
  build 40 WebP và bốn bundled icon; local cutout/image verify pass. Google TTS đã tạo 520 clip;
  full-corpus audit có 14.279 target, missing 0 và invalid 0. R2 upload/verify 560/560 object, lỗi
  0; post-upload dry-run còn `Changed/new: 0`. Device QA chưa chạy cho lesson này.
- **Implemented:** Foundation lesson `clean-muddy-paws` nối ba scene nhận ra chân cún dính bùn,
  rửa bằng nước sạch với người lớn và lau khô. Budget vocabulary/action/pronunciation là
  9/18/27, 18/36/54 và 9/18/27; auto-micro 9/12/15, review 4/5/6. Core tự kết thúc ở state
  `muddy -> washing -> clean-wet -> dry`; Expanded/Challenge chỉ nối thêm chờ trên thảm, kiểm tra
  nước có bùn, để người lớn mang chậu đi và rửa tay, không quay lại state bẩn. Local pipeline có
  37 PNG master cùng bốn bundled icon; cutout audit pass. Google TTS đã tạo 512 clip; production
  audio audit có 14.791 target, missing 0 và invalid 0. R2 upload/verify đủ 549/549 object, lỗi 0;
  post-upload dry-run còn `Changed/new: 0`. Device QA chưa chạy.
- **Published asset revision:** `care-for-the-rabbit` và `groom-the-kitten` đã khóa
  lại character identity theo cùng phong cách hoạt hình 3D mềm của Theme 5. Sáu sheet 4×3 tạo
  cùng lúc các pose/prop liên quan rồi crop theo cell tuần tự; bài thỏ dùng một thỏ trắng xuyên
  suốt, bài mèo dùng đúng mèo cam vằn mắt nâu, vòng cổ xanh và chuông vàng của
  `find-the-kitten`. Local cutout/audit/build/image verify đạt 37/37 và 28/28, 0 missing/orphan;
  R2 upload đúng 34 + 25 WebP, verify đủ 637/637 và 768/768 lesson object, lỗi 0; post-upload
  dry-run của cả hai còn `Changed/new: 0`. Device QA chưa chạy.
- **Implemented:** Kid Mode, Parent Mode, progress/XP/sticker collection, activity/streak, daily
  reminder, Sticker Playground, Light/Dark/System theme.
- **Partial:** localization foundation cho UI `vi`/`en`, localized domain titles và teacher prompt
  mode `vi`/`en`/`bilingual`; chưa phải full-app localization.
- **Implemented:** Parent Mode persist lựa chọn phát âm English `en-US`/`en-GB`; dữ liệu cũ và
  setting thiếu mặc định `en-US`. Accent chỉ đổi audio phát âm, không đổi UI, app language,
  teacher prompt mode, vocabulary spelling hoặc lesson copy.
- **Implemented:** thư viện giọng đọc local trong Parent Mode. Phụ huynh chủ động bật tự động lưu,
  xem gần đây hoặc theo theme/bài học, nghe mốc đầu/gần nhất và xóa theo mẫu/từ/bài/theme/toàn bộ;
  audio không đi vào cloud sync hoặc backup hệ điều hành.
- **Implemented:** local persistence bằng AsyncStorage.
- **Implemented:** lesson images và generated prompt/vocabulary audio phân phối qua Cloudflare R2.
- **Implemented:** app UI icons dạng PNG nhỏ được bundle local, tách khỏi lesson image/R2 pipeline.
- **Implemented:** parent account sign-in qua Firebase Authentication với Google và Apple.
- **Implemented:** parent opt-in cloud learning data sync qua Firestore; mặc định tắt và sync
  các field học tập của `LocalProgress` cùng selected parent settings/child profile, không sync
  activity/voice recordings, bố cục Sticker Playground hoặc bố cục Góc chơi từ vựng local-only.
- **Implemented:** client monetization foundation với free tier cố định, content locks, Parent
  adult gate, màn Premium và RevenueCat entitlement lifecycle.
- **Implemented trong repository:** Remote Config purchase kill switch và Founder cutoff/duration;
  client tính Founder access từ RevenueCat `CustomerInfo.firstSeen` mà không dùng claim/quota/
  outbox. Backend chỉ còn callable xóa RevenueCat customer khi xóa parent account. RevenueCat
  public SDK keys và legal URLs vẫn chưa được điền.
- **Implemented:** kiểm tra phiên bản phát hành qua Firebase Remote Config, nhắc cập nhật có thể
  hoãn và chặn phiên bản thấp hơn ngưỡng hỗ trợ tối thiểu; thao tác mở store luôn qua adult gate.
- **Implemented:** lời mời đánh giá hệ thống chỉ chạy trong Parent Mode đã mở khóa sau khi gia đình
  có đủ thời gian/trải nghiệm học; Kid Mode, lesson, review game và reward không hiển thị prompt.
- **Unsupported:** full offline lesson bundle; runtime lesson assets hiện phụ thuộc remote R2.

Không mô tả app là hoàn toàn offline: app tải lesson assets qua network. Voice recording luôn là
local file URI; implementation không có đường upload recording và chỉ promote file sang vùng lưu
bền vững local khi phụ huynh đã bật thư viện giọng đọc.

## 3. Tech stack và platform

### JavaScript/React Native

- React Native `0.86.0`.
- React `19.2.3`.
- TypeScript strict; range khai báo là `^5.8.3`, `package-lock.json` hiện resolve `5.9.3`.
- React Navigation v7: native container + native stack.
- React Native Gesture Handler `3.1.0` cho gesture native pan/pinch/rotation; app root được bọc
  trong `GestureHandlerRootView` và Playground dùng integration với React Native `Animated`.
- AsyncStorage `3.x`.
- Notifee `9.x`.
- React Native Firebase App/Auth/Firestore/App Check/Functions/Remote Config `25.x`.
- RevenueCat React Native SDK `react-native-purchases` `10.4.3`.
- Google Sign-In `16.x`.
- Apple Authentication `2.x`.
- Node.js `>=22.11.0`.
- Jest `29.x`, ESLint `8.x`.
- Firestore rules test tooling: Firebase JS SDK `12.15.0`, Rules Unit Testing `5.x` và Firebase CLI
  `15.x` (dev-only).

`package.json` là nguồn cho declared ranges; `package-lock.json` là nguồn cho exact resolved
versions nếu các con số trên bị stale.

### Entry composition

```text
index.js
  -> App.tsx
     -> configureNativeAudioAdapter()
     -> startFirebaseAppCheck()
     -> startCloudProgressSync()
     -> startRemoteMonetizationConfig()
     -> startAppUpdateManager()
     -> initializeAppReviewTracking()
     -> startMonetization()
     -> startParentAccessSessionLifecycle()
     -> AppThemeProvider
     -> GestureHandlerRootView
       -> SafeAreaProvider
       -> AppUpdateGate
          -> AppNavigator
```

`AppNavigator` đọc parent settings để chọn route ban đầu:

- `hasCompletedOnboarding === false` -> `Onboarding`.
- `hasCompletedOnboarding === true` -> `Home`.
- Đọc settings thất bại -> `Onboarding`.

### Navigation routes

Contract params nằm trong `src/types/navigation.ts`:

- `Onboarding`
- `Home`
- `ThemeLibrary`
- `LessonList`
- `LessonPack { lessonId, openedFromParent? }`
- `ScenePlayer { lessonId, learningMode?, openedFromParent?, sceneId? }`
- `SceneVocabularyPlayground { lessonId, sceneId, learningMode?, openedFromParent? }`
- `ReviewGame { lessonId, learningMode?, openedFromParent? }`
- `ReviewLibrary`
- `Reward { lessonId, playedWordIds?, xp/reward fields... }`
- `StickerCollection { highlightedStickerId? }`
- `StickerPlayground`
- `Parent { intent?: 'dashboard' | 'premium' | 'founderPromo', lessonId? }`
- `ParentLessonPlan`
- `ParentVoiceLibrary`
- `Premium`

Route registration nằm trong `src/navigation/AppNavigator.tsx`. Mọi thay đổi route phải cập nhật
cả registration, param types và call sites.

Các route còn hiển thị stack header dùng chung `KidSafeRouteHeader`: title pill một dòng và
safe-area spacing giống header trong Lesson Pack/Review. Route phân cấp dùng nút quay lại không
kèm tên route trước đó; `Reward` và `StickerPlayground` dùng nút đóng vì là flow toàn màn hình.
Đóng Reward kết thúc flow về tab Map của Home thay vì quay lại game vừa hoàn thành. Đóng
Sticker Playground kết thúc về tab Play. Các route fullscreen khác (`Home`, lesson runtime và
review library) tiếp tục tự sở hữu header/HUD.

## 4. Source architecture

```text
src/
  assets/       lesson/shared assets, bundled app UI icons, source masters và generated outputs
  components/   reusable UI và mascot components
  config/       remote R2, Firebase auth, monetization và generated release configuration
  data/         catalogs, prompts, lesson authoring helpers và validators
  engine/       scene, progress, parent auth/cloud sync/access, monetization, audio, recording và asset logic
  games/        review-game registry và implementations
  navigation/   navigation container/stack
  screens/      route-level screens
  services/     local notification và Firebase Remote Config services
  theme/        colors, theme provider, typography, spacing, shadows, responsive helpers
  types/        shared lesson/navigation/progress contracts
  utils/        progress/theme/icon helpers
```

Native code nằm trong `android/` và `ios/`. Build/generation/upload utilities nằm trong
`scripts/`. Jest suites nằm trong `__tests__/`.

## 5. Catalog và domain model

### Current catalog

Hiện có năm themes và 38 lesson packs:

- `mot-ngay-cua-be` / “Một ngày của bé”.
- `be-ra-ngoai-kham-pha` / “Bé ra ngoài khám phá”.
- `co-the-cam-xuc-va-tu-cham-soc` / “Cơ thể, cảm xúc và tự chăm sóc”.
- `khu-vuon-cua-be` / “Khu vườn của bé”.
- `nhung-nguoi-ban-dong-vat` / “Những người bạn động vật”.

Theme `mot-ngay-cua-be` chứa 11 lesson packs theo thứ tự:

1. `morning-routine`
2. `at-school`
3. `playtime`
4. `lunch-time`
5. `afternoon-home`
6. `snack-time`
7. `home-play`
8. `afternoon-bath`
9. `family-dinner`
10. `after-dinner-cleanup`
11. `bedtime`

Theme `be-ra-ngoai-kham-pha` chứa 8 lesson packs theo thứ tự:

1. `supermarket-trip`
2. `park-visit`
3. `beach-day`
4. `animal-trip`
5. `library-visit`
6. `doctor-visit`
7. `birthday-party`
8. `grandparents-visit`

Theme `co-the-cam-xuc-va-tu-cham-soc` chứa 8 lesson packs theo thứ tự:

1. `my-body`
2. `five-senses`
3. `my-feelings`
4. `calm-myself`
5. `personal-care`
6. `dress-myself`
7. `toilet-routine`
8. `speaking-up`

Theme 3 dùng layout riêng theo ngữ cảnh cho từng scene. Các scene cơ thể đặt nhân vật ở giữa với
callout bộ phận xung quanh; scene sinh hoạt gom đồ vật theo khu vực sử dụng và giữ thẻ câu nói ở
hàng dưới. Hướng dẫn chính không đọc vị trí màn hình; vị trí tuyệt đối chỉ xuất hiện trong retry
hint. Drag chỉ dùng khi object có đích đến trực quan, còn cảm xúc, trạng thái và phrase card dùng
tap.

Theme `khu-vuon-cua-be` hiện chứa năm lesson theo thứ tự:

1. `plant-a-seed`
2. `help-it-grow`
3. `garden-friends`
4. `harvest-day`
5. `garden-to-table`

Pilot có ba scene theo thứ tự `prepare-the-pot` -> `plant-the-seed` -> `first-watering`. Mỗi scene
có 3/5/7 vocabulary targets ở `core`/`expanded`/`challenge`; cả ba mode giữ cùng chuỗi core và
cùng end state hợp lý. Chậu chuyển `empty -> soil-low -> soil-ready`, tiếp tục
`flat -> hole-open -> seed-visible -> covered`, rồi `dry -> damp`. Mầm chỉ hiện sau cue ngày-đêm,
không hiện ngay khi vừa tưới; success path giữ vũng nước ẩn. Review `random` dùng bốn anchor hình
rõ. Content architecture v2 trong `docs/theme-4-content-draft.md` khóa hành trình năm lesson theo
thứ tự `plant-a-seed` -> `help-it-grow` -> `garden-friends` -> `harvest-day` ->
`garden-to-table`; cả năm lesson đã được đăng ký runtime. Ba blueprint cũ
`garden-ready`, `garden-weather`, `garden-cycle` đã bị loại trước runtime registration nên không
cần migration. Vì free tier vẫn chỉ gồm `morning-routine` và `at-school`, pilot này là Premium
theo policy hiện tại.

Storyboard Mốc 4B trong `docs/theme-4-help-it-grow-storyboard.md` khóa `help-it-grow` thành ba
scene `new-leaf-and-sunlight` -> `rainy-day-care` -> `wind-and-support`, dùng cùng lineage cây cà
chua non và kết thúc bằng bông hoa vàng đã nở sau cue thời gian. Vocabulary-first revision ngày
2026-08-25 khóa budget 8/12/16 New Anchors theo core/expanded/challenge. Core gồm `watering can`,
`leaf`, `sunlight`, `rain`, `soil`, `flower`, `wind`, `stem`; expanded thêm `shade`, `roots`,
`stake`, `soft tie`; challenge thêm `move into sunlight`, `check the soil`,
`wait for the rain to stop`, `support the stem`. Chậu/đích kéo, vòng thời gian, mái che, mây và
que đỡ/dây buộc rời còn là Action Enabler; trạng thái cọc và dây đã lắp cạnh thân cây mới là
target trực tiếp cho `stake` và `soft tie`. Nhịp ngoài intro là core 7/7/7, expanded 9/9/9 và
challenge 11/12/11, tương ứng 21/27/34 meaningful turns. Không có hai pronunciation panels liền
nhau, và review executable được khóa ở 4/5/6 item. Mốc 4C đã author và đăng ký lesson, tạo map icons cùng 40 PNG
masters text-free từ ba production sheets. Đường mở lesson/review/replay luôn truyền learning
mode đã chọn; nếu route cũ thiếu mode, ScenePlayer khôi phục setting đã lưu thay vì mặc định Core.
Các illustration lựa chọn Challenge chỉ hiện trong đúng teach/review beat và được ẩn cả cặp ngay
sau câu trả lời đúng, nên không trở thành đạo cụ thừa trong payoff/closure kế tiếp.
Revision dùng lại toàn bộ 40 ảnh. Asset filename/variant `plant-flower-bud` được giữ vì ổn định
technical key, nhưng copy/audio dạy `flower`. Google TTS tạo 58 audio delta; lesson/full-corpus
audit đạt 439/16.012 target với missing 0, invalid 0. R2 upload 59 object gồm audio và một WebP
rebuild, verify đủ 401/401 và post-upload delta bằng 0 ngày 2026-08-25; audio
`move_into_sunlight.mp3` trên production CDN khớp local theo size và SHA-256.

Storyboard `docs/theme-4-garden-friends-storyboard.md` khóa `garden-friends` thành ba scene
`under-the-leaf` -> `flower-visitors` -> `quiet-garden-watch`, vocabulary/pronunciation 8/12/16
và review executable 4/5/6. Nhịp ngoài intro là 19/25/34 meaningful turns theo
core/expanded/challenge. Animal
cutouts luôn non-interactive; bé thao tác lên lá, đất, observation ring,
time cue, nước hoặc hình hành động. Một production sheet text-free cho mỗi scene được cắt thành
32 object masters, cùng ba background và bốn bundled map icons. Cả năm lesson Theme 4 hiển thị
age label `6-8 tuổi · Nâng cao`; đây là nhãn content track cho phụ huynh, không thêm setting mới
và không thay thế `core`/`expanded`/`challenge`. Đợt đầu có 257 file audio mới cùng 35 WebP được
upload và verify đủ 292/292 object trên R2 ngày 2026-08-14 (`Changed/new: 0`, remote verify
`Errors: 0`). Sau khi sửa hướng dẫn action-first, pipeline resolve 343 audio target; 85 file mới
đã được Google TTS tạo và publish. Cutter cũng được sửa theo gutter thực của sheet, build lại 9
WebP từng bị cắt cụt hoặc dính mảnh từ hàng bên cạnh. R2 đã nhận delta 94/94, verify đủ 377/377;
post-upload dry-run `Changed/new: 0`, audio dry-run `Missing files: 0`, `Invalid files: 0`.
Vocabulary-first revision thêm `leaf`, `fruit`, `wings`, `water drop`, `shell` và
`visit the flower` bằng đúng ảnh/state hiện có; con vật và duplicate mô tả bộ phận vẫn
non-interactive, nên bé tiếp tục thao tác qua kính lúp, hoa, lá hoặc cây. Google TTS tạo 78 audio
delta; lesson/full-corpus audit đạt 432/16.090 target với missing 0, invalid 0. R2 verify đủ
455/455 và post-upload delta bằng 0 ngày 2026-08-25; audio `visit_the_flower.mp3` trên production
CDN khớp local theo size và SHA-256.
Các step tương tác dùng hướng dẫn action-first, gọi observation control bằng tên cụ thể `kính
lúp`, thêm đặc điểm hình và chỉ dẫn vị trí khi cảnh có nhiều mục tiêu tương tự. Không dùng câu chỉ
giải nghĩa mà thiếu động từ `Chạm`/`Kéo`/`Tìm`, và vị trí trong câu hướng dẫn phải khớp geometry
thực tế của object.

Storyboard `docs/theme-4-harvest-day-storyboard.md` khóa `harvest-day` thành ba scene
`find-the-ripe-ones` -> `pick-gently` -> `sort-the-harvest`, vocabulary/pronunciation 8/12/16 và
review executable 4/5/6. Revision giữ nhịp ngoài intro thành 18/27/36 meaningful turns và scene
rhythm 6/6/6, 9/9/9, 12/12/12 theo core/expanded/challenge; mỗi vocabulary có đúng một
pronunciation encounter và không có hai pronunciation panel liền nhau. Scene đầu học thêm `red`
và `leave it on the plant` khi so sánh quả đỏ với quả xanh. Scene hai dạy `basket`, `gentle` và
`branch` trong hai lượt hái bằng tay mà không đổi state hero plant. Scene cuối thêm `carrot` và
`separate`, đưa quả bị dập tới khay có bàn tay người lớn rồi xác nhận ba giỏ tách riêng. Revision
tái sử dụng toàn bộ 34 WebP hiện có; local image build/verify của release asset gần nhất pass
34/34, lỗi 0. Google TTS đã tạo đúng 46 audio delta; lesson audit 459 logical target và full-corpus
audit 15.903 target đều có missing 0, invalid 0, đồng thời audio manifest và English provenance đã
được cập nhật. R2 upload đúng 46 audio object, verify 447/447 và post-upload delta bằng 0. Device
smoke test sau revision 8/12/16 chưa chạy. Cutter thay alpha bằng raw channel thay vì `joinChannel` trên
PNG buffer và từ chối output có opaque-black matte vượt 12% canvas; guard này ngăn nền đen hình
chữ nhật lọt qua kiểm tra alpha/corner như bản đầu.

Storyboard `docs/theme-4-garden-to-table-storyboard.md` khóa lesson cuối thành ba scene
`rinse-and-drain` -> `make-and-share` -> `save-for-next-season`, vocabulary/pronunciation 8/12/16
và review executable 4/5/6. Nhịp ngoài intro là 21/28/35 meaningful turn. Rau quả chuyển
`dirty -> clean`; ở expanded, rổ đi từ `empty` -> xà lách hiện riêng trong rổ -> `filled`; tô chuyển
`empty -> with-lettuce -> prepared -> mixed -> shared`; phong bì được người lớn xử lý theo
`empty -> filled -> closed -> stored`. `seed` là core anchor nhưng hạt nhỏ không draggable và
luôn do người lớn xử lý. Challenge phrase `store it for next season` dùng hình phong bì đã
được cất trên kệ; safety action kế tiếp chạm phong bì đã đóng để nhờ người lớn cất, không dùng
pointer-hand control. Ba sheet chroma text-free được cắt thành 35 cutout PNG, thêm ba background,
build 37 WebP runtime asset và tạo bốn bundled map icons. Cutter loại component nhỏ chạm gutter và
từ chối chroma, opaque corner hoặc opaque-black matte. Local asset audit pass với 0
missing/orphaned reference và verify đủ 37/37. Google TTS đã tạo 69 audio delta ở revision đầu và
thêm đúng 12 audio cho visual/copy correction; lesson audit 443 target và full-corpus audit 15.969
target đều missing 0, invalid 0, đồng thời audio manifest và English provenance đã được cập nhật.
R2 upload thêm 14 correction object, verify 404/404 và post-upload delta bằng 0; audio instruction
mới tải qua production CDN khớp local theo size và SHA-256. Device smoke test sau revision 8/12/16
chưa chạy. Follow-up audit thêm một lượt kéo xà lách sạch vào rổ trước lượt kéo dưa leo và tái sử
dụng cutout `lettuce-clean`; audio delta đã publish trong full-corpus run.

Revision hiện tại của `help-it-grow`, `garden-friends` và `garden-to-table` đã generate/publish
prompt/audio target delta; `harvest-day` tái sử dụng audio và 34 WebP hiện có. Full R2 verify đạt
21.296/21.296 object với lỗi 0; cả bốn correction vẫn chờ device smoke test.

Catalog được khai báo tại `src/data/themes.ts` và `src/data/lessons.ts`. Validators chạy khi
catalog được import; trong development, validation errors có thể throw và warnings được log.
Validator từ chối ID trùng trong danh sách vocabulary, object, drop zone và step của cùng một
scene. Khi một learned word được cố ý dùng lại ở nhiều scene, cùng `vocabId` chỉ hợp lệ nếu toàn bộ
định nghĩa vocabulary giống nhau; reuse có word/meaning/level/type/audio/scope mâu thuẫn sẽ là lỗi,
ngoài các kiểm tra reference hiện có.

Theme `nhung-nguoi-ban-dong-vat` hiện đăng ký sáu lesson Foundation:

1. `feed-the-puppy`
2. `play-with-the-puppy`
3. `find-the-kitten`
4. `clean-muddy-paws`
5. `care-for-the-rabbit`
6. `groom-the-kitten`

Mốc 5A khóa kiến trúc của sáu lesson hiện đã author và đăng ký runtime trong
`docs/theme-5-content-draft.md`; Mốc 5B ban đầu khóa storyboard pilot tại
`docs/theme-5-feed-the-puppy-storyboard.md`. Pilot v2 author ba scene `meet-the-puppy` ->
`fill-the-bowl` -> `puppy-eats`, vocabulary 9/18/27, nhịp 18/36/54, pronunciation encounter
9/18/27 và auto-micro 9/12/15 theo core/expanded/challenge; review chọn 4/5/6 item. Mỗi lượt nói
nối ngay với một action áp dụng nghĩa,
state giữ các chuỗi `waiting -> looking/wagging`, `empty -> filled/ready` và
`waiting -> eating -> happy`, trong đó `happy` chỉ là technical variant ID; prompt luôn có
`Chạm`/`Kéo`/`Tìm`. Từ gắn với cún, bát hoặc
thảm dùng story object; cue còn lại neo sát vùng hành động. Runtime v2 tham chiếu 37 lesson images,
bốn map icons và `themeAnimalFriends`; HUD hiển thị tên cảnh và thanh tiến độ bài học. Google TTS đã tạo 480 clip còn thiếu; audio audit có 626 target, thiếu 0 và lỗi 0. R2 đã
upload delta 490 object, verify đủ 801/801 object với lỗi 0. Bản tối ưu cue-anchor sau đó upload
thêm 6 WebP; tập authoring hiện hành verify đủ 798/798 object với lỗi 0 và post-upload dry-run
còn `Changed/new: 0`; không xóa key cũ khỏi bucket. Revision meal/cleanup tiếp theo khóa scene dùng bữa
theo thứ tự `wait -> feed -> eat -> finished -> celebrate -> carry -> ask an adult -> put it down ->
step back`, chỉ `feed` kéo bát và không có state regression sau `eat`. Audio audit revision có 629
target, thiếu 0 và lỗi 0. Google TTS đã tạo 36 clip mới; R2 đã upload delta 36 audio, verify đủ
834/834 object với lỗi 0 và post-upload dry-run còn `Changed/new: 0`. Revision hình bát trống đã
publish thêm năm WebP; R2 verify đủ 835/835 object với lỗi 0 và post-upload dry-run còn
`Changed/new: 0`; chưa chạy device QA cho revision này.

Storyboard `docs/theme-5-play-with-the-puppy-storyboard.md` khóa lesson thứ hai thành
`choose-the-ball` -> `roll-and-catch` -> `bring-it-back`. Runtime author 9/18/27 vocabulary,
18/36/54 action, 9/18/27 pronunciation encounter và 9/12/15 auto-micro. Core đi đúng thứ tự
`play -> ball -> choose`, `roll -> run -> catch`, `fetch -> bring -> give`; chỉ bước `roll` kéo
bóng, mọi bước còn lại chạm/tìm để giữ mạch nhân-quả. Review trả 4/5/6 item. Local asset pipeline
có 33 PNG master, 33 WebP và bốn icon; image verify pass 33/33. Google TTS đã tạo 508 clip còn
thiếu; audio audit 613 target có missing 0, invalid 0. R2 upload/verify 541/541 object, lỗi 0 và
post-upload dry-run còn `Changed/new: 0`. Scene authoring giữ tối đa một story puppy và một trạng
thái bóng trong mỗi nhịp; cue có chứa cún/bóng dùng thẳng hero hoặc thay thế tạm story object để
không chồng silhouette. Happy-puppy runtime dùng master đầy đủ phần đầu thay cho cell sheet bị cắt;
revision đã upload delta một WebP lên R2, verify đủ 541/541 object, post-upload dry-run còn
`Changed/new: 0`; device QA cho revision này chưa chạy.

Storyboard `docs/theme-5-find-the-kitten-storyboard.md` khóa lesson thứ ba thành
`hear-the-kitten` -> `check-the-hiding-spots` -> `welcome-the-kitten`. Runtime author 9/18/27
vocabulary, 18/36/54 action, 9/18/27 pronunciation encounter và 9/12/15 auto-micro. Story đi từ
nghe tiếng `meow`/theo dấu chân tới kiểm tra hộp, giỏ và gọi mèo ra; không dùng drag. Review trả
4/5/6 item. Local asset pipeline có 40 PNG master, 40 WebP và bốn icon; cutout audit cùng image
verify đều pass. Google TTS đã tạo 520 clip; full-corpus audit có missing 0, invalid 0. R2
upload/verify đủ 560/560 object, lỗi 0 và post-upload dry-run còn `Changed/new: 0`; device QA chưa
chạy.

Storyboard `docs/theme-5-clean-muddy-paws-storyboard.md` khóa lesson thứ tư thành
`notice-the-muddy-paws` -> `wash-the-paws` -> `dry-the-paws`. Runtime author 9/18/27 vocabulary,
18/36/54 action, 9/18/27 pronunciation encounter và 9/12/15 auto-micro. Story đi từ nhận ra
`paws` có `mud`, đứng chờ người lớn, rửa sạch, kiểm tra nước đã có bùn, lau khô rồi rửa tay.
Review trả 4/5/6 item `paws`/`mud`/`water`/`towel` + `basin` + `dry the paws`. Local asset
pipeline có 37 PNG master và bốn icon; cutout audit pass. Google TTS đã tạo 512 clip; production
audio audit có 14.791 target, missing 0 và invalid 0. R2 upload/verify đủ 549/549 object, lỗi 0;
post-upload dry-run còn `Changed/new: 0`. Device QA chưa chạy.

Storyboard `docs/theme-5-care-for-the-rabbit-storyboard.md` khóa lesson thứ năm thành
`prepare-the-hay` -> `fill-the-water` -> `rabbit-snack-and-hop`. Runtime author 9/18/27
vocabulary, 18/36/54 action, 9/18/27 pronunciation encounter và 9/12/15 auto-micro. Story đi từ
chuẩn bị cỏ khô thơm vào máng, thêm nước sạch vào bát, thưởng mẩu cà rốt nhỏ đã chuẩn bị, vuốt nhẹ
và quan sát thỏ bật nhảy nhẹ quanh chỗ đứng (`hop`). Review trả 4/5/6 item
`rabbit`/`hay`/`water`/`hop` + `hay rack` +
`feed the rabbit`. Local asset pipeline có 37 PNG master, 37 WebP và bốn icon map/milestone;
cutout audit pass. Google TTS đã tạo 495 clip; audio audit có 607 target, missing 0 và invalid 0.
R2 upload/verify đủ 532/532 object, lỗi 0; post-upload dry-run còn `Changed/new: 0`. Follow-up
visual revision tạo ba sheet 4×3 với một character thỏ trắng duy nhất, tái tạo 37/37 local image;
cutout audit, lesson audit và image verify đều pass, 0 missing/orphan. R2 upload đúng 34 WebP,
verify đủ 637/637 object, lỗi 0 và post-upload dry-run còn `Changed/new: 0`; device QA chưa chạy.

Storyboard `docs/theme-5-groom-the-kitten-storyboard.md` khóa lesson thứ sáu thành
`get-the-brush` -> `brush-the-fur` -> `kitten-purrs`. Runtime author 9/18/27 vocabulary,
18/36/54 action, 9/18/27 pronunciation encounter và 9/12/15 auto-micro. Story đi từ lấy chiếc bàn chải
lông chuyên dụng, chải lông nhẹ nhàng xuôi chiều gỡ rối, đến khi bộ lông suôn mượt và mèo con
nghỉ và phát tiếng gừ gừ (`purr`). Review trả 4/5/6 item `kitten`/`brush`/`smooth`/`purr` + `mat` +
`brush the fur`. Local asset pipeline có 28 PNG master, 28 WebP và bốn icon map/milestone;
cutout audit pass. Google TTS đã tạo 587 clip; audio audit có 610 target, missing 0 và invalid 0.
R2 upload/verify đủ 615/615 object, lỗi 0; post-upload dry-run còn `Changed/new: 0`. Follow-up
visual revision tạo ba sheet 4×3 bằng đúng identity mèo cam vằn của `find-the-kitten`, đồng thời
đưa `kitten-shiny-coat` vào cell thứ chín của sheet chải lông để loại hình phẳng mắt xanh cũ.
Cutout audit, lesson audit và image verify local đạt 28/28, 0 missing/orphan. R2 upload đúng 25
WebP, verify đủ 768/768 object, lỗi 0 và post-upload dry-run còn `Changed/new: 0`; device QA chưa
chạy.

Revision vocabulary ownership ngày 2026-08-25 giữ `happy` là New Anchor của `my-feelings` ở
Theme 3, không dạy lại từ này trong Theme 4–5. Follow-up audit khóa tám anchor Theme 5 theo ngữ
cảnh thành `celebrate`, `playful`, `friendly`, `stand`, `calm`, `the rabbit hops`, `cheerful` và
`relaxed`; tên asset hoặc Scene State variant legacy có chứa `happy` chỉ là technical identifier,
không mở pronunciation panel. Exact duplicates giữa các lesson Theme 5 chỉ còn allowlist phục vụ
lesson Foundation độc lập hoặc an toàn: `ask an adult`, `bowl`, `empty`, `hungry`, `kitten`,
`mat`, `pet gently`, `put it down`, `ready`, `wait` và `water`; test ownership sẽ fail nếu có từ
trùng ngoài danh sách. Delta 148 audio/R2 đã publish thuộc revision ownership đầu trong ngày;
follow-up đổi anchor/copy/representative đã tạo thêm 279 audio và publish cùng sáu WebP trong một
delta 285 object. Full-corpus audit đạt 16.156 target với thiếu 0/lỗi 0; R2 verify đủ
21.296/21.296 object, lỗi 0 và post-upload `Changed/new: 0`. Grooming audit dùng representative
trực tiếp cho `bristles`, `neat`, `relaxed` và dedicated `kitten-shiny-coat` cho `shiny coat`,
không dùng chung hình `neat` để thay cho độ óng của bộ lông. Current audit của cả sáu lesson chỉ
còn chờ device QA.

### Hierarchy

```text
LessonTheme
  -> optional iconName
  -> lessonIds[]

Lesson
  -> ageRange
  -> scenes[]
  -> optional reviewGame

Scene
  -> background
  -> optional character
  -> vocabulary[]
  -> objects[] với optional variants/initial state
  -> dropZones[]
  -> steps[] với optional successStateChanges[] / afterSuccessStateChanges[]
  -> optional completionReward
```

Shared contracts nằm trong `src/types/lesson.ts`.

### Scene vocabulary và objects

- Vocabulary type: `noun`, `verb`, `adjective`, `phrase`.
- Vocabulary level: `easy`, `medium`, `hard`.
- Object roles: `learning`, `decoration`, `dropZone`, `character`.
- Vị trí và touch areas dùng `PercentRect` để responsive theo scene.
- `SceneObject` luôn có base asset và có thể thêm `variants[]`, `initialVariantId` hoặc
  `initialVisibility`. Variant có thể override asset/position/touch area; phần thiếu kế thừa từ
  object gốc.
- `AssetRef` hỗ trợ type `image`, `audio`, `lottie`, `sprite`; runtime support thực tế phụ thuộc
  renderer/registry hiện có.

### Steps và interactions

- Step types: `intro`, `teach`, `practice`, `review`.
- Interaction types: `listen`, `tap`, `drag`, `find`.
- `StepController` quyết định listen/interactive flow, đánh giá tap/find/drag, next step và
  success/fail feedback; chỉ kết quả đúng mới trả `successStateChanges` cho runtime.
- `ScenePlayer` render scene, phát instruction/audio, khóa tương tác trong thời điểm cần thiết,
  điều phối effects, scene object state, prefetch và progress.
- Với step `teach` có từ vựng và tương tác `tap`/`drag`/`find`, bé vẫn có thể thao tác trong lúc
  instruction đang phát. Kết quả đúng phản hồi hình ảnh ngay, nhưng runtime phải bảo đảm từ tiếng
  Anh mục tiêu đã phát xong ít nhất một lần trước success feedback và chuyển bước; nếu playback
  bị treo hoặc không khả dụng, failsafe tối đa 3 giây cho phép lesson tiếp tục để không khóa bé
  trong scene.
- Scene State v1 có ba action: `setObjectVariant`, `showObject`, `hideObject`. Không có branching,
  inventory, biến tùy ý hoặc state xuyên scene.
- Object có `initialVisibility: hidden` được `showObject` sẽ fade-scale trong 260 ms; Reduce Motion
  bật thì snap thẳng về trạng thái cuối. Entrance này không dùng sparkle/bounce success semantic.

### Learning modes

- `core`: nội dung cơ bản.
- `expanded`: thêm vocabulary/steps có `minMode: expanded`.
- `challenge`: thêm nội dung có `minMode: challenge`.

`src/data/learningModes.ts` lọc đồng bộ vocabulary, character, objects, drop zones và steps theo
`learningScope`, đồng thời bỏ dangling `nextStepId` và state action mất target/variant sau khi lọc.

- **Implemented:** mode filtering bằng `learningScope.minMode`.
- **Partial:** `learningScope.minAge` được hỗ trợ bởi helper và tests, nhưng runtime call sites
  chưa truyền child age vào `getSceneForLearningMode`; chưa có age-personalized lesson runtime.

## 6. User flows và feature status

### Onboarding

- **Implemented:** lần đầu mở app, phụ huynh/bé trải nghiệm luồng Onboarding 2 bước sinh động:
  - **Bước 1:** Làm quen với linh vật Sungy, phát âm thanh chào đón và xem 3 điểm nổi bật của phương pháp học.
  - **Bước 2:** Chọn độ khó (`core`, `expanded` hoặc `challenge`), mặc định được chọn sẵn ở mức Vừa (`expanded`).
- **Implemented:** hoàn tất ghi `hasCompletedOnboarding` và `learningMode`, sau đó vào `Home`.
- **Unsupported trong onboarding:** nhập tên, avatar hoặc năm sinh. Child profile được chỉnh sau
  trong Parent Mode.

### Kid Mode

- `HomeScreen` là trải nghiệm Kid Mode chính với Map và Play tabs.
- Theme map hiển thị lesson/scene progression, CTA hiện tại và review đang chờ.
- Chạm cụm thương hiệu Sungy trên Home header mở bottom sheet **Chặng tiếp theo** gọn theo trạng
  thái hiện tại: học tiếp, ôn tập, hoàn thành hoặc khóa Premium. Sheet gom tên trạm, lời hướng dẫn
  và tiến độ theme vào một card; không lặp tiến độ thành các ô sao/trạm riêng. Phần sticker chỉ là
  banner phụ có nhãn rõ để mở bộ sưu tập. Toàn bộ card chặng và CTA cuối sheet cùng gọi một action
  chính theo trạng thái, có pressed feedback và tap sound để bé chạm vào vùng nổi bật không bị im
  lặng. Nút `×` và backdrop đóng sheet; khóa Premium giữ CTA **Nhờ ba mẹ mở khóa** và tiếp tục qua
  adult gate mà không phát chồng tap sound với lời nhắc khóa.
- Các action chính của Kid Mode dùng feedback chung: tab Map/Play, scene node, review milestone,
  card Play và CTA Hub co nhẹ/hạ 1–2 px ngay khi nhấn, phát tap SFX cho action khả dụng và chặn lần
  nhấn lặp trên cùng control trong 350 ms. Nút mở thư viện theme và các card theme khả dụng cũng
  phát tap SFX trước khi điều hướng hoặc đổi bản đồ. Action khóa không phát tap chung vì lời nhắc
  khóa đã có audio riêng. Khi system Reduce Motion bật, control chỉ đổi opacity; pulse của trạm
  hiện tại và nhịp bounce icon khi đổi tab đều tắt.
- Node cảnh đã hoàn thành giữ thao tác chính để học lại cảnh. Nếu scene có ít nhất một vocabulary
  visual hợp lệ trong `learningMode` hiện tại và lesson vẫn truy cập được, node có thêm nút ôn từ
  48×48 với icon hai thẻ từ và mũi tên vòng, neo chồng nhẹ vào cạnh ngoài node để thể hiện quan hệ
  với scene nhưng vẫn tránh đường nối và dấu hoàn thành. Nút mở thẳng `Góc chơi từ vựng`; cảnh chưa
  hoàn thành, bị khóa hoặc không có visual không hiện shortcut này. Shortcut là action phụ gắn với
  scene, không tạo thêm map station và không thay thế review milestone cuối lesson.
- Màn hoàn thành scene và card scene đã hoàn thành trong Lesson Pack có CTA mở `Góc chơi từ
  vựng` khi scene có ít nhất một vocabulary visual hợp lệ. Màn này chỉ dùng vocabulary thuộc scene
  sau khi lọc theo `learningMode`; từ không resolve được hình riêng sẽ bị ẩn. Resolver visual dùng
  chung với review games và chọn đúng object/variant đang hiện ở đầu teach step của từ đó, nên các
  trạng thái theo timeline như `meal` và `ready` dùng đúng hình thay vì asset base. Trong cùng một
  scene, mỗi object variant/asset chỉ đại diện cho tối đa một từ; noun và direct `vocabId` được ưu
  tiên khi nhiều từ trỏ tới cùng hình để tránh hình trùng hoặc gắn nhãn mơ hồ. Mọi visual được đặt
  sẵn trên scene background, ưu tiên tâm position của đúng variant rồi tự dịch các placement trùng
  nhau. Đồ vật luôn ở trên tranh, không có thao tác xoá hoặc khay từ; bé chạm để nghe và kéo để chơi
  tự do. Mỗi lần chạm thật sự, đồ vật squish-bounce kèm halo, sparkle và nhãn từ tạm thời cạnh đồ
  vật trong lúc phát âm. Nhãn co giãn theo độ dài, tự xuống dòng không ellipsis, giữ font tối thiểu
  18dp và clamp trong lề canvas; từ ngắn dùng capsule còn cụm/câu dài dùng bubble bo góc rộng hơn.
  Thao tác kéo không kích hoạt hiệu ứng chạm và khi thả chỉ có một nhịp nảy nhẹ. Với Reduce Motion,
  runtime bỏ bounce/sparkle và chỉ flash halo cùng nhãn từ. Nút `×` đóng màn, còn `Đặt lại` khôi
  phục bố cục mặc định. Điều khiển và hướng dẫn chỉ là overlay gọn trên canvas. Sau mỗi lần thả,
  vị trí chuẩn hóa và thứ tự chồng lớp của toàn bộ đồ vật được lưu local theo
  `lessonId + sceneId + learningMode`; lần mở sau khôi phục các item vẫn còn hợp lệ, bỏ item đã
  bị xóa khỏi content và dùng vị trí mặc định cho item mới. `Đặt lại` đồng thời xóa bố cục đã lưu
  của đúng cảnh/chế độ hiện tại. Nút icon quả địa cầu kèm badge cờ Việt Nam nằm giữa nút đóng và
  đặt lại, không hiển thị mã ngôn ngữ; mặc định tắt trên dữ liệu cũ/install mới và ghi nhớ chung
  trên thiết bị. Badge cờ được làm mờ khi tắt; khi bật, nút đổi màu, cờ sáng và hiện dấu kiểm. Mỗi
  lần đổi trạng thái phát một câu tiếng Việt production xác nhận. Khi bật, chạm đồ vật phát English
  trước, nghỉ 400 ms rồi phát authored `meaningVi`; nhãn nổi hiển thị English lớn và nghĩa tiếng
  Việt nhỏ. Một lần chạm mới hoặc đổi toggle hủy narration cũ để không phát chồng tiếng.
- Mỗi scene node trên theme map dùng đúng bundled icon riêng của scene; icon milestone đại diện
  lesson không được dùng làm lý do thay scene icon bằng một fallback chung.
- Mỗi milestone/review node cuối lesson dùng một bundled milestone icon riêng theo chủ đề bài học,
  không dùng lại icon của bất kỳ scene nào.
- Thẻ lesson/review ở Play tab dùng icon đại diện toàn bộ bài học; `supermarket-trip` dùng hình
  mặt tiền siêu thị thay vì graphic túi có nhãn từ vựng `CART`.
- Play tab có card mở `StickerPlaygroundScreen`. Bé chọn một trong ba nền phòng ngủ, công viên và
  bãi biển; chỉ sticker bài học/thành tựu đã mở khóa mới xuất hiện trong khay. Mỗi sticker chỉ có
  một placement trên từng nền: chạm lần đầu thêm ở giữa canvas, chạm lại chọn/đưa bản hiện có lên
  trên, còn kéo thẳng lên từ khay sẽ đặt sticker tại vị trí thả hoặc chuyển bản hiện có tới đó.
  Gesture kéo dọc được ưu tiên theo ngưỡng hướng, còn vuốt ngang tiếp tục cuộn khay; thả ngoài
  canvas không thay đổi board. Sticker trên canvas hỗ trợ pan, pinch zoom và rotation đồng thời,
  cùng các thao tác hoàn tác, xóa sticker đang chọn và dọn riêng nền hiện tại có xác nhận.
- `guided`: mở theo progress và scene đầu tiên chưa hoàn tất.
- `free`: cho phép mở nội dung không phụ thuộc thứ tự progress.
- Sau reward, CTA **Bài tiếp theo** đồng bộ `activeThemeId` khi cần rồi mở thẳng scene chưa hoàn
  tất đầu tiên của lesson kế tiếp; navigation history được làm mới về Home/Map + scene mới để thao
  tác đóng không quay lại reward hoặc lesson vừa hoàn thành.
- **Implemented:** trong theme map, trạm/review bị khóa do tiến độ vẫn nhận thao tác chạm để hiện
  giải thích; khóa tiến độ, Premium và trạng thái đang kiểm tra Premium phát lời nhắc ngắn theo
  `appLanguage`. Các clip Google TTS nằm trong bundled UI audio registry cùng các lời Sungy
  Home/Onboarding tĩnh tương ứng ở cả Việt/Anh, và được throttle để tránh phát lặp khi bé chạm
  liên tục.
- `visibleLessonIds` lưu lựa chọn lesson bên trong từng theme; `undefined` nghĩa là chọn tất cả.
  `disabledThemeIds` ẩn toàn bộ theme khỏi Kid Mode nhưng không xóa lựa chọn lesson của theme đó,
  nên bật lại sẽ khôi phục đúng selection trước đây. Normalization luôn giữ ít nhất một theme đang
  bật và ít nhất một lesson đã chọn trong mỗi theme; khi catalog thêm theme mới, settings cũ tự
  thêm lesson đầu tiên của theme mới mà không bật lại các lesson đã ẩn.
- `ThemeLibrary` tách theme active thành card `Hành trình của bé` gọn, chỉ giữ hình, tên, tiến độ và
  CTA chính. Theme chưa học trạm nào dùng `Bắt đầu hành trình`, theme đang học dùng `Tiếp tục trên
  bản đồ`, còn theme đạt đủ số trạm hiển thị `Đã hoàn thành` cùng CTA `Xem lại bản đồ`. Các theme
  còn lại nằm trong lưới trực quan hai cột trên điện thoại và ba cột trên tablet, ưu tiên hình minh
  họa/tên/trạng thái ngắn; chạm toàn bộ card để đổi bản đồ. Kid Mode không hiển thị mô tả dài hoặc
  ghi chú dành cho phụ huynh trên màn này. Home header có entry mở thư viện để bé/ba mẹ đổi bản đồ
  active; theme mới có thể bị khóa Premium nếu không có lesson nào thuộc free tier.

### Parent Mode

- **Implemented:** adult gate yêu cầu trả lời phép tính đơn giản. Sau ba câu trả lời sai, gate
  cooldown 10 giây trước khi cho thử tiếp; PIN vẫn unsupported.
- Quyền Parent là session in-memory, không persist. Session bị revoke khi app rời trạng thái active,
  trừ các external flow do phụ huynh chủ động mở như sign-in, store purchase/restore, hộp thoại cấp
  quyền thông báo hoặc system notification settings. Ngoại lệ notification kết thúc khi app trở lại
  foreground; sau đó những lần rời app bình thường tiếp tục revoke session.
- **Implemented:** xem activity/streak/weekly stats và progress tổng quan.
- Dashboard phụ huynh có card giọng đọc gần đây và route `ParentVoiceLibrary` riêng, vẫn nằm sau
  Parent access session. Từng nút play trong card dashboard phát trực tiếp mốc gần nhất của từ đó;
  audio bị hủy khi card mất focus hoặc phụ huynh mở toàn bộ thư viện. Thư viện có hai cách xem
  `Gần đây` và `Theo bài học`; cách xem theo bài nhóm theo theme -> lesson -> word để không biến
  nhiều file rời thành danh sách khó quản lý. Mỗi hàng mốc là vùng phát hoàn chỉnh, tách nhãn mốc
  khỏi ngày/thời lượng và cho metadata xuống dòng tự nhiên; thao tác xóa theme, lesson, word hoặc
  mốc nằm sau menu `⋯` thay vì chiếm chiều ngang bằng nút chữ đỏ. Route dùng navigation title làm
  tiêu đề duy nhất, đặt disclosure local-only sau icon thông tin ở header và đưa tabs/danh sách
  hoặc empty state gọn lên đầu thay vì dùng hero giới thiệu lớn.
- Parent stats tổng quan là chỉ số lịch sử/all-time, không reset hay lọc lại theo `learningMode`
  hiện tại. `Tổng từ đã học` dùng unique learned word IDs; `Sticker nhận được` bao gồm sticker
  lesson đã nhận và achievement stickers đã unlock/đã có record.
- Parent stats không hiển thị card current lesson riêng; CTA chính nằm ở card tiến độ hôm nay, còn
  hoạt động ôn tập dùng review card chuyên biệt để tránh trùng lời mời hành động.
- **Implemented:** các chip từ vựng và tip text trong Parent stats review card, cùng lesson
  preview, dùng vocabulary khả dụng theo `learningMode` hiện tại; từ ở mode cao hơn không hiển thị
  khi phụ huynh đang chọn mode dễ hơn.
- **Implemented:** tab Bài học giữ phần tổng quan ngắn gồm preset hiện hành, số bài đang bật và
  entry `Chỉnh lộ trình`; guided/free journey và difficulty vẫn nằm trong phần `Cách bé học` bên
  dưới. Việc chọn phạm vi bài chuyển sang route parent-only `ParentLessonPlan`, gồm ba preset
  `Gợi ý` / `Tất cả` / `Tự chọn`, sau đó là danh sách lesson chia theo theme có thể thu gọn. `Gợi
  ý` chọn lesson đầu tiên của mỗi theme để luôn khớp invariant ít nhất một lesson/theme; `Tất cả`
  bật toàn bộ catalog; `Tự chọn` giữ nguyên selection để phụ huynh chỉnh từng dòng. Toàn bộ dòng
  lesson là checkbox, không hiển thị progress hoặc preview; lesson cuối còn bật trong theme bị
  khóa và mỗi theme có thao tác `Chọn tất cả`. Header theme có switch bật/tắt; tắt theme thu gọn
  card, ẩn theme cùng các lesson của nó khỏi Home Map, Play/Review, lesson list và Theme Library,
  nhưng giữ nguyên lesson selection để khôi phục khi bật lại. Switch theme cuối đang bật bị khóa.
  Thay đổi chỉ được persist khi bấm `Lưu thay đổi`; CTA này chỉ bật khi cấu hình khác trạng thái
  ban đầu. Mở/thu danh sách bài không làm draft bị dirty. Nếu quay lại khi có thay đổi chưa lưu,
  màn hình yêu cầu xác nhận trước khi bỏ draft. Chỉnh từng lesson không đổi
  `progress.activeThemeId`; nếu tắt đúng theme đang mở, màn hình báo trước và khi lưu sẽ chuyển
  active map sang theme đang bật kế tiếp. Tab Cài đặt bỏ hero/card giới thiệu lớn và dùng các nhóm
  danh sách nhất quán theo thứ tự `Hồ sơ của bé`, `Thói quen học`, `Giọng đọc & dữ liệu`, `Ứng
  dụng`, `Tài khoản & đồng bộ`, `Liên hệ & thông tin`. Tab này chỉnh child profile,
  Light/Dark/System theme, app-language preference, teacher prompt mode, English accent, daily
  reminder time, optional background music, thư viện giọng đọc local, crash reporting, contact
  support email và app version đọc trực tiếp từ native release metadata. Các lựa chọn tiếp tục tự
  lưu theo từng thao tác; nhóm hồ sơ giữ name field và birth-year picker ngay trong danh sách gọn.
  Card giọng đọc có toggle và thao tác xóa toàn bộ độc lập, nên phụ huynh có thể dọn lịch sử mà vẫn
  giữ tự động lưu cho các buổi sau.
- **Implemented:** đánh giá ứng dụng là parent-only. Prompt native chỉ được cân nhắc khi Parent
  dashboard đã ổn định, app đã được theo dõi ít nhất 7 ngày, có hoạt động học ở ít nhất 3 ngày và
  đã hoàn thành ít nhất 3 lesson. App chờ 2,5 giây tại điểm nghỉ, không hiện cùng update/crash/
  settings flow, không chạy tự động trong development, chỉ thử một lần mỗi app version, cooldown
  tối thiểu 90 ngày và tối đa 2 lần trong 365 ngày. App chỉ lưu lần đã gọi API vì StoreKit/Google
  Play không cho biết prompt có hiện hoặc phụ huynh có gửi đánh giá hay không.
- Tab Settings có link chủ động "Đánh giá Sungy" trong nhóm hỗ trợ, vẫn nằm sau adult gate.
  Android dùng Play Store package URL và browser fallback. iOS thêm `action=write-review` vào URL
  App Store hợp lệ từ app-update policy hoặc fallback tĩnh `https://apps.apple.com/app/id6790650146`
  trong `src/config/appInfo.ts`.
- Các config chính trong Góc phụ huynh có giải thích ngắn theo ba ý: tính năng là gì, ảnh hưởng
  tới bé, dữ liệu/quyền riêng tư. Những row mở bottom sheet sẽ hiển thị phần giải thích trong
  sheet; những config dạng bật/tắt hoặc không có sheet riêng dùng nút info compact. Áp dụng cho
  cách mở bài học, độ khó, nhịp học, nhắc học, giờ nhắc, ngôn ngữ app, giọng hướng dẫn, giọng
  tiếng Anh, giao diện, nhạc nền, thư viện giọng đọc, crash reporting và cloud learning data sync.
- **Implemented:** parent account card hỗ trợ đăng nhập/đăng xuất/xóa tài khoản Firebase Auth bằng
  Google và Apple. Đây là tài khoản phụ huynh. Trên iOS hỗ trợ Apple Sign-In, nút Apple đứng trước
  Google trong Parent/Premium, kể cả luồng kích hoạt Founder; Android chỉ hiện Google. Trong nhóm
  `Tài khoản & đồng bộ` của tab Cài đặt, trạng thái đã đăng nhập hiển thị thành một summary row gồm
  tên, provider và badge Premium nếu có; cloud sync là một row riêng gồm status cùng switch. Quản
  lý gói và đăng xuất dùng action row gọn, còn xóa tài khoản là destructive link ít nổi bật ở cuối
  nhóm thay vì ba nút lớn xếp dọc.
- **Implemented:** trong account card, phụ huynh chủ động bật/tắt cloud learning data sync. Consent
  modal liệt kê progress và selected settings được sync; opt-out cho phép giữ hoặc xóa bản cloud.
  Daily activity, voice recordings, lesson assets và per-device notification permission/schedule
  không được upload.
- **Implemented:** khi Parent Mode mở bài học hoặc game ôn tập, phiên phụ huynh được giữ để nút
  quay lại trở về Parent Mode mà không phải vượt qua adult gate lần nữa.
- **Implemented:** entry từ Kid Mode có thể mở `Parent` với intent `premium`/`founderPromo`; sau
  khi adult gate pass, Parent Mode điều hướng sang `Premium`. `PremiumScreen` cũng tự trả về Parent
  gate nếu session chưa được cấp.
- Update bắt buộc có thể xuất hiện ngoài navigation nhưng link App Store/Google Play không mở trực
  tiếp cho trẻ. Màn này dùng Sungy, biểu tượng phụ huynh lớn, tự phát clip Kid Mode local nhắc gọi
  ba mẹ và cho phép chạm Sungy để nghe lại; chỉ có một CTA hình phụ huynh để mở adult gate phép
  tính, không có nút bỏ qua. Prompt khuyến nghị không che Kid Mode; nó chỉ hiện thành card trong
  Parent Mode đã mở khóa, nơi phụ huynh có thể cập nhật hoặc hoãn 3 ngày.
- **Implemented:** development-only scene editor flag; khi bật trong dev build, flag này cũng mở
  khóa Kid Map/Lesson Pack để QA nội dung mà không coi đây là production feature.
- **Partial:** `appLanguage` (`vi`/`en`) được persist và dùng bởi i18n foundation cho Onboarding,
  Parent gate/settings, navigation titles, ScenePlayer system controls/completion chrome, bottom
  tabs, Home coach/hub chrome, LessonList chrome, ReviewGame empty states, memory-game chrome,
  Parent stats/lesson-management chrome, daily reminder copy, microphone permission copy,
  lesson/theme descriptions và domain titles theme/lesson/scene/review-game ở các màn hình chính.
  Một số parent tips và prompt data vẫn Vietnamese-first.
- **Implemented:** thay đổi parent settings về `appLanguage` được phát trong runtime để các màn
  hình đã dùng i18n foundation cập nhật mà không cần restart app.
- **Partial:** `teacherPromptMode` (`vi`/`en`/`bilingual`) được persist và chọn trong Parent UI.
  ScenePlayer instruction audio/display dùng `instructionVi` cho Vietnamese và English teacher
  instruction từ `instructionEn` hoặc fallback resolver dựa trên interaction/vocabulary/promptText.
  Scene success/fail feedback, speech-practice prompt/encouragement và memory review intro cũng đi
  qua teacher prompt resolver và nhận thay đổi `teacherPromptMode` từ parent settings trong
  runtime. Teach-step feedback có thể tự dựng câu nghĩa từ vocabulary như “It means good
  morning.”; intro/completion có sắc thái riêng dùng English copy viết tay, còn resolver dựng câu
  theo action, object, vị trí và số ít/số nhiều cho các step còn lại. Gợi ý vị trí tiếng Việt được
  giữ thành gợi ý vị trí tiếng Anh thay vì rút thành “Tap ...”. Các feedback English chưa có
  context rõ vẫn dùng cue an toàn như “Great job!” hoặc “Try again.” khi chỉ có bản Việt.
- **Implemented:** `englishAccent` (`en-US`/`en-GB`) được persist và chọn trong Parent UI, độc lập
  với `appLanguage` và `teacherPromptMode`. Runtime English vocabulary, teacher prompt, review và
  replay audio dùng accent đã chọn; persisted data cũ normalize về `en-US`. Lựa chọn này không
  tự đổi spelling/copy, ví dụ nội dung đang viết `pajamas` không trở thành `pyjamas` khi chọn
  en-GB.

### Premium access và in-app purchases (Phase 1)

- Free tier được xác định bằng stable lesson IDs trong `src/engine/ContentAccessPolicy.ts`:
  `morning-routine` và `at-school`. Các lesson này cùng scene/review của
  chúng luôn mở, kể cả khi monetization đang khởi tạo, signed out hoặc tạm unavailable; các lesson
  còn lại cần entitlement `premium` active.
- Caller entry points và destination screens đều guard access. `LessonPackScreen`,
  `ScenePlayerScreen` và `ReviewGameScreen` không mount nội dung/audio premium trước khi quyền
  được xác nhận; `openedFromParent` không bypass entitlement. Kid-facing lock dùng popup nhờ ba
  mẹ mở khóa và mở Parent intent, không dùng màn Premium toàn trang trong Kid Mode.
- Scene/review đã bắt đầu latch access cho phiên hiện tại để entitlement hết hạn giữa hoạt động
  không đẩy bé ra ngoài. Quyền được kiểm tra lại tại boundary mới, ví dụ từ scene sang review.
- `PremiumScreen` chỉ mở sau adult gate và hỗ trợ parent Firebase sign-in tùy chọn, hiển thị
  packages từ RevenueCat offering, mua, restore, subscription management URL, trạng thái gói đang
  active và retry. Store purchase/restore không yêu cầu đăng ký tài khoản phụ huynh; sign-in chỉ
  dùng để liên kết quyền với parent account cho cloud sync/account-based restore. UI hỗ trợ
  package monthly/annual/lifetime; giá/currency hiển thị lấy từ store metadata, không lấy các giá
  tư vấn hardcode trong app, và checkout hiển thị disclosure/legal links cho gói đang chọn.
- Khi normalized monetization status là `premium`, Kid Mode hiển thị chip Premium nhỏ trong
  header mà không đưa giá, hạn dùng hoặc chi tiết mua hàng vào UI của bé. Parent dashboard hiển
  thị indicator Premium gọn với icon crown riêng, trạng thái, loại quyền và entry mở
  `PremiumScreen`; hạn dùng/gia hạn nằm trong màn Premium chi tiết. Phần tài khoản phụ huynh cũng
  gắn badge Premium với account đang đăng nhập. Khi status là `signedOut`, `free` hoặc
  `unavailable`, Parent dashboard hiển thị teaser card mềm để ba mẹ xem gói Premium; teaser ẩn
  trong lúc `initializing` để tránh nhấp nháy. Trình chỉnh lộ trình không dùng entitlement để thay
  đổi selection: phụ huynh có thể cấu hình toàn bộ phạm vi nội dung, còn trạng thái khóa và CTA mở
  Premium tiếp tục được hiển thị ở các màn học nơi lesson được mở. Kid Home Map cũng hiển thị CTA
  Premium theo tiến độ sau khi toàn bộ free lesson IDs đã nằm trong `completedLessonIds`; CTA ẩn
  với tài khoản Premium hoặc khi monetization còn `initializing`, và mở Parent intent `premium`
  cho bài Premium kế tiếp.
- `src/engine/MonetizationManager.ts` dùng Firebase parent UID làm RevenueCat App User ID khi
  parent đã sign in, và dùng anonymous RevenueCat customer khi parent chưa sign in. Verified
  `CustomerInfo.entitlements.active.premium` là source of truth cho quyền đã mua, luôn ưu tiên và
  mở Premium kể cả khi chưa có parent account; listener và explicit refresh cập nhật trạng thái.
  Founder access là nhánh local riêng, được tính từ metadata RevenueCat và Remote Config, không
  phải RevenueCat entitlement, và vẫn chỉ mở nội dung sau khi parent sign-in. Không persist quyền
  thành một local boolean.
- `premium_purchase_enabled` có thể tạm dừng mua mới mà không thay đổi entitlement đã có.
  Purchase/restore dùng StoreKit/Google Play qua RevenueCat mà không bắt buộc parent account.
  RevenueCat diagnostics và automatic device-identifier collection được tắt trong client config.
- **Store release blocker:** RevenueCat public SDK keys, Privacy Policy URL và Terms of Use URL đã
  có trong `src/config/monetization.ts`, nhưng release vẫn cần App Store Connect/RevenueCat product,
  offering, entitlement, screenshot metadata và subscription metadata khớp với app binary.
- **Implemented trong repository:** client đọc `founder_premium_cutoff_at` và
  `founder_premium_duration_days`, so sánh với RevenueCat `CustomerInfo.firstSeen` và chỉ mở nội
  dung sau khi Firebase parent sign-in. Cutoff rỗng/date không hợp lệ fail closed; cơ chế này không
  phải quota chính xác 500 và không được mô tả là “500 lượt tải đầu tiên”.
- Khi anonymous customer đang đủ điều kiện Founder nhưng phụ huynh chưa đăng nhập, `PremiumScreen`
  ưu tiên hero quà tặng `0đ · 365 ngày` trước quyền lợi và chỉ hiển thị một nhóm CTA đăng nhập để
  kích hoạt. Các package trả phí mặc định được thu gọn sau action phụ `Xem các gói trả phí`; nếu
  phụ huynh chủ động mở phần này, checkout không lặp lại card đăng nhập tùy chọn của luồng mua.

### Scene learning

- Scene gồm instruction playback, Continue/listen steps và object interactions.
- Teacher instruction resolver hỗ trợ Vietnamese, English hoặc bilingual dựa trên
  `teacherPromptMode`; English instruction ưu tiên `SceneStep.instructionEn`, sau đó tự dựng câu
  từ interaction/vocabulary/promptText để tránh đọc cue cụt như chỉ “book”.
- Teacher feedback resolver hỗ trợ success/fail display/audio theo `teacherPromptMode`; feedback
  cụ thể từ lesson có thể dùng `successFeedbackEn`/`failFeedbackEn`; khi thiếu, resolver dùng
  context của step như vocabulary, interaction, action prompt và drop zone để dựng English
  feedback cụ thể trước khi rơi về cue chung. Teach step vẫn có vocabulary fallback sang câu nghĩa
  English như `It means good morning.`.
- Scene title hiển thị theo `appLanguage` (`titleEn` cho English UI, `titleVi` cho Vietnamese UI);
  vocabulary và phát âm mục tiêu vẫn luôn là English. `englishAccent` chỉ chọn biến thể audio
  en-US/en-GB cho cùng English text, không thay đổi text hiển thị.
- Vocabulary English trên instruction/pronunciation card chỉ là copy hỗ trợ, không phải kênh giải
  nghĩa chính cho trẻ chưa biết đọc; runtime không hiển thị `meaningVi` như một bản dịch phải đọc.
  Với cụm hành động mới, một teach step phải cho bé xem hành động, nghe lời Việt giải thích nghĩa,
  rồi nghe mẫu English và tập nói trước khi cụm đó xuất hiện trong step review. Lời hướng dẫn của
  review phải nhắc lại nghĩa bằng tiếng Việt và mô tả dấu hiệu hình ảnh đủ cụ thể để bé thao tác
  mà không cần đọc English hoặc `meaningVi`. Mỗi lời Việt chỉ nên có một ý và một yêu cầu thao
  tác; pre-reader path đặt authoring target tối đa 12 từ cho teach và 10 từ cho review. Prompt
  được audit trên toàn bộ scene: khi nhiều object cùng khớp một khái niệm, lời nói phải gọi đúng
  dạng nhìn thấy hoặc dấu hiệu phân biệt của target; ảnh vocabulary phải thể hiện khái niệm dương,
  không dùng ảnh có dấu phủ định hoặc before-state không thể hiện hành động đang dạy.
- Speech practice là policy riêng trên step: `speechPractice: 'auto'` mở panel và tự bắt đầu micro
  sau khi bé hoàn thành tương tác; `optional` mở panel nhưng cho bé chọn nói hoặc tiếp tục. Khi
  không khai báo, teach step giữ hành vi `auto` cũ còn các step khác không mở luyện nói. Pilot
  `plant-a-seed` cho đủ 21/21 vocabulary một cơ hội phát âm và dùng `auto` cho toàn bộ encounter,
  để micro tự bật sau lời yêu cầu “Bé nói theo cô nhé.”; mỗi vocabulary vẫn chỉ có một encounter
  để tránh micro bật lặp lại khi bé chạm lại object. Riêng `seed` được giới thiệu bằng một teach
  step khi hạt rời vẫn hiện rõ: bé nghe nghĩa “hạt giống”, chạm đúng hạt, nghe mẫu và nói `seed`,
  rồi mới kéo hạt giống vào lỗ ở step hành động tiếp theo. Pilot cũng dạy `soil` trước cụm
  `fill the pot with soil`; gọi rõ `drainage hole` là “lỗ thoát nước”; gọi rõ quan hệ giữa bình
  tưới với bộ phận `spout` trong khi chỉ đầu vòi là target tương tác;
  giải thích chuyển đổi đất khô sang sẫm màu/hơi ướt trước khi dạy `damp`.
- Content architecture Theme 4 v2 phân biệt ba authoring roles mà không thêm field schema:
  `New Anchor` có `VocabularyItem`/`vocabId`, được dạy sâu, luyện nói một lần và vào review pool;
  `Quick Recall` gọi lại từ cũ bằng lựa chọn/hành động ngắn, không tạo learned-word ID hay mở
  speech practice; `Action Enabler` là object/công cụ giúp câu chuyện tiến lên và ưu tiên phản ứng
  state/SFX tức thì. Quick Recall phải vẫn giải được bằng lời Việt và hình nếu bé vào lesson theo
  free journey mà bỏ qua bài trước; từ ở mode cao hơn không trở thành core prerequisite. Bốn
  lesson được vocabulary-first revise đặt mục tiêu 8 core New Anchors trên ba scene, expanded thêm
  4 và challenge thêm 4; đây là authoring target chứ chưa phải validator hồi tố cho lesson cũ.
  Mọi deep-learn/pronunciation panel (kể cả `optional`) phải được ngăn bởi action/visual payoff.
  `promptText` không tự phát model word độc lập ở Vietnamese mode nếu step
  không có vocabulary semantics, nên Quick Recall hiện là cue khái niệm bằng lời Việt và hình,
  không phải bài kiểm tra nghe English ẩn. Pilot 21/21 auto encounters là ngoại lệ lịch sử, không
  phải mẫu mật độ cho lesson mới. Onboarding preselect `expanded`, nên Theme 4 phải xem expanded
  như một primary pre-reader path và QA riêng core/expanded; không coi expanded mặc định là nội
  dung chỉ dành cho trẻ lớn.
- Tap/find/drag được đánh giá bằng target IDs/drop zones; feedback/effects chạy sau kết quả. Hiệu
  ứng success mặc định chỉ áp dụng lên đúng object bé vừa chọn, không áp dụng lên toàn bộ
  `targetObjectIds` vì danh sách đó có thể gồm cả đáp án nhiễu; lesson chỉ làm nhiều object chuyển
  động khi khai báo animation effect tường minh.
- Khi step đúng có `successStateChanges`, ScenePlayer áp dụng tuần tự object variant/show/hide ngay
  sau khi controller xác nhận success. `afterSuccessStateChanges` dành cho cleanup sau khi lời
  xác nhận đúng đã phát xong, ngay trước khi vào bước kế; nhờ vậy đáp án đúng còn đủ lâu để nhận
  bounce/sparkle, distractor mờ đi, rồi cả cặp mới biến mất. Incorrect/ignored interaction không
  đổi state. Object ẩn không render và không nhận hit test; variant mới có thể đổi asset cùng
  optional geometry. Nếu required success feedback lỗi và runtime phải giữ nguyên step, state
  transaction tức thời được rollback và deferred cleanup không chạy để target không biến mất hoặc
  làm bài bị kẹt.
- Scene object state chỉ sống trong lượt chạy scene hiện tại và reset khi replay hoặc chuyển scene.
  State này không persist qua scene/app session và current-step pointer hiện tại không khôi phục
  chính xác state trung gian.
- `Góc chơi từ vựng` không chạy lại Scene State hoặc interaction đúng/sai. Visual của mỗi từ ưu
  tiên object có `vocabId`, sau đó representative target của vocabulary step. Resolver mô phỏng
  tuần tự các `successStateChanges` và `afterSuccessStateChanges` trước từng step để chọn asset,
  position và variant đúng với lúc từ bắt đầu được dạy; cùng resolver này cung cấp visual cho các
  review games. Từ không có visual renderable và từ dùng trùng object variant/asset với một lựa chọn
  mạnh hơn sẽ không xuất hiện trong playground. Tâm authored của đúng variant là anchor cho
  placement mặc định; collision fallback chỉ thay đổi vị trí sandbox, không sửa lesson data.
- Step `intro`/`teach` highlight `targetObjectIds` ngay để bé nối instruction/từ mới với hình;
  highlight hướng dẫn ban đầu này không làm mờ các object khác. Step `practice`/`review` giữ đáp
  án trung tính lúc bắt đầu để bé có cơ hội tự nhớ; drag vẫn luôn hiển thị drop zone và affordance
  kéo hiện có. Trong step tương tác, target được nâng lên trên các sibling object về z-order để
  không bị hitbox của hình chồng lấp chặn thao tác; ưu tiên lớp này không tự bật glow/dimming.
- Với step tương tác `tap`/`find`/`drag`, Auto-Hint bắt đầu đếm 7 giây sau khi instruction hoặc
  feedback audio đã phát xong. Nếu bé chưa tương tác, runtime bật pulse glow cho
  `interaction.correctObjectIds` hoặc `targetObjectId`; `targetObjectIds` vẫn có thể mô tả toàn bộ
  lựa chọn nhưng distractor không bị viền như đáp án. Runtime làm mờ nhẹ các learning object không
  liên quan. Chạm object, bắt đầu/thả
  kéo, Continue hoặc nghe lại instruction/từ mẫu đều xóa hint và khởi động lại khoảng chờ; khi
  nghe lại instruction của step tương tác, hiệu ứng nhắc chỉ áp dụng cho
  `correctObjectIds` hoặc `targetObjectId`, không làm chuyển động cả đáp án nhiễu; timer
  được cleanup khi đổi step/scene hoặc unmount. Listen step không dùng Auto-Hint.
- Với mọi step tương tác, instruction hành động được giữ trên instruction card; nếu step có
  vocabulary thì từ tiếng Anh nằm ngay dưới instruction. Bé không phải nhớ câu vừa nghe để biết
  cần chạm, tìm hay kéo gì.
- Asset vật thể và lựa chọn hành động trong scene là cutout nền trong suốt, không chứa caption,
  nhãn hoặc chữ vẽ chết trong raster; instruction card/vocabulary UI chịu trách nhiệm hiển thị
  toàn bộ text để tránh lặp chữ và giữ khả năng localize.
- Success, fail và info feedback đều hiển thị text trong instruction card. Fail feedback giữ
  tương tác object để bé thử lại và tự ẩn ngay khi audio phản hồi phát xong; info feedback khi
  nghe lại instruction/từ vựng tự ẩn sau một khoảng ngắn.
- Khi target highlight được bật, object dùng viền silhouette trắng + teal thay vì viền theo
  bounding box. Với step chỉ có một target không ở trạng thái kéo, object có cạnh hiển thị ngắn
  hơn `48dp` được phóng nhẹ tới tối đa `1.22x`; vị trí, touch area và collision vẫn giữ theo
  geometry gốc. Target lớn, step nhiều target và object đang kéo chỉ dùng viền highlight, không
  dùng zoom này.
- Trước khi vào bài, ScenePlayer chỉ chặn trên gói tài nguyên cần để bắt đầu an toàn: toàn bộ ảnh
  scene cần render/effect, gồm base/hidden/variant object assets, và audio của entry step đúng với
  `teacherPromptMode` cùng `englishAccent` đang chọn. Foreground image/audio preparation tự retry
  một lần khi gặp lỗi tạm thời; các foreground audio trùng key dùng chung in-flight preparation.
- Audio còn lại của current scene và next scene được warm best-effort ở nền theo batch nhỏ để
  không tạo một đợt request lớn chặn lần mở bài đầu tiên. Khi step thực sự cần audio, foreground
  prepare vẫn xác nhận file đã có trong cache trước khi phát.
- Cache hit có thể giúp scene chạy khi mất mạng, nhưng `Image.prefetch` dùng cache do React Native/
  hệ điều hành quản lý nên không được xem là một offline lesson pack bền vững hay được bảo đảm.
- Nếu một tài nguyên bắt buộc vẫn chưa sẵn sàng sau retry, lesson dừng ở màn lỗi có `Thử lại` và
  `Thoát bài`; step/feedback không tự chuyển tiếp trong im lặng. Prefetch nền cho next scene và
  các tài nguyên không bắt buộc vẫn là best-effort và không chặn current scene.
- Success/fail feedback audio của current step được warm trong lúc instruction đang phát. Với
  listen step, nút Continue chỉ xuất hiện sau khi success feedback đã prepare xong. Khi trả lời
  đúng, UI hiển thị feedback text và trạng thái chuẩn bị/phát ngay. Step chỉ chuyển tiếp sau khi
  native playback xác nhận phát xong; native playback failure hoặc hard timeout đều dừng narration
  và hiện lựa chọn thử lại/thoát bài, không tự chuyển step khi feedback bị thiếu hoặc vẫn đang phát.
- Scene progress dùng composite ID `<lessonId>:<sceneId>` và còn đọc legacy bare scene IDs.
- Current step ID được persist, nhưng resume flow hiện chỉ sử dụng lesson/scene; **Partial:** chưa
  resume trực tiếp đúng step trong scene.

### Speech practice

- **Implemented:** mọi teach step có vocabulary đều cho bé luyện phát âm bằng
  `SpeakPracticeControls`. Teach step dùng `listen` đi thẳng vào luyện nói; teach step dùng
  `tap`/`find`/`drag` hoàn tất hành động và success feedback trước, sau đó mới mở luyện nói rồi
  cho bé chủ động tiếp tục. Vì vậy speech practice không chiếm cú chạm scene và cũng không tạo
  bước cụt khi recorder không nghe thấy giọng hoặc không khả dụng.
- **Implemented:** phát từ mẫu, request record permission, ghi âm, native on-device voice activity
  detection/endpointing, auto-stop và hỗ trợ phát lại local recording theo yêu cầu. Native chỉ
  đưa snapshot mức cao (`waitingForSpeech`, `candidateSpeech`, `speaking`, `trailingSilence`,
  `ended`) qua React Native bridge; PCM không được truyền qua bridge. Sau khi prompt và từ mẫu
  phát xong, lượt tự ghi chuyển thẳng sang khởi động recorder, không tạo thêm narration session.
- Sau khi từ tiếng Anh mục tiêu đã phát xong, nút mic vẫn nhận thao tác trong phần hướng dẫn
  **Bé nói theo cô** hoặc auto prompt/từ mẫu của speech practice. Bé chạm sớm sẽ thấy trạng thái
  chuẩn bị ngay, request auto cũ bị vô hiệu hóa, narration được dừng và recorder chỉ bắt đầu sau
  handoff yên lặng 200 ms; chạm lặp trong lúc handoff bị bỏ qua. Trước mốc nghe từ mục tiêu, mic
  vẫn khóa; nếu bé không chạm, luồng prompt/từ mẫu rồi auto-record tiếp tục như trước.
- Parent setting `voiceRecordingLibrary` mặc định tắt và là local-only. Settings chỉ hiển thị một
  hàng toggle gọn cùng icon thông tin; lần bật đầu tiên cần xác nhận disclosure, các lần bật lại sau
  khi consent hiện hành đã được lưu thì áp dụng trực tiếp. Tắt toggle chỉ ngừng lưu bản mới và luôn
  giữ thư viện hiện có; xem/nghe/xóa, bao gồm xóa tất cả, chỉ nằm trong Parent voice library. Khi
  bật, một lượt kết thúc có URI và VAD đã phát hiện speech được tự động promote từ cache sang
  app-private durable storage; lượt không có speech, lỗi hoặc bị gián đoạn không được lưu. Kid Mode
  không thêm nhãn hoặc thao tác lưu riêng ngoài indicator ghi âm/phát lại đang có.
- Một encounter được xác định theo phiên mở lesson + scene/step. Thu lại trong cùng encounter tái
  sử dụng sample ID và thay bản trước, nên thư viện giữ bản đọc hợp lệ cuối của lần luyện đó. Khi
  bé gặp lại cùng `lessonId + vocabId` ở encounter khác, store giữ tối đa mốc đầu và mốc gần nhất;
  một từ chỉ có một mốc vẫn là dữ liệu hợp lệ, không bắt buộc phải có mẫu so sánh thứ hai.
- Metadata dùng key `@skidsenglish/voice-recordings/v1`, operation queue và backward-compatible
  normalizer. Store giữ tối đa 100 samples; khi vượt giới hạn, toàn bộ word entry ít được cập nhật
  gần đây nhất bị prune để không tách rời first/latest. Không có expiry theo ngày.
- Parent library sắp theo word thay vì file thô, hỗ trợ nghe và xóa từng sample, toàn bộ word,
  lesson, theme hoặc toàn bộ thư viện. Xóa tất cả gọi native bulk cleanup kể cả khi metadata trống
  để dọn durable orphan/staging file còn lại sau process crash.
- Durable audio nằm trong Android `noBackupFilesDir/voice-recordings` hoặc iOS Application Support
  `voice-recordings`; iOS đặt complete file protection và cả directory/file đều excluded from
  backup. File/URI/metadata và parent opt-in không được đưa vào Firestore/cloud sync.
- Endpointing yêu cầu speech kéo dài qua nhiều frame trước khi xác nhận, chịu được khoảng nghỉ ngắn
  trong lúc bé đọc và dừng sau khoảng im lặng cuối câu. Lượt chưa có speech và lượt kéo dài quá mức
  có timeout riêng; manual stop và một JS safety timeout vẫn luôn khả dụng.
- Khi hệ điều hành có recognizer on-device cho locale English đã chọn, native có thể dùng từ/cụm
  từ mục tiêu làm tín hiệu **dừng sớm dương tính** sau khi VAD đã xác nhận speech và đã giữ thêm
  một khoảng post-roll ngắn. Hypothesis không khớp hoặc recognizer không khả dụng không làm bé bị
  giữ chờ, không tạo feedback sai và không thay thế các ngưỡng im lặng/timeout hiện có.
- Khi enhanced native voice activity contract không có, runtime dùng detector audio-level thuần
  TypeScript có calibration noise floor, hysteresis và multi-sample confirmation; nếu metering
  cũng không có thì safety timeout vẫn kết thúc lượt ghi.
- Permission flow phân biệt `granted`, từ chối có thể hỏi lại (`denied`), từ chối buộc mở Settings
  (`blocked`) và recorder không khả dụng. Sau một lần từ chối, các teach step sau trong cùng phiên
  không tự mở lại system permission prompt; bé vẫn có thể tiếp tục bài hoặc chủ động bấm bật mic.
- UI giữ nguyên từng trạng thái quyền để hướng dẫn đúng ngữ cảnh: `denied` cho phép bấm **Bật mic**,
  `blocked` hướng dẫn **Nhờ ba mẹ** mở Settings, còn `unavailable` vô hiệu hóa nút mic. Cả ba trạng
  thái đều giữ nút **Tiếp tục** khả dụng và hiển thị badge `!` trên icon mic với tone cảnh báo phù
  hợp; badge chỉ mang tính trang trí, accessibility dùng nhãn hành động đầy đủ.
- Trên iOS, quyền Speech Recognition được xin riêng theo kiểu best-effort để bật target hint; từ
  chối quyền này chỉ tắt target hint và không làm mất khả năng ghi âm khi quyền microphone đã có.
  Purpose strings cho Microphone và Speech Recognition được localize theo ngôn ngữ hệ thống bằng
  `en.lproj/InfoPlist.strings` và `vi.lproj/InfoPlist.strings`; English trong `Info.plist` là fallback.
- Chỉ trạng thái `blocked` mới dẫn phụ huynh tới Settings. Khi app active trở lại sau Settings,
  `SpeakPracticeControls` kiểm tra lại quyền và mở lại nút ghi âm nếu quyền đã được cấp, nhưng không
  tự bắt đầu ghi âm ngoài ý muốn.
- Speech practice không phải một `SceneInteractionType` riêng.
- Target-word endpoint hint chỉ là quyết định nội bộ có độ tin cậy bảo thủ, không phải kết luận bé
  phát âm đúng. App không đưa transcript/hypothesis qua React Native bridge, không hiển thị từ đã
  nhận diện và không dùng non-match để đánh giá bé.
- **Unsupported:** general speech-to-text/transcription và pronunciation correctness/scoring.
  Feedback sau recording chỉ khuyến khích, không xác nhận phát âm đúng; nếu lượt ghi âm không phát
  hiện speech-level, app vẫn cho dừng và dùng lời nhắc tích cực để bé thử đọc ở từ sau thay vì khen
  là đã đọc tốt.
- Voice activity detection chỉ phân biệt speech/non-speech, không xác minh người nói là bé. Giọng
  người khác hoặc tiếng nói từ TV vẫn có thể được coi là speech; nếu nguồn đó nói đúng target thì
  target hint cũng có thể dừng lượt. App không lưu voiceprint.

### Review games

- `ReviewGame.type` khai báo `matching | memory | listenAndChoose | random` để mở rộng data model.
- **Implemented:** runtime registry hỗ trợ `memory`, `listenAndChoose`, `matching` và chế độ xoay tua ngẫu nhiên `random`.
- Màn hình game ôn tập (`ReviewGameScreen`) cung cấp thanh Tab Selector (🃏 **Lật thẻ**, 🎈 **Nghe & Chọn**, 🔗 **Nối hình**) cho phép bé/phụ huynh tự do chuyển đổi game trực tiếp khi đang ôn tập.
- `ReviewGameScreen` tự kiểm tra progress trước khi mount game/audio: trong `guided`, mọi scene
  của lesson phải hoàn tất, nếu chưa thì quay về lesson pack; trong `free`, review vẫn có thể mở
  không phụ thuộc scene progress.
- Header gồm nút đóng, tên bài và game selector giữ nguyên visual cũ nhưng được ghim khi phần nội
  dung game cuộn. `learningMode` được truyền xuyên suốt từ route/settings qua `GamePlayer` xuống
  cả ba game mà không thêm một hàng difficulty badge vào kid UI.
- Khi vào game hoặc đổi tab game, màn hình phát lời hướng dẫn theo game và `teacherPromptMode`; các game khóa thao tác trong lúc intro đang phát. Listen & Choose chỉ tự phát từ đầu tiên sau khi intro kết thúc.
- Ba game dùng shared Sungy coach để đổi pose và lời nhắc theo trạng thái intro, correct và wrong; shared star progress cho bé thấy số mục đã hoàn thành trong lượt ôn tập.
- Correct/wrong feedback luôn có visual state rõ ràng bằng màu, icon và nội dung khích lệ, kết hợp SFX; animation game-specific chỉ là lớp tăng cường, không phải tín hiệu duy nhất.
- Review-game animation tôn trọng system Reduce Motion: các hiệu ứng động trang trí được bỏ qua hoặc snap về trạng thái cuối, trong khi màu, icon, progress, audio và interaction feedback vẫn giữ nguyên.
- Memory game tạo hai thẻ hình giống nhau cho mỗi vocabulary item và hoàn tất khi ghép hết cặp.
  Cả Dễ/Vừa/Khó đều đọc English word khi lật để củng cố liên kết nghe-hình; độ khó tiếp tục tăng
  bằng số lượng từ và thời gian giữ cặp sai thay vì bỏ phát âm.
  Cặp sai giữ mở lâu nhất ở Dễ, ngắn dần ở Vừa và Khó. Phone portrait luôn dùng ba thẻ gần vuông
  mỗi hàng và căn giữa hàng cuối; tablet/landscape dùng nhiều cột hơn theo responsive layout.
- Listen & Choose game phát âm từ tiếng Anh và hiển thị các quả bóng bay hình minh họa. Dễ có
  2 lựa chọn, Vừa có 3 lựa chọn, Khó có 4 lựa chọn.
- Matching game hiển thị cột hình và cột từ. Cả Dễ/Vừa/Khó đều đọc từ khi chọn thẻ hình hoặc chữ;
  thời gian phản hồi sai ngắn dần theo mức.
- `reviewGame.config.vocabularyIds` là danh sách từ neo có thứ tự, không còn khóa toàn bộ review
  vào đúng bốn từ. Runtime giữ các từ neo hợp lệ rồi bổ sung từ có hình ở level phù hợp: Dễ chỉ
  `easy`; Vừa thêm ít nhất một `medium`; Khó thêm ít nhất một `medium` và một `hard` khi content
  có sẵn. Với phrase/verb khó, runtime có thể dùng object đại diện từ `SceneStep.targetObjectIds`
  và loại visual trùng để đáp án hình không mơ hồ.
- Số mục mặc định theo mode: 4 (`core`), 5 (`expanded`), 6 (`challenge`), trừ khi lesson config
  override trong giới hạn runtime.

### Rewards và progress

`LocalProgress` lưu:

- active theme;
- completed lesson, scene và review-game IDs;
- learned words và per-word mastery counters;
- earned sticker IDs;
- earned sticker records `{ stickerId, lessonId?, earnedAt?, source }` để hiển thị timeline;
- earned achievement records `{ achievementId, stickerId, earnedAt? }` cho sticker thành tựu;
- Sticker Playground gồm active background và ba board độc lập; mỗi placement lưu immutable
  instance ID, sticker ID, tọa độ normalized `x/y`, scale, rotation và z-index;
- total XP;
- optional current lesson/scene/step pointer.

Các completion/event-write flow chính catch lỗi theo hướng best-effort để lesson/reward navigation
không bị kẹt. Các primitive như đọc, save/reset toàn bộ progress hoặc lưu active theme vẫn có thể
throw; caller không được giả định mọi progress operation đều nuốt lỗi. Activity ghi words/scenes
và ước lượng 3 phút cho mỗi scene event. Daily activity `scenesCompleted` dùng cho Parent stats
như số lượt trạm trong ngày, không phải unique completed scene count.
Mọi thao tác đọc/ghi `LocalProgress` đi qua một hàng đợi tuần tự trong `ProgressManager`; các
mutation theo field thực hiện trọn vẹn chuỗi đọc–biến đổi–ghi trên snapshot mới nhất. Cloud merge
cũng chạy bằng atomic updater trong cùng hàng đợi để không ghi đè local mutation vừa hoàn tất.
Những completion flow biết `learningMode` hiện tại chỉ auto-add learned words khả dụng trong mode
đó, tránh ghi nhận trước vocabulary của mode cao hơn.

- Sticker là phần thưởng theo lesson, không phải phần thưởng theo level. `src/data/rewards.ts`
  khai báo catalog một sticker cho mỗi lesson pack hiện có, gồm tên hiển thị Việt/Anh,
  `iconName` và `tone` để render sticker art riêng bằng bundled SKids icons. Mọi UI kid-facing
  resolve tên theo `appLanguage`; sticker siêu thị dùng icon mặt tiền không chứa chữ trong ảnh.
- `src/data/achievementRewards.ts` khai báo 18 sticker thành tựu Sungy ngoài lesson, chia nhóm
  `firstSteps`, `habits`, `bigGoals`. Unlock condition hiện derive từ progress/activity counters:
  learned words, completed scenes, completed reviews, completed lessons, current streak và longest
  streak. Mỗi achievement có `stickerAssetName` trỏ tới PNG sticker riêng trong
  `src/assets/stickers/achievements/`; renderer ưu tiên hiển thị asset này để mỗi thành tựu có art
  độc lập gắn với Sungy. Metadata `art` vẫn giữ như fallback/direction cho motif, Sungy pose, icon
  nhấn, icon phụ và nhãn mốc.
- `saveSceneProgress`: scene mới +3 XP, replay +1 XP. Với lesson có review game, flow này không
  trao sticker trước review. Với lesson không có review game, scene cuối cùng có thể đánh dấu lesson
  complete, nhưng sticker vẫn được trao ở `completeLessonProgress` để reward UI nhận được
  `unlockedSticker`.
- Huy hiệu hạt dẻ trên `KidModeHeader` biểu diễn cấp độ từ total XP. Khi bé chạm, huy hiệu phát
  tap SFX, nảy nhẹ nếu Reduce Motion đang tắt và hiện tạm thời số hạt dẻ còn thiếu để lên cấp kế
  tiếp; thao tác này không cộng XP hoặc trao phần thưởng.
- `completeLessonProgress`: review mới +2 XP, replay +1 XP; đánh dấu lesson/review complete,
  thêm learned words và trao sticker của lesson nếu sticker đó chưa có. Replay không duplicate
  sticker nhưng có thể repair progress cũ đã complete lesson mà thiếu sticker.
- `RewardScreen` hiển thị sticker mới khi `unlockedSticker` được trả về, có CTA mở
  `StickerCollection` và nút ngữ cảnh `Trang trí ngay` mở Sticker Playground; nút trang trí không
  xuất hiện khi replay không trao sticker mới. `StickerCollectionScreen` có animation mở album
  Sungy, CTA mang sticker sang Playground khi đã mở ít nhất một sticker, grid sticker đã
  mở/đang khóa dựa trên `earnedStickerIds`, optional `highlightedStickerId`, sticker art dạng
  huy hiệu Sungy + icon lesson, timeline ngày nhận dựa trên `earnedStickerRecords`, và achievement
  stickers ngoài lesson được render theo các nhóm dễ đến khó. Card sticker chỉ hiển thị hình, tên
  ngắn và trạng thái; khi bé bấm card, app phát SFX phản hồi và mở modal chi tiết gồm ý nghĩa,
  cách mở, tiến độ và ngày nhận. Khi collection phát hiện achievement đã đạt nhưng chưa có record,
  app ghi `earnedAchievementRecords` best-effort để lưu ngày nhận.
  Legacy progress chỉ có `earnedStickerIds` được normalize thành record `source: 'legacy'` không có
  `earnedAt`.
- `StickerPlaygroundScreen` dùng chung sticker renderer với collection và đưa cả sticker lesson lẫn
  achievement đã mở vào khay. Ba background tái sử dụng các WebP tối ưu của bedroom, park entrance
  và sand play. Mỗi nền giữ tối đa 80 placement và tối đa một instance cho mỗi sticker ID.
  Tọa độ normalized giúp layout giữ ổn định theo kích thước canvas. UI ghi best-effort sau khi kết
  thúc thao tác, đổi nền, app rời foreground hoặc hết debounce; không ghi AsyncStorage theo từng
  frame gesture.

### Daily reminders

- **Implemented:** Notifee request permission và tạo một timestamp trigger lặp mỗi ngày.
- Notification ID/channel ID: `daily-reminder`.
- Khi bật reminder hoặc đổi giờ, Parent UI schedule/reschedule; khi tắt thì cancel. Switch phản hồi
  ngay theo thao tác của phụ huynh trong lúc native request đang chạy để tránh nhấp nháy, nhưng chỉ
  persist `reminderEnabled: true` sau khi permission được cấp và trigger được tạo thành công;
  permission bị từ chối rollback switch về tắt và hiển thị CTA mở system settings.
- Khi Parent screen focus hoặc app trở lại foreground, UI đối chiếu saved preference với
  notification permission và trigger `daily-reminder` thực tế để không báo đang nhắc khi lịch native
  không hoạt động.
- Row "Giờ nhắc" vẫn chỉnh được khi reminder đang tắt để phụ huynh chọn giờ trước; subtitle phân
  biệt giờ dự kiến khi tắt và lịch nhắc hằng ngày đang hoạt động khi bật. Trên iOS, row này mở
  modal Sungy chứa spinner và hai CTA; trên Android, app chỉ mở một native clock dialog 24 giờ,
  không lồng thêm modal phía dưới. App chỉ persist/reschedule sau `Xác nhận`/native confirm; `Hủy`,
  chạm ra ngoài hoặc đóng dialog giữ nguyên giờ cũ.
- Service cancel notification cũ trước khi tạo schedule mới.
- **Partial verification:** chưa có native E2E tests trong repo chứng minh behavior trên cả hai OS;
  thay đổi reminder cần kiểm tra trên platform hoặc báo rõ chưa chạy.

### Theme

- `AppThemeProvider` đọc/persist preference `light | dark | system`.
- `system` resolve bằng React Native `Appearance` thành light hoặc dark.
- `colors.ts` cung cấp token proxy, `createThemedStyles` và `useThemeSync` để styles cập nhật theo
  active scheme.
- Viền trang trí, nhãn phủ trên hình và các nền pastel dùng semantic theme tokens; dark mode không
  giữ viền trắng hoặc nền sáng cố định, ngoại trừ chữ/icon và silhouette cần màu trắng có chủ ý.

## 7. Local persistence, parent auth và cloud learning data

App luôn dùng tám AsyncStorage stores làm persistence local. Firestore chỉ giữ optional cloud copy
của learning progress và selected parent settings sau parent opt-in:

### Parent settings

- Key: `@skidsenglish/parent-settings/v1`.
- Manager: `src/engine/ParentSettingsManager.ts`.
- Fields chính: onboarding flag, journey/learning mode, optional editor flag, visible lessons,
  disabled themes, app language, teacher prompt mode, English accent, app theme, reminder
  state/time, child profile, background music opt-in, crash reporting opt-in,
  `voiceRecordingLibrary` local consent preference và `cloudProgressSync` consent preference.
- Normalization cung cấp defaults và chịu được field thiếu từ dữ liệu cũ.
- `englishAccent` nhận `en-US` hoặc `en-GB`; giá trị thiếu/không hợp lệ normalize về `en-US` để
  giữ hành vi legacy.
- `cloudProgressSync` mặc định `enabled: false`; chỉ normalize thành enabled khi có owner UID,
  consent version hiện tại và consent timestamp hợp lệ.
- `voiceRecordingLibrary` mặc định `enabled: false`; trạng thái true chỉ được giữ khi có consent
  version hiện tại và consent timestamp hợp lệ, nên dữ liệu legacy/malformed không tự bật ghi âm.
- Khi cloud sync bật, các field synced từ Parent settings là onboarding flag, journey/learning
  mode, visible lessons, disabled themes, app language, teacher prompt mode, English accent, app
  theme, reminder enabled/time và child profile. `cloudProgressSync` consent, `backgroundMusicEnabled`,
  `crashReportingEnabled`, `enableSceneEditor` và `voiceRecordingLibrary` là local-only.
- Reminder sync chỉ đồng bộ lựa chọn mong muốn; permission và native notification schedule vẫn là
  trạng thái riêng trên từng thiết bị.

### Learning progress

- Key: `@skidsenglish/progress/v1`.
- Manager: `src/engine/ProgressManager.ts`.
- Lưu completion, review, vocabulary mastery, XP, sticker IDs, sticker records, achievement
  records, active theme, resume pointer và trạng thái Sticker Playground.
- Normalizer duy trì arrays/records/default theme khi persisted data thiếu hoặc cũ; legacy
  `earnedStickerIds` được backfill thành `earnedStickerRecords` để collection vẫn hiển thị. Trạng
  thái Playground thiếu/malformed normalize thành ba board rỗng; transform numbers được clamp,
  rotation được chuẩn hóa, duplicate instance IDs bị bỏ và dữ liệu cũ có nhiều bản cùng sticker
  giữ lại placement nằm trên cùng theo z-index.
- Read, reset, full-snapshot save và các atomic field updater dùng chung một operation queue. Queue
  tiếp tục nhận operation mới sau lỗi đọc/ghi; primitive gây lỗi vẫn reject còn các flow
  best-effort giữ contract nuốt lỗi hiện có.
- `ProgressManager` phát change source `local | cloud`; cloud-applied merge không bị enqueue lại như
  một local mutation và giữ nguyên source `updatedAt` thay vì tạo client timestamp mới.
- Bố cục Playground là local-only: cloud serialization/fingerprint không chứa field này để gesture
  autosave không tạo Firestore writes. Cloud merge vẫn chọn state/board local mới nhất theo
  timestamp để một remote learning snapshot không xóa trang trí trên thiết bị.
- Playground không hiện nhãn khi autosave đã hoàn tất; trạng thái chỉ xuất hiện tạm thời khi đang
  lưu hoặc khi lần lưu gần nhất gặp lỗi để giữ thanh chọn hình nền gọn trên màn hình hẹp.

### Scene vocabulary playground layouts

- Key: `@skidsenglish/scene-vocabulary-layouts/v1`.
- Manager: `src/engine/SceneVocabularyLayoutStore.ts`.
- Mỗi layout được tách theo `lessonId + sceneId + learningMode` và giữ danh sách
  `itemId + normalized x/y + zIndex`; root store đồng thời giữ boolean `meaningEnabled` dùng chung
  cho mọi cảnh. Tọa độ chuẩn hóa giúp bố cục thích ứng với kích thước màn hình khác nhau. Runtime
  chỉ ghi best-effort sau khi bé thả đồ vật, không ghi theo từng frame kéo.
- Parser bỏ key/item malformed, clamp tọa độ và z-index, bỏ duplicate item ID, giới hạn 64 item mỗi
  layout và 256 layout mới nhất. Các thao tác đọc/ghi/xóa dùng chung operation queue để hai lần thả
  hoặc hai cảnh lưu sát nhau không ghi đè state của nhau.
- Store này local-only, không nằm trong Firestore payload/fingerprint. Nút `Đặt lại` xóa riêng
  layout hiện tại; thao tác xóa dữ liệu local của tài khoản phụ huynh xóa toàn bộ store.

### Cloud sync checkpoint

- Key: `@skidsenglish/cloud-progress-sync-state/v1`.
- Manager: `src/engine/CloudProgressSyncState.ts`.
- Lưu owner UID, semantic fingerprint progress, semantic fingerprint selected settings, thời điểm
  sync gần nhất đã được server xác nhận và metadata scheduler cho cloud sync: lần remote check gần
  nhất, lần write attempt gần nhất, failure count và thời điểm retry kế tiếp.
- Fingerprint canonicalize cloud payload nhưng bỏ `updatedAt`; một local save chỉ đổi timestamp
  không làm phát sinh cloud write.
- State thiếu owner được normalize về empty. State có owner nhưng chưa có fingerprint vẫn được giữ
  để cooldown/backoff hoạt động trước khi checkpoint đầu tiên được xác nhận.

### Daily activity

- Key: `@skidsenglish/daily-activity/v1`.
- Manager: `src/engine/DailyActivityTracker.ts`.
- Giữ tối đa 30 daily entries và tính current/longest streak.
- Minutes hiện là estimate, không phải measured session duration.
- Activity calls là best-effort; counters có thể phản ánh replay events thay vì chỉ unique scenes.

### Voice recording library

- Key: `@skidsenglish/voice-recordings/v1`.
- Manager: `src/engine/VoiceRecordingStore.ts`; file lifecycle đi qua native `SkidsAudio` methods
  `promoteVoiceRecording`, `deleteStoredVoiceRecording` và `clearStoredVoiceRecordings`.
- Mỗi sample lưu stable ID, durable local URI, theme/lesson/scene/step/vocabulary IDs, word, accent,
  duration, encounter ID và timestamp. Normalizer loại record malformed, chỉ giữ first/latest cho
  mỗi `lessonId + vocabId`, đưa URI bị thay/prune/discard vào pending cleanup và giới hạn toàn store
  ở 100 samples.
- File promotion, metadata update, replacement/pruning và cleanup được serialize. Metadata xóa
  trước để item biến mất khỏi UI; cleanup lỗi được giữ để retry. Bulk clear chạy ngay cả khi store
  không còn sample để xóa cả orphan/staging file do crash.
- `App.tsx` chạy reconciliation best-effort khi khởi động: store trống dùng native bulk clear để
  quét orphan/staging; store còn sample chỉ retry các pending URI, không xóa file đang được index.
- Store và setting không có serializer/upload path tới Firestore. Audio nằm trong app-private,
  no-backup storage; gỡ app có thể xóa toàn bộ thư viện và không có account restore.

### App-update prompt state

- Key: `@skidsenglish/app-update-prompt/v1`.
- Manager: `src/engine/AppUpdateManager.ts`.
- Chỉ lưu `latestVersion` đã hoãn và thời điểm hoãn để prompt khuyến nghị không xuất hiện lại trong
  3 ngày. Một `latestVersion` mới bỏ qua trạng thái hoãn cũ; update bắt buộc không bao giờ bị hoãn.
- Đây là metadata kỹ thuật local theo thiết bị, không sync cloud và không bị xóa khi phụ huynh đăng
  xuất hoặc xóa tài khoản.

### App-review prompt state

- Key: `@skidsenglish/app-review/v1`.
- Manager: `src/engine/AppReviewManager.ts`.
- Schema giữ `firstSeenAt` và danh sách attempt gần đây gồm app version/thời điểm. Parser bỏ entry
  malformed, giới hạn số attempt lưu và tạo state mới an toàn khi store thiếu/hỏng.
- Eligibility dùng app age, số ngày có daily activity, số lesson hoàn thành, per-version guard,
  cooldown 90 ngày và rolling cap 2 lần/365 ngày. Native API có thể no-op do quota/store history;
  state không có field `hasRated` và không suy diễn kết quả đánh giá.
- Đây là metadata kỹ thuật local theo install, không sync cloud, không chứa child profile/progress
  chi tiết và không bị xóa khi phụ huynh đăng xuất/xóa tài khoản. Gỡ app có thể xóa state này,
  nhưng App Store/Google Play vẫn tự quản lý rating history và quota của nền tảng.

Mọi schema/key change cần migration hoặc backward-compatible normalization và tests.

### Parent account auth

- Provider: Firebase Authentication qua `@react-native-firebase/app` và
  `@react-native-firebase/auth`.
- Supported sign-in providers: Google và Apple.
- UI entry: `ParentAccountCard` trong Parent Mode settings.
- JS boundary: `src/engine/ParentAuthManager.ts`.
- Config placeholder: `src/config/firebaseAuth.ts`; native files cần nằm ở
  `android/app/google-services.json` và iOS app target `GoogleService-Info.plist`.
- Android Gradle chỉ apply `com.google.gms.google-services` khi `google-services.json` tồn tại để
  local build không fail trước khi có Firebase config.
- iOS Podfile dùng CocoaPods static frameworks (`use_frameworks! :linkage => :static`) và bật
  `$RNFirebaseAsStaticFramework` theo cấu hình được React Native Firebase hỗ trợ.
- Trong khi React Native Firebase `25.1` chưa tích hợp đầy đủ upstream fix cho RN `0.86` prebuilt
  RNCore với static frameworks, Podfile đặt `RCT_USE_PREBUILT_RNCORE=0` để build RNCore từ source;
  `post_install` đồng thời cho phép non-modular React headers riêng trên các target `RNFB*`.
- Root `firebase.json` tắt các React Native Firebase auto-collection knobs cho analytics,
  performance, messaging, ad storage và Crashlytics; không thêm Firebase Analytics package.
- Apple account deletion flow gọi `revokeToken` trước `deleteUser` khi tài khoản có provider
  `apple.com`.
- Sign-out confirmation có hai nhánh: đăng xuất và giữ local learning data trên thiết bị, hoặc đăng
  xuất rồi xóa local settings, progress, daily activity, voice recordings, bố cục Góc chơi từ vựng
  và cloud-sync checkpoint. Nhánh giữ local là mặc định để tránh mất tiến độ ngoài ý muốn.
- Account deletion UI xóa `users/{uid}/progress/current` và `users/{uid}/settings/current` trước
  khi xóa Firebase Auth. Nếu cloud deletion thất bại, auth deletion dừng để tránh để lại document
  không còn owner đăng nhập. Sau khi xóa cloud data, RevenueCat customer và Firebase Auth thành
  công, app xóa các local stores `@skidsenglish/parent-settings/v1`, `@skidsenglish/progress/v1`,
  `@skidsenglish/daily-activity/v1`, `@skidsenglish/cloud-progress-sync-state/v1`, metadata/file
  của `@skidsenglish/voice-recordings/v1`, `@skidsenglish/scene-vocabulary-layouts/v1` và hủy
  daily reminder local.

### Crash reporting

- Provider/runtime: Firebase Crashlytics qua `@react-native-firebase/crashlytics` `25.x`; không
  thêm Google Analytics for Firebase package.
- Lifecycle boundary: `App.tsx` gọi `startCrashReporting()`, manager nằm tại
  `src/services/CrashReportingService.ts`.
- Parent setting local-only: `crashReportingEnabled` trong
  `@skidsenglish/parent-settings/v1`, mặc định `false` cho cả install mới và persisted settings
  legacy. Setting này không sync qua tài khoản/cloud.
- Parent UI entry: tab Settings, nhóm "Giọng đọc & dữ liệu", toggle "Gửi báo cáo lỗi". Khi Crashlytics
  đang tắt và native báo có unsent crash report, Settings hiển thị thêm CTA inline chỉ cho report
  đó: "Gửi báo cáo lỗi" hoặc "Không gửi". Mọi hành động đều đi qua parent gate vì nằm trong Parent
  Mode.
- `firebase.json` đặt `crashlytics_auto_collection_enabled=false` và
  `crashlytics_debug_enabled=false`; JS sync runtime theo parent opt-in bằng
  `setCrashlyticsCollectionEnabled`.
- Khi saved opt-in đang tắt, app tắt collection, clear Crashlytics user id và kiểm tra
  `checkForUnsentReports`; app không xóa report tự động để phụ huynh có thể quyết định khi vào
  Parent Mode. Nếu phụ huynh chọn gửi, app gọi `sendUnsentReports`, bật collection cho các lần sau
  và lưu `crashReportingEnabled=true`. Nếu phụ huynh chọn không gửi hoặc chủ động tắt toggle, app
  xóa unsent reports trên thiết bị và giữ collection off. Khi native đã enabled từ opt-in trước đó,
  app không kiểm tra/xóa pending reports vì Crashlytics tự gửi theo cấu hình đã consent.
- App không set Crashlytics `userId` thật và không log tên bé, ghi âm, nội dung học, câu trả lời,
  email, purchase id hoặc free-text của user. Custom keys chỉ giới hạn dữ liệu kỹ thuật coarse như
  app version, platform và reporting scope.
- iOS FirebaseCrashlytics pod có privacy manifest riêng cho crash/diagnostic data; checklist phát
  hành/App Store privacy labels vẫn phải disclose diagnostics đúng phạm vi opt-in, không tracking,
  không linked to user.
- Android build apply `com.google.firebase.crashlytics` chỉ khi `google-services.json` tồn tại cùng
  `com.google.gms.google-services`, để local build thiếu Firebase config không fail. iOS autolink
  qua CocoaPods/RNFirebase static frameworks.

### App update, Monetization lifecycle, Remote Config và App Check

- `src/services/RemoteConfigService.ts` sở hữu defaults, fetch/activate và realtime subscription
  dùng chung. `RemoteMonetizationConfig.ts` và `AppUpdateManager.ts` lần lượt chiếu các key liên
  quan thành snapshot riêng cho monetization và app-update UI.
- App-update dùng một JSON key `app_update_policy_v1`. Default local là
  `{ "schemaVersion": 1, "enabled": false }`; vì vậy build mới không tự chặn khi console chưa có
  policy. Policy bật phải có `minimumSupportedVersion`, `latestVersion` và `storeUrls.android` /
  `storeUrls.ios`. URL được giới hạn về Google Play/App Store.

```json
{
  "schemaVersion": 1,
  "enabled": true,
  "minimumSupportedVersion": "1.0",
  "latestVersion": "1.0.1",
  "storeUrls": {
    "android": "https://play.google.com/store/apps/details?id=com.seduforge.skidsenglish",
    "ios": "https://apps.apple.com/app/id6790650146"
  }
}
```

- Version contract chấp nhận hai hoặc ba numeric segment (`1.0`, `1.0.1`, `2.11`) và normalize
  segment patch thiếu thành `0` khi so sánh. App không so sánh chuỗi theo lexical order và không
  dùng Android `versionCode`/iOS `CFBundleVersion` cho policy này.
- `SkidsAppInfo` đọc Android `BuildConfig.VERSION_NAME` và iOS
  `CFBundleShortVersionString`; native version không còn được hardcode trong TypeScript. Config,
  native version hoặc fetch không hợp lệ đều fail open.
- `currentVersion < minimumSupportedVersion` tạo full-screen required gate;
  `minimumSupportedVersion <= currentVersion < latestVersion` tạo optional update card chỉ trong
  Parent Mode; version bằng hoặc mới hơn latest không hiện prompt. Required gate tự phát và cho
  phép phát lại clip gọi phụ huynh đã bundle sẵn, dùng biểu tượng phụ huynh làm hành động chính,
  rồi mới mở phép tính và store. Manager kiểm tra khi khởi động, khi app về foreground và nhận
  realtime update sau lần fetch thành công.
- Vận hành dùng cùng release version cho Android/iOS. Chỉ publish `enabled: true` hoặc nâng
  `minimumSupportedVersion` sau khi phiên bản đích và cả hai store URL đã được kiểm tra từ thiết bị;
  build đầu tiên chứa checker phải phát hành với default disabled trước khi dùng hard gate.

### Parent-only app review

- `src/engine/AppReviewManager.ts` sở hữu eligibility, local attempt metadata, native request và
  store-link resolution. `App.tsx` khởi tạo install-local tracking best-effort.
- `SkidsAppReview` gọi Google Play In-App Review `2.0.2` trên Android và StoreKit
  `AppStore.requestReview(in:)` trên iOS 16+, với `SKStoreReviewController` fallback cho iOS 15.
  Bridge chỉ resolve rằng request đã được chuyển cho platform; không trả rating, review text hoặc
  trạng thái submit.
- Automatic request chỉ được schedule từ Parent stats sau adult gate. Persistent review link chỉ
  nằm trong Parent settings; không có custom pre-prompt, sentiment filtering, phần thưởng, XP,
  sticker hay lời nhờ bé đánh giá.

- Lifecycle entry nằm trong `App.tsx`. `src/engine/MonetizationManager.ts` sở hữu RevenueCat
  identity, offering/packages, purchase/restore, `CustomerInfo` listener và normalized snapshot;
  `src/config/monetization.ts` sở hữu entitlement/offering/product IDs, Remote Config key names và
  public client configuration.
- Remote monetization projection nằm tại `src/services/RemoteMonetizationConfig.ts`. Client set defaults,
  fetch/activate lúc app khởi động, refresh khi mở Premium và lắng nghe realtime updates trong lúc
  màn Premium có focus. Các key/default hiện tại:
  - `premium_purchase_enabled = true`;
  - `founder_premium_cutoff_at = ""` (rỗng nghĩa là tắt/fail closed);
  - `founder_premium_duration_days = 365`.
- Founder access được tính local khi `CustomerInfo.firstSeen <= founder_premium_cutoff_at` và còn
  trước `firstSeen + duration`. Effective now là thời điểm muộn hơn giữa `Date.now()` trên thiết bị
  và `CustomerInfo.requestDate`; cutoff, `firstSeen`, `requestDate` hoặc duration không hợp lệ đều
  fail closed. Parent phải Firebase sign-in trước khi nội dung được mở. Verified paid RevenueCat
  entitlement luôn ưu tiên nhánh Founder.
- Founder access không phải RevenueCat entitlement, không cấp receipt và không đảm bảo quota đúng 500. `firstSeen` là lúc RevenueCat lần đầu thấy App User ID, không phải số download/install tuyệt
  đối. Remote Config cutoff phải được giữ ít nhất tới khi Founder access cuối cùng hết hạn; mô hình
  một cutoff cũng không phù hợp để tái dùng trực tiếp cho nhiều campaign độc lập.
- `max(Date.now(), CustomerInfo.requestDate)` chỉ neo thời gian vào response RevenueCat gần nhất;
  client-only policy không thể ngăn tuyệt đối việc giữ thiết bị offline rồi lùi đồng hồ sau response
  đó. Muốn expiry chống can thiệp chặt chẽ phải quay lại trusted backend/RevenueCat entitlement.
- `functions/` là Node.js 22 Firebase Functions v2 backend riêng nhưng chỉ còn
  `deleteRevenueCatCustomerData` tại `asia-southeast1`, dùng RevenueCat secret phía server để hỗ trợ
  account deletion. Bốn Founder function `claimFounderPremium`, `getFounderPremiumStatus`,
  `processFounderGrant` và `reconcileFounderGrants` cùng quota/ledger/outbox đã được loại khỏi kiến
  trúc mục tiêu.
- `src/engine/FirebaseAppCheckManager.ts` bật token auto-refresh và dùng debug provider trong dev,
  Play Integrity trên Android production, App Attest với DeviceCheck fallback trên Apple
  production. Đây là client initialization; enforcement cho Firebase products vẫn cần cấu hình
  trong Firebase Console/backend và không được suy diễn chỉ từ client code.
- Android manifest có billing permission và `MainActivity` dùng `launchMode="singleTop"`. iOS pods
  đã autolink RevenueCat, Remote Config, Functions và App Check; `AppDelegate.swift` pre-initialize
  `RNFBAppCheckModule` trước `FirebaseApp.configure()` để custom provider được đăng ký đúng thứ tự.
- Monetization/App Check không thêm AsyncStorage key. Parent access session nằm trong memory tại
  `src/engine/ParentAccessSession.ts`; RevenueCat `CustomerInfo` được refresh/lắng nghe thay vì
  cache thành quyền Premium do app tự quản lý.
- Account deletion refresh Firebase Auth token và App Check token trước khi chạy cloud data
  deletion -> callable xóa RevenueCat customer -> Firebase Auth deletion -> local RevenueCat
  cache/logout -> local account data wipe. Nếu token bảo mật chưa sẵn sàng hoặc backend cleanup
  chưa được xác nhận, Firebase Auth được giữ để phụ huynh retry. Founder access không có
  ledger/outbox/tombstone cần scrub.
- Các document Founder legacy từng được tạo trên project test không tự mất khi xóa Functions/code;
  phải kiểm kê và purge bằng admin migration có xác nhận trước production, không giao việc đó cho
  callable account deletion mới.

### Cloud learning data sync

- Dependency/runtime: `@react-native-firebase/firestore` `25.x`.
- Lifecycle boundary: `App.tsx` gọi `startCloudProgressSync()`; manager nằm tại
  `src/engine/CloudProgressSyncManager.ts`.
- Merge/serialization thuần nằm tại `src/engine/CloudProgressMerge.ts` cho progress và
  `src/engine/CloudParentSettingsMerge.ts` cho selected settings.
- Firestore paths: `users/{uid}/progress/current` cho progress và `users/{uid}/settings/current`
  cho selected parent settings. Consent version là `1`; schema version progress và settings hiện
  đều là `1`.
- Sync mặc định tắt. Đăng nhập không tự bật sync. Consent được bind với UID hiện tại, vì vậy đăng
  nhập tài khoản khác không kế thừa opt-in cũ. Parent UI cho phép xóa consent cũ khỏi thiết bị để
  tài khoản hiện tại opt-in lại; thao tác này không xóa cloud document của owner cũ.
- Progress payload gồm `LocalProgress`: completion/review IDs, learned words, vocabulary progress,
  XP, sticker/achievement records, active theme, resume pointer và client update timestamp.
- Settings payload gồm onboarding flag, journey/learning mode, visible lessons, app language,
  teacher prompt mode, English accent, app theme, child profile, reminder enabled state/time và
  client update timestamp. Không sync `cloudProgressSync` consent, `backgroundMusicEnabled`,
  `crashReportingEnabled`, `enableSceneEditor` hoặc `voiceRecordingLibrary`.
- Không sync daily activity/streak, voice recording URI/file, lesson asset files hoặc native
  notification permission/schedule state. Reminder preference từ cloud chỉ cập nhật saved setting;
  từng thiết bị vẫn cần parent bật/cấp quyền reminder để native schedule được tạo tại chỗ.
- Local progress tiếp tục là runtime source of truth. Khi nhận remote snapshot, ID arrays/records
  được union theo key; vocabulary counts/mastery và total XP lấy max; active theme/resume pointer
  lấy snapshot có `updatedAt` mới hơn. Merge được canonicalize để tránh ping-pong do array order.
- Selected settings dùng last-write-wins theo client `updatedAt` sau khi thiết bị đã có checkpoint.
  Nếu một thiết bị opt-in vào account đã có cloud settings nhưng chưa có checkpoint local, remote
  settings thắng để tránh onboarding/default local ghi đè cấu hình đã có. Local-only fields được
  giữ nguyên khi apply remote settings.
- Khi bắt đầu một sync session, manager chờ initial snapshot được server xác nhận trước khi upload;
  snapshot cache báo document chưa tồn tại không thể ghi đè dữ liệu đang có từ thiết bị khác.
- Firestore listener chỉ tồn tại khi app foreground. Initial snapshot và remote update được merge
  vào local; các local interaction trong phiên chỉ cập nhật AsyncStorage và pending snapshot, không
  write Firestore riêng lẻ.
- Khi `AppState` chuyển sang `background`, manager gọi tối đa một write cho pending snapshot rồi tháo
  listener. Đây là best-effort flush; nếu OS suspend trước khi hoàn tất, fingerprint persisted vẫn
  khác local và phiên foreground sau sẽ merge/retry.
- Mỗi lần app trở lại foreground thực hiện server reconciliation có throttle: listener được delay
  ngắn để tránh transient foreground, remote read được cooldown tối thiểu 5 phút khi đã có checkpoint
  server-confirmed gần đây, và các lỗi Firestore dùng exponential backoff từ 1 phút đến tối đa 15
  phút. App chỉ write lúc mở khi local từ phiên trước chưa có trong cloud và write cooldown/backoff
  cho phép.
- Background write có cooldown tối thiểu 90 giây theo parent UID. Nếu user ẩn/bật app liên tục,
  progress vẫn lưu local ngay nhưng cloud write được defer; phiên không đổi dữ liệu không tạo write.
- Local parent settings change được ghi lên settings document khi sync đang active và semantic
  fingerprint thay đổi; timestamp-only hoặc consent-only changes không tạo settings write.
- Contract max/union tránh duplicate reward và XP inflation nhưng không cộng hai XP delta độc lập
  phát sinh đồng thời trên hai thiết bị offline. Event-log/operation-based multi-device accounting
  vẫn unsupported.
- Opt-out có hai lựa chọn: dừng listener nhưng giữ cloud documents, hoặc dừng và xóa progress cùng
  settings documents. Local progress/settings luôn được giữ.
- `firestore.rules` chỉ cho authenticated owner get/create/update/delete document `current`, cấm
  list/cross-UID/unrelated paths, whitelist fields và giới hạn basic types/sizes cho cả progress và
  settings. Dynamic entries bên trong vocabulary map được client normalizer kiểm tra vì Firestore
  Rules không có generic iteration để validate mọi map value.
- `npm run test:firestore-rules` chạy Firebase Emulator với demo project và kiểm tra owner access,
  cross-user/anonymous denial, list denial, owner/schema constraints và unknown-field rejection.
- Root `firebase.json` vẫn tắt Analytics/Performance/Messaging/ad/Crashlytics auto-collection;
  Firebase Analytics package không được thêm.
- **Unsupported:** sync daily activity/recordings, Realtime Database và Analytics. App Check client
  initialization đã implemented, nhưng enforcement chưa được chứng minh/cấu hình trong repository.

## 8. Audio, recording và native modules

### Audio layers

1. Lesson vocabulary/prompt audio: generated en-US/en-GB English files và Vietnamese files,
   runtime R2-first.
2. Short feedback SFX (`tap`, `correct`, `wrong`, `yay`, ...): bundled trong native app.
3. Voice recording: local file URI từ native module; PCM/VAD/endpointing và target-word hint được
   xử lý on-device. Hypothesis chỉ tồn tại tạm trong native để quyết định endpoint, không được persist
   hoặc đưa qua bridge. Recording mặc định ở cache; khi parent opt-in và lượt có speech, runtime copy
   sang durable no-backup storage và ghi metadata local. Không có upload backend/path cho recording
   hoặc transcript.
4. Optional background music: bundled file `src/assets/ui/audio/music/sungy-background.mp3`,
   mặc định tắt và chỉ chạy sau parent opt-in local trên thiết bị. Android dùng mirror
   `android/app/src/main/res/raw/sungy_background.mp3` qua platform-specific
   `BackgroundMusicRegistry.android.ts` để native `MediaPlayer` phát local ổn định mà không bundle
   thêm bản Metro duplicate; iOS tiếp tục dùng static asset URI từ React Native.
5. Bundled Kid Mode/Sungy UI voice prompts nằm trong `src/assets/ui/audio/`, giữ WAV production làm
   source/provenance theo `audioManifest`, nhưng `npm run assets:optimize-ui-audio` tạo MP3 sidecar
   64 kbps và rewrite `GeneratedUiAudioRegistry.ts` để các key manifest WAV resolve tới MP3 nhỏ hơn
   khi build app. Các key Home/Onboarding tĩnh được generator đọc trực tiếp theo cùng key từ hai
   dictionary `vi.ts`/`en.ts`; không duy trì một bản copy audio-only riêng có thể lệch với UI.

`AudioManager` giữ playback primitive và effects theo hướng best-effort, còn `ScenePlayer` áp dụng
readiness gate cho audio bài học bắt buộc. Nếu audio bắt buộc chưa sẵn sàng, scene hiển thị lựa chọn
thử lại/thoát bài thay vì tiếp tục hoặc tự chuyển step trong im lặng. Teacher prompt mode English/
bilingual dùng resolved English teacher instructions, shared English cues và generated audio
manifest theo `englishAccent` khi có asset. Lookup ưu tiên accent được chọn, sau đó default en-US
và legacy `audio/en/`. Nếu mọi URI candidate đều không phát được, `SkidsAudio` dùng system TTS
best-effort với đúng locale đang chọn (`en-US`, `en-GB` hoặc `vi-VN`) trên cả Android và iOS.
Production vẫn không được dựa vào TTS fallback để che một corpus generated audio thiếu; readiness
gate của lesson audio bắt buộc vẫn giữ nguyên. Narration dùng session latest-wins: session mới dừng
cả URI playback/TTS của session cũ, và session đã bị hủy không được tiếp tục segment hoặc
accent/legacy fallback sau khi cache lookup hay native playback trả về.

Background music dùng native playback channel riêng, loop ở âm lượng thấp trong foreground app và
tự dừng khi app rời trạng thái active. Nhạc nền không phát trên các route học chủ động
`ScenePlayer` và `ReviewGame`; khi rời các màn này, nếu phụ huynh đã bật opt-in thì manager có thể
phát lại. `AudioManager` vẫn duck nhạc nền xuống mức nhỏ hơn khi có URI audio, teacher prompt hoặc
vocabulary fallback speech ở các màn khác, để lời hướng dẫn và từ vựng luôn rõ hơn nhạc.

### Native support matrix

| Capability                          | Android                       | iOS                           | Fallback/current behavior         |
| ----------------------------------- | ----------------------------- | ----------------------------- | --------------------------------- |
| `SkidsAudio` SFX/URI playback       | Implemented                   | Implemented                   | AudioManager best-effort          |
| `SkidsAudio` system TTS fallback    | Implemented                   | Implemented                   | Sau khi mọi audio URI thất bại    |
| `SkidsAudio` background music       | Implemented                   | Implemented                   | Tắt nếu native method unavailable |
| Voice recording/metering/permission | Implemented                   | Implemented                   | UI báo/không ghi nếu unavailable  |
| Durable voice promote/delete/clear  | Implemented                   | Implemented                   | Local-only; no backup/cloud       |
| Voice activity/endpoint auto-stop   | Implemented                   | Implemented                   | Audio-level detector + timeout    |
| On-device target-word endpoint hint | API 33+/model dependent       | Permission/model dependent    | VAD/silence/timeout               |
| `SkidsAssetCache` disk cache        | Implemented                   | Implemented                   | JS trả remote URL khi module vắng |
| `SkidsAppInfo` release version      | Implemented                   | Implemented                   | Update policy fail open           |
| `SkidsAppReview` system prompt      | Implemented                   | Implemented                   | Silent no-op khi store từ chối    |
| Lesson image prefetch               | React Native `Image.prefetch` | React Native `Image.prefetch` | Không dùng `SkidsAssetCache`      |

`SkidsAudio` contract được nối qua `NativeAudioAdapter.ts`, `VoiceRecorder.ts` và
`VoiceRecordingStore.ts`. Android
implementation nằm trong package `audio`; iOS implementation là `SkidsAudio.swift` với Objective-C
bridge `SkidsAudio.m`.

`SkidsAssetCache` có implementation Kotlin/Android và Swift/iOS. Current JS call sites dùng nó để
cache/prefetch remote lesson audio, không phải lesson images. Native prefetch chỉ báo ready khi
mọi asset hợp lệ trong batch đã có file cache khác rỗng; lỗi từng file trả trạng thái chưa sẵn sàng
để ScenePlayer chuyển sang màn thử lại/thoát bài thay vì tự động bỏ qua. Android tách foreground
executor cho audio sắp phát khỏi hàng đợi bulk prefetch và khóa theo cache key để không tải trùng
cùng file.

`SkidsAppInfo` chỉ expose release version cho app-update policy, Parent support UI và Crashlytics
technical attributes khi phụ huynh đã opt in; module không expose device identifier hoặc build
number.

`SkidsAppReview` chỉ expose thao tác request system review prompt. Google Play/App Store sở hữu
quota, UI và dữ liệu review; app không nhận nội dung/rating hoặc biết prompt có thực sự xuất hiện.

## 9. Asset delivery và authoring pipeline

### Runtime remote config

- `src/config/remoteAssets.ts` tạo URL từ public R2 root + release.
- Current release prefix là generated value `v1`; không hardcode revision hash vào spec.
- `preferRemoteImages` và `cacheRemoteAssets` hiện bật.
- Development builds có thể dùng gitignored `src/config/remoteAssetOverrides.local.ts`,
  được Metro resolve thay fallback mặc định, để preview asset local qua `npm run assets:serve-local`
  mà không upload R2. Override local cho phép QA nội dung khi lesson audio chưa publish, nhưng
  không bypass Premium entitlement hoặc content locks.
- `npm run generate:audio:local-preview -- --lesson=<lesson-id>` audit đủ en-US, en-GB và
  Vietnamese target của lesson rồi sinh hai overlay gitignored
  `src/data/audioManifest.local.ts` và `src/config/localAudioPreview.local.ts`. Metro chỉ resolve
  chúng trong development để lesson được chọn phát WAV từ local asset server; lệnh không gọi
  Google TTS, không sửa production manifest, không bundle WAV và không upload R2. Các lesson khác
  vẫn giữ hành vi QA audio chưa publish hiện tại.
- Production generator `generateMissingAudio.mjs` dùng `GOOGLE_CLOUD_PROJECT`, rồi
  `GCLOUD_PROJECT`, và mặc định quota/billing project là `project-264a7ff9-a6b6-41ab-90e`; token OAuth vẫn lấy
  từ account `gcloud` active trừ khi `GOOGLE_TTS_ACCOUNT` chọn account khác.
- Image URLs có manifest revision query để tránh stale device/CDN image cache.
- English audio cache identity chứa cả accent và immutable release segment
  `neural2-c-r1`; en-US và en-GB không dùng chung R2/device-cache key.

### Images

- Final lossless source of truth:
  `src/assets/source/master/lessons/<lesson>/<scene>/images/*.png` (Gitignored local build artifact).
- Raw/chroma inputs: `src/assets/source/lessons/` (Gitignored local build artifact).
- Generated WebP: `src/assets/lessons/<lesson>/<scene>/images/*.webp` (Gitignored local build artifact).
- Khi gitignored PNG master của một lesson bị mất nhưng production WebP immutable vẫn còn trên R2,
  `npm run assets:restore-masters-from-r2 -- --lesson=<lesson-id>` tải từng WebP qua CDN, xác minh
  byte count/SHA-256 theo asset manifest và phục hồi local WebP + PNG continuity master mà không
  đổi output hash/image revision. PNG phục hồi là bản giải mã từ WebP đã nén, không thay thế
  lossless authoring original và không được force-rebuild nếu chưa chủ động chấp nhận re-encode.
- Runtime `AssetRegistry` hiện có bundled registry trống và resolve lesson images sang R2 CDN.
- Catalog/audit/build/verify và missing-image check scan cả base object asset lẫn mọi
  `SceneObject.variants[].asset`; variant kế thừa role và dùng geometry override nếu có để chọn
  image profile.
- Current/next scene image prefetch dùng React Native `Image.prefetch` và bao gồm cả variant/hidden
  object assets để state transition không đợi tải ảnh giữa bước.
- App UI icons: PNG bundle nằm trong `src/assets/icons/app-ui/`, import qua
  `AppUiIcon`, tách khỏi lesson WebP generation và R2 upload.
- Bundled UI art như `src/assets/images/app-logo.png`, Sungy mascot poses/source poster,
  `src/assets/icons/premium/` và `src/assets/stickers/achievements/` được optimize local bằng
  `npm run assets:optimize-ui-art`; script ghi paletted PNG, giới hạn max edge theo nhóm asset và
  tạo backup gitignored dưới `src/assets/source/ui-art-original/` khi chưa có. Các asset này vẫn
  là local bundled UI art, không thuộc R2 pipeline.
- Kid-facing S-Kids icons, gồm theme, scene và lesson milestone icons, nằm trong
  `src/assets/icons/skids/`, import qua static registry và cũng nằm ngoài lesson WebP/R2 pipeline.
  Các icon này được optimize local bằng `npm run assets:optimize-ui-icons` để giữ bundled app size
  thấp; script resize về max edge 320 px, ghi paletted PNG và tạo backup gitignored dưới
  `src/assets/source/ui-icons/` khi chưa có. Khi backup đã tồn tại, script regenerate từ backup để
  tránh nén palette chồng nhiều lần.

Không hand-edit WebP, asset manifest hoặc `generatedAssetRelease.ts`. Dùng scripts được mô tả
trong `docs/asset-pipeline.md`.

### Generated lesson audio

- Production English vocabulary và teacher instruction/prompt/cue audio:
  `audio/{en-US,en-GB}/neural2-c-r1/*.wav`.
- Release profile cố định: `en-US-Neural2-C` và `en-GB-Neural2-C`, LINEAR16 PCM mono 24 kHz,
  speaking rate `0.9`, không trim silence cho English.
- `audio/en/*.wav` là legacy en-US compatibility/rollback corpus; giữ nguyên nhưng không ghi
  production release mới vào đây. Manifest chỉ thêm `legacy` fallback cho target đã có file legacy
  tương ứng.
- Vietnamese instruction/feedback và standalone vocabulary meanings: `audio/vi/*.mp3`.
- Standalone Vietnamese vocabulary meanings used by `Góc chơi từ vựng` are also generated from
  every registered `VocabularyItem.meaningVi`; equal normalized meanings are deduplicated across
  the catalog. Runtime therefore resolves the authored meaning through `audioManifest` before
  using system TTS as a best-effort fallback.
- Không có `audio/bilingual`; song ngữ là runtime sequence phát `vi` rồi `en`.
- `generateMissingAudio.mjs` scan registered catalog, audit/generate theo language/accent và chỉ
  publish sau khi toàn bộ target en-US, en-GB và Vietnamese hiện hành tồn tại và pass WAV
  validation. Hai file dùng atomic replacement riêng; provenance được ghi trước và
  `src/data/audioManifest.ts` được ghi cuối làm runtime commit point. Filtered/limited generation
  không được publish partial manifest.
- `englishAudioGenerationManifest.json` là generated provenance: release, synthesis config,
  voices, target keys, byte sizes và SHA-256. Không sửa tay.
- `GeneratedAudioRegistry.ts` cố ý để trống cho R2-first lesson audio. Generator giữ file này
  nguyên trạng mặc định, kể cả `--manifest-only`; chỉ rewrite bundled `require(...)` khi chạy với
  `--write-bundled-registry`.
- TTS generation cần Google auth; luôn preview bằng `npm run generate:audio:dry-run` và đọc số
  `Missing files` cùng `Invalid files`. Dry-run có thể exit `0` dù corpus vẫn chưa đầy đủ.
- `neural2-c-r1` là immutable sau khi publish. Thay voice, rate, format, pronunciation input hoặc
  post-processing phải dùng audio release ID mới, không overwrite key đã publish. Generator đối
  chiếu provenance config/voice/SHA và từ chối `--force` hoặc bytes drift trên English key đã
  publish.

### R2 operations

- Khi R2 credentials/network access nằm trong phạm vi task, workflow phải chạy
  `npm run upload:r2:dry-run` trước. Dry-run không ghi bucket nhưng vẫn tự đọc `.env`, cần đủ R2
  credentials, kết nối network và đọc remote manifest. Nếu không được phép/chưa có credentials,
  báo `not run` và lý do.
- `npm run upload:r2` đã bao gồm `--apply` và sẽ mutate R2.
- Dual-accent rollout upload các immutable accent/release keys tại chỗ rồi verify; không clear
  prefix `v1`, vì prefix này còn chứa production images, Vietnamese audio và legacy English audio.
- Clear/purge có `--apply` còn yêu cầu confirmation do dry-run in ra. Upload thật và clear/purge
  phải được người dùng cho phép rõ ràng.
- Sau upload/clear, verify R2 trước khi coi release hoàn tất.

## 10. Validation contract

### General code health

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

Không giả định baseline xanh. Mọi task phải ghi command đã chạy, lỗi mới và lỗi baseline còn lại.

### Lesson changes

```bash
npm test -- --runInBand __tests__/lessonValidation.test.ts
npm test -- --runInBand
```

Chạy thêm `npm run generate:audio:dry-run` khi lesson change làm đổi vocabulary, prompt hoặc audio
references. Đọc số `Missing files`; exit code `0` không chứng minh không còn audio thiếu.
Với production dual-accent corpus, đồng thời đọc `Invalid files`; generated runtime/provenance
manifest chỉ hợp lệ khi full-corpus gate pass cho en-US, en-GB và Vietnamese.

### Image changes

```bash
npm run assets:audit -- --lesson=<lesson-id>
npm run assets:build -- --lesson=<lesson-id>
npm run assets:verify -- --lesson=<lesson-id>
npm run check:images
```

Bốn command trên là local checks. Chỉ chạy thêm
`npm run upload:r2:dry-run -- --lesson=<lesson-id>` khi task cần so sánh remote và việc đọc
credentials/kết nối network được phép; nếu không, báo `not run` và lý do.

### Native changes

Chạy TypeScript/lint/tests liên quan và ưu tiên build-only command cho platform bị tác động nếu môi
trường có SDK. `npm run android`/`npm run ios` có thể cài và launch app, nên chỉ dùng khi
device/simulator side effect nằm trong phạm vi task. Nếu Android/iOS build hoặc manual behavior
chưa chạy, phải ghi rõ thay vì ngầm coi đã pass.

## 11. Known health và implementation limits

Tại lần kiểm chứng gần nhất:

- `npx tsc --noEmit`: pass.
- Jest: 85/86 suites và 862/863 tests pass. Một baseline failure còn lại nằm ở
  `__tests__/iosPermissionLocalization.test.ts` vì localized `InfoPlist.strings` đang thiếu
  `NSPhotoLibraryUsageDescription`; audit Theme 4/5 không chạm iOS/localization. Mười ba suite mục
  tiêu cho lesson, vocabulary ownership, lesson validation và audio provenance pass 382/382.
- Audio generation/full-corpus audit hiện có 17.035 target, 0 file thiếu và 0 file lỗi. Pipeline
  standalone `meaningVi` đã tạo/publish đúng 877 clip Google TTS mới với tổng dung lượng 8,1 MiB;
  toggle icon-only tạo/publish thêm hai câu xác nhận bật/tắt. Full remote verify đạt
  22.175/22.175 object, lỗi 0 và post-upload dry-run còn `Changed/new: 0`. Production CDN
  `assets.sungy.net` trả
  `kitten-shiny-coat.webp` và audio en-US `shiny_coat_teach_success_77a8ad20.mp3` với HTTP 200,
  đúng content type và immutable cache headers.
- Image audit/build/verify của các delta trực tiếp đạt: `help-it-grow` 39/39,
  `feed-the-puppy` 37/37, visual revision `care-for-the-rabbit` 37/37 và `groom-the-kitten` 28/28;
  tất cả đều 0 missing, 0 oversized; hai lesson visual revision cũng 0 orphan. Các WebP
  cũ không còn được tham chiếu vẫn được giữ local, không bị xóa trong audit này. Full image
  reference check có 1.241 asset và không thiếu ảnh. Generated manifest local cũng có đủ 1.241
  entry ở revision `ca34c03471b10985`. Visual revision thỏ/mèo đã upload 59 WebP; remote verify
  đạt 637/637 và 768/768 lesson object, lỗi 0, còn post-upload delta bằng 0.
- Functions: 7/7 tests pass; Firestore Rules emulator pass sau khi bỏ Founder quota/outbox.
- Native build-only: iOS Simulator arm64 pass cho working tree trước đó. Android full
  `assembleDebug` pass ngày 2026-08-14 sau pacing revision `feed-the-puppy`. Store sandbox/physical-
  device purchase matrix vẫn chưa chạy vì external keys/products/test accounts chưa có.
- ESLint: pass với 26 warnings hiện có, chủ yếu là inline styles trong UI/animation và một nested
  component warning trong navigator; không có lint error.
- Repository chưa có tracked CI workflow.

Các con số này là snapshot, không thay thế việc chạy checks. Cập nhật hoặc xóa mục này ngay khi
baseline thay đổi.

Support summary:

| Area                                            | Status hiện tại |
| ----------------------------------------------- | --------------- |
| Memory, ListenAndChoose & Matching review games | Implemented     |
| Parent math adult gate                          | Implemented     |
| Parent PIN gate                                 | Unsupported     |
| Parent Google/Apple login                       | Implemented     |
| Free tier + Premium content guards              | Implemented     |
| RevenueCat client entitlement lifecycle         | Implemented     |
| Store-ready keys/products/legal config          | Partial         |
| Remote Config monetization switches             | Implemented     |
| Remote Config app-update policy                 | Implemented     |
| Parent-only optional + kid-safe required update | Implemented     |
| Parent-only system app review prompt            | Implemented     |
| Persistent Android review store link            | Implemented     |
| Persistent iOS review store link                | Implemented     |
| Founder cutoff/duration local access            | Implemented     |
| Firebase App Check client initialization        | Implemented     |
| Firebase App Check backend enforcement          | Partial         |
| Theme Light/Dark/System                         | Implemented     |
| Full VI/EN localization                         | Partial         |
| Teacher prompt mode vi/en/bilingual             | Partial         |
| English pronunciation en-US/en-GB               | Implemented     |
| Mode-based lesson filtering                     | Implemented     |
| Age-based runtime filtering                     | Partial         |
| Scene object state/variants v1                  | Implemented     |
| Scene-level resume                              | Implemented     |
| Exact step resume                               | Partial         |
| Record/playback + endpoint speech practice      | Implemented     |
| Parent local voice recording library            | Implemented     |
| Target-word assisted endpointing                | Implemented     |
| Transcription/pronunciation scoring             | Unsupported     |
| Android audio disk cache                        | Implemented     |
| iOS audio disk cache                            | Unsupported     |
| Full offline lesson bundle                      | Unsupported     |
| Native reminder E2E coverage                    | Partial         |
| Parent opt-in cloud learning data sync          | Implemented     |

## 12. Spec maintenance

Cập nhật tài liệu này trong cùng task khi thay đổi:

- feature status hoặc user-visible flow;
- route/param contract;
- lesson/domain schema hoặc catalog contents/order;
- dependency/toolchain range hoặc resolved baseline;
- persistence key/schema/normalization semantics;
- XP/reward/progress contract;
- native bridge methods hoặc platform support matrix;
- asset runtime delivery, generated-file ownership hoặc R2 workflow;
- notification scheduling semantics;
- architecture/ownership của module.

Khi cập nhật snapshot behavior/health, đồng thời cập nhật ngày và implementation baseline ở đầu
tài liệu để người đọc biết revision nào đã được kiểm chứng.

Không cập nhật spec chỉ vì formatting, mechanical refactor hoặc test-only change không đổi contract.
Mọi status mới phải có implementation evidence; không gọi capability là “planned” nếu chưa có
product decision rõ ràng.
