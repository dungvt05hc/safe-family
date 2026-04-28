const validation = {
  required: 'Vui lòng điền thông tin này',
  email: {
    required: 'Vui lòng nhập email',
    invalid: 'Địa chỉ email không hợp lệ',
  },
  password: {
    required: 'Vui lòng nhập mật khẩu',
    min: 'Mật khẩu phải có ít nhất 8 ký tự',
    max: 'Mật khẩu quá dài',
    mismatch: 'Mật khẩu xác nhận không khớp',
    strength: 'Mật khẩu cần có ít nhất 8 ký tự',
  },
  displayName: {
    required: 'Vui lòng nhập tên hiển thị',
    max: 'Tên không được quá 200 ký tự',
  },
  familyName: {
    required: 'Vui lòng nhập tên gia đình',
    max: 'Tên không được quá 200 ký tự',
  },
  countryCode: {
    length: 'Mã quốc gia phải có 2 chữ cái (ví dụ: VN, US)',
  },
  timezone: {
    required: 'Vui lòng nhập múi giờ',
    max: 'Múi giờ không được quá 100 ký tự',
  },
  accountType: {
    required: 'Vui lòng chọn loại tài khoản',
  },
  identifier: {
    required: 'Vui lòng nhập tên đăng nhập hoặc email',
    max: 'Không được quá 255 ký tự',
  },
  notes: {
    max: 'Ghi chú không được quá 1.000 ký tự',
  },
} as const

export default validation
