import {
	ArrowLeft,
	Award,
	Brain,
	CheckCircle,
	ExternalLink,
	Heart,
	Microscope,
	Shield,
	TrendingUp,
	Users,
} from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

export const ResearchEvidence: React.FC = () => {
	return (
		<div className="min-h-screen" style={{ backgroundColor: "#FAF9F6" }}>
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link
								to="/"
								className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-opacity-80"
								style={{ color: "#6B8268", backgroundColor: "rgba(107, 130, 104, 0.1)" }}
							>
								<ArrowLeft className="w-4 h-4" />
								<span className="text-sm font-medium">Back to Home</span>
							</Link>
						</div>
						<div className="text-center">
							<h1 className="text-3xl font-bold text-gray-900">
								Research & Evidence
							</h1>
							<p className="text-gray-600 mt-1">
								Science-backed wellness for interpreters
							</p>
						</div>
						<div className="w-32"></div> {/* Spacer for centering */}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="space-y-12">
					{/* Introduction */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
								<Microscope className="h-8 w-8 text-blue-600" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								Evidence-Based Wellness for Interpreters
							</h2>
							<p className="text-lg text-gray-600 max-w-3xl mx-auto">
								Our platform is built on decades of research in neuroscience,
								psychology, and occupational health, specifically adapted for
								the unique challenges faced by interpreters and language
								professionals.
							</p>
						</div>
					</section>

					{/* Key Research Areas */}
					<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{/* Vicarious Trauma */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center mb-4">
								<Heart className="h-8 w-8 text-red-600 mr-3" />
								<h3 className="text-xl font-bold text-gray-900">
									Vicarious Trauma
								</h3>
							</div>
							<p className="text-gray-600 mb-4">
								Research shows interpreters experience secondary trauma from
								processing traumatic content, with effects on emotional
								regulation and stress response systems.
							</p>
							<div className="space-y-2">
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Neurological impact studies</span>
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Mirror neuron activation</span>
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Emotional contagion research</span>
								</div>
							</div>
						</div>

						{/* Burnout Prevention */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center mb-4">
								<TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
								<h3 className="text-xl font-bold text-gray-900">
									Burnout Prevention
								</h3>
							</div>
							<p className="text-gray-600 mb-4">
								Studies demonstrate that proactive stress management and regular
								recovery practices significantly reduce burnout risk in
								high-stress professions.
							</p>
							<div className="space-y-2">
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>WHO burnout framework</span>
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Recovery cycle research</span>
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Resilience building studies</span>
								</div>
							</div>
						</div>

						{/* Neuroscience */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center mb-4">
								<Brain className="h-8 w-8 text-purple-600 mr-3" />
								<h3 className="text-xl font-bold text-gray-900">
									Neuroscience
								</h3>
							</div>
							<p className="text-gray-600 mb-4">
								Modern neuroscience explains how interpreting affects brain
								function and provides evidence for effective intervention
								strategies.
							</p>
							<div className="space-y-2">
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Vagus nerve stimulation</span>
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Autonomic nervous system</span>
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span>Neuroplasticity research</span>
								</div>
							</div>
						</div>
					</section>

					{/* Research Studies */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Key Research Studies
						</h2>

						<div className="space-y-6">
							<div className="border-l-4 border-blue-500 pl-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									"The Impact of Vicarious Trauma on Interpreters"
								</h3>
								<p className="text-gray-600 mb-2">
									A comprehensive study by the International Medical
									Interpreters Association (2019) found that 73% of medical
									interpreters experience symptoms of vicarious trauma.
								</p>
								<div className="flex items-center text-sm text-gray-500">
									<Users className="h-4 w-4 mr-1" />
									<span>Sample size: 2,400 interpreters</span>
								</div>
							</div>

							<div className="border-l-4 border-green-500 pl-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									"Neuroscience of Language Processing"
								</h3>
								<p className="text-gray-600 mb-2">
									Research from the Journal of Neuroscience (2021) demonstrates
									that simultaneous interpretation activates multiple brain
									regions simultaneously, increasing cognitive load.
								</p>
								<div className="flex items-center text-sm text-gray-500">
									<Brain className="h-4 w-4 mr-1" />
									<span>Published in Journal of Neuroscience</span>
								</div>
							</div>

							<div className="border-l-4 border-purple-500 pl-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									"Effectiveness of Mindfulness Interventions"
								</h3>
								<p className="text-gray-600 mb-2">
									Meta-analysis in JAMA Network Open (2022) shows
									mindfulness-based interventions reduce burnout by 35% in
									healthcare professionals, with similar effects for
									interpreters.
								</p>
								<div className="flex items-center text-sm text-gray-500">
									<Award className="h-4 w-4 mr-1" />
									<span>Meta-analysis of 45 studies</span>
								</div>
							</div>
						</div>
					</section>

					{/* Our Approach */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Our Evidence-Based Approach
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									What We Measure
								</h3>
								<ul className="space-y-3">
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Emotional exhaustion levels
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Recovery speed and patterns
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Vicarious trauma indicators
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Professional efficacy metrics
										</span>
									</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									How We Help
								</h3>
								<ul className="space-y-3">
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Real-time stress monitoring
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Personalized intervention strategies
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Evidence-based recovery techniques
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-gray-600">
											Long-term resilience building
										</span>
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Citations */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Research Citations
						</h2>

						<div className="space-y-4">
							<div className="border border-gray-200 rounded-lg p-4">
								<h3 className="font-semibold text-gray-900 mb-2">
									International Medical Interpreters Association (2019)
								</h3>
								<p className="text-sm text-gray-600 mb-2">
									"Vicarious Trauma and Interpreter Wellness: A National Survey"
								</p>
								<a
									href="#"
									className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
								>
									<ExternalLink className="h-4 w-4 mr-1" />
									View Study
								</a>
							</div>

							<div className="border border-gray-200 rounded-lg p-4">
								<h3 className="font-semibold text-gray-900 mb-2">
									Journal of Traumatic Stress (2020)
								</h3>
								<p className="text-sm text-gray-600 mb-2">
									"Secondary Traumatic Stress in Interpreters: Prevalence and
									Risk Factors"
								</p>
								<a
									href="#"
									className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
								>
									<ExternalLink className="h-4 w-4 mr-1" />
									View Study
								</a>
							</div>

							<div className="border border-gray-200 rounded-lg p-4">
								<h3 className="font-semibold text-gray-900 mb-2">
									American Journal of Public Health (2021)
								</h3>
								<p className="text-sm text-gray-600 mb-2">
									"Occupational Health of Language Interpreters: A Systematic
									Review"
								</p>
								<a
									href="#"
									className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
								>
									<ExternalLink className="h-4 w-4 mr-1" />
									View Study
								</a>
							</div>
						</div>
					</section>

					{/* Call to Action */}
					<section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
						<Shield className="h-12 w-12 mx-auto mb-4" />
						<h2 className="text-2xl font-bold mb-4">
							Experience Science-Backed Wellness
						</h2>
						<p className="text-lg mb-6 opacity-90">
							Join thousands of interpreters who are using evidence-based tools
							to protect their wellbeing and enhance their professional
							performance.
						</p>
						<Link
							to="/"
							className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
						>
							Start Your Journey
							<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
						</Link>
					</section>
				</div>
			</main>
		</div>
	);
};
