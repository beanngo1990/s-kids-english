# Đặc tả Monetization - SKidsEnglish

**Trạng thái:** product/architecture contract hiện hành; implementation state nằm trong
`docs/project_spec.md`

**Ngày chốt:** 2026-07-16

**Phạm vi:** Premium access, RevenueCat, mua hàng trong ứng dụng, parental gate, Firebase Remote
Config và chiến dịch tặng Premium 1 năm cho nhóm người dùng đầu tiên.

Tài liệu này là contract hành vi. Trạng thái code và verification thực tế tiếp tục được ghi trong
`docs/project_spec.md`.

## 1. Mục tiêu và nguyên tắc

### Mục tiêu

- Cung cấp free tier đủ để phụ huynh và bé đánh giá trọn vẹn trải nghiệm học.
- Cung cấp ba lựa chọn Premium: một tháng, một năm và trọn đời.
- Dùng RevenueCat làm source of truth cho paid entitlement và purchase lifecycle trên iOS/Android.
- Cho phép bật chiến dịch tặng Premium 365 ngày mà không cần phát hành binary mới.
- Cho phép chốt nhóm Founder xấp xỉ bằng thời điểm RevenueCat lần đầu thấy App User ID, không dựng
  backend claim/quota khi ứng dụng vẫn chưa phát hành production.
- Giữ toàn bộ purchase opportunity sau parental gate và tách khỏi Kid Mode.
- Giữ progress/reward của bé khi Premium hết hạn hoặc phụ huynh hủy gia hạn.
- Không dùng quảng cáo, vật phẩm ngẫu nhiên, tiền ảo hoặc cơ chế gây áp lực mua hàng cho trẻ.

### Không thuộc phạm vi v1

- Web billing, mã giới thiệu, referral, gift code hoặc mua Premium tặng tài khoản khác.
- Gói trường học/lớp học hoặc nhiều child profile trong một tài khoản.
- Mua riêng từng theme/lesson.
- RevenueCat Paywalls/Customer Center UI dựng sẵn; v1 dùng UI native của ứng dụng.
- Firebase Analytics, A/B Testing hoặc RevenueCat attribution integrations.
- Đồng bộ entitlement vào `LocalProgress` hoặc `ParentSettings`.

## 2. Product contract

### Free tier

Hai lesson pack sau luôn miễn phí theo stable lesson ID:

- `morning-routine`
- `at-school`

Free access bao gồm toàn bộ scene, vocabulary, speech recording/playback, review game, XP và
reward thuộc hai lesson trên. Không cắt một lesson thành phần miễn phí và phần trả phí.

Các chức năng sau luôn miễn phí, kể cả khi Premium hết hạn:

- onboarding và parental gate;
- Parent Mode, child profile và learning settings;
- đăng nhập/đăng xuất/xóa tài khoản;
- quản lý consent cloud learning data và dữ liệu riêng tư;
- reminder, theme, app language, teacher prompt mode và English accent;
- xem progress, activity, sticker đã nhận và nội dung free tier;
- restore purchase, manage subscription, Privacy Policy, Terms và contact support.

### Premium tier

Premium access, từ verified entitlement `premium` hoặc Founder policy hợp lệ, mở:

- tất cả lesson/theme hiện có ngoài free tier;
- mọi lesson/theme Premium được bổ sung sau này;
- review, recording, reward và replay của các lesson Premium;
- với paid purchase, quyền dùng cùng tài khoản phụ huynh trên iOS/Android khi RevenueCat xác nhận
  entitlement.

Premium không bao gồm lời hứa về speech recognition, pronunciation scoring, full offline hoặc
tính năng chưa được implement. Store copy không được hứa một lịch phát hành nội dung cố định nếu
đội ngũ chưa thực sự cam kết lịch đó.

### Khi Premium hết hạn

- Không xóa hoặc giảm XP, sticker, learned words, progress hay cloud learning data.
- Sticker đã nhận vẫn xem được trong collection.
- Free lessons vẫn học/replay bình thường.
- Premium lessons bị khóa khi bắt đầu hoặc tiếp tục phiên mới.
- Một scene Premium đang mở không bị đóng giữa chừng chỉ vì CustomerInfo refresh; access change
  được áp dụng khi rời scene hoặc bắt đầu scene/review tiếp theo.
- Không tự động chuyển sang màn mua hàng trong Kid Mode.

### Giả định launch

Contract này giả định monetization có mặt trong public release đầu tiên. Internal build,
simulator, TestFlight và closed testing không tạo quyền grandfathered.

Nếu đã có production release cho phép người dùng truy cập đủ 11 lesson miễn phí, phải dừng rollout
và chốt riêng migration/grandfathering trước khi bật khóa nội dung.

## 3. Sản phẩm và mức giá

