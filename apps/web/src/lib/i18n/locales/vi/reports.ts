const reports = {
  // ── Trang báo cáo ─────────────────────────────────────────────────────────
  title:       'Báo cáo bảo mật',
  description: 'Xem và tải xuống các báo cáo bảo mật được tạo từ kiểm tra rủi ro, sự cố và các buổi tư vấn gia đình.',
  loadError:   'Không thể tải danh sách báo cáo. Vui lòng thử lại.',

  // ── Thống kê ──────────────────────────────────────────────────────────────
  stats: {
    totalReports: 'Tổng số báo cáo',
    assessments:  'Kiểm tra rủi ro',
    incidents:    'Sự cố',
    lastReport:   'Báo cáo gần nhất',
  },

  // ── Loại báo cáo ──────────────────────────────────────────────────────────
  types: {
    All:              { label: 'Tất cả loại' },
    Assessment:       { label: 'Kiểm tra rủi ro' },
    Incident:         { label: 'Sự cố' },
    FamilyReset:      { label: 'Tái thiết bảo mật gia đình' },
    SafetyPlan:       { label: 'Kế hoạch bảo mật' },
    IncidentRecovery: { label: 'Gói phục hồi sự cố' },
  },

  // ── Bộ lọc ────────────────────────────────────────────────────────────────
  filters: {
    searchLabel:       'Tìm kiếm',
    searchPlaceholder: 'Lọc theo tiêu đề…',
    typeLabel:         'Loại báo cáo',
    dateFromLabel:     'Từ ngày',
    dateToLabel:       'Đến ngày',
    clearButton:       'Xóa bộ lọc',
    resultCount_one:   '{{count}} báo cáo',
    resultCount_other: '{{count}} báo cáo',
  },

  // ── Thẻ báo cáo ───────────────────────────────────────────────────────────
  card: {
    viewButton:        'Xem',
    downloadButton:    'Tải xuống',
    unlockButton:      'Mở khóa',
    premiumLabel:      'Cao cấp',
    lockedDescription: 'Mua gói phù hợp để mở khóa báo cáo này.',
  },

  // ── Bảng xem trước ────────────────────────────────────────────────────────
  preview: {
    noReportSelected: 'Chưa chọn báo cáo',
    noReportHint:     'Chọn một báo cáo trong danh sách để xem nội dung đầy đủ tại đây.',
    closePreview:     'Đóng bảng xem trước',
    downloading:      'Đang tải xuống…',
    downloadReport:   'Tải xuống báo cáo',
  },

  // ── Trạng thái rỗng ───────────────────────────────────────────────────────
  list: {
    noReportsTitle:       'Chưa có báo cáo nào',
    noReportsDescription: 'Báo cáo được tạo sau khi bạn hoàn thành kiểm tra rủi ro hoặc báo cáo sự cố. Hãy bắt đầu từ đây để có báo cáo đầu tiên.',
    runRiskCheck:         'Kiểm tra rủi ro',
    bookFamilyReset:      'Đặt lịch tư vấn gia đình',
    noResultsTitle:       'Không tìm thấy báo cáo phù hợp',
    noResultsDescription: 'Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc để tìm kết quả.',
  },
} as const

export default reports
