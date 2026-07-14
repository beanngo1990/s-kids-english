# Đặc tả Dự án - SKidsEnglish

**Trạng thái tài liệu:** ảnh chụp implementation hiện tại

**Kiểm chứng gần nhất:** 2026-07-14

**Implementation baseline:** commit `f8dc0279b59c38cd6fadd97217c3ee7b46e6f7aa` cộng với thay đổi
localization foundation trong working tree hiện tại.

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
- **Implemented:** local persistence bằng AsyncStorage.
- **Implemented:** lesson images và generated prompt/vocabulary audio phân phối qua Cloudflare R2.
- **Implemented:** app UI icons dạng PNG nhỏ được bundle local, tách khỏi lesson image/R2 pipeline.
- **Unsupported:** account, backend sync hoặc cloud progress.
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
- Node.js `>=22.11.0`.
- Jest `29.x`, ESLint `8.x`.

`package.json` là nguồn cho declared ranges; `package-lock.json` là nguồn cho exact resolved
versions nếu các con số trên bị stale.

### Entry composition

```text
index.js
  -> App.tsx
     -> configureNativeAudioAdapter()
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
- `Parent`

Route registration nằm trong `src/navigation/AppNavigator.tsx`. Mọi thay đổi route phải cập nhật
cả registration, param types và call sites.

## 4. Source architecture

```text
src/
  assets/       lesson/shared assets, bundled app UI icons, source masters và generated outputs
  components/   reusable UI và mascot components
  config/       remote R2 configuration và generated release revision
  data/         catalogs, prompts, lesson authoring helpers và validators
  engine/       scene, step, progress, persistence, audio, recording và asset logic
  games/        review-game registry và implementations
  navigation/   navigation container/stack
  screens/      route-level screens
  services/     local notification service
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

- **Implemented:** lần đầu mở app, phụ huynh chọn `core`, `expanded` hoặc `challenge`.
- **Implemented:** hoàn tất ghi `hasCompletedOnboarding` và `learningMode`, sau đó vào `Home`.
- **Unsupported trong onboarding:** nhập tên, avatar hoặc năm sinh. Child profile được chỉnh sau
  trong Parent Mode.

### Kid Mode

- `HomeScreen` là trải nghiệm Kid Mode chính với Map và Play tabs.
- Theme map hiển thị lesson/scene progression, CTA hiện tại và review đang chờ.
- `guided`: mở theo progress và scene đầu tiên chưa hoàn tất.
- `free`: cho phép mở nội dung không phụ thuộc thứ tự progress.
- `visibleLessonIds` có thể ẩn lesson khỏi plan; `undefined` nghĩa là hiển thị tất cả.
- `ThemeLibrary` đã có infrastructure nhưng catalog hiện chỉ có một theme.

### Parent Mode

- **Implemented:** parent gate bằng thao tác giữ nút trong 3 giây.
- **Unsupported:** PIN hoặc câu hỏi toán/bảo mật; không mô tả hai cơ chế này là đã có.
- **Implemented:** xem activity/streak/weekly stats và progress tổng quan.
- **Implemented:** chỉnh difficulty, guided/free journey, visible lessons, child profile,
  Light/Dark/System theme, app-language preference, teacher prompt mode và daily reminder time.
- **Implemented:** khi Parent Mode mở bài học hoặc game ôn tập, phiên phụ huynh được giữ để nút
  quay lại trở về Parent Mode mà không phải giữ cổng 3 giây lần nữa.
- **Implemented:** development-only scene editor flag; không coi đây là production feature.
- **Partial:** `appLanguage` (`vi`/`en`) được persist và dùng bởi i18n foundation cho Onboarding,
  Parent gate/settings, navigation titles, một số ScenePlayer system overlay, bottom tabs, Home
  coach/hub chrome, LessonList chrome, ReviewGame empty states, Parent stats/lesson-management
  chrome, lesson/theme descriptions và domain titles theme/lesson/scene/review-game ở các màn hình
  chính. Một số parent tips và prompt data vẫn Vietnamese-first.
- **Implemented:** thay đổi parent settings về `appLanguage` được phát trong runtime để các màn
  hình đã dùng i18n foundation cập nhật mà không cần restart app.
