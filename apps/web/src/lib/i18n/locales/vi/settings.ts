const settings = {
  title: 'Cài đặt',
  description: 'Quản lý thông tin cá nhân, bảo mật, thông báo và quyền riêng tư của bạn.',
  nav: 'Mục cài đặt',

  tabs: {
    profile:       'Hồ sơ',
    security:      'Bảo mật',
    notifications: 'Thông báo',
    privacy:       'Quyền riêng tư',
    preferences:   'Tuỳ chọn',
    danger:        'Vùng nguy hiểm',
  },

  profile: {
    tabTitle:       'Hồ sơ cá nhân',
    tabDescription: 'Cập nhật tên hiển thị, địa chỉ email và số điện thoại của bạn.',
    cardTitle:      'Thông tin cá nhân',
    fullName:       'Họ và tên',
    email:          'Địa chỉ email',
    emailReadonly:  'Địa chỉ email không thể thay đổi tại đây.',
    phone:          'Số điện thoại',
    saveChanges:    'Lưu thay đổi',
    saved:          'Thông tin cá nhân đã được cập nhật thành công.',
    error:          'Không thể lưu thông tin. Vui lòng thử lại.',
  },

  security: {
    tabTitle:        'Mật khẩu & Bảo mật',
    tabDescription:  'Sử dụng mật khẩu mạnh và riêng biệt để bảo vệ tài khoản của bạn.',
    cardTitle:       'Đổi mật khẩu',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword:     'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    showPassword:    'Hiện mật khẩu',
    hidePassword:    'Ẩn mật khẩu',
    tip:             'Sử dụng ít nhất 8 ký tự, gồm một chữ hoa và một chữ số. Tuyệt đối không chia sẻ mật khẩu với bất kỳ ai — nhân viên SafeFamily sẽ không bao giờ hỏi mật khẩu của bạn.',
    updatePassword:  'Cập nhật mật khẩu',
    saved:           'Mật khẩu đã được thay đổi thành công.',
    error:           'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại và thử lại.',
  },

  notifications: {
    tabTitle:       'Thông báo',
    tabDescription: 'Chọn loại thông báo bạn muốn nhận qua email.',
    cardTitle:      'Tuỳ chọn thông báo',
    email: {
      label:       'Thông báo qua email',
      description: 'Nhận bản tóm tắt bảo mật hàng tuần và các thông báo quan trọng về tài khoản qua email.',
    },
    bookingUpdates: {
      label:       'Cập nhật lịch tư vấn',
      description: 'Nhận thông báo khi buổi tư vấn được xác nhận, thay đổi lịch hoặc huỷ bỏ.',
    },
    incidentAlerts: {
      label:       'Cảnh báo sự cố',
      description: 'Nhận cảnh báo ngay lập tức khi có báo cáo sự cố mới liên quan đến gia đình bạn.',
    },
    reminders: {
      label:       'Nhắc nhở bảo mật',
      description: 'Nhắc nhở định kỳ để hoàn thành danh sách kiểm tra bảo mật và kiểm tra rủi ro.',
    },
    savePreferences: 'Lưu tuỳ chọn',
    saved:           'Tuỳ chọn thông báo đã được lưu.',
    error:           'Không thể lưu tuỳ chọn thông báo. Vui lòng thử lại.',
  },

  privacy: {
    tabTitle:       'Quyền riêng tư',
    tabDescription: 'Kiểm soát dữ liệu cá nhân và tìm hiểu cách SafeFamily sử dụng thông tin của bạn.',
    cardTitle:      'Quyền riêng tư & Dữ liệu',
    infoBanner: {
      title: 'Dữ liệu của bạn thuộc về bạn',
      body:  'SafeFamily chỉ lưu những thông tin cần thiết để bảo vệ gia đình bạn. Bạn có thể yêu cầu xuất toàn bộ dữ liệu bất kỳ lúc nào — chúng tôi sẽ gửi đường dẫn tải xuống đến email của bạn trong vòng 48 giờ.',
    },
    exportData: {
      title:     'Xuất dữ liệu cá nhân',
      description:
        'Tải về bản sao toàn bộ dữ liệu SafeFamily lưu trữ về tài khoản, thành viên gia đình và lịch sử hoạt động của bạn.',
      button:    'Yêu cầu xuất dữ liệu',
      requested: 'Đã gửi yêu cầu',
      success:   'Yêu cầu đã được tiếp nhận! Chúng tôi sẽ gửi đường dẫn tải xuống đến email của bạn trong vòng 48 giờ.',
      error:     'Không thể gửi yêu cầu. Vui lòng thử lại sau.',
    },
    privacyPolicy: 'Chính sách quyền riêng tư',
    howWeUseData:  'Cách chúng tôi sử dụng dữ liệu của bạn',
  },

  preferences: {
    tabTitle:       'Tuỳ chọn',
    tabDescription: 'Tuỳ chỉnh ngôn ngữ hiển thị trong ứng dụng.',
    language: {
      cardTitle:   'Ngôn ngữ',
      description: 'Chọn ngôn ngữ sử dụng xuyên suốt ứng dụng. Lựa chọn được lưu cục bộ và sẽ được ghi nhớ trên thiết bị này.',
      ariaLabel:   'Ngôn ngữ ứng dụng',
    },
  },

  danger: {
    tabTitle:       'Vùng nguy hiểm',
    tabDescription: 'Các thao tác không thể hoàn tác, ảnh hưởng vĩnh viễn đến tài khoản của bạn.',
    zoneTitle:      'Vùng nguy hiểm',
    deleteAccount: {
      title: 'Xoá tài khoản',
      description:
        'Xoá vĩnh viễn tài khoản SafeFamily, toàn bộ dữ liệu gia đình và các hồ sơ liên quan. Thao tác này không thể hoàn tác.',
      button: 'Xoá tài khoản',
    },
    deleteConfirm: {
      warning:
        'Đây là thao tác không thể hoàn tác. Toàn bộ dữ liệu gia đình, kiểm tra rủi ro, báo cáo sự cố và lịch sử đặt lịch sẽ bị xoá vĩnh viễn. Quyền truy cập của bạn sẽ bị thu hồi ngay lập tức.',
      confirmLabel:       'Nhập {{phrase}} để xác nhận',
      confirmLabelBefore: 'Nhập',
      confirmLabelAfter:  'để xác nhận',
      deleteButton: 'Xoá tài khoản vĩnh viễn',
      cancel:       'Huỷ',
      success:
        'Yêu cầu xoá tài khoản đã được tiếp nhận. Đội ngũ chúng tôi sẽ xử lý trong vòng 30 ngày và gửi xác nhận đến địa chỉ email đã đăng ký của bạn.',
      error: 'Không thể gửi yêu cầu xoá. Vui lòng thử lại.',
    },
  },

  validation: {
    profile: {
      fullNameMin:  'Họ và tên phải có ít nhất 2 ký tự',
      phoneInvalid: 'Vui lòng nhập số điện thoại hợp lệ',
    },
    security: {
      currentPasswordRequired: 'Vui lòng nhập mật khẩu hiện tại',
      newPasswordMin:          'Mật khẩu mới phải có ít nhất 8 ký tự',
      newPasswordUppercase:    'Mật khẩu cần có ít nhất một chữ hoa',
      newPasswordNumber:       'Mật khẩu cần có ít nhất một chữ số',
      confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu mới',
      passwordsMismatch:       'Hai mật khẩu không khớp nhau',
    },
  },
} as const

export default settings
