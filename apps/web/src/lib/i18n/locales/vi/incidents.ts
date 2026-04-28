const incidents = {
  // ── Trang danh sách sự cố ─────────────────────────────────────────────────
  list: {
    pageTitle:       'Sự cố bảo mật',
    pageDescription: 'Ghi nhận và theo dõi các sự cố bảo mật trong gia đình bạn.',
    reportButton:    'Báo cáo sự cố',
    reported:        'Ghi nhận lúc',
    loadError:       'Không thể tải danh sách sự cố.',
  },

  // ── Biểu mẫu báo cáo ──────────────────────────────────────────────────────
  wizard: {
    pageTitle:          'Báo cáo sự cố',
    pageDescription:    'Cho chúng tôi biết điều gì đã xảy ra để tạo kế hoạch xử lý ban đầu.',
    typeLabel:          'Loại sự cố là gì?',
    severityLabel:      'Mức độ nghiêm trọng như thế nào?',
    summaryLabel:       'Điều gì đã xảy ra?',
    summaryPlaceholder: 'Mô tả ngắn gọn những gì đã xảy ra…',
    backButton:         'Quay lại',
    submitButton:       'Gửi báo cáo',
    errors: {
      typeRequired:     'Vui lòng chọn loại sự cố',
      severityRequired: 'Vui lòng chọn mức độ nghiêm trọng',
      summaryMin:       'Vui lòng nhập ít nhất 10 ký tự',
      summaryMax:       'Mô tả không được vượt quá 500 ký tự',
    },
  },

  // ── Trang chi tiết sự cố ─────────────────────────────────────────────────
  detail: {
    pageTitle:           'Chi tiết sự cố',
    backButton:          'Tất cả sự cố',
    reported:            'Ghi nhận lúc',
    actionPlan:          'Kế hoạch xử lý',
    loadError:           'Không tìm thấy sự cố hoặc không thể tải dữ liệu.',
    highSeverityAlert:   'Đây là sự cố mức {{severity}}.',
    highSeverityBook:    'Hãy đặt buổi tư vấn với chuyên viên SafeFamily để được hỗ trợ trực tiếp.',
    highSeverityContact: 'Hãy liên hệ chuyên viên SafeFamily để được hỗ trợ trực tiếp.',
    cta: {
      bookHelp:      'Đặt lịch hỗ trợ',
      viewChecklist: 'Xem danh sách việc cần làm',
    },
  },

  // ── Loại sự cố ────────────────────────────────────────────────────────────
  types: {
    PhishingAttempt: {
      label:       'Lừa đảo qua email / tin nhắn',
      description: 'Email, SMS hoặc đường dẫn đáng ngờ cố đánh cắp thông tin đăng nhập',
    },
    PasswordCompromise: {
      label:       'Mật khẩu bị lộ',
      description: 'Mật khẩu tài khoản có thể đã bị tiết lộ hoặc rò rỉ',
    },
    DeviceLostOrStolen: {
      label:       'Thiết bị bị mất hoặc đánh cắp',
      description: 'Điện thoại, máy tính hoặc thiết bị khác bị mất hoặc bị lấy',
    },
    UnauthorisedAccess: {
      label:       'Truy cập trái phép',
      description: 'Ai đó đã truy cập tài khoản hoặc thiết bị mà không được phép',
    },
    DataBreach: {
      label:       'Rò rỉ dữ liệu',
      description: 'Thông tin cá nhân bị lộ do vi phạm dữ liệu từ bên thứ ba',
    },
    MalwareInfection: {
      label:       'Phần mềm độc hại / Virus',
      description: 'Thiết bị bị nhiễm mã độc hoặc ransomware',
    },
    ScamOrFraud: {
      label:       'Lừa đảo tài chính',
      description: 'Lừa đảo tài chính, hóa đơn giả hoặc giao dịch gian lận',
    },
    IdentityTheft: {
      label:       'Giả mạo danh tính',
      description: 'Danh tính cá nhân bị lạm dụng để thực hiện gian lận',
    },
    SocialEngineering: {
      label:       'Thao túng tâm lý',
      description: 'Bị thao túng tâm lý để tiết lộ thông tin riêng tư',
    },
    Other: {
      label:       'Sự cố khác',
      description: 'Sự cố bảo mật không thuộc các danh mục trên',
    },
  },

  // ── Mức độ nghiêm trọng ──────────────────────────────────────────────────
  severity: {
    Low:      { label: 'Thấp',         description: 'Rủi ro nhỏ, chưa cần hành động ngay' },
    Medium:   { label: 'Trung bình',   description: 'Rủi ro vừa, nên xử lý trong 24–48 giờ' },
    High:     { label: 'Cao',          description: 'Rủi ro đáng kể, cần xử lý càng sớm càng tốt' },
    Critical: { label: 'Nghiêm trọng', description: 'Rủi ro nghiêm trọng, cần hành động ngay' },
  },

  // ── Trạng thái ───────────────────────────────────────────────────────────
  status: {
    Open:       'Chưa xử lý',
    InProgress: 'Đang xử lý',
    Resolved:   'Đã xử lý',
    Dismissed:  'Đã bỏ qua',
  },

  // ── Trang kết quả ────────────────────────────────────────────────────────
  result: {
    pageTitle:         'Kế hoạch xử lý sự cố',
    pageDescription:   'Thực hiện các bước dưới đây để kiềm chế và khắc phục sự cố.',
    loadingTitle:      'Báo cáo sự cố',
    loadError:         'Không thể tải thông tin sự cố. Vui lòng thử lại.',
    recorded: {
      title: 'Sự cố đã được ghi nhận',
      body:  'Sự cố đã được lưu lại. Hãy thực hiện kế hoạch bên dưới để bảo vệ gia đình bạn.',
    },
    highSeverityAlert:  'Đây là sự cố mức {{severity}}. Hãy cân nhắc đặt lịch với chuyên viên SafeFamily để được hỗ trợ.',
    recommendedActions: 'Các bước cần thực hiện',
    cta: {
      bookHelp:      'Đặt lịch hỗ trợ',
      viewChecklist: 'Xem danh sách việc cần làm',
      reportAnother: 'Báo cáo sự cố khác',
      allIncidents:  'Tất cả sự cố',
    },
  },
} as const

export default incidents
