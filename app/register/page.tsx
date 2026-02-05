export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      {/* Register Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-wide">
            <span className="text-gray-800">sp</span>
            <span className="relative inline-block">
              <span className="text-yellow-400">o</span>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
            <span className="text-gray-800">tlight</span>
          </h1>
        </div>

        {/* Register Form */}
        <form className="space-y-5">
          {/* Email Field */}
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Sign Up Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full max-w-[200px] mx-auto block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 uppercase tracking-wider text-sm"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <span className="text-gray-600 text-sm">Already have an account?</span>
          <span className="text-gray-400 mx-2">|</span>
          <a href="/login" className="text-gray-600 hover:text-gray-800 text-sm">
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
