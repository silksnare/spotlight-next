'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function UploadTermsPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (agreed) {
      router.push('/upload/video')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Video Upload
          </span>
        </h1>

        {/* Intro Text */}
        <p className="text-gray-700 leading-relaxed mb-8">
          Lorem ipsum or as rest que sapiciel ium seni ditis afquae rewepe ven tas reast que sapi ciolut velis experc iet, su met a asdfwe molut veelis ex
          perciet, sumet awn wdel ium sawweni ditisquae repe venta asdfasdfasdffsdasdfasd asditisquae repe ve reast que sa wpi ciolut velis experc iet,
          su met and mel ium seni ditisquae rewepe ven tas reast que sapi ciolut velis experc iet, su met aolut velis experciet, smet andel ium seasw dfa
          sdfwe asdfni ditisquw wae repe veditisquae repe veciole sapici.
        </p>

        {/* Terms Box */}
        <div className="bg-yellow-400 rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">
            Participant Opt-In Agreement
          </h2>
          <div className="text-gray-800 text-sm leading-relaxed space-y-4">
            <p>
              Lorem ipsum or as rest que sapiciel ium seni ditis afquae rewepe ven tas reast que sapi ciolut velis experc iet, su met a
              asdfwe molut veelis ex perciet, sumet awn wdel ium sawweni ditisquae repe venta asdfasdfasdffsdasdfasd asditisquae
              repe ve reast que sa wpi ciolut velis experc iet, su met and mel ium seni ditisquae rewepe ven tas reast que sapi ciolut
              velis experc iet, su met aolut velis experciet, smet andel ium seasw dfa sdfwe asdfni ditisquw wae repe veditisquae repe
              veciole sapici.
            </p>
            <p>
              Timweionwiel ium seni ditis afquae rewepe ven tas reast que sapi ciolut velis experc iet, su met a asdfwe molut veelis ex
              perciet, sumet awn wdel ium sawweni ditisquae repe venta asdfasdfasdffsdasdfasd asditisquae repe ve reast que sa wpi
              ciolut velis experc iet, su met anue sapi ciolut velis experc iet, su met aolut velis expercie
            </p>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <form onSubmit={handleSubmit}>
          <label className="flex items-start space-x-3 mb-8 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-gray-700 text-sm leading-relaxed">
              Noweimmolut velis experciet, smet andel iasdaw weawdel ium seni ditis queni ditis quae rest que sapicim.
            </span>
          </label>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!agreed}
              className={`px-12 py-4 rounded-lg text-white font-semibold uppercase tracking-wider text-lg transition-all ${
                agreed
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 shadow-lg hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
