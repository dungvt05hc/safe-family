const reports = {
  title: 'Báo cáo',
  description:
    'Xem và tải xuống các báo cáo an toàn được tạo từ đánh giá, sự cố và các buổi tư vấn gia đình.',
  stats: {
    totalReports: 'Tổng số báo cáo',
    assessments: 'Đánh giá',
    incidents: 'Sự cố',
    lastReport: 'Báo cáo gần nhất',
  },
  loadError: 'Không thể tải báo cáo.',
  preview: {
    noReportSelected: 'Chưa chọn báo cáo',
    noReportHint: 'Chọn một báo cáo từ danh sách để xem chi tiết đầy đủ ở đây.',
    closePreview: 'Đóng xem trước',
    downloading: 'Đang tải…',
    downloadReport: 'Tải báo cáo',
  },
  list: {
    noReportsTitle: 'Chưa có báo cáo nào',
    noReportsDescription:
      'Báo cáo được tạo ra sau khi hoàn thành đánh giá rủi ro hoặc báo cáo sự cố. Bắt đầu bên dưới để tạo báo cáo đầu tiên.',
    runRiskCheck: 'Kiểm tra rủi ro',
    bookFamilyReset: 'Đặt lịch Family Reset',
    noResultsTitle: 'Không tìm thấy báo cáo phù hợp',
    noResultsDescription: 'Thử điều chỉnh từ khóa hoặc bộ lọc để tìm kiếm.',
  },
} as const

export default reports