| Gói      | Loại store                 | Giá mục tiêu tại Việt Nam | Hành vi                        |
| -------- | -------------------------- | ------------------------: | ------------------------------ |
| 1 tháng  | Auto-renewing subscription |                   59.000đ | Gia hạn hàng tháng đến khi hủy |
| 1 năm    | Auto-renewing subscription |                  499.000đ | Gia hạn hàng năm đến khi hủy   |
| Trọn đời | Non-consumable             |       999.000đ khi mở bán | Mua một lần, không hết hạn     |

Giá chuẩn dự kiến của gói trọn đời là **1.299.000đ** sau giai đoạn mở bán hoặc khi catalog đạt ít
nhất ba theme có chất lượng tương đương theme đầu tiên. Việc đổi giá được thực hiện trong App Store
Connect/Google Play Console; không cần đổi product ID hay release app.

Các nguyên tắc hiển thị giá:

- App Store/Google Play là source of truth cho giá, currency, tax và availability.
- UI luôn render localized `priceString`/product metadata do RevenueCat trả về.
- Không hardcode `59.000đ`, `499.000đ` hoặc `999.000đ` làm giá giao dịch trong UI.
- Chỉ tính phần trăm tiết kiệm khi monthly và annual product dùng cùng currency và đều có dữ liệu
  giá hợp lệ.
- Không hiển thị giá gạch ngang hoặc tuyên bố giảm giá nếu store product thực tế không hỗ trợ claim
  đó tại thời điểm hiển thị.
- Annual là lựa chọn được nhấn mạnh, nhưng không được pre-purchase hoặc mở store sheet khi chưa có
  thao tác rõ ràng từ phụ huynh.
- V1 không dùng free trial hoặc introductory offer có auto-renew. Founder access 365 ngày là quyền
  local được suy ra từ RevenueCat customer metadata, không phải store trial hay granted
  entitlement.

## 4. Store và RevenueCat mapping

### Store identifiers

Current application identifiers:

- iOS bundle identifier: `com.seduforge.skidsenglish.app`.
- Android application ID: `com.seduforge.skidsenglish`.

| Nền tảng | Product                   | Identifier                                    |
| -------- | ------------------------- | --------------------------------------------- |
| iOS      | Monthly subscription      | `com.seduforge.skidsenglish.premium.monthly`  |
| iOS      | Annual subscription       | `com.seduforge.skidsenglish.premium.annual`   |
| iOS      | Lifetime non-consumable   | `com.seduforge.skidsenglish.premium.lifetime` |
| Android  | Subscription              | `premium`                                     |
| Android  | Monthly base plan         | `monthly`                                     |
| Android  | Annual base plan          | `annual`                                      |
| Android  | Lifetime one-time product | `premium_lifetime`                            |

Các identifier trên là immutable contract sau khi product được tạo. Android subscription products
được RevenueCat nhận dạng cùng base plan theo dạng tương ứng `premium:monthly` và
`premium:annual`.

### RevenueCat project

- Tạo RevenueCat Project riêng cho SKidsEnglish, dù có thể dùng cùng RevenueCat organization với
  ứng dụng khác.
- Không đặt SKidsEnglish chung Project với ứng dụng khác nếu không chủ ý chia sẻ entitlement giữa
  các ứng dụng đó.
- Entitlement identifier: `premium`.
- Current/default Offering identifier: `default`.
- Dùng standard package type `MONTHLY`, `ANNUAL`, `LIFETIME`.
- Tất cả store products/base plans ở trên map vào cùng entitlement `premium`.
- Founder access không được ghi thành RevenueCat entitlement; paid products vẫn map vào
  entitlement `premium` như trên.
- Client chỉ chứa public platform SDK key. RevenueCat secret API key chỉ tồn tại trong backend
  secret storage để xóa RevenueCat customer khi parent account bị xóa.

### Store behavior đã chốt

- Monthly và annual nằm trong cùng Apple subscription group, cùng service level.
- Android monthly và annual là hai base plan của cùng subscription `premium`.
- Apple Family Sharing để **tắt trong v1**. Đây là quyết định khó đảo ngược và hành vi không đối
  xứng với Google Play; sẽ đánh giá lại sau khi account/restore behavior ổn định.
- RevenueCat restore behavior dùng **Transfer to new App User ID**. Giao dịch có thể chuyển sang
  Firebase account hiện tại khi phụ huynh chủ động Restore, và chỉ một account giữ quyền tại một
  thời điểm.
- Không dùng legacy shared/alias restore behavior cho Project mới.
- App Store Server Notifications V2 và Google Real-time Developer Notifications phải được nối vào
  RevenueCat trước production launch.

## 5. Identity và entitlement source of truth

### Identity

- Firebase parent UID là RevenueCat custom App User ID.
- Không dùng email, tên phụ huynh, child name, birth year, advertising ID hoặc progress làm App
  User ID/customer attribute.
