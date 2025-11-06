import Link from 'next/link';
import { ArrowRight, Heart, Brain, Shield, Star, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F6] to-[#F0EDE6]">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2C3E50] mb-6">
            The Wellness Platform for
            <span className="text-[#5C7F4F]"> Interpreters</span>
          </h1>
          <p className="text-xl text-[#7F8C8D] mb-8">
            Prevent burnout. Process vicarious trauma. Earn RID-approved CEUs.
            Built on neuroscience, designed for interpreters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[#5C7F4F] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/ceu-bundles"
              className="border-2 border-[#5C7F4F] text-[#5C7F4F] px-8 py-4 rounded-lg font-semibold hover:bg-[#5C7F4F] hover:text-white transition-colors"
            >
              Explore CEU Bundles
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Brain className="w-12 h-12 text-[#5C7F4F]" />}
            title="Built on Neuroscience"
            description="The ECCI Model: 16 integrated frameworks explaining multimodal processing, interoceptive awareness, and neuroplasticity."
          />
          <FeatureCard
            icon={<Heart className="w-12 h-12 text-[#5C7F4F]" />}
            title="24/7 AI Support"
            description="Chat with Elya, your AI wellness companion, trained on the ECCI framework and interpreter-specific challenges."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-[#5C7F4F]" />}
            title="RID-Approved CEUs"
            description="Earn CEUs in the new 'Studies of Healthy Minds & Bodies' category. Sponsor #2309."
          />
        </div>
      </section>

      {/* CEU Announcement */}
      <section className="bg-[#5C7F4F] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Star className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            NEW: Studies of Healthy Minds & Bodies CEUs
          </h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto">
            RID's new Professional Studies category (effective Dec 1, 2025) is designed for interpreter wellness.
            InterpretReflect is the first platform dedicated to this category.
          </p>
          <Link
            href="/ceu-bundles"
            className="inline-block bg-white text-[#5C7F4F] px-8 py-4 rounded-lg font-semibold hover:bg-[#F0EDE6] transition-colors"
          >
            View CEU Bundles
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-[#2C3E50] mb-12">
          How InterpretReflect Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Step
            number="1"
            title="Complete Your ECCI Assessment"
            description="Take our 15-minute assessment to create your personalized interpreter wellness profile."
          />
          <Step
            number="2"
            title="Use Wellness Tools Daily"
            description="Access BREATHE protocol, post-assignment debriefs, body awareness journeys, and more—all free."
          />
          <Step
            number="3"
            title="Earn CEUs When Ready"
            description="Purchase CEU bundles ($49-$399) to get certificates for your reflective practice."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-[#F0EDE6] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-8">
            Built by Interpreters, for Interpreters
          </h2>
          <p className="text-lg text-[#7F8C8D] max-w-3xl mx-auto mb-8">
            Developed by Sarah Wheeler, M.Ed., M.S. (Building Bridges Global),
            InterpretReflect combines 16 neuroscience frameworks into practical
            tools that address the unique challenges of multimodal interpreting.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            <StatCard number="16" label="Neuroscience Frameworks" />
            <StatCard number="50+" label="Reflection Protocols" />
            <StatCard number="8.0" label="CEUs Available" />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-[#2C3E50] mb-6">
            Ready to Build Sustainable Excellence?
          </h2>
          <p className="text-xl text-[#7F8C8D] mb-8">
            Join the first wellness platform designed specifically for the neuroscience of interpreting.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#5C7F4F] text-white px-12 py-5 rounded-lg font-bold text-lg hover:bg-[#4a6640] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{title}</h3>
      <p className="text-[#7F8C8D]">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-[#5C7F4F] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{title}</h3>
      <p className="text-[#7F8C8D]">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white px-8 py-6 rounded-lg shadow-sm">
      <div className="text-4xl font-bold text-[#5C7F4F] mb-2">{number}</div>
      <div className="text-sm text-[#7F8C8D] uppercase tracking-wide">{label}</div>
    </div>
  );
}
