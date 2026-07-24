# Đặc tả Dự án - SKidsEnglish

**Trạng thái tài liệu:** ảnh chụp implementation hiện tại

**Kiểm chứng gần nhất:** 2026-07-22

**Implementation baseline:** commit `f8dc0279b59c38cd6fadd97217c3ee7b46e6f7aa` cộng với thay đổi
localization foundation, Firebase parent auth, opt-in cloud progress sync, dual-accent English
audio rollout và monetization Phase 1-3 trong working tree hiện tại.

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

SKidsEnglish là ứng dụng React Native giúp trẻ học từ/cụm từ tiếng Anh qua các tình huống sinh
hoạt thường ngày. Sản phẩm dạy tiếng Anh cố định; localization chỉ áp dụng cho UI và hướng dẫn
của cô giáo. UI/hướng dẫn hiện vẫn Vietnamese-first, nhưng đã có foundation `vi`/`en` cho một số
cụm UI quan trọng và mode hướng dẫn `vi`/`en`/`bilingual`.

Đặc điểm hiện tại:

- **Implemented:** học theo theme -> lesson pack -> mini-scene -> review -> reward.
- **Implemented:** tương tác nghe, chạm, tìm object, kéo thả và luyện nói bằng cách ghi/phát lại.
- **Implemented:** Kid Mode, Parent Mode, progress/XP/sticker collection, activity/streak, daily
  reminder, Light/Dark/System theme.
- **Partial:** localization foundation cho UI `vi`/`en`, localized domain titles và teacher prompt
  mode `vi`/`en`/`bilingual`; chưa phải full-app localization.
- **Implemented:** Parent Mode persist lựa chọn phát âm English `en-US`/`en-GB`; dữ liệu cũ và
  setting thiếu mặc định `en-US`. Accent chỉ đổi audio phát âm, không đổi UI, app language,
  teacher prompt mode, vocabulary spelling hoặc lesson copy.
- **Implemented:** local persistence bằng AsyncStorage.
- **Implemented:** lesson images và generated prompt/vocabulary audio phân phối qua Cloudflare R2.
- **Implemented:** app UI icons dạng PNG nhỏ được bundle local, tách khỏi lesson image/R2 pipeline.
- **Implemented:** parent account sign-in qua Firebase Authentication với Google và Apple.
- **Implemented:** parent opt-in cloud progress sync qua Firestore; mặc định tắt và chỉ sync
  `LocalProgress`, không sync child profile/activity/voice recordings.
- **Implemented:** client monetization foundation với free tier cố định, content locks, Parent
  adult gate, màn Premium và RevenueCat entitlement lifecycle.
- **Implemented trong repository:** Remote Config purchase kill switch và Founder cutoff/duration;
  client tính Founder access từ RevenueCat `CustomerInfo.firstSeen` mà không dùng claim/quota/
  outbox. Backend chỉ còn callable xóa RevenueCat customer khi xóa parent account. RevenueCat
  public SDK keys và legal URLs vẫn chưa được điền.
- **Unsupported:** full offline lesson bundle; runtime lesson assets hiện phụ thuộc remote R2.

Không mô tả app là hoàn toàn offline: app tải lesson assets qua network. Voice recording trả local
URI và không có backend upload trong implementation hiện tại.

## 3. Tech stack và platform

### JavaScript/React Native

- React Native `0.86.0`.
- React `19.2.3`.
- TypeScript strict; range khai báo là `^5.8.3`, `package-lock.json` hiện resolve `5.9.3`.
- React Navigation v7: native container + native stack.
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
     -> startMonetization()
     -> startParentAccessSessionLifecycle()
     -> AppThemeProvider
     -> SafeAreaProvider
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
- `ReviewGame { lessonId, learningMode?, openedFromParent? }`
- `ReviewLibrary`
- `Reward { lessonId, playedWordIds?, xp/reward fields... }`
- `StickerCollection { highlightedStickerId? }`
- `Parent { intent?: 'dashboard' | 'premium' | 'founderPromo', lessonId? }`
- `Premium`

Route registration nằm trong `src/navigation/AppNavigator.tsx`. Mọi thay đổi route phải cập nhật
cả registration, param types và call sites.

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

Hiện có một theme:

