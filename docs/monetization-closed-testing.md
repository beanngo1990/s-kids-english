# Phase 3 - Monetization closed testing

**Ngày cập nhật:** 2026-07-17

**Phạm vi:** checklist và evidence cho RevenueCat Test Store, Apple sandbox/TestFlight, Google
Play closed testing, Founder Premium và account deletion. Tài liệu này không phải bằng chứng rằng
giao dịch sandbox/store thật đã chạy.

## 1. Nguyên tắc evidence

- `PASS`: có bằng chứng local hoặc device cụ thể được ghi trong bảng.
- `BLOCKED`: thiếu prerequisite nên chưa thể chạy test một cách hợp lệ.
- `NOT RUN`: prerequisite có thể đã có nhưng kịch bản chưa được thực hiện hoặc chưa có evidence.
- `MANUAL`: script local không thể xác minh trạng thái console, IAM, certificate hoặc external
  service.
- Không đổi `founder_premium_campaign_enabled` trên production trong Phase 3. Local fallback phải
  là `false`; published value trên Firebase phải được người có quyền console kiểm tra riêng.
- Không ghi API key, secret, raw receipt, Firebase UID, child profile hoặc store account vào file
  evidence. Dùng scenario alias như `ios-sandbox-01`/`android-license-01`.

Chạy preflight chỉ đọc từ repository root:

```bash
npm run monetization:audit:closed-testing
```

Script chỉ đọc source/config công khai và kiểm tra **sự tồn tại** của file signing/secret local;
không đọc nội dung `keystore.properties`, keystore hoặc `.secret.local`, và không in key/project
ID. Nếu module Test Store local tồn tại, script chỉ kiểm tra giá trị public có prefix `test_` và
không in giá trị đó. Exit code là `1` khi còn `BLOCKED`; đó là hành vi dự kiến trước khi external
setup hoàn tất.

## 2. Trạng thái hiện tại

| Hạng mục                                          | Trạng thái | Evidence/ghi chú hiện tại                                                                                                             |
| ------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase native config Android/iOS                | PASS       | File target tồn tại và được nối vào Gradle/Xcode project. Không suy ra Firebase Console đã đúng.                                      |
| RevenueCat React Native SDK cho Test Store        | PASS       | Lockfile resolve `react-native-purchases` mới hơn minimum `9.5.4` của Test Store.                                                     |
| RevenueCat public production keys                 | BLOCKED    | `src/config/monetization.ts` chưa có iOS/Android public SDK key.                                                                      |
| Test Store debug-only channel isolation           | PASS       | Metro chỉ resolve module local bị ignore cho debug; release luôn dùng tracked empty fallback.                                         |
| Local RevenueCat Test Store key                   | BLOCKED    | File `src/config/revenueCatTestStoreKey.local.ts` chưa tồn tại nên chưa chạy được Test Store.                                         |
| Test Store release/runtime guard                  | PASS       | Resolver và key selector tests xác minh release fallback, đồng thời reject `test_` khi `__DEV__` false.                               |
| Privacy Policy và Terms URLs                      | BLOCKED    | Hai public HTTPS URL chưa được cấu hình.                                                                                              |
| Firebase project selection                        | BLOCKED    | Repository chưa có `.firebaserc` đã review. Không deploy chỉ bằng phỏng đoán project ID.                                              |
| Functions secret/IAM/deploy                       | NOT RUN    | Code có parameter/Secret Manager binding; deployed secret, IAM, App Check registration và deployment chưa được audit từ service thật. |
| Founder campaign local fallback                   | PASS       | Client default và initial snapshot đều `false`.                                                                                       |
| Founder campaign published production value       | MANUAL     | Phải kiểm tra Firebase Console vẫn là `false`; local source không chứng minh remote state.                                            |
| Android release signing prerequisites             | PASS       | Ignored upload keystore/properties và Gradle release wiring hiện diện; script không đọc credentials. Signed AAB vẫn cần build/verify. |
| iOS In-App Purchase target capability             | PASS       | Xcode project bật In-App Purchase và có development team. Distribution signing vẫn cần kiểm tra trong Apple account.                  |
| RevenueCat Test Store transaction matrix          | BLOCKED    | Debug channel đã an toàn nhưng chưa có local Test Store key và chưa chạy giao dịch thật.                                              |
| Apple sandbox/TestFlight trên physical device     | NOT RUN    | Chưa có evidence product, sandbox account, build và device run.                                                                       |
| Google Play closed testing trên physical device   | NOT RUN    | Chưa có evidence closed-track build, tester opt-in và device run.                                                                     |
| Deployed 550-call concurrency/App Check rejection | NOT RUN    | Local unit/emulator không thay thế callable staging có Auth/App Check thật.                                                           |

