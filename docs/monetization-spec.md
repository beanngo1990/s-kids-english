# Đặc tả Monetization - SKidsEnglish

**Trạng thái:** product/architecture contract đã chốt, chưa được implement

**Ngày chốt:** 2026-07-16

**Phạm vi:** Premium access, RevenueCat, mua hàng trong ứng dụng, parental gate, Firebase Remote
Config và chiến dịch tặng Premium 1 năm cho nhóm người dùng đầu tiên.

Tài liệu này mô tả hành vi mục tiêu để triển khai. Nó không thay đổi trạng thái implementation
hiện tại trong `docs/project_spec.md`. Khi code tương ứng được triển khai, phải cập nhật
`docs/project_spec.md` trong cùng task.

## 1. Mục tiêu và nguyên tắc

### Mục tiêu

- Cung cấp free tier đủ để phụ huynh và bé đánh giá trọn vẹn trải nghiệm học.
- Cung cấp ba lựa chọn Premium: một tháng, một năm và trọn đời.
- Dùng RevenueCat làm source of truth cho entitlement và purchase lifecycle trên iOS/Android.
- Cho phép bật chiến dịch tặng Premium 365 ngày mà không cần phát hành binary mới.
- Giới hạn chính xác quota chiến dịch trên backend, kể cả khi nhiều người claim đồng thời.
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
- quản lý consent cloud progress và dữ liệu riêng tư;
- reminder, theme, app language, teacher prompt mode và English accent;
- xem progress, activity, sticker đã nhận và nội dung free tier;
- restore purchase, manage subscription, Privacy Policy, Terms và contact support.

### Premium tier

Entitlement `premium` mở:

- tất cả lesson/theme hiện có ngoài free tier;
- mọi lesson/theme Premium được bổ sung sau này;
- review, recording, reward và replay của các lesson Premium;
- quyền dùng cùng tài khoản phụ huynh trên iOS/Android khi RevenueCat xác nhận entitlement.

Premium không bao gồm lời hứa về speech recognition, pronunciation scoring, full offline hoặc
tính năng chưa được implement. Store copy không được hứa một lịch phát hành nội dung cố định nếu
đội ngũ chưa thực sự cam kết lịch đó.

### Khi Premium hết hạn

- Không xóa hoặc giảm XP, sticker, learned words, progress hay cloud progress.
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
- V1 không dùng free trial hoặc introductory offer có auto-renew. Quà 365 ngày là granted
  entitlement riêng, không phải store trial.

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
- Granted entitlement của chiến dịch cũng cấp chính entitlement `premium`.
- Client chỉ chứa public platform SDK key. RevenueCat secret API key chỉ tồn tại trong backend
  secret storage.

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
- Đăng nhập Firebase là bắt buộc trước purchase, restore, manage subscription hoặc claim quà.
- Nếu Firebase đã restore session lúc app khởi động, configure RevenueCat với UID đó.
- Nếu chưa đăng nhập, configure RevenueCat một lần ở anonymous state; sau sign-in gọi
  `Purchases.logIn(firebaseUid)`.
- Khi sign-out gọi `Purchases.logOut()` và xóa Premium snapshot của account cũ khỏi React state.
- Khi chuyển trực tiếp account, gọi `logIn(newUid)`; không reuse entitlement snapshot của UID cũ.

Promotional entitlement không nằm trong Apple/Google receipt. Người nhận quà phải đăng nhập lại
đúng Firebase account để khôi phục quà sau khi cài lại hoặc đổi thiết bị.

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
- product/period type (`monthly`, `annual`, `lifetime`, `promotional`);
- `willRenew` và `managementURL` nếu store cung cấp;
- current Offering/packages;
- purchase/restore/claim pending state;
- normalized error code không chứa secret hoặc raw receipt.

`CustomerInfo.entitlements.active.premium` là entitlement source of truth. Không ghi boolean
`isPremium` vào `ParentSettings`, `LocalProgress`, Firestore progress document hoặc Remote Config.

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

