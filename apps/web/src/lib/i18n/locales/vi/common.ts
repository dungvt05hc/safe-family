const common = {
  save: 'Lưu',
  saving: 'Đang lưu…',
  saved: 'Đã lưu',
  cancel: 'Hủy',
  confirm: 'Xác nhận',
  delete: 'Xóa',
  edit: 'Chỉnh sửa',
  add: 'Thêm',
  close: 'Đóng',
  back: 'Quay lại',
  next: 'Tiếp theo',
  submit: 'Gửi',
  submitting: 'Đang gửi…',
  retry: 'Thử lại',
  loading: 'Đang tải…',
  error: 'Đã xảy ra lỗi',
  notFound: 'Không tìm thấy',
  signOut: 'Đăng xuất',
  signingOut: 'Đang đăng xuất…',
  backToDashboard: 'Về trang chính',
  comingSoon: 'Sắp ra mắt',
  profile: 'Hồ sơ',
  settings: 'Cài đặt',
  logOut: 'Đăng xuất',
  signIn: 'Đăng nhập',
  signUp: 'Đăng ký',
  home: 'Trang chủ',
  navigation: 'Điều hướng',
  closeNavigation: 'Đóng menu',
  includedWith: 'Bao gồm trong {{name}}',
  viewPackages: 'Xem gói dịch vụ',
  backToDashboardLabel: 'Về trang chính',
  // Family form labels
  familyName: 'Tên gia đình',
  countryCode: 'Mã quốc gia',
  countryCodeHint: 'ISO 3166-1 alpha-2 (ví dụ: US, BR, GB)',
  timezone: 'Múi giờ',
  timezoneHint: 'Múi giờ IANA (ví dụ: Europe/London)',
  createFamily: 'Tạo gia đình',
  creatingFamily: 'Đang tạo…',
  featureFlags: {
    booking: {
      title: 'Đặt lịch',
      description:
        'Tính năng đặt lịch trực tuyến chưa có ở khu vực của bạn. Chúng tôi đang nỗ lực đưa tính năng này đến với bạn trong thời gian sớm nhất.',
    },
    payments: {
      title: 'Thanh toán',
      description:
        'Thanh toán trực tuyến chưa có sẵn ở khu vực của bạn. Liên hệ đội ngũ hỗ trợ của chúng tôi để biết thêm.',
    },
    plans: {
      title: 'Kế hoạch an toàn',
      description:
        'Kế hoạch an toàn cao cấp chưa có trong gói hiện tại của bạn. Nâng cấp gói để truy cập các tài liệu an toàn và phục hồi được cá nhân hóa.',
    },
  },
} as const

export default common
