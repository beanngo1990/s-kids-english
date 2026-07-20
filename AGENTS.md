# SKidsEnglish - AI Working Guide

Tài liệu này áp dụng cho toàn bộ repository. Mục tiêu là giúp AI hiểu nhanh kiến trúc,
giới hạn và cách kiểm tra thay đổi mà không phải khảo sát lại toàn bộ dự án ở mỗi task.

## 1. Cách dùng các nguồn thông tin

Không có một tài liệu duy nhất thay thế mọi nguồn. Dùng đúng nguồn cho đúng mục đích:

- System/platform safety constraints và yêu cầu trực tiếp của người dùng có ưu tiên cao hơn
  repository guidance.
- `AGENTS.md` quy định cách làm việc, coding conventions, kiểm tra và an toàn.
- Nếu sau này có nested `AGENTS.md`, file gần code hơn bổ sung hoặc override quy tắc trong đúng
  subtree của nó.
- `docs/project_spec.md` mô tả kiến trúc, luồng sản phẩm và trạng thái triển khai hiện tại.
- `src/data/README.md` là contract chi tiết cho lesson authoring, audio và validator.
- `docs/asset-pipeline.md` là contract chi tiết cho PNG master, WebP, manifest và R2.
- Code, types, tests, native implementation và config thể hiện hành vi thực tế đang chạy.
- `package.json` là nguồn cho scripts và dependency ranges; `package-lock.json` là nguồn cho
  phiên bản dependency được resolve chính xác.
- `README.md` hiện chủ yếu là template React Native, không phải domain spec.

Khi spec, test và code mâu thuẫn:

1. Không âm thầm chọn một phía rồi mở rộng task.
2. Xác định đây là implementation drift, test drift hay product decision chưa chốt.
3. Báo rõ mâu thuẫn; chỉ sửa phía nằm trong phạm vi yêu cầu.
4. Nếu thay đổi hành vi/contract, cập nhật `docs/project_spec.md` trong cùng task.

Chỉ cập nhật project spec khi thay đổi một trong các nội dung sau: kiến trúc hoặc ownership,
luồng tính năng/navigation, persisted schema/key, lesson/domain schema, thêm/xóa/reorder catalog
entry, native bridge/support matrix, dependency/toolchain baseline, asset delivery/pipeline,
notification semantics hoặc hành vi sản phẩm nhìn thấy được. Không bắt buộc sửa spec cho
formatting, refactor không đổi hành vi, test-only, diagnosis hoặc bugfix nội bộ không đổi
contract.

Luôn dùng path tương đối theo repository trong tài liệu; không tạo absolute `file:` URI phụ thuộc
máy.

## 2. Stack và entry flow

- React Native `0.86.0`, React `19.2.3`, TypeScript strict. TypeScript được khai báo
  `^5.8.3`; `package-lock.json` hiện resolve `5.9.3`.
- React Navigation v7: `@react-navigation/native` và `@react-navigation/native-stack`.
- Node.js tối thiểu `22.11.0`.
- Với task AI, dùng `npm` và `package-lock.json` làm package manager/lockfile chuẩn.
  `yarn.lock` đang tồn tại như legacy; không cập nhật nó nếu người dùng không yêu cầu Yarn.
- Entry flow: `index.js` -> `App.tsx` -> `src/navigation/AppNavigator.tsx`.
- `App.tsx` cấu hình native audio adapter, theme provider, safe-area provider và navigator.
- Initial route phụ thuộc `ParentSettings.hasCompletedOnboarding`; lỗi đọc settings quay về
  `Onboarding`.
- Route names và params phải đồng bộ giữa `src/navigation/AppNavigator.tsx` và
  `src/types/navigation.ts`.

Luôn lấy dependency range được khai báo từ `package.json` và phiên bản resolve chính xác từ
`package-lock.json`; không dựa vào con số trong prose nếu các nguồn đã lệch nhau.

## 3. Bản đồ source code

