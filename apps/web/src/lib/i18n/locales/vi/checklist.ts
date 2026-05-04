const checklist = {
  title:       'Danh sách kiểm tra',
  description: 'Theo dõi các việc cần làm quan trọng nhất để bảo vệ an toàn cho gia đình trên mạng.',
  lockedBanner: {
    title:  'Một số mục đang bị ẩn',
      body: 'Những mục này được tạo từ buổi tư vấn an toàn của bạn và được bao gồm trong gói Family Core hoặc Gói Năm.',
    unlock: 'Mở khóa ngay',
  },
  loadError: 'Không thể tải danh sách kiểm tra.',

  // ── Summary cards ───────────────────────────────────────────────────────────
  summary: {
    total:        'Tổng số mục',
    highPriority: 'Ưu tiên cao',
    toDo:         'Chưa làm',
    completed:    'Đã hoàn thành',
  },

  // ── Filters ─────────────────────────────────────────────────────────────────
  filter: {
    searchLabel:       'Tìm kiếm',
    searchPlaceholder: 'Tìm theo tiêu đề…',
    severityLabel:     'Mức độ',
    statusLabel:       'Trạng thái',
    categoryLabel:     'Nhóm',
    allSeverities:     'Tất cả mức độ',
    allStatuses:       'Tất cả trạng thái',
    allCategories:     'Tất cả nhóm',
    clearFilters:      'Xoá bộ lọc',
    itemCount_one:     '{{count}} mục',
    itemCount_other:   '{{count}} mục',
  },

  // ── Labels ──────────────────────────────────────────────────────────────────
  priority: {
    1: 'Cao',
    2: 'Trung bình',
    3: 'Thấp',
  },
  status: {
    Pending:    'Chưa làm',
    InProgress: 'Đang làm',
    Completed:  'Hoàn thành',
    Dismissed:  'Đã bỏ qua',
  },
  category: {
    AccountSecurity: 'Bảo mật tài khoản',
    DeviceHygiene:   'Thiết bị',
    BackupRecovery:  'Sao lưu',
    PrivacySharing:  'Quyền riêng tư',
    ScamReadiness:   'Nhận biết lừa đảo',
    General:         'Chung',
  },

  // ── Card actions ────────────────────────────────────────────────────────────
  card: {
    markDone:      'Đánh dấu xong',
    start:         'Bắt đầu',
    reopen:        'Mở lại',
    skip:          'Bỏ qua',
    bookHelp:      'Đặt lịch hỗ trợ',
    openGuide:     'Xem hướng dẫn',
    guide:         'Hướng dẫn',
    overduePrefix: 'Quá hạn · ',
    duePrefix:     'Hạn · ',
  },

  // ── Empty states ─────────────────────────────────────────────────────────────
  empty: {
    noItemsTitle:   'Danh sách đang trống',
    noItemsDesc:    'SafeFamily tự động tạo danh sách kiểm tra từ tài khoản và thiết bị của bạn. Hãy thêm chúng để xem các việc quan trọng nhất cần làm.',
    noResultsTitle: 'Không tìm thấy kết quả',
    noResultsDesc:  'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.',
  },
} as const

export default checklist
