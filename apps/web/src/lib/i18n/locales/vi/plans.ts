const plans = {
  // ── Family Safety Plans page ───────────────────────────────────────────────
  safetyPlans: {
    title: 'Kế hoạch an toàn gia đình',
    description: 'Lộ trình an toàn cá nhân hóa được tạo ra cho gia đình bạn.',
    lockedTitle: 'Kế hoạch an toàn gia đình chưa mở khóa',
    lockedDescription:
      'Kế hoạch an toàn gia đình cá nhân hóa của bạn — bao gồm phân tích rủi ro và các hành động cần thực hiện — được tạo sau khi hoàn thành buổi tư vấn an toàn gia đình.',
    lockedPackage: 'Gói Family Core hoặc Gói Năm',
    lockedCta: 'Xem các gói dịch vụ',
    card: {
      title: 'Kế hoạch an toàn',
      description: 'Kế hoạch an toàn cá nhân hóa cho gia đình bạn',
      riskLevel: 'Mức độ rủi ro:',
      topRisks: 'Rủi ro hàng đầu',
      topPriorities: 'Ưu tiên hàng đầu',
      actionPlanMembers: 'Kế hoạch hành động — Thành viên',
      actionPlanDevices: 'Kế hoạch hành động — Thiết bị',
      viewBooking: 'Xem lịch đặt',
      sourceAssessment: 'Đánh giá nguồn',
    },
    empty: {
      title: 'Kế hoạch an toàn của bạn đang được chuẩn bị',
      description:
        'Các chuyên viên tư vấn đang xem xét thông tin gia đình và xây dựng kế hoạch an toàn cá nhân hóa. Chúng tôi sẽ thông báo khi sẵn sàng.',
    },
    error: {
      subscription: 'Cần có gói đăng ký để truy cập kế hoạch bảo mật gia đình.',
      generic: 'Không thể tải kế hoạch an toàn. Vui lòng thử lại.',
    },
  },

  // ── Incident Recovery Pack detail page ─────────────────────────────────────
  recoveryPack: {
    title: 'Gói phục hồi sự cố',
    description: 'Kế hoạch phục hồi từng bước được tạo sau buổi phản hồi sự cố của bạn.',
    generatedOn: 'Được tạo ngày {{date}}',
    downloadReport: 'Tải báo cáo',
    preparing: 'Đang chuẩn bị…',
    empty: {
      title: 'Gói phục hồi của bạn đang được chuẩn bị',
      description:
        'Các chuyên viên tư vấn đang ưu tiên xử lý. Hướng dẫn phục hồi từng bước của bạn sẽ sẵn sàng trong thời gian sớm nhất — chúng tôi sẽ thông báo qua email khi có.',
    },
    error: {
      subscription: 'Cần có gói đăng ký để truy cập gói phục hồi sự cố.',
      generic: 'Không thể tải gói phục hồi.',
    },
  },

  // ── Family Safety Plan detail page ─────────────────────────────────────────
  familySafetyPlan: {
    title:          'Kế hoạch an toàn gia đình',
    generatedOn:    'Được tạo ngày {{date}}',
    score:          'Điểm: {{score}}/100',
    riskBadge:      'Rủi ro {{level}}',
    preparing:      'Đang chuẩn bị…',
    downloadReport: 'Tải báo cáo',
    error: {
      paymentRequired: 'Tính năng này yêu cầu gói dịch vụ đang hoạt động.',
      generic:         'Không thể tải kế hoạch an toàn. Vui lòng thử lại.',
    },
    empty: {
      title:       'Chưa có kế hoạch an toàn',
      description: 'Đặt lịch kiểm tra an toàn để tạo kế hoạch an toàn cá nhân hóa cho gia đình bạn.',
    },
    sections: {
      topRisksHeading:          'Các rủi ro hàng đầu được xác định',
      immediateActionsRequired: 'Cần hành động ngay ({{count}} mục)',
      moreImmediateActions:     '+{{count}} hành động khẩn cấp nữa — xem danh sách đầy đủ',
      noRisksListed:            'Chưa có rủi ro cụ thể nào được liệt kê trong kế hoạch này.',
      topPrioritiesHeading:     'Ưu tiên hàng đầu',
      recommendedTasks:         'Việc cần làm được đề xuất',
      memberActionPlanHeading:  'Kế hoạch hành động theo từng thành viên',
      unknownMember:            'Thành viên gia đình',
      completionDone:           '{{done}}/{{total}} hoàn thành',
      noMemberTasks:            'Chưa có việc cụ thể nào cho từng thành viên.',
      assetActionPlanHeading:   'Kế hoạch hành động theo thiết bị & tài khoản',
      unknownAsset:             'Thiết bị không xác định',
      noAssetTasks:             'Chưa có việc cần làm nào cho thiết bị hoặc tài khoản.',
    },
  },

  // ── Incident Recovery list page ────────────────────────────────────────────
  incidentRecovery: {
    title:             'Gói phục hồi sự cố',
    description:       'Hướng dẫn phục hồi từng bước được tạo sau buổi phản hồi sự cố.',
    lockedTitle:       'Gói phục hồi sự cố đang bị khóa',
    lockedDescription:
      'Gói phục hồi cá nhân hóa của bạn — bao gồm các bước kiềm chế, những điều cần tránh và hướng dẫn phục hồi 7 ngày — được tạo sau khi hoàn thành buổi phản hồi sự cố.',
    lockedPackage: 'Gói Phản hồi Sự cố',
    lockedCta:     'Xem các gói dịch vụ',
    cardTitle:     'Gói phục hồi sự cố',
    viewBooking:   'Xem lịch đặt',
    viewIncident:  'Xem sự cố',
    sections: {
      whatHappened:       'Điều gì đã xảy ra',
      whatToDoNow:        'Cần làm ngay',
      whatToDoNowHeading: 'Cần làm ngay bây giờ',
      whatNotToDo:        'Không được làm',
      whatNotToDoHeading: 'Tuyệt đối không làm',
      whatNotToDoWarning: 'Tránh những hành động này — chúng có thể làm trầm trọng thêm tình huống hoặc phá hủy bằng chứng.',
      next24Hours:        '24 giờ tiếp theo',
      next7Days:          '7 ngày tiếp theo',
      next7DaysHeading:   'Kế hoạch phục hồi — 7 ngày tiếp theo',
      advisorPreparing:   'Chi tiết đang được chuyên viên tư vấn ghi lại.',
      advisorWillAdd:     'Chuyên viên tư vấn sẽ bổ sung các bước phục hồi sau buổi tư vấn.',
      completionCount:    '{{done}}/{{total}} hoàn thành',
      viewSessionBooking: 'Xem lịch đặt buổi tư vấn',
      viewIncidentRecord: 'Xem hồ sơ sự cố',
      forTarget:          'Cho: {{target}}',
    },
    error: {
      subscription: 'Cần có gói đăng ký để truy cập gói phục hồi sự cố.',
      generic:      'Không thể tải gói phục hồi sự cố.',
    },
    empty: {
      title:       'Gói phục hồi của bạn đang được chuẩn bị',
      description:
        'Các chuyên viên tư vấn đang ưu tiên xử lý. Hướng dẫn phục hồi từng bước của bạn sẽ sẵn sàng trong thời gian sớm nhất. Chúng tôi sẽ thông báo qua email khi có.',
    },
  },

  // ── Plan CTA banner (checklist shortcut) ──────────────────────────────────
  planCtaBanner: {
    heading:       'Mở danh sách kiểm tra an toàn đầy đủ',
    progressLabel: '{{completed}} / {{total}} nhiệm vụ hoàn thành · {{pct}}%',
    emptyLabel:    'Xem và quản lý tất cả nhiệm vụ an toàn của bạn',
    progressAria:  'Tiến độ tổng thể',
  },

  // ── Premium product copy (PremiumLockedState + UpgradeCTACard) ────────────
  products: {
    whatsIncluded: 'Bao gồm những gì',
    includedWith:  'Có trong {{name}}',
    PremiumChecklist: {
      title: 'Danh sách kiểm tra an toàn cao cấp',
      pitch:
        'Danh sách hành động cá nhân hóa, được sắp xếp theo mức ưu tiên dựa trên tài khoản, thiết bị và kết quả đánh giá an toàn của gia đình bạn.',
      features: [
        'Nhiệm vụ được xếp hạng theo mức khẩn cấp — Làm ngay, Tuần này, Tháng này, Liên tục',
        'Hướng dẫn từng bước và cách khắc phục cho mỗi hành động',
        'Lọc theo mức ưu tiên, danh mục và giai đoạn',
        'Theo dõi tiến độ với thống kê hoàn thành',
        'Mở khóa cùng với bất kỳ gói Safety Plan nào',
      ],
      packageName: 'Gói Family Safety Plan hoặc Premium Checklist',
      ctaLabel:    'Xem các gói dịch vụ',
    },
    FamilySafetyPlan: {
      title: 'Kế hoạch bảo mật gia đình',
      pitch:
        'Lộ trình an toàn gia đình cá nhân hóa, được xây dựng từ kết quả đánh giá và xem xét bởi chuyên viên SafeFamily.',
      features: [
        'Xác định và ưu tiên các rủi ro hàng đầu cho gia đình bạn',
        'Kế hoạch hành động được điều chỉnh cho từng thành viên gia đình',
        'Các hành động bảo mật cho từng thiết bị và tài khoản',
        'Báo cáo an toàn dạng PDF có thể tải về',
        'Liên kết trực tiếp với danh sách nhiệm vụ an toàn của bạn',
      ],
      packageName: 'Gói Family Safety Plan',
      ctaLabel:    'Đặt lịch đánh giá an toàn',
    },
    IncidentRecoveryPack: {
      title: 'Gói phục hồi sự cố',
      pitch: 'Hướng dẫn phục hồi từng bước được tạo bởi chuyên viên tư vấn sau buổi phản hồi sự cố.',
      features: [
        'Các bước kiềm chế tức thì cần thực hiện ngay',
        'Danh sách rõ ràng những điều cần tránh — bảo vệ bằng chứng và tài khoản',
        'Kế hoạch nhiệm vụ phục hồi 24 giờ và 7 ngày theo thứ tự ưu tiên',
        'Nhiệm vụ được giao cho từng thành viên gia đình và thiết bị cụ thể',
        'Báo cáo phục hồi sự cố có thể tải về',
      ],
      packageName: 'Gói Incident Response',
      ctaLabel:    'Đặt lịch buổi phản hồi sự cố',
    },
    AnnualPlan: {
      title: 'Kế hoạch an toàn hàng năm',
      pitch:
        'Đánh giá an toàn hàng năm giúp duy trì và nâng cao bảo mật số của gia đình bạn một cách chủ động.',
      features: [
        'Nhiệm vụ an toàn định kỳ và kiểm tra hàng năm theo lịch',
        'Phòng chống lừa đảo, phục hồi bản sao lưu và bảo vệ quyền riêng tư',
        'Các hành động giám sát chủ động trên tất cả tài khoản',
        'Tùy chỉnh cho hệ sinh thái gia đình (Google, Apple, Microsoft)',
        'Tiến độ được tích lũy qua từng năm',
      ],
      packageName: 'Gói đăng ký Annual Safety Plan',
      ctaLabel:    'Nâng cấp lên Annual Plan',
    },
  },
} as const

export default plans
