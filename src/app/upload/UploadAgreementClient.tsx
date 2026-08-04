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

        if (!response.ok) throw new Error('Failed to verify upload phase')

        const data: { isActive: boolean } = await response.json()

        if (!data.isActive) router.push('/dashboard')
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
    <main className="bg-[#f4f4f4]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <section className="bg-white px-6 py-10 sm:px-10 lg:px-12">
          <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.45em] text-[#231f24]">
            Video Submission
          </p>

          <h1 className="mt-3 font-[family:var(--font-cadillac)] text-[30px] font-bold uppercase tracking-[0.18em] text-[#231f24] sm:text-[42px]">
            Review &amp; Agree
          </h1>

          <p className="mt-6 max-w-[980px] text-[15px] leading-7 text-[#111111]">
            Before submitting your video, please review and agree to the
            PARTICIPANT OPT-IN AGREEMENT below. We also recommend carefully
            reviewing the <strong><a href="/documents/26Cadillac_ChooseYourEV_Rules.pdf">Official Contest Rules</a></strong> to ensure your
            submission meets all requirements.
          </p>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#d6d6d6] px-6 py-6 sm:px-8">
              <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.35em] text-[#231f24]">
                Required Agreement
              </p>

              <h2 className="mt-3 font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase tracking-[0.12em] text-[#231f24]">
                Participant Opt-In Agreement
              </h2>
            </div>

            <div className="max-h-[460px] overflow-y-auto px-6 py-7 sm:px-8">
              {[
                'By clicking below, I acknowledge that I have read the Walkaround Competition Rules and agree to abide by the Walkaround Competition Rules and the following terms:',
                'I hereby attest that I am a certified Sales Consultant employed by an authorized Cadillac dealership (the “Dealership”) and that I have obtained the consent of the Dealership to participate in the 2026 Cadillac Choose Your EV Conquest Challenge: Individual Walkaround Competition (the “Walkaround Competition”) on the terms set forth in this agreement and the Walkaround Competition Rules.',
                'Cadillac reserves the right at any time during the Walkaround Competition to disqualify any entry that it believes in its sole discretion does not meet the requirements of the competition and/or the Walkaround Competition Rules. In addition, I acknowledge that I will be disqualified from participation in the Walkaround Competition if and when the Dealership objects to any part of my video and/or my participation in the Walkaround Competition and/or any of the terms of this agreement or the Walkaround Competition Rules.',
                'I hereby represent and warrant that I am the sole owner of the video and all content included in the video that has been submitted to Cadillac, that I have used no trademarks, music, art, photos, characters/personalities, or content that belong to any third party (“Third Party Materials”) in the video and that, to the extent, if any, that the Dealership has any rights to the video, the Dealership has authorized me to grant the following rights to Cadillac on its behalf. If a third party sues Cadillac or Cadillac suffers any liabilities or damages because the video includes Third Party Materials or otherwise violates a third party’s rights, both the Dealership and I will be responsible for indemnifying Cadillac for any damages that it has to pay to the third party. I hereby release, discharge and agree to hold harmless Cadillac from any and all rights, claims, demands, damages and actions which I, my heirs, executors or assigns may have in connection with the use of my name, image, video, likeness, quotations and/or biographical information in all such materials and media including, but not limited to, any blurring, distortion, alteration, optical illusion, and use in composite or edited form.',
                'By submitting a video to Cadillac, I understand and agree that I am irrevocably transferring and assigning all right, title and interest in the video and any parts of the video (for example, sound bites, still photos) to Cadillac, including any copyrights, trademarks, “moral rights,” and other intellectual and industrial property rights that I may have in the video, including, but not limited to, the right to copyright said materials and the right to renew said copyright anywhere in the world, in any such materials utilizing my name, likeness, quotations and/or biographical information. This means that Cadillac can do whatever it wants with the video and any parts of the video now and forever, including but not limited to editing the video, making and distributing copies of the video and performing, displaying and/or publishing the video in any medium that exists now or in the future (for example, in all forms of social media). I also authorize Cadillac to use my name, likeness, recorded voice, and statements in connection with the distribution or publication of the video, including but not limited to use in Cadillac sales training programs and promotion of Cadillac training programs and competitions via internal online communications, social media, printed publications and all other media. I also understand that once I submit the video, no one, including me, can use it for any purpose without Cadillac’s written permission.',
                'If I submit a qualifying video to Cadillac, I have the opportunity to receive prizes as described in the Walkaround Competition Rules. I acknowledge and agree that receipt of such prizes in accordance with the Walkaround Competition Rules constitutes the entire compensation I will receive for the video.',
                'I further agree that my participation in any publication and website produced by Cadillac confers upon me no rights of ownership whatsoever.',
                'Submission of the video pursuant to this Agreement constitutes a release by me and the Dealership (which has granted me the authority to agree to this release on its behalf) of Cadillac and its parent, affiliates, contractors and employees from liability for any claims by me or the Dealership in connection with my participation in the Walkaround Competition.',
                'Furthermore, I confirm that I have read the Walkaround Competition Rules and this statement. I represent and warrant to Cadillac that I am eligible and qualified to enter into the Walkaround Competition. I hereby warrant that I am of legal age and have every right to contract in my own name without violating any other commitments.',
                'I have read this document in its entirety. I am fully familiar with its contents. I fully understand its contents. I am uploading my video and agreeing to this document voluntarily.',
              ].map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-7 text-[15px] leading-7 text-[#111111]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="border border-[#d6d6d6] bg-white p-6 sm:p-7">
            <h3 className="font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase tracking-[0.12em] text-[#231f24]">
              One Last Step
            </h3>

            <p className="mt-4 text-[14px] leading-6 text-[#111111]">
              Only videos that meet all Contest requirements are eligible for
              judging and recognition.
            </p>

            <label
              htmlFor="upload-agreement"
              className="mt-8 flex cursor-pointer items-start gap-4 border border-[#d6d6d6] bg-[#f4f4f4] p-5"
            >
              <input
                id="upload-agreement"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#231f24]"
              />

              <span className="text-[13px] font-bold leading-5 text-[#111111]">
                I agree to the Choose Your EV Conquest Official Rules and terms
                of this Participant Opt-In Agreement.
              </span>
            </label>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!agreed}
              className={`mt-8 inline-flex h-[50px] w-full items-center justify-center font-[family:var(--font-cadillac)] text-[13px] font-bold uppercase tracking-[0.2em] transition ${
                agreed
                  ? 'bg-[#231f24] text-white hover:bg-black'
                  : 'cursor-not-allowed bg-[#c9c9c9] text-white'
              }`}
            >
              Continue
            </button>
          </aside>
        </section>
      </div>
    </main>
  )
}