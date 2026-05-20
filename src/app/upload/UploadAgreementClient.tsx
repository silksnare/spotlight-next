'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadAgreementClient() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const checkPhase = async () => {
      try {
        const response = await fetch('/api/phases/upload-active', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to verify upload phase')
        }

        const data: { isActive: boolean } = await response.json()

        if (!data.isActive) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error(error)
        router.push('/dashboard')
      }
    }

    checkPhase()
  }, [router])

  const handleContinue = () => {
    if (!agreed) return
    router.push('/upload/submit')
  }

  return (
    <div className="page-container">
      <section className="relative overflow-hidden rounded-[32px] border border-[#ece8f4] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(17,19,34,0.08)] md:px-12 md:py-14">
        <div className="pointer-events-none absolute right-[-120px] top-[-140px] h-[320px] w-[320px] rounded-full bg-[#8f5cff]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[#ff6a13]/15 blur-3xl" />

        <div className="relative">
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.35em] text-[#8f5cff]">
            Video Submission
          </div>

          <h1 className="mb-6 text-[42px] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#111322] md:text-[64px]">
            Review &amp; Agree
          </h1>

          <p className="max-w-[980px] text-[17px] leading-[1.8] text-[#5f6475]">
            Before submitting your video, please review and agree to the Participant Opt-In Agreement below. We also recommend carefully reviewing the{' '}
            <strong className="font-extrabold text-[#111322]">Official Contest Rules</strong> to ensure your submission meets all requirements.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-[28px] border border-[#ece8f4] bg-white shadow-[0_18px_60px_rgba(17,19,34,0.06)]">
          <div className="border-b border-[#ece8f4] px-8 py-6">
            <div className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#ff6a13]">
              Required Agreement
            </div>

            <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#111322]">
              Participant Opt-In Agreement
            </h2>
          </div>

          <div className="max-h-[460px] overflow-y-auto px-8 py-8 scrollbar-thin">
            <p className="mb-8 text-[16px] leading-[1.85] text-[#161624]">
              By clicking below, I acknowledge that I have read the Lexus Under The Hood Heroes Video Multi-Point Inspection (MPI) Contest Official Rules (the “CONTEST RULES”) and agree to abide by the CONTEST RULES and the following terms:
            </p>

            <p className="mb-8 text-[16px] leading-[1.85] text-[#161624]">
              I hereby attest that I am a Lexus certified Service Technician (“Technician”) employed by an authorized U.S. Lexus Dealership (excluding Hawaii and Puerto Rico) (the “DEALERSHIP”) and that I have obtained the consent of the DEALERSHIP to participate in the Lexus Under The Hood Heroes Video MPI Contest (the “CONTEST“) on the terms set forth in this agreement and the CONTEST RULES.
            </p>

            <p className="mb-8 text-[16px] leading-[1.85] text-[#161624]">
              Toyota Motors North America (“TMNA”) and Lexus reserve the right at any time during the CONTEST to disqualify any entry that they believe, in their sole discretion, does not meet the requirements of the Contest and/or the CONTEST RULES.
            </p>

            <p className="mb-8 text-[16px] leading-[1.85] text-[#161624]">
              I hereby represent and warrant that I am the sole owner of the video and all content included in the video that has been submitted to TMNA and Lexus; that I have not used any trademarks, music, art, photos, characters/personalities, or content that belong to any third party.
            </p>

            <p className="mb-8 text-[16px] leading-[1.85] text-[#161624]">
              By submitting a video for the CONTEST, I understand and agree that I retain ownership of my video and that I am granting TMNA, Lexus, and their affiliates a non-exclusive, royalty-free, worldwide, perpetual license to use the video.
            </p>

            <p className="mb-8 text-[16px] leading-[1.85] text-[#161624]">
              I confirm that I have read the CONTEST RULES and this statement. I represent and warrant to Lexus that I am eligible and qualified to enter the CONTEST.
            </p>

            <p className="text-[16px] leading-[1.85] text-[#161624]">
              I have read this document in its entirety. I am fully aware of its contents. I fully understand its contents. I am uploading my video and agreeing to this document voluntarily.
            </p>
          </div>
        </div>

        <aside className="rounded-[28px] border border-[#ece8f4] bg-[#f8f7ff] p-7 shadow-[0_18px_60px_rgba(17,19,34,0.06)]">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[26px] shadow-sm">
            ✓
          </div>

          <h3 className="mb-3 text-[24px] font-extrabold tracking-[-0.03em] text-[#111322]">
            One last step
          </h3>

          <p className="mb-8 text-[15px] leading-[1.7] text-[#5f6475]">
            Only videos that meet all Contest requirements are eligible for judging and recognition.
          </p>

          <label
            htmlFor="upload-agreement"
            className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
              agreed
                ? 'border-[#8f5cff] bg-white shadow-[0_12px_40px_rgba(143,92,255,0.16)]'
                : 'border-[#ddd8ef] bg-white/70 hover:bg-white'
            }`}
          >
            <input
              id="upload-agreement"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-6 w-6 shrink-0 rounded border-[#161624] accent-[#8f5cff]"
            />

            <span className="text-[14px] font-semibold leading-[1.6] text-[#161624]">
              I agree to the Lexus Under The Hood Heroes Video MPI Contest Official Rules and terms of this Participant Opt-In Agreement.
            </span>
          </label>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!agreed}
            className={`mt-8 inline-flex h-[58px] w-full items-center justify-center rounded-2xl text-[14px] font-extrabold uppercase tracking-[0.16em] transition ${
              agreed
                ? 'bg-[linear-gradient(135deg,#ff6a13_0%,#f7c948_100%)] text-white shadow-[0_16px_36px_rgba(255,140,32,0.35)] hover:translate-y-[-1px]'
                : 'cursor-not-allowed bg-[#c9ced6] text-white'
            }`}
          >
            Continue
          </button>
        </aside>
      </section>
    </div>
  )
}