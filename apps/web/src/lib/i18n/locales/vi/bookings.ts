const bookings = {
  // ── Booking form page ──────────────────────────────────────────────────────
  form: {
    title: 'Nhận Tư Vấn An Toàn Cá Nhân',
    description:
      'Chọn gói dịch vụ, cho chúng tôi biết tình hình, và chúng tôi sẽ chuẩn bị tài liệu an toàn cá nhân hóa cho bạn.',
    myBookings: 'Lịch đặt của tôi',
    errorGeneric: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    step1: {
      title: '1. Chọn gói an toàn của bạn',
      description:
        'Mỗi gói mở khóa một bộ tài liệu an toàn số khác nhau — chọn gói phù hợp với tình huống của bạn.',
    },
    step2: {
      title: '2. Bạn cần hỗ trợ về vấn đề gì?',
      description:
        'Chọn mục gần nhất — điều này giúp chúng tôi cá nhân hóa tài liệu an toàn của bạn.',
      placeholder: 'Hoặc mô tả theo cách của bạn…',
    },
    step3: {
      title: '3. Mức độ khẩn cấp như thế nào?',
      description:
        'Điều này giúp chúng tôi ưu tiên yêu cầu và điều chỉnh nội dung tài liệu phù hợp.',
    },
    step4: {
      title: '4. Ai bị ảnh hưởng?',
      optional: '(không bắt buộc)',
      description: 'Thành viên gia đình nào liên quan chính đến tình huống này?',
      placeholder: 'Hoặc nhập tên…',
    },
    step5: {
      title: '5. Tài khoản hoặc thiết bị nào bị ảnh hưởng?',
      optional: '(không bắt buộc)',
      description:
        'Ví dụ: "Gmail của bố", "iPad gia đình", "Tài khoản Instagram". Giúp chúng tôi đưa ra lời khuyên đúng trọng tâm.',
      placeholder: 'Ví dụ: iPhone của mẹ, tài khoản Netflix…',
    },
    step6: {
      title: '6. Còn điều gì chúng tôi cần biết không?',
      optional: '(không bắt buộc)',
      description:
        'Bạn chia sẻ càng nhiều bối cảnh, tài liệu của bạn sẽ càng đúng trọng tâm.',
      placeholder:
        'Ví dụ: Chúng tôi nhận được một email đáng ngờ tuần trước. Con thanh thiếu niên của chúng tôi cũng đang nhận được tin nhắn lạ trên Instagram…',
      tip: 'Mẹo: mô tả điều gì đã xảy ra, khi nào, và ai trong gia đình bạn bị ảnh hưởng.',
    },
    summary: {
      title: 'Tóm tắt đơn hàng',
      readyToSubmit: 'Sẵn sàng gửi',
      package: 'Gói dịch vụ',
      helpTopic: 'Chủ đề hỗ trợ',
      urgency: 'Mức khẩn cấp',
      delivery: 'Thời gian giao hàng',
      totalDue: 'Tổng cộng',
    },
    whatsUnlocked: {
      title: 'Bạn sẽ nhận được gì',
      includedWith: 'Bao gồm trong {{name}}',
      selectPrompt: 'Chọn một gói ở trên để xem những gì bạn sẽ nhận được.',
      notSelectedYet: 'Chưa chọn',
    },
    submit: {
      free: 'Mở khóa kế hoạch của tôi',
      paid: 'Tiếp tục thanh toán',
    },
    validation: {
      selectPackage: 'Vui lòng chọn một gói dịch vụ',
      helpTopicRequired: 'Vui lòng cho chúng tôi biết bạn cần hỗ trợ về vấn đề gì',
      notesLength: 'Ghi chú không được vượt quá 1000 ký tự',
    },
    bestFor: 'Phù hợp nhất với:',
    noPackagesAvailable: 'Hiện chưa có gói dịch vụ nào.',
  },

  // ── Urgency options ────────────────────────────────────────────────────────
  urgency: {
    routine: {
      label: 'Không gấp',
      body: 'Tôi muốn cải thiện an toàn cho gia đình, nhưng chưa có vấn đề cấp bách.',
    },
    urgent: {
      label: 'Cần chú ý',
      body: 'Gần đây có điều gì đó đáng lo ngại và tôi muốn giải quyết.',
    },
    critical: {
      label: 'Vấn đề đang diễn ra — khẩn cấp',
      body: 'Gia đình chúng tôi đang đối mặt với sự cố ngay lúc này và cần hướng dẫn gấp.',
    },
  },

  // ── How it works ──────────────────────────────────────────────────────────
  howItWorks: [
    {
      title: 'Thanh toán an toàn',
      body: 'Thanh toán của bạn được xử lý qua cổng bảo mật của chúng tôi. Các gói miễn phí bỏ qua bước này.',
    },
    {
      title: 'Chúng tôi chuẩn bị tài liệu của bạn',
      body: 'Chuyên viên tư vấn xem xét thông tin và cá nhân hóa kế hoạch hoặc gói của bạn — thường trong vòng 1 ngày làm việc.',
    },
    {
      title: 'Truy cập nội dung của bạn',
      body: 'Tài liệu an toàn của bạn sẽ được gửi đến tài khoản và hộp thư khi sẵn sàng.',
    },
  ],

  // ── Help topics quick-select ───────────────────────────────────────────────
  helpTopics: [
    'Bảo mật tài khoản & mật khẩu',
    'Lừa đảo qua email hoặc tin nhắn đáng ngờ',
    'Rò rỉ dữ liệu hoặc thông tin bị lộ',
    'An toàn trên mạng xã hội',
    'Bảo mật thiết bị & phần mềm độc hại',
    'Lừa đảo trực tuyến & gian lận',
    'An toàn trực tuyến cho trẻ em',
    'Cài đặt quyền riêng tư',
    'Đánh cắp danh tính',
  ],

  // ── Package metadata ───────────────────────────────────────────────────────
  packages: {
    freeCheck: {
      badge: 'Miễn phí — không cần thẻ',
      tagline: 'Biết chính xác mức độ rủi ro của bạn trong vài phút',
      bestFor: 'Gia đình mới bắt đầu với an toàn số, muốn có điểm xuất phát rõ ràng, không tốn phí',
      highlights: [
        'Báo cáo tóm tắt bảo mật có thể tải về',
        '3 hành động cá nhân hóa',
        'Danh sách kiểm tra an toàn cơ bản',
      ],
    },
    familyCore: {
      badge: 'Phổ biến nhất',
      tagline: 'Lộ trình an toàn toàn diện cho cả gia đình',
      bestFor:
        'Gia đình sẵn sàng cho một cuộc kiểm tra an toàn toàn diện trên tất cả tài khoản và thiết bị',
      highlights: [
        'Kế hoạch an toàn gia đình cá nhân hóa (PDF)',
        'Danh sách kiểm tra an toàn tương tác cao cấp',
        'Kết quả kiểm tra mật khẩu & tài khoản',
      ],
    },
    incidentResp: {
      badge: 'Dành cho sự cố đang xảy ra',
      tagline: 'Ngăn chặn mối đe dọa đang xảy ra và biết chính xác cần làm gì tiếp theo',
      bestFor: 'Gia đình đang đối mặt với vi phạm bảo mật, lừa đảo hoặc rò rỉ dữ liệu đang diễn ra',
      highlights: [
        'Gói phục hồi sự cố do chuyên gia soạn thảo',
        'Danh sách kiểm tra kiềm chế mối đe dọa từng bước',
        'Hướng dẫn giám sát và kế hoạch theo dõi',
      ],
    },
    annualPlan: {
      badge: 'Giá trị nhất',
      tagline: 'Đi trước các mối đe dọa cả năm với hướng dẫn từ chuyên gia',
      bestFor: 'Gia đình muốn bảo vệ liên tục và ưu tiên truy cập quanh năm',
      highlights: [
        '4 lần cập nhật kế hoạch an toàn hàng quý',
        'Phản hồi sự cố ưu tiên — SLA 24 giờ',
        'Lộ trình bảo mật gia đình đầy đủ (PDF)',
        'Truy cập tư vấn không giới hạn trong 12 tháng',
      ],
    },
  },

  // ── Package deliverables ───────────────────────────────────────────────────
  deliverables: {
    freeCheck: [
      'Báo cáo tóm tắt bảo mật số có thể tải về',
      '3 hành động cá nhân hóa',
      'Danh sách kiểm tra an toàn cơ bản',
    ],
    familyCore: [
      'Kế hoạch an toàn gia đình cá nhân hóa (PDF)',
      'Danh sách kiểm tra an toàn tương tác cao cấp',
      'Kết quả kiểm tra mật khẩu & tài khoản',
    ],
    incidentResp: [
      'Gói phục hồi sự cố (hướng dẫn từng bước)',
      'Danh sách kiểm tra kiềm chế mối đe dọa',
      'Kế hoạch hành động theo dõi & hướng dẫn giám sát',
    ],
    annualPlan: [
      '4 lần cập nhật kế hoạch an toàn hàng quý',
      'Phản hồi sự cố ưu tiên (SLA 24 giờ)',
      'Lộ trình bảo mật gia đình đầy đủ (PDF)',
    ],
  },

  // ── My Bookings page ──────────────────────────────────────────────────────
  myBookings: {
    title: 'Lịch đặt của tôi',
    description: 'Các buổi an toàn sắp tới và đã qua của bạn.',
    bookSession: 'Đặt buổi tư vấn',
    loadError: 'Không thể tải lịch đặt. Vui lòng làm mới và thử lại.',
  },

  // ── Payment action strip ──────────────────────────────────────────────────
  payment: {
    required: 'Cần thanh toán để xác nhận lịch đặt của bạn',
    payNow: 'Thanh toán ngay',
    waitingConfirmation: 'Đang chờ xác nhận thanh toán',
    failedRetry: 'Thanh toán bị từ chối — bạn có thể thử lại',
    expired: 'Phiên thanh toán đã hết hạn — bắt đầu phiên mới',
    failedAction: 'Thất bại — thử lại',
    retry: 'Thử lại',
    free: 'Miễn phí',
  },
} as const

export default bookings
