const errors = {
  // HTTP status / network categories
  network: 'Không thể kết nối. Vui lòng kiểm tra kết nối internet và thử lại.',
  unauthorized: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  forbidden: 'Bạn không có quyền truy cập nội dung này.',
  notFound: 'Không tìm thấy nội dung bạn yêu cầu.',
  paymentRequired: 'Cần có gói đăng ký đang hoạt động để truy cập tính năng này.',
  conflict: 'Thông tin này đã tồn tại.',
  serverError: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
  unknown: 'Đã xảy ra sự cố. Vui lòng thử lại.',
  // Load errors (entity-specific)
  load: {
    accounts: 'Không thể tải danh sách tài khoản.',
    devices: 'Không thể tải danh sách thiết bị.',
    incidents: 'Không thể tải danh sách sự cố.',
    tasks: 'Không thể tải danh sách nhiệm vụ an toàn.',
    family: 'Không thể tải dữ liệu gia đình.',
    dashboard: 'Không thể tải trang chính.',
  },
  // Mutation errors
  mutation: {
    emailConflict: 'Email này đã được đăng ký.',
    familyConflict: 'Bạn đã là thành viên của một gia đình.',
    generic: 'Đã xảy ra sự cố. Vui lòng thử lại.',
  },
} as const

export default errors