- `mot-ngay-cua-be` / “Một ngày của bé”.

Theme chứa 11 lesson packs theo thứ tự:

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

Catalog được khai báo tại `src/data/themes.ts` và `src/data/lessons.ts`. Validators chạy khi
catalog được import; trong development, validation errors có thể throw và warnings được log.

### Hierarchy

```text
LessonTheme
  -> lessonIds[]

Lesson
  -> ageRange
  -> scenes[]
  -> optional reviewGame

Scene
  -> background
  -> optional character
  -> vocabulary[]
  -> objects[]
  -> dropZones[]
  -> steps[]
  -> optional completionReward
```

Shared contracts nằm trong `src/types/lesson.ts`.

### Scene vocabulary và objects

- Vocabulary type: `noun`, `verb`, `phrase`.
- Vocabulary level: `easy`, `medium`, `hard`.
- Object roles: `learning`, `decoration`, `dropZone`, `character`.
- Vị trí và touch areas dùng `PercentRect` để responsive theo scene.
- `AssetRef` hỗ trợ type `image`, `audio`, `lottie`, `sprite`; runtime support thực tế phụ thuộc
  renderer/registry hiện có.

### Steps và interactions

- Step types: `intro`, `teach`, `practice`, `review`.
- Interaction types: `listen`, `tap`, `drag`, `find`.
- `StepController` quyết định listen/interactive flow, đánh giá tap/find/drag, next step và
  success/fail feedback.
- `ScenePlayer` render scene, phát instruction/audio, khóa tương tác trong thời điểm cần thiết,
  điều phối effects, prefetch và progress.

### Learning modes

- `core`: nội dung cơ bản.
- `expanded`: thêm vocabulary/steps có `minMode: expanded`.
- `challenge`: thêm nội dung có `minMode: challenge`.

`src/data/learningModes.ts` lọc đồng bộ vocabulary, character, objects, drop zones và steps theo
`learningScope`, đồng thời bỏ dangling `nextStepId` sau khi lọc.

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
- Mỗi scene node trên theme map dùng đúng bundled icon riêng của scene; icon milestone đại diện
  lesson không được dùng làm lý do thay scene icon bằng một fallback chung.
- Mỗi milestone/review node cuối lesson dùng một bundled milestone icon riêng theo chủ đề bài học,
  không dùng lại icon của bất kỳ scene nào.
- `guided`: mở theo progress và scene đầu tiên chưa hoàn tất.
- `free`: cho phép mở nội dung không phụ thuộc thứ tự progress.
- **Implemented:** trong theme map, trạm/review bị khóa do tiến độ vẫn nhận thao tác chạm để hiện
  giải thích; khóa tiến độ, Premium và trạng thái đang kiểm tra Premium phát lời nhắc ngắn theo
  `appLanguage`. Các clip Google TTS nằm trong bundled UI audio registry và được throttle để tránh
  phát lặp khi bé chạm liên tục.
- `visibleLessonIds` có thể ẩn lesson khỏi plan; `undefined` nghĩa là hiển thị tất cả.
- `ThemeLibrary` đã có infrastructure nhưng catalog hiện chỉ có một theme.

### Parent Mode

- **Implemented:** adult gate yêu cầu trả lời phép tính đơn giản. Sau ba câu trả lời sai, gate
  cooldown 10 giây trước khi cho thử tiếp; PIN vẫn unsupported.
- Quyền Parent là session in-memory, không persist. Session bị revoke khi app rời trạng thái active,
  trừ thời gian store purchase/restore đang mở để callback thanh toán có thể quay lại đúng flow.
- **Implemented:** xem activity/streak/weekly stats và progress tổng quan.
- **Implemented:** tab Bài học chỉnh difficulty, guided/free journey và visible lessons; tab
  Cài đặt chỉnh child profile, Light/Dark/System theme, app-language preference, teacher prompt
  mode, English accent, daily reminder time, contact support email và app version.
- **Implemented:** parent account card hỗ trợ đăng nhập/đăng xuất/xóa tài khoản Firebase Auth bằng
  Google và Apple. Đây là tài khoản phụ huynh. Trên iOS hỗ trợ Apple Sign-In, nút Apple đứng trước
  Google trong Parent/Premium, kể cả luồng kích hoạt Founder; Android chỉ hiện Google.
