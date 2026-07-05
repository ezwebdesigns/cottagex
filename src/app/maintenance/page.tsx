import Link from 'next/link'
import { Mountain } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191e3b]">
      <div className="text-center max-w-lg mx-auto px-6">
        <Mountain className="w-16 h-16 text-[#77e1fb] mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">
          Under Maintenance
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          We are currently performing scheduled maintenance to improve your experience.
          Please check back shortly.
        </p>
        <Link
          href="mailto:socialmediacanada@gmail.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f51ec] text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}
