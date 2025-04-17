// React + Tailwind: Landing Page for SmartClinic

import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="text-center px-6 py-24 bg-gradient-to-b from-blue-100 to-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Your Journey to Seamless Healthcare Starts Here
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Join us and take control of your appointments with SmartClinic—AI-powered, efficient, and reliable.
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/features"
            className="px-6 py-3 bg-white text-blue-600 font-medium rounded border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Choose SmartClinic</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-blue-600 text-2xl mb-4">⚡</div>
            <h3 className="font-semibold mb-2">AI-Powered Scheduling</h3>
            <p className="text-sm text-gray-600">Smart algorithms optimize appointment slots and minimize conflicts.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-blue-600 text-2xl mb-4">🔔</div>
            <h3 className="font-semibold mb-2">Smart Notifications</h3>
            <p className="text-sm text-gray-600">Real-time alerts for openings, cancellations, and upcoming appointments.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-blue-600 text-2xl mb-4">📱</div>
            <h3 className="font-semibold mb-2">Mobile-Friendly</h3>
            <p className="text-sm text-gray-600">Access your appointments anytime, anywhere from any device.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">1</div>
              <h3 className="font-semibold mb-2">Create Your Account</h3>
              <p className="text-sm text-gray-600">Sign up as a patient or healthcare provider</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">2</div>
              <h3 className="font-semibold mb-2">Set Your Preferences</h3>
              <p className="text-sm text-gray-600">Choose your preferred doctors and time slots</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">3</div>
              <h3 className="font-semibold mb-2">Manage Appointments</h3>
              <p className="text-sm text-gray-600">Book, reschedule, or cancel appointments with ease</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-12 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience Hassle-Free Healthcare?</h2>
          <p className="mb-6">Join thousands of satisfied users who have simplified their medical appointments.</p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">SmartClinic</h3>
              <p className="text-sm text-gray-400">Making healthcare accessible and efficient for everyone.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: support@smartclinic.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Healthcare St, Medical City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} SmartClinic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