- `src/screens/`: route-level screens.
- `src/components/`: UI dùng chung; mascot nằm trong `src/components/mascot/`.
- `src/navigation/`: stack registration và app routing.
- `src/engine/`: scene execution, progress, persistence, audio, recording, asset resolution.
- `src/data/`: lesson/theme catalogs, authoring helpers, prompts và validators.
- `src/data/lessons/`: một file cho mỗi lesson pack; đăng ký tại `src/data/lessons.ts`.
- `src/games/`: review-game implementations; runtime hiện chỉ hỗ trợ game `memory`.
- `src/services/`: hiện chỉ có local notification service, chưa có API layer.
- `src/config/`: R2/CDN và generated asset release config.
- `src/theme/`: colors, theme synchronization, typography, spacing, shadows, responsive layout.
- `src/types/`: shared domain/navigation contracts. Type chỉ dùng trong một module có thể đặt
  cạnh module đó.
- `src/utils/`: helpers cho progress, theme và lesson icons.
- `scripts/`: image, audio và R2 workflows.
- `android/`, `ios/`: native configuration, permissions và custom native modules.
- `__tests__/`: Jest tests.

Catalog hiện có một theme `mot-ngay-cua-be` và 11 lesson packs, theo thứ tự khai báo trong
`src/data/themes.ts` và `src/data/lessons.ts`.

## 4. Những fact sản phẩm cần biết trước khi sửa code

- Onboarding hiện chỉ chọn `learningMode`; profile của bé được chỉnh sau trong Parent Mode.
- Parent Mode được mở bằng cách trả lời phép tính đơn giản; chưa có PIN hoặc biometric gate.
- `journeyMode` gồm `guided` và `free`.
- `learningMode` gồm `core`, `expanded`, `challenge`.
- Lesson interaction types là `listen`, `tap`, `drag`, `find`.
- Speech practice là UI hỗ trợ ở teach step, không phải một `SceneInteractionType`; hiện không
  có speech recognition, transcription hay pronunciation scoring.
- Review type union có `matching`, `memory`, `listenAndChoose`, nhưng registry chỉ implement
  `memory`; không coi hai type còn lại là đã hỗ trợ.
- Theme `light`, `dark`, `system` đã hoạt động. `appLanguage` được lưu nhưng chưa localize toàn
  bộ app.
- `learningScope.minAge` có helper/test nhưng child age chưa được truyền vào lesson runtime;
  không mô tả app là đã cá nhân hóa nội dung theo tuổi.
- Progress, settings và activity đều local bằng AsyncStorage; chưa có account/cloud sync.
- Reward/sticker semantics đang có open conflict giữa runtime và tests; không đổi contract hoặc
  sửa test chỉ để pass trước khi đọc mục Rewards trong `docs/project_spec.md`.

Đọc `docs/project_spec.md` trước khi thay đổi các flow trên.

## 5. TypeScript, React và styling

- Giữ TypeScript strict. Type inference được phép; annotation tường minh cần có ở shared/public
  boundaries và nơi inference không rõ.
- Không thêm `any`. Dùng type cụ thể hoặc `unknown` kèm narrowing. Legacy `any` có thể tồn tại;
  chỉ dọn phần liên quan trực tiếp nếu an toàn, không biến task nhỏ thành cleanup toàn repo.
- Dùng functional components. Chỉ dùng hooks khi component thật sự cần state/effect/context.
- UI mới hoặc UI được chỉnh sửa phải ưu tiên tokens trong `src/theme/`.
- Khi style phụ thuộc theme colors, dùng `createThemedStyles` và gọi `useThemeSync` trong
  component. `StyleSheet.create` chỉ phù hợp cho static, theme-independent styles.
- Inline styles chỉ dùng cho giá trị runtime/dynamic khó biểu diễn bằng stylesheet.
- Không thêm hardcoded app-theme colors. Brand colors, asset palettes, transparent và native
  integration constants là ngoại lệ có chủ ý và nên được ghi chú khi không rõ.
