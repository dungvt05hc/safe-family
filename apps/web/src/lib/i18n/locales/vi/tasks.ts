const tasks = {
  // ── Pages ────────────────────────────────────────────────────────────────────
  safetyTasks: {
    pageTitle:       'Việc cần làm',
    pageDescription: 'Các bước cụ thể giúp gia đình bạn an toàn hơn trên mạng.',
  },
  premiumChecklist: {
    pageTitle:             'Danh sách kiểm tra cao cấp',
    pageDescription:       'Danh sách việc cần làm được cá nhân hóa, sắp xếp theo mức độ khẩn cấp.',
    pageDescriptionLocked: 'Danh sách việc cần làm được cá nhân hóa dành riêng cho gia đình bạn.',
    annualPlanPitch:       'Mở khóa các việc cần làm định kỳ hàng năm và kiểm tra bảo mật theo năm cho cả gia đình.',
  },

  // ── Enum labels ───────────────────────────────────────────────────────────────
  phase: {
    Immediate:  'Làm ngay',
    Next7Days:  'Tuần này',
    Next30Days: 'Tháng này',
    Ongoing:    'Thường xuyên',
    Recurring:  'Định kỳ',
  },
  priority: {
    High:   'Cao',
    Medium: 'Trung bình',
    Low:    'Thấp',
  },
  status: {
    Pending:    'Chưa làm',
    InProgress: 'Đang làm',
    Completed:  'Hoàn thành',
    Dismissed:  'Bỏ qua',
    Superseded: 'Đã thay thế',
  },
  category: {
    AccountSecurity: 'Bảo mật tài khoản',
    DeviceHygiene:   'Thiết bị an toàn',
    PrivacySharing:  'Quyền riêng tư',
    BackupRecovery:  'Sao lưu & Phục hồi',
    ScamReadiness:   'Nhận biết lừa đảo',
    NetworkSecurity: 'An toàn mạng',
    FamilySafety:    'An toàn gia đình',
  },

  // ── Summary cards ─────────────────────────────────────────────────────────────
  summary: {
    total:           'Tổng số việc',
    completed:       'Đã hoàn thành',
    actNow:          'Làm ngay',
    actNowSub:       'Ưu tiên tối cao',
    highPriority:    'Ưu tiên cao',
    highPrioritySub: 'Chưa xong',
    inProgress:      'Đang thực hiện',
    completePct:     'Đã hoàn thành {{pct}}%',
  },

  // ── Filters ───────────────────────────────────────────────────────────────────
  filter: {
    filtersLabel:      'Lọc',
    searchLabel:       'Tìm kiếm',
    searchPlaceholder: 'Tìm kiếm việc cần làm…',
    statusLabel:       'Trạng thái',
    priorityLabel:     'Mức độ ưu tiên',
    phaseLabel:        'Giai đoạn',
    categoryLabel:     'Nhóm',
    allStatuses:       'Tất cả trạng thái',
    allPriorities:     'Tất cả mức độ',
    allPhases:         'Tất cả giai đoạn',
    allCategories:     'Tất cả nhóm',
    clearFilters:      'Xoá bộ lọc',
    taskCount_one:     '{{count}} việc',
    taskCount_other:   '{{count}} việc',
  },

  // ── Card actions & labels ─────────────────────────────────────────────────────
  card: {
    markDone:        'Đánh dấu xong',
    start:           'Bắt đầu',
    reopen:          'Mở lại',
    dismiss:         'Bỏ qua',
    guide:           'Hướng dẫn',
    overduePrefix:   'Quá hạn · ',
    duePrefix:       'Hạn · ',
    whyThisMatters:  'Tại sao cần làm?',
    stepByStepGuide: 'Hướng dẫn từng bước',
    howToResolve:    'Cách thực hiện',
    allDone:         'Xong tất cả',
  },

  // ── Empty states ──────────────────────────────────────────────────────────────
  empty: {
    noTasksTitle:        'Chưa có việc nào cần làm',
    noTasksDesc:         'SafeFamily tạo danh sách việc cần làm từ tài khoản và thiết bị của bạn. Hãy thêm tài khoản hoặc thiết bị để bắt đầu.',
    noPremiumTasksTitle: 'Chưa có việc nào cần làm',
    noPremiumTasksDesc:  'SafeFamily tạo danh sách việc cần làm từ kết quả kiểm tra, tài khoản, thiết bị và gói dịch vụ của bạn. Hãy hoàn thành bài kiểm tra an toàn trước.',
    noResultsTitle:      'Không tìm thấy kết quả',
    noResultsDesc:       'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.',
  },
} as const

export default tasks
