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
  Upload,
  Clock,
  Users,
  Trophy,
  Medal,
  Award,
  Sparkles,
} from 'lucide-react'

const keyDates = [
  {
    title: 'VIDEO SUBMISSIONS BEGIN',
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
          role: session.user.role ?? null,
          homeArea: session.user.homeArea,
        }}
      />

      <div className="space-y-0 bg-white">
        <section className="overflow-hidden bg-white">
          <div className="relative overflow-hidden border-b border-[#ececf4] bg-white">
            <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#ff8f5c]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-[#7f56ff]/20 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 right-0 h-full w-[55%] bg-gradient-to-tr from-[#ff6a13]/20 via-[#d14fc7]/20 to-[#7f56ff]/25 [clip-path:polygon(28%_100%,100%_12%,100%_100%)]" />

            <div className="pointer-events-none absolute bottom-0 left-[45%] h-[260px] w-[420px] bg-gradient-to-tr from-[#7f56ff]/25 via-[#d14fc7]/15 to-transparent [clip-path:polygon(0_100%,100%_28%,72%_100%)]" />

            <div className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 grid-cols-4 gap-3 opacity-45 lg:grid">
              {Array.from({ length: 32 }).map((_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-[#d14fc7]"
                />
              ))}
            </div>

            <div className="page-container relative grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#7f56ff]">
                  Spotlight Platform
                </p>

                <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-tight text-[#111322] md:text-7xl">
                  Spotlight Next
                  <span className="block bg-gradient-to-r from-[#ff6a13] via-[#d14fc7] to-[#7f56ff] bg-clip-text pb-2 text-transparent">
                    Inspiring participation.
                  </span>
                  <span className="block bg-gradient-to-r from-[#ff6a13] via-[#d14fc7] to-[#7f56ff] bg-clip-text pb-2 text-transparent">
                    Delivering results.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#55586b] md:text-lg">
                  A phase-based video competition platform designed to engage
                  participants, streamline judging, and deliver measurable business
                  impact.
                </p>

                <div className="mt-8">
                  <a
                    href="#contest-details"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0c1021_0%,#131b3f_100%)] px-7 text-[14px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(9,13,29,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(9,13,29,0.32)]"
                  >
                    View Contest Details
                    <span className="ml-3 text-lg leading-none">→</span>
                  </a>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="ml-auto grid w-full max-w-[320px] gap-5">
                  <div className="rounded-2xl border border-[#ececf4] bg-white/85 p-5 shadow-[0_18px_50px_rgba(78,57,154,0.14)] backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7f56ff]/12 text-[#7f56ff]">
                        👥
                      </div>

                      <div>
                        <div className="text-2xl font-extrabold leading-none text-[#111322]">
                          1,248
                        </div>

                        <div className="mt-1 text-xs font-medium text-[#676b80]">
                          Total Submissions
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="translate-x-8 rounded-2xl border border-[#ececf4] bg-white/85 p-5 shadow-[0_18px_50px_rgba(78,57,154,0.14)] backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6a13]/12 text-[#ff6a13]">
                        ▶
                      </div>

                      <div>
                        <div className="text-2xl font-extrabold leading-none text-[#111322]">
                          86%
                        </div>

                        <div className="mt-1 text-xs font-medium text-[#676b80]">
                          Judge Completion
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#ececf4] bg-white/85 p-5 shadow-[0_18px_50px_rgba(78,57,154,0.14)] backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d14fc7]/12 text-[#d14fc7]">
                        ↗
                      </div>

                      <div>
                        <div className="text-2xl font-extrabold leading-none text-[#111322]">
                          312
                        </div>

                        <div className="mt-1 text-xs font-medium text-[#676b80]">
                          Active Participants
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="page-container">
            <div className="mx-auto max-w-[1600px]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#7f56ff]">
                Program Timeline
              </p>

              <div className="page-title">Key Dates</div>

              <div className="relative mt-12 mb-10">
                <div className="absolute left-0 right-0 top-7 hidden h-px bg-[#dfe1ea] lg:block" />

                <div className="grid gap-8 lg:grid-cols-4">
                  {keyDates.map((item, index) => {
                    const icons = [Upload, Clock, Users, Trophy]
                    const Icon = icons[index]

                    const accents = [
                      { bg: 'bg-[#ff6a13]/10', border: 'border-[#ff6a13]', text: 'text-[#ff6a13]' },
                      { bg: 'bg-[#7f56ff]/10', border: 'border-[#7f56ff]', text: 'text-[#7f56ff]' },
                      { bg: 'bg-[#d14fc7]/10', border: 'border-[#d14fc7]', text: 'text-[#d14fc7]' },
                      { bg: 'bg-[#ff6a13]/10', border: 'border-[#ff6a13]', text: 'text-[#ff6a13]' },
                    ]

                    const accent = accents[index]

                    return (
                      <div
                        key={item.title}
                        className="relative rounded-2xl border border-[#ececf4] bg-white p-6 text-center shadow-[0_18px_50px_rgba(78,57,154,0.08)] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                      >
                        {index < keyDates.length - 1 ? (
                          <div className="absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-[#e4e5ef] lg:hidden" />
                        ) : null}

                        <div
                          className={`relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 ${accent.border} ${accent.bg} ${accent.text} shadow-[0_10px_30px_rgba(78,57,154,0.12)]`}
                        >
                          <Icon className="h-7 w-7" strokeWidth={2.4} />
                        </div>

                        <div className="mt-5 text-[12px] font-bold uppercase leading-[1.4] tracking-[0.12em] text-[#171327]">
                          {item.title}
                        </div>

                        <div className={`mt-5 text-[18px] font-extrabold uppercase tracking-[0.08em] ${accent.text}`}>
                          {item.month}
                        </div>

                        <div className={`text-[54px] font-extrabold leading-none tracking-tight ${accent.text}`}>
                          {item.day}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="award" className="relative overflow-hidden bg-[#f8f8fc] py-20">
          <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#ff8f5c]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#7f56ff]/20 blur-3xl" />

          <div className="page-container relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#7f56ff]">
              Awards Experience
            </p>

            <div className="page-title">Awards</div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-[#ececf4] bg-white p-8 shadow-[0_24px_70px_rgba(78,57,154,0.10)]">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff6a13_0%,#f7c948_100%)] text-white shadow-[0_14px_34px_rgba(255,140,32,0.35)]">
                  <Trophy className="h-7 w-7" strokeWidth={2.4} />
                </div>

                <h3 className="max-w-xl text-3xl font-extrabold leading-tight text-[#111322] md:text-4xl">
                  More than rewards, this is a celebration like no other.
                </h3>

                <p className="mt-5 text-base leading-7 text-[#55586b]">
                  Contest winners don’t just earn recognition — they gain access to a
                  high-energy reward experience where performance pays off in real time.
                </p>

                <p className="mt-5 text-base leading-7 text-[#55586b]">
                  Winners race through the Windfall Warehouse, grabbing as many rewards
                  as they can before time runs out.
                </p>

                <div className="mt-8">
                  <a
                    href="https://actdevpprd.biworldwide.com/lexus/26MPI_Brochure.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0c1021_0%,#131b3f_100%)] px-7 text-[14px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(9,13,29,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(9,13,29,0.32)]"
                  >
                    View Award Details
                    <span className="ml-3 text-lg leading-none">→</span>
                  </a>
                </div>
              </div>

              <div className="grid gap-5">
                {[
                  {
                    title: 'District Winners',
                    time: '60 seconds',
                    detail: 'One winner from each district earns a fast-paced warehouse run.',
                    icon: Medal,
                    color: 'text-[#7f56ff]',
                    bg: 'bg-[#7f56ff]/10',
                  },
                  {
                    title: 'Area Winners',
                    time: '75 seconds',
                    detail: 'Selected from district-level winners for an extended reward run.',
                    icon: Award,
                    color: 'text-[#d14fc7]',
                    bg: 'bg-[#d14fc7]/10',
                  },
                  {
                    title: 'National Winner',
                    time: '90 seconds',
                    detail: 'The top finalist earns the longest uninterrupted warehouse experience.',
                    icon: Sparkles,
                    color: 'text-[#ff6a13]',
                    bg: 'bg-[#ff6a13]/10',
                  },
                ].map((award) => {
                  const Icon = award.icon

                  return (
                    <div
                      key={award.title}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-[#ececf4] bg-white p-6 shadow-[0_18px_50px_rgba(78,57,154,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(78,57,154,0.14)]"
                    >
                      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#ff6a13]/10 via-[#d14fc7]/10 to-[#7f56ff]/10 blur-2xl" />

                      <div className="relative flex items-start gap-5">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${award.bg} ${award.color}`}>
                          <Icon className="h-8 w-8" strokeWidth={2.2} />
                        </div>

                        <div>
                          <div className="text-sm font-bold uppercase tracking-[0.14em] text-[#8b8fa3]">
                            {award.title}
                          </div>

                          <div className={`mt-2 text-4xl font-extrabold leading-none ${award.color}`}>
                            {award.time}
                          </div>

                          <p className="mt-3 text-base leading-7 text-[#55586b]">
                            {award.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
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