- Không thêm styling framework hoặc runtime dependency mới nếu task không thực sự cần. Nếu cần
  dependency, nêu lý do và cập nhật đồng bộ `package.json` + `package-lock.json`; không hand-edit
  lockfile và không cập nhật legacy `yarn.lock` nếu người dùng không yêu cầu Yarn.
- Route mới/đổi params phải cập nhật navigator, `RootStackParamList` và call sites.
- Persisted data mới phải có default, normalization/backward compatibility và test phù hợp.

## 6. Lesson và scene authoring

Trước khi tạo hoặc sửa lesson, đọc `src/data/README.md` và dùng shared types/helpers:

- `src/types/lesson.ts`
- `src/data/lessonAuthoring.ts`
- `src/data/learningModes.ts`
- `src/data/lessonValidation.ts`
- `src/data/themeValidation.ts`

Quy tắc bắt buộc:

- Một lesson pack trên một file trong `src/data/lessons/`, rồi đăng ký trong catalog.
- Giữ ID duy nhất và ổn định cho theme, lesson, scene, object, drop zone, vocabulary và step.
- Ưu tiên `imageAsset`, `rect`, `learningObject`, `characterObject`, `listenStep`, `tapStep`,
  `dragStep` thay vì tự dựng object shape lặp lại.
- Vietnamese instruction/feedback phải là tiếng Việt; đặt English trong vocabulary hoặc
  `promptText` để English audio đọc đúng phần.
- Mọi reference (`vocabId`, target object, correct objects, drop zone, next step) phải tồn tại.
- Không hand-edit `src/data/audioManifest.ts`; dùng audio script khi pipeline task cho phép.
- `GeneratedAudioRegistry.ts` hiện cố ý để trống cho R2-first runtime. Generator giữ nguyên file
  này theo mặc định; chỉ dùng `--write-bundled-registry` khi task chủ động đổi delivery model.
- Khi thêm lesson, cập nhật theme order nếu cần và giữ invariant được kiểm tra trong
  `__tests__/lessonValidation.test.ts`.

## 7. Asset và generated files

### Images

- Source of truth: `src/assets/source/master/lessons/<lesson>/<scene>/images/*.png`.
- Raw/chroma generation inputs: `src/assets/source/lessons/`.
- `src/assets/lessons/**/images/*.webp`, `src/assets/asset-manifest.json` và
  `src/config/generatedAssetRelease.ts` là generated output; không sửa tay.
- Runtime lesson images hiện R2-first. `src/engine/AssetRegistry.ts` dùng remote URL và React
  Native `Image.prefetch`; bundled lesson image registry hiện trống.
- Bundled UI icons/mascot không thuộc lesson image pipeline. Kid-facing map-lock audio nằm trong
  `src/assets/ui/audio/`, được Google TTS generator tạo và đăng ký qua generated
  `src/engine/GeneratedUiAudioRegistry.ts`; không sửa registry này bằng tay.

### Audio

- English production audio dùng các key immutable theo accent/release:
  `src/assets/lessons/<lesson>/<scene>/audio/{en-US,en-GB}/neural2-c-r1/`.
  Thư mục `audio/en/` là legacy en-US để giữ compatibility, không phải output production mới.
  Vietnamese prompt audio tiếp tục nằm trong `audio/vi/`.
- `src/data/audioManifest.ts` được tạo/cập nhật bởi audio script; không sửa tay.
- `src/data/englishAudioGenerationManifest.json` là provenance generated cho English audio;
  không sửa tay.
- `src/engine/GeneratedAudioRegistry.ts` hiện cố ý để trống để lesson audio không bị bundle.
  `generateMissingAudio.mjs` giữ file này nguyên trạng, kể cả `--manifest-only`, trừ khi truyền
  `--write-bundled-registry` một cách có chủ ý.
