const families = {
  // ── Page ───────────────────────────────────────────────────────────────────
  pageTitle: 'Thành viên gia đình',
  pageDescription: 'Quản lý những người trong gia đình bạn.',
  addMember: '+ Thêm thành viên',
  loadError: 'Không thể tải danh sách thành viên. Vui lòng thử lại.',

  // ── No-family guard ────────────────────────────────────────────────────────
  createFamilyFirst: {
    title: 'Tạo hồ sơ gia đình trước',
    body: 'Bạn cần tạo hồ sơ gia đình trước khi có thể thêm thành viên.',
    formTitle: 'Tạo hồ sơ gia đình',
  },

  // ── Table columns ──────────────────────────────────────────────────────────
  col: {
    name: 'Họ và tên',
    relationship: 'Quan hệ',
    ageGroup: 'Nhóm tuổi',
    ecosystem: 'Hệ sinh thái',
    primaryContact: 'Liên hệ chính',
    actions: 'Thao tác',
  },

  // ── Primary contact ────────────────────────────────────────────────────────
  primaryContact: {
    yes: 'Có',
    badge: 'Liên hệ chính',
  },

  // ── Row actions ────────────────────────────────────────────────────────────
  action: {
    edit: 'Chỉnh sửa',
    archive: 'Ẩn đi',
  },

  archiveConfirm: 'Ẩn {{name}} khỏi danh sách? Bạn có thể khôi phục sau.',

  // ── Modals ─────────────────────────────────────────────────────────────────
  modal: {
    addTitle: 'Thêm thành viên gia đình',
    editTitle: 'Chỉnh sửa {{name}}',
    addSubmit: 'Thêm thành viên',
    editSubmit: 'Lưu thay đổi',
  },

  // ── Form ───────────────────────────────────────────────────────────────────
  form: {
    name: 'Tên thành viên',
    namePlaceholder: 'Nhập tên đầy đủ',
    nameRequired: 'Vui lòng nhập tên thành viên',
    nameMax: 'Tên không được quá 200 ký tự',
    relationship: 'Quan hệ với bạn',
    relationshipRequired: 'Vui lòng chọn quan hệ',
    ageGroup: 'Nhóm tuổi',
    ageGroupRequired: 'Vui lòng chọn nhóm tuổi',
    ecosystem: 'Hệ sinh thái chính',
    ecosystemHint: 'Hệ sinh thái thiết bị mà thành viên này thường dùng nhất',
    ecosystemPlaceholder: '— Chọn hệ sinh thái —',
    isPrimaryContact: 'Đặt làm liên hệ chính',
    isPrimaryContactHint: 'Liên hệ chính sẽ nhận thông báo khẩn từ ứng dụng',
    save: 'Lưu',
    saving: 'Đang lưu…',
    cancel: 'Hủy',
  },

  // ── Relationship labels ────────────────────────────────────────────────────
  relationship: {
    self: 'Bản thân',
    spouse: 'Vợ / Chồng',
    son: 'Con trai',
    daughter: 'Con gái',
    father: 'Bố',
    mother: 'Mẹ',
    grandfather: 'Ông',
    grandmother: 'Bà',
    sibling: 'Anh / Chị / Em',
    relative: 'Họ hàng',
    caregiver: 'Người chăm sóc',
    other: 'Khác',
  },

  // ── Age group labels ───────────────────────────────────────────────────────
  ageGroup: {
    Infant: 'Trẻ sơ sinh (0–2 tuổi)',
    Child: 'Trẻ em (3–12 tuổi)',
    Teen: 'Thanh thiếu niên (13–17 tuổi)',
    Adult: 'Người lớn (18–59 tuổi)',
    Senior: 'Người cao tuổi (60+)',
  },

  // ── Ecosystem labels ───────────────────────────────────────────────────────
  ecosystem: {
    google: 'Google (Android / Chrome)',
    apple: 'Apple (iPhone / Mac)',
    microsoft: 'Microsoft / Windows',
    android: 'Android',
    mixed: 'Kết hợp nhiều hệ sinh thái',
    other: 'Khác',
  },
} as const

export default families
