const plans = {
  // ── Family Safety Plans page ───────────────────────────────────────────────
  safetyPlans: {
    title: 'Kế hoạch an toàn gia đình',
    description: 'Lộ trình an toàn cá nhân hóa được tạo ra cho gia đình bạn.',
    lockedTitle: 'Kế hoạch an toàn gia đình đang bị khóa',
    lockedDescription:
      'Kế hoạch an toàn gia đình cá nhân hóa của bạn — bao gồm phân tích rủi ro và các hành động cần thực hiện — được tạo sau khi hoàn thành buổi Tư vấn An toàn Gia đình.',
    lockedPackage: 'Family Core hoặc Annual Plan',
    lockedCta: 'Xem các gói dịch vụ',
    card: {
      title: 'Kế hoạch an toàn gia đình',
      riskLevel: 'Mức độ rủi ro:',
      topRisks: 'Rủi ro hàng đầu',
      topPriorities: 'Ưu tiên hàng đầu',
      actionPlanMembers: 'Kế hoạch hành động — Thành viên',
      actionPlanDevices: 'Kế hoạch hành động — Thiết bị',
      viewBooking: 'Xem lịch đặt',
      sourceAssessment: 'Đánh giá gốc',
    },
    empty: {
      title: 'Kế hoạch an toàn của bạn đang được chuẩn bị',
      description:
        'Các chuyên viên tư vấn đang xem xét thông tin gia đình và xây dựng kế hoạch an toàn cá nhân hóa. Chúng tôi sẽ thông báo khi sẵn sàng.',
    },
    error: {
      subscription: 'Bạn cần có gói đăng ký để truy cập tính năng này.',
      generic: 'Không thể tải kế hoạch an toàn.',
    },
  },

  // ── Incident Recovery Pack page ────────────────────────────────────────────
  recoveryPack: {
    title: 'Gói phục hồi sự cố',
    description: 'Kế hoạch phục hồi từng bước được tạo sau buổi phản hồi sự cố của bạn.',
    generatedOn: 'Được tạo {{date}}',
    downloadReport: 'Tải báo cáo',
    preparing: 'Đang chuẩn bị…',
    empty: {
      title: 'Gói phục hồi của bạn đang được chuẩn bị',
      description:
        'Các chuyên viên tư vấn đang ưu tiên xử lý. Hướng dẫn phục hồi từng bước của bạn sẽ sẵn sàng trong thời gian sớm nhất — chúng tôi sẽ thông báo qua email.',
    },
    error: {
      subscription: 'Bạn cần có gói đăng ký để truy cập tính năng này.',
      generic: 'Không thể tải gói phục hồi.',
    },
  },
} as const

export default plans
