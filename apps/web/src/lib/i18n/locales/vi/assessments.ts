const assessments = {
  // ── Category labels ─────────────────────────────────────────────────────────
  categories: {
    accountSecurity: 'Bảo mật tài khoản',
    deviceHygiene: 'Thiết bị an toàn',
    backupRecovery: 'Sao lưu & Phục hồi',
    privacySharing: 'Quyền riêng tư',
    scamReadiness: 'Nhận biết lừa đảo',
  },

  // ── Risk level labels ───────────────────────────────────────────────────────
  riskLevels: {
    Low: 'An toàn tốt',
    Medium: 'Cần cải thiện',
    High: 'Rủi ro cao',
    Critical: 'Nghiêm trọng',
  },

  // ── Start page ──────────────────────────────────────────────────────────────
  start: {
    pageTitle: 'Kiểm tra an toàn gia đình',
    pageDescription: 'Khám phá mức độ bảo vệ của gia đình bạn trên không gian mạng.',
    heroTitle: 'Gia đình bạn đang an toàn đến đâu?',
    heroBody:
      'Trả lời 22 câu hỏi ngắn trong 5 chủ đề bảo mật. Bạn sẽ nhận ngay điểm bảo vệ tổng thể, phân tích chi tiết từng chủ đề và danh sách các việc cần làm để gia đình an toàn hơn trên mạng.',
    heroDuration: 'Khoảng 5 phút · Không lưu thông tin cá nhân',
    startButton: 'Bắt đầu kiểm tra',
    viewLastResult: 'Xem kết quả lần trước →',
    whatYouGet: [
      'Điểm an toàn tổng thể của gia đình (thang 0–100)',
      'Phân tích chi tiết theo từng nhóm bảo mật',
      'Danh sách việc cần làm, sắp xếp theo mức độ ưu tiên',
      'Liên kết nhanh đến danh sách kiểm tra bảo mật cá nhân',
    ],
  },

  // ── Result page ─────────────────────────────────────────────────────────────
  result: {
    pageTitle: 'Kết quả kiểm tra an toàn',
    loadingResults: 'Đang tải kết quả…',
    noAssessment: 'Chưa có kết quả kiểm tra. Hãy bắt đầu kiểm tra ngay.',
    startAssessment: 'Bắt đầu kiểm tra',
    assessedOn: 'Kết quả ngày {{date}}',
    yourScoreDescription: 'Gia đình bạn đạt {{score}}/100 điểm bảo vệ.',
    riskMessage: {
      Low: 'Gia đình bạn đang ở mức an toàn tốt! Hãy duy trì những thói quen này và kiểm tra định kỳ để luôn được bảo vệ.',
      Medium: 'Nền tảng bảo mật của gia đình khá tốt. Một vài cải thiện đơn giản sẽ giúp gia đình an toàn hơn đáng kể.',
      High: 'Gia đình bạn đang có một số lỗ hổng bảo mật quan trọng. Hãy ưu tiên thực hiện các việc cần làm ngay bên dưới.',
      Critical: 'Gia đình bạn đang ở mức rủi ro đáng lo ngại. Vui lòng thực hiện các bước khắc phục bên dưới để bảo vệ gia đình sớm nhất có thể.',
    },
    categoryBreakdown: 'Chi tiết theo từng nhóm',
    immediateActions: '⚡ Cần làm ngay',
    whatsNext: 'Tiếp theo bạn nên làm gì?',
    whatsNextDescription:
      'Cải thiện điểm số bằng cách hoàn thành danh sách kiểm tra hoặc trao đổi với chuyên gia tư vấn.',
    viewChecklist: '✅ Xem danh sách kiểm tra',
    retakeAssessment: '🔄 Kiểm tra lại',
    bookConsultation: '📅 Đặt lịch tư vấn',
    viewHistory: 'Xem lịch sử →',
  },

  // ── History page ────────────────────────────────────────────────────────────
  history: {
    pageTitle: 'Lịch sử kiểm tra',
    loadError: 'Không thể tải lịch sử. Vui lòng thử lại.',
    noAssessments: 'Chưa có lần kiểm tra nào',
    noAssessmentsHint:
      'Hoàn thành lần kiểm tra đầu tiên để bắt đầu theo dõi mức độ an toàn của gia đình theo thời gian.',
    takeAssessment: 'Bắt đầu kiểm tra',
    latestBadge: 'Gần nhất',
    assessmentNumber: 'Lần #{{number}}',
    viewLatestResult: '← Xem kết quả gần nhất',
    retakeAssessment: 'Kiểm tra lại',
    completedCount_one: '{{count}} lần kiểm tra',
    completedCount_other: '{{count}} lần kiểm tra',
    trendImproved: '📈 Điểm của bạn tăng thêm {{count}} điểm so với lần trước. Tuyệt vời, hãy tiếp tục phát huy!',
    trendDecreased: '📉 Điểm của bạn giảm {{count}} điểm so với lần trước. Hãy xem lại phần "Cần làm ngay" để cải thiện nhé.',
  },

  // ── Wizard page ─────────────────────────────────────────────────────────────
  wizard: {
    pageTitle: 'Kiểm tra an toàn gia đình',
    loading: 'Đang tải câu hỏi…',
    loadError: 'Không thể tải câu hỏi. Vui lòng thử lại.',
    stepLabel: 'Bước {{current}}: {{label}}',
    questionCount_one: '{{count}} câu hỏi',
    questionCount_other: '{{count}} câu hỏi',
    back: '← Quay lại',
    next: 'Tiếp theo →',
    submit: 'Xem kết quả',
    submitting: 'Đang xử lý…',
    pleaseSelectAnswer: 'Vui lòng chọn một đáp án',
    submitError: 'Đã xảy ra sự cố. Vui lòng thử lại.',
  },
} as const

export default assessments
