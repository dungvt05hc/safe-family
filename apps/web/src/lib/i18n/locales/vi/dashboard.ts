const dashboard = {
  // ── Welcome banner ──────────────────────────────────────────────────────────
  welcomeBackTo:          'Chào mừng {{name}} quay trở lại',
  welcomeBackUser:        'Xin chào, {{name}}!',
  welcomeBackGeneric:     'Xin chào trở lại!',
  safetyAtAGlance:        'Tổng quan an toàn số của gia đình bạn.',
  setupPrompt:            'Hãy tạo hồ sơ gia đình để bắt đầu.',
  createFamily:           'Tạo gia đình →',
  setupFamilyTitle:       'Thiết lập hồ sơ gia đình',
  setupFamilyDescription: 'Tạo hồ sơ gia đình để theo dõi an toàn số, quản lý thành viên, thiết bị, tài khoản và nhiều hơn nữa.',
  loadError:              'Không thể tải trang chính. Vui lòng thử lại.',

  // ── Summary cards ────────────────────────────────────────────────────────────
  members:         'Thành viên',
  familyMembers:   'Thành viên gia đình',
  accounts:        'Tài khoản',
  devices:         'Thiết bị',
  incidents:       'Sự cố',
  activeIncidents: 'Sự cố đang xử lý',

  // ── Quick actions ─────────────────────────────────────────────────────────────
  addMember:      'Thêm thành viên',
  addAccount:     'Thêm tài khoản',
  runRiskCheck:   'Kiểm tra rủi ro',
  reportIncident: 'Báo cáo sự cố',
  bookSupport:    'Đặt lịch hỗ trợ',

  // ── Section headings ─────────────────────────────────────────────────────────
  quickActions:   'Thao tác nhanh',
  recentActivity: 'Hoạt động gần đây',
  overview:       'Tổng quan',

  // ── Risk score card ──────────────────────────────────────────────────────────
  riskScore: 'Điểm rủi ro gia đình',
  riskLevel: {
    Low:      'Rủi ro thấp',
    Medium:   'Rủi ro trung bình',
    High:     'Rủi ro cao',
    Critical: 'Rủi ro nghiêm trọng',
  },
  rerunAssessment:    'Kiểm tra lại →',
  noAssessmentYet:    'Chưa có kết quả kiểm tra. Hãy kiểm tra an toàn để xem điểm của bạn.',
  lastAssessed:       'Kiểm tra lúc {{date}}',

  // ── Immediate actions ─────────────────────────────────────────────────────────
  immediateActions:    'Việc cần làm ngay',
  allClear:            'Không có việc cần làm ngay — bạn đang làm rất tốt!',
  runAssessmentPrompt: 'Thực hiện kiểm tra an toàn để nhận gợi ý bảo mật cá nhân hóa.',
  viewFullAssessment:  'Xem kết quả kiểm tra',

  // ── Recent activity ──────────────────────────────────────────────────────────
  noRecentActivity:  'Chưa có hoạt động nào. Sự cố và lịch hẹn sẽ hiển thị ở đây.',
  reportIncidentCta: 'Báo cáo sự cố →',
  bookSessionCta:    'Đặt lịch hỗ trợ →',
  bookedOn:          'Đặt ngày {{date}}',
  allIncidents:      'Tất cả sự cố →',
  allBookings:       'Tất cả lịch hẹn →',

  // ── Severity labels ──────────────────────────────────────────────────────────
  severity: {
    Low:      'Thấp',
    Medium:   'Trung bình',
    High:     'Cao',
    Critical: 'Nghiêm trọng',
  },

  // ── Booking status labels ────────────────────────────────────────────────────
  bookingStatus: {
    Pending:    'Chờ xác nhận',
    Confirmed:  'Đã xác nhận',
    InProgress: 'Đang xử lý',
    Cancelled:  'Đã hủy',
    Completed:  'Hoàn thành',
  },

  // ── Annual plan card ─────────────────────────────────────────────────────────
  annualPlan: {
    badge:              'Gói Năm',
    activeSubscription: 'Đang kích hoạt',
    benefit1:           'Kế hoạch An toàn Gia đình — không giới hạn',
    benefit2:           'Phản hồi sự cố trong 24 giờ',
    benefit3:           '4 lần cập nhật kế hoạch an toàn mỗi năm',
    viewSafetyPlans:    'Xem Kế hoạch An toàn →',
    recoveryPacks:      'Gói Phục hồi →',
    upgradeTitle:       'Mở khóa lợi ích Gói Năm',
    upgradeBody:        'Truy cập không giới hạn vào Kế hoạch An toàn, xử lý sự cố ưu tiên và cập nhật hàng quý cho toàn bộ gia đình.',
    viewPackages:       'Xem các gói →',
  },
} as const

export default dashboard