Purchase opportunity, campaign claim, restore và manage subscription chỉ xuất hiện sau adult gate.
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
- Người đang có promotional Premium không được mua subscription/lifetime cho đến khi quà hết hạn;
  UI hiển thị ngày hết hạn và giải thích quà không tự động gia hạn.

## 9. Chiến dịch Founder Premium 365 ngày

### Marketing contract

Copy chuẩn:

> 500 tài khoản phụ huynh đủ điều kiện đầu tiên nhấn “Nhận Premium 1 năm” sau khi chương trình mở
> sẽ nhận Premium miễn phí trong 365 ngày. Mỗi tài khoản một suất, không cần thông tin thanh toán,
> không tự động gia hạn và không phát sinh phí.

Không dùng “500 lượt tải đầu tiên”. Download/install không phải identity bền vững và không thể xác
định chính xác sau khi chương trình được bật muộn.

Quota ban đầu là 500 account trên **tổng iOS và Android**, không phải 500 mỗi platform. Admin có thể
tăng capacity trên backend sau này mà không release app.

Không gắn quà với rating, review, share, referral hoặc thao tác marketing khác.

### Eligibility

Một claim hợp lệ khi tất cả điều kiện sau đúng:

- parental gate đã mở trong app;
- Firebase parent đã đăng nhập;
- RevenueCat đã identify bằng đúng Firebase UID;
- Firebase App Check token hợp lệ;
- campaign đang enabled trong Remote Config và `ready` trên backend;
- thời gian server nằm trong `startsAt`/`endsAt` nếu có;
- campaign còn capacity;
- UID chưa có claim/reservation cho campaign;
- account không có active `premium` entitlement tại thời điểm kiểm tra.

Người có active monthly, annual, lifetime hoặc promotional Premium không tiêu quota. Expired
subscriber có thể claim nếu đáp ứng các điều kiện khác và chưa claim campaign này.

### Remote Config contract

| Key                                | Type    | In-app default            | Ý nghĩa                             |
| ---------------------------------- | ------- | ------------------------- | ----------------------------------- |
| `premium_purchase_enabled`         | Boolean | `true`                    | Kill switch chỉ cho purchase mới    |
| `founder_premium_campaign_enabled` | Boolean | `false`                   | Bật visibility và server claim gate |
| `founder_premium_campaign_id`      | String  | `founder-premium-2026-v1` | Campaign đang active                |

Các key campaign phải dùng global/default value, không dùng Analytics audience/personalization.
Backend tự đọc published Remote Config template; không tin boolean hoặc campaign ID do client gửi.

Client gọi `fetchAndActivate()` lúc app start và khi Parent Mode/Paywall focus, với production
minimum fetch interval hợp lý. Campaign CTA có thể attach real-time listener chỉ trong Parent
surface nếu cần activation gần như tức thời; listener phải được tháo khi rời surface.

Remote Config failure:

- không làm mất entitlement đã có;
- campaign mặc định tắt;
- purchase dùng last activated/default `premium_purchase_enabled`;
- server vẫn là quyết định cuối cùng cho claim;
- cached CTA có thể hiện sau khi campaign hết chỗ, nhưng response `soldOut` phải cập nhật UI ngay.

Không lưu RevenueCat secret, quota authoritative, customer eligibility, entitlement hoặc giá giao
dịch trong Remote Config.

### Backend data model

