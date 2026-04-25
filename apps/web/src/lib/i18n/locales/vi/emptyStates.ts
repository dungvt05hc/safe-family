const emptyStates = {
  familyMembers: {
    title: 'Chưa có thành viên',
    description:
      'Thêm các thành viên trong gia đình để theo dõi an toàn kỹ thuật số và thói quen trực tuyến của họ.',
    action: 'Thêm thành viên',
  },
  accounts: {
    title: 'Chưa theo dõi tài khoản nào',
    description:
      'Đăng ký tài khoản trực tuyến của gia đình để theo dõi xác thực hai yếu tố, cài đặt khôi phục và hoạt động đáng ngờ.',
    action: 'Thêm tài khoản',
  },
  devices: {
    title: 'Chưa đăng ký thiết bị nào',
    description:
      'Thêm điện thoại, máy tính bảng và máy tính của gia đình để kiểm tra tình trạng bảo mật — khóa màn hình, sao lưu, hỗ trợ hệ điều hành và nhiều hơn nữa.',
    action: 'Thêm thiết bị',
  },
  incidents: {
    title: 'Chưa có sự cố nào',
    description:
      'Tất cả ổn! Nếu gia đình bạn gặp phải lừa đảo, đăng nhập đáng ngờ hay bất kỳ mối đe dọa nào, hãy báo cáo ở đây để chúng tôi hướng dẫn bạn các bước tiếp theo.',
    action: 'Báo cáo sự cố',
  },
  bookings: {
    title: 'Chưa có lịch đặt nào',
    description:
      'Đặt buổi tư vấn an toàn riêng với chuyên gia của chúng tôi. Chúng tôi sẽ giúp gia đình bạn tăng cường mật khẩu, kiểm tra bảo mật thiết bị và bảo vệ trước các mối đe dọa trực tuyến.',
    action: 'Đặt buổi tư vấn',
  },
} as const

export default emptyStates