`PASS` ở bảng trên chỉ nói về prerequisite/source local được chỉ rõ. Nó không phải store approval,
không phải RevenueCat dashboard validation và không phải device purchase evidence.

Preflight local ngày 2026-07-17 hiện báo **10 PASS / 6 BLOCKED / 5 MANUAL** và exit `1` đúng dự
kiến. Targeted guard tests cho resolver/key selection pass; chưa có giao dịch Test Store thật.

### Local execution evidence - 2026-07-17

| Check                                     | Kết quả                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| TypeScript                                | PASS                                                                                       |
| ESLint                                    | PASS, 0 errors; 26 baseline warnings                                                       |
| Full Jest                                 | PASS, 183 tests trong 24 suites                                                            |
| Functions unit                            | PASS, 20 tests; gồm missing Auth và pure 550/500 matrix                                    |
| Firestore rules                           | PASS                                                                                       |
| Founder quota/outbox/deletion emulator    | PASS; transaction smoke 10/12, retry/idempotency và deletion race                          |
| Test Store debug/release resolver bundles | PASS; debug marker hiện diện, release marker vắng dù local module tồn tại trong test       |
| Android Debug build                       | PASS                                                                                       |
| iOS Simulator arm64 build                 | PASS                                                                                       |
| Android Kid Mode visual smoke             | PARTIAL; Home/game không hiển thị giá/store, Parent Gate chưa chạy vì emulator mất kết nối |

Các kết quả trên là local/source evidence. Chúng không thay đổi trạng thái `NOT RUN` của Test
Store transaction, Apple sandbox/TestFlight, Google closed track hoặc deployed staging.

## 3. Local automation trước device testing

Chạy theo thứ tự sau và lưu command, timestamp cùng exit code. Không copy secret hoặc raw response
vào evidence.

```bash
npm run monetization:audit:closed-testing
npm test -- --runInBand __tests__/monetizationConfig.test.ts __tests__/revenueCatTestStoreResolver.test.js
npx tsc --noEmit
npm run lint
npm test -- --runInBand
npm run functions:test
npm run test:founder-quota
npm run test:firestore-rules
./android/gradlew -p android assembleDebug
```

Nếu môi trường iOS sẵn sàng, chạy thêm build-only với scheme `SKidsEnglish`. Local automation cần
bao phủ purchase success/no-entitlement, cancel, pending, lỗi store/network, restore, logout/account
switch, expiration/refund boundary, giữ progress, campaign disabled/expired/sold-out, worker retry,
idempotency và quota 550/500.

Phân biệt ba tầng bằng chứng:

1. Pure/unit test xác minh mapping và state machine.
2. Emulator test xác minh Firestore transaction/rules với project `demo-*`.
3. Sandbox/closed-track test xác minh SDK, store sheet, receipt, RevenueCat CustomerInfo và lifecycle
   thật. Hai tầng đầu không được dùng để tuyên bố tầng thứ ba đã pass.

## 4. RevenueCat Test Store

RevenueCat Test Store hoạt động với React Native SDK từ `9.5.4`, dùng key bắt đầu bằng `test_`, và
có thể mô phỏng purchase success, failure hoặc cancel; subscription renew/expire nhanh hơn
production. RevenueCat cảnh báo không bao giờ submit app chứa Test Store key. Xem
[RevenueCat Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store).

### Prerequisites

- RevenueCat Project riêng của SKidsEnglish có entitlement `premium`, Offering `default`, packages
  `MONTHLY`, `ANNUAL`, `LIFETIME` và Test Store products tương ứng.
- Debug bundle dùng module local bị ignore; release bundle luôn resolve tracked empty fallback và
  chỉ dùng `appl_`/`goog_`. Runtime cũng từ chối `test_` khi `__DEV__` là `false`.
- Sandbox Testing Access trong RevenueCat cho phép đúng test App User IDs.
- Dùng Firebase test parent account riêng; Firebase UID vẫn là RevenueCat App User ID.

Tạo file local (file này đã nằm trong `.gitignore`):

```ts
export const revenueCatTestStoreApiKey =
  '<RevenueCat public Test Store key beginning with test_>';
```