- Free mode không bắt buộc đăng nhập.
- Đăng nhập Firebase là bắt buộc trước purchase, restore, manage subscription hoặc mở nội dung bằng
  Founder access.
- Nếu Firebase đã restore session lúc app khởi động, configure RevenueCat với UID đó.
- Nếu chưa đăng nhập, configure RevenueCat một lần ở anonymous state; sau sign-in gọi
  `Purchases.logIn(firebaseUid)`.
- Khi sign-out gọi `Purchases.logOut()` và xóa Premium snapshot của account cũ khỏi React state.
- Khi chuyển trực tiếp account, gọi `logIn(newUid)`; không reuse entitlement snapshot của UID cũ.

Founder access không nằm trong Apple/Google receipt hay RevenueCat entitlement. Người dùng phải
đăng nhập đúng Firebase account; client đánh giá lại từ `CustomerInfo.firstSeen` của RevenueCat App
User ID đó sau khi cài lại hoặc đổi thiết bị.

### Runtime state

`MonetizationManager` phải expose một snapshot duy nhất, tối thiểu gồm:

```ts
type MonetizationStatus =
  | 'initializing'
  | 'signedOut'
  | 'free'
  | 'premium'
  | 'unavailable';
```

Snapshot còn có:

- active entitlement và expiration date nếu có;
- product/period type (`monthly`, `annual`, `lifetime`, `promotional`, `founder`);
- `willRenew` và `managementURL` nếu store cung cấp;
- current Offering/packages;
- purchase/restore pending state;
- normalized error code không chứa secret hoặc raw receipt.

`CustomerInfo.entitlements.active.premium` là source of truth cho quyền đã mua và luôn ưu tiên.
Founder access là nhánh local riêng được tính từ `CustomerInfo.firstSeen` và Remote Config; không
ghi boolean `isPremium` vào `ParentSettings`, `LocalProgress`, Firestore learning data documents
hoặc Remote Config.

### Cache, verification và lỗi mạng

- Dùng RevenueCat CustomerInfo cache để giữ quyền đã xác nhận qua lỗi mạng tạm thời.
- Gọi `getCustomerInfo()` khi app foreground và trước khi mở nội dung Premium nếu cache cần refresh.
- Subscribe CustomerInfo updates và cập nhật access state atomically.
- Trusted Entitlements verification result `FAILED` không được mở Premium.
- `VERIFIED`, `VERIFIED_ON_DEVICE` được mở Premium.
- `NOT_REQUESTED` có thể dùng `isActive` từ SDK để tránh khóa nhầm người dùng offline/legacy; phải
  log một mã kỹ thuật không chứa PII để chẩn đoán.
- Khi không có CustomerInfo cache và fetch thất bại, chỉ free tier được mở; UI cho retry thay vì
  khẳng định người dùng chưa mua.
- Không tự kéo dài entitlement ngoài hành vi cache/grace period chính thức của RevenueCat.
- Với Founder access, effective now là thời điểm muộn hơn giữa `Date.now()` và
  `CustomerInfo.requestDate`; dữ liệu ngày/config không hợp lệ phải fail closed.
- Không mô tả Premium là full offline vì lesson assets hiện vẫn R2-first.

## 6. Content access policy

Tạo pure module `src/engine/ContentAccessPolicy.ts`. Mọi entry point phải dùng cùng policy thay vì
tự kiểm tra product ID hoặc UI lock riêng lẻ.

Policy tối thiểu:

```ts
canAccessLesson(lessonId, monetizationSnapshot);
canAccessScene(lessonId, sceneId, monetizationSnapshot);
canAccessReview(lessonId, monetizationSnapshot);
```

Quy tắc:

- Hai free lesson IDs luôn trả `true`.
- Active verified/accepted `premium` entitlement trả `true` cho mọi lesson.
- `initializing` không điều hướng vào Premium target; hiển thị loading/retry.
- `signedOut`, `free` và `unavailable` chỉ mở free tier.
- Parent preview không bypass entitlement.
- Các list/map/card hiển thị lock state để giải thích sớm.
- `LessonPack`, `ScenePlayer` và `ReviewGame` vẫn kiểm tra lại khi mount/focus để chống bypass từ
  stale navigation state hoặc call site bị bỏ sót.

Stable IDs được dùng thay vì catalog index để reorder/add lesson không làm đổi free boundary.

## 7. Parental gate và navigation

Purchase opportunity, Founder information, restore và manage subscription chỉ xuất hiện sau adult
gate.
Gate v1 gồm hai bước:

1. giữ nút ba giây như flow hiện tại;
2. trả lời một phép cộng/trừ hai chữ số được random local, có hướng dẫn bằng chữ dành cho phụ huynh.

Ba lần sai liên tiếp tạo cooldown ngắn. Challenge và kết quả không persist, không upload và không
được coi là parental consent cho việc thu thập dữ liệu.

