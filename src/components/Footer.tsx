import type React from "react";

export const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-gray-50 border-t border-gray-200 mt-auto">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="font-semibold text-gray-900 mb-4">
							InterpretReflect
						</h3>
						<p className="text-sm text-gray-600">
							The wellness platform for interpreters
						</p>
					</div>

					<div>
						<h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
						<p className="text-sm text-gray-600">
							Email: hello@huviatechnologies.com
						</p>
					</div>

					<div>
						<h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="/about"
									className="text-sm text-black hover:text-green-600"
									style={{ color: "black" }}
								>
									About Us
								</a>
							</li>
							<li>
								<a
									href="/privacy"
									className="text-sm text-black hover:text-green-600"
									style={{ color: "black" }}
								>
									Privacy Policy
								</a>
							</li>
							<li>
								<a
									href="/terms"
									className="text-sm text-black hover:text-green-600"
									style={{ color: "black" }}
								>
									Terms of Service
								</a>
							</li>
							<li>
								<a
									href="/accessibility"
									className="text-sm text-black hover:text-green-600"
									style={{ color: "black" }}
								>
									Accessibility
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t border-gray-200">
					<p className="text-center text-sm text-gray-500">
						© {currentYear} InterpretReflect. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};