```text
monetizationCampaigns/{campaignId}
  kind: "revenuecat_granted_entitlement"
  entitlementLookupKey: "premium"
  revenueCatEntitlementId: "entl..."
  status: "draft" | "ready" | "paused" | "closed"
  capacity: 500
  reservedCount: number
  grantedCount: number
  durationDays: 365
  startsAt?: Timestamp
  endsAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp

monetizationCampaigns/{campaignId}/claims/{firebaseUid}
  status: "reserved" | "granting" | "granted" | "manualReview"
  reservedAt: Timestamp
  grantedAt?: Timestamp
  expiresAt: Timestamp
  revenueCatEntitlementId: "entl..."
  revenueCatCustomerId: string
  attemptCount: number
  nextAttemptAt?: Timestamp
  lastErrorCode?: string

monetizationGrantOutbox/{stableHash}
  campaignId: string
  firebaseUid: string
  status: "pending" | "processing" | "done" | "manualReview"
  attemptCount: number
  nextAttemptAt?: Timestamp
  processAfter?: Timestamp
  leaseExpiresAt?: Timestamp

monetizationCustomerDeletionTombstones/{sha256FirebaseUid}
  status: "requested" | "deleting" | "completed"
  requestedAt: Timestamp
  updatedAt: Timestamp
  safeAfter?: Timestamp
  deletionLeaseId?: string
  deletionLeaseExpiresAt?: Timestamp
  completedAt?: Timestamp
```

RevenueCat SDK dùng lookup key `premium`, nhưng RevenueCat REST API v2 grant và
active-entitlements dùng internal entitlement ID dạng `entl...`. Campaign phải lưu cả hai và seed
script phải xác minh mapping một lần trước khi ghi Firestore; worker không resolve entitlement list
trên mỗi claim. Outbox ID là hash ổn định của campaign + Firebase UID để không lộ raw UID trong
document ID và vẫn giữ idempotency.

Deletion tombstone dùng document ID SHA-256 của Firebase UID và không lưu raw UID, email, child
data, receipt hoặc RevenueCat payload. Tombstone được tạo trước external DELETE để transaction
claim/worker fail closed; trạng thái `deleting` dùng lease ngắn để serialize callable đồng thời và
có thể recover nếu invocation crash.

Claim/campaign/outbox/tombstone documents không cho mobile client đọc hoặc ghi trực tiếp. Callable
Function trả về normalized status cần thiết cho UI.

### Claim algorithm

1. Callable `claimFounderPremium` xác thực Firebase Auth và App Check; function không nhận UID từ
   request body.
2. Backend đọc global Remote Config values và campaign document.
3. Backend xác nhận RevenueCat customer đã tồn tại và không có active `premium`.
4. Firestore transaction:
   - trả claim hiện có theo hướng idempotent;
   - kiểm tra `status`, time window và `reservedCount < capacity`;
   - tạo claim `reserved`, tăng `reservedCount` và tạo outbox trong cùng transaction.
5. Không gọi RevenueCat bên trong transaction callback vì Firestore có thể retry callback.
6. Worker lấy outbox, chuyển claim sang `granting`, rồi gọi RevenueCat API v2 grant entitlement với
   internal `revenueCatEntitlementId` và `expires_at = reservedAt + 365 ngày`.
7. Thành công: claim `granted`, outbox `done`, tăng `grantedCount` một lần.
8. App invalidate CustomerInfo cache, fetch lại và chỉ mở Premium khi entitlement active.

Response UI tối thiểu:

- `available`
- `granted`
- `processing`
- `alreadyClaimed`
- `alreadyPremium`
- `notAvailable`
- `soldOut`
- `signInRequired`
- `retryableError`

### Retry và quota safety

- RevenueCat timeout/423/429/5xx giữ reservation và retry với exponential backoff, đồng thời tôn
  trọng `Retry-After`/`backoff_ms` nếu server trả về.
- Không tự trả slot khi chưa xác minh grant chắc chắn thất bại; tránh double grant khi response bị
  mất sau khi RevenueCat đã xử lý.
- Grant `409` hoặc response bị mất phải query active entitlements lại. Chỉ finalize khi internal
  entitlement ID hiện diện và expiry chứng minh grant mong muốn; expiry không khớp chuyển ledger
  sang `manualReview` nhưng không trả reservation.
- Worker/reconciliation job kiểm tra các claim stuck.
- Chỉ admin operation có audit mới chuyển `manualReview` hoặc giải phóng reservation.
- `reservedCount` ngăn vượt capacity; `grantedCount` dùng báo cáo, không dùng một mình làm gate.
- Tắt Remote Config không thu hồi quà đã cấp.
- Hết capacity thì backend trả `soldOut`; admin sau đó tắt flag hoặc tăng `capacity`.

