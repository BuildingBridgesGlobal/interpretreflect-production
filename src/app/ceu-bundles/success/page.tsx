'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Award, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [enrollment, setEnrollment] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!sessionId) {
      router.push('/ceu-bundles');
      return;
    }

    loadEnrollment();
  }, [sessionId]);

  const loadEnrollment = async () => {
    try {
      // Find enrollment by stripe session ID in metadata
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('ceu_enrollments')
        .select('*, ceu_programs(*)')
        .contains('metadata', { stripe_session_id: sessionId })
        .order('enrolled_at', { ascending: false })
        .limit(1);

      if (enrollmentError) throw enrollmentError;

      if (enrollments && enrollments.length > 0) {
        setEnrollment(enrollments[0]);
        setProgram(enrollments[0].ceu_programs);
      }
    } catch (error) {
      console.error('Error loading enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5C7F4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7F8C8D]">Confirming your enrollment...</p>
        </div>
      </div>
    );
  }

  if (!enrollment || !program) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="max-w-md text-center">
          <p className="text-[#7F8C8D] mb-4">
            Unable to find your enrollment. Please contact support if you completed payment.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#5C7F4F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">
              You're Enrolled!
            </h1>
            <p className="text-lg text-[#7F8C8D]">
              Welcome to your CEU journey. Let's build sustainable wellness practices together.
            </p>
          </div>

          {/* Program Details */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Award className="w-12 h-12 text-[#5C7F4F] flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
                  {program.title}
                </h2>
                <p className="text-[#7F8C8D]">{program.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-[#F0EDE6] rounded-lg">
                <Award className="w-8 h-8 text-[#5C7F4F] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#2C3E50]">
                  {program.ceu_value}
                </div>
                <div className="text-sm text-[#7F8C8D]">CEUs</div>
              </div>
              <div className="text-center p-4 bg-[#F0EDE6] rounded-lg">
                <Calendar className="w-8 h-8 text-[#5C7F4F] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#2C3E50]">
                  {program.estimated_hours}
                </div>
                <div className="text-sm text-[#7F8C8D]">Hours</div>
              </div>
              <div className="text-center p-4 bg-[#F0EDE6] rounded-lg">
                <BookOpen className="w-8 h-8 text-[#5C7F4F] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#2C3E50]">
                  12
                </div>
                <div className="text-sm text-[#7F8C8D]">Months</div>
              </div>
            </div>

            <div className="border-t border-[#E8E6E3] pt-6">
              <h3 className="font-semibold text-[#2C3E50] mb-3">
                Learning Objectives
              </h3>
              <ul className="space-y-2">
                {program.learning_objectives.map((objective: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-[#7F8C8D]">
                    <CheckCircle className="w-5 h-5 text-[#5C7F4F] mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-[#5C7F4F] to-[#4a6640] rounded-xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check your email</h3>
                  <p className="text-white/90 text-sm">
                    You'll receive a confirmation email with your enrollment details and RID number on file.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Start your reflections</h3>
                  <p className="text-white/90 text-sm">
                    Begin completing the required reflections at your own pace. We track your time automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive your certificate</h3>
                  <p className="text-white/90 text-sm">
                    Upon completion, you'll get your official RID certificate. We report your CEUs to RID quarterly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/dashboard"
              className="bg-[#5C7F4F] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors flex items-center justify-center gap-2 group"
            >
              Go to Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/reflections"
              className="border-2 border-[#5C7F4F] text-[#5C7F4F] px-6 py-4 rounded-lg font-semibold hover:bg-[#5C7F4F] hover:text-white transition-colors flex items-center justify-center gap-2 group"
            >
              Start First Reflection
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Support */}
          <div className="text-center mt-8 text-sm text-[#7F8C8D]">
            Questions? Email us at{' '}
            <a href="mailto:support@interpretreflect.com" className="text-[#5C7F4F] hover:underline">
              support@interpretreflect.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5C7F4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7F8C8D]">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