Thay placeholder bằng public Test Store key thật, không dùng RevenueCat secret API key. Sau khi tạo
hoặc đổi file, dừng Metro cũ rồi chạy lại:

```bash
npm start -- --reset-cache
```

Sau đó chạy lại preflight. Mục `RevenueCat Test Store local key` chỉ chuyển `PASS` nếu assignment
có prefix `test_`; script không in giá trị. Không thêm file local vào Git và không copy Test Store
key sang `revenueCatAppleApiKey`/`revenueCatGoogleApiKey`.

### Matrix phải ghi evidence

| Scenario                              | Expected                                                                                                      | Trạng thái |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| Monthly success                       | Store modal thành công, `CustomerInfo.entitlements.active.premium` active, nội dung Premium mở sau adult gate | NOT RUN    |
| Annual success                        | Cùng entitlement; UI render package metadata từ RevenueCat                                                    | NOT RUN    |
| Lifetime success                      | Entitlement active, UI không mô tả auto-renew                                                                 | NOT RUN    |
| User cancel                           | Không mở entitlement, không hiện lỗi mua thất bại gây hoảng                                                   | NOT RUN    |
| Simulated failure                     | Giữ free access, CTA retry được, không mất progress                                                           | NOT RUN    |
| Success nhưng entitlement mapping sai | Không mở Premium; báo trạng thái cấu hình/refresh an toàn                                                     | NOT RUN    |
| Accelerated expiration                | Khóa Premium ở boundary tiếp theo, giữ XP/sticker/progress                                                    | NOT RUN    |
| Account switch/logout                 | Không leak snapshot Premium sang account khác                                                                 | NOT RUN    |

Test Store là bước sớm cho app logic, không thay thế interrupted/pending payment, platform restore,
banking round-trip, refund và store subscription state trên Apple/Google sandbox.

## 5. Apple sandbox và TestFlight

Apple sandbox dùng product thật từ App Store Connect nhưng không charge; development-signed app và
TestFlight đều chạy IAP trong sandbox. Xem
[Testing In-App Purchases with sandbox](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox)
và
[Testing subscriptions and IAP in TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testing-subscriptions-and-in-app-purchases-in-testflight).

### Prerequisites

- Paid Applications Agreement/tax/banking hợp lệ; App Store Connect có đúng ba product IDs và một
  subscription group cho monthly/annual.
- Products map vào RevenueCat Offering/entitlement và app dùng public key `appl_`.
- Sandbox Apple Account riêng, physical device, Developer Mode nếu development build, hoặc build
  được cài từ TestFlight.
- App Store Server Notifications V2 sandbox/production nối RevenueCat trước launch.

### Physical-device matrix

| Scenario                              | Expected                                                                   | Trạng thái |
| ------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| Monthly/annual/lifetime purchase      | Giá/currency đúng storefront; RevenueCat active `premium`                  | NOT RUN    |
| Cancel/interrupted/Ask to Buy         | Không mở Premium trước transaction thành công; flow retry được             | NOT RUN    |
| Restore sau reinstall                 | Đúng Firebase account nhận lại entitlement theo RevenueCat transfer policy | NOT RUN    |
| Restore khi đổi account               | Không leak access; UI giải thích kết quả normalized                        | NOT RUN    |
| Auto-renew off/accelerated expiration | Active tới expiry rồi khóa ở boundary, giữ progress                        | NOT RUN    |
| Billing retry/grace                   | CustomerInfo phản ánh state; access theo entitlement thật                  | NOT RUN    |
| Refund/revoke                         | CustomerInfo update khóa Premium, giữ dữ liệu học                          | NOT RUN    |
| Account deletion                      | Xóa cloud/RevenueCat/Auth theo thứ tự; lỗi retry giữ Auth để thử lại       | NOT RUN    |

Ghi build number, iOS/device model, storefront, scenario alias, timestamp, expected/actual và ảnh
UI không chứa account/receipt. Không ghi sandbox Apple ID/password.

## 6. Google Play closed testing