### Granted entitlement semantics

- Không charge và không yêu cầu payment method.
- Không auto-renew và không tự biến thành subscription.
- Hết hạn đúng `expiresAt` do backend cấp.
- Chạy song song thay vì cộng nối tiếp với store subscription; vì vậy active Premium account bị
  loại khỏi eligibility.
- Không restore sang Firebase UID khác bằng Apple/Google receipt.

## 10. Firebase backend và security

### Client dependencies dự kiến

- `react-native-purchases`
- `@react-native-firebase/remote-config`
- `@react-native-firebase/functions`
- `@react-native-firebase/app-check`

Không thêm Firebase Analytics. Remote Config v1 chỉ dùng global parameters, không dùng audience,
personalization hoặc A/B Testing. Nếu SDK/toolchain thực tế buộc thêm Analytics, phải dừng và thực
hiện privacy/Kids Category review trước khi tiếp tục.

### Backend implementation

`functions/` dùng Node.js 22, Firebase Functions v2 và Firebase Admin SDK, với package lock/tests
riêng. Backend sở hữu:

- callable claim/status;
- Firestore reservation transaction;
- outbox worker/reconciliation;
- RevenueCat secret API calls;
- RevenueCat customer deletion khi xóa parent account;
- structured operational logs không chứa raw receipt, child data hoặc secret.

RevenueCat secret key lưu bằng Google Secret Manager/Cloud Functions secret binding. Không commit
secret vào repo, `.env`, Remote Config hay mobile binary.

Các callable/worker chạy tại `asia-southeast1`. `claimFounderPremium`,
`getFounderPremiumStatus` và `deleteRevenueCatCustomerData` bật `enforceAppCheck`; Firestore create
trigger dùng lease và scheduled reconciliation chạy mỗi 5 phút. Remote Config backend đọc
published client template default/global values và fail closed; conditional value không được dùng
cho campaign gate.

Repository có seed script an toàn cho `founder-premium-2026-v1`, mặc định dry-run, từ chối
overwrite campaign đã tồn tại và xác minh internal RevenueCat entitlement trước khi `--apply`.
Implementation task không đồng nghĩa campaign thật đã được seed/deploy hoặc secret/IAM/App Check
production đã được cấu hình.

### App Check

- iOS: App Attest, có DeviceCheck fallback theo support matrix thực tế.
- Android: Play Integrity.
- Callable claim bật `enforceAppCheck`.
- Debug provider/token chỉ dùng local/emulator và không commit.
- App Check giảm scripted abuse nhưng không chứng minh một người chỉ có một account; không thêm
  fingerprint mạnh hoặc thu thập child data để theo dõi người dùng.

### Firestore Rules

Mobile client tiếp tục chỉ có quyền owner-scoped với cloud progress hiện tại. Explicit tests phải
chứng minh client không thể:

- đọc/ghi campaign counter;
- tạo/sửa claim;
- ghi outbox;
- tăng capacity hoặc đổi status;
- claim thay UID khác.

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
- promotional Premium không có store receipt và sẽ mất khi account/RevenueCat customer bị xóa.

Deletion flow:

1. hiển thị trạng thái subscription và link Manage Subscription;
2. xóa cloud progress theo flow hiện tại;
3. backend xóa RevenueCat customer data;
4. xóa Firebase Auth account;
5. xóa local monetization/customer cache và log out RevenueCat.

Không chặn yêu cầu xóa chỉ vì subscription còn active. Xóa RevenueCat customer không hủy mobile
subscription; copy và support flow phải nói rõ điều đó.

Campaign reservation đã dùng không được tự trả lại quota sau account deletion. Nếu cần giữ bằng
chứng chống double counting, backend chỉ giữ tombstone tối thiểu theo retention policy đã công bố;
không giữ email, child data hoặc raw purchase data.

