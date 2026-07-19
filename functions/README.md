# SKidsEnglish account-deletion backend

Firebase Functions v2 package chạy Node.js 22. Backend chỉ còn callable
`deleteRevenueCatCustomerData`; Founder Premium không dùng Cloud Functions, Firestore campaign,
outbox hay RevenueCat promotional grant nữa.

## Callable contract

`deleteRevenueCatCustomerData` chạy tại `asia-southeast1`, bật `enforceAppCheck` và yêu cầu
Firebase Auth. Callable không nhận UID từ request body: Firebase Auth UID là RevenueCat customer
ID duy nhất được phép xóa.

Backend gọi RevenueCat v2 `DELETE /projects/{projectId}/customers/{customerId}` trực tiếp và trả:

- `{ status: "deleted" }` khi RevenueCat chấp nhận yêu cầu xóa;
- `{ status: "alreadyDeleted" }` khi customer không còn tồn tại (`404`), giúp retry idempotent;
- `{ status: "retryableError" }` khi cấu hình, network hoặc RevenueCat chưa xác nhận xóa.

Client chỉ tiếp tục xóa Firebase Auth account sau `deleted` hoặc `alreadyDeleted`. Secret và raw
UID không được ghi log; log chỉ chứa hash rút gọn của UID.

## RevenueCat configuration

- Parameter không bí mật: `REVENUECAT_PROJECT_ID` (`proj...`).
- Secret Manager binding: `REVENUECAT_SECRET_API_KEY` (RevenueCat v2 secret API key).
- Key chỉ cần quyền tối thiểu để xóa customer thuộc project. Không cấp quyền grant entitlement,
  sửa subscription hoặc project configuration.

Không đặt secret trong `.env`, Remote Config, mobile config hay command arguments. Local emulator
nếu thật sự cần secret dùng `.secret.local`, file này phải được ignore.

## Local verification

```bash
npm --prefix functions test
npm run test:firestore-rules
```

## Deployment

Deploy duy nhất callable account deletion:

```bash
npx firebase deploy \
  --only functions:deleteRevenueCatCustomerData \
  --project <project-id>
```

Trước production cần Firebase Blaze, App Check production registration/enforcement, Secret
Manager/IAM least privilege và cảnh báo lỗi callable. Việc xóa các Founder Functions đã deploy là
thao tác hạ tầng riêng, không được thực hiện bởi package build/test này.