Parent access session:

- chỉ lưu trong memory;
- có hiệu lực khi Parent Mode mở và khi phụ huynh preview lesson/review trong cùng foreground
  session;
- reset khi app background, trừ thời gian OS store sheet/banking flow đang xử lý giao dịch;
- sau khi giao dịch hoàn tất/quay lại app, xử lý transaction được phép hoàn thành nhưng UI quản lý
  yêu cầu gate lại nếu session đã reset;
- không thể mở `Premium` route trực tiếp để bỏ qua gate.

Navigation contract mục tiêu:

```ts
Parent: {
  intent?: 'dashboard' | 'premium' | 'founderPromo';
  lessonId?: string;
} | undefined;
Premium: undefined;
```

`PremiumScreen` phải tự guard parent access session. Kid Mode khi chạm nội dung khóa chỉ hiển thị
copy “Hãy nhờ ba mẹ mở khóa”, sau đó mở Parent gate với intent phù hợp; không hiển thị giá hoặc
store sheet cho trẻ.

## 8. Paywall và purchase flows

### Paywall v1

Paywall là screen native dùng theme/token hiện có và RevenueCat Offering data. Screen gồm:

- Premium benefits dựa trên tính năng đã implement;
- monthly, annual và lifetime package nếu package khả dụng;
- annual được nhấn mạnh và savings được tính từ store prices khi hợp lệ;
- tổng giá, billing period và auto-renew disclosure;
- CTA mua chỉ active sau khi parent đã đăng nhập và package hợp lệ;
- Restore Purchases;
- Manage Subscription khi có `managementURL`;
- Privacy Policy, Terms và contact support;
- nút đóng/quay lại rõ ràng.

Nếu một package thiếu khỏi Offering hoặc không available tại storefront, ẩn riêng package đó.
Không dùng giá fallback để tạo purchase CTA. Nếu toàn bộ Offering thiếu, hiển thị lỗi cấu hình và
retry; không dùng product ID hardcode để purchase ngoài Offering.

### Purchase state machine

```text
idle
  -> purchasing
     -> purchased
     -> pending
     -> cancelled
     -> failed
```

- `purchased`: chỉ mở Premium khi CustomerInfo trả entitlement `premium` active.
- `pending`: thông báo store/phụ huynh còn phải duyệt; chưa mở Premium.
- `cancelled`: đóng progress UI nhẹ nhàng, không báo lỗi đỏ.
- `failed`: map lỗi store/network/configuration thành copy an toàn và cho retry.
- Disable CTA đang chạy để tránh double tap, nhưng không khóa nút close.
- App background/foreground trong banking verification không được làm purchase flow bị hủy.

Android `MainActivity` phải đổi `launchMode` từ `singleTask` sang `singleTop` trước native purchase
testing.

### Restore và manage

- `restorePurchases()` chỉ được gọi sau thao tác Restore của phụ huynh vì có thể mở OS sign-in
  prompt.
- Không tự gọi Restore lúc app launch; dùng CustomerInfo refresh cho entitlement bình thường.
- Restore thành công nhưng không có entitlement hiển thị thông báo trung tính, không nói giao dịch
  đã mất.
- Manage Subscription mở `CustomerInfo.managementURL` hoặc platform subscription management URL
  chính thức.
- Lifetime owner không thấy subscription purchase CTA.
- Active subscriber không thấy lifetime CTA để tránh mua trùng trong khi subscription vẫn gia hạn.
- Việc đổi monthly/annual trong v1 đi qua store management flow, không tự dựng proration logic.
- Người đang có promotional hoặc Founder access không được mua subscription/lifetime cho đến khi
  quyền đó hết hạn; UI hiển thị ngày hết hạn và giải thích quà không tự động gia hạn.

## 9. Chiến dịch Founder Premium 365 ngày

### Marketing contract

Copy chuẩn:

> Tài khoản phụ huynh được RevenueCat ghi nhận trước thời điểm chương trình kết thúc sẽ nhận quyền
> truy cập Premium trong 365 ngày tính từ lần đầu được ghi nhận. Không cần thông tin thanh toán,
> không tự động gia hạn và không phát sinh phí.

Không quảng cáo “500 lượt tải đầu tiên” hoặc cam kết quota chính xác 500. `firstSeen` là lúc
RevenueCat lần đầu thấy một App User ID; nó không phải số download/install tuyệt đối và có thể bị
ảnh hưởng bởi thời điểm SDK configure, anonymous identity, reinstall hoặc account merge. Admin theo
dõi số New Customers rồi publish cutoff khi lượng user đã phù hợp; kết quả chỉ xấp xỉ mục tiêu.

Không gắn quà với rating, review, share, referral hoặc thao tác marketing khác.

### Eligibility

Founder access active khi tất cả điều kiện sau đúng:

