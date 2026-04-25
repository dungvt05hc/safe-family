const common = {
  save: 'Lưu',
  cancel: 'Hủy',
  loading: 'Đang tải…',
  error: 'Đã xảy ra lỗi',
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
        'Tính năng thanh toán chưa được kích hoạt cho tài khoản của bạn. Vui lòng liên hệ quản trị viên để bật tính năng này.',
    },
    plans: {
      title: 'Kế hoạch an toàn',
      description:
        'Gói Kế hoạch An toàn Premium chưa được bật trong gói đăng ký hiện tại. Nâng cấp gói để truy cập các tài nguyên phục hồi và an toàn được cá nhân hóa.',
    },
  },
} as const

export default common
