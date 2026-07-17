# SKidsEnglish monetization backend

Firebase Functions v2 backend cho Founder Premium. Package này chạy Node.js 22, dùng
`firebase-functions@7.2.5` và `firebase-admin@13.10.0` theo peer dependency hiện hành.

## Public callable contract

Tất cả callable chạy tại `asia-southeast1`, bật `enforceAppCheck` và không nhận UID/campaign ID từ
body. Firebase Auth là nguồn duy nhất cho parent UID; request thiếu Auth bị reject bằng
`HttpsError('unauthenticated')` trước khi chạy business logic.

- `claimFounderPremium`: kiểm tra Remote Config, RevenueCat customer/entitlement và tạo reservation
  cùng outbox trong một Firestore transaction.
- `getFounderPremiumStatus`: trả trạng thái đã normalize cho UI mà không cho client đọc campaign
  document trực tiếp.
- `deleteRevenueCatCustomerData`: xóa RevenueCat customer trước khi client tiếp tục xóa Firebase
  Auth account. Backend tạo tombstone với document ID SHA-256 trước, chặn claim/outbox và đợi
  worker lease an toàn; sau khi RevenueCat xác nhận DELETE mới xóa mọi ledger chứa raw UID. Counter
  campaign được giữ nguyên và tombstone hashed được giữ lại để account cũ không claim/regrant.
- `processFounderGrant`: Firestore create trigger xử lý outbox với lease.
- `reconcileFounderGrants`: chạy mỗi 5 phút để lấy lại pending/stuck work.

Backend trả một trong `available`, `granted`, `processing`, `alreadyClaimed`, `alreadyPremium`,
`notAvailable`, `soldOut`, `signInRequired`, `retryableError`. Client vẫn phải refresh RevenueCat
`CustomerInfo`; callable response không tự mở Premium.

## RevenueCat configuration

- Parameter không bí mật: `REVENUECAT_PROJECT_ID` (`proj...`).
- Secret Manager binding: `REVENUECAT_SECRET_API_KEY` (v2 Secret API key).
- Runtime key cần quyền `customer_information:customers:read` và
  `customer_information:customers:read_write`.
- Campaign lưu cả lookup key `premium` và internal RevenueCat entitlement ID dạng `entl...` vì API
  v2 grant/active-entitlements dùng internal ID, không dùng lookup key.

Không đặt secret trong `.env`, Remote Config, mobile config hay command arguments. Local emulator
nếu thật sự cần secret dùng `.secret.local`, file này đã được ignore.

## Campaign seed

Script mặc định chỉ preview và không ghi Firestore:

```bash
npm --prefix functions run seed:founder -- \
  --revenuecat-entitlement-id=entl_replace_me
```

Khi apply, script yêu cầu ADC/Firebase project, một RevenueCat validation key tạm thời trong process
environment và xác nhận internal ID thật sự map tới lookup key `premium` trước khi tạo document.
Script từ chối overwrite campaign đã tồn tại để không làm mất counters.

```bash
read -s REVENUECAT_SECRET_API_KEY
export REVENUECAT_SECRET_API_KEY
export REVENUECAT_PROJECT_ID=proj_replace_me
npm --prefix functions run seed:founder -- \
  --firebase-project=replace-me \
  --revenuecat-entitlement-id=entl_replace_me \
  --apply
unset REVENUECAT_SECRET_API_KEY
```

Validation key chỉ cần thêm quyền `project_configuration:entitlements:read` trong lúc seed và nên
được thu hồi sau đó. Không chạy `--apply` từ CI thông thường.

## Local verification

```bash
npm --prefix functions test
npm run test:founder-quota
npm run test:firestore-rules
```

Unit suite có case 550 claim đồng thời/capacity 500. Firestore Emulator suite dùng một corpus nhỏ
hơn để kiểm tra transaction, outbox idempotency, retry và race account-deletion/worker mà không
biến local verification thành load test. Load test 550 callable đồng thời qua endpoint, App Check
enforcement qua HTTP và RevenueCat Test Store vẫn thuộc closed-testing trên môi trường Firebase
không phải production.

## Deployment prerequisites

Trước deploy production cần hoàn tất tối thiểu:

- Firebase Blaze, Firestore và Remote Config API;
- App Check Play Integrity/App Attest enforcement và production registrations;
- Secret Manager value + IAM chỉ cho Functions runtime; runtime service account cần quyền đọc
  published Remote Config tương đương `roles/cloudconfig.viewer`;
- Remote Config default/global keys đúng contract;
- seed campaign bằng internal entitlement ID đã xác minh;
- review `npm audit`, IAM least privilege, logs và alerts;
- giữ `founder_premium_campaign_enabled=false` cho tới Phase 5.

Repository hiện chỉ chứa code/config/scripts; task triển khai này không deploy function, không tạo
secret, không seed Firestore thật và không bật Remote Config.

`npm audit` hiện báo 9 moderate, 0 high và 0 critical từ chuỗi transitive
`firebase-admin@13.10.0` (Firestore/Storage/uuid). `npm audit fix --dry-run` không có safe update;
fix được đề xuất đòi Admin 14 trong khi `firebase-functions@7.2.5` chỉ khai báo peer support đến
Admin 13. Không dùng `--force`/`--legacy-peer-deps`; phải audit lại và nâng theo dependency tree được
Firebase hỗ trợ trước production deploy.