- parental gate đã mở trong app;
- Firebase parent đã đăng nhập;
- RevenueCat đã identify bằng đúng Firebase UID;
- `CustomerInfo.firstSeen` và `CustomerInfo.requestDate` là ISO date hợp lệ;
- `founder_premium_cutoff_at` là ISO UTC date hợp lệ;
- `CustomerInfo.firstSeen <= founder_premium_cutoff_at`;
- effective now còn trước `firstSeen + founder_premium_duration_days`.

Effective now là `max(Date.now(), CustomerInfo.requestDate)` để đồng hồ thiết bị không thể lùi về
trước RevenueCat response gần nhất. Đây không phải trusted time hoàn chỉnh: sau một response trước
expiry, client bị giữ offline và đồng hồ bị lùi về một thời điểm giữa `requestDate`/expiry vẫn có
thể kéo dài local access. Cutoff, firstSeen, requestDate hoặc duration thiếu/không hợp lệ đều fail
closed. Verified active RevenueCat entitlement `premium` luôn ưu tiên Founder access; khi
entitlement đó hết hạn, client có thể dùng Founder access nếu nhánh này vẫn còn hiệu lực. Nếu cần
expiry chống can thiệp tuyệt đối thì phải dùng trusted backend hoặc RevenueCat entitlement.

Đây là quyết định local trong app, không phải RevenueCat entitlement, receipt hay granted
entitlement. Client không gọi claim/status backend và không persist một boolean Founder riêng.

### Remote Config contract

| Key                            | Type    | In-app default | Ý nghĩa                                  |
| ------------------------------ | ------- | -------------- | ---------------------------------------- |
| `premium_purchase_enabled`     | Boolean | `true`         | Kill switch chỉ cho purchase mới         |
| `founder_premium_cutoff_at`    | String  | `""`           | ISO UTC cutoff; rỗng/invalid là tắt      |
| `founder_premium_duration_days`| Number  | `365`          | Số ngày từ `firstSeen`; invalid fail closed |

Các key Founder dùng global/default value, không dùng Analytics audience/personalization. Remote
Config không chứa secret, giá giao dịch hay paid entitlement.

Client gọi `fetchAndActivate()` lúc app start và khi Parent Mode/Paywall focus, với production
minimum fetch interval hợp lý, đồng thời lắng nghe update để tính lại snapshot khi cutoff đổi.

Remote Config failure:

- không làm mất verified paid entitlement đã có;
- cutoff mặc định rỗng nên Founder fail closed nếu chưa từng activate config hợp lệ;
- purchase dùng last activated/default `premium_purchase_enabled`;
- valid cached cutoff tiếp tục được dùng khi fetch tạm lỗi.

Cutoff không được xóa hoặc đổi lùi sau khi chiến dịch đóng, vì các account đủ điều kiện vẫn cần nó
để tính quyền tới ngày hết hạn cuối cùng. Với duration 365 ngày, giữ nguyên config ít nhất 365 ngày
sau `founder_premium_cutoff_at` và qua toàn bộ rollout còn hỗ trợ binary này.

Mô hình cutoff-only không tái dùng tốt cho campaign mới: đổi cutoff thành ngày tương lai sẽ làm mọi
RevenueCat customer có `firstSeen` trước đó đủ điều kiện lại. Campaign độc lập trong tương lai cần
versioned policy/ledger hoặc backend grant riêng; không overload hai key hiện tại.

### Access semantics

- Không charge và không yêu cầu payment method.
- Không auto-renew và không tự biến thành subscription.
- Hết hạn tại `firstSeen + durationDays`, không phải cutoff + duration.
- Chạy song song với store subscription nhưng verified paid entitlement được ưu tiên trong snapshot.
- Không restore sang Firebase UID khác bằng Apple/Google receipt.
- Không có quota, claim ledger, outbox, server grant hay RevenueCat promotional entitlement.

## 10. Firebase backend và security

### Client dependencies

- `react-native-purchases`
- `@react-native-firebase/remote-config`
- `@react-native-firebase/functions`
- `@react-native-firebase/app-check`

Không thêm Firebase Analytics. Remote Config v1 chỉ dùng global parameters, không dùng audience,
personalization hoặc A/B Testing. Nếu SDK/toolchain thực tế buộc thêm Analytics, phải dừng và thực
hiện privacy/Kids Category review trước khi tiếp tục.

### Backend implementation

`functions/` dùng Node.js 22, Firebase Functions v2 và Firebase Admin SDK, với package lock/tests
riêng. Backend chỉ sở hữu callable `deleteRevenueCatCustomerData` để xóa RevenueCat customer khi
xóa parent account, cùng structured operational logs không chứa raw receipt, child data hoặc
secret. Founder access không gọi Cloud Functions.

RevenueCat secret key lưu bằng Google Secret Manager/Cloud Functions secret binding. Không commit
secret vào repo, `.env`, Remote Config hay mobile binary.

