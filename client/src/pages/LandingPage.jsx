// React + Tailwind: Landing Page for SmartClinic

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="text-center px-6 py-24 bg-gradient-to-b from-blue-100 to-white">
        <h1 className="text-4xl font-extrabold mb-4">Your Journey to Seamless Healthcare Starts Here</h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Join us and take control of your appointments with SmartClinic Scheduler—AI-powered, efficient, and reliable.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700">
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Choose SmartClinic Scheduler</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded shadow">
            <h3 className="font-semibold mb-2">AI-Powered Predictive Scheduling</h3>
            <p className="text-sm text-gray-600">Optimizes slots and minimizes conflicts.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded shadow">
            <h3 className="font-semibold mb-2">Smart Waitlist & Notifications</h3>
            <p className="text-sm text-gray-600">Real-time alerts for openings and cancellations.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded shadow">
            <h3 className="font-semibold mb-2">Automated Reminders</h3>
            <p className="text-sm text-gray-600">SMS, email & push reminders to reduce no-shows.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-12 bg-blue-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Experience Hassle-Free Scheduling?</h2>
        <p className="text-gray-600 mb-6">Try SmartClinic today and see how it simplifies your medical bookings.</p>
        <button className="px-6 py-3 bg-black text-white font-medium rounded hover:opacity-90">
          Try It Now
        </button>
      </section>
    </div>
  );
}
