-- Create local auth credentials table for email/password login
CREATE TABLE "LocalAuthCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationCodeHash" TEXT,
    "verificationCodeExpiresAt" TIMESTAMP(3),
    "verificationCodeSentAt" TIMESTAMP(3),
    "passwordResetCodeHash" TEXT,
    "passwordResetCodeExpiresAt" TIMESTAMP(3),
    "passwordResetCodeSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocalAuthCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LocalAuthCredential_userId_key" ON "LocalAuthCredential"("userId");
CREATE UNIQUE INDEX "LocalAuthCredential_email_key" ON "LocalAuthCredential"("email");
CREATE INDEX "LocalAuthCredential_email_idx" ON "LocalAuthCredential"("email");

ALTER TABLE "LocalAuthCredential" ADD CONSTRAINT "LocalAuthCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
