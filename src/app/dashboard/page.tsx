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
  Disc3,
  CircleGauge,
  BatteryCharging,
  Wind,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react'

const keyDates = [
  {
    line1: 'Video Submission',
    line2: 'Begins',
    month: 'JUNE',
    day: '18',
  },
  {
    line1: 'Video Submission',
    line2: 'Deadline',
    month: 'JULY',
    day: '13',
  },
  {
    line1: 'Judging',
    line2: 'Complete',
    month: 'JULY',
    day: '30',
  },
  {
    line1: 'Peer Vote',
    line2: 'Phase',
    month: 'JULY',
    day: '27-31',
  },
  {
    line1: 'Winners',
    line2: 'Announced',
    month: 'AUG',
    day: '3',
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
      {/*<SessionDebugDrawer
        sessionUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          employeeId: session.user.employeeId,
          role: session.user.role ?? null,
          homeArea: session.user.homeArea,
        }}
      />*/}

      <div className="space-y-0 bg-white">
        <section className="relative h-[560px] overflow-hidden bg-[#1f1b20] sm:h-[620px] lg:h-[640px]">
          <div
            className="absolute inset-0 bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/background.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />

          <div className="absolute inset-0 bg-black/20" />

          <img
            src="/images/logo.png"
            alt="Cadillac"
            className="absolute left-1/2 top-10 h-auto w-[120px] -translate-x-1/2 sm:w-[150px] lg:w-[170px]"
          />

          <div className="absolute bottom-10 left-1/2 w-full max-w-5xl -translate-x-1/2 px-6 text-center text-white sm:bottom-12 lg:bottom-14">
            <h1 className="font-[family:var(--font-cadillac)] text-[18px] font-normal uppercase leading-[1.35] tracking-[0.35em] sm:text-[20px] md:text-[30px] lg:text-[40px]">
              Lead the Shift to
              <span className="block">Electric Luxury</span>
            </h1>

            <p className="mx-auto mt-4 max-w-4xl text-[13px] leading-6 sm:text-[15px] md:text-[17px] text-white">
              Select your Cadillac EV, highlight its advantages and inspire what comes next.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="h-[22px] w-full bg-[linear-gradient(90deg,#3d4ec7_0%,#241f7f_100%)]" />

          <div className="mx-auto max-w-[1200px] py-16 lg:py-20 px-6">
            <h2 className="font-[family:var(--font-cadillac)] text-[16px] font-bold uppercase tracking-[0.28em] text-[#231f24] sm:text-[18px] lg:text-[20px]">
              The Conquest Challenge
            </h2>

            <h3 className="mt-10 font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.24em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
              EXPRESS THE CADILLAC DIFFERENCE
            </h3>

            <div className="mt-8 max-w-[1040px] space-y-8 text-[18px] leading-[1.7] text-[#231f24]">
              <p>
                Cadillac is shaping the future of All-Electric Luxury, and customers look to you for clarity as they consider what comes next—especially those transitioning from competitive EVs.
              </p>

              <p>
                <span className="font-bold">Your challenge:</span>{' '}
                 Deliver a compelling, customer-ready walkaround video that expresses the Cadillac difference and earn a trip to the U.S. Open Tennis Tournament.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#e7e7e7]">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
            <div className="font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.24em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
              Key Dates
            </div>

            <div className="mt-16 space-y-4">
              <div className="mx-auto grid max-w-[860px] gap-4 sm:grid-cols-2">
                {keyDates.slice(0, 2).map((date) => (
                  <div
                    key={`${date.line1}-${date.line2}`}
                    className="flex min-h-[185px] flex-col items-center justify-center bg-white px-6 py-8 text-center text-[#231f24]"
                  >
                    <div className="font-[family:var(--font-cadillac)] text-[14px] uppercase leading-[1.3] tracking-[0.26em]">
                      <div>{date.line1}</div>
                      <div>{date.line2}</div>
                    </div>

                    <div className="mt-5 font-[family:var(--font-cadillac)] text-[24px] font-bold uppercase tracking-[0.18em]">
                      {date.month}
                    </div>

                    <div className="mt-1 font-[family:var(--font-cadillac)] text-[52px] font-bold leading-none">
                      {date.day}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {keyDates.slice(2).map((date) => (
                  <div
                    key={`${date.line1}-${date.line2}`}
                    className="flex min-h-[185px] flex-col items-center justify-center bg-white px-6 py-8 text-center text-[#231f24]"
                  >
                    <div className="font-[family:var(--font-cadillac)] text-[14px] uppercase leading-[1.3] tracking-[0.26em]">
                      <div>{date.line1}</div>
                      <div>{date.line2}</div>
                    </div>

                    <div className="mt-5 font-[family:var(--font-cadillac)] text-[24px] font-bold uppercase tracking-[0.18em]">
                      {date.month}
                    </div>

                    <div className="mt-1 font-[family:var(--font-cadillac)] text-[52px] font-bold leading-none">
                      {date.day}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contest-details" className="scroll-mt-[120px] bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">

            <h2 className="mt-3 font-[family:var(--font-cadillac)] text-[20px] font-bold uppercase tracking-[0.24em] text-[#231f24]">
              PROGRAM DETAILS
            </h2>
            <h4 className="mt-3 font-[family:var(--font-cadillac)] text-[26px] font-bold uppercase tracking-[0.26em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
              HOW TO PARTICIPATE
            </h4>

            <div className="mt-10">
              <p className="font-[family:var(--font-cadillac)] text-[13px] uppercase tracking-[0.35em] text-[#231f24]">
                Step 1:
              </p>

              <h4 className="mt-3 font-[family:var(--font-cadillac)] text-[26px] font-bold uppercase tracking-[0.26em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
                Select Your Customer
              </h4>

              <p className="mt-4 max-w-[1120px] text-[15px] leading-6 text-[#111111]">
                Begin by selecting one of four different customer profiles. Each represents a distinct mindset and drives a competitive EV, and each is interested in a different Cadillac EV to meet their priorities and needs.
              </p>

              <p className="mt-4 max-w-[1120px] text-[15px] leading-6 text-[#111111]">
                See the <a href="/documents/26Cadillac_ChooseYourEV_ProgBroch.pdf" target="_blank" className="">Program Brochure</a> for more details on each customer persona.
              </p>

              <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    name: 'Maya',
                    image: '/images/maya.png',
                    description: (
                      <>
                        Drives a Tesla Model Y. Prioritizes premium design and intuitive tech.
                        Interested in <span className="font-bold">Cadillac LYRIQ.</span>
                      </>
                    ),
                  },
                  {
                    name: 'Jordan',
                    image: '/images/jordan.png',
                    description: (
                      <>
                        Drives a Tesla Model Y. Values sustainability and smart technology.
                        Interested in <span className="font-bold">Cadillac OPTIQ.</span>
                      </>
                    ),
                  },
                  {
                    name: 'Olivia',
                    image: '/images/olivia.png',
                    description: (
                      <>
                        Drives a Rivian R1S. Wants commanding presence and a premium
                        experience. Interested in{' '}
                        <span className="font-bold">Cadillac Escalade IQ/IQL.</span>
                      </>
                    ),
                  },
                  {
                    name: 'Daniel',
                    image: '/images/daniel.png',
                    description: (
                      <>
                        Drives a Tesla Model X. Looking for space, capability and practical
                        luxury. Interested in <span className="font-bold">Cadillac VISTIQ.</span>
                      </>
                    ),
                  },
                ].map((customer) => (
                  <div key={customer.name}>
                    <div className="flex h-[120px] items-end justify-center">
                      <img
                        src={customer.image}
                        alt=""
                        className="max-h-[115px] w-full object-contain"
                      />
                    </div>

                    <h5 className="mt-6 font-[family:var(--font-cadillac)] text-[20px] font-bold uppercase tracking-[0.28em] text-[#231f24] text-center">
                      {customer.name}
                    </h5>

                    <p className="mt-3 text-[13px] font-medium leading-5 text-black">
                      {customer.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-14 space-y-8">
              {[
                {
                  step: 'Step 2:',
                  title: 'Craft a Narrative',
                  body: 'With your chosen persona in mind, craft a compelling story that reflects your customer’s priorities and how Cadillac design and technology brings them to life.',
                },
                {
                  step: 'Step 3:',
                  title: 'Present the Advantage',
                  body: 'Record a polished walkaround video that highlights the innovation, craftsmanship and performance of the selected Cadillac EV over its competition.',
                },
                {
                  step: 'Step 4:',
                  title: 'Submit Your Entry',
                  body: (
                    <>
                      Submit your video for judging. Before uploading, review and agree to the <a href="/documents/participant-opt-in.pdf" className="font-bold">Participant Opt-In Agreement</a>. 
                      You may upload multiple times, but only your latest submission will be evaluated.
                    </>
                    ),
                },
              ].map((item) => (
                <div key={item.title}>
                  <p className="font-[family:var(--font-cadillac)] text-[13px] uppercase tracking-[0.35em] text-[#231f24]">
                    {item.step}
                  </p>

                  <h4 className="mt-3 font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.26em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
                    {item.title}
                  </h4>

                  <p className="mt-4 max-w-[1120px] text-[15px] leading-6 text-[#111111]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>


            <h4 className="mt-14 font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.26em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
              Criteria & Guidelines
            </h4>

            <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
              
              {/* Judging Criteria */}
              <div className="border border-[#d9d6df] p-8 lg:p-10">
                <h3 className="font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.16em] text-[#231f24] sm:text-[20px] lg:text-[24px]">
                  Judging Criteria
                </h3>

                <p className="mt-4 text-[15px] leading-8 text-[#111111]">
                  The strongest video submissions will blend deep product knowledge with
                  clear, confident storytelling, and connect Cadillac EV benefits to
                  customer needs with authenticity and impact.
                </p>

                <p className="mt-4 text-[15px] font-bold leading-8 text-[#111111]">
                  Evaluation Criteria
                </p>

                <ul className="mt-2 list-disc space-y-2 pl-7 text-[15px] leading-8 text-[#111111]">
                  <li>Friendly, professional approach</li>
                  <li>
                    Match Cadillac EV product knowledge with customer needs/priorities
                  </li>
                  <li>Competitive positioning/advantages</li>
                  <li>Communication and delivery</li>
                  <li>Overall creativity and presentation</li>
                </ul>
              </div>

              {/* Video Submission Guidelines */}
              <div className="border border-[#d9d6df] p-8 lg:p-10">
                <h3 className="font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.16em] text-[#231f24] sm:text-[20px] lg:text-[24px]">
                  Video Submission Guidelines
                </h3>

                <p className="mt-4 text-[15px] leading-8 text-[#111111]">
                  Before uploading your video submission, ensure it meets these
                  guidelines:
                </p>

                <ul className="mt-2 list-disc space-y-2 pl-7 text-[15px] leading-8 text-[#111111]">
                  <li>
                    Maximum <strong>6 minutes</strong> long
                  </li>
                  <li>
                    <strong>.mp4</strong> or <strong>.mov</strong> format
                  </li>
                  <li>
                    File size under <strong>500MB</strong>
                  </li>
                  <li>One presenter only (no group submissions)</li>
                  <li>English presentation or English subtitles required</li>
                  <li>No copyrighted material permitted</li>
                </ul>

                <p className="mt-4 text-[15px] leading-8 text-[#111111]">
                  <strong>NOTE:</strong> You may submit multiple videos—but only your
                  latest submission will be judged.
                </p>
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <a
                href="/documents/26Cadillac_ChooseYourEV_ProgBroch.pdf"
                target="_blank" 
                className="inline-flex min-h-[46px] items-center justify-center bg-[#231f24] px-7 text-center font-[family:var(--font-cadillac)] text-[13px] font-bold uppercase tracking-[0.24em] text-white transition hover:bg-black"
              >
                For More Details, Download the Program Brochure
              </a>
            </div>
          </div>
        </section>

        <section
          id="award"
          className="scroll-mt-[120px] relative overflow-hidden bg-[#e7e7e7]"
        >

          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">

            <h2 className="mt-3 font-[family:var(--font-cadillac)] text-[20px] font-bold uppercase tracking-[0.24em] text-[#231f24]">
              AWARDS
            </h2>

            <h4 className="mt-3 font-[family:var(--font-cadillac)] text-[26px] font-bold uppercase tracking-[0.26em] text-[#231f24] sm:text-[20px] lg:text-[30px]">
              BE RECOGNIZED AT THE HIGHEST LEVEL
            </h4>

            <p className="mt-14 max-w-[1120px] text-[15px] leading-6 text-[#111111]">
              Video submissions will advance through regional and national judging, earning recognition across the Cadillac network and the opportunity to claim premium rewards.
            </p>

            <p className="mt-4 max-w-[1120px] text-[15px] leading-6 text-[#111111] font-bold">
              Awards
            </p>
            <ul className="mt-2 max-w-[1120px] list-disc space-y-1 pl-6 text-[15px] leading-6 text-[#111111]">
              <li>
                <strong>Five Regional Finalists: </strong>
                Five finalists selected by Cadillac from each of the 5 Regions (25 Finalists total).

                <ul className="mt-1 list-[circle] pl-6">
                  <li>
                    <strong>Regional Finalist Prize: </strong>
                    3575 XFuel Miles that are redeemable on the XFuel Marketplace for travel, hotel stays, entertainment and more.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Five National Winners: </strong>
                One winner selected by Cadillac from each group of Regional Finalists (5 Winners total).

                <ul className="mt-1 list-[circle] pl-6">
                  <li>
                    <strong>Grand Prize: </strong>
                    An exclusive 2026 U.S. Tennis Open experience for Grand Prize winners and their guests.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Peer Choice Award: </strong>
                Voted by dealership personnel across the network.
              </li>
            </ul>

          </div>
        </section>

        <section id="resources" className="scroll-mt-[120px] bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <h2 className="mt-3 font-[family:var(--font-cadillac)] text-[20px] font-bold uppercase tracking-[0.24em] text-[#231f24]">
              Resources
            </h2>

            <p className="mt-8 max-w-[900px] text-[15px] leading-7 text-[#111111]">
              Access tools and guides crafted to help you plan, create and deliver a
              standout Conquest Challenge walkaround.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {[
                {
                  title: 'Program Brochure',
                  body: (
                    <>
                      Detailed profiles of the customers to whom you will present a Cadillac EV. <br></br>
                      <p>Also, details on Awards, Judging Criteria, Contest Rules, Video Submission Guidelines, and more.</p>

                    </>
                  ),
                  href: '/documents/26Cadillac_ChooseYourEV_ProgBroch.pdf',
                  className: 'lg:col-span-2',
                },
                {
                  title: 'Video Best Practices',
                  body: (
                    <>
                      Guidance for creating and submitting a standout video—from presentation tips to what technically makes a good recording, and more.
                    </>
                  ),
                  href: '/documents/26Cadillac_ChooseYourEV_BestPractices.pdf',
                  className: 'lg:col-span-2',
                },
                {
                  title: 'EV Selling Points Guide',
                  body: (
                    <>
                      A competitor- focused product overview that highlights how Cadillac’s EV lineup out- performs key rivals.
                    </>
                  ),
                  href: '/documents/26Cadillac_ChooseYourEV_SellingPoints.pdf',
                  className: 'lg:col-span-2',
                },
                {
                  title: 'Contest Rules',
                  body: (
                    <>
                      Your source for Conquest Challenge details, including eligibility, video guidelines, key dates, award information, and more.
                    </>
                  ),
                  href: '/documents/26Cadillac_ChooseYourEV_Rules.pdf',
                  className: 'lg:col-span-2 lg:col-start-2',
                },
                {
                  title: 'Participant Opt-In Agreement',
                  body: (
                    <>
                      Before uploading your video, review and agree to the terms of the{' '}
                      <strong>Participant Opt-In Agreement.</strong>
                    </>
                  ),
                  href: '/documents/26Cadillac_ChooseYourEV_OptIn.pdf',
                  className: 'lg:col-span-2',
                },
              ].map((resource) => (
                <a
                  key={resource.title}
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex min-h-[330px] flex-col border border-[#d9d6df] bg-white px-5 py-7 text-[#231f24] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)] ${resource.className}`}
                >
                  <h3 className="font-[family:var(--font-cadillac)] text-[21px] font-bold uppercase leading-[1.2] tracking-[0.08em]">
                    {resource.title}
                  </h3>

                  <p className="mt-6 flex-1 text-[14px] font-medium leading-5 text-black">
                    {resource.body}
                  </p>

                  <div className="mt-8 inline-flex min-h-[42px] items-center justify-center bg-[#231f24] px-5 text-center font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.22em] text-white">
                    PDF Download
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>


        <section id="featured-submissions" className="scroll-mt-[120px] bg-[#e7e7e7]">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">

            <h2 className="mt-3 font-[family:var(--font-cadillac)] text-[20px] font-bold uppercase tracking-[0.18em] text-[#231f24]">
              EXPLORE FEATURED SUBMISSIONS 
            </h2>

            <h3 className="mt-10 font-[family:var(--font-cadillac)] text-[20px] font-bold uppercase tracking-[0.08em] text-[#231f24] sm:text-[30px]">
              Watch. Vote. Recognize Excellence.
            </h3>

            <div className="mt-14 max-w-[760px] space-y-3 text-[15px] leading-7 text-[#111111]">
              <p>
                View leading submissions and cast your vote for the video that best expresses the Cadillac EV experience.
              </p>

              <p>
                By participating, you could be selected for exclusive Cadillac merchandise, while the top entry will be honored with the <strong>Peer Choice Award.</strong>
              </p>

              <p>
                See the <strong>Program Brochure</strong> or <strong>Contest Rules</strong> for full details.
              </p>
            </div>

          </div>
        </section>



      </div>
    </PageShell>
  )
}