`deleteRevenueCatCustomerData` chạy tại `asia-southeast1`, bật `enforceAppCheck`, lấy UID từ Firebase
Auth context và không nhận UID tùy ý từ request body. Bốn Founder functions
`claimFounderPremium`, `getFounderPremiumStatus`, `processFounderGrant` và
`reconcileFounderGrants` không còn thuộc kiến trúc và phải được xóa khỏi deployment.

### App Check

- iOS: App Attest, có DeviceCheck fallback theo support matrix thực tế.
- Android: Play Integrity.
- Callable account deletion bật `enforceAppCheck`.
- Debug provider/token chỉ dùng local/emulator và không commit.
- App Check giảm scripted abuse nhưng không chứng minh một người chỉ có một account; không thêm
  fingerprint mạnh hoặc thu thập child data để theo dõi người dùng.

### Firestore Rules

Mobile client tiếp tục chỉ có quyền owner-scoped với cloud learning data hiện tại. Founder access
không tạo Firestore campaign/claim/outbox data. Rules và tests không được mở thêm collection cho
client.

Các collection Founder legacy từng được tạo bởi build/backend cũ không tự bị xóa khi source và
Functions được dọn. Trước production phải kiểm kê rồi recursive-delete chúng bằng admin migration
có preview/xác nhận; callable account deletion mới không được giữ code legacy chỉ để làm migration.

Admin SDK bypass Rules nên IAM/service account phải dùng least privilege phù hợp.

## 11. Privacy và account deletion

### Data minimization

RevenueCat chỉ nhận:

- Firebase UID làm App User ID;
- store transaction/purchase metadata SDK cần để cung cấp dịch vụ;
- thông tin thiết bị tối thiểu SDK tự yêu cầu theo privacy documentation.

Không set RevenueCat email, display name, phone, child profile, birth year, progress, recording URI,
advertising ID hoặc attribution attributes. Không kết nối RevenueCat với third-party analytics.

Trước production release phải:

- có public Privacy Policy URL và Terms URL;
- cập nhật Privacy Policy về RevenueCat, Firebase Remote Config, Functions, App Check và dữ liệu
  purchase/account;
- cập nhật App Store App Privacy và Google Play Data Safety;
- rà soát Kids Category/Families disclosures và SDK data practices;
- cập nhật account deletion web resource theo Google Play requirements;
- hoàn thành RevenueCat/Firebase data-processing review phù hợp thị trường phát hành.

Repo hiện chưa có Privacy Policy URL hoặc Terms URL production; đây là launch blocker, không được
dùng `APP_SUPPORT_EMAIL` thay thế hai tài liệu này.

### Account deletion

Delete-account UI phải cảnh báo rõ:

- xóa account không tự hủy Apple/Google subscription;
- phụ huynh nên mở Manage Subscription để hủy gia hạn nếu muốn;
- store purchase có thể được restore sang account mới theo restore policy;
- Founder/promotional Premium không có store receipt và sẽ mất khi account/RevenueCat customer bị
  xóa.

Deletion flow:

1. hiển thị trạng thái subscription và link Manage Subscription;
2. xóa cloud learning data theo flow hiện tại;
3. backend xóa RevenueCat customer data;
4. xóa Firebase Auth account;
5. xóa local monetization/customer cache và log out RevenueCat.

Không chặn yêu cầu xóa chỉ vì subscription còn active. Xóa RevenueCat customer không hủy mobile
subscription; copy và support flow phải nói rõ điều đó.

Client hiện thực thi đúng thứ tự trên: backend chỉ trả success khi RevenueCat DELETE thành công,
được queue (`202`) hoặc customer đã không còn (`404`); nếu cleanup không được xác nhận thì Firebase
Auth account được giữ lại để phụ huynh retry. RevenueCat SDK cache/logout được dọn sau Auth deletion
và dùng một shared in-flight operation để tránh logout trùng với auth observer. Không có Founder
ledger/outbox/tombstone cần phối hợp với deletion.

## 12. Kiến trúc code mục tiêu

```text
App.tsx
  -> ParentAuthManager
  -> MonetizationManager
       -> RevenueCat SDK
       -> RemoteMonetizationConfig
       -> FounderAccessPolicy
       -> CustomerInfo listeners
  -> AppNavigator
       -> ContentAccessPolicy
       -> Parent gate/session
       -> PremiumScreen
  -> RevenueCatDataDeletion
       -> Firebase callable deleteRevenueCatCustomerData
            -> RevenueCat REST API
```

Modules/files dự kiến:

- `src/config/monetization.ts`: entitlement/offering IDs, public platform keys và free lesson IDs.
- `src/engine/MonetizationManager.ts`: configure/login/logout, CustomerInfo, Offering,
  purchase/restore/manage và snapshot subscription.
