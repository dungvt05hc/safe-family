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
  // Social auth
  orContinueWith: 'or continue with',
  orUseEmail: 'or continue with email',
  googleVerifying: 'Verifying with Google…',
  googleAuthError: 'Google sign-in failed. Please try again.',
  googleAuthDenied: 'Google sign-in was cancelled or your account could not be verified.',
} as const

export default auth