- **Partial:** `teacherPromptMode` (`vi`/`en`/`bilingual`) được persist và chọn trong Parent UI.
  ScenePlayer instruction audio/display dùng `instructionVi` cho Vietnamese và English teacher
  instruction từ `instructionEn` hoặc fallback resolver dựa trên interaction/vocabulary/promptText.
  Scene success/fail feedback, speech-practice prompt/encouragement và memory review intro cũng đi
  qua teacher prompt resolver và nhận thay đổi `teacherPromptMode` từ parent settings trong
  runtime. Teach-step feedback có thể tự dựng câu nghĩa từ vocabulary như “It means good
  morning.”; các feedback English chưa có context rõ vẫn dùng cue an toàn như “Great job!” hoặc
  “Try again.” khi chỉ có bản Việt.

### Scene learning

- Scene gồm instruction playback, Continue/listen steps và object interactions.
- Teacher instruction resolver hỗ trợ Vietnamese, English hoặc bilingual dựa trên
  `teacherPromptMode`; English instruction ưu tiên `SceneStep.instructionEn`, sau đó tự dựng câu
  từ interaction/vocabulary/promptText để tránh đọc cue cụt như chỉ “book”.
- Teacher feedback resolver hỗ trợ success/fail display/audio theo `teacherPromptMode`; feedback
  cụ thể từ lesson có thể dùng `successFeedbackEn`/`failFeedbackEn`; khi thiếu, teach step có
  vocabulary fallback sang câu nghĩa English, còn các feedback khác dùng cue chung cho tới khi
  schema/data có bản dịch chi tiết.
- Scene title hiển thị theo `appLanguage` (`titleEn` cho English UI, `titleVi` cho Vietnamese UI);
  vocabulary và phát âm mục tiêu vẫn luôn là English.
- Tap/find/drag được đánh giá bằng target IDs/drop zones; feedback/effects chạy sau kết quả.
- Scene có thể prefetch current/next images và audio.
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

- `ReviewGame.type` khai báo `matching | memory | listenAndChoose` để mở rộng data model.
- **Implemented:** runtime registry chỉ hỗ trợ `memory`.
- Memory game tạo hai thẻ hình giống nhau cho mỗi vocabulary item, đọc English word khi lật và
  hoàn tất khi ghép hết cặp.
- Pair count mặc định theo mode: 4 (`core`), 5 (`expanded`), 6 (`challenge`), trừ khi lesson config
  override trong giới hạn runtime.
- **Unsupported:** `matching` và `listenAndChoose`; registry hiển thị unsupported UI.

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

## 7. Local persistence

App hiện không có account/cloud sync. Có ba AsyncStorage stores:

### Parent settings

- Key: `@skidsenglish/parent-settings/v1`.
- Manager: `src/engine/ParentSettingsManager.ts`.
- Fields chính: onboarding flag, journey/learning mode, optional editor flag, visible lessons,
  app language, teacher prompt mode, app theme, reminder state/time và child profile.
- Normalization cung cấp defaults và chịu được field thiếu từ dữ liệu cũ.

### Learning progress

- Key: `@skidsenglish/progress/v1`.
- Manager: `src/engine/ProgressManager.ts`.
- Lưu completion, review, vocabulary mastery, XP, sticker IDs, sticker records, achievement
  records, active theme và resume pointer.
- Normalizer duy trì arrays/records/default theme khi persisted data thiếu hoặc cũ; legacy
  `earnedStickerIds` được backfill thành `earnedStickerRecords` để collection vẫn hiển thị.

### Daily activity

- Key: `@skidsenglish/daily-activity/v1`.
- Manager: `src/engine/DailyActivityTracker.ts`.
- Giữ tối đa 30 daily entries và tính current/longest streak.
- Minutes hiện là estimate, không phải measured session duration.
- Activity calls là best-effort; counters có thể phản ánh replay events thay vì chỉ unique scenes.

Mọi schema/key change cần migration hoặc backward-compatible normalization và tests.

## 8. Audio, recording và native modules

### Audio layers

1. Lesson vocabulary/prompt audio: generated files, runtime R2-first.
2. Short feedback SFX (`tap`, `correct`, `wrong`, `yay`, ...): bundled trong native app.
3. Voice recording: local file URI từ native module; không có upload backend hiện tại.

`AudioManager` xử lý phát English/Vietnamese audio và effects theo kiểu best-effort; audio failure
không được làm lesson flow kẹt. Teacher prompt mode English/bilingual dùng resolved English
teacher instructions, shared English cues và generated audio manifest khi có asset; nếu English
prompt audio chưa được generate hoặc chưa có trên R2 thì fallback sang native TTS.

### Native support matrix

