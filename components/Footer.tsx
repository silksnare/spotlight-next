import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4 md:mb-0">
            <Link href="#" className="hover:text-gray-700">Help</Link>
            <span>|</span>
            <Link href="#" className="hover:text-gray-700">Privacy</Link>
            <span>|</span>
            <span>© 2025 BI Worldwide</span>
          </div>

          {/* BI Worldwide Logo */}
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">BI WORLDWIDE</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
