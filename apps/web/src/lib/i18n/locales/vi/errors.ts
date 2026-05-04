const errors = {
  // HTTP status / network categories
  network: 'Không thể kết nối. Vui lòng kiểm tra kết nối internet và thử lại.',
  unauthorized: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  forbidden: 'Bạn không có quyền truy cập nội dung này.',
  notFound: 'Không tìm thấy nội dung bạn yêu cầu.',
  paymentRequired: 'Tính năng này yêu cầu gói đăng ký.',
  conflict: 'Thông tin này đã tồn tại.',
  serverError: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
  unknown: 'Đã xảy ra sự cố. Vui lòng thử lại.',
  // Load errors (entity-specific)
  load: {
    accounts: 'Không thể tải danh sách tài khoản.',
    devices: 'Không thể tải danh sách thiết bị.',
    incidents: 'Không thể tải danh sách sự cố.',
    tasks: 'Không thể tải danh sách việc cần làm.',
    family: 'Không thể tải dữ liệu gia đình.',
    dashboard: 'Không thể tải trang chính.',
    bookings: 'Không thể tải danh sách lịch đặt.',
    reports: 'Không thể tải danh sách báo cáo.',
    checklist: 'Không thể tải danh sách kiểm tra.',
    members: 'Không thể tải danh sách thành viên.',
    plans: 'Không thể tải kế hoạch an toàn.',
    assessments: 'Không thể tải lịch sử kiểm tra.',
  },
  // Mutation errors
  mutation: {
    emailConflict: 'Email này đã được đăng ký.',
    familyConflict: 'Bạn đã là thành viên của một gia đình.',
    generic: 'Đã xảy ra sự cố. Vui lòng thử lại.',
  },
  // 404 / error page
  notFoundPage: {
    title404: 'Không tìm thấy trang',
    titleGeneric: 'Đã xảy ra lỗi',
    desc404: 'Trang này không tồn tại hoặc đã được di chuyển.',
    descGeneric: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
    backHome: '← Về trang chủ',
  },
} as const

export default errors