- **Implemented:** trong account card, phụ huynh chủ động bật/tắt cloud progress sync. Consent modal
  liệt kê dữ liệu được sync; opt-out cho phép giữ hoặc xóa bản cloud. Child profile, daily activity
  và voice recordings không được upload.
- **Implemented:** khi Parent Mode mở bài học hoặc game ôn tập, phiên phụ huynh được giữ để nút
  quay lại trở về Parent Mode mà không phải vượt qua adult gate lần nữa.
- **Implemented:** entry từ Kid Mode có thể mở `Parent` với intent `premium`/`founderPromo`; sau
  khi adult gate pass, Parent Mode điều hướng sang `Premium`. `PremiumScreen` cũng tự trả về Parent
  gate nếu session chưa được cấp.
- **Implemented:** development-only scene editor flag; không coi đây là production feature.
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
  `morning-routine` và `at-school`. Hai lesson này cùng scene/review của chúng luôn mở, kể cả khi
  monetization đang khởi tạo, signed out hoặc tạm unavailable; các lesson còn lại cần entitlement
  `premium` active.
- Caller entry points và destination screens đều guard access. `LessonPackScreen`,
  `ScenePlayerScreen` và `ReviewGameScreen` không mount nội dung/audio premium trước khi quyền
  được xác nhận; `openedFromParent` không bypass entitlement. Kid-facing gate không hiển thị giá,
  chỉ đề nghị nhờ ba mẹ và mở Parent intent.
- Scene/review đã bắt đầu latch access cho phiên hiện tại để entitlement hết hạn giữa hoạt động
  không đẩy bé ra ngoài. Quyền được kiểm tra lại tại boundary mới, ví dụ từ scene sang review.
- `PremiumScreen` chỉ mở sau adult gate và hỗ trợ parent Firebase sign-in, hiển thị packages từ
  RevenueCat offering, mua, restore, subscription management URL, trạng thái gói đang active và
  retry. UI hỗ trợ package monthly/annual/lifetime; giá/currency hiển thị lấy từ store metadata,
  không lấy các giá tư vấn hardcode trong app.
- Khi normalized monetization status là `premium`, Kid Mode hiển thị chip Premium nhỏ trong
  header mà không đưa giá, hạn dùng hoặc chi tiết mua hàng vào UI của bé. Parent dashboard hiển
  thị indicator Premium gọn với icon crown riêng, trạng thái, loại quyền và entry mở
  `PremiumScreen`; hạn dùng/gia hạn nằm trong màn Premium chi tiết. Phần tài khoản phụ huynh cũng
  gắn badge Premium với account đang đăng nhập. Khi status là `signedOut`, `free` hoặc
  `unavailable`, Parent dashboard hiển thị teaser card mềm để ba mẹ xem gói Premium; teaser ẩn
  trong lúc `initializing` để tránh nhấp nháy. Trong tab Bài học của Parent Mode, các bài ngoài
  free tier hiển thị trạng thái Premium và affordance mở khóa ngay trên dòng bài; bấm dòng bài bị
  khóa mở `PremiumScreen` thay vì chỉ mở preview. Kid Home Map cũng hiển thị CTA Premium theo
  tiến độ sau khi toàn bộ free lesson IDs đã nằm trong `completedLessonIds`; CTA ẩn với tài khoản
  Premium hoặc khi monetization còn `initializing`, và mở Parent intent `premium` cho bài Premium
  kế tiếp.
- `src/engine/MonetizationManager.ts` bind RevenueCat App User ID với Firebase parent UID. Verified
  `CustomerInfo.entitlements.active.premium` là source of truth cho quyền đã mua và luôn ưu tiên;
  listener và explicit refresh cập nhật trạng thái. Founder access là nhánh local riêng, được tính
  từ metadata RevenueCat và Remote Config, không phải RevenueCat entitlement. Không persist quyền
  thành một local boolean.
- `premium_purchase_enabled` có thể tạm dừng mua mới mà không thay đổi entitlement đã có. Mọi
  purchase/restore đều yêu cầu parent account đã sign in; RevenueCat diagnostics và automatic
  device-identifier collection được tắt trong client config.
