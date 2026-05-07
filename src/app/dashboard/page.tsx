import { redirect } from 'next/navigation'
import Image from 'next/image'

import { PageShell } from '@/components/page-shell'
import { SessionDebugDrawer } from '@/components/session-debug-drawer'
import { getCurrentSession } from '@/lib/auth/session'

import {
  FileText,
  ClipboardList,
  PencilLine,
  Download,
} from 'lucide-react'

const keyDates = [
  {
    title: 'FIRST DAY TO UPLOAD VIDEO SUBMISSIONS',
    month: 'MAY',
    day: '04',
  },
  {
    title: 'VIDEO SUBMISSION DEADLINE',
    month: 'JUNE',
    day: '01',
  },
  {
    title: 'WINNERS ANNOUNCEMENT',
    month: 'JULY',
    day: '06',
  },
  {
    title: 'NATIONAL WINNER ANNOUNCEMENT',
    month: 'AUG',
    day: '11',
  },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[34px] font-medium leading-none text-black md:text-[40px]">
      {children}
    </h2>
  )
}

export default async function DashboardPage() {
  const session = await getCurrentSession()
  if (!session) redirect('/login')

  return (
    <PageShell>
      <SessionDebugDrawer
        sessionUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          employeeId: session.user.employeeId,
          role: session.user.role,
          homeArea: session.user.homeArea,
        }}
      />

      <div className="space-y-0 bg-white">
        <section className="overflow-hidden bg-white">
          <div className="relative min-h-[640px]">
            <Image
              src="/images/background.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />

            <div className="relative flex min-h-[640px] flex-col items-center justify-center px-6 py-16 text-center">
              <Image
                src="/images/hood.png"
                alt="Under the Hood Heroes"
                width={360}
                height={220}
                priority
                className="mb-8 h-auto w-[280px] md:w-[360px]"
              />

              <h1 className="max-w-[1100px] text-[44px] font-semibold leading-[1.05] text-[#231f20] md:text-[72px]">
                Lights. Camera. Inspection.
              </h1>

              <p className="mt-6 max-w-[980px] text-[22px] leading-[1.5] text-[#231f20] md:text-[28px]">
                Showcase your expertise with a Lexus Multipoint Inspection (MPI)
                video and win!
              </p>

              <div className="mt-10">
                <a
                  href="#contest-details"
                  className="inline-flex min-h-[58px] items-center justify-center bg-[#231f20] px-10 text-[16px] font-semibold uppercase tracking-[0.02em] text-white transition hover:opacity-90"
                >
                  View Contest Details
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white page-container">
          <div className="mx-auto max-w-[1600px]">
            <div className="page-title">Key Dates</div>

            <div className="mt-10 mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {keyDates.map((item) => (
                <div
                  key={item.title}
                  className="flex min-h-[200px] flex-col items-center justify-center rounded-[20px] bg-[#2c4f88] px-6 py-8 text-center text-white"
                >
                  <div className="max-w-[220px] text-[14px] font-semibold uppercase leading-[1.4] tracking-[0.04em]">
                    {item.title}
                  </div>

                  <div className="mt-6 text-[22px] font-semibold tracking-[0.08em]">
                    {item.month}
                  </div>

                  <div className="text-[64px] font-semibold leading-none tracking-[0.02em]">
                    {item.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="award" className="bg-[#f3f3f3] pb-[40px]">

          <div className="page-container">
            {/* Title */}
            <div className="page-title">Awards</div>

            {/* Video Placeholder */}
            <div className="mt-10 flex justify-center">
              <div className="w-full max-w-[900px] overflow-hidden rounded-[16px] border border-[#cfd8dc] bg-black">
                <video
                  className="w-full h-auto"
                  controls
                  preload="metadata"
                  poster="/images/video-poster.jpg"
                >
                  <source src="https://actdev.biworldwide.com/lexus/prize.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Content */}
            <div className="">
              <h3 className="text-[24px] font-semibold leading-[1.3] text-[#231f20] md:text-[30px] pt-[40px]">
                More than rewards, this is a celebration like no other!
              </h3>

              <p className="mt-4 text-[18px] leading-[1.7]">
                Contest winners don’t just earn recognition — they gain access
                to a Warehouse Windfall, a high-energy reward experience where
                performance pays off in real time.
              </p>

              <p className="mt-6 text-[18px] leading-[1.7]">
                The Warehouse Windfall is a fast-paced, time-clocked prize run inside the
                Windfall Warehouse. Winners race through the aisles, grabbing as many
                rewards as they can before time runs out.
              </p>

              <ul className="mt-6 list-disc space-y-2 pl-6 text-[18px] leading-[1.7]">
                <li>
                  <span className="font-semibold">District Winners:</span> One winner from each Lexus District will be selected from all qualified District entries. District Winners earn a full <strong>60 second</strong> run through the Windfall Warehouse to collect as much merchandise as possible.

                </li>
                <li>
                  <span className="font-semibold">Area Winner:</span> Selected from District-Level Winners in accordance with Official Contest Rules. Area Winners earn a <strong>75 second</strong> warehouse run.
                </li>
                <li>
                  <span className="font-semibold">National Winner:</span> One National Winner will be selected from the four Area Winners. The National Winner earns a full <strong>90 seconds</strong> of uninterrupted Warehouse Windfall action.

                </li>
              </ul>

              <p className="mt-8 font-semibold leading-[1.4]">
                Bring your MPI expertise. Deliver the Lexus guest experience. And earn
                your opportunity to run!
              </p>

              {/* CTA Row */}
              <div className="mt-10 flex justify-center">
                <a
                  href="https://actdevpprd.biworldwide.com/lexus/26MPI_Brochure.pdf"
                  target="_blank" 
                  className="inline-flex min-h-[58px] items-center justify-center bg-[#231f20] px-10 text-[16px] font-semibold uppercase tracking-[0.02em] text-white transition hover:opacity-90"
                >
                  View the Contest Brochure for Complete Award Details
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contest-details" className="">
          <div className="page-container">
            <h2 className="page-title">
              Contest Details
            </h2>

            <h3 className="mb-2 text-2xl font-semibold text-slate-900">
              Demonstrate Your MPI Expertise
            </h3>

            <p className="mb-4 max-w-5xl text-[16px] leading-[1.8] text-slate-900">
              Multipoint Inspections are more than a walkthrough — they’re one of the most
              effective ways to build guests’ <strong>trust</strong>. Demonstrate your
              expertise by submitting a Lexus MPI video that reflects how you work every
              day: your inspection process, communication style, and guest-first mindset.
              By sharing test results and measurements — and clearly explaining what they
              mean — you help guests make informed service decisions and plan for future
              maintenance.
            </p>

            <p className="mb-10 text-[16px] leading-[1.8] text-slate-900">
              Your video should represent a{' '}
              <strong>complete, real-world Lexus MPI experience</strong>, such as:
            </p>

            <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] bg-[#f3f3f5] p-8">
                <h4 className="mb-6 text-[20px] font-semibold leading-[1.2] text-[#1f1b20]">
                  Brake Pad Wear
                  <br />
                  Inspection
                </h4>
                <p className="text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Help guests clearly understand their brake pad condition and future
                  needs.
                </p>
              </div>

              <div className="rounded-[28px] bg-[#f3f3f5] p-8">
                <h4 className="mb-6 text-[20px] font-semibold leading-[1.2] text-[#1f1b20]">
                  Tire Wear Inspection
                </h4>
                <p className="text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Use visual evidence to explain condition, specifications, and next
                  steps.
                </p>
              </div>

              <div className="rounded-[28px] bg-[#f3f3f5] p-8">
                <h4 className="mb-6 text-[20px] font-semibold leading-[1.2] text-[#1f1b20]">
                  Battery Health Test
                </h4>
                <p className="text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Share test results and explain how proactive testing helps prevent
                  unexpected issues.
                </p>
              </div>

              <div className="rounded-[28px] bg-[#f3f3f5] p-8">
                <h4 className="mb-6 text-[20px] font-semibold leading-[1.2] text-[#1f1b20]">
                  Filters &amp; Wiper Blade
                  <br />
                  Inspection
                </h4>
                <p className="text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Highlight guest comfort and safety through quick, clear inspections.
                </p>
              </div>
            </div>

            <div className="mb-12 mt-12 flex flex-col items-center gap-4">
              <a
                href="https://actdevpprd.biworldwide.com/lexus/26MPI_BestPractices.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[56px] min-w-[320px] items-center justify-center bg-black px-8 text-center text-[18px] font-medium uppercase tracking-[0.02em] text-white transition hover:bg-gray-800"
              >
                View Video MPI Best Practices
              </a>
            </div>


            <h3 className="mb-8 mt-10 text-2xl font-semibold text-slate-900">
              Attention Diagnostic Specialists
            </h3>
            <div className="rounded-[28px] bg-[#f3f3f5] p-8">
              <p className="pb-4 text-[16px] leading-[1.8] text-slate-900">
                Support early Technician Video MPI
                submissions (May 4 – May 11) for a chance to win <strong>Fast Start Incentive</strong> rewards. See the <strong>Official Contest Rules</strong> for details.
              </p>

              <div className="flex flex-col items-center gap-4">
                <a
                  href="https://actdevpprd.biworldwide.com/lexus/26MPI_Rules.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[56px] min-w-[320px] items-center justify-center bg-black px-8 text-center text-[18px] font-medium uppercase tracking-[0.02em] text-white transition hover:bg-gray-800 mt-4"
                >
                  View Official Contest Rules
                </a>
              </div>

            </div>

            <h3 className="mb-3 text-[22px] font-semibold text-slate-900 pt-[40px]">
              What You Need to Do to Participate
            </h3>
            <p className="mb-8 text-[16px] leading-[1.8] text-slate-900">
              During the Video Submission Period, review the <strong>Official Contest Rules</strong> and upload an
              example of the work you do every day — captured as a clear, guest-focused MPI video.
            </p>

            <div className="pb-6 grid gap-6 md:grid-cols-2">

              {/* Video Requirements */}
              <div className="rounded-2xl bg-[#f3f3f5] p-8 shadow-sm">
                <h3 className="mb-4 text-[24px] font-semibold text-slate-900">
                  Video Requirements
                </h3>

                <ul className="space-y-2 text-[16px] leading-[1.8] text-slate-900">
                  <li><strong>Length:</strong> Up to <strong>2 minutes</strong></li>
                  <li><strong>File formats:</strong> .mp4 or .mov</li>
                  <li><strong>Maximum file size:</strong> 500 MB</li>
                  <li>
                    <strong>Language:</strong> English (subtitles recommended if audio clarity is limited)
                  </li>
                </ul>
              </div>

              {/* Judging Criteria */}
              <div className="rounded-2xl bg-[#f3f3f5] p-8 shadow-sm">
                <h3 className="mb-4 text-[24px] font-semibold text-slate-900">
                  Judging Criteria
                </h3>

                <p className="mb-4 text-[16px] leading-[1.8] text-slate-900">
                  Your video will be evaluated from the perspective of a Lexus guest using a
                  standardized scoring rubric, across six key areas:
                </p>

                <ol className="list-decimal space-y-2 pl-5 text-[16px] leading-[1.8] text-slate-900">
                  <li>Introduction & guest context</li>
                  <li>Explanation of inspection findings</li>
                  <li>Service recommendations & urgency</li>
                  <li>Communication clarity & professionalism</li>
                  <li>Organization & video flow</li>
                  <li>Accuracy of recommendations</li>
                </ol>
              </div>

            </div>

            <p className="text-[16px] leading-[1.8] text-slate-900">
              The strongest videos combine technical confidence, clear presentation, and
              guest-friendly explanations of vehicle condition (e.g., Green/Yellow/Red as guided by Lexus). Together,
              these elements help guests understand both service needs and next steps.
            </p>
          </div>
        </section>

        <section id="resources" className="bg-[#f3f3f3] pb-[40px]">
          <div className="page-container">
            <h2 className="page-title mb-12">Resources</h2>

            <div className="grid gap-8 lg:grid-cols-3">
              <a
                href="https://actdevpprd.biworldwide.com/lexus/26MPI_Rules.pdf"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[540px] flex-col rounded-[12px] bg-[#FFFFFF] px-10 py-10 transition hover:shadow-sm"
              >
                <FileText className="mb-8 h-16 w-16 text-[#201c21]" strokeWidth={2.2} />

                <h3 className="mb-6 text-[24px] font-semibold leading-[1.15] text-[#201c21]">
                  Contest Rules
                </h3>

                <p className="mb-10 text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Your complete source for Contest details, including eligibility
                  requirements, video guidelines, key dates, award information, and more.
                </p>

                <div className="mt-auto">
                  <div className="flex justify-end">
                    <Download
                      className="h-12 w-12 text-[#201c21] transition group-hover:translate-y-[1px]"
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
              </a>

              <a
                href="https://actdevpprd.biworldwide.com/lexus/26MPI_BestPractices.pdf"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[540px] flex-col rounded-[12px] bg-[#FFFFFF] px-10 py-10 transition hover:shadow-sm"
              >
                <ClipboardList
                  className="mb-8 h-16 w-16 text-[#201c21]"
                  strokeWidth={2.2}
                />

                <h3 className="mb-6 text-[24px] font-semibold leading-[1.15] text-[#201c21]">
                  Video Best Practices
                </h3>

                <p className="mb-10 text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Practical guidance for selecting and submitting a strong MPI video — from presentation tips to what technically makes a good recording, and avoiding copyrighted audio and visuals, etc.
                </p>

                <div className="mt-auto">
                  <div className="flex justify-end">
                    <Download
                      className="h-12 w-12 text-[#201c21] transition group-hover:translate-y-[1px]"
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
              </a>

              <a
                href="https://actdevpprd.biworldwide.com/lexus/26MPI_Release.pdf"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[540px] flex-col rounded-[12px] bg-[#FFFFFF] px-10 py-10 transition hover:shadow-sm"
              >
                <PencilLine
                  className="mb-8 h-16 w-16 text-[#201c21]"
                  strokeWidth={2.2}
                />

                <h3 className="mb-6 text-[24px] font-semibold leading-[1.15] text-[#201c21]">
                  Lexus Release Agreement
                </h3>

                <p className="mb-10 text-[16px] leading-[1.8] text-[#2d2a2f]">
                  Before uploading your video, you will be asked to review and agree to
                  the terms of the <strong>Participant Opt-In Agreement</strong> seen on
                  the Upload Video page.
                </p>

                <p className="mb-10 text-[16px] leading-[1.8] text-[#2d2a2f]">
                  If any other person is identifiable in your video, either visually or
                  by voice, or has aided in the recording, developing, or creating the video submission, they must also read, agree to, and sign the{' '}
                  <strong>Lexus Release Agreement</strong>.
                </p>

                <div className="mt-auto">
                  <div className="flex justify-end">
                    <Download
                      className="h-12 w-12 text-[#201c21] transition group-hover:translate-y-[1px]"
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>



      </div>
    </PageShell>
  )
}