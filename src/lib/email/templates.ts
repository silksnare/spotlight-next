export function verificationCodeEmailTemplate(code: string) {
  return {
    subject: 'Your Cadillac Spotlight verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  };
}

export function passwordResetCodeEmailTemplate(code: string) {
  return {
    subject: 'Your Cadillac Spotlight password reset code',
    text: `Your password reset code is ${code}. It expires in 10 minutes.`,
  };
}
