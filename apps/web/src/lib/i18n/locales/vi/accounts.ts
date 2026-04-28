const accounts = {
  pageTitle: 'Tài khoản trực tuyến',
  pageDescription: 'Theo dõi các tài khoản của gia đình và tình trạng bảo mật.',
  addAccount: '+ Thêm tài khoản',
  archiveConfirm: 'Ẩn tài khoản này? Dữ liệu sẽ được giữ lại nhưng không hiển thị trong danh sách.',

  filter: {
    allMembers: 'Tất cả thành viên',
    allTypes: 'Tất cả loại',
    searchPlaceholder: 'Tìm theo tên đăng nhập hoặc ghi chú…',
    clearFilters: 'Xóa bộ lọc',
  },

  col: {
    member: 'Thành viên',
    type: 'Loại tài khoản',
    identifier: 'Tên đăng nhập',
    twoFactor: 'Xác minh 2 bước',
    recoveryEmail: 'Email khôi phục',
    recoveryPhone: 'SĐT khôi phục',
    suspicious: 'Hoạt động bất thường',
  },

  twoFactor: {
    Unknown: 'Chưa biết',
    Enabled: 'Đã bật',
    Disabled: 'Chưa bật',
  },

  recovery: {
    Unknown: 'Chưa biết',
    Set: 'Đã thiết lập',
    NotSet: 'Chưa thiết lập',
  },

  suspiciousYes: '⚠ Có',
  suspiciousBadge: '⚠ Bất thường',

  action: {
    edit: 'Chỉnh sửa',
    archive: 'Ẩn đi',
  },

  accountType: {
    Email: 'Email',
    SocialMedia: 'Mạng xã hội',
    Banking: 'Ngân hàng',
    Shopping: 'Mua sắm trực tuyến',
    Streaming: 'Xem phim / Nhạc trực tuyến',
    Gaming: 'Trò chơi điện tử',
    Government: 'Dịch vụ công / Chính phủ',
    Healthcare: 'Y tế / Bệnh viện',
    Insurance: 'Bảo hiểm',
    Utility: 'Dịch vụ tiện ích (điện, nước…)',
    Work: 'Công việc',
    Other: 'Khác',
  },

  modal: {
    addTitle: 'Thêm tài khoản',
    editTitle: 'Chỉnh sửa tài khoản',
    addSubmit: 'Thêm tài khoản',
    editSubmit: 'Lưu thay đổi',
  },

  form: {
    memberLabel: 'Thành viên trong gia đình',
    memberPlaceholder: '— Không chỉ định (dùng chung) —',
    accountType: 'Loại tài khoản',
    maskedIdentifier: 'Nhãn tài khoản',
    maskedIdentifierPlaceholder: 'Ví dụ: ****@gmail.com hoặc ACB ****4321',
    maskedIdentifierHint: 'Không nhập mật khẩu — chỉ nhập nhãn hiển thị an toàn.',
    twoFactor: 'Xác minh 2 bước',
    recoveryEmail: 'Email khôi phục',
    recoveryPhone: 'Số điện thoại khôi phục',
    suspiciousFlag: 'Đánh dấu hoạt động bất thường',
    notes: 'Ghi chú',
    notesPlaceholder: 'Thêm thông tin bổ sung nếu cần…',
    save: 'Lưu',
    saving: 'Đang lưu…',
    cancel: 'Hủy',
  },
} as const

export default accounts