Backend hiện tạo tombstone trước khi tìm ledger, chặn reservation và outbox worker mới, đồng thời
chuyển claim/outbox chưa hoàn tất sang `manualReview`. Nếu worker đang giữ lease, deletion trả
`retryableError` cho tới safe boundary để grant đang bay không thể tạo lại RevenueCat customer sau
DELETE. Sau khi RevenueCat xác nhận xóa, backend scrub mọi outbox/claim chứa raw Firebase UID, kể
cả orphan claim không còn outbox; campaign counters vẫn giữ nguyên và tombstone hashed chuyển sang
`completed`. Concurrent/repeated deletion được serialize bằng lease và idempotent.

Client hiện thực thi đúng thứ tự trên: backend chỉ trả success khi RevenueCat DELETE thành công,
được queue (`202`) hoặc customer đã không còn (`404`); nếu cleanup không được xác nhận thì Firebase
Auth account được giữ lại để phụ huynh retry. RevenueCat SDK cache/logout được dọn sau Auth deletion
và dùng một shared in-flight operation để tránh logout trùng với auth observer.

## 12. Kiến trúc code mục tiêu

```text
App.tsx
  -> ParentAuthManager
  -> MonetizationManager
       -> RevenueCat SDK
       -> RemoteMonetizationConfig
       -> CustomerInfo listeners
  -> AppNavigator
       -> ContentAccessPolicy
       -> Parent gate/session
       -> PremiumScreen
       -> FounderPremiumManager
            -> Firebase callable Function
                 -> Firestore transaction/outbox
                 -> RevenueCat REST API
```

Modules/files dự kiến:

- `src/config/monetization.ts`: entitlement/offering IDs, public platform keys và free lesson IDs.
- `src/engine/MonetizationManager.ts`: configure/login/logout, CustomerInfo, Offering,
  purchase/restore/manage và snapshot subscription.
- `src/engine/ContentAccessPolicy.ts`: pure access decisions.
- `src/engine/ParentAccessSession.ts`: in-memory adult gate session.
- `src/services/RemoteMonetizationConfig.ts`: defaults, fetch/activate và optional listener.
- `src/engine/FounderPremiumManager.ts`: callable claim/status client và xác nhận entitlement qua
  RevenueCat CustomerInfo.
- `src/screens/PremiumScreen.tsx`: custom paywall/status UI.
- `functions/`: claim, outbox worker, reconciliation và account-deletion integration.

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

Entitlement không được thêm vào `ProgressManager` hoặc cloud progress merge payload.

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
- CustomerInfo mapping cho monthly/annual/lifetime/promotional/expired/refunded.
- Trusted entitlement verification handling.
- Purchase cancel/pending/failure/success normalization.
- Login/logout/account switch không leak Premium state.
- Remote Config defaults/fetch failure/cached values.
- Campaign claim response mapping và idempotent retry.

### Backend/emulator tests

- Auth/App Check missing bị reject.
- Client không thể đọc/ghi campaign/claim/outbox.
- Cùng UID gọi nhiều lần chỉ dùng một reservation.
- Ít nhất 550 concurrent claim với capacity 500 không vượt `reservedCount = 500`.
- Transaction retry không gọi RevenueCat nhiều lần.
- Worker timeout/429/5xx retry và không trả slot sai.
- Duplicate worker/event không tăng `grantedCount` hai lần.
- Disabled/paused/expired/sold-out campaign trả đúng status.
- Active Premium account không dùng quota.

### UI/native matrix

