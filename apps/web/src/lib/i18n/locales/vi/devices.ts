const devices = {
  pageTitle: 'Thiết bị',
  pageDescription: 'Theo dõi các thiết bị trong gia đình và cấu hình bảo mật.',
  addDevice: '+ Thêm thiết bị',
  archiveConfirm: 'Ẩn thiết bị này? Dữ liệu sẽ được giữ lại nhưng không hiển thị trong danh sách.',
  unassigned: 'Chưa gán',

  filter: {
    allMembers: 'Tất cả thành viên',
    allTypes: 'Tất cả loại',
    allStatuses: 'Tất cả trạng thái',
    searchPlaceholder: 'Tìm theo hãng, model, hệ điều hành…',
    clearFilters: 'Xóa bộ lọc',
  },

  col: {
    type: 'Loại thiết bị',
    device: 'Thiết bị',
    member: 'Thành viên',
    os: 'Hệ điều hành',
    support: 'Hỗ trợ',
    screenLock: 'Khóa màn hình',
    biometric: 'Sinh trắc học',
    backup: 'Sao lưu',
    findMyDevice: 'Tìm thiết bị',
  },

  supportStatus: {
    Unknown: 'Chưa biết',
    Supported: 'Còn được hỗ trợ',
    EndOfLife: 'Hết hỗ trợ',
    NoLongerReceivingUpdates: 'Không còn nhận cập nhật',
  },

  badge: {
    screenLock: 'Khóa màn hình',
    biometric: 'Sinh trắc học',
    backup: 'Sao lưu',
    findMyDevice: 'Tìm thiết bị',
  },

  securityEnabled: 'Đã bật',
  securityDisabled: 'Chưa bật',

  action: {
    edit: 'Chỉnh sửa',
    archive: 'Ẩn đi',
  },

  modal: {
    addTitle: 'Thêm thiết bị',
    addSubtitle: 'Đăng ký thiết bị mới cho gia đình',
    editTitle: 'Chỉnh sửa thiết bị',
    addSubmit: 'Thêm thiết bị',
    editSubmit: 'Lưu thay đổi',
  },

  form: {
    memberLabel: 'Gán cho thành viên',
    memberPlaceholder: 'Thiết bị dùng chung (không gán cho ai)',
    memberHint: 'Để trống nếu thiết bị dùng chung cho cả gia đình',

    sectionIdentification: 'Thông tin thiết bị',
    sectionOs: 'Hệ điều hành',
    sectionStatusSecurity: 'Trạng thái & Bảo mật',

    deviceType: 'Loại thiết bị',
    deviceTypePlaceholder: 'Chọn loại thiết bị…',
    deviceTypeLoading: 'Đang tải…',
    deviceTypeHint: 'Chọn loại để lọc danh sách hãng và model phù hợp',

    brand: 'Hãng sản xuất',
    model: 'Model',

    osFamily: 'Hệ điều hành',
    osFamilyHint: 'Tự động chọn dựa trên model đã chọn',
    osVersion: 'Phiên bản',

    supportStatus: 'Trạng thái hỗ trợ',
    supportStatusHint: 'Nhà sản xuất có còn cung cấp bản vá bảo mật hay không',

    securityFeaturesLabel: 'Tính năng bảo mật đã bật',
    screenLock: 'Khóa màn hình',
    screenLockDesc: 'Mã PIN, mật khẩu hoặc hình mở khóa',
    biometric: 'Sinh trắc học',
    biometricDesc: 'Vân tay hoặc nhận diện khuôn mặt',
    backup: 'Sao lưu đám mây',
    backupDesc: 'Tự động sao lưu dữ liệu',
    findMyDevice: 'Tìm thiết bị',
    findMyDeviceDesc: 'Định vị từ xa và xóa dữ liệu khi bị mất máy',

    notes: 'Ghi chú',
    notesOptional: '(tùy chọn)',
    notesPlaceholder: 'Ví dụ: Máy tính công ty, số serial #12345…',

    save: 'Lưu',
    saving: 'Đang lưu…',
    cancel: 'Hủy',
  },

  placeholder: {
    brandNoType: 'Chọn loại thiết bị trước',
    brandLoading: 'Đang tải hãng sản xuất…',
    brandNone: 'Không có hãng nào cho loại này',
    brandDefault: 'Chọn hãng sản xuất…',
    modelNoBrand: 'Chọn hãng sản xuất trước',
    modelLoading: 'Đang tải model…',
    modelNone: 'Không có model nào cho hãng này',
    modelDefault: 'Chọn model…',
    osFamilyNoModel: 'Chọn model trước',
    osFamilyLoading: 'Đang tải hệ điều hành…',
    osFamilyNone: 'Không có hệ điều hành nào',
    osFamilyDefault: 'Chọn hệ điều hành…',
    osVersionNoFamily: 'Chọn hệ điều hành trước',
    osVersionLoading: 'Đang tải phiên bản…',
    osVersionNone: 'Không có phiên bản nào',
    osVersionDefault: 'Chọn phiên bản…',
  },

  validation: {
    deviceType: 'Vui lòng chọn loại thiết bị',
    brand: 'Vui lòng chọn hãng sản xuất',
    model: 'Vui lòng chọn model',
    osFamily: 'Vui lòng chọn hệ điều hành',
    osVersion: 'Vui lòng chọn phiên bản',
    supportStatus: 'Vui lòng chọn trạng thái hỗ trợ',
    notesMax: 'Ghi chú không được quá 1.000 ký tự',
  },
} as const

export default devices
