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
    ...sungyRewardTapMessages,
    ...sungyCompletionTapMessages,
  ]),
] as const;
