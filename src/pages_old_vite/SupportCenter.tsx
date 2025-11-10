import {
	ArrowLeft,
	BookOpen,
	Clock,
	HelpCircle,
	Mail,
	MessageCircle,
	Phone,
	Users,
} from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

export const SupportCenter: React.FC = () => {
	return (
		<div className="min-h-screen" style={{ backgroundColor: "#FAF9F6" }}>
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link
								to="/"
								className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
							>
								<ArrowLeft className="h-5 w-5 mr-2" />
								Back to Dashboard
							</Link>
						</div>
						<div className="text-center">
							<h1 className="text-3xl font-bold text-gray-900">
								Support Center
							</h1>
							<p className="text-gray-600 mt-1">
								Get help and connect with our community
							</p>
						</div>
						<div className="w-32"></div> {/* Spacer for centering */}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="space-y-8">
					{/* Contact Options */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Get in Touch
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Email Support */}
							<div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
								<div className="flex items-center mb-4">
									<Mail className="h-8 w-8 text-blue-600 mr-3" />
									<h3 className="text-lg font-semibold text-gray-900">
										Email Support
									</h3>
								</div>
								<p className="text-gray-600 mb-4">
									Send us a detailed message about your question or issue.
								</p>
								<a
									href="mailto:support@wellnessplatform.com"
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									<Mail className="h-4 w-4 mr-2" />
									Email Us
								</a>
							</div>

							{/* Chat Support */}
							<div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
								<div className="flex items-center mb-4">
									<MessageCircle className="h-8 w-8 text-green-600 mr-3" />
									<h3 className="text-lg font-semibold text-gray-900">
										Live Chat
									</h3>
								</div>
								<p className="text-gray-600 mb-4">
									Chat with our support team for immediate assistance.
								</p>
								<button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
									<MessageCircle className="h-4 w-4 mr-2" />
									Start Chat
								</button>
							</div>
						</div>
					</section>

					{/* FAQ Section */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Frequently Asked Questions
						</h2>

						<div className="space-y-4">
							<details className="border border-gray-200 rounded-lg">
								<summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center">
									<HelpCircle className="h-5 w-5 text-blue-600 mr-3" />
									<span className="font-medium text-gray-900">
										How do I reset my password?
									</span>
								</summary>
								<div className="px-6 pb-4">
									<p className="text-gray-600 mt-2">
										Click on your profile in the top right corner, then select
										"Profile Settings". From there, you can update your password
										under the "Security" section.
									</p>
								</div>
							</details>

							<details className="border border-gray-200 rounded-lg">
								<summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center">
									<HelpCircle className="h-5 w-5 text-blue-600 mr-3" />
									<span className="font-medium text-gray-900">
										How do I export my wellness data?
									</span>
								</summary>
								<div className="px-6 pb-4">
									<p className="text-gray-600 mt-2">
										Go to the Growth Insights tab and click the download button
										in the top right corner of the burnout trend chart to export
										your data as a CSV file.
									</p>
								</div>
							</details>

							<details className="border border-gray-200 rounded-lg">
								<summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center">
									<HelpCircle className="h-5 w-5 text-blue-600 mr-3" />
									<span className="font-medium text-gray-900">
										What should I do if I'm feeling overwhelmed?
									</span>
								</summary>
								<div className="px-6 pb-4">
									<p className="text-gray-600 mt-2">
										Try one of our quick reset techniques in the Stress Reset
										tab, or use the Elya AI companion for personalized support.
										If you need professional help, please consult a qualified
										mental health professional.
									</p>
								</div>
							</details>
						</div>
					</section>

					{/* Community Resources */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Community Resources
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="border border-gray-200 rounded-lg p-6">
								<div className="flex items-center mb-4">
									<BookOpen className="h-8 w-8 text-purple-600 mr-3" />
									<h3 className="text-lg font-semibold text-gray-900">
										Documentation
									</h3>
								</div>
								<p className="text-gray-600 mb-4">
									Browse our comprehensive guides and tutorials.
								</p>
								<Link
									to="/docs"
									className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
								>
									View Documentation →
								</Link>
							</div>

							<div className="border border-gray-200 rounded-lg p-6">
								<div className="flex items-center mb-4">
									<Users className="h-8 w-8 text-orange-600 mr-3" />
									<h3 className="text-lg font-semibold text-gray-900">
										Community Forum
									</h3>
								</div>
								<p className="text-gray-600 mb-4">
									Connect with other interpreters and share experiences.
								</p>
								<button className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors">
									Join Community →
								</button>
							</div>
						</div>
					</section>

					{/* Contact Information */}
					<section className="bg-white rounded-xl shadow-sm p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Contact Information
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="text-center">
								<Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
								<h3 className="font-semibold text-gray-900 mb-2">Email</h3>
								<p className="text-gray-600">support@wellnessplatform.com</p>
								<p className="text-sm text-gray-500 mt-1">
									Response within 24 hours
								</p>
							</div>

							<div className="text-center">
								<Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
								<h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
								<p className="text-gray-600">1-800-WELLNESS</p>
								<p className="text-sm text-gray-500 mt-1">
									Mon-Fri, 9AM-5PM EST
								</p>
							</div>

							<div className="text-center">
								<Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
								<h3 className="font-semibold text-gray-900 mb-2">
									Response Time
								</h3>
								<p className="text-gray-600">24-48 hours</p>
								<p className="text-sm text-gray-500 mt-1">
									For detailed inquiries
								</p>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};