Google khuyến nghị license testers/test payment methods để kiểm tra success, decline, subscription
renewal và pending purchase. Pending chỉ được cấp quyền sau khi chuyển sang `PURCHASED`. Xem
[Test your Google Play Billing integration](https://developer.android.com/google/play/billing/test).

### Prerequisites

- Play Console có app đúng package `com.seduforge.skidsenglish`, subscription `premium` với base
  plans `monthly`/`annual`, và one-time product `premium_lifetime`.
- Products/base plans active ở test territory, map đúng RevenueCat Offering/entitlement và app dùng
  public key `goog_`.
- Signed AAB upload vào closed track; tester đã opt-in và cài app từ Google Play bằng đúng license
  tester account. Dùng physical device có Play Store.
- Google RTDN nối RevenueCat trước launch; App Check Play Integrity registration/enforcement đã
  được kiểm tra cho build phân phối.

### Physical-device matrix

| Scenario                         | Expected                                                     | Trạng thái |
| -------------------------------- | ------------------------------------------------------------ | ---------- |
| Monthly/annual/lifetime success  | Store price đúng; RevenueCat active `premium`                | NOT RUN    |
| Cancel/always-decline card       | Không mở Premium; UI retry được                              | NOT RUN    |
| Slow card approves               | Pending không mở; chỉ mở sau `PURCHASED`/CustomerInfo active | NOT RUN    |
| Slow card declines               | Pending không mở và kết thúc an toàn                         | NOT RUN    |
| App-to-banking-to-app round-trip | `singleTop` giữ flow; app refresh CustomerInfo khi quay lại  | NOT RUN    |
| Restore/reinstall/account switch | Đúng RevenueCat transfer policy, không leak account          | NOT RUN    |
| Grace/account hold/expiration    | Access theo active entitlement và khóa đúng boundary         | NOT RUN    |
| Refund and revoke                | RevenueCat update, Premium khóa, progress giữ nguyên         | NOT RUN    |
| Account deletion                 | Backend cleanup xác nhận trước khi Firebase Auth bị xóa      | NOT RUN    |

## 7. Founder Premium staging matrix

Không bật production flag để chạy bảng này. Dùng staging Firebase project/campaign riêng hoặc
emulator; production campaign luôn giữ `false` cho đến Phase 5.

| Scenario                                        | Expected                                                           | Trạng thái                    |
| ----------------------------------------------- | ------------------------------------------------------------------ | ----------------------------- |
| Missing Firebase Auth                           | Callable reject `unauthenticated`                                  | NOT RUN trên deployed staging |
| Missing/invalid App Check                       | Callable bị platform reject trước handler                          | NOT RUN trên deployed staging |
| 550 unique claims, capacity 500                 | `reservedCount` đúng 500, không có reservation thứ 501             | NOT RUN trên deployed staging |
| Same UID retry/concurrency                      | Chỉ một reservation/outbox                                         | NOT RUN trên deployed staging |
| RevenueCat timeout/423/429/5xx                  | Retry/backoff, không trả slot hoặc double grant                    | NOT RUN trên deployed staging |
| Duplicate worker event                          | `grantedCount` chỉ tăng một lần                                    | NOT RUN trên deployed staging |
| Campaign draft/paused/closed/expired/sold out   | Trả normalized status đúng                                         | NOT RUN trên deployed staging |
| Existing active Premium                         | Không dùng quota                                                   | NOT RUN trên deployed staging |
| Remote Config client on/backend off             | Backend từ chối; existing Premium không đổi                        | NOT RUN trên deployed staging |
| Account deletion khi outbox pending/leased/done | Không re-grant sau deletion; quota reservation không được tái dùng | NOT RUN trên deployed staging |

Staging evidence tối thiểu gồm Firebase project alias (không phải credential), deployed function
revision, campaign alias/capacity, test start/end time, aggregate counts và sanitized error codes.
Không lưu UID/outbox hash/RevenueCat secret trong tài liệu.

## 8. Exit criteria Phase 3

- Preflight không còn `BLOCKED`; mọi `MANUAL` external prerequisite đã được owner xác nhận.
- Local TypeScript/lint/Jest/Functions/Firestore/native builds liên quan pass ở commit chuẩn bị test.
- Test Store matrix pass với debug-only key và release artifact được scan để bảo đảm không chứa
  `test_` key.
- Apple sandbox/TestFlight và Google closed-track matrix pass trên physical devices; evidence được
  ghi theo từng build/platform.
- Restore, pending, refund/expiration và account deletion không làm mất progress hoặc mở entitlement
  trước khi RevenueCat `CustomerInfo` xác nhận.
- Staging 550/500 và Auth/App Check rejection có aggregate evidence; không dùng production campaign.
- Firebase Console xác nhận `founder_premium_campaign_enabled=false` sau toàn bộ test.

Chỉ sau các mục trên mới chuyển Phase 4. Không dùng unit test, emulator screenshot hoặc source
review làm bằng chứng rằng store purchase đã pass.
