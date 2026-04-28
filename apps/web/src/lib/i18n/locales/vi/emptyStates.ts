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
      'Hiện tại mọi thứ đều ổn. Nếu gia đình gặp phải lừa đảo, đăng nhập lạ hay bất kỳ mối đe dọa nào, hãy báo cáo để chúng tôi hướng dẫn bạn từng bước xử lý.',
    action: 'Báo cáo sự cố',
  },
  bookings: {
    title: 'Chưa có lịch đặt nào',
    description:
      'Đặt buổi tư vấn an toàn riêng với chuyên gia của chúng tôi. Chúng tôi sẽ giúp gia đình bạn tăng cường mật khẩu, kiểm tra bảo mật thiết bị và bảo vệ trước các mối đe dọa trực tuyến.',
    action: 'Đặt buổi tư vấn',
  },
  reports: {
    title: 'Chưa có báo cáo nào',
    description:
      'Báo cáo được tạo sau khi bạn hoàn thành kiểm tra rủi ro hoặc báo cáo sự cố.',
    action: 'Kiểm tra rủi ro',
  },
  tasks: {
    title: 'Chưa có việc nào cần làm',
    description:
      'SafeFamily tạo danh sách việc cần làm từ tài khoản và thiết bị của bạn. Hãy thêm chúng để bắt đầu.',
    action: 'Thêm tài khoản',
  },
  checklist: {
    title: 'Danh sách đang trống',
    description:
      'SafeFamily tự động tạo danh sách kiểm tra từ tài khoản và thiết bị của bạn.',
  },
  assessments: {
    title: 'Chưa có kết quả kiểm tra',
    description:
      'Hoàn thành bài kiểm tra an toàn để xem điểm bảo vệ và những việc cần làm.',
    action: 'Bắt đầu kiểm tra',
  },
  plans: {
    title: 'Chưa có kế hoạch an toàn',
    description:
      'Kế hoạch an toàn được tạo sau khi bạn đặt lịch tư vấn với chuyên gia của chúng tôi.',
  },
  members: {
    title: 'Chưa có thành viên',
    description:
      'Thêm các thành viên trong gia đình để bắt đầu theo dõi an toàn kỹ thuật số.',
    action: 'Thêm thành viên',
  },
  noResults: {
    title: 'Không tìm thấy kết quả',
    description: 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.',
  },
} as const

export default emptyStates
