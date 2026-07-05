export const sugaOnboardingGreeting =
  'Xin chào! Mình là Suga, bạn học của bé.';

export const sugaOnboardingTapMessages = [
  sugaOnboardingGreeting,
  'Ba mẹ chọn độ khó trước, rồi Suga sẽ dẫn bé đi từng trạm nhé.',
  'Mình sẽ cổ vũ bé mỗi khi bé học xong một cảnh.',
] as const;

export const sugaHomeCompleteTapMessages = [
  'Bé giỏi quá! Mình cùng nhận thêm sticker nhé.',
  'Suga đã thấy cả bản đồ sáng lên rồi!',
  'Mình có thể chơi lại để ôn từ mới nữa đó.',
] as const;

export const sugaHomeReviewTapMessages = [
  'Mình cùng lật thẻ để nhớ từ lâu hơn nhé.',
  'Chơi ôn tập xong là Suga trao sticker liền!',
  'Bấm tab Chơi để gặp game đang mở nhé.',
] as const;

export const sugaHomeGuideTapMessages = [
  'Bấm vào trạm sáng lên để học tiếp nhé.',
  'Suga đi cùng bé nè!',
  'Mình kiếm thêm sao nào!',
] as const;

export const sugaRewardTapMessages = [
  'Sticker mới sáng lên rồi!',
  'Bấm vào từ mới bên dưới để nghe lại tiếng Anh nhé.',
  'Mình sẵn sàng sang bài tiếp theo.',
  'Bé đã đi rất xa rồi, Suga tự hào lắm!',
] as const;

export const sugaCompletionTapMessages = [
  'Bé vừa hoàn thành cảnh này rồi!',
  'Cảnh tiếp theo đang chờ mình. Mình đi nhé!',
  'Suga đang giữ sticker mới cho bé đây.',
  'Chạm nút màu vàng để tiếp tục nào!',
] as const;

export const sugaSpeechLines = [
  ...new Set([
    sugaOnboardingGreeting,
    ...sugaOnboardingTapMessages,
    ...sugaHomeCompleteTapMessages,
    ...sugaHomeReviewTapMessages,
    ...sugaHomeGuideTapMessages,
    ...sugaRewardTapMessages,
    ...sugaCompletionTapMessages,
  ]),
] as const;