- `GeneratedUiAudioRegistry.ts` là ngoại lệ chỉ cho các prompt khóa trên Kid Mode map; generator
  luôn cập nhật registry nhỏ này sau khi full-corpus audit pass để phản hồi khóa phát ngay từ app.
- English production dùng `en-US-Neural2-C` và `en-GB-Neural2-C`, LINEAR16 mono 24 kHz,
  speaking rate `0.9`, không trim silence. Manifest chỉ được publish sau khi audit đủ cả hai
  accent và toàn bộ Vietnamese target hiện hành.
- Release English đã publish được khóa bằng provenance: generator từ chối `--force`, config/voice
  drift hoặc SHA mismatch trên key đã publish. Muốn thay bytes phải dùng `--audio-release` mới.
- Runtime thử English audio theo thứ tự accent được chọn, en-US mặc định, rồi legacy `audio/en/`
  trước khi dùng TTS best-effort.
- Lesson audio hiện ưu tiên R2; native short SFX (`tap`, `correct`, `wrong`, ...) vẫn bundled.
- Luôn chạy dry-run trước và đọc cả `Missing files` lẫn `Invalid files`; exit code `0` của dry-run
  không có nghĩa là corpus đã đầy đủ. Generate thật cần Google TTS auth, tạo file và có thể dùng
  network.

Chi tiết đầy đủ nằm trong `src/data/README.md` và `docs/asset-pipeline.md`.

## 8. Native boundaries

### `SkidsAudio` - Android và iOS

Module này xử lý bundled SFX, URI playback, voice recording, metering và record permission.
Khi đổi public contract phải đồng bộ:

- TypeScript: `src/engine/NativeAudioAdapter.ts`, `src/engine/VoiceRecorder.ts` và call sites.
- Android: `android/app/src/main/java/com/seduforge/skidsenglish/audio/` và registration.
- iOS: `ios/SKidsEnglish/SkidsAudio.swift`, `ios/SKidsEnglish/SkidsAudio.m`.
- Android/iOS permissions nếu capability thay đổi.

### `SkidsAssetCache` - hiện chỉ Android

- JavaScript boundary: `src/engine/AssetCacheManager.ts`.
- Android implementation: `android/app/src/main/java/com/seduforge/skidsenglish/assets/`.
- Chưa có Swift/iOS implementation. Khi module vắng, JS trả remote URL để native audio phát
  trực tiếp.
- Current JS call sites dùng native disk cache/prefetch cho lesson audio. Images dùng
  `Image.prefetch`, không đi qua `SkidsAssetCache`.
- Không yêu cầu sửa iOS cho caller/config-only change. Chỉ đồng bộ platform khi thay native
  bridge contract hoặc khi task chủ động thêm iOS parity.

Không tuyên bố offline support hoặc iOS asset-cache parity nếu chưa triển khai và kiểm tra.

## 9. Persistence và notifications

Bốn local stores hiện tại:

- `@skidsenglish/parent-settings/v1` qua `ParentSettingsManager.ts`.
- `@skidsenglish/progress/v1` qua `ProgressManager.ts`.
- `@skidsenglish/daily-activity/v1` qua `DailyActivityTracker.ts`.
- `@skidsenglish/cloud-progress-sync-state/v1` qua `CloudProgressSyncState.ts`, gồm checkpoint
  cloud progress và metadata cooldown/backoff cho sync.

Không đổi hoặc xóa key versioned nếu chưa có migration/compatibility plan. Normalizer phải chịu
được dữ liệu thiếu field từ version cũ.

Daily reminder dùng Notifee qua `src/services/NotificationService.ts`, notification id
`daily-reminder`, và được cancel/recreate khi đổi giờ. Thay đổi reminder cần kiểm tra permission,
schedule, cancel và reschedule; native behavior phải được báo là chưa test nếu không có thiết bị.

## 10. Verification theo phạm vi

Chạy commands từ repository root. Không tuyên bố pass nếu command chưa chạy.

### Documentation-only

