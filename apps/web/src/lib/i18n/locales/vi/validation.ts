const validation = {
  email: {
    required: 'Vui lòng nhập email',
    invalid: 'Vui lòng nhập địa chỉ email hợp lệ',
  },
  password: {
    required: 'Vui lòng nhập mật khẩu',
    min: 'Mật khẩu phải có ít nhất 8 ký tự',
    max: 'Mật khẩu quá dài',
  },
  displayName: {
    required: 'Vui lòng nhập tên hiển thị',
    max: 'Tên hiển thị không được vượt quá 200 ký tự',
  },
  familyName: {
    required: 'Vui lòng nhập tên gia đình',
    max: 'Tên gia đình không được vượt quá 200 ký tự',
  },
  countryCode: {
    length: 'Vui lòng nhập mã quốc gia hợp lệ gồm 2 chữ cái',
  },
  timezone: {
    required: 'Vui lòng nhập múi giờ',
    max: 'Múi giờ không được vượt quá 100 ký tự',
  },
  accountType: {
    required: 'Vui lòng chọn loại tài khoản',
  },
  identifier: {
    required: 'Vui lòng nhập thông tin định danh',
    max: 'Không được vượt quá 255 ký tự',
  },
  notes: {
    max: 'Không được vượt quá 1000 ký tự',
  },
} as const

export default validation