- Kid Mode không thấy giá/store sheet.
- Mọi Premium entry point đều qua access policy và adult gate.
- Store prices/currency hiển thị đúng storefront.
- Monthly, annual, lifetime sandbox purchases mở `premium`.
- Cancel không hiện lỗi; pending chưa mở entitlement.
- App-to-banking-to-app round-trip không hủy flow trên Android.
- Restore trên reinstall/account switch đúng restore policy.
- Active promo/subscription/lifetime hiển thị đúng CTA và ngày hết hạn.
- Refund/expiration giữ progress nhưng khóa content Premium ở boundary tiếp theo.
- Remote Config bật/tắt campaign không cần binary release.
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
- RevenueCat CustomerInfo là entitlement source of truth.
- Adult gate bảo vệ paywall, claim, restore và manage.
- Không có Premium bypass qua navigation target.
- 500 concurrent reservations không vượt quota.
- Secret không có trong client/repo/log.
- Campaign có thể bật bằng Remote Config và backend xác nhận cùng flag.
- Existing Premium không mất khi Remote Config/claim backend lỗi.
- Privacy/Terms/store disclosures và account deletion flow hoàn tất.
- TypeScript, lint, Jest, Firestore/backend tests và native builds liên quan pass.
- Sandbox/TestFlight/Play closed-track matrix được ghi nhận rõ.

## 15. Rollout plan

### Phase 0 - External setup

- Tạo RevenueCat Project/apps/entitlement/Offering/products.
- Tạo store products và subscription metadata.
- Thiết lập Firebase Blaze/Functions/App Check/Remote Config.
- Chuẩn bị Privacy Policy, Terms và deletion web resource.

### Phase 1 - Foundation

- Cài SDK/dependencies và native config.
- Implement identity, CustomerInfo snapshot, access policy và strengthened parental gate.
- Implement custom Premium screen, purchase/restore/manage.
- Campaign flag vẫn `false`.

### Phase 2 - Backend campaign

- Implement callable, Firestore transaction, outbox worker, retry và reconciliation.
- Repository đã có seed script cho campaign `founder-premium-2026-v1` trạng thái `ready`, capacity
  `500`; chỉ chạy `--apply` sau khi có internal entitlement ID và project production.
- Code đã bật App Check enforcement/secret binding; việc tạo secret, IAM, deploy và enforcement
  production vẫn là external setup có chủ ý.

### Phase 3 - Closed testing

- RevenueCat Test Store/unit tests trước.
- Apple sandbox/TestFlight và Google closed testing trên physical devices.
- Test account deletion, restore, pending, refund/expiration và 550 concurrent claims.
- Campaign production flag vẫn `false`.

### Phase 4 - Store release

- Submit IAP cùng binary đầu tiên và giải thích đầy đủ monetization/campaign trong review notes.
- Paid purchase flow hoạt động; founder campaign vẫn tắt cho tới khi production health ổn định.
- Không dùng Remote Config để che purchase behavior khỏi reviewer.

### Phase 5 - Campaign launch

- Xác nhận campaign document `ready`, capacity/time window đúng.
- Bật `founder_premium_campaign_enabled=true` và publish Remote Config.
- Theo dõi reserved/granted/manualReview và RevenueCat customer status.
- Khi hết suất: tắt flag hoặc tăng capacity bằng admin change có audit.

### Rollback

- `founder_premium_campaign_enabled=false`: dừng claim mới, không thu hồi quà đã cấp.
- `premium_purchase_enabled=false`: dừng purchase mới, vẫn giữ CustomerInfo, restore/manage và
  quyền đã mua.
- Backend `status=paused`: chặn claim kể cả client còn cached CTA.
- Rollback không xóa transaction, entitlement, progress hoặc campaign audit data.

## 16. External prerequisites còn thiếu

Các giá trị sau không được đoán hoặc commit trong spec:

- RevenueCat Project ID, public iOS/Android SDK keys và secret API key;
- App Store Connect/Google Play product approval và territory availability;
- Firebase production project/deployment, Secret Manager value/IAM và App Check registrations;
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
  [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions),
  [App Check](https://firebase.google.com/docs/app-check).
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
  [Kids guidance](https://developer.apple.com/kids/),
  [In-App Purchase](https://developer.apple.com/in-app-purchase/).
- Google Play: [Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738),
  [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335),
  [Play Billing integration](https://developer.android.com/google/play/billing/integrate).