- Kiểm tra path/symbol/version được nhắc tới tồn tại.
- Không còn machine-specific link hoặc secret.
- Chạy `git diff --check`.

### TypeScript/React logic

- `npx tsc --noEmit`
- `npm run lint`
- Targeted Jest tests liên quan.
- Với shared engine, data, progress, navigation hoặc cross-cutting change, chạy thêm
  `npm test -- --runInBand`.

### Lesson/data

- `npm test -- --runInBand __tests__/lessonValidation.test.ts`
- `npm run generate:audio:dry-run` nếu thay vocabulary/prompt/audio references.
- Sau đó chạy full Jest suite.

### Images

- `npm run assets:audit -- --lesson=<lesson-id>`
- `npm run assets:build -- --lesson=<lesson-id>`
- `npm run assets:verify -- --lesson=<lesson-id>`
- `npm run check:images`
- Chỉ chạy `npm run upload:r2:dry-run -- --lesson=<lesson-id>` khi task cần so sánh với R2 và
  việc đọc credentials/kết nối network nằm trong phạm vi được phép. Nếu không, báo `not run` và
  lý do; bốn image checks phía trên vẫn là local checks.

### Native/app

- Chạy TypeScript/lint/tests liên quan trước.
- Ưu tiên build-only command phù hợp với môi trường, ví dụ
  `./android/gradlew -p android assembleDebug` cho Android hoặc `xcodebuild ... build` cho iOS.
- `npm run android` và `npm run ios` là `react-native run-*`: có thể build, cài và launch app.
  Chỉ chạy chúng khi device/simulator side effect nằm trong phạm vi task.
- Nếu không build/test được platform hoặc device behavior, ghi rõ `not run` và lý do.

Nếu check thất bại, phân biệt lỗi mới với baseline có sẵn bằng targeted runs/diff; không sửa lỗi
không liên quan nếu người dùng không yêu cầu. Báo command, pass/fail và lỗi còn lại.

## 11. Safety và external side effects

- Không in, copy, commit hoặc làm lộ `.env`, API keys, access tokens, keystore/signing secrets.
  Dùng `.env.example` để biết tên biến. Chỉ đọc `.env` khi task thực sự yêu cầu và không xuất giá
  trị ra log/response.
- Không chạy `npm run generate:audio`, `npm run upload:r2`,
  `npm run r2:clear -- --apply` hoặc thao tác thay đổi dịch vụ bên ngoài nếu người dùng chưa
  yêu cầu/cho phép rõ ràng. `npm run upload:r2` đã bao gồm `--apply`.
- `npm run upload:r2:dry-run` không ghi R2 nhưng vẫn tự đọc `.env`, yêu cầu R2 credentials,
  kết nối network và đọc remote manifest. Không chạy chỉ vì tên là dry-run nếu các quyền đó chưa
  nằm trong phạm vi task.
- R2 clear có apply còn cần confirmation chính xác do dry-run in ra
  (`--confirm=<bucket>:<prefix>` hoặc `--confirm-bucket=<bucket>`); không tự tạo confirmation.
- Không xóa cache/bucket, reset progress hoặc thay đổi dữ liệu thiết bị ngoài phạm vi task.
- Giữ nguyên unrelated user changes; không dùng destructive git commands.
- Không stage, commit, push hoặc tạo PR nếu người dùng không yêu cầu.

## 12. Hoàn tất task

Trước khi bàn giao:

1. Xem lại diff và `git status` để chắc chắn chỉ có thay đổi đúng phạm vi.
2. Chạy verification phù hợp ở mục 10.
3. Cập nhật `docs/project_spec.md` nếu thay đổi chạm các trigger ở mục 1.
4. Ghi rõ file đã đổi, hành vi chính, commands đã chạy và giới hạn chưa kiểm tra.
5. Không nói task hoàn tất khi còn phần bắt buộc chưa làm hoặc lỗi mới chưa được xử lý.
