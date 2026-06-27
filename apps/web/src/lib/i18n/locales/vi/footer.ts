const footer = {
  about: {
    heading: 'Về SafeFamily',
    tagline: 'Bảo vệ gia đình bạn, từng thiết bị một.',
  },
  contact: {
    heading: 'Liên hệ',
    address: 'Địa chỉ',
    phone: 'Điện thoại',
    support: 'Hỗ trợ',
    email: 'Email',
    website: 'Website',
  },
  legal: {
    heading: 'Pháp lý',
    privacy: 'Chính sách quyền riêng tư',
    terms: 'Điều khoản dịch vụ',
    copyright: '© {{year}} {{legalName}}. Bảo lưu mọi quyền.',
  },
  links: {
    about:   'Về chúng tôi',
    contact: 'Liên hệ',
    privacy: 'Chính sách quyền riêng tư',
    terms:   'Điều khoản dịch vụ',
    help:    'Trợ giúp',
  },
  print: {
    generatedBy: 'Được tạo bởi {{name}}',
    generatedAt: 'Ngày tạo: {{date}}',
    confidential: 'Tài liệu này là bí mật và chỉ dành cho người nhận.',
  },
} as const

export default footer