- `src/engine/ContentAccessPolicy.ts`: pure access decisions.
- `src/engine/FounderAccessPolicy.ts`: pure cutoff/duration/date validation và Founder access.
- `src/engine/ParentAccessSession.ts`: in-memory adult gate session.
- `src/services/RemoteMonetizationConfig.ts`: defaults, fetch/activate và optional listener.
- `src/screens/PremiumScreen.tsx`: custom paywall/status UI.
- `src/services/RevenueCatDataDeletion.ts`: account-deletion callable client.
- `functions/`: chỉ còn account-deletion integration.

Existing integration points tối thiểu:

- `App.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/types/navigation.ts`
- `src/screens/ParentScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/LessonListScreen.tsx`
- `src/screens/LessonPackScreen.tsx`
- `src/screens/ScenePlayerScreen.tsx`
- `src/screens/ReviewLibraryScreen.tsx`
- `src/screens/ReviewGameScreen.tsx`
- `src/components/KidPlayPanel.tsx`
- `src/components/ParentAccountCard.tsx`
- `src/i18n/dictionaries/vi.ts`
- `src/i18n/dictionaries/en.ts`
- `firestore.rules`
- `scripts/testFirestoreRules.mjs`
- Android/iOS native configuration và lockfiles.

Entitlement không được thêm vào `ProgressManager` hoặc cloud learning data payload.

## 13. Native requirements

### Android

- Đổi `MainActivity` launch mode sang `singleTop`.
- Bảo đảm Billing permission/dependency do RevenueCat SDK yêu cầu có trong merged manifest.
- Bật Play Integrity App Check production provider.
- Kiểm tra pending purchases, banking app round-trip, account hold, restore và lifetime one-time
  product trên physical device.

### iOS

- Bật In-App Purchase capability cho app target.
- Cấu hình StoreKit/App Store products, subscription group và RevenueCat credentials.
- Bật App Attest/DeviceCheck cho App Check.
- Kiểm tra Ask to Buy/pending, interrupted purchase, restore, refund, billing retry và account
  deletion copy trên sandbox/TestFlight.

Current minimums Android API 24 và iOS 15.1 đáp ứng RevenueCat SDK minimum được khảo sát tại thời
điểm chốt spec. Phiên bản dependency chính xác chỉ được ghi sau khi `npm install` và lockfile resolve.

## 14. Testing và acceptance criteria

### Unit tests

- Access matrix cho free/premium/initializing/signed-out/unavailable.
- Stable free lesson IDs không đổi khi catalog reorder.
- CustomerInfo mapping cho monthly/annual/lifetime/promotional/founder/expired/refunded.
- Trusted entitlement verification handling.
- Purchase cancel/pending/failure/success normalization.
- Login/logout/account switch không leak Premium state.
- Remote Config defaults/fetch failure/cached values.
- Founder policy: before/equal/after cutoff, expiry boundary, invalid dates/duration và device clock
  rollback qua `requestDate`.
- Verified paid entitlement luôn ưu tiên Founder access; signed-out user chưa mở nội dung.

### Backend/emulator tests

- `deleteRevenueCatCustomerData` reject Auth/App Check thiếu hoặc UID tùy ý từ request body.
- RevenueCat DELETE success/queued/not-found được normalize thành success.
- Timeout/429/5xx trả retryable result và giữ Firebase Auth account để phụ huynh thử lại.
- Firestore Rules không mở thêm campaign/claim/outbox collection cho client.

### UI/native matrix

- Kid Mode không thấy giá/store sheet.
- Mọi Premium entry point đều qua access policy và adult gate.
- Store prices/currency hiển thị đúng storefront.
- Monthly, annual, lifetime sandbox purchases mở `premium`.
- Cancel không hiện lỗi; pending chưa mở entitlement.
- App-to-banking-to-app round-trip không hủy flow trên Android.
- Restore trên reinstall/account switch đúng restore policy.
- Active founder/promo/subscription/lifetime hiển thị đúng CTA và ngày hết hạn.
- Refund/expiration giữ progress nhưng khóa content Premium ở boundary tiếp theo.
- Publish cutoff hợp lệ cập nhật Founder access không cần binary release; cutoff rỗng/invalid fail
  closed.
- Quà không yêu cầu payment và không auto-renew.

### Repository verification

