import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl">🧠</div>
              <span className="text-2xl font-bold text-white">Synapse</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-white hover:text-purple-100 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Build the Brain
              <br />
              You've Always Wanted
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Never lose a brilliant idea again. Synapse is your intelligent second brain that captures, organizes, and helps you find anything you've ever saved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
              >
                Start Building Your Brain
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-purple-700/50 backdrop-blur-sm text-white rounded-xl hover:bg-purple-700/70 transition-colors font-bold text-lg border-2 border-white/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Capture Everything. Find Anything.
            </h2>
            <p className="text-xl text-gray-600">
              Your thoughts deserve better than scattered bookmarks and forgotten screenshots
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Instant Capture
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Paste a URL, write a note, create a todo, or upload an image. Synapse automatically understands what it is and presents it beautifully.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Visual Memory
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Articles look like articles. Videos are playable. Products show prices. Everything is displayed in the most useful way possible.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-pink-50 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Search
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Search like you think. "Black shoes under $200" or "that quote about new beginnings". Synapse understands and finds it instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-bold text-gray-900 mb-2">Researchers</h4>
              <p className="text-gray-600 text-sm">Save articles, papers, and notes. Find them instantly when you need them.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-2xl mb-2">💼</div>
              <h4 className="font-bold text-gray-900 mb-2">Professionals</h4>
              <p className="text-gray-600 text-sm">Keep track of ideas, todos, and inspiration all in one place.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-2xl mb-2">🎓</div>
              <h4 className="font-bold text-gray-900 mb-2">Students</h4>
              <p className="text-gray-600 text-sm">Organize study materials, notes, and resources for easy retrieval.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-2xl mb-2">✨</div>
              <h4 className="font-bold text-gray-900 mb-2">Creators</h4>
              <p className="text-gray-600 text-sm">Collect inspiration, references, and ideas for your next project.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Upgrade Your Memory?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join Synapse and never lose another brilliant idea
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-bold text-lg shadow-2xl transform hover:scale-105 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="text-2xl">🧠</div>
              <span className="text-xl font-bold">Synapse</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your intelligent second brain
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

