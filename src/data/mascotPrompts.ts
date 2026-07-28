export const sungyOnboardingGreeting =
  'Xin chào! Mình là Sungy, bạn học của bé.';

export const sungyOnboardingTapMessages = [
  sungyOnboardingGreeting,
  'Ba mẹ chọn độ khó trước, rồi Sungy sẽ dẫn bé đi từng trạm nhé.',
  'Mình sẽ cổ vũ bé mỗi khi bé học xong một cảnh.',
] as const;

export const sungyHomeCompleteTapMessages = [
  'Bé giỏi quá! Mình cùng nhận thêm sticker nhé.',
  'Sungy đã thấy cả bản đồ sáng lên rồi!',
  'Mình có thể chơi lại để ôn từ mới nữa đó.',
] as const;

export const sungyHomeReviewTapMessages = [
  'Mình cùng lật thẻ để nhớ từ lâu hơn nhé.',
  'Chơi ôn tập xong là Sungy trao sticker liền!',
  'Bấm tab Chơi để gặp game đang mở nhé.',
] as const;

export const sungyHomeGuideTapMessages = [
  'Bấm vào trạm sáng lên để học tiếp nhé.',
  'Sungy đi cùng bé nè!',
  'Mình kiếm thêm sao nào!',
] as const;

export const sungyRewardTapMessages = [
  'Sticker mới sáng lên rồi!',
  'Bấm vào từ mới bên dưới để nghe lại tiếng Anh nhé.',
  'Mình sẵn sàng sang bài tiếp theo.',
  'Bé đã đi rất xa rồi, Sungy tự hào lắm!',
] as const;

export const sungyCompletionTapMessages = [
  'Bé vừa hoàn thành cảnh này rồi!',
  'Cảnh tiếp theo đang chờ mình. Mình đi nhé!',
  'Sungy đang giữ sticker mới cho bé đây.',
  'Chạm nút màu vàng để tiếp tục nào!',
] as const;

export const sungySpeechLines = [
  ...new Set([
    sungyOnboardingGreeting,
    ...sungyOnboardingTapMessages,
    ...sungyHomeCompleteTapMessages,
    ...sungyHomeReviewTapMessages,
    ...sungyHomeGuideTapMessages,
    ...sungyRewardTapMessages,
    ...sungyCompletionTapMessages,
  ]),
] as const;