- **Launch blocker:** `src/config/monetization.ts` vẫn để trống RevenueCat Apple/Google public SDK
  keys, Privacy Policy URL và Terms of Use URL. Vì vậy code path đã có nhưng chưa sẵn sàng store
  testing/release cho tới khi điền cấu hình thật và tạo products/offering/entitlement tương ứng.
- **Implemented trong repository:** client đọc `founder_premium_cutoff_at` và
  `founder_premium_duration_days`, so sánh với RevenueCat `CustomerInfo.firstSeen` và chỉ mở nội
  dung sau khi Firebase parent sign-in. Cutoff rỗng/date không hợp lệ fail closed; cơ chế này không
  phải quota chính xác 500 và không được mô tả là “500 lượt tải đầu tiên”.

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
- Tap/find/drag được đánh giá bằng target IDs/drop zones; feedback/effects chạy sau kết quả.
- Trước khi vào bài, ScenePlayer chuẩn bị gói tài nguyên bắt buộc của current scene: toàn bộ ảnh
  scene cần render/effect và audio đúng với `teacherPromptMode` cùng `englishAccent` đang chọn.
  Instruction và tương tác chỉ bắt đầu sau khi toàn bộ gói này báo sẵn sàng hoặc đã có trong cache.
- Cache hit có thể giúp scene chạy khi mất mạng, nhưng `Image.prefetch` dùng cache do React Native/
  hệ điều hành quản lý nên không được xem là một offline lesson pack bền vững hay được bảo đảm.
- Nếu một tài nguyên bắt buộc chưa sẵn sàng, lesson dừng ở màn lỗi có `Thử lại` và `Thoát bài`;
  step/feedback không tự chuyển tiếp trong im lặng. Prefetch nền cho next scene và các tài nguyên
  không bắt buộc vẫn là best-effort và không chặn current scene.
- Success/fail feedback audio của current step được warm trong lúc instruction đang phát. Với
  listen step, nút Continue chỉ xuất hiện sau khi success feedback đã prepare xong. Khi trả lời
  đúng, UI hiển thị feedback text và trạng thái chuẩn bị/phát ngay. Step chỉ chuyển tiếp sau khi
  native playback xác nhận phát xong; native playback failure hoặc hard timeout đều dừng narration
  và hiện lựa chọn thử lại/thoát bài, không tự chuyển step khi feedback bị thiếu hoặc vẫn đang phát.
- Scene progress dùng composite ID `<lessonId>:<sceneId>` và còn đọc legacy bare scene IDs.
- Current step ID được persist, nhưng resume flow hiện chỉ sử dụng lesson/scene; **Partial:** chưa
  resume trực tiếp đúng step trong scene.

### Speech practice

- **Implemented:** teach step có vocabulary có thể hiển thị `SpeakPracticeControls`.
- **Implemented:** phát từ mẫu, request record permission, ghi âm, theo dõi audio level/silence,
  auto-stop và hỗ trợ phát lại local recording theo yêu cầu.
- Speech practice không phải một `SceneInteractionType` riêng.
- **Unsupported:** speech-to-text, transcription, pronunciation correctness/scoring. Current
  feedback chỉ khuyến khích sau recording, không xác nhận phát âm đúng.

### Review games

- `ReviewGame.type` khai báo `matching | memory | listenAndChoose | random` để mở rộng data model.
- **Implemented:** runtime registry hỗ trợ `memory`, `listenAndChoose` và chế độ xoay tua ngẫu nhiên `random`.
- Màn hình game ôn tập (`ReviewGameScreen`) cung cấp thanh Tab Selector (🃏 **Lật thẻ** vs 🎈 **Nghe & Chọn**) cho phép bé/phụ huynh tự do chuyển đổi game trực tiếp khi đang ôn tập.
- Memory game tạo hai thẻ hình giống nhau cho mỗi vocabulary item, đọc English word bằng accent đang chọn khi lật và hoàn tất khi ghép hết cặp.
- Listen & Choose game phát âm từ tiếng Anh và hiển thị các quả bóng bay hình minh họa để bé nghe và chọn đáp án đúng.
- Pair count mặc định theo mode: 4 (`core`), 5 (`expanded`), 6 (`challenge`), trừ khi lesson config override trong giới hạn runtime.
- **Unsupported:** `matching`; registry hiển thị unsupported UI cho type chưa triển khai.