Với implementation client/native:

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
./android/gradlew -p android assembleDebug
```

Chạy thêm iOS build phù hợp khi môi trường có Xcode/CocoaPods. Với backend, chạy unit/emulator tests
và `npm run test:firestore-rules`. Không tuyên bố store purchase pass nếu chưa chạy sandbox trên
thiết bị/platform tương ứng.

### Definition of done

- Ba products được approved/available ở cả hai store và map đúng `premium`.
- Giá luôn lấy từ store.
- RevenueCat CustomerInfo là source cho paid entitlement và Founder metadata.
- Adult gate bảo vệ paywall, Founder entry, restore và manage.
- Không có Premium bypass qua navigation target.
- Secret không có trong client/repo/log.
- Founder cutoff/duration có thể publish bằng Remote Config và invalid config fail closed.
- Existing paid Premium không mất khi Remote Config lỗi.
- Privacy/Terms/store disclosures và account deletion flow hoàn tất.
- TypeScript, lint, Jest, Firestore/backend tests và native builds liên quan pass.
- Sandbox/TestFlight/Play closed-track matrix được ghi nhận rõ.

## 15. Rollout plan

### Phase 0 - External setup

- Tạo RevenueCat Project/apps/entitlement/Offering/products.
- Tạo store products và subscription metadata.
- Thiết lập Firebase Blaze/Functions/App Check cho account deletion và Remote Config cho
  purchase/Founder policy.
- Chuẩn bị Privacy Policy, Terms và deletion web resource.

### Phase 1 - Foundation

- Cài SDK/dependencies và native config.
- Implement identity, CustomerInfo snapshot, access policy và strengthened parental gate.
- Implement custom Premium screen, purchase/restore/manage.
- Founder cutoff default vẫn rỗng.

### Phase 2 - Founder policy và account deletion backend

- Implement client-side Founder policy từ `firstSeen`, cutoff, duration và effective now.
- Chỉ giữ `deleteRevenueCatCustomerData`; xóa bốn Founder functions khỏi source/deployment.
- Cấu hình secret/IAM/App Check chỉ cho account deletion callable.

### Phase 3 - Closed testing

- RevenueCat Test Store/unit tests trước.
- Apple sandbox/TestFlight và Google closed testing trên physical devices.
- Test account deletion, restore, pending, refund/expiration và Founder date boundary/invalid config.
- Founder cutoff production vẫn rỗng.

### Phase 4 - Store release

- Submit IAP cùng binary đầu tiên và giải thích đầy đủ monetization/Founder policy trong review
  notes.
- Paid purchase flow hoạt động; Founder cutoff vẫn rỗng cho tới khi production health ổn định.
- Không dùng Remote Config để che purchase behavior khỏi reviewer.

### Phase 5 - Founder launch

- Theo dõi RevenueCat New Customers và xác nhận client production đang gửi `firstSeen` đúng identity.
- Trong thời gian nhận Founder, publish cutoff ở tương lai đủ gần hoặc thời điểm kết thúc dự kiến.
- Khi lượng account xấp xỉ mục tiêu, publish `founder_premium_cutoff_at` bằng UTC hiện tại và giữ
  `founder_premium_duration_days=365`.
- Giữ nguyên cutoff ít nhất tới expiry cuối cùng; không xóa key để “tắt” vì sẽ thu hồi quyền local.

### Rollback

- Nếu chưa launch, cutoff rỗng fail closed. Sau launch không rollback bằng cách xóa/đổi lùi cutoff;
  cần release policy mới nếu config sai đã ảnh hưởng người dùng.
- `premium_purchase_enabled=false`: dừng purchase mới, vẫn giữ CustomerInfo, restore/manage và
  quyền đã mua.
- Rollback không xóa transaction, entitlement hoặc progress.

## 16. External prerequisites còn thiếu

Các giá trị sau không được đoán hoặc commit trong spec:

- RevenueCat Project ID, public iOS/Android SDK keys và secret API key dùng cho account deletion;
- App Store Connect/Google Play product approval và territory availability;
- Firebase production Remote Config values; account-deletion Function, Secret Manager value/IAM
  và App Check registrations;
- public Privacy Policy URL, Terms URL và account-deletion URL;
- final store tax category, seller/business metadata và localized subscription copy.

Những mục này là configuration/launch prerequisites, không thay đổi product contract ở trên.

## 17. Official references

- RevenueCat: [Entitlements](https://www.revenuecat.com/docs/getting-started/entitlements),
  [Offerings](https://www.revenuecat.com/docs/offerings/overview),
  [React Native SDK](https://www.revenuecat.com/docs/getting-started/installation/reactnative),
  [CustomerInfo](https://www.revenuecat.com/docs/customers/customer-info),
  [Restore behavior](https://www.revenuecat.com/docs/projects/restore-behavior),
  [Developer API](https://www.revenuecat.com/docs/api-v2).
- Firebase: [Remote Config parameters](https://firebase.google.com/docs/remote-config/parameters),
  [Callable Functions](https://firebase.google.com/docs/functions/callable),
  [App Check](https://firebase.google.com/docs/app-check).
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
  [Kids guidance](https://developer.apple.com/kids/),
  [In-App Purchase](https://developer.apple.com/in-app-purchase/).
- Google Play: [Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738),
  [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335),
  [Play Billing integration](https://developer.android.com/google/play/billing/integrate).
