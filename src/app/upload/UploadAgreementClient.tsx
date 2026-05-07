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
      <h1 className="page-title">Video Upload</h1>

      <p className="mb-12 max-w-[1280px] text-[16px] leading-[1.8] text-[#161624]">
        Before submitting your video, please review and agree to the PARTICIPANT OPT-IN AGREEMENT below. We also recommend carefully reviewing the <strong>Official Contest Rules</strong> to ensure your submission meets all requirements.
      </p>

      <p className="mb-12 max-w-[1280px] text-[16px] leading-[1.8] text-[#161624]">
        Only videos that meet all Contest requirements are eligible for judging and recognition.
      </p>

      <div className="mb-16 max-h-[300px] overflow-y-auto bg-[#f3f3f5] px-8 py-14 scrollbar-thin">
        <h2 className="mb-8 text-[18px] font-extrabold uppercase leading-none text-[#161624]">
          Participant Opt-In Agreement
        </h2>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          By clicking below, I acknowledge that I have read the Lexus Under The Hood Heroes Video Multi-Point Inspection (MPI) Contest Official Rules (the “CONTEST RULES”) and agree to abide by the CONTEST RULES and the following terms:
        </p>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          I hereby attest that I am a Lexus certified Service Technician (“Technician”) employed by an authorized U.S. Lexus Dealership (excluding Hawaii and Puerto Rico) (the “DEALERSHIP”) and that I have obtained the consent of the DEALERSHIP to participate in the Lexus Under The Hood Heroes Video MPI Contest (the “CONTEST“) on the terms set forth in this agreement and the CONTEST RULES.
        </p>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          Toyota Motors North America (“TMNA”) and Lexus reserve the right at any time during the CONTEST to disqualify any entry that they believe, in their sole discretion, does not meet the requirements of the Contest and/or the CONTEST RULES. In addition, I acknowledge that I will be disqualified from participation in the CONTEST if and when the DEALERSHIP objects to any part of my video and/or my participation in the CONTEST and/or any of the terms of this agreement or the CONTEST RULES.
        </p>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          I hereby represent and warrant that I am the sole owner of the video and all content included in the video that has been submitted to TMNA and Lexus; that I have not used any trademarks, music, art, photos, characters/personalities, or content that belong to any third party (“THIRD-PARTY MATERIALS”) in the video; and that, to the extent, if any, the DEALERSHIP has any rights to the video, the DEALERSHIP has authorized me to grant the following rights to TMNA and Lexus on their  behalf. If a third party sues TMNA or Lexus, or if TMNA or Lexus suffers any liabilities or damages because the video includes THIRD-PARTY MATERIALS or otherwise violates a third-party’s rights, both the DEALERSHIP and I will be responsible for indemnifying TMNA and Lexus for any damages they have to pay to the third party.
        </p>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          By submitting a video for the CONTEST, I understand and agree that I retain ownership of my video and that I am granting TMNA, Lexus, and their affiliates a non-exclusive, royalty-free, worldwide, perpetual license to use the video,   and any parts of the video (for example, sound bites, still photos)  including any copyrights, trademarks, “moral rights,” and other intellectual and industrial property rights that I may have in the video, This means that TMNA and Lexus  can  make minor edits to  the video; make and distribute copies of the video; and perform, display and/or publish the video in any medium that exists now or in the future (for example, in all forms of social media). If I submit a qualifying video to Lexus, I have the opportunity to receive prizes as described in the CONTEST RULES. I acknowledge and agree that receipt of such prizes in accordance with the CONTEST RULES constitutes the entire compensation that I will receive for the video.
        </p>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          I confirm that I have read the CONTEST RULES and this statement. I represent and warrant to Lexus that I am eligible and qualified to enter the CONTEST. I hereby warrant I am of legal age and have every right to contract in my own name without violating any other commitments.
        </p>

        <p className="mb-8 text-[16px] leading-[1.8] text-[#161624]">
          I have read this document in its entirety. I am fully aware of its contents. I fully understand its contents. I am uploading my video and agreeing to this document voluntarily.
        </p>
      </div>

      <div className="mb-14 flex items-start gap-4">
        <input
          id="upload-agreement"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-8 w-8 rounded-none border border-[#161624] accent-black"
        />
        <label htmlFor="upload-agreement" className="checkbox-label">
          By uploading a video to the website, I hereby agree to the LEXUS UNDER THE HOOD HEROES VIDEO MPI CONTEST OFFICIAL RULES and terms of this PARTICIPANT OPT-IN AGREEMENT. 
        </label>
      </div>

      <div className="flex justify-end pr-6">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!agreed}
          className={`primary-button transition ${
            agreed
              ? 'bg-[linear-gradient(90deg,#171723_0%,#231b1b_100%)] hover:opacity-95'
              : 'cursor-not-allowed bg-[#c9ced6] text-white'
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  )
}