### Rewards và progress

`LocalProgress` lưu:

- active theme;
- completed lesson, scene và review-game IDs;
- learned words và per-word mastery counters;
- earned sticker IDs;
- earned sticker records `{ stickerId, lessonId?, earnedAt?, source }` để hiển thị timeline;
- earned achievement records `{ achievementId, stickerId, earnedAt? }` cho sticker thành tựu;
- total XP;
- optional current lesson/scene/step pointer.

Các completion/event-write flow chính catch lỗi theo hướng best-effort để lesson/reward navigation
không bị kẹt. Các primitive như đọc, save/reset toàn bộ progress hoặc lưu active theme vẫn có thể
throw; caller không được giả định mọi progress operation đều nuốt lỗi. Activity ghi words/scenes
và ước lượng 3 phút cho mỗi scene event.

- Sticker là phần thưởng theo lesson, không phải phần thưởng theo level. `src/data/rewards.ts`
  khai báo catalog một sticker cho mỗi lesson pack hiện có, gồm `iconName` và `tone` để render
  sticker art riêng bằng bundled SKids icons.
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
- `completeLessonProgress`: review mới +2 XP, replay +1 XP; đánh dấu lesson/review complete,
  thêm learned words và trao sticker của lesson nếu sticker đó chưa có. Replay không duplicate
  sticker nhưng có thể repair progress cũ đã complete lesson mà thiếu sticker.
- `RewardScreen` hiển thị sticker mới khi `unlockedSticker` được trả về và có CTA mở
  `StickerCollection`. `StickerCollectionScreen` có animation mở album Sungy, grid sticker đã
  mở/đang khóa dựa trên `earnedStickerIds`, optional `highlightedStickerId`, sticker art dạng
  huy hiệu Sungy + icon lesson, timeline ngày nhận dựa trên `earnedStickerRecords`, và achievement
  stickers ngoài lesson được render theo các nhóm dễ đến khó. Card sticker chỉ hiển thị hình, tên
  ngắn và trạng thái; khi bé bấm card, app phát SFX phản hồi và mở modal chi tiết gồm ý nghĩa,
  cách mở, tiến độ và ngày nhận. Khi collection phát hiện achievement đã đạt nhưng chưa có record,
  app ghi `earnedAchievementRecords` best-effort để lưu ngày nhận.
  Legacy progress chỉ có `earnedStickerIds` được normalize thành record `source: 'legacy'` không có
  `earnedAt`.

### Daily reminders

- **Implemented:** Notifee request permission và tạo một timestamp trigger lặp mỗi ngày.
- Notification ID/channel ID: `daily-reminder`.
- Khi bật reminder hoặc đổi giờ, Parent UI schedule/reschedule; khi tắt thì cancel.
- Service cancel notification cũ trước khi tạo schedule mới.
- **Partial verification:** chưa có native E2E tests trong repo chứng minh behavior trên cả hai OS;
  thay đổi reminder cần kiểm tra trên platform hoặc báo rõ chưa chạy.

### Theme

- `AppThemeProvider` đọc/persist preference `light | dark | system`.
- `system` resolve bằng React Native `Appearance` thành light hoặc dark.
- `colors.ts` cung cấp token proxy, `createThemedStyles` và `useThemeSync` để styles cập nhật theo
  active scheme.

## 7. Local persistence, parent auth và cloud progress

App luôn dùng bốn AsyncStorage stores làm persistence local. Firestore chỉ giữ optional cloud copy
của learning progress sau parent opt-in:

### Parent settings

- Key: `@skidsenglish/parent-settings/v1`.
- Manager: `src/engine/ParentSettingsManager.ts`.
- Fields chính: onboarding flag, journey/learning mode, optional editor flag, visible lessons,
  app language, teacher prompt mode, English accent, app theme, reminder state/time, child profile
  và `cloudProgressSync` consent preference.
- Normalization cung cấp defaults và chịu được field thiếu từ dữ liệu cũ.
- `englishAccent` nhận `en-US` hoặc `en-GB`; giá trị thiếu/không hợp lệ normalize về `en-US` để
  giữ hành vi legacy.
