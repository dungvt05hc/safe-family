const auth = {
  // Login
  signInTitle: 'Sign in to your account',
  email: 'Email',
  password: 'Password',
  forgotPassword: 'Forgot password?',
  loginButton: 'Sign in',
  loggingIn: 'Signing in…',
  noAccount: "Don't have an account?",
  signUp: 'Sign up',
  invalidCredentials: 'Invalid email or password. Please try again.',
  // Register
  registerTitle: 'Create your account',
  fullName: 'Full Name',
  confirmPassword: 'Confirm Password',
  haveAccount: 'Already have an account?',
  loginLink: 'Sign in',
  registerButton: 'Create account',
  registering: 'Creating account…',
  // Register form — additional
  displayNameLabel: 'Display name',
  emailConflict: 'An account with this email already exists.',
  registerError: 'Something went wrong. Please try again.',
} as const

export default auth
