// React + Tailwind: About Us Page for SmartClinic

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">About Us</h1>

        <p className="mb-6 text-gray-700 leading-relaxed">
          <strong>SmartClinic Scheduler</strong> is an AI-powered scheduling system designed to streamline clinic operations,
          reduce patient wait times, and enhance doctor availability. Our intelligent platform ensures a seamless and efficient
          booking experience for both patients and healthcare providers.
        </p>

        <p className="mb-6 text-gray-700 leading-relaxed">
          By integrating intelligent predictive algorithms, real-time notifications, and automated reminders, SmartClinic
          dynamically manages appointment availability and fills last-minute cancellations. Our goal is to eliminate manual
          scheduling hassles and bring AI-powered efficiency to every level of healthcare appointment management.
        </p>

        <h2 className="text-xl font-semibold mt-10 mb-3">Our Mission</h2>
        <p className="mb-6 text-gray-700">
          We are committed to creating a more accessible, patient-centric healthcare system where appointments are easier to
          manage, no-shows are minimized, and providers can focus on care rather than logistics.
        </p>

        <h2 className="text-xl font-semibold mt-10 mb-3">Why SmartClinic?</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>AI-Powered Predictive Scheduling</li>
          <li>Smart Waitlist & Real-Time Notifications</li>
          <li>Automated SMS, Email, and Push Reminders</li>
          <li>Multi-device Access and Responsive Design</li>
          <li>Compliance with HIPAA and GDPR standards</li>
        </ul>

        <div className="mt-12 text-center">
          <p className="text-gray-600">Ready to revolutionize your healthcare scheduling?</p>
          <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Get Started with SmartClinic
          </button>
        </div>
      </div>
    </div>
  );
}