- `cloudProgressSync` mặc định `enabled: false`; chỉ normalize thành enabled khi có owner UID,
  consent version hiện tại và consent timestamp hợp lệ.

### Learning progress

- Key: `@skidsenglish/progress/v1`.
- Manager: `src/engine/ProgressManager.ts`.
- Lưu completion, review, vocabulary mastery, XP, sticker IDs, sticker records, achievement
  records, active theme và resume pointer.
- Normalizer duy trì arrays/records/default theme khi persisted data thiếu hoặc cũ; legacy
  `earnedStickerIds` được backfill thành `earnedStickerRecords` để collection vẫn hiển thị.
- `ProgressManager` phát change source `local | cloud`; cloud-applied merge không bị enqueue lại như
  một local mutation và giữ nguyên source `updatedAt` thay vì tạo client timestamp mới.

### Cloud sync checkpoint

- Key: `@skidsenglish/cloud-progress-sync-state/v1`.
- Manager: `src/engine/CloudProgressSyncState.ts`.
- Lưu owner UID, semantic fingerprint, thời điểm sync gần nhất đã được server xác nhận và metadata
  scheduler cho cloud sync: lần remote check gần nhất, lần write attempt gần nhất, failure count và
  thời điểm retry kế tiếp.
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
  performance, messaging và ad storage; không thêm Firebase Analytics package.
- Apple account deletion flow gọi `revokeToken` trước `deleteUser` khi tài khoản có provider
  `apple.com`.
- Account deletion UI xóa `users/{uid}/progress/current` trước khi xóa Firebase Auth. Nếu cloud
  deletion thất bại, auth deletion dừng để tránh để lại document không còn owner đăng nhập; local
  progress không bị xóa.

### Monetization lifecycle, Remote Config và App Check

- Lifecycle entry nằm trong `App.tsx`. `src/engine/MonetizationManager.ts` sở hữu RevenueCat
  identity, offering/packages, purchase/restore, `CustomerInfo` listener và normalized snapshot;
  `src/config/monetization.ts` sở hữu entitlement/offering/product IDs, Remote Config key names và
  public client configuration.
- Remote Config service nằm tại `src/services/RemoteMonetizationConfig.ts`. Client set defaults,
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
- Founder access không phải RevenueCat entitlement, không cấp receipt và không đảm bảo quota đúng
  500. `firstSeen` là lúc RevenueCat lần đầu thấy App User ID, không phải số download/install tuyệt
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
- Account deletion refresh Firebase Auth token và App Check token trước khi chạy cloud progress
  deletion -> callable xóa RevenueCat customer -> Firebase Auth deletion -> local RevenueCat
  cache/logout. Nếu token bảo mật chưa sẵn sàng hoặc backend cleanup chưa được xác nhận, Firebase
  Auth được giữ để phụ huynh retry. Founder access không có ledger/outbox/tombstone cần scrub.
- Các document Founder legacy từng được tạo trên project test không tự mất khi xóa Functions/code;
  phải kiểm kê và purge bằng admin migration có xác nhận trước production, không giao việc đó cho
  callable account deletion mới.

### Cloud progress sync

- Dependency/runtime: `@react-native-firebase/firestore` `25.x`.
- Lifecycle boundary: `App.tsx` gọi `startCloudProgressSync()`; manager nằm tại
  `src/engine/CloudProgressSyncManager.ts`.
- Merge/serialization thuần nằm tại `src/engine/CloudProgressMerge.ts`.
- Firestore path duy nhất: `users/{uid}/progress/current`; schema version và consent version hiện
  đều là `1`.
- Sync mặc định tắt. Đăng nhập không tự bật sync. Consent được bind với UID hiện tại, vì vậy đăng
  nhập tài khoản khác không kế thừa opt-in cũ. Parent UI cho phép xóa consent cũ khỏi thiết bị để
  tài khoản hiện tại opt-in lại; thao tác này không xóa cloud document của owner cũ.
- Payload chỉ gồm `LocalProgress`: completion/review IDs, learned words, vocabulary progress, XP,
  sticker/achievement records, active theme, resume pointer và client update timestamp.