| Capability                          | Android                       | iOS                           | Fallback/current behavior         |
| ----------------------------------- | ----------------------------- | ----------------------------- | --------------------------------- |
| `SkidsAudio` SFX/URI playback       | Implemented                   | Implemented                   | AudioManager best-effort          |
| Voice recording/metering/permission | Implemented                   | Implemented                   | UI báo/không ghi nếu unavailable  |
| `SkidsAssetCache` disk cache        | Implemented                   | Unsupported                   | JS trả remote URL khi module vắng |
| Lesson image prefetch               | React Native `Image.prefetch` | React Native `Image.prefetch` | Không dùng `SkidsAssetCache`      |

`SkidsAudio` contract được nối qua `NativeAudioAdapter.ts` và `VoiceRecorder.ts`. Android
implementation nằm trong package `audio`; iOS implementation là `SkidsAudio.swift` với Objective-C
bridge `SkidsAudio.m`.

`SkidsAssetCache` hiện chỉ có Kotlin/Android implementation. Current JS call sites dùng nó để
cache/prefetch remote lesson audio, không phải lesson images. Không tuyên bố iOS disk cache parity.

## 9. Asset delivery và authoring pipeline

### Runtime remote config

- `src/config/remoteAssets.ts` tạo URL từ public R2 root + release.
- Current release prefix là generated value `v1`; không hardcode revision hash vào spec.
- `preferRemoteImages` và `cacheRemoteAssets` hiện bật.
- Image URLs có manifest revision query để tránh stale device/CDN image cache.

### Images

- Final lossless source of truth:
  `src/assets/source/master/lessons/<lesson>/<scene>/images/*.png`.
- Raw/chroma inputs: `src/assets/source/lessons/`.
- Generated WebP: `src/assets/lessons/<lesson>/<scene>/images/*.webp`.
- Runtime `AssetRegistry` hiện có bundled registry trống và resolve lesson images sang R2.
- Current/next scene image prefetch dùng React Native `Image.prefetch`.
- App UI icons: PNG bundle nằm trong `src/assets/icons/app-ui/`, import qua
  `AppUiIcon`, tách khỏi lesson WebP generation và R2 upload.

Không hand-edit WebP, asset manifest hoặc `generatedAssetRelease.ts`. Dùng scripts được mô tả
trong `docs/asset-pipeline.md`.

### Generated lesson audio

- English vocabulary và teacher instruction/prompt/cue audio: `audio/en/*.wav`.
- Vietnamese instruction/feedback: `audio/vi/*.wav`.
- Không có `audio/bilingual`; song ngữ là runtime sequence phát `vi` rồi `en`.
- `generateMissingAudio.mjs` scan registered catalog, tạo missing files và cập nhật
  `src/data/audioManifest.ts`.
- `GeneratedAudioRegistry.ts` cố ý để trống cho R2-first lesson audio. Generator giữ file này
  nguyên trạng mặc định, kể cả `--manifest-only`; chỉ rewrite bundled `require(...)` khi chạy với
  `--write-bundled-registry`.
- TTS generation cần Google auth; luôn preview bằng `npm run generate:audio:dry-run` và đọc số
  `Missing files`. Dry-run có thể exit `0` dù vẫn còn missing audio.

### R2 operations

- Khi R2 credentials/network access nằm trong phạm vi task, workflow phải chạy
  `npm run upload:r2:dry-run` trước. Dry-run không ghi bucket nhưng vẫn tự đọc `.env`, cần đủ R2
  credentials, kết nối network và đọc remote manifest. Nếu không được phép/chưa có credentials,
  báo `not run` và lý do.
- `npm run upload:r2` đã bao gồm `--apply` và sẽ mutate R2.
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

Tại lần kiểm chứng 2026-07-14:

- `npx tsc --noEmit`: pass.
- Jest: 73/74 tests pass; failure còn ở speech recording fallback timing
  (`SpeakPracticeControls.test.tsx`).
- ESLint: pass với 2 warnings trong baseline.
- Repository chưa có tracked CI workflow.

Các con số này là snapshot, không thay thế việc chạy checks. Cập nhật hoặc xóa mục này ngay khi
baseline thay đổi.

Support summary:

| Area                                     | Status hiện tại |
| ---------------------------------------- | --------------- |
| Memory review game                       | Implemented     |
| Matching/listen-and-choose review        | Unsupported     |
| Parent hold gate                         | Implemented     |
| Parent PIN/math gate                     | Unsupported     |
| Theme Light/Dark/System                  | Implemented     |
| Full VI/EN localization                  | Partial         |
| Teacher prompt mode vi/en/bilingual      | Partial         |
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
| Cloud progress/account sync              | Unsupported     |

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