- Không sync child profile (name/avatar/birth year), parent settings, daily activity/streak, voice
  recording URI/file hoặc lesson assets.
- Local progress tiếp tục là runtime source of truth. Khi nhận remote snapshot, ID arrays/records
  được union theo key; vocabulary counts/mastery và total XP lấy max; active theme/resume pointer
  lấy snapshot có `updatedAt` mới hơn. Merge được canonicalize để tránh ping-pong do array order.
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
- Contract max/union tránh duplicate reward và XP inflation nhưng không cộng hai XP delta độc lập
  phát sinh đồng thời trên hai thiết bị offline. Event-log/operation-based multi-device accounting
  vẫn unsupported.
- Opt-out có hai lựa chọn: dừng listener nhưng giữ cloud document, hoặc dừng và xóa cloud document.
  Local progress luôn được giữ.
- `firestore.rules` chỉ cho authenticated owner get/create/update/delete document `current`, cấm
  list/cross-UID/unrelated paths, whitelist fields và giới hạn basic types/sizes. Dynamic entries
  bên trong vocabulary map được client normalizer kiểm tra vì Firestore Rules không có generic
  iteration để validate mọi map value.
- `npm run test:firestore-rules` chạy Firebase Emulator với demo project và kiểm tra owner access,
  cross-user/anonymous denial, list denial, owner/schema constraints và unknown-field rejection.
- Root `firebase.json` vẫn tắt Analytics/Performance/Messaging/ad auto-collection; Firebase
  Analytics package không được thêm.
- **Unsupported:** sync parent settings/child profile/activity/recordings, Realtime Database và
  Analytics. App Check client initialization đã implemented, nhưng enforcement chưa được chứng
  minh/cấu hình trong repository.

## 8. Audio, recording và native modules

### Audio layers

1. Lesson vocabulary/prompt audio: generated en-US/en-GB English files và Vietnamese files,
   runtime R2-first.
2. Short feedback SFX (`tap`, `correct`, `wrong`, `yay`, ...): bundled trong native app.
3. Voice recording: local file URI từ native module; không có upload backend hiện tại.

`AudioManager` giữ playback primitive và effects theo hướng best-effort, còn `ScenePlayer` áp dụng
readiness gate cho audio bài học bắt buộc. Nếu audio bắt buộc chưa sẵn sàng, scene hiển thị lựa chọn
thử lại/thoát bài thay vì tiếp tục hoặc tự chuyển step trong im lặng. Teacher prompt mode English/
bilingual dùng resolved English teacher instructions, shared English cues và generated audio
manifest theo `englishAccent` khi có asset. Lookup ưu tiên accent được chọn, sau đó default en-US
và legacy `audio/en/`; TTS fallback nếu có cũng dùng locale được chọn. Native adapter hiện tập
trung vào SFX/URI playback, vì vậy production không được dựa vào TTS fallback để che một corpus
en-GB thiếu. Narration dùng session latest-wins: session mới dừng session cũ, và session đã bị hủy
không được tiếp tục segment hoặc accent/legacy fallback sau khi cache lookup hay native playback
trả về.

### Native support matrix

| Capability                          | Android                       | iOS                           | Fallback/current behavior         |
| ----------------------------------- | ----------------------------- | ----------------------------- | --------------------------------- |
| `SkidsAudio` SFX/URI playback       | Implemented                   | Implemented                   | AudioManager best-effort          |
| Voice recording/metering/permission | Implemented                   | Implemented                   | UI báo/không ghi nếu unavailable  |
| `SkidsAssetCache` disk cache        | Implemented                   | Implemented                   | JS trả remote URL khi module vắng |
| Lesson image prefetch               | React Native `Image.prefetch` | React Native `Image.prefetch` | Không dùng `SkidsAssetCache`      |

`SkidsAudio` contract được nối qua `NativeAudioAdapter.ts` và `VoiceRecorder.ts`. Android
implementation nằm trong package `audio`; iOS implementation là `SkidsAudio.swift` với Objective-C
bridge `SkidsAudio.m`.

`SkidsAssetCache` có implementation Kotlin/Android và Swift/iOS. Current JS call sites dùng nó để
cache/prefetch remote lesson audio, không phải lesson images. Native prefetch chỉ báo ready khi
mọi asset hợp lệ trong batch đã có file cache khác rỗng; lỗi từng file trả trạng thái chưa sẵn sàng
để ScenePlayer chuyển sang màn thử lại/thoát bài thay vì tự động bỏ qua. Android tách foreground
executor cho audio sắp phát khỏi hàng đợi bulk prefetch và khóa theo cache key để không tải trùng
cùng file.

## 9. Asset delivery và authoring pipeline

### Runtime remote config

- `src/config/remoteAssets.ts` tạo URL từ public R2 root + release.
- Current release prefix là generated value `v1`; không hardcode revision hash vào spec.
- `preferRemoteImages` và `cacheRemoteAssets` hiện bật.
- Image URLs có manifest revision query để tránh stale device/CDN image cache.
- English audio cache identity chứa cả accent và immutable release segment
  `neural2-c-r1`; en-US và en-GB không dùng chung R2/device-cache key.

### Images

- Final lossless source of truth:
  `src/assets/source/master/lessons/<lesson>/<scene>/images/*.png`.
- Raw/chroma inputs: `src/assets/source/lessons/`.
- Generated WebP: `src/assets/lessons/<lesson>/<scene>/images/*.webp`.
- Runtime `AssetRegistry` hiện có bundled registry trống và resolve lesson images sang R2.
- Current/next scene image prefetch dùng React Native `Image.prefetch`.
- App UI icons: PNG bundle nằm trong `src/assets/icons/app-ui/`, import qua
  `AppUiIcon`, tách khỏi lesson WebP generation và R2 upload.
- Kid-facing S-Kids icons, gồm scene và lesson milestone icons, nằm trong
  `src/assets/icons/skids/`, import qua static registry và cũng nằm ngoài lesson WebP/R2 pipeline.

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
- Vietnamese instruction/feedback: `audio/vi/*.wav`.
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
- Jest: 214/214 tests pass trong 27 suites.
- Functions: 7/7 tests pass; Firestore Rules emulator pass sau khi bỏ Founder quota/outbox.
- Native build-only: Android Debug pass; iOS Simulator arm64 đã pass ở baseline trước nhưng chưa
  chạy lại cho thay đổi này. Store sandbox/physical-device purchase matrix vẫn chưa chạy vì
  external keys/products/test accounts chưa có.
- ESLint: pass với 26 warnings hiện có, chủ yếu là inline styles trong UI/animation và một nested
  component warning trong navigator; không có lint error.
- Repository chưa có tracked CI workflow.

Các con số này là snapshot, không thay thế việc chạy checks. Cập nhật hoặc xóa mục này ngay khi
baseline thay đổi.

Support summary:

| Area                                     | Status hiện tại |
| ---------------------------------------- | --------------- |
| Memory & ListenAndChoose review games    | Implemented     |
| Matching review game                     | Unsupported     |
| Parent math adult gate                   | Implemented     |
| Parent PIN gate                          | Unsupported     |
| Parent Google/Apple login                | Implemented     |
| Free tier + Premium content guards       | Implemented     |
| RevenueCat client entitlement lifecycle  | Implemented     |
| Store-ready keys/products/legal config   | Partial         |
| Remote Config monetization switches      | Implemented     |
| Founder cutoff/duration local access     | Implemented     |
| Firebase App Check client initialization | Implemented     |
| Firebase App Check backend enforcement   | Partial         |
| Theme Light/Dark/System                  | Implemented     |
| Full VI/EN localization                  | Partial         |
| Teacher prompt mode vi/en/bilingual      | Partial         |
| English pronunciation en-US/en-GB        | Implemented     |
| Mode-based lesson filtering              | Implemented     |
| Age-based runtime filtering              | Partial         |
| Scene-level resume                       | Implemented     |
| Exact step resume                        | Partial         |
| Record/playback speech practice          | Implemented     |
| Speech recognition/pronunciation scoring | Unsupported     |
| Android audio disk cache                 | Implemented     |
| iOS audio disk cache                     | Unsupported     |
| Full offline lesson bundle               | Unsupported     |
| Native reminder E2E coverage             | Partial         |
| Parent opt-in cloud progress sync        | Implemented     |

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
